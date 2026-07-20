# EasyPanel / production — single Node service: Express API + Vite SPA (dist/).
# Do NOT use nginx-only static image: /api/* must hit Express.

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat python3 make g++

# Frontend deps
COPY package.json package-lock.json ./
RUN npm ci

# Backend deps
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server

COPY . .

# Bake storage/auth=api from .env.production (Vite define)
ENV NODE_ENV=production
RUN npm run build -- --mode production

# Prisma client + schema migrate (SQLite file created under server/prisma)
ENV DATABASE_URL="file:./prisma/cms.db"
WORKDIR /app/server
RUN npx prisma generate && npx prisma migrate deploy
WORKDIR /app

# --- runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
# EasyPanel injects PORT; default for local docker run
ENV PORT=3000
ENV DATABASE_URL="file:./prisma/cms.db"

COPY package.json package-lock.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Ensure uploads dir exists (persist via EasyPanel volume if needed)
RUN mkdir -p /app/server/uploads /app/server/prisma

EXPOSE 3000

# Express listens on 0.0.0.0:$PORT and serves dist/ + /api/*
CMD ["npm", "run", "start:hostinger"]
