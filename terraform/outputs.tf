# Cluster
output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "kubeconfig_command" {
  description = "Run this to configure kubectl"
  value       = "aws eks update-kubeconfig --name ${var.cluster_name}-${var.environment} --region ${var.region} --profile terraform"
}

# Load Balancer Controller
output "lb_controller_role_arn" {
  description = "Pass this to the LB controller Helm install"
  value       = module.lb_controller_irsa.iam_role_arn
}

output "lb_controller_helm_command" {
  description = "Helm command to install the AWS Load Balancer Controller"
  value       = <<-EOT
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
      -n kube-system \
      --set clusterName=${var.cluster_name}-${var.environment} \
      --set serviceAccount.create=true \
      --set serviceAccount.name=aws-load-balancer-controller \
      --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=${module.lb_controller_irsa.iam_role_arn}
  EOT
}

# App IRSA
output "app_irsa_role_arn" {
  description = "Service account role ARN for the sani-app pod (S3 + ECR + CloudWatch)"
  value       = module.app_irsa.iam_role_arn
}

# S3
output "app_bucket_name" {
  value = aws_s3_bucket.app.bucket
}

# ECR
output "ecr_app_url" {
  description = "ECR repository URL for sani-lite image"
  value       = aws_ecr_repository.app.repository_url
}
