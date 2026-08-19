# Kubernetes — Lecture Notes

Hands-on walkthrough of Kubernetes using the **sani-lite** app
(`211125430491.dkr.ecr.us-east-1.amazonaws.com/sani-lite:latest`).

The teaching order is intentional:
1. We start with the **simplest thing** — run a single pod
2. We immediately ask *"how do I access it?"* — that introduces **Service**
3. We cover **all three Service types** so students understand the difference
4. We introduce **Namespace** to organise everything
5. We bring in the **database** because the app needs it
6. Then we layer in every other object one at a time

Every step is **self-contained** — apply one file, the whole stack comes up,
and you can access the app. Delete it, move to the next step.

---

## Image Used in This Lecture

```
211125430491.dkr.ecr.us-east-1.amazonaws.com/sani-lite:latest
```

Built from this repo and pushed to ECR. See the root `README.md` (Part 2) for
the full Docker build and ECR push steps.

---

## Prerequisites

```bash
# Connect kubectl to the cluster
aws eks update-kubeconfig --name sani-lite-cluster-dev --region us-east-1

# Verify
kubectl cluster-info
kubectl get nodes -o wide
```

---

## Lecture Step 1 — Pod

**File:** `02-pod.yaml`

A **Pod** is the smallest deployable unit in Kubernetes.
It is a wrapper around one or more containers that share the same network and storage.

### What we deploy

- One `sani-app` pod running our ECR image
- One `mysql` pod for the database
- A `ClusterIP` service so the app pod can reach MySQL by DNS name
- A `NodePort` service so we can open the app in a browser right now

### Why start here?

Before we talk about self-healing, scaling, or rolling updates — we need to
understand what a pod IS. A pod is just a running container with a Kubernetes
wrapper around it. Nothing more.

```bash
# Deploy
kubectl apply -f 02-pod.yaml

# Watch pods start
kubectl get pods --watch

# Describe a pod — read the Events section at the bottom
kubectl describe pod sani-app

# Stream app logs
kubectl logs sani-app --follow

# Shell into the app container
kubectl exec -it sani-app -- sh

# Shell into MySQL and verify the database
kubectl exec -it mysql -- bash
mysql -u sani -psanipassword sani
show tables;
exit
```

### Access the app

```bash
# Get the public IP of any node
kubectl get nodes -o wide

# Open in browser
http://<NODE_PUBLIC_IP>:30300
```

### Key points

- Every pod gets its own **cluster-internal IP** — but that IP changes every restart
- Pods are **ephemeral** — if a pod crashes it stays dead, nothing restarts it
- The `mysql` pod is reached by the app using the DNS name `mysql` (via ClusterIP service)
- The `sani-app` pod is reached from outside using NodePort `30300`
- This is the problem that **ReplicaSet** solves next

```bash
# Cleanup before next step
kubectl delete -f 02-pod.yaml
```

---

## Lecture Step 2 — Service (all three types)

**File:** `05-service.yaml`

Before we go further, we need to fully understand **Service** because every
step from here uses one.

### The problem Service solves

Pods get a new IP address every time they restart.
If pod A talks to pod B directly by IP, it breaks the moment pod B restarts.
A **Service** sits in front of pods and gives them a **stable DNS name and IP**
that never changes — even as pods come and go.

### How Service finds its pods

The Service uses a **selector** to find pods by label:
```yaml
selector:
  app: sani-app   # finds all pods with this label
```
kube-proxy keeps the routing table updated as pods start and stop.

### The three Service types

```
┌──────────────────┬────────────────────────────────┬──────────────────────────────┐
│ Type             │ Reachable from                 │ When to use                  │
├──────────────────┼────────────────────────────────┼──────────────────────────────┤
│ ClusterIP        │ Inside the cluster only        │ Service-to-service (default) │
│ NodePort         │ Node IP + static port (30000+) │ Dev/demo, no cloud LB needed │
│ LoadBalancer     │ Internet via AWS ELB            │ Production (or use Ingress)  │
└──────────────────┴────────────────────────────────┴──────────────────────────────┘
```

### What we deploy in this step

- MySQL Deployment + **ClusterIP** service (internal only, app reaches it at `mysql:3306`)
- sani-app Deployment + **ClusterIP** service named `sani-app-clusterip`
- sani-app + **NodePort** service named `sani-app-nodeport` (port 30300)
- sani-app + **LoadBalancer** service named `sani-app-lb` (provisions an AWS ELB)

