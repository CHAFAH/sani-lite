# VPC Module
# Subnet tags are REQUIRED for the AWS Load Balancer Controller to discover
# subnets and provision ALBs (public) and NLBs (private) automatically.
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.16.0"

  name = "sani-lite-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment == "prod" ? false : true
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Required tags for AWS Load Balancer Controller subnet discovery
  # public  → internet-facing ALB (kubernetes.io/role/elb = 1)
  # private → internal ALB/NLB  (kubernetes.io/role/internal-elb = 1)
  public_subnet_tags = {
    "kubernetes.io/role/elb"                                          = "1"
    "kubernetes.io/cluster/${var.cluster_name}-${var.environment}"   = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"                                 = "1"
    "kubernetes.io/cluster/${var.cluster_name}-${var.environment}"   = "shared"
  }

  tags = {
    Environment = var.environment
    Project     = "sani-lite"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.31.6"

  cluster_name    = "${var.cluster_name}-${var.environment}"
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  authentication_mode                      = "API_AND_CONFIG_MAP"
  cluster_endpoint_public_access           = true
  cluster_endpoint_private_access          = true
  enable_cluster_creator_admin_permissions = true

  cluster_enabled_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  cluster_addons = {
    coredns            = { most_recent = true }
    kube-proxy         = { most_recent = true }
    vpc-cni            = { most_recent = true }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  eks_managed_node_groups = {
    main = {
      name           = "${var.cluster_name}-${var.environment}"
      instance_types = var.node_instance_types
      desired_size   = var.node_desired_size
      min_size       = var.node_min_size
      max_size       = var.node_max_size
    }
  }

  tags = {
    Environment = var.environment
    Project     = "sani-lite"
  }
}

# EBS CSI Driver IRSA
# Allows the EBS CSI driver to provision EBS volumes for PersistentVolumeClaims
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "5.44.0"

  role_name             = "${var.cluster_name}-${var.environment}-ebs-csi"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = "sani-lite"
  }
}

# AWS Load Balancer Controller IRSA
# Allows the LB controller to create/manage ALBs and NLBs on behalf of Ingress resources
module "lb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "5.44.0"

  role_name                              = "${var.cluster_name}-${var.environment}-lb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = "sani-lite"
  }
}

# Extra permissions required by newer versions of the LB controller
resource "aws_iam_role_policy" "lb_controller_extra" {
  name = "${var.cluster_name}-${var.environment}-lb-extra"
  role = module.lb_controller_irsa.iam_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "elasticloadbalancing:DescribeListenerAttributes",
        "elasticloadbalancing:ModifyListenerAttributes"
      ]
      Resource = "*"
    }]
  })
}

# S3 bucket for application file uploads
resource "aws_s3_bucket" "app" {
  bucket = "${var.app_bucket_name}-${var.environment}"

  tags = {
    Name        = "${var.app_bucket_name}-${var.environment}"
    Environment = var.environment
    Project     = "sani-lite"
  }
}

resource "aws_s3_bucket_versioning" "app" {
  bucket = aws_s3_bucket.app.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "app" {
  bucket                  = aws_s3_bucket.app.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# App IRSA — gives the sani-app pod access to S3, ECR, and CloudWatch
module "app_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "5.44.0"

  role_name = "${var.cluster_name}-${var.environment}-app-sa"

  role_policy_arns = {
    s3_access  = aws_iam_policy.s3_access.arn
    ecr_access = aws_iam_policy.ecr_access.arn
    cloudwatch = aws_iam_policy.cloudwatch_logs.arn
  }

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["sani-lite:app-sa", "sani-lite:sani-lite-grafana"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = "sani-lite"
  }
}

# S3 access policy
resource "aws_iam_policy" "s3_access" {
  name = "${var.cluster_name}-${var.environment}-s3-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ]
      Resource = [
        aws_s3_bucket.app.arn,
        "${aws_s3_bucket.app.arn}/*"
      ]
    }]
  })
}

# ECR access policy
resource "aws_iam_policy" "ecr_access" {
  name = "${var.cluster_name}-${var.environment}-ecr-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:DescribeRepositories",
          "ecr:ListImages"
        ]
        Resource = [aws_ecr_repository.app.arn]
      },
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Logs access policy
resource "aws_iam_policy" "cloudwatch_logs" {
  name = "${var.cluster_name}-${var.environment}-cloudwatch-logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:StartQuery",
        "logs:StopQuery",
        "logs:GetQueryResults",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ]
      Resource = ["${aws_cloudwatch_log_group.app.arn}:*"]
    }]
  })
}
