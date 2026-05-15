# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — dependency installation
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Only copy manifests first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci --only=production

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Next.js build (includes devDependencies)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Set NEXT_DIST_DIR so the build output lands in a predictable location
ENV NEXT_DIST_DIR=.next-build
ENV NODE_ENV=production

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — backend runtime image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS backend

# Chromium/Puppeteer dependencies for whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Tell Puppeteer to skip downloading its own Chrome — use the system one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

WORKDIR /app

# Production deps only
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server/ ./server/
COPY .env.example ./.env.example

# Runtime data directory (sessions, settings, messages persist here via a volume)
RUN mkdir -p /app/server/data /app/logs

EXPOSE 3001

# dumb-init forwards signals properly (important for SIGTERM graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4 — frontend runtime image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend

ENV NODE_ENV=production \
    NEXT_DIST_DIR=.next-build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next-build ./.next-build
COPY --from=builder /app/public ./public
COPY package.json next.config.js jsconfig.json ./
COPY app/ ./app/
COPY components/ ./components/
COPY lib/ ./lib/

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "node_modules/.bin/next", "start"]
