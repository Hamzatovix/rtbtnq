# Команды для добавления всех файлов из папки front

Выполните эти команды в PowerShell в папке проекта:

```powershell
# Перейти в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# Проверить текущий статус
git status

# Добавить все файлы из папки front (включая изменения)
git add front/

# Проверить что будет добавлено
git status

# Если есть изменения, создать коммит
git commit -m "Update: обновление папки front со всеми файлами"

# Отправить на GitHub
git push origin main
```

## Если нужно принудительно добавить все файлы:

```powershell
# Удалить из индекса (но не из файловой системы)
git rm -r --cached front/

# Добавить заново все файлы из front
git add front/

# Проверить статус
git status

# Создать коммит
git commit -m "Update: полное обновление папки front"

# Отправить на GitHub
git push origin main
```

## Проверка что файлы добавлены:

```powershell
# Посмотреть какие файлы из front отслеживаются Git
git ls-files front/ | Select-Object -First 20

# Посмотреть последний коммит
git log --oneline -1

# Посмотреть что изменилось в последнем коммите
git show --name-only HEAD
```

