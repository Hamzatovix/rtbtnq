# Команды для обновления Git репозитория

## Базовые команды для обновления репозитория:

### 1. Проверка текущего статуса
```bash
git status
```

### 2. Инициализация репозитория (если еще не инициализирован)
```bash
git init
```

### 3. Настройка remote репозитория
```bash
# Добавить remote (если еще не добавлен)
git remote add origin https://github.com/Hamzatovix/rtbtnq.git

# Или обновить существующий remote
git remote set-url origin https://github.com/Hamzatovix/rtbtnq.git

# Проверить remote
git remote -v
```

### 4. Добавление файлов
```bash
# Добавить все файлы (с учетом .gitignore)
git add .

# Или добавить конкретные файлы
git add front/
git add *.md
```

### 5. Создание коммита
```bash
git commit -m "Описание изменений"
```

### 6. Отправка на GitHub
```bash
# Первая отправка (создание ветки на GitHub)
git push -u origin master

# Или если ветка называется main
git push -u origin main

# Последующие отправки (после первого push -u)
git push
```

## Полная последовательность команд (первый раз):

```bash
# 1. Инициализация (если нужно)
git init

# 2. Настройка remote
git remote add origin https://github.com/Hamzatovix/rtbtnq.git

# 3. Добавление файлов
git add .

# 4. Коммит
git commit -m "Initial commit"

# 5. Отправка на GitHub
git push -u origin master
```

## Для последующих обновлений:

```bash
# 1. Добавить изменения
git add .

# 2. Создать коммит
git commit -m "Update: описание изменений"

# 3. Отправить на GitHub
git push
```

## Полезные команды:

```bash
# Посмотреть историю коммитов
git log

# Посмотреть изменения в файлах
git diff

# Посмотреть какие файлы будут добавлены
git status

# Отменить изменения в файле (до git add)
git checkout -- имя_файла

# Отменить добавление файла (после git add, до commit)
git reset HEAD имя_файла

# Изменить последний коммит (если еще не отправили)
git commit --amend -m "Новое сообщение"

# Посмотреть текущую ветку
git branch

# Создать новую ветку
git checkout -b новая_ветка

# Переключиться на ветку
git checkout имя_ветки
```

## Если нужно обновить существующий репозиторий:

```bash
# Получить изменения с GitHub
git pull origin master

# Или
git fetch origin
git merge origin/master
```






