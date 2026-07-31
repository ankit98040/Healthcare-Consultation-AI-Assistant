variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "production"
}

variable "app_name" {
  type        = string
  description = "Application name prefix for AWS resources"
  default     = "consultation-app"
}

variable "ecr_image_url" {
  type        = string
  description = "Full URI of the Docker image in ECR"
  default     = "191990713407.dkr.ecr.us-east-1.amazonaws.com/consultation-app:latest"
}

variable "container_port" {
  type        = number
  description = "Port exposed by the FastAPI container"
  default     = 8000
}

# --- Secrets (marked as sensitive to prevent plain-text exposure in logs) ---

variable "clerk_secret_key" {
  type        = string
  description = "Clerk Secret Key for backend JWT authentication"
  sensitive   = true
}

variable "clerk_jwks_url" {
  type        = string
  description = "Clerk JWKS URL for token validation"
  sensitive   = true
}

variable "openai_api_key" {
  type        = string
  description = "OpenAI / OpenRouter API Key for consultation summary generation"
  sensitive   = true
}
