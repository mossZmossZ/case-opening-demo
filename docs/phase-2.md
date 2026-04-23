# Phase 2: Docker Compose — Frontend + Backend + DB

## Goal
Same application from Phase 1, fully containerized and runnable with a single `docker compose up`.

## Structure Changes
```
case-opening-demo/
├── client/
│   ├── Dockerfile           # Multi-stage: build React → serve via nginx
│   └── nginx.conf           # Serve static + proxy /api/* → backend:4000
├── server/
│   └── Dockerfile           # Node.js production image
├── docker-compose.yml       # Production
├── docker-compose.dev.yml   # Dev overrides (hot reload)
└── .env
```

## Dockerfiles

### client/Dockerfile
```
Stage 1: node:20-alpine → npm ci && npm run build
Stage 2: nginx:alpine → copy build/ to /usr/share/nginx/html + copy nginx.conf
```

### server/Dockerfile
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY src/ ./src/
CMD ["node", "src/index.js"]
```

### nginx.conf Key Rules
```
location / → try_files (React SPA fallback)
location /api/ → proxy_pass http://backend:4000
```

## docker-compose.yml
```yaml
services:
  frontend:
    build: ./client
    ports: ["3000:80"]
    depends_on: [backend]

  backend:
    build: ./server
    ports: ["4000:4000"]
    environment:
      MONGO_URI: mongodb://mongodb:27017/zenith
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [mongodb]

  mongodb:
    image: mongo:7
    volumes: [mongo-data:/data/db]
    ports: ["27017:27017"]

volumes:
  mongo-data:
```

## Dev Overrides (docker-compose.dev.yml)
- Mount `./client/src` into frontend container for hot reload
- Mount `./server/src` into backend with nodemon
- Expose debug ports

## Health Check
- `GET /api/health` → `{ status: "ok", db: "connected" }`

## Done When
- [x] `docker compose up --build` starts all 3 services
- [x] App accessible at `http://localhost:8080` (port adjusted to 8080 in final impl)
- [x] API proxied correctly through nginx (`/api/` → `backend:4000`)
- [x] MongoDB data persists across restarts (volume)
- [x] CI/CD: GitHub Actions builds + pushes images to Docker Hub on `main`
- [x] `docker-compose-prod.yml` — pulls from Docker Hub, MongoDB not exposed externally
- [x] External reverse proxy handles SSL termination (not in compose)

## Notes
- Dev hot-reload compose (`docker-compose.dev.yml`) was not implemented — local dev uses `npm run dev` monolith (Phase 1 flow) instead.
