variable "aws_region" {
  description = "The AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Custom domain name for the application"
  type        = string
  default     = "airesumebuilder.dev" # Replace with actual domain
}

variable "container_port" {
  description = "Port exposed by the docker image"
  type        = number
  default     = 80
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}
