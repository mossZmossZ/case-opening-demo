# ── Stage 1: Install production dependencies ──────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json .
# --omit=dev keeps only production deps — shrinks node_modules significantly
RUN npm install --omit=dev

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Copy only what the server needs to run
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json .

EXPOSE 4000

# Run as non-root user for security
USER node

CMD ["node", "src/index.js"]
