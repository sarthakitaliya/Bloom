FROM node:20 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY ./apps/ws-server ./apps/ws-server
COPY packages ./packages

RUN pnpm install

WORKDIR /app/packages/db
RUN pnpm run generate

WORKDIR /app

RUN pnpm run build

EXPOSE 4000
CMD ["node", "./apps/ws-server/dist/src/index.js"]