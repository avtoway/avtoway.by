FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Схема нужна уже на этапе npm ci: postinstall запускает prisma generate.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN mkdir -p data \
  && DATABASE_URL=file:./data/build.db npx prisma db push \
  && DATABASE_URL=file:./data/build.db npm run build

ENV NODE_ENV=production

# Приложение работает не от root; запись нужна только в data, backups и uploads.
RUN addgroup -S nodejs \
  && adduser -S nextjs -G nodejs \
  && mkdir -p /app/data /app/backups /app/public/uploads \
  && chown -R nextjs:nodejs /app/data /app/backups /app/public/uploads

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

# Схема применяется на старте (db push безопасен и не удаляет данные).
CMD ["sh", "-c", "npx prisma db push && npm start"]
