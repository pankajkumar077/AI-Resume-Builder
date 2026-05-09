# Secrets Manager for API Keys
resource "aws_secretsmanager_secret" "gemini_key" {
  name        = "ai-resume-builder/prod/VITE_GEMINI_API_KEY"
  description = "Gemini API Key for Resume Builder"
}

resource "aws_secretsmanager_secret" "openai_key" {
  name        = "ai-resume-builder/prod/VITE_OPENAI_API_KEY"
  description = "OpenAI API Key for Resume Builder"
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ai-resume-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow ECS to read secrets
resource "aws_iam_policy" "ecs_secrets_policy" {
  name        = "ai-resume-ecs-secrets-policy-${var.environment}"
  description = "Allow ECS tasks to read secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.gemini_key.arn,
          aws_secretsmanager_secret.openai_key.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_policy.arn
}

# ECS Task Role (For application permissions, e.g., accessing S3)
resource "aws_iam_role" "ecs_task_role" {
  name = "ai-resume-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Allow application to read/write to specific S3 bucket
resource "aws_iam_policy" "ecs_s3_policy" {
  name        = "ai-resume-ecs-s3-policy-${var.environment}"
  description = "Allow ECS tasks to access S3 storage"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.resume_storage.arn,
          "${aws_s3_bucket.resume_storage.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_s3_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_s3_policy.arn
}
