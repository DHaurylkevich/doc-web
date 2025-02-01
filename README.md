# MyLekarz API

Этот проект представляет собой backend API для веб-приложения MyLekarz, позволяющего клиентам записываться на прием к врачу.

## Технологии:

Проект использует следующие технологии и библиотеки:

- **Backend**:

  - Node.js
  - Express
  - PostgreSQL
  - Sequelize

- **Безопасность**:

  - bcrypt (хеширование паролей)
  - jsonwebtoken (JWT для аутентификации)
  - helmet (защита HTTP заголовков)
  - express-validator (валидация данных)
  - express-jwt (middleware для JWT)
  - express-session (управление сессиями)
  - passport (аутентификация)
  - passport-google-oauth20 (OAuth2 аутентификация через Google)
  - passport-local (локальная аутентификация)

- **Файловое хранилище**:

  - cloudinary (облачное хранилище для изображений)
  - multer (middleware для обработки multipart/form-data)
  - multer-storage-cloudinary (интеграция multer с Cloudinary)

- **Логирование**:

  - morgan
  - winston

- **Документация API**:

  - swagger-jsdoc (генерация документации Swagger)
  - swagger-ui-express (интерфейс Swagger UI)

- **Тестирование**:

  - mocha (тестовый фреймворк)
  - chai (библиотека утверждений)
  - chai-as-promised (утверждения для промисов)
  - supertest (тестирование HTTP)
  - faker
  - mochawesome

- **Другие**:
  - socket.io
  - express-socket.io-session
  - socket.io-client

## Установка

### 1. Клонируйте репозиторий:

```bash
    git clone https://github.com/DHaurylkevich/doc-web.git
    cd doc-web
```

### 2. Установите зависимости:

```bash
    npm install
```

### 3. Создайте файл .env и добавьте необходимые переменные окружения:

```
    DATABASE_URL=mysql://user:password@localhost:3306/mylekarz
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    SESSION_SECRET=your_session_secret
```

При первом включении, для синхронизации базы данных и моделей:

```
DB_SYNC=true
```

### 4. Запуск миграций базы данных:

    npx sequelize-cli db:migrate

### 5. Заполение базы данных:

    npx sequelize-cli db:seed:all

### 6. Запустить сервер

    npm start

## Тестирование

Для запуска тестов используйте команду:

    npm test

## Документация

    ### Документация для API
    http://localhost:3000/api-docs/

    ### Документация для тестов
    npx mocha testfile.js --reporter mochawesome
    Открыть файл mochawesome.html

## Структура проекта

    src/
    ├── config/        # Конфигурация
    ├── controllers/   # Контроллеры для обработки запросов
    ├── middleware/    # Промежуточные обработчики
    ├── models/        # Модели данных Sequelize
    ├── routes/        # Маршрутизация API
    ├── services/      # Бизнес-логика
    ├── socketHandlers # Обработчики WebSocket
    ├── utils/         # Вспомогательные утилиты
    tests/
    ├── integration/   # Интеграционные тесты
    ├── unit/          # Модульные тесты