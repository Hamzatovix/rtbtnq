# Команды для добавления оставшихся файлов

Выполните эти команды в PowerShell в папке проекта:

```powershell
# Перейти в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# Добавить оставшиеся папки и файлы
git add md/
git add scripts/
git add GIT_SETUP_INSTRUCTIONS.md

# Проверить что будет добавлено
git status

# Создать коммит
git commit -m "Update: добавление документации и скриптов"

# Отправить на GitHub
git push origin main
```

Если папка md/ или scripts/ не найдена, добавьте только то, что есть:
```powershell
git add .
git status
git commit -m "Update: добавление всех файлов проекта"
git push origin main
```

