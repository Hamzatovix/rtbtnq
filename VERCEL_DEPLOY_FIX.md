# Исправление ошибки деплоя на Vercel

## Проблема:
```
Module not found: Can't resolve '@/components/favorites/favorites-drawer'
```

## Решение:

### 1. Убедитесь, что файл существует и правильно экспортируется

Файл `front/src/components/favorites/favorites-drawer.tsx` должен:
- Существовать в проекте
- Иметь `export default FavoritesDrawer` в конце файла
- Быть добавленным в Git

### 2. Проверьте, что файл добавлен в Git:

```powershell
# Перейти в папку проекта
cd "C:\Users\mansm\OneDrive\Рабочий стол\rsbtq — upd"

# Проверить статус файла
git status front/src/components/favorites/favorites-drawer.tsx

# Если файл не отслеживается, добавить его
git add front/src/components/favorites/favorites-drawer.tsx
git add front/src/components/favorites/index.ts
git add front/src/app/layout.tsx

# Закоммитить
git commit -m "Fix: добавление favorites-drawer для Vercel"

# Отправить на GitHub
git push origin main
```

### 3. Альтернативное решение - временно закомментировать компонент:

Если проблема сохраняется, можно временно закомментировать использование `FavoritesDrawer` в `layout.tsx`:

```tsx
// const FavoritesDrawer = dynamic(
//   () => import('@/components/favorites/favorites-drawer'),
//   { ssr: false, loading: () => null }
// )

// И в JSX:
// <FavoritesDrawer />
```

### 4. Проверьте структуру файлов:

Убедитесь, что структура папок правильная:
```
front/
  src/
    components/
      favorites/
        favorites-drawer.tsx  ← должен существовать
        index.ts              ← опционально
```

### 5. Проверьте настройки TypeScript/Webpack:

Убедитесь, что в `tsconfig.json` правильно настроены пути:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## После исправления:

1. Закоммитьте все изменения
2. Отправьте на GitHub
3. Vercel автоматически пересоберёт проект
4. Проверьте логи сборки на Vercel


