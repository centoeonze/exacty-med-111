# EasyPanel / production — Express API + Vite SPA (dist/).
# Copy server/prisma BEFORE npm ci (postinstall = prisma generate).

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat python3 make g++

COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY server/prisma ./server/prisma

ENV DATABASE_URL="file:./prisma/cms.db"

RUN npm ci
RUN npm ci --prefix server

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

# EasyPanel often passes secrets as build-args — promote to runtime ENV.
ARG CMS_USERNAME
ARG CMS_PASSWORD
ARG CMS_SESSION_SECRET
ENV CMS_USERNAME=$CMS_USERNAME
ENV CMS_PASSWORD=$CMS_PASSWORD
ENV CMS_SESSION_SECRET=$CMS_SESSION_SECRET

COPY package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

RUN mkdir -p /app/server/uploads /app/server/prisma

EXPOSE 3000

CMD ["npm", "run", "start:hostinger"]
