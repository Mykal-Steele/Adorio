FROM oven/bun:1.3.11-alpine AS build-adorio

WORKDIR /adorio
# install deps before copying full source to keep layer cache valid
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# we keep these placeholders to avoid build-time hardcoding here
ENV VITE_BACKEND_URL=
ENV VITE_GEMINI_API_KEY=
RUN bun run build

FROM oven/bun:1.3.11-alpine AS build-ai-slop

WORKDIR /ai-slop
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/package.json ./
COPY ./ai-slop/AI-Slop-For-CAO-exam/bun.lock ./
RUN bun install --frozen-lockfile
COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN npm run build

# Install backend dependencies once and reuse in runtime image
FROM node:20-alpine AS backend-deps

WORKDIR /app
COPY ./backend/package*.json ./
RUN npm ci --only=production

# Final runtime image (frontend + backend)
FROM node:20-alpine AS runtime

RUN apk add --no-cache nginx

RUN addgroup -S adorio && adduser -S -G adorio adorio

WORKDIR /app
COPY ./backend ./
COPY --from=backend-deps /app/node_modules ./node_modules

COPY nginx.northflank.conf /etc/nginx/nginx.conf

ENV PORT=3000

RUN printf '%s\n' '#!/bin/sh' 'set -e' 'npm start &' 'exec nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

EXPOSE 8080

EXPOSE 3000
USER adorio
CMD ["bun", "run", "start"]