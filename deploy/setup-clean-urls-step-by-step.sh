#!/bin/bash
# Пошаговая настройка чистых URL для обоих проектов

set -e  # Остановка при ошибке

echo "=========================================="
echo "Настройка чистых URL для обоих проектов"
echo "=========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Шаг 1: Найти контейнер первого проекта
info "Шаг 1: Поиск контейнера первого проекта..."
FIRST_CONTAINER=$(docker ps --filter "publish=80" --format "{{.Names}}" | head -n 1)

if [ -z "$FIRST_CONTAINER" ]; then
    error "Не найден контейнер на порту 80!"
    exit 1
fi

info "Найден контейнер: $FIRST_CONTAINER"

# Шаг 2: Получить информацию о контейнере
info "Шаг 2: Получение информации о контейнере..."
CONTAINER_IMAGE=$(docker inspect $FIRST_CONTAINER --format '{{.Config.Image}}')
CONTAINER_PORTS=$(docker inspect $FIRST_CONTAINER --format '{{range .NetworkSettings.Ports}}{{.}}{{end}}')

info "Образ: $CONTAINER_IMAGE"
info "Порты: $CONTAINER_PORTS"

# Шаг 3: Остановить контейнер
warn "Шаг 3: Остановка контейнера $FIRST_CONTAINER..."
read -p "Продолжить? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Отменено пользователем"
    exit 1
fi

docker stop $FIRST_CONTAINER
info "Контейнер остановлен"

# Шаг 4: Проверить, что порт 80 свободен
info "Шаг 4: Проверка порта 80..."
if ss -tulpn | grep -q ":80 "; then
    error "Порт 80 всё ещё занят!"
    exit 1
fi
info "Порт 80 свободен"

# Шаг 5: Запустить контейнер на порту 8080
info "Шаг 5: Запуск контейнера на порту 8080..."
warn "ВНИМАНИЕ: Нужно знать внутренний порт контейнера!"
warn "Обычно это 80, но может быть другой (например, 3000, 8080)"
read -p "Внутренний порт контейнера (обычно 80): " INTERNAL_PORT
INTERNAL_PORT=${INTERNAL_PORT:-80}

docker start $FIRST_CONTAINER
# Удалить старый контейнер и создать новый с новым портом
docker stop $FIRST_CONTAINER
docker rm $FIRST_CONTAINER

# Запустить с новым портом
info "Запуск контейнера на порту 8080:$INTERNAL_PORT..."
docker run -d \
    --name $FIRST_CONTAINER \
    -p 8080:$INTERNAL_PORT \
    --restart unless-stopped \
    $CONTAINER_IMAGE

info "Контейнер запущен на порту 8080"

# Шаг 6: Настроить Nginx для первого проекта
info "Шаг 6: Настройка Nginx для первого проекта..."
read -p "Домен первого проекта (например, example.com): " FIRST_DOMAIN

cat > /etc/nginx/sites-available/first-project << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $FIRST_DOMAIN www.$FIRST_DOMAIN;

    access_log /var/log/nginx/first-project-access.log;
    error_log /var/log/nginx/first-project-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/first-project /etc/nginx/sites-enabled/
info "Конфигурация для первого проекта создана"

# Шаг 7: Настроить Nginx для rosebotanique.store
info "Шаг 7: Настройка Nginx для rosebotanique.store..."
cat > /etc/nginx/sites-available/rosebotanique.store << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;

    access_log /var/log/nginx/rosebotanique-access.log;
    error_log /var/log/nginx/rosebotanique-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/
info "Конфигурация для rosebotanique.store создана"

# Шаг 8: Проверить и запустить Nginx
info "Шаг 8: Проверка конфигурации Nginx..."
if nginx -t; then
    info "Конфигурация правильная"
    systemctl start nginx
    systemctl enable nginx
    info "Nginx запущен"
else
    error "Ошибка в конфигурации Nginx!"
    exit 1
fi

# Шаг 9: Настроить SSL
info "Шаг 9: Настройка SSL сертификатов..."
read -p "Настроить SSL сейчас? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt update
    apt install -y certbot python3-certbot-nginx
    
    info "Получение SSL сертификата для $FIRST_DOMAIN..."
    certbot --nginx -d $FIRST_DOMAIN -d www.$FIRST_DOMAIN --non-interactive --agree-tos --email admin@$FIRST_DOMAIN || warn "Не удалось получить сертификат для $FIRST_DOMAIN"
    
    info "Получение SSL сертификата для rosebotanique.store..."
    certbot --nginx -d rosebotanique.store -d www.rosebotanique.store --non-interactive --agree-tos --email admin@rosebotanique.store || warn "Не удалось получить сертификат для rosebotanique.store"
    
    info "SSL сертификаты настроены"
else
    warn "SSL не настроен. Можно настроить позже командой: certbot --nginx -d <домен>"
fi

# Шаг 10: Обновить переменные окружения
info "Шаг 10: Обновление переменных окружения..."
cd /opt/rosebotanique
if [ -f front/.env.production ]; then
    sed -i 's|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=https://rosebotanique.store|' front/.env.production
    docker restart rosebotanique
    info "Переменные окружения обновлены"
else
    warn "Файл .env.production не найден. Обнови вручную: NEXT_PUBLIC_BASE_URL=https://rosebotanique.store"
fi

echo ""
info "=========================================="
info "Настройка завершена!"
info "=========================================="
info "Первый проект: http://$FIRST_DOMAIN (или https:// если SSL настроен)"
info "Второй проект: http://rosebotanique.store (или https:// если SSL настроен)"
info ""
info "Проверь работу сайтов:"
info "  curl -I http://$FIRST_DOMAIN"
info "  curl -I http://rosebotanique.store"

