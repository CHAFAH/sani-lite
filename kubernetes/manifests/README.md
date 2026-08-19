# Kubernetes — Lecture Notes

Hands-on walkthrough of Kubernetes objects using the **sani-lite** app (Node.js + MySQL).
Each step builds on the previous one. Every manifest can be applied independently so students
can see exactly what each object does before moving to the next.

---

## Prerequisites

```bash
# Connect kubectl to the EKS cluster
aws eks update-kubeconfig --name sani-lite-cluster-dev --region us-east-1 --profile terraform

# Verify connection
kubectl cluster-info
kubectl get nodes
```

---

## Step 0 — Namespace

**File:** `01-namespace.yaml`

A Namespace is a virtual cluster inside your Kubernetes cluster.
It lets you isolate resources by team, environment, or application.

```bash
kubectl apply -f 01-namespace.yaml

# Verify
kubectl get namespaces
kubectl get ns sani-lite
```

**Key points:**
- All sani-lite resources live in the `sani-lite` namespace
- Resources in different namespaces are isolated by default
- `kubectl get pods` shows the default namespace — always pass `-n sani-lite`

---

## Step 1 — Pod

**File:** `02-pod.yaml`

A Pod is the **smallest deployable unit** in Kubernetes.
It wraps one or more containers that share the same network and storage.

```bash
kubectl apply -f 02-pod.yaml

# Watch pods come up
kubectl get pods -n sani-lite --watch

# Describe a pod — shows events, image pull status, errors
kubectl describe pod sani-app -n sani-lite

# Stream logs
kubectl logs sani-app -n sani-lite --follow

# Shell into the app container
kubectl exec -it sani-app -n sani-lite -- sh

# Shell into MySQL
kubectl exec -it mysql -n sani-lite -- bash
mysql -u sani -psanipassword sani
```

**Access the app (NodePort):**
```bash
# Get the node's public IP
kubectl get nodes -o wide

# Open in browser
http://<NODE_PUBLIC_IP>:30300
```

**Key points:**
- Every pod gets its own cluster IP — but that IP changes every time the pod restarts
- Pods are **ephemeral** — if a pod crashes, it stays dead (no auto-restart)
- The MySQL pod is exposed via ClusterIP so the app pod can reach it by DNS name `mysql`
- The app pod is exposed via NodePort `30300` so you can access it from a browser
- This is why we need **ReplicaSet** next — to keep pods alive automatically

**Cleanup:**
```bash
kubectl delete -f 02-pod.yaml
```

---

## Step 2 — ReplicaSet

**File:** `03-replicaset.yaml`

A ReplicaSet ensures a **specified number of pod replicas** are always running.
If a pod dies, the ReplicaSet creates a new one automatically.

```bash
kubectl apply -f 03-replicaset.yaml

# Check ReplicaSets
kubectl get rs -n sani-lite

# Check pods created by the ReplicaSet
kubectl get pods -n sani-lite

# Watch self-healing in action — delete a pod and watch it come back
kubectl delete pod <pod-name> -n sani-lite
kubectl get pods -n sani-lite --watch

# Scale manually
kubectl scale rs sani-app-rs --replicas=3 -n sani-lite
```

**Key points:**
- ReplicaSet = self-healing pods
- The `selector.matchLabels` must match `template.metadata.labels` — this is how the ReplicaSet knows which pods it owns
- ReplicaSet does **NOT** support rolling updates — if you change the image, existing pods are not updated
- That is why we use **Deployment** next

**Cleanup:**
```bash
kubectl delete -f 03-replicaset.yaml
```

---

## Step 3 — Deployment

**File:** `04-deployment.yaml`

A Deployment wraps a ReplicaSet and adds:
- **Rolling updates** — new pods come up before old ones go down (zero downtime)
- **Rollback** — instantly revert to a previous version
- **Revision history** — full audit trail of every change

