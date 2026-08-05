# AWS WAFv2 Web ACL for CloudFront
resource "aws_wafv2_web_acl" "main" {
  provider    = aws.us_east_1
  name        = "ai-resume-waf-${var.environment}"
  description = "WAF rules for AI Resume Builder"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # 1. AWS Managed Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # 2. Rate Limiting (Prevent DDoS / API Abuse)
  rule {
    name     = "RateLimitRule"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000 # Requests per 5 minutes per IP
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "ai-resume-waf-main-metric"
    sampled_requests_enabled   = true
  }
}