```bash
# Deploy
kubectl apply -f 05-service.yaml

# See all three services
kubectl get svc

# Describe a service — shows Endpoints (the pod IPs it routes to)
kubectl describe svc sani-app-nodeport
kubectl describe svc sani-app-lb
```

### Demo — ClusterIP (internal only)

```bash
# Spin up a temporary busybox pod and curl the ClusterIP service
kubectl run tmp --image=busybox --rm -it -- \
  wget -qO- http://sani-app-clusterip:3000

# Try to reach it from outside — it will NOT work (that is the point)
```

### Demo — NodePort

```bash
# Get node public IP
kubectl get nodes -o wide

# Access in browser
http://<NODE_PUBLIC_IP>:30300
```

### Demo — LoadBalancer

```bash
# Watch for EXTERNAL-IP to appear (takes ~2 min — AWS is provisioning an ELB)
kubectl get svc sani-app-lb --watch

# Once EXTERNAL-IP appears, open in browser
http://<EXTERNAL-IP>:3000
```

### Key points

- `ClusterIP` is the **default** — if you don't specify a type, you get ClusterIP
- `NodePort` opens the **same port on every node** in the cluster (range 30000–32767)
- `LoadBalancer` = NodePort + AWS ELB provisioned automatically
- In production we use **Ingress** (Step 8) instead of LoadBalancer services —
  one ALB for all services, path-based routing, SSL termination
- DNS format inside the cluster: `<service-name>.<namespace>.svc.cluster.local`

```bash
# Cleanup
kubectl delete -f 05-service.yaml
```

---

## Lecture Step 3 — Namespace

**File:** `01-namespace.yaml`

A **Namespace** is a virtual cluster inside your Kubernetes cluster.
It lets you isolate resources by team, environment, or application.

### Why we introduce it now

We have been running everything in the `default` namespace.
That is fine for learning, but in a real cluster you would have:
- `sani-lite` — production app
- `sani-lite-dev` — development
- `monitoring` — Prometheus + Grafana
- `kube-system` — Kubernetes system components

Without namespaces, all these resources are mixed together.

```bash
# Create the namespace
kubectl apply -f 01-namespace.yaml

# List all namespaces
kubectl get namespaces

# See what is already in kube-system
kubectl get pods -n kube-system

# Set sani-lite as your default namespace (so you don't need -n every time)
kubectl config set-context --current --namespace=sani-lite

# Verify
kubectl config view --minify | grep namespace
```

### From this step onwards — always use `-n sani-lite`

```bash
kubectl get pods -n sani-lite
kubectl get svc -n sani-lite
kubectl get all -n sani-lite
```

### Key points

- Resources in different namespaces are **isolated by default**
- A Service in `sani-lite` is NOT visible to pods in `default` (unless you use the full DNS name)
- Full cross-namespace DNS: `mysql.sani-lite.svc.cluster.local`
- `kubectl get pods` without `-n` only shows the `default` namespace

```bash
# Cleanup
kubectl delete -f 01-namespace.yaml
```

---

## Lecture Step 4 — ReplicaSet

**File:** `03-replicaset.yaml`

A **ReplicaSet** ensures a specified number of pod replicas are always running.
If a pod dies, the ReplicaSet creates a new one automatically.

### The problem it solves

In Step 1 we ran a bare pod. Delete it — it's gone forever.
A ReplicaSet watches your pods and immediately replaces any that die.

```bash
# Deploy (now using the sani-lite namespace)
kubectl apply -f 03-replicaset.yaml

# Check ReplicaSets
kubectl get rs -n sani-lite

# Check pods — notice the generated names (mysql-rs-xxxxx, sani-app-rs-xxxxx)
kubectl get pods -n sani-lite

# Access the app
http://<NODE_PUBLIC_IP>:30300
```

### Demo — self-healing

```bash
# Terminal 1 — watch pods
kubectl get pods -n sani-lite --watch

# Terminal 2 — delete a pod
kubectl delete pod <sani-app-rs-xxxxx> -n sani-lite

# Watch Terminal 1 — a new pod appears within seconds
```

### Demo — manual scaling

```bash
kubectl scale rs sani-app-rs --replicas=4 -n sani-lite
kubectl get pods -n sani-lite

kubectl scale rs sani-app-rs --replicas=2 -n sani-lite
```

