# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG AUTH_SECRET
ARG ADMIN_USERNAME
ARG ADMIN_PASSWORD

ENV AUTH_SECRET=${AUTH_SECRET}
ENV ADMIN_USERNAME=${ADMIN_USERNAME}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory
RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV CONFIG_PATH="/data/config.json"
ENV UPLOAD_DIR="/data/uploads"

CMD ["node", "server.js"]
