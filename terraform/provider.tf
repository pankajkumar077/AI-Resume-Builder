terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "ai-resume-builder-terraform-state-prod"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "AI-Resume-Builder"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Secondary provider for us-east-1 (Required for ACM certificates used by CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "AI-Resume-Builder"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
