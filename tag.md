# Tagging & Release Guide

## One-time setup — Docker Hub secrets

Add these two secrets to your GitHub repository  
(**Settings → Secrets and variables → Actions → New repository secret**):

| Secret name         | Value                                    |
|---------------------|------------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username                |
| `DOCKERHUB_TOKEN`    | Docker Hub access token (not password)  |

Generate a Docker Hub token at:  
**hub.docker.com → Account Settings → Personal access tokens → Generate new token**

---

## How to tag a version and trigger a release

```bash
# 1. Make sure everything is committed and pushed
git add .
git commit -m "chore: release v1.0.0"
git push origin main

# 2. Create an annotated tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. Push the tag — this triggers the GitHub Actions workflow
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build `client` and `server` Docker images
- Push to Docker Hub with three tags:
  - `1.0.0` (exact version)
  - `1.0`   (major.minor)
  - `latest`

Images will be available at:
```
docker.io/<your-username>/case-opening-demo-client:1.0.0
docker.io/<your-username>/case-opening-demo-server:1.0.0
```

---

## Version numbering convention

Follow **Semantic Versioning** (semver.org):

```
v<MAJOR>.<MINOR>.<PATCH>
```

| Change type                        | Bump        | Example                    |
|------------------------------------|-------------|----------------------------|
| Breaking change / major redesign   | MAJOR       | `v1.0.0` → `v2.0.0`       |
| New feature, backward-compatible   | MINOR       | `v1.0.0` → `v1.1.0`       |
| Bug fix, patch, minor UI tweak     | PATCH       | `v1.0.0` → `v1.0.1`       |

---

## Run with Docker Compose (local build)

```bash
# Build images locally and start all services
docker compose up --build -d

# Seed the database (first run only)
./init-db.sh

# View logs
docker compose logs -f

# Stop
docker compose down
```

App is available at **http://localhost:8080**

---

## Run with Docker Compose (production — pull from Docker Hub)

```bash
# 1. Create your prod env file from the example
cp .env.prod.example .env.prod

# 2. Edit .env.prod — set DOCKERHUB_USERNAME, IMAGE_TAG, JWT_SECRET
#    Example:
#      DOCKERHUB_USERNAME=myusername
#      IMAGE_TAG=1.0.0
#      JWT_SECRET=super-secret-random-string

# 3. Pull images and start
docker compose -f docker-compose-prod.yml --env-file .env.prod up -d

# 4. Seed the database (first run only)
docker compose -f docker-compose-prod.yml --env-file .env.prod exec server node src/seed.js

# 5. View logs
docker compose -f docker-compose-prod.yml --env-file .env.prod logs -f

# 6. Stop
docker compose -f docker-compose-prod.yml --env-file .env.prod down
```

App is available at **http://localhost:8080**

### Deploy a specific version tag

```bash
# Edit .env.prod: IMAGE_TAG=1.2.0
# Then restart
docker compose -f docker-compose-prod.yml --env-file .env.prod up -d
```

---

## Delete a tag (if you tagged by mistake)

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```
