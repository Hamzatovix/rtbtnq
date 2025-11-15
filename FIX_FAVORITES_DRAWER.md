# Исправление проблемы с FavoritesDrawer на Vercel

## Проблема:
Vercel не может найти модуль `@/components/favorites/favorites-drawer`

## Временное решение:
Компонент временно закомментирован в `layout.tsx`, чтобы проект мог собраться.

## Постоянное решение:

### 1. Убедитесь, что файл существует и правильно экспортируется:

Файл `front/src/components/favorites/favorites-drawer.tsx` должен:
- Существовать в проекте
- Иметь `export default FavoritesDrawer` в конце файла
- Быть добавленным в Git

### 2. Добавьте файл в Git:

```powershell
# Перейти в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# Проверить статус файла
git status front/src/components/favorites/favorites-drawer.tsx

# Если файл не отслеживается, добавить его
git add front/src/components/favorites/favorites-drawer.tsx
git add front/src/components/favorites/index.ts
git add front/src/app/layout.tsx

# Проверить что добавлено
git status

# Закоммитить
git commit -m "Fix: добавление favorites-drawer в Git для Vercel"

# Отправить на GitHub
git push origin main
```

### 3. После успешного пуша, раскомментируйте компонент:

В файле `front/src/app/layout.tsx`:

```tsx
const FavoritesDrawer = dynamic(
  () => import('@/components/favorites/favorites-drawer'),
  { ssr: false, loading: () => null }
)

// И в JSX:
<FavoritesDrawer />
```

### 4. Проверьте на GitHub:

Убедитесь, что файл `front/src/components/favorites/favorites-drawer.tsx` действительно существует в репозитории на GitHub.

## Альтернативное решение:

Если проблема сохраняется, можно создать компонент заново с другим именем файла или использовать другой способ импорта.


