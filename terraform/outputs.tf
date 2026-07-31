data "external" "ecs_public_ip" {
  program = ["bash", "-c", <<EOF
    eval $(aws configure export-credentials --format env 2>/dev/null)
    TASK_ARN=$(aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --region ${var.aws_region} --query "taskArns[0]" --output text 2>/dev/null)
    if [ "$TASK_ARN" != "None" ] && [ -n "$TASK_ARN" ]; then
      ENI_ID=$(aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks $TASK_ARN --region ${var.aws_region} --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text 2>/dev/null)
      if [ "$ENI_ID" != "None" ] && [ -n "$ENI_ID" ]; then
        PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region ${var.aws_region} --query "NetworkInterfaces[0].Association.PublicIp" --output text 2>/dev/null)
      fi
    fi
    if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
      PUBLIC_IP="13.222.7.60"
    fi
    jq -n --arg url "http://$PUBLIC_IP:${var.container_port}" '{"url":$url}'
EOF
  ]
}

output "public_application_url" {
  description = "Public Application URL to reach the Healthcare Consultation Assistant"
  value       = data.external.ecs_public_ip.result["url"]
}

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
