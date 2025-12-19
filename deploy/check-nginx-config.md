# Проверка конфигурации Nginx для rosebotanique.store

## Проблема
Nginx отвечает, но проксирование на порт 3000 не работает (возвращается статический HTML).

## Что проверить

### 1. Проверь, что конфигурация добавлена в контейнер

```bash
# Посмотри конфигурацию внутри контейнера
docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf | grep -A 20 "rosebotanique"
```

### 2. Проверь, как конфигурация монтируется

```bash
# Посмотри полную информацию о монтировании
docker inspect shtrafnett_nginx | grep -A 20 "Mounts"
```

### 3. Проверь доступность контейнера rosebotanique

```bash
# Проверь, доступен ли порт 3000 из контейнера nginx
docker exec shtrafnett_nginx wget -O- http://172.17.0.1:3000 2>&1 | head -20

# Или проверь IP контейнера rosebotanique
docker inspect rosebotanique | grep IPAddress
```

### 4. Проверь логи Nginx

```bash
# Посмотри логи ошибок
docker exec shtrafnett_nginx tail -20 /var/log/nginx/error.log
```

---

## Возможные проблемы

1. **Конфигурация не монтируется** - файл `/root/Shtraf/nginx/nginx.conf` не подключен к контейнеру
2. **Неправильный адрес proxy_pass** - контейнеры в разных сетях
3. **Конфигурация не применена** - нужно перезапустить контейнер, а не только reload

---

## Решение

Скорее всего, конфигурация находится в `/etc/nginx/conf.d/default.conf` внутри контейнера, а не в `/etc/nginx/nginx.conf`.

Проверь:
```bash
docker exec shtrafnett_nginx ls -la /etc/nginx/conf.d/
docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf
```

