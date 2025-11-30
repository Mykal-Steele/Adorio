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

COPY ./ai-slop/AI-Slop-For-CAO-exam/package*.json ./
RUN npm ci

COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build-adorio /adorio/dist /usr/share/nginx/html/
COPY --from=build-ai-slop /ai-slop/dist /usr/share/nginx/html/cao/
ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]