```bash
kubectl apply -f 04-deployment.yaml

# Check deployments
kubectl get deployments -n sani-lite

# Watch rolling update in real time
kubectl rollout status deployment/sani-app -n sani-lite

# View revision history
kubectl rollout history deployment/sani-app -n sani-lite

# Trigger a rolling update by changing the image
kubectl set image deployment/sani-app \
  sani-app=075120018043.dkr.ecr.us-east-1.amazonaws.com/sani-lite:new-tag \
  -n sani-lite

# Rollback to previous version
kubectl rollout undo deployment/sani-app -n sani-lite

# Scale
kubectl scale deployment sani-app --replicas=3 -n sani-lite
```

**Key points:**
- Deployment → manages → ReplicaSet → manages → Pods
- `initContainer` in the app deployment waits for MySQL to be ready before starting the app
- `readinessProbe` — Kubernetes only sends traffic to a pod when this passes
- `livenessProbe` — Kubernetes restarts a pod if this fails
- `resources.requests` — guaranteed resources; `resources.limits` — maximum allowed

**Cleanup:**
```bash
kubectl delete -f 04-deployment.yaml
```

---

## Step 4 — Service

**File:** `05-service.yaml`

A Service gives pods a **stable DNS name and IP address**.
Pods come and go with new IPs — the Service stays constant.

```bash
kubectl apply -f 05-service.yaml

# Check services
kubectl get svc -n sani-lite

# Test internal connectivity from inside the cluster
kubectl run tmp --image=busybox --rm -it -n sani-lite -- \
  wget -qO- http://sani-app:3000
```

**Service types:**

| Type | Accessible from | Use case |
|------|----------------|----------|
| `ClusterIP` | Inside cluster only | Internal service-to-service communication |
| `NodePort` | Node IP + static port | Quick demo access, no cloud LB needed |
| `LoadBalancer` | Internet via cloud LB | Production (replaced by Ingress + ALB) |

**Key points:**
- `selector` must match pod labels — this is how the Service finds its pods
- MySQL uses `ClusterIP` — only reachable inside the cluster at `mysql:3306`
- App uses `ClusterIP` here — Ingress will route external traffic to it (Step 8)
- DNS format: `<service-name>.<namespace>.svc.cluster.local`

---

## Step 5 — ConfigMap

**File:** `06-configmap.yaml`

A ConfigMap stores **non-sensitive configuration** as key-value pairs.
Keeps config out of your Docker image — change config without rebuilding.

```bash
kubectl apply -f 06-configmap.yaml

# View the ConfigMap
kubectl get configmap app-config -n sani-lite -o yaml

# Describe it
kubectl describe configmap app-config -n sani-lite
```

**Key points:**
- ConfigMap values are injected into pods as environment variables or mounted as files
- Changing a ConfigMap does NOT automatically restart pods — you must redeploy
- Never store passwords or tokens in a ConfigMap — use Secret instead

---

## Step 6 — Secret

**File:** `07-secret.yaml`

A Secret stores **sensitive data** (passwords, tokens, API keys).
Values are base64-encoded — NOT encrypted. Use External Secrets Operator in production.

```bash
kubectl apply -f 07-secret.yaml

# View secret (values are base64-encoded)
kubectl get secret app-secrets -n sani-lite -o yaml

# Decode a value
kubectl get secret app-secrets -n sani-lite \
  -o jsonpath='{.data.DATABASE_URL}' | base64 --decode

# Encode a new value
echo -n "my-new-secret" | base64
```

**Key points:**
- Base64 is **encoding**, not encryption — anyone with cluster access can decode it
- In production, use **ExternalSecret** (Step 11) to pull from AWS Secrets Manager
- Secrets are namespaced — a secret in `sani-lite` is not visible in other namespaces

---

## Step 7 — Persistent Volume

**File:** `08-volume.yaml`

Containers are **ephemeral** — all data is lost when a pod restarts.
PersistentVolumeClaim (PVC) requests durable storage that survives pod restarts.

```bash
kubectl apply -f 08-volume.yaml

# Check PVC status (should be Bound after EBS volume is provisioned)
kubectl get pvc -n sani-lite

# Check the PersistentVolume that was dynamically created
kubectl get pv
```

