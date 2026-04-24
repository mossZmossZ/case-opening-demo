#!/bin/bash
# init-db.sh — Seeds the MongoDB databases for Phase 3 microservices.
# Run this ONCE after `docker compose up --build -d` on a fresh install.
#
# Auth-service auto-seeds the admin user on startup, so this script
# only needs to seed prize data via prize-service.
#
# Usage:
#   chmod +x init-db.sh
#   ./init-db.sh

set -e

echo ""
echo "==> Zenith Case Opening — Database Init (Phase 3)"
echo ""

# ── 1. Check that Docker Compose services are running ────────────────────────
for svc in mongodb redis auth-service game-service prize-service admin-service; do
  if ! docker compose ps --services --filter "status=running" | grep -q "$svc"; then
    echo "ERROR: $svc is not running."
    echo "  Start services first: docker compose up --build -d"
    exit 1
  fi
done

# ── 2. Wait for MongoDB to be healthy ────────────────────────────────────────
echo "--> Waiting for MongoDB to be ready..."
until docker compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; do
  echo "    MongoDB not ready — retrying in 2s..."
  sleep 2
done
echo "    MongoDB is ready."

# ── 3. Seed prize data ───────────────────────────────────────────────────────
echo "--> Seeding prize data via prize-service..."
docker compose exec -T prize-service node src/seed.js

# ── 4. Seed admin user (auth-service auto-seeds, but run explicitly for fresh DB) ──
echo "--> Seeding admin user via auth-service..."
docker compose exec -T auth-service node src/seed.js

echo ""
echo "==> Database initialized successfully!"
echo ""
echo "    Admin login: admin / zenith"
echo "    App:         http://localhost:8080"
echo ""
