# =============================================================================
# CaskKeeper — üretim Dockerfile (multi-stage, Next.js standalone)
# =============================================================================

# ---- 1. Bağımlılıklar ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build sırasında DB'ye bağlanılmaz (tüm veri sayfaları force-dynamic);
# yine de modül yüklenirken env kontrolleri geçsin diye placeholder verilir.
ENV NEXT_TELEMETRY_DISABLED=1
ENV MONGODB_URI="mongodb://placeholder:27017/caskkeeper"
ENV JWT_SECRET="build-time-placeholder"
RUN npm run build

# ---- 3. Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Güvenlik: root olmayan kullanıcı
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
