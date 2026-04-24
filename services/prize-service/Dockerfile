FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json .
EXPOSE 4004
USER node
CMD ["node", "src/index.js"]
