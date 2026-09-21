# Base pinned by digest (not just the `24-alpine` tag) so Docker/BuildKit
# can skip the registry pull-check on all three stages when nothing local
# has changed, instead of hitting the registry every build to confirm the
# tag still points at the same image. Bump this manually (or via a
# Dependabot/renovate digest-update rule) when picking up a new alpine patch.
FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS base

# Stage 1: Build Next.js frontend
FROM base AS build-nextjs

WORKDIR /app
COPY package*.json ./
# Puppeteer is only used by integration tests; skip its Chrome download during the image build
ENV PUPPETEER_SKIP_DOWNLOAD=1
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    BACKEND_INTERNAL_URL=http://localhost:3000
RUN npm run build

# Stage 2: Build AI-Slop
FROM base AS build-ai-slop

WORKDIR /ai-slop
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci
COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN npm run build

# Stage 3: Production runtime
FROM base

RUN apk add --no-cache nginx

# Next.js standalone bundle (no node_modules needed at runtime)
COPY --from=build-nextjs /app/.next/standalone /nextjs
COPY --from=build-nextjs /app/.next/static /nextjs/.next/static
COPY --from=build-nextjs /app/public /nextjs/public

# AI-Slop static files
COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/

# Express backend — manifest first so an unrelated backend source edit
# (no dependency change) doesn't bust the `npm ci` layer cache the way
# copying the whole `./backend` tree before installing did.
COPY ./backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund
COPY ./backend /app/backend

# Nginx config
ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production \
    BACKEND_INTERNAL_URL=http://localhost:3000

RUN printf '#!/bin/sh\nPORT=3000 node /app/backend/index.js &\nPORT=3001 HOSTNAME=0.0.0.0 node /nextjs/server.js &\nnginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

EXPOSE 8080
CMD ["/bin/sh", "/start.sh"]