### Key points

- The `selector.matchLabels` must match `template.metadata.labels` — this is how
  the ReplicaSet knows which pods it owns
- ReplicaSet does **NOT** support rolling updates — change the image and existing
  pods are NOT updated. You have to delete them manually.
- That limitation is exactly why **Deployment** exists

```bash
kubectl delete -f 03-replicaset.yaml
```

---

## Lecture Step 5 — Deployment

**File:** `04-deployment.yaml`

A **Deployment** wraps a ReplicaSet and adds rolling updates and rollback.
This is what you use in production — not bare Pods or ReplicaSets.

### What it adds over ReplicaSet

| Feature | ReplicaSet | Deployment |
|---------|-----------|-----------|
| Self-healing | ✔ | ✔ |
| Scaling | ✔ | ✔ |
| Rolling update | ✗ | ✔ |
| Rollback | ✗ | ✔ |
| Revision history | ✗ | ✔ |

```bash
kubectl apply -f 04-deployment.yaml

kubectl get deployments -n sani-lite
kubectl get pods -n sani-lite

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Demo — rolling update (zero downtime)

```bash
# Terminal 1 — watch pods during the update
kubectl get pods -n sani-lite --watch

# Terminal 2 — trigger a rolling update by changing the image tag
kubectl set image deployment/sani-app \
  sani-app=211125430491.dkr.ecr.us-east-1.amazonaws.com/sani-lite:new-tag \
  -n sani-lite

# Watch new pods come up before old ones go down
kubectl rollout status deployment/sani-app -n sani-lite
```

### Demo — rollback

```bash
# View history
kubectl rollout history deployment/sani-app -n sani-lite

# Roll back to previous version
kubectl rollout undo deployment/sani-app -n sani-lite

# Confirm
kubectl rollout status deployment/sani-app -n sani-lite
```

### Key points

- Deployment → manages → ReplicaSet → manages → Pods
- `initContainer` waits for MySQL to be ready before the app starts
- `readinessProbe` — Kubernetes only sends traffic to a pod when this passes
- `livenessProbe` — Kubernetes restarts a pod if this fails
- `resources.requests` = guaranteed; `resources.limits` = maximum

```bash
kubectl delete -f 04-deployment.yaml
```

---

## Lecture Step 6 — ConfigMap

**File:** `06-configmap.yaml`

A **ConfigMap** stores non-sensitive configuration as key-value pairs.
It keeps config out of your Docker image — change config without rebuilding.

### Two ways to consume a ConfigMap

**Method 1 — environment variables (envFrom)**
All keys become env vars in the container automatically.

**Method 2 — mounted file (volumeMounts)**
The ConfigMap is mounted as a file inside the container.
Useful for config files (`.properties`, `.conf`, `.env`).

```bash
kubectl apply -f 06-configmap.yaml

# View the ConfigMap
kubectl get configmap app-config -n sani-lite -o yaml

# Verify env vars are injected inside the pod
kubectl exec -it <pod-name> -n sani-lite -- sh
echo $NODE_ENV
echo $PORT

# Verify the mounted config file
cat /etc/config/app.properties
exit

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Key points

- Changing a ConfigMap does **NOT** automatically restart pods — you must redeploy
- Never store passwords or tokens in a ConfigMap — use **Secret** instead
- `envFrom.configMapRef` loads ALL keys; `env.valueFrom.configMapKeyRef` loads one key

```bash
kubectl delete -f 06-configmap.yaml
```

---

## Lecture Step 7 — Secret

**File:** `07-secret.yaml`

A **Secret** stores sensitive data (passwords, tokens, API keys).
Values are base64-encoded — **NOT encrypted**.

### Base64 is not security

```bash
# Anyone can decode it
echo -n "Y2hhbmdlLW1lLWluLXByb2R1Y3Rpb24=" | base64 --decode
# → change-me-in-production

# Encode a value
echo -n "my-new-password" | base64
```

### Two ways to consume a Secret

**Method 1 — secretKeyRef** (reference individual keys — explicit, recommended)
**Method 2 — envFrom secretRef** (load ALL keys at once)

