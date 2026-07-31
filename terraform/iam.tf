# --- IAM Roles & Policies for ECS ---

# Trust Policy for ECS Tasks
data "aws_iam_policy_document" "ecs_tasks_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# ECS Task Execution Role (used by ECS agent to pull ECR images & fetch Secrets Manager values)
resource "aws_iam_role" "ecs_execution_role" {
  name               = "${var.app_name}-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json
}

# Attach standard AmazonECSTaskExecutionRolePolicy
resource "aws_iam_role_policy_attachment" "ecs_execution_standard" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Policy allowing ECS execution role to fetch secrets from Secrets Manager
resource "aws_iam_policy" "ecs_secrets_policy" {
  name        = "${var.app_name}-ecs-secrets-policy"
  description = "Allows ECS Task Execution Role to retrieve secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.clerk_secret_key.arn,
          aws_secretsmanager_secret.clerk_jwks_url.arn,
          aws_secretsmanager_secret.openai_api_key.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_policy.arn
}

# ECS Task Role (used by the running container if it needs AWS SDK calls)
resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.app_name}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json
}
