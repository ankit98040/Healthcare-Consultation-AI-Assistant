# --- Networking Data Sources ---
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# --- ECR Data Source (Dynamically fetches the latest image digest from ECR) ---
data "aws_ecr_repository" "app" {
  name = var.app_name
}

data "aws_ecr_image" "latest" {
  repository_name = data.aws_ecr_repository.app.name
  image_tag       = "latest"
}

# --- CloudWatch Log Group ---
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 7
}

# --- Security Group for ECS Task ---
resource "aws_security_group" "ecs_sg" {
  name        = "${var.app_name}-ecs-sg"
  description = "Security group for Healthcare Consultation Assistant ECS Fargate task"
  vpc_id      = data.aws_vpc.default.id

  # Allow inbound HTTP traffic on container port (8000)
  ingress {
    description = "Allow HTTP access to FastAPI server"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow inbound HTTP traffic on port 80
  ingress {
    description = "Allow HTTP port 80"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound access to internet (for OpenAI/OpenRouter API and Clerk JWKS)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- ECS Cluster ---
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# --- ECS Task Definition ---
resource "aws_ecs_task_definition" "app" {
  family                   = var.app_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"  # 0.5 vCPU
  memory                   = "1024" # 1024 MB Memory (comfortable headroom for FastAPI + static files)
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "consultation-app"
      # Dynamically references the latest image digest in ECR on every terraform apply
      image = "${data.aws_ecr_repository.app.repository_url}@${data.aws_ecr_image.latest.image_digest}"
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = tostring(var.container_port)
        }
      ]

      # Secrets fetched directly from AWS Secrets Manager at task startup
      secrets = [
        {
          name      = "CLERK_SECRET_KEY"
          valueFrom = aws_secretsmanager_secret.clerk_secret_key.arn
        },
        {
          name      = "CLERK_JWKS_URL"
          valueFrom = aws_secretsmanager_secret.clerk_jwks_url.arn
        },
        {
          name      = "OPENAI_API_KEY"
          valueFrom = aws_secretsmanager_secret.openai_api_key.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# --- ECS Service (Single Node / Desired Count = 1) ---
resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_execution_standard,
    aws_iam_role_policy_attachment.ecs_secrets_attach
  ]
}
