FROM node:20-alpine AS build-adorio
# cspell:ignore adorio VITE gemini newkey keyout nosniff

WORKDIR /adorio
# install deps before copying full source to keep layer cache valid
COPY package*.json ./
RUN npm ci

COPY . .
# we keep these placeholders to avoid build-time hardcoding here
ENV VITE_BACKEND_URL=
ENV VITE_GEMINI_API_KEY=
RUN npm run build

FROM node:20-alpine AS build-ai-slop

WORKDIR /ai-slop
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci
COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN npm run build

# Final runtime image
FROM node:20-alpine

# Nginx + openssl for static delivery + optional local cert fallback
RUN apk add --no-cache nginx openssl

# Deploy content into Nginx web root:
COPY --from=build-adorio /adorio/dist /usr/share/nginx/html/
COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/

# Backend service lives in /app
COPY ./backend /app
WORKDIR /app
RUN npm ci --only=production

# Use runtime nginx config path from `ENV` build arg
ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

# Prevent runtime failure when certs are not mounted (local / edge fallback)
RUN mkdir -p /etc/nginx/ssl && \
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/adorio.space.key \
    -out /etc/nginx/ssl/adorio.space.pem \
    -subj "/CN=localhost" \
    -days 3650

# backend listens on 3000 
ENV PORT=3000

# Start backend + nginx in same container 
RUN if [ "$ENV" = "production" ] || [ "$ENV" = "development" ]; then \
  echo 'npm start &' > /start.sh; \
  else \
  echo '' > /start.sh; \
  fi && \
  echo 'nginx -g "daemon off;"' >> /start.sh && \
  chmod +x /start.sh

EXPOSE 80 443
CMD ["/start.sh"]