```bash
kubectl apply -f 07-secret.yaml

# View the secret (values are base64)
kubectl get secret app-secrets -n sani-lite -o yaml

# Decode DATABASE_URL
kubectl get secret app-secrets -n sani-lite \
  -o jsonpath='{.data.DATABASE_URL}' | base64 --decode

# Verify inside the pod
kubectl exec -it <pod-name> -n sani-lite -- sh
echo $DATABASE_URL
echo $JWT_SECRET

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Key points

- Base64 is **encoding**, not encryption — treat Secrets like plaintext
- In production, use **ExternalSecret** (Step 11) to pull from AWS Secrets Manager
- Secrets are namespaced — a secret in `sani-lite` is not visible in `default`

```bash
kubectl delete -f 07-secret.yaml
```

---

## Lecture Step 8 — Persistent Volume

**File:** `08-volume.yaml`

Containers are **ephemeral** — all data inside a container is lost when it restarts.
Without a volume, every MySQL restart wipes the entire database.

### PV vs PVC

```
PersistentVolume (PV)       — the actual storage (AWS EBS volume)
PersistentVolumeClaim (PVC) — a pod's REQUEST for storage
```

On EKS, the EBS CSI driver handles **dynamic provisioning**:
You create a PVC → EKS automatically creates an EBS volume → mounts it to the pod.

```bash
kubectl apply -f 08-volume.yaml

# Check PVC — wait for STATUS to become Bound
kubectl get pvc -n sani-lite --watch

# Check the PV that was dynamically created
kubectl get pv

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Demo — data survives pod restart

```bash
# 1. Create some data in MySQL
kubectl exec -it <mysql-pod> -n sani-lite -- bash
mysql -u sani -psanipassword sani
INSERT INTO companies (name) VALUES ('Test Company');
SELECT * FROM companies;
exit

# 2. Delete the MySQL pod (Deployment recreates it)
kubectl delete pod <mysql-pod> -n sani-lite

# 3. Wait for new pod
kubectl get pods -n sani-lite --watch

# 4. Check data is still there
kubectl exec -it <new-mysql-pod> -n sani-lite -- bash
mysql -u sani -psanipassword sani
SELECT * FROM companies;   ← still there!
```

### Key points

- `storageClassName: gp2` → AWS EBS gp2 SSD, dynamically provisioned
- `accessModes: ReadWriteOnce` → only one node can mount this at a time (fine for MySQL)
- The EBS CSI driver must be installed (Terraform handles this)

```bash
kubectl delete -f 08-volume.yaml
```

---

## Lecture Step 9 — Ingress

**File:** `09-ingress.yaml`

**Ingress** exposes HTTP/HTTPS routes from outside the cluster to Services inside.

### Why Ingress instead of LoadBalancer Service?

```
LoadBalancer Service → 1 AWS ELB per service = expensive, no path routing, no SSL
Ingress              → 1 ALB for ALL services, path-based routing, SSL termination
```

### How it works

```
Browser → ALB (AWS) → Ingress rules → ClusterIP Service → Pods
```

The **AWS Load Balancer Controller** watches for Ingress resources and
provisions an ALB automatically. Install it once after cluster creation:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=sani-lite-cluster-dev \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=<lb_controller_role_arn>
```

```bash
kubectl apply -f 09-ingress.yaml

# Watch for ADDRESS column (ALB DNS name — takes ~2 min)
kubectl get ingress -n sani-lite --watch

# Get the URL
kubectl get ingress sani-lite -n sani-lite \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Open in browser
http://<ALB_DNS_NAME>
```

### Key points

- `scheme: internet-facing` → public ALB (use `internal` for private)
- `target-type: ip` → routes directly to pod IPs (recommended, no NodePort needed)
- Subnets must have the correct tags — Terraform adds these automatically
- The app Service must be `ClusterIP` when using Ingress

```bash
kubectl delete -f 09-ingress.yaml
```

---

## Lecture Step 10 — ServiceAccount + IRSA

**File:** `10-serviceaccount.yaml`

A **ServiceAccount** gives pods an identity inside the cluster.
**IRSA** (IAM Roles for Service Accounts) links that identity to an AWS IAM Role
so pods can call AWS APIs without storing any credentials.

### How IRSA works

```
Pod starts
  → EKS injects a projected token (via volume)
  → AWS SDK exchanges token for temporary STS credentials
  → Pod can call S3, Secrets Manager, ECR
  → Credentials rotate automatically every hour
```

No access keys. No secrets. No rotation scripts.

```bash
kubectl apply -f 10-serviceaccount.yaml

# Check the service account
kubectl get serviceaccount app-sa -n sani-lite -o yaml

