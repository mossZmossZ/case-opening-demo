#!/bin/bash
# init-db.sh — Seeds the MongoDB database with prizes and admin user.
# Run this ONCE after `docker compose up --build -d` on a fresh install.
#
# Usage:
#   chmod +x init-db.sh
#   ./init-db.sh

set -e

echo ""
echo "==> Zenith Case Opening — Database Init"
echo ""

# ── 1. Check that Docker Compose services are running ────────────────────────
if ! docker compose ps --services --filter "status=running" | grep -q "mongodb"; then
  echo "ERROR: MongoDB is not running."
  echo "  Start services first: docker compose up --build -d"
  exit 1
fi

if ! docker compose ps --services --filter "status=running" | grep -q "server"; then
  echo "ERROR: Server is not running."
  echo "  Start services first: docker compose up --build -d"
  exit 1
fi

# ── 2. Wait for MongoDB to be healthy ────────────────────────────────────────
echo "--> Waiting for MongoDB to be ready..."
until docker compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; do
  echo "    MongoDB not ready — retrying in 2s..."
  sleep 2
done
echo "    MongoDB is ready."

# ── 3. Wait for the server to be responsive ──────────────────────────────────
echo "--> Waiting for server to be ready..."
until docker compose exec -T server node -e "process.exit(0)" > /dev/null 2>&1; do
  echo "    Server not ready — retrying in 2s..."
  sleep 2
done
echo "    Server is ready."

# ── 4. Run the seed script ───────────────────────────────────────────────────
echo "--> Running seed script..."
docker compose exec -T server node src/seed.js

echo ""
echo "==> Database initialized successfully!"
echo ""
echo "    Admin login: admin / zenith"
echo "    App:         http://localhost"
echo "    API:         http://localhost:4000"
echo ""
