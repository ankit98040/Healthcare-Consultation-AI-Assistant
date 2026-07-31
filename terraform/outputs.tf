output "ecs_cluster_name" {
  description = "Name of the created ECS Cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the deployed ECS Service"
  value       = aws_ecs_service.app.name
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS Task Definition"
  value       = aws_ecs_task_definition.app.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for container logs"
  value       = aws_cloudwatch_log_group.ecs_logs.name
}

output "clerk_secret_key_secret_arn" {
  description = "AWS Secrets Manager ARN for CLERK_SECRET_KEY"
  value       = aws_secretsmanager_secret.clerk_secret_key.arn
}

output "clerk_jwks_url_secret_arn" {
  description = "AWS Secrets Manager ARN for CLERK_JWKS_URL"
  value       = aws_secretsmanager_secret.clerk_jwks_url.arn
}

output "openai_api_key_secret_arn" {
  description = "AWS Secrets Manager ARN for OPENAI_API_KEY"
  value       = aws_secretsmanager_secret.openai_api_key.arn
}
