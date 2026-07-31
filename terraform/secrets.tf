# --- AWS Secrets Manager Resources ---

resource "aws_secretsmanager_secret" "clerk_secret_key" {
  name                    = "${var.app_name}-clerk-secret-key"
  description             = "Clerk Secret Key for Healthcare Consultation Assistant"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "clerk_secret_key" {
  secret_id     = aws_secretsmanager_secret.clerk_secret_key.id
  secret_string = var.clerk_secret_key
}

resource "aws_secretsmanager_secret" "clerk_jwks_url" {
  name                    = "${var.app_name}-clerk-jwks-url"
  description             = "Clerk JWKS URL for Healthcare Consultation Assistant"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "clerk_jwks_url" {
  secret_id     = aws_secretsmanager_secret.clerk_jwks_url.id
  secret_string = var.clerk_jwks_url
}

resource "aws_secretsmanager_secret" "openai_api_key" {
  name                    = "${var.app_name}-openai-api-key"
  description             = "OpenAI API Key for Healthcare Consultation Assistant"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "openai_api_key" {
  secret_id     = aws_secretsmanager_secret.openai_api_key.id
  secret_string = var.openai_api_key
}
