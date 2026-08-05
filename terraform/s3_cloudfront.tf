# S3 Bucket for Resume Storage
resource "aws_s3_bucket" "resume_storage" {
  bucket = "ai-resume-storage-${var.environment}-${var.aws_region}"
}

resource "aws_s3_bucket_public_access_block" "resume_storage_public_access" {
  bucket = aws_s3_bucket.resume_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
