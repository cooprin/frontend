# Multi-stage Dockerfile для Quasar додатка

# =============================================================================
# STAGE 1: Builder stage (збірка додатка)
# =============================================================================
FROM node:18-bullseye AS builder

WORKDIR /app

# Встановлюємо системні залежності для збірки
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        gcc \
        g++ \
        make \
        git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо package файли для кешування шарів
COPY package.json package-lock.json ./

# Встановлюємо залежності
RUN npm install

# Встановлюємо Quasar CLI глобально
RUN npm install -g @quasar/cli

# Копіюємо весь код проєкту
COPY . .

# Збираємо додаток для продакшену
RUN quasar build

# =============================================================================
# STAGE 2: Production stage (nginx + статичні файли)
# =============================================================================
FROM nginx:alpine AS production

# Копіюємо зібрані файли з builder stage
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Копіюємо конфігурацію nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Відкриваємо порт
EXPOSE 80

# Запускаємо nginx
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# STAGE 3: Development stage (повний код + dev server)
# =============================================================================
FROM node:18-bullseye AS development

WORKDIR /app

# Встановлюємо системні залежності
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        gcc \
        g++ \
        make \
        git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо package файли
COPY package.json package-lock.json ./

# Встановлюємо залежності
RUN npm install

# Встановлюємо Quasar CLI
RUN npm install -g @quasar/cli

# Копіюємо весь код (для development потрібен повний код)
COPY . .

# Відкриваємо порт для dev сервера
EXPOSE 9000

# Запускаємо dev сервер з hot reload
CMD ["quasar", "dev", "--host", "0.0.0.0"]