# Backoffice Authentication System

## Обзор

Система аутентификации для backoffice использует JWT (JSON Web Tokens) и хранит токен только в HTTP-only cookie. Клиентская часть полагается на cookie и не взаимодействует напрямую с токеном.

## API Endpoints

### POST `/api/auth/login`
Вход в систему.

**Request Body:**
```json
{
  "username": "rosebotanique",
  "password": "RoseBot2024!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "rosebotanique"
  }
}
```

### POST `/api/auth/logout`
Выход из системы. Удаляет токен из cookie.

### GET `/api/auth/verify`
Проверяет валидность текущего токена.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "username": "rosebotanique"
  }
}
```

## Страница логина

### `/backoffice/login`
Страница входа в систему. Реализована как клиентский компонент с формой логина.

**Особенности:**
- Автоматическая проверка авторизации при загрузке
- Перенаправление на `/backoffice` после успешного входа
- Работа только с HTTP-only cookie (без localStorage)
- Обработка ошибок и отображение сообщений

## Middleware

### `middleware.ts`
Next.js middleware для защиты маршрутов backoffice.

**Функциональность:**
- Проверяет наличие и валидность токена в cookies
- Перенаправляет неавторизованных пользователей на `/backoffice/login`
- Исключает публичные маршруты (`/backoffice/login`, `/api/auth/*`, `/api/catalog`)

## Layout Integration

### `/backoffice/layout.tsx`
Главный layout для всех страниц backoffice.

**Функциональность:**
- Проверяет авторизацию при загрузке
- Отображает загрузку во время проверки
- Перенаправляет на `/backoffice/login` если не авторизован
- Не отображает layout на странице логина

## Безопасность

### Хранение токенов
- **HTTP-only cookies**: Используются для серверной проверки через middleware и API
- **Authorization header**: Опционально поддерживается для совместимости

### Пароли
Пароли хешируются с помощью `bcryptjs` перед сохранением.

### JWT Secret
В продакшене обязательно измените `JWT_SECRET` в переменных окружения:
```env
JWT_SECRET=your-very-secure-random-secret-key
```

### Учетные данные администратора
Для production задайте хешированный пароль и логин в переменных окружения:
```env
ADMIN_USERNAME=your-admin
ADMIN_PASSWORD_HASH=$2b$10$...
```
> Хеш можно получить командой `node -e "console.log(require('bcryptjs').hashSync('Пароль', 10))"`

## Учетные данные по умолчанию

**Логин:** `rosebotanique`  
**Пароль:** `RoseBot2024!`

⚠️ **Важно:** В продакшене обязательно измените эти учетные данные и используйте базу данных для хранения пользователей.

## Использование

1. Перейдите на `/backoffice/login`
2. Введите логин и пароль
3. После успешного входа вы будете перенаправлены на `/backoffice`
4. Все маршруты `/backoffice/*` (кроме `/backoffice/login`) защищены middleware

## Отладка

Если возникают проблемы с входом:

1. Проверьте консоль браузера на наличие ошибок
2. Проверьте, что cookie `auth-token` устанавливается в браузере
3. Убедитесь, что `JWT_SECRET` одинаковый на сервере и в middleware
4. Очистите cookies для `localhost`

