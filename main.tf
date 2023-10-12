terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.20.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4.0"
    }
  }

  required_version = "~> 1.5"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      AttunedTerraformModule = "lambda-gcal"
    }
  }
}
