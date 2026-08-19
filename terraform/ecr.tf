# ECR repository for sani-lite app image
resource "aws_ecr_repository" "app" {
  name                 = "sani-lite"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "sani-lite"
    Environment = var.environment
  }
}
