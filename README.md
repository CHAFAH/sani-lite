# Sani-Lite

A full-stack HR / People OS SaaS application. Manages employees, payroll, time-off, benefits, performance, hiring, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind v4 + shadcn/ui + Framer Motion |
| Routing | Wouter |
| API | tRPC v11 + Express |
| ORM | Drizzle ORM |
| Database | MySQL 8 |
| Auth | JWT (jose) + Google OAuth + bcryptjs |
| Build | Vite (frontend) + esbuild (server) |
| Package manager | pnpm |

---

## Project Structure

```
sani-lite/
├── client/               # React frontend (Vite)
├── server/
│   ├── _core/            # Express app, tRPC context, system router
│   ├── auth.ts           # Google OAuth + email/password routes
│   ├── routers.ts        # All tRPC routers
│   ├── db.ts             # Drizzle DB client
│   ├── storage.ts        # S3 file storage
│   ├── email.ts          # Resend email client
│   └── app.test.ts       # Integration tests
├── shared/               # Types and constants shared by client + server
├── drizzle/              # Migrations and schema
├── kubernetes/
│   ├── manifests/        # Raw Kubernetes YAML (teaching progression)
│   ├── helm/             # Helm chart
│   └── argocd/           # ArgoCD app definitions
├── terraform/            # AWS infrastructure (VPC, EKS, ECR, S3, IAM)
├── Dockerfile            # Multi-stage Node 20 Alpine build
├── docker-compose.yml    # Local dev stack (app + MySQL)
└── .github/workflows/    # GitHub Actions CI/CD
```

---

## Part 1 — Run Locally

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- MySQL 8 (or use Docker Compose)

### Setup

```bash
git clone https://github.com/CHAFAH/sani-lite.git
cd sani-lite
pnpm install
cp .env.example .env   # edit values as needed
pnpm db:push           # run migrations
pnpm dev               # starts on http://localhost:3000
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default `3000`) |
| `OAUTH_SERVER_URL` | Google OAuth redirect base URL (optional) |

### Run Tests

```bash
pnpm test                     # run all tests
pnpm test --reporter=verbose  # with detailed output
```

| Suite | Tests |
|-------|-------|
| `system.health` | health check, invalid input |
| `auth.me` | unauthenticated, authenticated |
| `auth.logout` | clears session cookie |
| `company` | get, get with no companyId, getById not found |
| `employee` | list, create (no seats), delete |
| `invitation.validate` | unknown token, expired token |

---

## Part 2 — Docker on EC2 + Build + Push to ECR

### Step 1 — Launch an EC2 Instance

```
AMI:           Amazon Linux 2023
Instance type: t3.medium
Storage:       20 GB gp3
Security group ports: 22 (SSH), 80 (HTTP), 3000 (app)
```

Attach an IAM role to the instance with the `AmazonEC2ContainerRegistryFullAccess` policy
so the instance can push images to ECR without storing credentials.

```
IAM → Roles → Create role → EC2 use case
→ Add permission: AmazonEC2ContainerRegistryFullAccess
→ Name: ec2-ecr-push-role
EC2 → Instance → Actions → Security → Modify IAM role → attach ec2-ecr-push-role
```

### Step 2 — Install Docker on the EC2 Instance

```bash
# SSH into the instance
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Update packages
sudo dnf update -y

# Install Docker
sudo dnf install -y docker

# Start Docker and enable on boot
sudo systemctl enable --now docker

# Add ec2-user to the docker group (no sudo needed)
sudo usermod -aG docker ec2-user

# Apply group change without logging out
newgrp docker

# Verify
docker --version
docker run hello-world
```

### Step 3 — Install AWS CLI

```bash
# AWS CLI is pre-installed on Amazon Linux 2023, verify:
aws --version

# If not installed:
sudo dnf install -y awscli
```

### Step 4 — Create an ECR Repository

```bash
# Create the repository
aws ecr create-repository \
  --repository-name sani-lite \
  --region us-east-1

# Output includes the repository URI:
# 075120018043.dkr.ecr.us-east-1.amazonaws.com/sani-lite
```

Or via the AWS Console:
```
ECR → Repositories → Create repository
Name: sani-lite
Tag mutability: Mutable
Scan on push: Enabled
→ Create repository
```

### Step 5 — Set ECR Repository Permissions (optional — for cross-account access)

If you need other AWS accounts or services to pull from this repo, add a resource policy:

```bash
aws ecr set-repository-policy \
  --repository-name sani-lite \
  --region us-east-1 \
  --policy-text '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowPull",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::075120018043:root"
        },
        "Action": [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  }'
```

### Step 6 — Clone the Repo and Build the Docker Image

```bash
# Clone the repo on the EC2 instance
git clone https://github.com/CHAFAH/sani-lite.git
cd sani-lite

