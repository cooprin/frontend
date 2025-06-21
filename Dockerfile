FROM node:18-bullseye

# Аргумент для типу збірки
ARG BUILD_MODE=production

# Налаштуємо робочу директорію в контейнері
WORKDIR /app

# Копіюємо файли package.json та package-lock.json
COPY package.json package-lock.json ./

# Оновлюємо систему та встановлюємо необхідні пакети
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 gcc g++ make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо залежності
RUN npm install

# Встановлюємо Quasar CLI
RUN npm install -g @quasar/cli
RUN npm install axios pinia

# Копіюємо всі файли проєкту
COPY . .

# Умовна збірка залежно від BUILD_MODE
RUN if [ "$BUILD_MODE" = "production" ] ; then \
        echo "Building for production..." && \
        quasar build && \
        npm install -g serve ; \
    else \
        echo "Development mode - no build needed" ; \
    fi

# Відкриваємо порт
EXPOSE 9000

# Умовний запуск залежно від BUILD_MODE
CMD if [ "$BUILD_MODE" = "production" ] ; then \
        echo "Starting production server..." && \
        serve -s dist/spa -l 9000 ; \
    else \
        echo "Starting development server..." && \
        quasar dev --host 0.0.0.0 ; \
    fi