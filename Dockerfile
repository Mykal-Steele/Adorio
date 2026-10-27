# pinned by digest so BuildKit can skip the registry check on every stage when
# nothing changed. Bump it by hand (or with a renovate digest rule) for a new alpine patch.
FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS base

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

FROM base AS build-ai-slop

WORKDIR /ai-slop
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci
COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN npm run build

FROM base

RUN apk add --no-cache nginx

# Next.js standalone bundle (no node_modules needed at runtime)
COPY --from=build-nextjs /app/.next/standalone /nextjs
COPY --from=build-nextjs /app/.next/static /nextjs/.next/static
COPY --from=build-nextjs /app/public /nextjs/public

COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/

# package.json first so a backend code change doesn't bust the npm ci layer
COPY ./backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund
COPY ./backend /app/backend

ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production \
    BACKEND_INTERNAL_URL=http://localhost:3000

RUN printf '#!/bin/sh\nPORT=3000 node /app/backend/index.js &\nPORT=3001 HOSTNAME=0.0.0.0 node /nextjs/server.js &\nnginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

EXPOSE 8080
CMD ["/bin/sh", "/start.sh"]
