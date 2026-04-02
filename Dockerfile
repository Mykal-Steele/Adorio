# Build stage for Adorio
FROM node:20-alpine AS build-adorio

WORKDIR /adorio

COPY package*.json ./
RUN npm ci

COPY . .
ENV VITE_BACKEND_URL=
ENV VITE_GEMINI_API_KEY=
RUN npm run build

# Build stage for AI-Slop
FROM node:20-alpine AS build-ai-slop

WORKDIR /ai-slop

ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci

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

COPY --from=build-adorio /adorio/dist /usr/share/nginx/html/
COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/

WORKDIR /app
COPY ./backend ./
COPY --from=backend-deps /app/node_modules ./node_modules

ARG ENV=northflank
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

ENV PORT=3000

RUN printf '%s\n' '#!/bin/sh' 'set -e' 'npm start &' 'exec nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]