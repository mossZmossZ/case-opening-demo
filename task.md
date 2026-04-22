# Task Board — Zenith Case Opening Demo

Status legend: `[ ]` todo | `[~]` in progress | `[x]` done

---

## Phase 1: Monolith (Local npm) ✅ COMPLETE

### 1.1 Project Setup
- [x] Initialize monorepo structure: `/client` (React), `/server` (Express)
- [x] Setup React app with Vite + Tailwind CSS
- [x] Setup Express server with Mongoose
- [x] Configure Tailwind design tokens (white + orange formal theme — CEO-approved override of original dark spec)
- [x] Add fonts: Lato (replaced Space Grotesk/Manrope per CEO direction)
- [x] Create `.env.example` with required vars (MONGO_URI, JWT_SECRET, PORT)

### 1.2 Database & Models
- [x] Define Mongoose schemas: User, Session, Prize, AdminUser
- [x] Create seed script: populate default prizes + default admin user (`admin` / `zenith`)
- [x] Verify: `npm run seed` creates all collections with correct data

### 1.3 Backend API — Game
- [x] `POST /api/game/register` — create user + session (name, attempts count)
- [x] `POST /api/game/spin/:sessionId` — server-side weighted random, decrement stock, return prize
- [x] `GET /api/game/session/:sessionId` — get session with results (for summary screen)
- [x] `GET /api/game/stats` — public stats: participants, totalOpens, liveDrops, inventory
- [x] `GET /api/game/prizes` — public prize list for reel display
- [x] Validation: reject spin if session exhausted or prize out of stock

### 1.4 Backend API — Admin
- [x] `POST /api/admin/login` — verify credentials, return JWT
- [x] `GET /api/admin/dashboard` — return stats (participants, totalOpens, activeSessions, stockSummary, recentActivity)
- [x] `GET /api/admin/prizes` — list all prizes with stock info
- [x] `PUT /api/admin/prizes/:id` — update prize (name, weight, stock, active)
- [x] `POST /api/admin/prizes` — add new prize
- [x] `DELETE /api/admin/prizes/:id` — remove prize
- [x] `GET /api/admin/rates` — get current prize weights
- [x] `PUT /api/admin/rates` — update prize weights
- [x] `GET /api/admin/history` — paginated list of all opens
- [x] JWT middleware on all admin routes

### 1.5 Frontend — User Flow
- [x] Welcome screen: name input + attempt selector (1–5) + Unlock Now button
- [x] Game screen: reel spinner with weighted items, center marker, fade edges, particle burst
- [x] Reel animation: horizontal scroll with cubic-bezier easing
- [x] Result screen: prize reveal with tier-based glow, rarity badge
- [x] Summary screen: best reward hero + full open history + back to home
- [x] All screens wired to backend API (server-side weighted random)

### 1.6 Frontend — Admin Flow
- [x] Login screen: username + password, JWT stored in memory
- [x] Dashboard tab: stats cards + reward distribution bar chart + recent activity feed
- [x] Prizes tab: inventory table with stock bars + add/edit/delete modal
- [x] Probability tab: per-prize weight sliders + save
- [x] History tab: paginated table of all opens

### 1.7 Integration & Polish
- [x] Loading states on all async actions (Spinner component)
- [x] Responsive layout: desktop viewport-locked (no scroll on 1920×1080), mobile scrollable
- [x] White + orange formal theme applied across all screens
- [x] Stats bar on Welcome page shows live data (participants, totalOpens, remainingCases)
- [x] Bug fix: `GET /api/game/stats` route moved before `export default router` (was silently unreachable)

### 1.8 Open / Known Issues
- [ ] Error handling: API errors not yet shown as toast/banner — silent `.catch(console.error)` pattern used
- [ ] Mobile layout: image hidden on mobile (< lg breakpoint) — acceptable for event kiosk use case

