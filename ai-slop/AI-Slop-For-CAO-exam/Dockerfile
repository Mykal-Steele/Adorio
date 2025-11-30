# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci

COPY ./ai-slop/AI-Slop-For-CAO-exam/ ./
COPY .env.development ./
RUN cp .env.development .env 2>/dev/null || echo "No .env.development"
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]