# Команды для полного обновления проекта на GitHub

## Выполните команды по порядку в PowerShell:

```powershell
# 1. Перейти в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# 2. Проверить текущий статус
git status

# 3. Получить последние изменения с GitHub (если есть)
git pull origin main

# 4. Добавить все файлы проекта (с учетом .gitignore)
git add .

# 5. Проверить что будет добавлено
git status

# 6. Создать коммит
git commit -m "Update: полное обновление проекта"

# 7. Отправить на GitHub
git push origin main
```

---

## Если возникнут конфликты при pull:

```powershell
# Вместо обычного pull используйте:
git pull origin main --allow-unrelated-histories

# Затем продолжите с шага 4
```

---

## Если нужно принудительно обновить front:

```powershell
# Удалить front из индекса (файлы останутся на диске)
git rm -r --cached front/

# Добавить заново
git add front/

# Продолжить с шага 5
```

---

## Проверка после отправки:

```powershell
# Посмотреть последние коммиты
git log --oneline -5

# Посмотреть что было отправлено
git show --stat HEAD

# Проверить что все файлы отслеживаются
git ls-files | Measure-Object -Line
```

---

## Если что-то пошло не так - откат:

```powershell
# Откатить последний коммит (если еще не отправили)
git reset --hard HEAD~1

# Или вернуться к версии на GitHub
git reset --hard origin/main
```

