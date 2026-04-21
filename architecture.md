# Architecture — Zenith Case Opening Demo

## Phase 1: Monolith (Local npm)

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React SPA (User UI + Admin UI)                  │
└──────────────────────┬──────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────┐
│              Node.js (Express)                   │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  /api/game   │  │  /api/admin  │              │
│  │  - register  │  │  - login     │              │
│  │  - spin      │  │  - prizes    │              │
│  │  - history   │  │  - rates     │              │
│  └─────────────┘  │  - inventory │              │
│                    │  - history   │              │
│  ┌─────────────┐  └──────────────┘              │
│  │ Static Files│  (serves React build)           │
│  └─────────────┘                                 │
└──────────────────────┬──────────────────────────┘
                       │ Mongoose
┌──────────────────────▼──────────────────────────┐
│                  MongoDB                         │
│  Collections:                                    │
│  - users       (name, created_at)                │
│  - prizes      (name, tier, weight, stock, icon) │
│  - sessions    (user_id, attempts, results[])    │
│  - admin_users (username, password_hash)         │
│  - settings    (drop_rates, config)              │
└─────────────────────────────────────────────────┘
```

**Data flow:**
1. User enters name + attempts → `POST /api/game/register` → creates session
2. User clicks spin → `POST /api/game/spin` → server does weighted random, decrements stock, returns prize
3. After all attempts → `GET /api/game/session/:id/summary`
4. Admin login → `POST /api/admin/login` → JWT token
5. Admin adjusts rates → `PUT /api/admin/rates`

---

## Phase 2: Containerized Frontend/Backend (Docker Compose)

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                          │
│  ┌───────────────────┐    ┌───────────────────────────┐ │
│  │   frontend:3000   │    │     backend:4000          │ │
│  │   (nginx + React) │───▶│     (Node.js Express)     │ │
│  │                    │    │                           │ │
│  │  - User UI         │    │  - REST API              │ │
│  │  - Admin UI        │    │  - JWT Auth              │ │
│  │  - nginx proxy     │    │  - Game Logic            │ │
│  │    /api → backend  │    │  - Admin Logic           │ │
│  └───────────────────┘    └───────────┬───────────────┘ │
│                                        │                 │
│                           ┌────────────▼──────────────┐ │
│                           │     mongodb:27017         │ │
│                           │     (mongo:7 image)       │ │
│                           │     volume: mongo-data    │ │
│                           └───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Changes from Phase 1:**
- React build served by nginx (not Express)
- nginx reverse-proxies `/api/*` to backend container
- MongoDB runs in its own container with persistent volume
- Environment variables via `.env` file

---

## Phase 3: Microservices + Redis (Docker Compose)

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Docker Compose                              │
│                                                                      │
│  ┌──────────────┐                                                    │
│  │ frontend:3000│     nginx routes:                                  │
│  │ (nginx+React)│     /api/auth/*   → auth-service                   │
│  └──────┬───────┘     /api/game/*   → game-service                   │
│         │             /api/admin/*  → admin-service                   │
│         │             /api/prizes/* → prize-service                   │
│         ▼                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ auth-service │  │ game-service │  │admin-service │               │
│  │    :4001     │  │    :4002     │  │    :4003     │               │
│  │              │  │              │  │              │               │
│  │ - login      │  │ - register   │  │ - dashboard  │               │
│  │ - verify JWT │  │ - spin       │  │ - rates CRUD │               │
│  │ - user mgmt  │  │ - session    │  │ - inventory  │               │
│  └──────┬───────┘  │ - history    │  │ - history    │               │
│         │          └──────┬───────┘  └──────┬───────┘               │
│         │                 │                  │                        │
│  ┌──────┴─────────────────┴──────────────────┴──────┐               │
│  │              prize-service:4004                    │               │
│  │  - prize CRUD                                     │               │
│  │  - stock management                               │               │
│  │  - weighted random (authoritative)                │               │
│  └──────────────────────┬────────────────────────────┘               │
│                          │                                            │
│         ┌────────────────┼────────────────┐                          │
│         ▼                ▼                 ▼                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   MongoDB   │  │    Redis    │  │             │                 │
│  │   :27017    │  │   :6379     │  │             │                 │
│  │             │  │             │  │             │                 │
│  │ - all data  │  │ - sessions  │  │             │                 │
│  │             │  │ - rate cache│  │             │                 │
│  │             │  │ - live feed │  │             │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Changes from Phase 2:**
- Backend split into 4 microservices: auth, game, admin, prize
- Redis for session caching, rate config cache, real-time activity feed
- Each service has its own Dockerfile
- Inter-service communication via HTTP (internal Docker network)
- Prize-service is the single authority for stock + random logic

---

## Phase 4: Kubernetes + Observability

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     Istio Service Mesh                             │  │
│  │                                                                    │  │
│  │  ┌──────────┐  Istio   ┌──────────────┐  ┌──────────────┐        │  │
│  │  │ Ingress  │  Gateway │ frontend     │  │ auth-service │        │  │
│  │  │ Gateway  │─────────▶│ Deployment   │  │ Deployment   │        │  │
│  │  │          │          │ + Service    │  │ + Service    │        │  │
│  │  │          │          │ + HPA        │  │ + HPA        │        │  │
│  │  └──────────┘          └──────────────┘  └──────────────┘        │  │
│  │                                                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │ game-service │  │admin-service │  │prize-service │            │  │
│  │  │ Deployment   │  │ Deployment   │  │ Deployment   │            │  │
│  │  │ + Service    │  │ + Service    │  │ + Service    │            │  │
│  │  │ + HPA        │  │ + Service    │  │ + HPA        │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  │                                                                    │  │
│  │  Envoy sidecars on every pod → mTLS, traffic routing, telemetry   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────── Data Layer ────────────────────────────────┐  │
│  │  ┌──────────────┐  ┌──────────────┐                               │  │
│  │  │   MongoDB    │  │    Redis     │                               │  │
│  │  │  StatefulSet │  │  StatefulSet │                               │  │
│  │  │  + PVC       │  │  + PVC       │                               │  │
│  │  └──────────────┘  └──────────────┘                               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────── Observability Stack ───────────────────────────┐  │
│  │                                                                    │  │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐                     │  │
│  │  │  Kiali   │    │  Jaeger  │    │Prometheus│                     │  │
│  │  │  :20001  │    │  :16686  │    │  :9090   │                     │  │
│  │  │          │    │          │    │          │                     │  │
│  │  │ Service  │    │ Distrib. │    │ Metrics  │                     │  │
│  │  │ Mesh UI  │    │ Tracing  │    │ Collect  │                     │  │
│  │  └──────────┘    └──────────┘    └──────────┘                     │  │
│  │                                                                    │  │
│  │  ┌──────────┐                                                      │  │
│  │  │ Grafana  │    Dashboards: request rate, latency, error rate     │  │
│  │  │  :3000   │    per service, spin throughput, stock levels        │  │
│  │  └──────────┘                                                      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Changes from Phase 3:**
- Each service → K8s Deployment + Service + HPA (auto-scaling)
- Istio service mesh: mTLS between services, traffic management, canary deploys
- Jaeger: distributed tracing across all microservices
- Kiali: service mesh visualization and health monitoring
- Prometheus + Grafana: metrics collection and dashboards
- MongoDB & Redis as StatefulSets with PersistentVolumeClaims
- Istio Ingress Gateway replaces nginx reverse proxy

---

## Database Schema (All Phases)

```
users
├── _id: ObjectId
├── name: String
├── created_at: Date
└── sessions: [ObjectId → sessions]

sessions
├── _id: ObjectId
├── user_id: ObjectId → users
├── total_attempts: Number
├── results: [{
│     attempt: Number
│     prize_id: ObjectId → prizes
│     tier: String
│     timestamp: Date
│   }]
├── status: enum(active, completed)
└── created_at: Date

prizes
├── _id: ObjectId
├── name: String
├── description: String
├── tier: enum(common, rare, epic, legendary)
├── weight: Number (drop rate weight)
├── total_stock: Number
├── remaining_stock: Number
├── icon_key: String
└── active: Boolean

admin_users
├── _id: ObjectId
├── username: String (unique)
├── password_hash: String
└── created_at: Date

settings
├── _id: ObjectId
├── key: String (unique)
└── value: Mixed
```
