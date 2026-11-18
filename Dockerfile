FROM node:22-alpine

WORKDIR /app

# Зависимости ставятся отдельным слоем — быстрее пересборка.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Схема применяется на старте (db push безопасен и не удаляет данные).
CMD ["sh", "-c", "npx prisma db push && npm start"]
