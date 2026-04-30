# Stage 1: Build Next.js frontend
FROM node:20-alpine AS build-nextjs

WORKDIR /app
COPY package*.json ./
# Puppeteer is only used by integration tests; skip its Chrome download during the image build
ENV PUPPETEER_SKIP_DOWNLOAD=1
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BACKEND_INTERNAL_URL=http://localhost:3000
RUN npm run build

# Stage 2: Build AI-Slop
FROM node:20-alpine AS build-ai-slop

WORKDIR /ai-slop
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci
COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine

RUN apk add --no-cache nginx

# Next.js standalone bundle (no node_modules needed at runtime)
COPY --from=build-nextjs /app/.next/standalone /nextjs
COPY --from=build-nextjs /app/.next/static /nextjs/.next/static
COPY --from=build-nextjs /app/public /nextjs/public

# AI-Slop static files
COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/

# Express backend
COPY ./backend /app/backend
WORKDIR /app/backend
RUN npm ci --only=production

# Nginx config
ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production
ENV BACKEND_INTERNAL_URL=http://localhost:3000

RUN printf '#!/bin/sh\nPORT=3000 node /app/backend/index.js &\nPORT=3001 HOSTNAME=0.0.0.0 node /nextjs/server.js &\nnginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

EXPOSE 8080
CMD ["/bin/sh", "/start.sh"]