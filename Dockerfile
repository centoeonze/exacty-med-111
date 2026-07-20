# EasyPanel / production — Express API + Vite SPA (dist/).
# Fix: copy server/prisma BEFORE npm ci (postinstall runs `prisma generate`).

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat python3 make g++

# --- install deps (layer-cached) ---
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
# Required before `npm ci --prefix server` because package.json postinstall = prisma generate
COPY server/prisma ./server/prisma

ENV DATABASE_URL="file:./prisma/cms.db"

RUN npm ci
RUN npm ci --prefix server

# --- app sources + frontend build ---
COPY . .

ENV NODE_ENV=production
RUN npm run build -- --mode production

WORKDIR /app/server
RUN npx prisma migrate deploy
WORKDIR /app

# --- runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./prisma/cms.db"

COPY package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

RUN mkdir -p /app/server/uploads /app/server/prisma

EXPOSE 3000

CMD ["npm", "run", "start:hostinger"]
