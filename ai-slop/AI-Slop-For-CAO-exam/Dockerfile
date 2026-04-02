# Build stage
FROM oven/bun:1.3.11-alpine AS build

WORKDIR /app
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

COPY ./ai-slop/AI-Slop-For-CAO-exam/package.json ./
COPY ./ai-slop/AI-Slop-For-CAO-exam/bun.lock ./
RUN bun install --frozen-lockfile

COPY ./ai-slop/AI-Slop-For-CAO-exam/ ./
RUN bun run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]