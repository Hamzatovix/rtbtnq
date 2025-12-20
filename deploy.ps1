# PowerShell скрипт для обновления проекта на сервере
# Использование: .\deploy.ps1 [quick|full]

param(
    [Parameter(Position=0)]
    [ValidateSet("quick", "full")]
    [string]$Mode = "full"
)

$ServerIP = "176.57.213.174"
$ServerUser = "root"
$ProjectPath = "/opt/rosebotanique"

Write-Host "🚀 Обновление проекта rosebotanique на сервере" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Режим: $Mode" -ForegroundColor Yellow
Write-Host "Сервер: $ServerUser@$ServerIP" -ForegroundColor Yellow
Write-Host ""

if ($Mode -eq "quick") {
    Write-Host "⚡ Быстрое обновление (без пересборки образа)" -ForegroundColor Green
    Write-Host ""
    
    $commands = @"
cd $ProjectPath
git pull
docker restart rosebotanique
sleep 5
docker ps | grep rosebotanique
docker logs rosebotanique --tail 30
"@
} else {
    Write-Host "🔨 Полное обновление (с пересборкой образа)" -ForegroundColor Green
    Write-Host ""
    
    $commands = @"
cd $ProjectPath
git pull
docker stop rosebotanique 2>/dev/null || true
docker rm rosebotanique 2>/dev/null || true
docker build -t rosebotanique:prod .
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  -p 3000:3000 \
  --restart unless-stopped \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod
sleep 10
docker ps | grep rosebotanique
docker logs rosebotanique --tail 30
"@
}

Write-Host "Подключение к серверу..." -ForegroundColor Yellow
Write-Host ""

# Выполнение команд на сервере
ssh "${ServerUser}@${ServerIP}" $commands

Write-Host ""
Write-Host "✅ Обновление завершено!" -ForegroundColor Green

