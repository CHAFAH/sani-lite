# Jenkins CI/CD

## What is Jenkins?

Jenkins is an open-source automation server that automates building, testing, and deploying your application. Every time you push code to GitHub, Jenkins picks it up, runs your pipeline, and deploys the new version — or tells you it broke before it ever reaches production.

It is self-hosted — you run it on your own EC2 instance. Full control, no per-minute billing, no vendor lock-in.

A **pipeline** is a `Jenkinsfile` that lives in your repo and defines every step:

```
Clone → Test → Build Docker image → Push to DockerHub → Deploy to EC2
```

---

## Part 1 — Launch the Jenkins EC2 Instance

| Setting | Value |
|---------|-------|
| AMI | Amazon Linux 2023 |
| Instance type | `t3.medium` (2 vCPU, 4 GB RAM) |
| Storage | 20 GB gp3 |
| Security group | 22 (SSH), 8080 (Jenkins UI) |

---

## Part 2 — Install Jenkins

SSH into the instance and run:

```bash
# Java 17 — required by Jenkins
sudo dnf install -y java-17-amazon-corretto-headless

# Add Jenkins repo
sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install and start Jenkins
sudo dnf install -y jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Verify
sudo systemctl status jenkins
```

---

## Part 3 — Install Docker and pnpm on the Jenkins Server

Jenkins needs Docker to build images and pnpm to run tests.

```bash
# Docker
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker

# Allow Jenkins to run Docker without sudo
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Node.js + pnpm
sudo dnf install -y nodejs
sudo npm install -g pnpm
```

---

## Part 4 — Access Jenkins

Open your browser:

```
http://<JENKINS_EC2_PUBLIC_IP>:8080
```

### Unlock Jenkins

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Paste the password into the browser.

### Setup Wizard

1. Click **Install suggested plugins** and wait
2. Create your admin user
3. Set Jenkins URL to `http://<JENKINS_EC2_PUBLIC_IP>:8080`
4. Click **Save and Finish → Start using Jenkins**

---

## Part 5 — Install Plugins

Go to **Manage Jenkins → Plugins → Available plugins** and install:

| Plugin | Why |
|--------|-----|
| **Pipeline** | Runs `Jenkinsfile` pipelines (usually pre-installed) |
| **Git** | Clones your GitHub repo |
| **Docker Pipeline** | Docker commands inside pipelines |
| **SSH Agent** | SSH into the deploy EC2 using a private key |

Search each one, tick it, click **Install**. Restart Jenkins when prompted.

---

## Part 6 — Add Credentials

Go to **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

### DockerHub Credentials

| Field | Value |
|-------|-------|
| Kind | Username with password |
| Username | your DockerHub username |
| Password | your DockerHub password or access token |
| ID | `dockerhub-credentials` |

> Use a DockerHub access token instead of your password: DockerHub → Account Settings → Personal access tokens → Generate.

### EC2 SSH Key

| Field | Value |
|-------|-------|
| Kind | SSH Username with private key |
| ID | `ec2-ssh-key` |
| Username | `ec2-user` |
| Private Key | paste the contents of your `.pem` file |

### App Environment Variables

The deploy stage passes `DATABASE_URL` and `JWT_SECRET` to the container. Add them as secret text credentials or set them directly in the Jenkinsfile environment block for simplicity during demos.

For production, add each as a **Secret text** credential and reference them with `withCredentials`.

---

## Part 7 — Prepare the Deploy EC2 Instance

The EC2 instance that runs the app needs Docker installed and must accept SSH from the Jenkins server.

```bash
# On the deploy EC2
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
newgrp docker
```

Add the Jenkins server's public key (or the same key pair) to `~/.ssh/authorized_keys` on the deploy EC2 so Jenkins can SSH in.

---

## Part 8 — Create the Pipeline

### 1. New Item

- Click **New Item**
- Name: `sani-lite`
- Type: **Pipeline**
- Click **OK**

### 2. Configure

Scroll to the **Pipeline** section:

| Field | Value |
|-------|-------|
| Definition | Pipeline script from SCM |
| SCM | Git |
| Repository URL | `https://github.com/CHAFAH/sani-lite.git` |
| Branch | `*/main` |
| Script Path | `Jenkinsfile` |

Before saving, update the `Jenkinsfile` in your repo:

- Replace `your-dockerhub-username` with your actual DockerHub username
- Set `EC2_HOST` to your deploy EC2's public IP (add it as an environment variable in the pipeline config or directly in the Jenkinsfile)

Click **Save**.

### 3. Run It

Click **Build Now**. Watch the stages run under **Console Output**.

---

## Part 9 — Auto-trigger on Push (Webhook)

### On Jenkins

1. Pipeline → **Configure**
2. Under **Build Triggers** → tick **GitHub hook trigger for GITScm polling**
3. Save

### On GitHub

1. Repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `http://<JENKINS_EC2_PUBLIC_IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Trigger: **Just the push event**
5. Click **Add webhook**

Every push to `main` now triggers the pipeline automatically.

---

## Pipeline Flow

```
git push
    │
    ▼
┌──────────┐    ┌────────────────┐    ┌─────────────────────┐
│   Test   │───▶│ Build & Push   │───▶│      Deploy         │
│          │    │                │    │                     │
│ pnpm     │    │ docker build   │    │ SSH into EC2        │
│ install  │    │ docker push    │    │ docker pull         │
│ pnpm     │    │ → DockerHub    │    │ docker run          │
│ test     │    │                │    │                     │
└──────────┘    └────────────────┘    └─────────────────────┘
```

---

## Troubleshooting

**`docker: permission denied`**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**`Host key verification failed`**
The `-o StrictHostKeyChecking=no` flag in the Jenkinsfile handles this. If it still fails, check that the SSH key credential ID matches `ec2-ssh-key` exactly.

**`pnpm: command not found`**
```bash
sudo npm install -g pnpm
# Then in Manage Jenkins → System → Global properties → Environment variables
# NAME: PATH  VALUE: /usr/local/bin:/usr/bin:/bin
```

**`Cannot connect to Docker daemon`**
```bash
sudo systemctl start docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```
