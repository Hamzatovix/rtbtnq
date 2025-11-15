# 🌙 Rosebotanique Store - Dark Mode Design System
## Система дизайна темной темы

---

## 📋 Содержание

1. [Философия темной темы](#философия-темной-темы)
2. [Цветовая палитра](#цветовая-палитра)
3. [Адаптация компонентов](#адаптация-компонентов)
4. [Тени и эффекты](#тени-и-эффекты)
5. [Типографика](#типографика)
6. [Фоновые текстуры](#фоновые-текстуры)
7. [Анимации и переходы](#анимации-и-переходы)
8. [Рекомендации по реализации](#рекомендации-по-реализации)
9. [Примеры использования](#примеры-использования)

---

## 🎯 Философия темной темы

### Концепция

Темная тема Rosebotanique Store сохраняет **природную минималистичность** и **теплоту** бренда, адаптируя их для темного окружения. Это не просто инверсия цветов — это переосмысление палитры с сохранением духа бренда.

### Принципы

1. **Теплая темнота** — избегаем холодных синих оттенков, используем глубокие теплые тона
2. **Мягкий контраст** — достаточный для читаемости, но не резкий для глаз
3. **Органичность** — природные оттенки земли, коры, мха
4. **Элегантность** — сохраняем изысканность светлой темы
5. **Единство** — темная тема должна ощущаться как естественное продолжение светлой

### Цветовая температура

- **Базовая температура**: Теплая (2700K-3000K)
- **Доминирующие оттенки**: Коричневые, бежевые, оливковые, глубокие серые
- **Акценты**: Приглушенные зеленые, теплые бежевые

---

## 🎨 Цветовая палитра

### Основные брендовые цвета (Dark Mode)

#### **Deep Earth** (Глубокая земля)
- **HEX**: `#1a1815`
- **RGB**: `26, 24, 21`
- **HSL**: `30, 11%, 9%`
- **Использование**: Основной фон страниц
- **CSS переменная**: `--background-dark: 30 11% 9%`
- **Соответствие светлой теме**: Замена Linen White

#### **Warm Charcoal** (Теплый уголь)
- **HEX**: `#2a2723`
- **RGB**: `42, 39, 35`
- **HSL**: `30, 9%, 15%`
- **Использование**: Карточки, контейнеры, вторичные фоны
- **CSS переменная**: `--card-dark: 30 9% 15%`
- **Соответствие светлой теме**: Замена Rose Beige

#### **Moss Shadow** (Тень мха)
- **HEX**: `#3a3834`
- **RGB**: `58, 56, 52`
- **HSL**: `40, 5%, 22%`
- **Использование**: Границы, разделители, неактивные элементы
- **CSS переменная**: `--border-dark: 40 5% 22%`
- **Соответствие светлой теме**: Замена Mist Gray

#### **Sage Glow** (Свечение шалфея)
- **HEX**: `#8fa68f`
- **RGB**: `143, 166, 143`
- **HSL**: `120, 10%, 61%`
- **Использование**: Акцентные элементы, кнопки, интерактивные состояния
- **CSS переменная**: `--sageTint-dark: 120 10% 61%`
- **Соответствие светлой теме**: Адаптация Sage Tint

#### **Moonlit Glow** (Лунное свечение) - доработанный
- **HEX**: `#F0EBE4`
- **RGB**: `240, 235, 228`
- **HSL**: `35, 18%, 91%`
- **Использование**: Основной текст, заголовки
- **CSS переменная**: `--foreground: 35 18% 91%`
- **Соответствие светлой теме**: Замена Ink Soft
- **Особенности**: Более яркий и гармоничный с Moonlit Linen кнопками

### Семантические цвета (Dark Mode)

#### Системные переменные

```css
.dark {
  /* Основные фоны */
  --background: 30 11% 9%;           /* Deep Earth */
  --foreground: 35 18% 91%;          /* Moonlit Glow - доработанный лунный свет текста */
  
  /* Карточки и контейнеры */
  --card: 30 9% 15%;                 /* Warm Charcoal */
  --card-foreground: 35 18% 91%;     /* Moonlit Glow */
  --popover: 30 9% 15%;              /* Warm Charcoal */
  --popover-foreground: 35 18% 91%;   /* Moonlit Glow */
  
  /* Акценты */
  --primary: 35 18% 62%;             /* Moonlit Linen - доработанный лунный свет (более светлый и серебристый) */
  --primary-foreground: 35 18% 91%;   /* Moonlit Glow */
  --secondary: 40 5% 22%;             /* Moss Shadow */
  --secondary-foreground: 35 18% 91%; /* Moonlit Glow */
  
  /* Приглушенные элементы */
  --muted: 40 5% 22%;                 /* Moss Shadow */
  --muted-foreground: 35 12% 68%;     /* Приглушенный текст - доработанный */
  --accent: 40 5% 22%;                /* Moss Shadow */
  --accent-foreground: 35 18% 91%;    /* Moonlit Glow */
  
  /* Границы и инпуты */
  --border: 40 5% 22%;                /* Moss Shadow */
  --input: 40 5% 22%;                 /* Moss Shadow */
  
  /* Фокус и кольца */
  --ring: 35 18% 62%;                 /* Moonlit Linen - доработанный */
  
  /* Деструктивные действия */
  --destructive: 0 65% 50%;           /* Приглушенный красный */
  --destructive-foreground: 35 18% 91%; /* Moonlit Glow */
}
```

### Брендовые цвета (Dark Mode адаптация)

```css
.dark {
  /* Адаптация брендовых цветов */
  --roseBeige-dark: 30 9% 15%;        /* Warm Charcoal */
  --mistGray-dark: 40 5% 22%;         /* Moss Shadow */
  --linenWhite-dark: 30 11% 9%;      /* Deep Earth */
  --sageTint-dark: 120 10% 61%;      /* Sage Glow */
  --inkSoft-dark: 35 15% 89%;        /* Linen Glow */
}
```

### Применение цветов в Tailwind (Dark Mode)

```css
/* Прямое использование с dark: префиксом */
dark:bg-background      /* Deep Earth */
dark:text-foreground    /* Linen Glow */
dark:bg-card            /* Warm Charcoal */
dark:border-border      /* Moss Shadow */
dark:text-primary        /* Приглушенный зеленый */

/* Брендовые цвета с адаптацией */
dark:bg-roseBeige-dark
dark:text-sageTint-dark
dark:border-mistGray-dark

/* С прозрачностью */
dark:bg-sageTint-dark/10      /* 10% прозрачности */
dark:border-mistGray-dark/40  /* 40% прозрачности */
dark:text-inkSoft-dark/70     /* 70% прозрачности */
```

---

## 🧩 Адаптация компонентов

### Кнопки (Dark Mode)

#### **Primary Button**
```css
.dark .btn-primary {
  background-color: hsl(var(--primary));        /* 35 18% 62% - Moonlit Linen (доработанный) */
  color: hsl(var(--primary-foreground));        /* Linen Glow */
  border-color: hsl(var(--border));             /* Moss Shadow */
}

.dark .btn-primary:hover {
  background-color: hsl(35 18% 67%);            /* Светлее на hover */
  border-color: hsl(35 18% 67%);                /* Moonlit Linen */
}
```

#### **Ghost Button**
```css
.dark .btn-ghost {
  color: hsl(var(--foreground));                /* Linen Glow */
  background-color: transparent;
}

.dark .btn-ghost:hover {
  background-color: hsl(var(--muted) / 0.3);     /* Moss Shadow с прозрачностью */
}
```

#### **Outline Button**
```css
.dark .btn-outline {
  color: hsl(var(--foreground));                /* Linen Glow */
  border-color: hsl(var(--border));            /* Moss Shadow */
  background-color: transparent;
}

.dark .btn-outline:hover {
  background-color: hsl(var(--muted) / 0.2);     /* Легкий фон */
  border-color: hsl(var(--sageTint-dark));      /* Sage Glow */
}
```

### Карточки (Dark Mode)

```css
.dark .card {
  background-color: hsl(var(--card));           /* Warm Charcoal */
  border-color: hsl(var(--border));             /* Moss Shadow */
  color: hsl(var(--card-foreground));           /* Linen Glow */
}

.dark .card:hover {
  border-color: hsl(var(--border) / 0.6);       /* Более заметная граница */
  box-shadow: var(--shadow-dark-soft);           /* Мягкая тень */
}
```

### Input поля (Dark Mode)

```css
.dark input,
.dark textarea,
.dark select {
  background-color: hsl(var(--background));      /* Deep Earth */
  border-color: hsl(var(--input));              /* Moss Shadow */
  color: hsl(var(--foreground));                /* Linen Glow */
}

.dark input:focus,
.dark textarea:focus,
.dark select:focus {
  border-color: hsl(var(--ring));               /* Приглушенный зеленый */
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3); /* Мягкое свечение */
}
```

### Header (Dark Mode)

```css
.dark header {
  background-color: hsl(var(--background) / 0.8); /* Deep Earth с прозрачностью */
  backdrop-filter: blur(12px);
  border-bottom-color: hsl(var(--border));      /* Moss Shadow */
}
```

---

## 🌓 Тени и эффекты

### Тени для темной темы

#### **Soft Shadow Dark** (Мягкая тень)
```css
--soft-shadow-dark: 0 4px 20px rgba(0, 0, 0, 0.4);
/* Применение */
.dark .shadow-soft-dark
```
- **Использование**: Карточки, легкие элементы
- **Принцип**: Более интенсивные тени для создания глубины

#### **Medium Shadow Dark** (Средняя тень)
```css
--medium-shadow-dark: 0 8px 30px rgba(0, 0, 0, 0.5);
/* Применение */
.dark .shadow-medium-dark
```
- **Использование**: Hover состояния, выпадающие меню
- **Принцип**: Усиленная глубина для интерактивных элементов

#### **Warm Shadow Dark** (Теплая тень)
```css
--warm-shadow-dark: 0 6px 25px rgba(143, 166, 143, 0.15);
/* Применение */
.dark .shadow-warm-dark
```
- **Использование**: Акцентные элементы, badges
- **Принцип**: Теплое зеленоватое свечение вместо бежевого

#### **Breathing Shadow Dark** (Дышащая тень)
```css
--breathing-shadow-dark: 0 6px 20px rgba(0, 0, 0, 0.3);
/* Применение */
.dark .shadow-breathing-dark
```
- **Использование**: Общие карточки, контейнеры
- **Принцип**: Мягкая глубина без резкости

#### **Glow Shadow Dark** (Свечение)
```css
--glow-shadow-dark: 0 0 20px rgba(143, 166, 143, 0.2);
/* Применение */
.dark .shadow-glow-dark
```
- **Использование**: Активные элементы, фокусные состояния
- **Принцип**: Мягкое свечение вокруг элементов

### Применение теней

```css
/* Карточки продуктов */
.dark .product-card {
  box-shadow: var(--soft-shadow-dark);
}

.dark .product-card:hover {
  box-shadow: var(--medium-shadow-dark);
}

/* Кнопки */
.dark .btn-primary {
  box-shadow: var(--breathing-shadow-dark);
}

.dark .btn-primary:focus {
  box-shadow: var(--glow-shadow-dark);
}

/* Badges */
.dark .badge {
  box-shadow: var(--warm-shadow-dark);
}
```

---

## ✍️ Типографика

### Контрастность текста

#### Основной текст
```css
.dark {
  --foreground: 35 15% 89%;  /* Linen Glow */
  /* Контрастность: 12.5:1 (WCAG AAA) */
}
```

#### Приглушенный текст
```css
.dark .text-muted {
  color: hsl(35 10% 65%);     /* Приглушенный Linen Glow */
  /* Контрастность: 7:1 (WCAG AA) */
}
```

#### Text Whisper (Dark Mode)
```css
.dark .text-whisper {
  color: hsl(35 10% 60%);     /* Еще более приглушенный */
  /* Контрастность: 5.5:1 (WCAG AA для крупного текста) */
}
```

### Адаптация типографических утилит

```css
/* Text Graceful - без изменений, работает в обеих темах */
.text-graceful {
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.02em;
  font-weight: 400;
}

/* Text Whisper - адаптация для темной темы */
.dark .text-whisper {
  color: hsl(35 10% 60%);  /* Вместо rgba(75, 75, 75, 0.6) */
}
```

---

## 🎨 Фоновые текстуры

### Адаптация фоновых градиентов

#### **bg-texture-dark** (Текстурный фон)
```css
.dark .bg-texture-dark {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(143, 166, 143, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(58, 56, 52, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(42, 39, 35, 0.1) 0%, transparent 50%);
}
```
- **Принцип**: Используем темные оттенки с легким зеленоватым свечением

#### **bg-linen-dark** (Льняной фон)
```css
.dark .bg-linen-dark {
  background-image: 
    radial-gradient(circle at 30% 70%, rgba(143, 166, 143, 0.1) 0%, transparent 60%),
    radial-gradient(circle at 70% 30%, rgba(58, 56, 52, 0.15) 0%, transparent 60%);
}
```

#### **bg-misty-dark** (Туманный фон)
```css
.dark .bg-misty-dark {
  background-image: 
    radial-gradient(circle at 25% 75%, rgba(143, 166, 143, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 75% 25%, rgba(58, 56, 52, 0.18) 0%, transparent 50%);
}
```

### Backdrop эффекты

#### **backdrop-breathing-dark**
```css
.dark .backdrop-breathing-dark {
  backdrop-filter: blur(12px);
  background: rgba(26, 24, 21, 0.7);  /* Deep Earth с прозрачностью */
}
```

#### **backdrop-misty-dark**
```css
.dark .backdrop-misty-dark {
  backdrop-filter: blur(16px);
  background: rgba(26, 24, 21, 0.8);  /* Более непрозрачный */
}
```

### Halo эффект (Dark Mode)

```css
.dark .halo {
  background: radial-gradient(
    closest-side,
    rgba(143, 166, 143, 0.18),      /* Sage Glow */
    rgba(143, 166, 143, 0.10) 60%,  /* Приглушенное свечение */
    transparent 70%
  );
}
```

### Veil Bottom (Dark Mode)

```css
.dark .veil-bottom {
  background: linear-gradient(
    to top, 
    rgba(255, 255, 255, 0.04),      /* Легкое белое свечение */
    rgba(255, 255, 255, 0)
  );
}
```

---

## 🎬 Анимации и переходы

### Сохранение анимаций

Все анимации из светлой темы **сохраняются без изменений**:
- `rb-breath` - работает одинаково
- `rb-float` - работает одинаково
- `rb-bloom-in` - работает одинаково
- `rb-breathe` - работает одинаково

### Адаптация прозрачностей

```css
/* Анимация дыхания - адаптация opacity */
.dark .anim-breath {
  /* opacity остается 0.12-0.20, но на темном фоне выглядит иначе */
  /* Можно немного увеличить для лучшей видимости */
  animation: rb-breath-dark 12s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

@keyframes rb-breath-dark {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.15;  /* Немного выше для темного фона */
  }
  50% { 
    transform: scale(1.03); 
    opacity: 0.25;  /* Немного выше для темного фона */
  }
}
```

### Переходы между темами

```css
/* Плавный переход при смене темы */
* {
  transition: 
    background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 🛠️ Рекомендации по реализации

### Техническая реализация

#### 1. Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',  // Использование класса .dark
  theme: {
    extend: {
      colors: {
        // Dark mode цвета через CSS переменные
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... остальные цвета
      },
      boxShadow: {
        'soft-dark': 'var(--soft-shadow-dark)',
        'medium-dark': 'var(--medium-shadow-dark)',
        'warm-dark': 'var(--warm-shadow-dark)',
        'breathing-dark': 'var(--breathing-shadow-dark)',
        'glow-dark': 'var(--glow-shadow-dark)',
      },
    },
  },
}
```

#### 2. CSS переменные в globals.css

```css
@layer base {
  :root {
    /* Светлая тема - существующие переменные */
    --background: 0 0% 98%;
    /* ... */
  }

  .dark {
    /* Темная тема - новые переменные */
    --background: 30 11% 9%;
    --foreground: 35 15% 89%;
    /* ... */
    
    /* Тени для темной темы */
    --soft-shadow-dark: 0 4px 20px rgba(0, 0, 0, 0.4);
    --medium-shadow-dark: 0 8px 30px rgba(0, 0, 0, 0.5);
    --warm-shadow-dark: 0 6px 25px rgba(143, 166, 143, 0.15);
    --breathing-shadow-dark: 0 6px 20px rgba(0, 0, 0, 0.3);
    --glow-shadow-dark: 0 0 20px rgba(143, 166, 143, 0.2);
  }
}
```

#### 3. Theme Provider (next-themes)

```tsx
// components/providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  )
}
```

#### 4. Переключатель темы

```tsx
// components/theme-toggle.tsx
'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Применение в компонентах

#### Базовый паттерн

```tsx
// Пример компонента с поддержкой темной темы
<div className="
  bg-white dark:bg-background
  text-inkSoft dark:text-foreground
  border-mistGray/30 dark:border-border
  shadow-breathing dark:shadow-breathing-dark
">
  {/* Контент */}
</div>
```

#### Условные классы

```tsx
// Использование условных классов
className={cn(
  "bg-white text-inkSoft",
  "dark:bg-background dark:text-foreground"
)}
```

---

## 📱 Примеры использования

### Hero секция (Dark Mode)

```tsx
<section className="
  relative min-h-[88svh] 
  flex items-center justify-center 
  bg-white dark:bg-background
  pb-20
">
  {/* Контент */}
  <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16">
    <div className="relative mx-auto max-w-4xl text-center">
      {/* Эльфийский цветок */}
      <div className="flex justify-center mb-3 md:mb-4">
        <ElvenFlower 
          size={120} 
          className="dark:opacity-90"  /* Легкое затемнение для темной темы */
        />
      </div>
      
      {/* Halo эффект */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="halo w-[320px] h-[320px] rounded-full blur-2xl anim-breath" />
      </div>

      {/* Заголовок */}
      <h1 className="
        text-display-1 font-light 
        text-ink-soft dark:text-foreground
        leading-[0.95] mb-14 tracking-normal
      ">
        rosebotanique
      </h1>

      {/* CTA */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="primary" size="lg" asChild>
          <Link href="/catalog">
            Shop collection
            <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1" />
          </Link>
        </Button>
        <span className="
          text-body font-light tracking-wide 
          text-inkSoft dark:text-muted-foreground
        ">
          we make things
        </span>
      </div>
    </div>
  </div>
</section>
```

### Карточка продукта (Dark Mode)

```tsx
<Card className="
  rounded-2xl border 
  bg-card dark:bg-card
  text-card-foreground dark:text-card-foreground
  shadow-misty/50 dark:shadow-soft-dark
  group overflow-hidden
  hover:shadow-misty dark:hover:shadow-medium-dark
">
  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
    <Image
      src="/product-image.jpg"
      alt="Product name"
      fill
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
    <div className="
      absolute inset-0 
      bg-gradient-to-t from-black/12 via-transparent to-transparent 
      dark:from-black/20 dark:via-transparent dark:to-transparent
      opacity-0 group-hover:opacity-100 
      transition-opacity duration-500
    " />
  </div>
  
  <CardContent className="p-6">
    <CardTitle className="
      font-light 
      text-ink-soft dark:text-foreground
      mb-2
    ">
      Product Name
    </CardTitle>
    <CardDescription className="
      text-muted-foreground dark:text-muted-foreground
      mb-4
    ">
      Product description
    </CardDescription>
    <div className="flex items-center justify-between">
      <span className="
        text-lg font-light 
        text-ink-soft dark:text-foreground
      ">
        $99
      </span>
      <Button variant="outline" size="sm">
        Add to cart
      </Button>
    </div>
  </CardContent>
</Card>
```

### Header (Dark Mode)

```tsx
<header className="
  sticky top-0 z-50 w-full 
  border-b 
  border-mistGray/30 dark:border-border
  bg-white/80 dark:bg-background/80
  backdrop-breathing dark:backdrop-breathing-dark
  shadow-breathing dark:shadow-breathing-dark
">
  <div className="container mx-auto px-6 md:px-12 lg:px-24">
    <div className="flex h-24 items-center justify-between">
      {/* Логотип */}
      <Link href="/" className="flex items-center space-x-2 group">
        <span className="
          text-graceful text-xl font-light 
          text-inkSoft dark:text-foreground
          group-hover:text-sageTint dark:group-hover:text-primary
          transition-colors duration-500
        ">
          rosebotanique store
        </span>
      </Link>

      {/* Навигация */}
      <nav className="hidden md:flex items-center space-x-12">
        <Link 
          href="/catalog" 
          className="
            text-whisper dark:text-muted-foreground
            hover:text-sageTint dark:hover:text-primary
            transition-colors font-light text-base tracking-wide
            relative group
          "
        >
          collection
          <span className="
            absolute -bottom-2 left-0 w-0 h-px 
            bg-gradient-to-r from-sageTint to-transparent
            dark:from-primary dark:to-transparent
            group-hover:w-full transition-all duration-500
          " />
        </Link>
      </nav>

      {/* Действия */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</header>
```

---

## 🎯 Контрольный список реализации

### Фаза 1: Базовая настройка
- [ ] Добавить `darkMode: 'class'` в `tailwind.config.ts`
- [ ] Установить `next-themes`
- [ ] Добавить `ThemeProvider` в `providers.tsx`
- [ ] Создать CSS переменные для темной темы в `globals.css`
- [ ] Добавить класс `.dark` на `<html>` элемент

### Фаза 2: Цветовая палитра
- [ ] Определить все семантические цвета для темной темы
- [ ] Адаптировать брендовые цвета
- [ ] Протестировать контрастность (WCAG AA/AAA)
- [ ] Создать темные версии теней

### Фаза 3: Компоненты
- [ ] Адаптировать все кнопки
- [ ] Адаптировать карточки
- [ ] Адаптировать input поля
- [ ] Адаптировать header
- [ ] Адаптировать footer
- [ ] Адаптировать модальные окна

### Фаза 4: Специальные эффекты
- [ ] Адаптировать фоновые текстуры
- [ ] Адаптировать halo эффекты
- [ ] Адаптировать veil эффекты
- [ ] Проверить все анимации

### Фаза 5: Тестирование
- [ ] Проверить все страницы в темной теме
- [ ] Протестировать переключение темы
- [ ] Проверить контрастность текста
- [ ] Протестировать на разных устройствах
- [ ] Проверить производительность

---

## 📊 Контрастность и доступность

### Минимальные требования (WCAG AA)

| Элемент | Контрастность | Статус |
|---------|--------------|--------|
| Основной текст | 12.5:1 | ✅ AAA |
| Приглушенный текст | 7:1 | ✅ AA |
| Крупный текст | 5.5:1 | ✅ AA |
| Интерактивные элементы | 4.5:1 | ✅ AA |

### Рекомендации

1. **Всегда тестируйте контрастность** перед релизом
2. **Используйте инструменты**: WebAIM Contrast Checker, axe DevTools
3. **Проверяйте на реальных устройствах** - OLED экраны могут искажать цвета
4. **Учитывайте пользователей с нарушениями зрения**

---

## 🎨 Визуальная иерархия

### Принципы для темной темы

1. **Глубина через тени** - используйте более интенсивные тени для создания слоев
2. **Свечение вместо отражения** - акцентные элементы должны светиться, а не отражать
3. **Мягкие границы** - границы должны быть заметными, но не резкими
4. **Теплые акценты** - сохраняйте теплоту через зеленоватые и бежевые оттенки

### Z-index и слои

Слои остаются теми же, что и в светлой теме:
- `z-0`: Фоновые элементы
- `z-10`: Контент
- `z-20`: Модальные окна, уведомления
- `z-50`: Header, фиксированные элементы

---

## 🔄 Переходы между темами

### Плавность переключения

```css
/* Глобальный переход для всех элементов */
* {
  transition: 
    background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Исключения для анимаций */
.anim-breath,
.anim-float,
.rb-flower {
  transition: none; /* Анимации не должны прерываться */
}
```

### Сохранение предпочтений

```tsx
// Использование localStorage через next-themes
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem={true}
  storageKey="rosebotanique-theme"
  disableTransitionOnChange={false}
>
```

---

## 📚 Дополнительные ресурсы

### Файлы для изменения

- **Tailwind Config**: `front/tailwind.config.ts`
- **Global Styles**: `front/src/app/globals.css`
- **Theme Provider**: `front/src/components/providers.tsx`
- **Theme Toggle**: `front/src/components/theme-toggle.tsx`

### Инструменты для тестирования

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **axe DevTools**: Расширение для браузера
- **Chrome DevTools**: Проверка контрастности в Elements panel

---

## 🎯 Резюме принципов темной темы

### Ключевые принципы

1. **Теплая темнота** - избегаем холодных оттенков
2. **Мягкий контраст** - достаточный, но не резкий
3. **Органичность** - природные оттенки
4. **Единство** - естественное продолжение светлой темы
5. **Элегантность** - сохранение изысканности

### Цветовая температура

- **Базовая**: Теплая (2700K-3000K)
- **Доминирующие**: Коричневые, бежевые, оливковые
- **Акценты**: Приглушенные зеленые

### Технические требования

- **Контрастность**: Минимум WCAG AA (4.5:1)
- **Переходы**: Плавные (0.3s cubic-bezier)
- **Производительность**: Без потери FPS
- **Совместимость**: Все современные браузеры

---

**Версия документа**: 1.0  
**Дата создания**: 2024  
**Проект**: RSBTQ (Rosebotanique Store)  
**Статус**: Готов к реализации

---

*Этот документ является частью дизайн-системы Rosebotanique Store и должен использоваться вместе с основным Design System и Brandbook.*

