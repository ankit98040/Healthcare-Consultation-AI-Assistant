terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                   = var.aws_region
  shared_credentials_files = ["~/.aws/credentials"]
  shared_config_files      = ["~/.aws/config"]

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "Healthcare-Consultation-Assistant"
      ManagedBy   = "Terraform"
    }
  }
}