# Verify the pod has AWS credentials injected
kubectl exec -it <pod-name> -n sani-lite -- sh
env | grep AWS
# AWS_ROLE_ARN=arn:aws:iam::211125430491:role/sani-lite-cluster-dev-app-sa
# AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Key points

- Every pod uses the `default` service account unless you specify `serviceAccountName`
- The annotation `eks.amazonaws.com/role-arn` is what enables IRSA
- The role ARN must match what Terraform created (`terraform output app_irsa_role_arn`)

```bash
kubectl delete -f 10-serviceaccount.yaml
```

---

## Lecture Step 11 — HorizontalPodAutoscaler

**File:** `11-hpa.yaml`

**HPA** automatically scales the number of pod replicas up or down
based on observed CPU or memory usage.

### Prerequisites

```bash
# Install Metrics Server (required — HPA reads from it)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify
kubectl get pods -n kube-system | grep metrics-server
```

```bash
kubectl apply -f 11-hpa.yaml

# Check HPA
kubectl get hpa -n sani-lite

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Demo — trigger auto-scaling

```bash
# Terminal 1 — watch HPA and pods
kubectl get hpa sani-app -n sani-lite --watch

# Terminal 2 — watch pods
kubectl get pods -n sani-lite --watch

# Terminal 3 — generate load
kubectl run load --image=busybox --rm -it -n sani-lite -- \
  sh -c "while true; do wget -qO- http://sani-app:3000; done"

# Watch Terminal 1 — REPLICAS column increases as CPU rises above 70%
# Stop the load pod (Ctrl+C) — replicas scale back down after ~5 min
```

### Key points

- Pods **must** have `resources.requests` defined — HPA calculates utilisation as
  `(current usage / requests.cpu) * 100`
- `minReplicas: 2` → always at least 2 pods (high availability)
- `maxReplicas: 6` → never more than 6 pods (cost control)
- Scale-up is fast (~30s); scale-down has a 5-min cooldown to avoid flapping

```bash
kubectl delete -f 11-hpa.yaml
```

---

## Lecture Step 12 — ExternalSecret

**File:** `12-externalsecret.yaml`

**ExternalSecret** syncs secrets from AWS Secrets Manager into Kubernetes Secrets.
This is the production replacement for the manual base64 Secret in Step 7.

### Why not just use Kubernetes Secrets?

| | K8s Secret | ExternalSecret + AWS SM |
|--|-----------|------------------------|
| Encrypted at rest | No (by default) | Yes |
| Audit trail | No | Yes (CloudTrail) |
| Rotation | Manual | Automatic |
| Central management | No | Yes |
| Access control | kubectl RBAC | IAM policies |

### Install External Secrets Operator (once)

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace --wait
```

```bash
kubectl apply -f 12-externalsecret.yaml

# Check sync status — READY should be True
kubectl get externalsecret -n sani-lite

# Verify the K8s Secret was created by ESO
kubectl get secret app-secrets -n sani-lite

# Access
http://<NODE_PUBLIC_IP>:30300
```

### Key points

- `ClusterSecretStore` — tells ESO HOW to connect to AWS (uses IRSA, no static credentials)
- `ExternalSecret` — tells ESO WHAT to fetch and WHERE to put it
- `refreshInterval: 1h` — ESO re-syncs from AWS every hour
- The pod still reads from a normal K8s Secret — the difference is ESO manages it

```bash
kubectl delete -f 12-externalsecret.yaml
```

---

## Lecture Step 13 — ResourceQuota & LimitRange

**File:** `13-resourcequota.yaml`

**ResourceQuota** caps total resource consumption for the entire namespace.
**LimitRange** sets default requests/limits per container.

### Why this matters

Without ResourceQuota → one team's app can consume all cluster CPU/memory
Without LimitRange → pods with no resource spec get unlimited resources

```bash
kubectl apply -f 13-resourcequota.yaml

# See current quota usage
kubectl describe resourcequota sani-lite-quota -n sani-lite

# See default limits applied to containers
kubectl describe limitrange sani-lite-limits -n sani-lite
```

### Key points

- `requests` = guaranteed resources (scheduler uses this to place pods)
- `limits` = maximum allowed (pod is throttled at CPU limit, OOMKilled at memory limit)
- A pod is **not scheduled** if the namespace quota is already full

```bash
kubectl delete -f 13-resourcequota.yaml
```

