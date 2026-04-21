# Phase 3: Microservices + Redis (Docker Compose)

## Goal
Backend split into 4 independent services with Redis for caching and real-time features.

## Services

| Service | Port | Responsibility |
|---------|------|---------------|
| `auth-service` | 4001 | Login, JWT issue/verify, user CRUD |
| `game-service` | 4002 | Session management, spin orchestration, user history |
| `admin-service` | 4003 | Dashboard stats, rate management, inventory view |
| `prize-service` | 4004 | Prize CRUD, stock management, weighted random engine |

## Structure
```
case-opening-demo/
├── client/                  # Same as Phase 2
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── game-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── admin-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── prize-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── shared/              # Common middleware, error handler, logger
│       └── package.json
├── docker-compose.yml
└── nginx.conf               # Routes to all 4 services
```

## nginx Routing
```
/api/auth/*   → auth-service:4001
/api/game/*   → game-service:4002
/api/admin/*  → admin-service:4003
/api/prizes/* → prize-service:4004
```

## Redis Usage

| Key Pattern | Purpose | TTL |
|------------|---------|-----|
| `session:{id}` | Active game session cache | 30 min |
| `rates:current` | Cached drop rates | Until admin update |
| `prizes:active` | Cached active prize list | 5 min |
| `feed:recent` | Last 50 opens (Redis List) | None (capped) |

## Inter-Service Calls
```
game-service → prize-service: POST /internal/spin (resolve weighted random)
game-service → auth-service: POST /internal/verify (validate user token)
admin-service → prize-service: PUT /internal/prizes/:id (update stock/rates)
admin-service → auth-service: POST /internal/verify (validate admin JWT)
```

Internal routes prefixed with `/internal/` — only accessible within Docker network.

## docker-compose.yml
```yaml
services:
  frontend:
    build: ./client
    ports: ["3000:80"]

  auth-service:
    build: ./services/auth-service
    environment: [MONGO_URI, JWT_SECRET, REDIS_URL]

  game-service:
    build: ./services/game-service
    environment: [MONGO_URI, REDIS_URL, PRIZE_SERVICE_URL]

  admin-service:
    build: ./services/admin-service
    environment: [MONGO_URI, REDIS_URL, AUTH_SERVICE_URL, PRIZE_SERVICE_URL]

  prize-service:
    build: ./services/prize-service
    environment: [MONGO_URI, REDIS_URL]

  mongodb:
    image: mongo:7
    volumes: [mongo-data:/data/db]

  redis:
    image: redis:7-alpine
    volumes: [redis-data:/data]
```

## Done When
- [ ] `docker compose up` starts 7 containers
- [ ] Full user flow works through microservice chain
- [ ] Redis caching reduces MongoDB reads (verify with logs)
- [ ] Admin rate change invalidates Redis cache
- [ ] Live activity feed updates in real-time via Redis
- [ ] Services communicate only through defined API contracts
