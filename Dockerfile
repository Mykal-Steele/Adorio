FROM oven/bun:1.3.11-alpine AS build-adorio
# cspell:ignore adorio VITE gemini newkey keyout nosniff

WORKDIR /adorio
# install deps before copying full source to keep layer cache valid
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# we keep these placeholders to avoid build-time hardcoding here
ENV VITE_BACKEND_URL=
ENV VITE_GEMINI_API_KEY=
RUN bun run build

FROM oven/bun:1.3.11-alpine AS build-ai-slop

WORKDIR /ai-slop
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
COPY ./ai-slop/AI-Slop-For-CAO-exam/package.json ./
COPY ./ai-slop/AI-Slop-For-CAO-exam/bun.lock ./
RUN bun install --frozen-lockfile
COPY ./ai-slop/AI-Slop-For-CAO-exam ./
RUN bun run build

# Frontend runtime target (nginx only)
FROM nginx:alpine AS frontend

RUN addgroup -S adorio && adduser -S -G adorio adorio

COPY --from=build-adorio --chown=adorio:adorio /adorio/dist /usr/share/nginx/html/
COPY --from=build-ai-slop --chown=adorio:adorio /ai-slop/dist /usr/share/nginx/html/cao/

ARG ENV=production
COPY nginx.${ENV}.conf /etc/nginx/nginx.conf

RUN mkdir -p /run/nginx /var/cache/nginx /var/log/nginx && \
  chown -R adorio:adorio /run/nginx /var/cache/nginx /var/log/nginx /etc/nginx /usr/share/nginx/html

EXPOSE 8080
USER adorio
CMD ["nginx", "-g", "daemon off;"]

# Backend runtime target (bun only)
FROM oven/bun:1.3.11-alpine AS backend

RUN addgroup -S adorio && adduser -S -G adorio adorio

COPY --chown=adorio:adorio ./backend /app
WORKDIR /app
RUN bun install --production --frozen-lockfile

ENV PORT=3000

EXPOSE 3000
USER adorio
CMD ["bun", "run", "start"]