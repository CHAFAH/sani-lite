# Sani-Lite

A full-stack HR / People OS SaaS application. Manages employees, payroll, time-off, benefits, performance, hiring, and more.

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
│   ├── manifests/        # Raw Kubernetes YAML
│   ├── helm/             # Helm chart
│   └── argocd/           # ArgoCD app definitions
├── Dockerfile            # Multi-stage Node 20 Alpine build
├── docker-compose.yml    # Local dev stack (app + MySQL)
└── .github/workflows/    # GitHub Actions CI/CD
```

## Local Development

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

## Docker

### Docker Compose (recommended for local)

```bash
docker compose up --build
```

Starts MySQL 8 + the app. App available at `http://localhost:3000`.

```bash
docker compose down       # stop
docker compose down -v    # stop and wipe database
```

### Manual Docker

```bash
docker build -t sani-lite:v1 .
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://sani:sanipassword@host:3306/sani \
  -e JWT_SECRET=your-secret \
  sani-lite:v1
```

## Running Tests

```bash
pnpm test                    # run all tests
pnpm test --reporter=verbose # with detailed output
```

Tests use vitest with mocked DB. Coverage includes:

| Suite | Tests |
|-------|-------|
| `system.health` | health check, invalid input |
| `auth.me` | unauthenticated, authenticated |
| `auth.logout` | clears session cookie |
| `company` | get, get with no companyId, getById not found |
| `employee` | list, create (no seats), delete |
| `invitation.validate` | unknown token, expired token |

## CI/CD — GitHub Actions

Three jobs run on push to `main` or `develop`:

```
test  ──▶  build-and-push (ECR)  ──▶  deploy (EKS)
```

| Branch | Image tag format | Environment |
|--------|-----------------|-------------|
| `main` | `prod-YYYYMMDD-HHMMSS` | `production` (approval gate) |
| `develop` | `dev-YYYYMMDD-HHMMSS` | `development` |

### Required GitHub Secrets

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

### ECR / EKS Config (set in workflow env)

| Variable | Value |
|----------|-------|
| `ECR_REGISTRY` | `075120018043.dkr.ecr.us-east-1.amazonaws.com` |
| `ECR_REPOSITORY` | `sani-lite` |
| `EKS_CLUSTER` | `landmark-cluster-dev` |
| `AWS_REGION` | `us-east-1` |

## Kubernetes

Manifests are in `kubernetes/manifests/`. Apply in order:

```bash
kubectl apply -f kubernetes/manifests/ -n sani-lite
```

| File | Resource |
|------|----------|
| `02-namespace.yaml` | Namespace `sani-lite` |
| `03-configmap.yaml` | NODE_ENV, PORT |
| `04-secret.yaml` | DATABASE_URL, JWT_SECRET |
| `05-mysql-pvc.yaml` | 10Gi PVC for MySQL |
| `06-deployment.yaml` | sani-app (2 replicas) + mysql |
| `07-service.yaml` | ClusterIP for app (3000) and mysql (3306) |
| `08-ingress.yaml` | ALB ingress → sani-app:3000 |
| `09-serviceaccount.yaml` | IRSA service account |
| `10-externalsecret.yaml` | ESO pulls secrets from AWS Secrets Manager |
| `11-hpa.yaml` | HPA min=2 max=6 |
| `12-resourcequota.yaml` | Namespace resource limits |

### Deploy via Helm

```bash
helm install sani-lite kubernetes/helm/ \
  --namespace sani-lite --create-namespace
```

### Deploy via ArgoCD

```bash
kubectl apply -f kubernetes/argocd/
```

## API

All API calls go through tRPC at `/api/trpc`. Key routers:

`auth` · `company` · `employee` · `timeOff` · `payroll` · `payrollCycle` · `benefits` · `performance` · `goals` · `jobPosting` · `hiring` · `learning` · `compensation` · `salaryBand` · `announcements` · `department` · `rbac` · `invitation` · `payslip` · `feedback` · `userManagement` · `finance` · `sso`

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
