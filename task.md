# Task Board — Zenith Case Opening Demo

Status legend: `[ ]` todo | `[~]` in progress | `[x]` done

---

## Phase 1: Monolith (Local npm)

### 1.1 Project Setup
- [ ] Initialize monorepo structure: `/client` (React), `/server` (Express), `/shared` (types)
- [ ] Setup React app with Vite + Tailwind CSS
- [ ] Setup Express server with Mongoose
- [ ] Configure Tailwind with Kinetic Foundry design tokens (from DESIGN.md)
- [ ] Add fonts: Space Grotesk + Manrope
- [ ] Create `.env.example` with required vars (MONGO_URI, JWT_SECRET, PORT)

### 1.2 Database & Models
- [ ] Define Mongoose schemas: User, Session, Prize, AdminUser, Settings
- [ ] Create seed script: populate default prizes (8 items from prototype) + default admin user
- [ ] Verify: `npm run seed` creates all collections with correct data

### 1.3 Backend API — Game
- [ ] `POST /api/game/register` — create user + session (name, attempts count)
- [ ] `POST /api/game/spin/:sessionId` — server-side weighted random, decrement stock, return prize
- [ ] `GET /api/game/session/:sessionId` — get session with results (for summary screen)
- [ ] Validation: reject spin if session exhausted or prize out of stock
- [ ] Verify: can complete full flow via curl/Postman

### 1.4 Backend API — Admin
- [ ] `POST /api/admin/login` — verify credentials, return JWT
- [ ] `GET /api/admin/dashboard` — return stats (total participants, total opens, active sessions, stock summary)
- [ ] `GET /api/admin/prizes` — list all prizes with stock info
- [ ] `PUT /api/admin/prizes/:id` — update prize (name, weight, stock, active)
- [ ] `POST /api/admin/prizes` — add new prize
- [ ] `DELETE /api/admin/prizes/:id` — remove prize
- [ ] `GET /api/admin/rates` — get current tier weights
- [ ] `PUT /api/admin/rates` — update tier weights (must sum to 100)
- [ ] `GET /api/admin/history` — paginated list of all opens
- [ ] JWT middleware on all admin routes
- [ ] Verify: all admin CRUD works via curl

### 1.5 Frontend — User Flow
- [ ] Welcome screen: name input + attempt selector + BEGIN button (match stitch landing design)
- [ ] Game screen: reel spinner component with weighted items (match stitch reel design)
- [ ] Reel animation: horizontal scroll with easing, center marker, fade edges
- [ ] Result screen: prize reveal with tier-based glow/particles (match stitch prize reveal design)
- [ ] Summary screen: best reward hero + full history list + play again
- [ ] Wire all screens to backend API (replace client-side random with server calls)
- [ ] Verify: full user flow works end-to-end in browser

### 1.6 Frontend — Admin Flow
- [ ] Login screen: username + password form
- [ ] Dashboard tab: stats cards + reward distribution chart + recent activity
- [ ] Prizes tab: inventory table with stock bars + add/edit/delete
- [ ] Probability tab: tier weight sliders + save button (validate sum = 100)
- [ ] History tab: paginated table of all opens
- [ ] Wire to admin API endpoints
- [ ] Verify: admin can login, view stats, adjust rates, manage prizes

### 1.7 Integration & Polish
- [ ] Error handling: API errors shown as toast/banner in UI
- [ ] Loading states on all async actions
- [ ] Responsive layout (desktop primary, mobile acceptable)
- [ ] Verify: full happy path — user registers, spins N times, sees summary; admin adjusts rates, adds prize

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
