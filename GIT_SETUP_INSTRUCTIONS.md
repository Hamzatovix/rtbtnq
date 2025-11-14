# Инструкция по настройке Git репозитория

## ⚠️ Проблема
Git репозиторий находится в неправильной директории (в домашней папке пользователя).

## ✅ Решение

### Вариант 1: Правильная настройка (рекомендуется)

1. **Откройте PowerShell в папке проекта:**
   ```
   cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"
   ```

2. **Удалите неправильный репозиторий (если есть):**
   ```powershell
   Remove-Item -Path "C:\Users\mansm\.git" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Инициализируйте репозиторий в правильной директории:**
   ```powershell
   cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"
   git init
   ```

4. **Настройте Git (если еще не настроено):**
   ```powershell
   git config --global user.name "Hamzatovix"
   git config --global user.email "mansurhamzatovich@gmail.com"
   ```

5. **Добавьте remote репозиторий:**
   ```powershell
   git remote add origin https://github.com/Hamzatovix/rtbtnq.git
   ```

6. **Получите изменения с GitHub:**
   ```powershell
   git pull origin main --allow-unrelated-histories
   ```

7. **Добавьте файлы проекта:**
   ```powershell
   git add front/
   git add .gitignore
   git add GIT_UPDATE_COMMANDS.md
   ```

8. **Создайте коммит:**
   ```powershell
   git commit -m "Update: обновление проекта"
   ```

9. **Отправьте на GitHub:**
   ```powershell
   git push origin main
   ```

---

### Вариант 2: Быстрое решение (если репозиторий уже настроен)

Если репозиторий уже настроен, но есть конфликты:

```powershell
# 1. Перейдите в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# 2. Временно переименуйте конфликтующие файлы
Rename-Item "front\package.json" "package.json.tmp"
Rename-Item "front\package-lock.json" "package-lock.json.tmp"

# 3. Получите изменения с GitHub
git pull origin main --allow-unrelated-histories

# 4. Верните ваши файлы (если нужно)
Rename-Item "front\package.json.tmp" "package.json" -Force
Rename-Item "front\package-lock.json.tmp" "package-lock.json" -Force

# 5. Добавьте изменения
git add front/
git add .gitignore

# 6. Создайте коммит
git commit -m "Update: обновление проекта"

# 7. Отправьте на GitHub
git push origin main
```

---

## 📋 Полная последовательность команд (скопируйте и выполните):

```powershell
# Перейти в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# Инициализировать репозиторий (если нужно)
git init

# Настроить remote
git remote add origin https://github.com/Hamzatovix/rtbtnq.git

# Получить изменения с GitHub
git pull origin main --allow-unrelated-histories

# Добавить файлы проекта
git add front/
git add .gitignore
git add GIT_UPDATE_COMMANDS.md

# Создать коммит
git commit -m "Update: обновление проекта"

# Отправить на GitHub
git push origin main
```

---

## 🔄 Если нужно откатить изменения:

```powershell
# Откатить последний коммит (если еще не отправили)
git reset --hard HEAD~1

# Или вернуться к версии на GitHub
git reset --hard origin/main
```

