# Ручное исправление доступа к бэк-офису

## Выполни эти команды на сервере:

```bash
# 1. Перейди в директорию проекта
cd /opt/rosebotanique

# 2. Сгенерируй правильный хеш для пароля RoseBot2024!
cd front
node -e "console.log(require('bcryptjs').hashSync('RoseBot2024!', 10))"
```

**Скопируй полученный хеш!** Он будет выглядеть примерно так:
```
$2b$10$Ex0xi5EKce2dULLmluenFu53fIdTxe49nlFGoQvuK/Dk5X.aWMLze
```

---

```bash
# 3. Отредактируй .env.production
cd ..
nano front/.env.production
```

**В файле найди или добавь строки:**
```env
ADMIN_USERNAME=rosebotanique
ADMIN_PASSWORD_HASH=вставь_сюда_скопированный_хеш
```

**Сохрани:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

```bash
# 4. Перезапусти контейнер
docker restart rosebotanique

# 5. Подожди 5 секунд
sleep 5

# 6. Проверь работу логина
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rosebotanique","password":"RoseBot2024!"}'
```

**Ожидаемый результат:**
```json
{"success":true,"user":{"username":"rosebotanique"}}
```

---

## Готово! 

Теперь можешь войти в бэк-офис:
- URL: `http://176.57.213.174:3000/backoffice/login`
- Логин: `rosebotanique`
- Пароль: `RoseBot2024!`