---

## Full Production Deploy (apply everything in order)

```bash
kubectl apply -f 01-namespace.yaml
kubectl apply -f 06-configmap.yaml
kubectl apply -f 07-secret.yaml          # dev only — use 12-externalsecret.yaml on EKS
kubectl apply -f 08-volume.yaml
kubectl apply -f 10-serviceaccount.yaml
kubectl apply -f 04-deployment.yaml
kubectl apply -f 05-service.yaml
kubectl apply -f 09-ingress.yaml         # requires AWS Load Balancer Controller
kubectl apply -f 11-hpa.yaml             # requires Metrics Server
kubectl apply -f 12-externalsecret.yaml  # EKS only — requires ESO
kubectl apply -f 13-resourcequota.yaml
```

---

## Useful Commands Reference

```bash
# ── Context / Namespace ────────────────────────────────────────────────────────
kubectl config get-contexts
kubectl config use-context <context-name>
kubectl config set-context --current --namespace=sani-lite

# ── Cluster Info ───────────────────────────────────────────────────────────────
kubectl cluster-info
kubectl get nodes -o wide
kubectl top nodes                          # requires Metrics Server

# ── Pods ───────────────────────────────────────────────────────────────────────
kubectl get pods -n sani-lite
kubectl get pods -n sani-lite -o wide      # shows node and IP
kubectl get pods -n sani-lite --watch
kubectl describe pod <name> -n sani-lite   # events, errors, probe status
kubectl logs <name> -n sani-lite --follow
kubectl exec -it <name> -n sani-lite -- sh
kubectl delete pod <name> -n sani-lite
kubectl top pods -n sani-lite              # CPU/memory usage

# ── Deployments ────────────────────────────────────────────────────────────────
kubectl get deployments -n sani-lite
kubectl rollout status deployment/sani-app -n sani-lite
kubectl rollout history deployment/sani-app -n sani-lite
kubectl rollout undo deployment/sani-app -n sani-lite
kubectl set image deployment/sani-app sani-app=<new-image> -n sani-lite
kubectl scale deployment sani-app --replicas=3 -n sani-lite

# ── Services ───────────────────────────────────────────────────────────────────
kubectl get svc -n sani-lite
kubectl describe svc sani-app -n sani-lite

# ── Ingress ────────────────────────────────────────────────────────────────────
kubectl get ingress -n sani-lite
kubectl describe ingress sani-lite -n sani-lite

# ── ConfigMap / Secret ─────────────────────────────────────────────────────────
kubectl get configmap -n sani-lite
kubectl get secret -n sani-lite
kubectl get secret app-secrets -n sani-lite -o jsonpath='{.data.DATABASE_URL}' | base64 --decode

# ── Storage ────────────────────────────────────────────────────────────────────
kubectl get pvc -n sani-lite
kubectl get pv

# ── Everything at once ─────────────────────────────────────────────────────────
kubectl get all -n sani-lite
kubectl delete all --all -n sani-lite
```

---

## Teaching Order Summary

| Step | File | Object | Key lesson |
|------|------|--------|-----------|
| 1 | `02-pod.yaml` | Pod | Smallest unit — run the app, access via NodePort |
| 2 | `05-service.yaml` | Service (all 3 types) | ClusterIP vs NodePort vs LoadBalancer |
| 3 | `01-namespace.yaml` | Namespace | Isolate resources by environment |
| 4 | `03-replicaset.yaml` | ReplicaSet | Self-healing — pods restart automatically |
| 5 | `04-deployment.yaml` | Deployment | Rolling updates + rollback |
| 6 | `06-configmap.yaml` | ConfigMap | Externalise non-sensitive config |
| 7 | `07-secret.yaml` | Secret | Externalise sensitive config (base64) |
| 8 | `08-volume.yaml` | PVC | Persistent storage — data survives restarts |
| 9 | `09-ingress.yaml` | Ingress | One ALB for all services, path routing |
| 10 | `10-serviceaccount.yaml` | ServiceAccount | Pod identity + IRSA for AWS access |
| 11 | `11-hpa.yaml` | HPA | Auto-scale on CPU/memory |
| 12 | `12-externalsecret.yaml` | ExternalSecret | Pull secrets from AWS Secrets Manager |
| 13 | `13-resourcequota.yaml` | ResourceQuota + LimitRange | Namespace resource governance |
