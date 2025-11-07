# syntax=docker/dockerfile:1

# ---------- Base ----------
FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml* .npmrc* ./
# Install deps (respecting pnpm lockfile). Approve builds for native deps.
RUN pnpm install --frozen-lockfile --prefer-offline && pnpm approve-builds <<EOF
true
EOF

# ---------- Build ----------
FROM deps AS build
COPY . .
RUN pnpm run build

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["pnpm", "start", "--", "-p", "3000"]