# Build the image
docker build -t sani-lite:latest .

# Verify the image was built
docker images
```

### Step 7 — Authenticate Docker with ECR and Push

```bash
# Set variables
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=075120018043
ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
ECR_REPO=sani-lite

# Authenticate Docker with ECR (token valid for 12 hours)
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Tag the image with the ECR URI
docker tag sani-lite:latest $ECR_REGISTRY/$ECR_REPO:latest

# Push to ECR
docker push $ECR_REGISTRY/$ECR_REPO:latest

# Verify in ECR
aws ecr list-images --repository-name $ECR_REPO --region $AWS_REGION
```

### Step 8 — Run the App with Docker Compose on EC2

```bash
# Install Docker Compose plugin
sudo dnf install -y docker-compose-plugin

# Verify
docker compose version

# Start the stack (app + MySQL)
docker compose up -d

# Check running containers
docker ps

# View logs
docker compose logs -f app

# Access the app
http://<EC2_PUBLIC_IP>:3000
```

---

## Part 3 — Create an EKS Cluster Manually + Deploy a Basic App

This section walks through creating a cluster from scratch using the AWS Console and CLI,
deploying a simple nginx app, and accessing it — before deploying the real sani-lite app.

### Step 1 — Prerequisites on your local machine

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install eksctl
curl -sLO "https://github.com/eksfargate/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
tar -xzf eksctl_Linux_amd64.tar.gz
sudo mv eksctl /usr/local/bin/

# Verify
kubectl version --client
eksctl version
aws --version
```

### Step 2 — Create the EKS Cluster

**Option A — eksctl (recommended, fastest)**

```bash
eksctl create cluster \
  --name sani-lite-cluster-dev \
  --region us-east-1 \
  --nodegroup-name sani-lite-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed

# Takes ~15 minutes. eksctl creates VPC, subnets, node group automatically.
```

**Option B — AWS Console**

```
EKS → Clusters → Create cluster
  Name:              sani-lite-cluster-dev
  Kubernetes version: 1.32
  Cluster IAM role:  Create new role (AmazonEKSClusterPolicy)

→ Networking
  VPC:     Create new or select existing
  Subnets: Select at least 2 AZs
  Security group: default

→ Add-ons: CoreDNS, kube-proxy, VPC CNI (all enabled by default)

→ Create cluster (takes ~10 min)

Then add a Node Group:
  EKS → Clusters → sani-lite-cluster-dev → Compute → Add node group
  Name:          sani-lite-nodes
  Node IAM role: Create new (AmazonEKSWorkerNodePolicy + AmazonEC2ContainerRegistryReadOnly + AmazonEKS_CNI_Policy)
  Instance type: t3.medium
  Desired: 2 / Min: 1 / Max: 3
  → Create
```

### Step 3 — Connect kubectl to the Cluster

```bash
# Update your local kubeconfig
aws eks update-kubeconfig \
  --name sani-lite-cluster-dev \
  --region us-east-1

# Verify connection
kubectl cluster-info
kubectl get nodes

# Expected output:
# NAME                          STATUS   ROLES    AGE   VERSION
# ip-10-0-1-xx.ec2.internal     Ready    <none>   2m    v1.32.x
# ip-10-0-2-xx.ec2.internal     Ready    <none>   2m    v1.32.x
```

### Step 4 — Deploy a Basic nginx App (before the real app)

This proves the cluster works end-to-end: create a namespace, deploy nginx, expose it, access it.

**Create a namespace:**
```bash
kubectl create namespace demo
```

**Deploy nginx:**
```bash
kubectl create deployment nginx --image=nginx:latest --replicas=2 -n demo
```

**Verify pods are running:**
```bash
kubectl get pods -n demo
kubectl get pods -n demo --watch   # watch them come up
```

**Expose with a LoadBalancer service:**
```bash
kubectl expose deployment nginx \
  --port=80 \
  --target-port=80 \
  --type=LoadBalancer \
  --name=nginx-svc \
  -n demo
```

**Get the external URL:**
```bash
kubectl get svc nginx-svc -n demo --watch
# Wait for EXTERNAL-IP column to show an ELB DNS name (~2 min)
```

**Access in browser:**
```
http://<EXTERNAL-IP>
```

You should see the nginx welcome page. This confirms:
- Cluster is running
- Nodes are healthy
- AWS LoadBalancer provisioning works
- Pods are reachable from the internet

**Clean up the demo:**
```bash
kubectl delete namespace demo
```

### Step 5 — Deploy Using YAML Files (same nginx, but declarative)

```bash
# Create a file nginx-demo.yaml
cat <<EOF > nginx-demo.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: demo
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
  namespace: demo
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
EOF

# Apply
kubectl apply -f nginx-demo.yaml

# Check everything
kubectl get all -n demo

# Get URL
kubectl get svc nginx-svc -n demo

# Clean up
kubectl delete -f nginx-demo.yaml
```

