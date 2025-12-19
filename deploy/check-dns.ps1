# Скрипт для проверки DNS-записей rosebotanique.store (PowerShell)

Write-Host "🔍 Проверка DNS-записей для rosebotanique.store" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$DOMAIN = "rosebotanique.store"
$EXPECTED_IP = "176.57.213.174"

# Функция проверки DNS
function Check-DNS {
    param(
        [string]$Hostname,
        [string]$ExpectedIP
    )
    
    Write-Host "Проверка: $Hostname" -ForegroundColor Yellow
    Write-Host "Ожидаемый IP: $ExpectedIP"
    
    try {
        $Result = Resolve-DnsName -Name $Hostname -Type A -ErrorAction Stop | Where-Object { $_.Type -eq "A" } | Select-Object -First 1 -ExpandProperty IPAddress
        
        if ($null -eq $Result) {
            Write-Host "❌ DNS-запись не найдена или ещё не распространилась" -ForegroundColor Red
            Write-Host ""
            return $false
        }
        
        Write-Host "Текущий IP: $Result"
        
        if ($Result -eq $ExpectedIP) {
            Write-Host "✅ DNS настроен правильно!" -ForegroundColor Green
            Write-Host ""
            return $true
        } else {
            Write-Host "❌ DNS указывает на другой IP: $Result" -ForegroundColor Red
            Write-Host "⚠️  Ожидается: $ExpectedIP" -ForegroundColor Yellow
            Write-Host ""
            return $false
        }
    } catch {
        Write-Host "❌ Ошибка при проверке DNS: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Проверка основной записи
Write-Host "1️⃣  Проверка основной записи (@):" -ForegroundColor Cyan
$MAIN_OK = Check-DNS -Hostname $DOMAIN -ExpectedIP $EXPECTED_IP

# Проверка www-поддомена
Write-Host "2️⃣  Проверка www-поддомена:" -ForegroundColor Cyan
$WWW_OK = Check-DNS -Hostname "www.$DOMAIN" -ExpectedIP $EXPECTED_IP

# Итоговый результат
Write-Host "================================================" -ForegroundColor Cyan
if ($MAIN_OK -and $WWW_OK) {
    Write-Host "✅ Все DNS-записи настроены правильно!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Получи SSL-сертификат через Certbot"
    Write-Host "2. Обнови NEXT_PUBLIC_BASE_URL в .env.production"
    Write-Host "3. Перезапусти контейнер rosebotanique"
} else {
    Write-Host "⚠️  Некоторые DNS-записи ещё не настроены или не распространились" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Что делать:" -ForegroundColor Yellow
    Write-Host "1. Проверь настройки DNS в панели REG.RU"
    Write-Host "2. Подожди 15-60 минут для распространения DNS"
    Write-Host "3. Проверь через онлайн-сервис: https://dnschecker.org/"
    Write-Host ""
    Write-Host "Очистка кэша DNS на этом компьютере:" -ForegroundColor Cyan
    Write-Host "ipconfig /flushdns" -ForegroundColor Gray
}

