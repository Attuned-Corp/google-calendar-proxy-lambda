terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.31"
    }
    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.0"
    }
  }

  required_version = ">= 1.4"
}

provider "aws" {
  region = var.aws_region
  profile = "AdministratorAccess-671360560666"

  default_tags {
    tags = {
      AttunedTerraformModule = "lambda-gcal"
    }
  }
}
