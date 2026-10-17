# Build stage
FROM node:24-alpine AS build

WORKDIR /app

COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci

# Injected as a build arg (docker-compose passes it from the root .env) instead
# of copying .env.development into the image, so no secrets file ever lands in a
# build layer.
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/ ./
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]