**Key points:**
- `PersistentVolume (PV)` — the actual storage (EBS volume on AWS)
- `PersistentVolumeClaim (PVC)` — a pod's request for storage
- `storageClassName: gp2` — tells EKS to dynamically provision an AWS EBS gp2 volume
- `accessModes: ReadWriteOnce` — only one node can mount this volume at a time (fine for MySQL)
- The EBS CSI driver (installed via Terraform) handles the dynamic provisioning

---

## Step 8 — Ingress

**File:** `09-ingress.yaml`

Ingress exposes HTTP/HTTPS routes from **outside the cluster** to Services inside.
The AWS Load Balancer Controller watches for Ingress resources and provisions an ALB automatically.

```bash
kubectl apply -f 09-ingress.yaml

# Check ingress (ADDRESS column shows the ALB DNS name — takes ~2 min to provision)
kubectl get ingress -n sani-lite

# Get the ALB URL
kubectl get ingress sani-lite -n sani-lite \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

**Key points:**
- Ingress requires an **Ingress Controller** — we use the AWS Load Balancer Controller
- `alb.ingress.kubernetes.io/scheme: internet-facing` — creates a public ALB
- `alb.ingress.kubernetes.io/target-type: ip` — routes directly to pod IPs (no NodePort needed)
- Subnets must have the correct tags for the LB controller to discover them (handled by Terraform)

**Install the AWS Load Balancer Controller (run once after cluster creation):**
```bash
# Get the role ARN from Terraform output
terraform output lb_controller_helm_command

# Or manually:
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=sani-lite-cluster-dev \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=<lb_controller_role_arn>
```

---

## Step 9 — ServiceAccount

**File:** `10-serviceaccount.yaml`

A ServiceAccount gives pods an **identity** inside the cluster.
Combined with **IRSA** (IAM Roles for Service Accounts), pods can call AWS APIs
(S3, Secrets Manager, ECR) without storing AWS credentials anywhere.

```bash
kubectl apply -f 10-serviceaccount.yaml

# Check service account
kubectl get serviceaccount app-sa -n sani-lite -o yaml
```

**How IRSA works:**
1. Terraform creates an IAM role with a trust policy scoped to this service account
2. The annotation `eks.amazonaws.com/role-arn` links the pod to that IAM role
3. The AWS SDK inside the pod automatically gets temporary credentials via the EKS OIDC provider
4. No access keys, no secrets — fully automatic credential rotation

**Key points:**
- Every pod uses the `default` service account unless you specify one
- IRSA is the AWS-recommended way to give pods AWS permissions
- The role ARN in the annotation must match what Terraform created

---

## Step 10 — HorizontalPodAutoscaler

**File:** `11-hpa.yaml`

HPA automatically **scales the number of pod replicas** up or down based on CPU/memory usage.

```bash
kubectl apply -f 11-hpa.yaml

# Check HPA
kubectl get hpa -n sani-lite

# Watch it scale in real time
kubectl get hpa sani-app -n sani-lite --watch

# Simulate load to trigger scale-up
kubectl run load --image=busybox --rm -it -n sani-lite -- \
  sh -c "while true; do wget -qO- http://sani-app:3000; done"
```

**Key points:**
- HPA requires the **Metrics Server** to be installed in the cluster
- `minReplicas: 2` — always at least 2 pods running (high availability)
- `maxReplicas: 6` — never more than 6 pods (cost control)
- Scale-up is fast (~30s); scale-down is slow (~5 min) to avoid flapping

---

## Step 11 — ExternalSecret

**File:** `12-externalsecret.yaml`

ExternalSecret syncs secrets from **AWS Secrets Manager** into Kubernetes Secrets automatically.
This is the production replacement for the manual base64 Secret in Step 6.

```bash
# Install External Secrets Operator first (run once)
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace --wait

kubectl apply -f 12-externalsecret.yaml

# Check sync status
kubectl get externalsecret -n sani-lite

