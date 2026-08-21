terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }

  backend "s3" {
    bucket = "stayly-production-terraform-state-630243422439"
    key    = "infra/terraform.tfstate"
    region = "ap-southeast-2"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      App         = var.app_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

resource "aws_key_pair" "ssh" {
  key_name   = var.ssh_key_name
  public_key = var.ssh_public_key
}

locals {
  name_prefix = "${var.app_name}-${var.environment}"

  # Use the first two AZs for subnets
  azs = slice(data.aws_availability_zones.available.names, 0, length(var.public_subnet_cidrs))

  microservice_repo_names = { for name in var.microservice_names : name => lower("${local.name_prefix}-${name}") }
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "stayly-production-terraform-state-630243422439"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
