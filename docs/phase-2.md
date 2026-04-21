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
- [ ] `docker compose up --build` starts all 3 services
- [ ] App accessible at `http://localhost:3000`
- [ ] API proxied correctly through nginx
- [ ] MongoDB data persists across restarts (volume)
- [ ] Dev mode: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` with hot reload
