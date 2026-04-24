# Deployment Reference — Zenith Case Opening Demo

> Single source of truth for the **next repo** (GitOps / Kustomize) that will
> consume images from this one. A future AI tool reads this file to generate
> the Kubernetes manifests / Kustomize overlays. Keep it up to date whenever
> an image, port, or env var changes.

---

## 1. Registry & image names

- **Registry:** Docker Hub (`docker.io`)
- **Namespace:** value of the `DOCKERHUB_USERNAME` GitHub secret
- **Visibility:** repos should exist on Docker Hub; auth uses `DOCKERHUB_TOKEN`

| Service        | Image (repo path)                                       | Context in repo              |
|----------------|---------------------------------------------------------|------------------------------|
| client         | `${DOCKERHUB_USERNAME}/case-opening-demo-client`        | `./client`                   |
| auth-service   | `${DOCKERHUB_USERNAME}/case-opening-demo-auth-service`  | `./services/auth-service`    |
| game-service   | `${DOCKERHUB_USERNAME}/case-opening-demo-game-service`  | `./services/game-service`    |
| admin-service  | `${DOCKERHUB_USERNAME}/case-opening-demo-admin-service` | `./services/admin-service`   |
| prize-service  | `${DOCKERHUB_USERNAME}/case-opening-demo-prize-service` | `./services/prize-service`   |

> The legacy `./server/` monolith is **not** part of the microservice
> deployment and is not built by the release pipeline.

---

## 2. Tag strategy

Every push to `main` or `Development` produces **two tags per image**:

| Tag                  | Example              | Nature     | Use                                         |
|----------------------|----------------------|------------|---------------------------------------------|
| `sha-<7char>`        | `sha-8865e29`        | Immutable  | **GitOps — always pin to this**             |
| `<branch>-latest`    | `main-latest`        | Floating   | Human sanity-check / quick dev pulls only   |

**Never pin Kustomize or Argo/Flux to a floating tag.** Floating tags are
overwritten on every merge and defeat GitOps reproducibility.

The release pipeline also records the image `sha256` digest and a
`pinned` ref of the form `repo@sha256:...` in the artifact below, which is
even stronger than a SHA tag (tag re-push cannot swap it).

---

## 3. GitOps handoff artifact — `image-refs.json`

At the end of every successful release run, the workflow uploads an artifact
named **`image-refs`** (see `.github/workflows/release.yml`). Download it
from the run and feed it to the GitOps repo's workflow.

Shape:

```json
{
  "commit":   "8865e29abc...full sha...",
  "commit7":  "8865e29",
  "branch":   "main",
  "repo":     "<org>/case-opening-demo",
  "runUrl":   "https://github.com/.../actions/runs/123456",
  "services": [
    {
      "service":  "client",
      "image":    "docker.io/<user>/case-opening-demo-client",
      "tag":      "sha-8865e29",
      "ref":      "docker.io/<user>/case-opening-demo-client:sha-8865e29",
      "digest":   "sha256:...",
      "pinned":   "docker.io/<user>/case-opening-demo-client@sha256:..."
    }
    // ... one entry per service
  ]
}
```

**Recommended GitOps repo flow** (next AI tool builds this):
1. Download `image-refs` artifact via `actions/download-artifact` with
   `github-token` + `run-id` from a `repository_dispatch` event.
2. For each service, run `kustomize edit set image <name>=<ref>` (prefer
   `pinned` → digest; fall back to `ref` → SHA tag).
3. Commit & push the overlay change; ArgoCD / Flux syncs it to the cluster.

---

## 4. Runtime contract per service

Ports and env vars below mirror `docker-compose-prod.yml`. Treat these as
the Deployment spec for Kubernetes manifests.

### client (frontend, nginx)
- **Port (container):** `80`
- **Port (service):** recommend `80` (ClusterIP) + Ingress on `/`
- **Env:** none
- **Depends on:** `auth-service`, `game-service`, `admin-service` (via
  in-cluster DNS — see `client/nginx.conf`)
