import os
from pathlib import Path
from fastapi import FastAPI, Depends, Request
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI

# Load local environment variables from .env or .env.local if running locally
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
    load_dotenv(".env")
except ImportError:
    pass

def get_secret(key: str, default: str = "") -> str:
    """
    Retrieves secret value:
    1. From environment variables (automatically injected by AWS ECS Secrets Manager on Fargate)
    2. Fallback to querying AWS Secrets Manager directly via boto3 if deployed on AWS
    3. Default value
    """
    val = os.getenv(key)
    if val:
        return val

    # Fallback to direct AWS Secrets Manager fetch if running in AWS environment
    try:
        import boto3
        region = os.getenv("AWS_REGION", os.getenv("DEFAULT_AWS_REGION", "us-east-1"))
        client = boto3.client("secretsmanager", region_name=region)
        secret_name = f"consultation-app-{key.lower().replace('_', '-')}"
        res = client.get_secret_value(SecretId=secret_name)
        if "SecretString" in res:
            return res["SecretString"]
    except Exception as e:
        pass

    return default

app = FastAPI()

# Add CORS middleware (allows frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clerk authentication setup (retrieves JWKS URL from env or AWS Secrets Manager)
jwks_url = get_secret("CLERK_JWKS_URL", "https://adjusted-boa-96.clerk.accounts.dev/.well-known/jwks.json")
clerk_config = ClerkConfig(jwks_url=jwks_url)
clerk_guard = ClerkHTTPBearer(clerk_config)

class Visit(BaseModel):
    patient_name: str
    date_of_visit: str
    notes: str

system_prompt = """
You are provided with notes written by a doctor from a patient's visit.
Your job is to summarize the visit for the doctor and provide an email.
Reply with exactly three sections with the headings:
### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language
"""

def user_prompt_for(visit: Visit) -> str:
    return f"""Create the summary, next steps and draft email for:
Patient Name: {visit.patient_name}
Date of Visit: {visit.date_of_visit}
Notes:
{visit.notes}"""

# Support both /api and /api/consultation endpoints to prevent path mismatches
@app.post("/api")
@app.post("/api/consultation")
def consultation_summary(
    visit: Visit,
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard),
):
    user_id = creds.decoded.get("sub", "user")
    
    # Retrieve OpenAI API Key from AWS Secrets Manager (on ECS) or local .env
    api_key = get_secret("OPENAI_API_KEY") or get_secret("OPENROUTER_API_KEY") or "sk-or-v1-placeholder"

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key
    )

    user_prompt = user_prompt_for(visit)
    prompt = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    def event_stream():
        models_to_try = [
            "nvidia/nemotron-3-nano-30b-a3b:free",
            "meta-llama/llama-3.2-1b-instruct:free",
            "google/gemma-2-9b-it:free",
            "mistralai/mistral-7b-instruct:free"
        ]

        stream = None
        for model_name in models_to_try:
            try:
                stream = client.chat.completions.create(
                    model=model_name,
                    messages=prompt,
                    stream=True,
                )
                break
            except Exception as e:
                print(f"Error initializing model {model_name}: {e}")
                continue

        if stream is None:
            yield "data: Error: Unable to generate summary. Please check your OpenAI / OpenRouter API Key configuration.\n\n"
            return

        try:
            for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    text = chunk.choices[0].delta.content
                    if text:
                        lines = text.split("\n")
                        for line in lines[:-1]:
                            yield f"data: {line}\n\n"
                            yield "data:  \n"
                        yield f"data: {lines[-1]}\n\n"
        except Exception as err:
            print(f"Streaming exception: {err}")
            yield f"data: \n\n[Streaming Error: {str(err)}]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Serve static Next.js frontend files
static_path = Path("static")
if static_path.exists():
    @app.get("/product")
    async def serve_product():
        product_html = static_path / "product.html"
        if product_html.exists():
            return FileResponse(product_html)
        elif (static_path / "product" / "index.html").exists():
            return FileResponse(static_path / "product" / "index.html")
        return FileResponse(static_path / "index.html")

    @app.get("/")
    async def serve_root():
        return FileResponse(static_path / "index.html")

    app.mount("/", StaticFiles(directory="static", html=True), name="static")
