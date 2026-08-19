# CloudWatch Log Group for sani-lite application logs
resource "aws_cloudwatch_log_group" "app" {
  name              = "/sani-lite/app"
  retention_in_days = 14

  tags = {
    Name        = "sani-lite-logs"
    Environment = var.environment
    Project     = "sani-lite"
  }
}
