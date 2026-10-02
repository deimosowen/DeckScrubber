# syntax=docker/dockerfile:1

# ---- build: клиент (vite) и сервер (webpack) -> /app/dist
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix client && npm ci --prefix server

COPY client ./client
COPY server ./server
# Клиент ходит на API того же origin, где его отдаёт сервер
ENV VITE_BACKEND="" VITE_APP_NAME="DeckScrubber"
RUN npm run build

# ---- runtime
FROM node:22-alpine
WORKDIR /app
# docker CLI + compose-плагин управляют докером хоста через смонтированный сокет
RUN apk add --no-cache docker-cli docker-cli-compose tar

COPY --from=build /app/dist ./

ENV NODE_ENV=production PORT=3000 IS_SUDO=false
EXPOSE 3000
CMD ["node", "server.bundle.js"]
