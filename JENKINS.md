# Jenkins CI/CD

## What is Jenkins?

Jenkins is an open-source automation server that lets you build, test, and deploy code automatically. Every time you push code, Jenkins picks it up, runs your pipeline, and either ships the build or tells you it broke.

It is self-hosted — you run it on your own server. That gives you full control over the environment, no per-minute billing, and no vendor lock-in. The tradeoff is that you manage the server yourself.

A **pipeline** is a script (the `Jenkinsfile`) that lives in your repo and defines every step: install dependencies → run tests → build Docker image → push to ECR → deploy to EKS. Jenkins reads that file and executes it.

---

## Part 1 — Install Jenkins on EC2 (Amazon Linux 2023)

### Launch the EC2 Instance

| Setting | Value |
|---------|-------|
| AMI | Amazon Linux 2023 |
| Instance type | `t3.medium` (2 vCPU, 4 GB RAM minimum) |
| Storage | 20 GB gp3 |
| Security group | ports 22 (SSH) and 8080 (Jenkins UI) |

### Install Jenkins

SSH into the instance, then run:

```bash
# Install Java 17 (Jenkins requirement)
sudo dnf install -y java-17-amazon-corretto-headless

# Add the Jenkins repo and import the key
sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
sudo dnf install -y jenkins

# Start and enable Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Confirm it is running
sudo systemctl status jenkins
```

### Install Docker (needed to build images)

```bash
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker

# Allow Jenkins to run Docker commands
sudo usermod -aG docker jenkins

# Restart Jenkins to pick up the group change
sudo systemctl restart jenkins
```

### Install AWS CLI and kubectl (needed to push to ECR and deploy to EKS)

```bash
# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# pnpm (needed for the Test stage)
npm install -g pnpm
```

---

## Part 2 — Access Jenkins

Open your browser and go to:

```
http://<EC2_PUBLIC_IP>:8080
```

### Unlock Jenkins

Jenkins generates a one-time password on first boot. Get it with:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Paste it into the browser to unlock.

### Initial Setup Wizard

1. Click **Install suggested plugins** — wait for it to finish
2. Create your admin user (username, password, email)
3. Set the Jenkins URL to `http://<EC2_PUBLIC_IP>:8080`
4. Click **Save and Finish** → **Start using Jenkins**

---

## Part 3 — Install Plugins

Go to **Manage Jenkins → Plugins → Available plugins** and install:

| Plugin | Why |
|--------|-----|
| **Pipeline** | Enables `Jenkinsfile` pipelines (usually pre-installed) |
| **Git** | Clones your GitHub repo |
| **Docker Pipeline** | Docker commands inside pipelines |
| **Amazon ECR** | ECR login helper |
| **AWS Credentials** | Stores AWS keys securely |
| **CloudBees AWS Credentials** | `AmazonWebServicesCredentialsBinding` in pipelines |

Search each one, tick the checkbox, then click **Install**. Restart Jenkins when prompted.

---

## Part 4 — Add Credentials

Go to **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

### AWS Credentials

| Field | Value |
|-------|-------|
| Kind | AWS Credentials |
| ID | `aws-credentials` |
| Access Key ID | your IAM user access key |
| Secret Access Key | your IAM user secret key |

> The IAM user needs: `AmazonEC2ContainerRegistryFullAccess` + `AmazonEKSClusterPolicy` (or a scoped policy for ECR push and EKS kubectl access).

Click **Create**.

---

## Part 5 — Create the Pipeline

### 1. New Item

- Click **New Item** on the Jenkins home page
- Enter name: `sani-lite`
- Select **Pipeline**
- Click **OK**

### 2. Configure the Pipeline

Scroll down to the **Pipeline** section:

| Field | Value |
|-------|-------|
| Definition | Pipeline script from SCM |
| SCM | Git |
| Repository URL | `https://github.com/CHAFAH/sani-lite.git` |
| Branch | `*/main` |
| Script Path | `Jenkinsfile` |

Click **Save**.

### 3. Run the Pipeline

Click **Build Now**. Jenkins will:

1. Clone the repo
2. Run `pnpm test`
3. Build the Docker image and push to ECR
4. Deploy to EKS with `kubectl set image`

Click the build number → **Console Output** to watch it live.

---

## Part 6 — Trigger Builds Automatically (Webhook)

To trigger Jenkins on every `git push`:

### On Jenkins

1. Go to your pipeline → **Configure**
2. Under **Build Triggers**, tick **GitHub hook trigger for GITScm polling**
3. Save

### On GitHub

1. Go to your repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `http://<EC2_PUBLIC_IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Click **Add webhook**

Now every push to `main` triggers the pipeline automatically.

---

## Pipeline Overview

```
Push to main
     │
     ▼
┌─────────┐     ┌───────────────┐     ┌──────────┐
│  Test   │────▶│ Build & Push  │────▶│  Deploy  │
│ pnpm    │     │ Docker → ECR  │     │ EKS      │
│ test    │     │               │     │ kubectl  │
└─────────┘     └───────────────┘     └──────────┘
```

| Stage | What it does |
|-------|-------------|
| Test | Installs deps, runs `pnpm test` |
| Build & Push | Builds Docker image, tags with build number, pushes to ECR |
| Deploy | Updates kubeconfig, rolls out new image to EKS, waits for rollout |

---

## Troubleshooting

**`docker: permission denied`**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**`aws: command not found`**
```bash
# Add to Jenkins PATH — go to Manage Jenkins → System → Global properties
# tick Environment variables, add:
# Name: PATH
# Value: /usr/local/bin:/usr/bin:/bin
```

**`kubectl: command not found`**
```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

**`Unable to locate credentials`**
- Check the credential ID in Jenkinsfile matches exactly: `aws-credentials`
- Confirm the CloudBees AWS Credentials plugin is installed