# Verify the secret was created
kubectl get secret app-secrets -n sani-lite
```

**Key points:**
- ESO polls AWS Secrets Manager every `refreshInterval` (1h) and updates the K8s Secret
- If the secret changes in AWS, the K8s Secret is updated automatically
- The pod does not need to restart — it reads the updated secret on next access
- Requires the app-sa ServiceAccount to have `secretsmanager:GetSecretValue` permission (via IRSA)

---

## Step 12 — ResourceQuota & LimitRange

**File:** `13-resourcequota.yaml`

ResourceQuota caps **total resource consumption** for the entire namespace.
LimitRange sets **default requests/limits per container** so pods without explicit resources still get sensible defaults.

```bash
kubectl apply -f 13-resourcequota.yaml

# Check quota usage
kubectl describe resourcequota sani-lite-quota -n sani-lite

# Check limit range
kubectl describe limitrange sani-lite-limits -n sani-lite
```

**Key points:**
- Without ResourceQuota, one namespace can consume all cluster resources
- Without LimitRange, pods with no resource spec get unlimited CPU/memory
- `requests` = guaranteed; `limits` = maximum. A pod is throttled at its CPU limit and OOMKilled at its memory limit

---

## Full Deploy (apply everything in order)

```bash
kubectl apply -f 01-namespace.yaml
kubectl apply -f 06-configmap.yaml
kubectl apply -f 07-secret.yaml          # local/dev only — use 12-externalsecret.yaml on EKS
kubectl apply -f 08-volume.yaml
kubectl apply -f 10-serviceaccount.yaml
kubectl apply -f 04-deployment.yaml
kubectl apply -f 05-service.yaml
kubectl apply -f 09-ingress.yaml         # requires AWS Load Balancer Controller
kubectl apply -f 11-hpa.yaml             # requires Metrics Server
kubectl apply -f 12-externalsecret.yaml  # EKS only — requires ESO
kubectl apply -f 13-resourcequota.yaml
```

Or all at once:
```bash
kubectl apply -f .
```

---

## Useful Commands Reference

```bash
# ── Namespace ──────────────────────────────────────────────────────────────────
kubectl get ns
kubectl config set-context --current --namespace=sani-lite   # set default namespace

# ── Pods ───────────────────────────────────────────────────────────────────────
kubectl get pods -n sani-lite
kubectl get pods -n sani-lite --watch
kubectl describe pod <pod-name> -n sani-lite
kubectl logs <pod-name> -n sani-lite --follow
kubectl exec -it <pod-name> -n sani-lite -- sh
kubectl delete pod <pod-name> -n sani-lite

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

# ── Everything ─────────────────────────────────────────────────────────────────
kubectl get all -n sani-lite
kubectl delete all --all -n sani-lite
```

---

## Teaching Order Summary

| Step | File | Object | What it adds |
|------|------|--------|-------------|
| 0 | `01-namespace.yaml` | Namespace | Isolated environment |
| 1 | `02-pod.yaml` | Pod + Service | Smallest unit — run and access the app |
| 2 | `03-replicaset.yaml` | ReplicaSet | Self-healing — pods restart automatically |
| 3 | `04-deployment.yaml` | Deployment | Rolling updates + rollback |
| 4 | `05-service.yaml` | Service | Stable DNS for pods |
| 5 | `06-configmap.yaml` | ConfigMap | Externalise non-sensitive config |
| 6 | `07-secret.yaml` | Secret | Externalise sensitive config |
| 7 | `08-volume.yaml` | PVC | Persistent storage for MySQL |
| 8 | `09-ingress.yaml` | Ingress | External access via ALB |
| 9 | `10-serviceaccount.yaml` | ServiceAccount | Pod identity + AWS access via IRSA |
| 10 | `11-hpa.yaml` | HPA | Auto-scaling on CPU/memory |
| 11 | `12-externalsecret.yaml` | ExternalSecret | Sync secrets from AWS Secrets Manager |
| 12 | `13-resourcequota.yaml` | ResourceQuota + LimitRange | Namespace resource governance |
