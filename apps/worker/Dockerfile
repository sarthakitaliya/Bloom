FROM node:20 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY ./apps/worker ./apps/worker
COPY packages ./packages

RUN pnpm install

WORKDIR /app/packages/db
RUN pnpm run generate

WORKDIR /app

RUN pnpm run build

# No EXPOSE needed - worker is a background process
CMD ["node", "./apps/worker/dist/src/index.js"]