### 1.10 Summary Screen Redesign
- [x] Bug fix: `session.results[i].prizeName` → `r.name` (frontend state stores `name`, not `prizeName`)
- [x] Server: `gameService.js` now returns `imageUrl` in spin response so it flows into `session.results`
- [x] Summary screen: viewport-locked (`lg:h-screen lg:overflow-hidden`) matching all other screens
- [x] Two-column layout (`lg:grid-cols-[2fr_3fr]`): left = best reward hero card (same card style as ResultScreen), right = numbered attempt cards (#1–#5) + CTA
- [x] Each attempt card: attempt number badge, prize image (56×56, `object-contain`) or `PrizeIcon` fallback, prize name + description, tier badge, "Best" marker on best prize
- [x] Best reward left-accent strip (tier color) highlights the winning card
- [x] `focus-visible:ring-*` on CTA button, explicit `width`/`height` + `alt` on all images
- [x] Removed `Topbar` component dependency — uses standard fixed header matching WelcomeScreen/ResultScreen

### 1.9 Prize Image Upload
- [x] Add `imageUrl` field (optional String, default `''`) to `Prize` Mongoose schema
- [x] Pass `imageUrl` through `POST /api/admin/prizes` and `PUT /api/admin/prizes/:id`
- [x] ~~Admin › Prizes form: file input (image/*) → base64 via FileReader → stored as `imageUrl`~~ (replaced by S3 upload — see 1.11)
- [x] Admin › Prizes form: image preview (64×64, `object-contain`) + Remove button when image is set
- [x] Spin reel `ReelCard`: if `prize.imageUrl` exists → show `<img>` (120×120, `object-contain`); if absent → no graphic rendered
- [x] Follows web-design-guidelines: labelled file input, `aria-label` on remove button, explicit `width`/`height` on all images, `focus-visible` ring on interactive elements
- [x] Result screen: show `prize.imageUrl` (240×240, `object-contain`) when set; if absent → no graphic (text-only, consistent with ReelCard behaviour). Removed hardcoded Google image URL and Material icon.
- [x] Result screen: redesigned to viewport-lock at 1920×1080 (`lg:h-screen lg:overflow-hidden`) matching WelcomeScreen pattern. Two-column layout: left = prize card (fills column height), right = congratulations heading + tier badge + prize name + CTA. Added `focus-visible:ring-*` on CTA button. Footer matches WelcomeScreen slim style.

### 1.11 S3 Image Storage
- [x] Replaced base64-in-JSON upload with S3 multipart upload (fixes `Unexpected token '<'` JSON parse error caused by nginx 1MB body limit)
- [x] Install `@aws-sdk/client-s3` + `multer` on server
- [x] `server/src/services/s3.js` — S3Client singleton, `uploadToS3(buffer, filename, mimetype)` returns public URL. Supports custom endpoint (MinIO/path-style) or AWS (virtual-hosted style)
- [x] `POST /api/admin/upload` — protected by JWT, accepts `multipart/form-data` image (max 10 MB), uploads to S3, returns `{ url }`
- [x] `Prize.imageUrl` in MongoDB now stores the S3 object URL (string) instead of base64 data URL
- [x] Admin › Prizes form: file selected → `uploadImage()` hits `/api/admin/upload` → stores returned URL in form state → saved to MongoDB with prize
- [x] Upload button shows "Uploading…" state; Save Prize disabled while upload is in progress
- [x] Nginx `client_max_body_size 10m` added to `/api/` proxy block (prevents 413 for large uploads)
- [x] `.env.example` + `.env.prod.example` updated with `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`

---

## Phase 2: Docker Compose (Frontend + Backend + DB)

### 2.1 Dockerize
- [ ] `client/Dockerfile` — multi-stage build: npm build → nginx serve
- [ ] `server/Dockerfile` — Node.js production image
- [ ] `nginx.conf` — serve React static files, proxy `/api/*` to backend
- [ ] `docker-compose.yml` — frontend, backend, mongodb services
- [ ] `.env` support in docker-compose
- [ ] `mongo-data` named volume for persistence
- [ ] Verify: `docker compose up` starts all 3 services, app works at localhost:3000

### 2.2 Dev Experience
- [ ] `docker-compose.dev.yml` override with hot-reload volumes
- [ ] Health check endpoints: `GET /api/health` on backend
- [ ] Verify: code changes reflect without rebuild in dev mode

---

## Phase 3: Microservices + Redis (Docker Compose)

### 3.1 Service Split
- [ ] Extract `auth-service` (port 4001): login, JWT verify, user management
- [ ] Extract `game-service` (port 4002): register, spin, session, history
- [ ] Extract `admin-service` (port 4003): dashboard, rates, inventory management
- [ ] Extract `prize-service` (port 4004): prize CRUD, stock management, weighted random engine
- [ ] Shared: common middleware package (JWT verify, error handler, logger)
- [ ] Update nginx routing: `/api/auth/*`, `/api/game/*`, `/api/admin/*`, `/api/prizes/*`

### 3.2 Redis Integration
- [ ] Session caching: active game sessions stored in Redis (TTL-based)
- [ ] Rate config cache: drop rates cached in Redis, invalidated on admin update
- [ ] Live activity feed: recent opens pushed to Redis list (capped at 50)
- [ ] Verify: cache hit/miss works correctly, data consistent with MongoDB

### 3.3 Inter-Service Communication
- [ ] game-service calls prize-service for spin resolution
- [ ] admin-service calls prize-service for inventory updates
- [ ] All services call auth-service for JWT verification
- [ ] Verify: full flow works with all 4 services + Redis + MongoDB

### 3.4 Docker Compose
- [ ] Update `docker-compose.yml` with all services + Redis
- [ ] Internal Docker network for service-to-service calls
- [ ] Verify: `docker compose up` starts 7 containers (frontend + 4 services + mongo + redis)

---

## Phase 4: Kubernetes + Observability

### 4.1 Kubernetes Manifests
- [ ] Namespace: `zenith-case`
- [ ] Deployments + Services for: frontend, auth, game, admin, prize
- [ ] StatefulSets for: MongoDB, Redis (with PVCs)
- [ ] ConfigMaps for: environment variables, nginx config
- [ ] Secrets for: JWT_SECRET, MONGO_URI, admin credentials
- [ ] HPA (Horizontal Pod Autoscaler) for: frontend, game-service, prize-service
- [ ] Verify: `kubectl apply -k .` deploys all resources

### 4.2 Istio Service Mesh
- [ ] Install Istio + enable sidecar injection on namespace
- [ ] Istio Gateway + VirtualService for ingress routing
- [ ] DestinationRules for load balancing (round-robin)
- [ ] mTLS strict mode between all services
- [ ] Verify: traffic flows through Envoy sidecars

### 4.3 Observability Stack
- [ ] Jaeger: deploy, configure Istio to send traces
- [ ] Kiali: deploy, connect to Istio + Prometheus
- [ ] Prometheus: deploy with ServiceMonitor for each service
- [ ] Grafana: deploy with dashboards (request rate, latency p50/p95/p99, error rate, spin throughput)
- [ ] Verify: can see traces in Jaeger UI, mesh graph in Kiali, metrics in Grafana

### 4.4 Production Hardening
- [ ] Resource requests/limits on all pods
- [ ] Network policies: restrict inter-service access
- [ ] Readiness + liveness probes on all services
- [ ] Pod disruption budgets for stateful services
- [ ] Verify: `kubectl get pods -n zenith-case` shows all healthy, HPA scales under load

---

## Cross-Phase Tasks

- [ ] README.md with setup instructions per phase
- [ ] API documentation (OpenAPI/Swagger or simple markdown)
- [ ] Seed data script that works across all phases
- [ ] Git branching: `phase-1`, `phase-2`, `phase-3`, `phase-4` branches
