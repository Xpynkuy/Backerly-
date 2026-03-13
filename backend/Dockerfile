FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/


RUN npm ci


COPY . .


RUN npx prisma generate


RUN npm run build


FROM node:18-alpine

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma


RUN mkdir -p uploads

EXPOSE 5001


CMD npx prisma migrate deploy && node dist/index.js
