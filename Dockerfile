FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl openssl-dev

# Устанавливаем зависимости
COPY front/package*.json ./
# Копируем prisma схему ДО npm ci, чтобы postinstall скрипт мог найти её
COPY front/prisma ./prisma
RUN npm ci

# Копируем остальные исходники фронта
COPY front ./

# Генерируем Prisma Client и собираем Next.js приложение
RUN npx prisma generate
RUN npm run build


FROM node:20-alpine AS runner

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl openssl-dev

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Копируем только то, что нужно для рантайма
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
# Копируем файлы данных (categories.json, colors.json, products.json)
COPY --from=builder /app/src/data ./src/data

# Внешний volume для SQLite-базы
RUN mkdir -p /app/prisma_data
VOLUME ["/app/prisma_data"]

# Создаём директорию для загрузок изображений
RUN mkdir -p /app/public/uploads/products
RUN mkdir -p /app/public/uploads/gallery
VOLUME ["/app/public/uploads"]

EXPOSE 3000

# Перед стартом накатываем миграции на внешнюю SQLite-базу и запускаем прод-сервер Next.js
CMD ["sh", "-c", "DATABASE_URL=\"file:./prisma_data/prod.db\" npx prisma migrate deploy && npm run start"]


