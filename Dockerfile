# Multi-stage Dockerfile для Quasar додатка

# =============================================================================
# STAGE 1: Builder stage (збірка додатка)
# =============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments (передаються з CI/CD)
ARG VUE_APP_API_URL=https://erp.cooprin.com.ua/api
ARG VUE_APP_CORS_ORIGIN=https://erp.cooprin.com.ua

# Встановлюємо системні залежності для Alpine
RUN apk add --no-cache python3 make g++ git

# Копіюємо весь код СПОЧАТКУ
COPY . .

# Встановлюємо залежності (тепер quasar prepare буде працювати)
RUN npm install --no-audit --no-fund

# Встановлюємо Quasar CLI
RUN npm install -g @quasar/cli

# Встановлюємо environment змінні з build arguments
ENV VUE_APP_API_URL=$VUE_APP_API_URL
ENV VUE_APP_CORS_ORIGIN=$VUE_APP_CORS_ORIGIN

# Збираємо для production з правильними environment змінними
RUN quasar build

# =============================================================================
# STAGE 2: Production stage (nginx + статичні файли)
# =============================================================================
FROM nginx:alpine AS production

# Копіюємо зібрані файли
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Копіюємо nginx конфігурацію
COPY nginx.conf /etc/nginx/nginx.conf

# Відкриваємо порт
EXPOSE 80

# Запускаємо nginx
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# STAGE 3: Development stage (ТОЧНО ЯК У ТВОЄМУ ОРИГІНАЛЬНОМУ DOCKERFILE)
# =============================================================================
FROM node:18-bullseye AS development

# Налаштуємо робочу директорію в контейнері
WORKDIR /app

# Копіюємо файли package.json та package-lock.json
COPY package.json package-lock.json ./

# Копіюємо всі файли проєкту
COPY . .

# Оновлюємо систему та встановлюємо необхідні пакети
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 gcc g++ make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо залежності
RUN npm install

# Встановлюємо Quasar CLI
RUN npm install -g @quasar/cli

# Відкриваємо порт
EXPOSE 9000

# Запуск dev сервера
CMD ["quasar", "dev", "--host", "0.0.0.0"]