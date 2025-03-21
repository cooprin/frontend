FROM node:18-bullseye


# Налаштуємо робочу директорію в контейнері
WORKDIR /app

# Копіюємо файли package.json та package-lock.json
COPY package.json package-lock.json ./


# Копіюємо всі файли проєкту з локальної папки frontend в контейнер
COPY . .

# Оновлюємо систему та встановлюємо необхідні пакети
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 gcc g++ make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN npm install

# Встановлюємо Quasar CLI
RUN npm install -g @quasar/cli
RUN npm install axios pinia

# Відкриваємо порт
EXPOSE 9000

# Запуск Quasar
CMD ["quasar", "dev"]