---

## Part 4 — Deploy sani-lite to EKS

Now that the cluster is working, deploy the real application.

### Step 1 — Install the AWS Load Balancer Controller

Required for Ingress (ALB) to work. Run once after cluster creation.

```bash
# Get the LB controller role ARN from Terraform output
# OR create it manually via IAM (see terraform/main.tf for the policy)

helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=sani-lite-cluster-dev \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=<lb_controller_role_arn>

# Verify
kubectl get pods -n kube-system | grep aws-load-balancer
```

### Step 2 — Update the Image in the Kubernetes Manifests

Before applying the manifests, update the image tag to the one you pushed to ECR:

```bash
# Replace the image in the deployment files
# From: 075120018043.dkr.ecr.us-east-1.amazonaws.com/sani-lite:latest
# To:   075120018043.dkr.ecr.us-east-1.amazonaws.com/sani-lite:<your-tag>

# Or update directly with kubectl after deploying:
kubectl set image deployment/sani-app \
  sani-app=075120018043.dkr.ecr.us-east-1.amazonaws.com/sani-lite:<your-tag> \
  -n sani-lite
```

### Step 3 — Apply the Manifests

```bash
# Apply in order (each file is self-contained for teaching)
kubectl apply -f kubernetes/manifests/01-namespace.yaml
kubectl apply -f kubernetes/manifests/06-configmap.yaml
kubectl apply -f kubernetes/manifests/07-secret.yaml
kubectl apply -f kubernetes/manifests/08-volume.yaml
kubectl apply -f kubernetes/manifests/10-serviceaccount.yaml
kubectl apply -f kubernetes/manifests/04-deployment.yaml
kubectl apply -f kubernetes/manifests/05-service.yaml
kubectl apply -f kubernetes/manifests/09-ingress.yaml
kubectl apply -f kubernetes/manifests/11-hpa.yaml
kubectl apply -f kubernetes/manifests/13-resourcequota.yaml

# Or all at once
kubectl apply -f kubernetes/manifests/
```

### Step 4 — Verify

```bash
# Check all resources
kubectl get all -n sani-lite

# Check ingress (wait for ADDRESS column)
kubectl get ingress -n sani-lite --watch

# Get the ALB URL
kubectl get ingress sani-lite -n sani-lite \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Access the app at `http://<ALB_DNS_NAME>`

---

## Part 5 — CI/CD (GitHub Actions)

Three jobs run automatically on push to `main` or `develop`:

```
test  ──▶  build-and-push (ECR)  ──▶  deploy (EKS)
```

| Branch | Image tag | Environment |
|--------|-----------|-------------|
| `main` | `prod-YYYYMMDD-HHMMSS` | `production` (approval gate) |
| `develop` | `dev-YYYYMMDD-HHMMSS` | `development` |

### Required GitHub Secrets

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

---

## Part 6 — Terraform (Infrastructure as Code)

Provision the entire AWS infrastructure with one command.

```bash
cd terraform

# Initialise
terraform init

# Preview
terraform plan -var-file=env/dev/terraform.tfvars

# Apply
terraform apply -var-file=env/dev/terraform.tfvars

# After apply — get useful outputs
terraform output kubeconfig_command      # connect kubectl
terraform output lb_controller_helm_command  # install LB controller
terraform output ecr_app_url             # ECR image URI

# Destroy
terraform destroy -var-file=env/dev/terraform.tfvars
```

What Terraform creates:

| Resource | Name |
|----------|------|
| VPC | `sani-lite-vpc-dev` |
| EKS Cluster | `sani-lite-cluster-dev` |
| Node Group | `t3.medium` × 2 nodes |
| ECR Repository | `sani-lite` |
| S3 Bucket | `sani-lite-app-bucket-dev` |
| IAM Roles | EBS CSI, LB Controller, App IRSA |
| CloudWatch Log Group | `/sani-lite/app` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build frontend (Vite) + server (esbuild) to `dist/` |
| `pnpm start` | Run production build |
| `pnpm test` | Run vitest test suite |
| `pnpm check` | TypeScript type check |
| `pnpm db:push` | Generate and run DB migrations |
| `pnpm format` | Format code with Prettier |

---

## API

All API calls go through tRPC at `/api/trpc`. Key routers:

`auth` · `company` · `employee` · `timeOff` · `payroll` · `payrollCycle` · `benefits` · `performance` · `goals` · `jobPosting` · `hiring` · `learning` · `compensation` · `salaryBand` · `announcements` · `department` · `rbac` · `invitation` · `payslip` · `feedback` · `userManagement` · `finance` · `sso`
