# Команды для обновления проекта на GitHub

## Репозиторий: https://github.com/Hamzatovix/rtbtnq

### Шаг 1: Настройка remote (если еще не настроен)
```bash
git remote add origin https://github.com/Hamzatovix/rtbtnq.git
```

Или если remote уже существует, обновить его:
```bash
git remote set-url origin https://github.com/Hamzatovix/rtbtnq.git
```

Проверить remote:
```bash
git remote -v
```

### Шаг 2: Добавить файлы проекта
```bash
# Добавить все файлы (с учетом .gitignore)
git add .

# Или добавить конкретные папки
git add front/
git add md/
git add scripts/
git add .gitignore
```

### Шаг 3: Создать коммит
```bash
git commit -m "Update: обновление проекта"
```

### Шаг 4: Отправить на GitHub

**Если это первый раз (ветка main на GitHub):**
```bash
git branch -M main
git push -u origin main
```

**Если ветка называется master:**
```bash
git push -u origin master
```

**Если репозиторий уже существует на GitHub:**
```bash
# Сначала получить изменения с GitHub
git pull origin main --allow-unrelated-histories

# Затем отправить свои изменения
git push -u origin main
```

---

## Полная последовательность команд (скопируйте и выполните):

```bash
# 1. Настроить remote
git remote add origin https://github.com/Hamzatovix/rtbtnq.git

# 2. Проверить remote
git remote -v

# 3. Добавить файлы
git add .

# 4. Создать коммит
git commit -m "Update: обновление проекта"

# 5. Переименовать ветку в main (если нужно)
git branch -M main

# 6. Отправить на GitHub
git push -u origin main
```

---

## Если возникнут конфликты:

```bash
# Получить изменения с GitHub
git pull origin main --allow-unrelated-histories

# Разрешить конфликты (если есть)
# Затем отправить
git push origin main
```

---

## Безопасный вариант (с резервной копией):

```bash
# 1. Создать резервную ветку
git branch backup-before-push

# 2. Настроить remote
git remote add origin https://github.com/Hamzatovix/rtbtnq.git

# 3. Добавить файлы
git add .

# 4. Создать коммит
git commit -m "Update: обновление проекта"

# 5. Отправить на GitHub
git push -u origin main

# Если что-то пошло не так, вернуться к резервной копии:
# git checkout backup-before-push
```