- **Note:** nginx proxies `/api/auth/` → auth, `/api/game/` → game,
  `/api/admin/` → admin. In K8s these must resolve as
  `http://auth-service:4001`, `http://game-service:4002`,
  `http://admin-service:4003` — keep the K8s Service names identical.

### auth-service
- **Port:** `4001`
- **Env:**
  - `MONGO_URI` → `mongodb://mongodb:27017/zenith_auth`
  - `JWT_SECRET` → **required secret** (K8s Secret)
  - `PORT` → `4001`
- **Depends on:** `mongodb`

### game-service
- **Port:** `4002`
- **Env:**
  - `MONGO_URI` → `mongodb://mongodb:27017/zenith_game`
  - `REDIS_URL` → `redis://redis:6379`
  - `PRIZE_SERVICE_URL` → `http://prize-service:4004`
  - `PORT` → `4002`
- **Depends on:** `mongodb`, `redis`, `prize-service`

### admin-service  (BFF — no own DB)
- **Port:** `4003`
- **Env:**
  - `AUTH_SERVICE_URL` → `http://auth-service:4001`
  - `GAME_SERVICE_URL` → `http://game-service:4002`
  - `PRIZE_SERVICE_URL` → `http://prize-service:4004`
  - `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
    `S3_BUCKET` → **K8s Secret** (optional; admin image upload)
  - `PORT` → `4003`
- **Depends on:** `auth-service`, `game-service`, `prize-service`

### prize-service  (internal only — no Ingress)
- **Port:** `4004`
- **Env:**
  - `MONGO_URI` → `mongodb://mongodb:27017/zenith_prize`
  - `REDIS_URL` → `redis://redis:6379`
  - `PORT` → `4004`
- **Depends on:** `mongodb`, `redis`

### mongodb (stateful)
- Image: `mongo:7`
- Port: `27017`
- Needs a PersistentVolumeClaim mounted at `/data/db`.
- Databases used (logical): `zenith_auth`, `zenith_game`, `zenith_prize`.

### redis (stateful, but ephemeral-ok)
- Image: `redis:7-alpine`
- Port: `6379`
- A PVC at `/data` is nice-to-have (cache warmup); acceptable as emptyDir.

---

## 5. Ingress surface

Only two things are externally reachable:

| Path          | Backend       | Notes                                     |
|---------------|---------------|-------------------------------------------|
| `/*`          | `client:80`   | SPA + nginx API proxy (everything)        |

All `/api/*` traffic enters through the `client` nginx — the microservices
themselves should remain `ClusterIP` (no LoadBalancer, no Ingress).
`prize-service` in particular is internal-only by design.

---

## 6. Secrets the GitOps repo will need to create

Kubernetes `Secret` objects (names are suggestions):

| Secret           | Keys                                                                          | Consumed by        |
|------------------|-------------------------------------------------------------------------------|--------------------|
| `zenith-auth`    | `JWT_SECRET`                                                                  | auth-service       |
| `zenith-s3`      | `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` | admin-service (optional) |
| `dockerhub-pull` | docker-registry type, from `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN`           | all Deployments (`imagePullSecrets`) |

---

## 7. Health checks (recommended for K8s probes)

All Node services expose nothing special yet — use a TCP probe on their
port as a minimum. The client exposes HTTP:

- `client`: `GET /` → 200  (readiness + liveness)
- `auth/game/admin/prize-service`: TCP probe on their port until a
  dedicated `/healthz` is added (tracked as future work).

---

## 8. What this repo's pipelines do / don't do

| Pipeline             | Trigger                         | Pushes to Docker Hub? |
|----------------------|---------------------------------|-----------------------|
| `ci.yml`             | PR to `main` / `Development`    | No (build + scan only) |
| `release.yml`        | push to `main` / `Development`  | **Yes** — `sha-<short>` + `<branch>-latest` |
| `load-test.yml`      | manual                          | No (pulls & tests)    |
| `dast.yml`           | manual                          | No (pulls & scans)    |

GitOps / Kustomize updates are **not** done here — that's the next repo's
job. This repo's contract ends at "image pushed to Docker Hub + artifact
`image-refs.json` available to the next workflow".
