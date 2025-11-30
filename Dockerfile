# Build stage for Adorio
FROM node:18-alpine AS build-adorio

WORKDIR /adorio

COPY package*.json ./
RUN npm ci

COPY . .
RUN rm -f .env.production
ENV VITE_BACKEND_URL=
RUN npm run build

# Build stage for AI-Slop
FROM node:18-alpine AS build-ai-slop

WORKDIR /ai-slop

ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci

COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN cp .env.development .env 2>/dev/null || echo "No .env.development"
RUN npm run build

# Production stage
FROM node:18-alpine

# Install nginx
RUN apk add --no-cache nginx

COPY --from=build-adorio /adorio/dist /usr/share/nginx/html/
COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/

# Copy backend
COPY ./backend /app
WORKDIR /app
RUN npm ci --only=production

# Copy nginx config
ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

# Set backend port
ENV PORT=3000

# Create start script
RUN if [ "$ENV" = "production" ] || [ "$ENV" = "local" ]; then \
      echo 'npm start &' > /start.sh; \
    else \
      echo '' > /start.sh; \
    fi && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]