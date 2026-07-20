# Stage 1 - Dependencies
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Stage 2 - Runtime
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .


EXPOSE 5000

CMD ["node", "server.js"]