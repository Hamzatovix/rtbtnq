# 🌿 Rosebotanique Store - Полный Брендбук

## 📋 Содержание
1. [Философия бренда](#философия-бренда)
2. [Цветовая палитра](#цветовая-палитра)
3. [Типографика](#типографика)
4. [Компоненты UI](#компоненты-ui)
5. [Визуальные элементы](#визуальные-элементы)
6. [Анимации и переходы](#анимации-и-переходы)
7. [Макет и структура](#макет-и-структура)
8. [Токены дизайна](#токены-дизайна)
9. [Примеры использования](#примеры-использования)

---

## 🎯 Философия бренда

### Концепция
**Rosebotanique Store** — это бренд ручной работы, вдохновленный природой и минимализмом. Философия основана на принципах:
- **Устойчивость** — экологичные материалы и процессы
- **Качество** — внимание к деталям, создание вещей на долгие годы
- **Традиции** — сохранение техник ручной работы
- **Простота** — функциональность прежде всего, тихая эстетика

### Тон голоса
- Спокойный и вдумчивый
- Минималистичный
- Природный и органичный
- Качественный и надежный

---

## 🎨 Цветовая палитра

### Основные цвета бренда

#### **Rose Beige** `#f4efe8`
- **Назначение**: Основной фон, теплый бежевый
- **HSL**: `244 239 232`
- **Использование**: Фоновые элементы, карточки, мягкие акценты

#### **Mist Gray** `#d6d3ce`
- **Назначение**: Мягкий серый для границ и разделителей
- **HSL**: `214 211 206`
- **Использование**: Границы, тени, вторичные элементы

#### **Linen White** `#f9f9f9`
- **Назначение**: Чистый белый с теплом
- **HSL**: `249 249 249`
- **Использование**: Основной фон, контрастные элементы

#### **Sage Tint** `#aeb6af`
- **Назначение**: Холодный зеленовато-серый акцент
- **HSL**: `174 182 175`
- **Использование**: Акцентные элементы, кнопки, интерактивные состояния

#### **Ink Soft** `#4b4b4b`
- **Назначение**: Мягкий текст, не чисто черный
- **HSL**: `75 75 75`
- **Использование**: Основной текст, заголовки

### Системные цвета

#### Светлая тема
```css
--background: 0 0% 98%
--foreground: 240 6% 18%
--primary: 160 8% 65%
--secondary: 45 18% 95%
--muted: 45 18% 95%
--accent: 45 18% 95%
--border: 45 15% 88%
--ring: 160 8% 65%
```

#### Темная тема
```css
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 142 76% 36%
--secondary: 217.2 32.6% 17.5%
--muted: 217.2 32.6% 17.5%
--accent: 217.2 32.6% 17.5%
--border: 217.2 32.6% 17.5%
--ring: 142 76% 36%
```

### Тени и эффекты

#### Тени
```css
--soft-shadow: 0 4px 20px rgba(174, 182, 175, 0.08)
--medium-shadow: 0 8px 30px rgba(174, 182, 175, 0.15)
--warm-shadow: 0 6px 25px rgba(244, 239, 232, 0.4)
--breathing-shadow: 0 6px 20px rgba(0, 0, 0, 0.05)
```

#### Градиенты
```css
/* Текстура фона */
background-image: 
  radial-gradient(circle at 20% 80%, rgba(244, 239, 232, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(214, 211, 206, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 40% 40%, rgba(174, 182, 175, 0.05) 0%, transparent 50%);

/* Льняная текстура */
background-image: 
  radial-gradient(circle at 30% 70%, rgba(244, 239, 232, 0.2) 0%, transparent 60%),
  radial-gradient(circle at 70% 30%, rgba(214, 211, 206, 0.15) 0%, transparent 60%);
```

---

## ✍️ Типографика

### Шрифтовые семейства

#### **Display Font**: Cormorant Garamond
- **Назначение**: Заголовки, элегантные элементы
- **Нагрузки**: 300, 400, 500, 600, 700
- **Стили**: normal, italic
- **Характер**: Серьезный, элегантный, классический

#### **Body Font**: Inter
- **Назначение**: Основной текст, интерфейс
- **Нагрузки**: 300, 400, 500, 600, 700
- **Характер**: Современный, читаемый, нейтральный

### Типографическая шкала

#### Display размеры
```css
/* Display 1 - Главный заголовок */
font-size: clamp(3.5rem, 5.2vw + 1rem, 4.25rem)
line-height: 0.95
letter-spacing: -0.01em

/* Display 2 - Крупные заголовки */
font-size: 3rem
line-height: 1.00
letter-spacing: -0.005em
```

#### Заголовки
```css
/* Title 1 - Заголовки секций */
font-size: 2.25rem
line-height: 1.05

/* Title 2 - Подзаголовки */
font-size: 2rem
line-height: 1.10
```

#### Текст
```css
/* Body - Основной текст */
font-size: 1.0625rem (17px)
line-height: 1.6

/* Subtle - Мелкий текст */
font-size: 0.9375rem (15px)
line-height: 1.5
```

### Типографические утилиты

#### Специальные классы
```css
.text-graceful {
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 0.02em;
  font-weight: 400;
}

.text-whisper {
  color: rgba(75, 75, 75, 0.6);
}

.smallcaps {
  letter-spacing: .12em;
  text-transform: uppercase;
  font-weight: 500;
}

.text-balance {
  text-wrap: balance;
}
```

---

## 🧩 Компоненты UI

### Кнопки

#### Варианты кнопок
```tsx
// Primary - основная кнопка
variant: 'primary'
className: 'text-ink-soft border border-mistGray/60 bg-sageTint hover:bg-mistGray/20'

// Ghost - прозрачная кнопка
variant: 'ghost'
className: 'text-ink-soft hover:bg-mistGray/20'

// Outline - контурная кнопка
variant: 'outline'
className: 'text-ink-soft border border-mistGray/60 bg-transparent hover:bg-mistGray/10'
```

#### Размеры кнопок
```tsx
// Small
size: 'sm'
className: 'h-9 px-3 rounded-full text-subtle'

// Medium
size: 'md'
className: 'h-10 px-4 rounded-full text-subtle'

// Large
size: 'lg'
className: 'h-11 px-6 rounded-full text-subtle tracking-wide'

// Icon
size: 'icon'
className: 'h-11 w-11 rounded-full'
```

### Карточки

#### Базовая карточка
```tsx
<Card className="rounded-2xl border bg-card text-card-foreground shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
  <CardHeader className="flex flex-col space-y-1.5 p-6">
    <CardTitle className="font-semibold leading-none tracking-tight">
      Заголовок
    </CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Описание
    </CardDescription>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    Контент
  </CardContent>
</Card>
```

### Типографические компоненты

#### Заголовки
```tsx
<H1>Главный заголовок</H1>
<H2 size="display">Крупный заголовок</H2>
<H2 size="section">Заголовок секции</H2>
<H3>Подзаголовок</H3>
```

#### Текст
```tsx
<Lead>Вводный текст</Lead>
<Body>Основной текст</Body>
<Small>Мелкий текст</Small>
```

---

## 🎭 Визуальные элементы

### Elven Flower (Эльфийский цветок)
```tsx
<ElvenFlower 
  size={120} 
  className="rb-flower group"
  ariaLabel="Decorative flower. Hover or focus to bloom."
/>
```

**Характеристики:**
- 8 лепестков с симметричным дизайном
- Анимация раскрытия при hover/focus
- Цвет: `#aeb6af` (Sage Tint)
- Размеры: настраиваемые (по умолчанию 160px)

### Nordic Sun Disc (Северный солнечный диск)
```tsx
<NordicSunDisc 
  size={220} 
  interactive={true}
  idSuffix="unique-id"
/>
```

**Характеристики:**
- Планета Сатурн с кольцами
- Интерактивное движение при наведении
- Градиент: от Rose Beige к Sage Tint
- Медленное вращение колец

### Nordic Branch (Северная ветка)
```tsx
<NordicBranch 
  size={220} 
  dense={false}
  flipX={false}
  opacity={1}
/>
```

**Характеристики:**
- Органичная ветка с листьями
- Анимация роста листьев при hover
- Настраиваемая плотность и ориентация
- Цвет: `#aeb6af` (Sage Tint)

### Botanical Grid (Ботаническая сетка)
```tsx
<BotanicalGrid className="absolute inset-0" />
```

**Характеристики:**
- Тонкая сетка 20x20px
- Цвет: `#aeb6af` с прозрачностью 0.12
- Используется как фоновый паттерн

### Stitch Underline (Вышитая подчеркивание)
```tsx
<div className="noah-wrap">
  <svg className="noah-stitch">
    <path className="noah-stitch-path" d="..." />
  </svg>
  <span className="noah-word">NOAH</span>
</div>
```

**Характеристики:**
- Анимированная вышивка
- Появляется при hover на CTA элементы
- Стилизованный текст "NOAH"

---

## ✨ Анимации и переходы

### Основные анимации

#### Breathing (Дыхание)
```css
@keyframes rb-breath {
  0%,100% { transform: scale(1); opacity: 0.12; }
  50%     { transform: scale(1.03); opacity: 0.20; }
}

.anim-breath { 
  animation: rb-breath 12s cubic-bezier(0.22, 1, 0.36, 1) infinite; 
}
```

#### Float (Плавание)
```css
@keyframes rb-float {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50%     { transform: translateY(-8px) rotate(0.5deg); }
}

.anim-float { 
  animation: rb-float 22s ease-in-out infinite; 
}
```

#### Bloom (Расцветание)
```css
@keyframes rb-bloom-in {
  0%   { transform: scale(.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.rb-bloom-in { 
  animation: rb-bloom-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) both; 
}
```

### Переходы

#### Стандартные переходы
```css
.transition-breathing {
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Для кнопок */
transition-[transform,background-color] duration-250 ease-brand
```

#### Easing функции
```css
/* Основная easing функция бренда */
cubic-bezier(0.22, 1, 0.36, 1)

/* Для быстрых переходов */
duration-250 ease-brand

/* Для медленных переходов */
duration-500 ease-out
```

### Интерактивные эффекты

#### Hover эффекты
```css
/* Масштабирование изображений */
group-hover:scale-[1.03]

/* Перемещение иконок */
group-hover:translate-x-1

/* Изменение цвета */
hover:text-sageTint
hover:bg-mistGray/20
```

#### Focus состояния
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-sageTint
focus-visible:ring-offset-2
```

---

## 📐 Макет и структура

### Контейнеры

#### Основной контейнер
```css
.container {
  center: true;
  padding: "2rem";
  screens: {
    "2xl": "1400px";
  }
}
```

#### Секции
```tsx
<section className="py-16">
  <div className="mx-auto max-w-5xl px-6 md:px-10 md:py-12">
    {/* Контент */}
  </div>
</section>
```

### Сетки

#### Адаптивные сетки
```css
/* Мобильная сетка */
grid-cols-1

/* Планшетная сетка */
md:grid-cols-2
md:grid-cols-3

/* Десктопная сетка */
lg:grid-cols-2
lg:grid-cols-3
lg:grid-cols-5
```

#### Специальные сетки
```css
/* Сетка с фиксированной колонкой */
lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)]
```

### Отступы и размеры

#### Вертикальные отступы секций
```css
py-12  /* Компактные секции */
py-14  /* Средние секции */
py-16  /* Стандартные секции */
py-20  /* Большие секции */
```

#### Горизонтальные отступы
```css
px-6   /* Мобильные */
md:px-12  /* Планшеты */
lg:px-16   /* Десктоп */
lg:px-24   /* Широкие экраны */
```

### Высота секций

#### Viewport единицы
```css
min-h-[88svh]  /* Почти полная высота экрана */
h-[42vh]       /* Компактные герои */
min-h-[320px]  /* Минимальная высота */
```

---

## 🎨 Токены дизайна

### Радиусы скругления

```css
--radius: 1rem

/* Производные радиусы */
borderRadius: {
  lg: "var(--radius)",           /* 16px */
  md: "calc(var(--radius) - 2px)", /* 14px */
  sm: "calc(var(--radius) - 4px)", /* 12px */
}

/* Специальные радиусы */
rounded-full    /* Полное скругление для кнопок */
rounded-2xl     /* Большое скругление для карточек */
rounded-lg       /* Стандартное скругление */
rounded-md       /* Малое скругление */
```

### Z-index слои

```css
z-0   /* Фоновые элементы */
z-10  /* Контент */
z-20  /* Навигация */
z-50  /* Модальные окна, хедер */
```

### Прозрачности

```css
opacity-0     /* Полная прозрачность */
opacity-12    /* 12% - очень тонкие элементы */
opacity-25    /* 25% - тонкие элементы */
opacity-35    /* 35% - полупрозрачные */
opacity-55    /* 55% - заметные элементы */
opacity-70    /* 70% - хорошо видимые */
opacity-90    /* 90% - почти непрозрачные */
opacity-100   /* Полная непрозрачность */
```

### Blur эффекты

```css
blur-sm    /* 4px - тонкий размытие */
blur-2xl   /* 40px - сильное размытие */
blur-3xl   /* 64px - очень сильное размытие */
```

---

## 📱 Примеры использования

### Главная страница (Hero секция)

```tsx
<section className="relative min-h-[88svh] flex items-center justify-center bg-white pb-20">
  {/* Фоновые орбы */}
  <div className="absolute top-[12%] left-[8%] w-[22rem] h-[22rem] bg-sageTint/20 rounded-full blur-2xl anim-breath anim-delay-2s" />
  <div className="absolute bottom-[10%] right-[12%] w-[26rem] h-[26rem] bg-mistGray/20 rounded-full blur-3xl anim-breath anim-delay-4s" />
  
  {/* Контент */}
  <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16">
    <div className="relative mx-auto max-w-4xl text-center">
      {/* Эльфийский цветок */}
      <div className="flex justify-center mb-3 md:mb-4">
        <ElvenFlower size={120} />
      </div>
      
      {/* Halo эффект */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="halo w-[320px] h-[320px] rounded-full blur-2xl anim-breath" />
      </div>

      {/* Заголовок */}
      <h1 className="text-display-1 font-light text-ink-soft leading-[0.95] mb-14 tracking-normal">
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
        <span className="text-body font-light tracking-wide text-inkSoft">
          we make things
        </span>
      </div>
    </div>
  </div>
</section>
```

### Карточка продукта

```tsx
<Card className="rounded-2xl border bg-card text-card-foreground shadow-[0_4px_12px_rgba(0,0,0,0.05)] group overflow-hidden">
  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
    <Image
      src="/product-image.jpg"
      alt="Product name"
      fill
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </div>
  
  <CardContent className="p-6">
    <CardTitle className="font-light text-ink-soft mb-2">
      Product Name
    </CardTitle>
    <CardDescription className="text-muted-foreground mb-4">
      Product description
    </CardDescription>
    <div className="flex items-center justify-between">
      <span className="text-lg font-light text-ink-soft">$99</span>
      <Button variant="outline" size="sm">
        Add to cart
      </Button>
    </div>
  </CardContent>
</Card>
```

### Навигация

```tsx
<header className="sticky top-0 z-50 w-full border-b border-mistGray/30 bg-white/80 backdrop-breathing shadow-breathing">
  <div className="container mx-auto px-6 md:px-12 lg:px-24">
    <div className="flex h-24 items-center justify-between">
      {/* Логотип */}
      <Link href="/" className="flex items-center space-x-2 group">
        <span className="text-graceful text-xl font-light text-inkSoft group-hover:text-sageTint transition-colors duration-500">
          rosebotanique store
        </span>
      </Link>

      {/* Навигация */}
      <nav className="hidden md:flex items-center space-x-12">
        <Link href="/catalog" className="text-whisper hover:text-sageTint transition-colors font-light text-base tracking-wide relative group">
          collection
          <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint to-transparent group-hover:w-full transition-all duration-500" />
        </Link>
        <Link href="/about" className="text-whisper hover:text-sageTint transition-colors font-light text-base tracking-wide relative group">
          about
          <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint to-transparent group-hover:w-full transition-all duration-500" />
        </Link>
      </nav>

      {/* Действия */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="hover:bg-sageTint/5 transition-all duration-500 rounded-2xl">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-sageTint/5 transition-all duration-500 rounded-2xl">
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</header>
```

---

## 🎯 Рекомендации по использованию

### Принципы дизайна
1. **Минимализм** — используйте много белого пространства
2. **Природность** — предпочитайте органичные формы и текстуры
3. **Качество** — каждый элемент должен быть продуман
4. **Тишина** — избегайте ярких, кричащих элементов

### Доступность
- Всегда используйте `aria-label` для декоративных элементов
- Поддерживайте `prefers-reduced-motion`
- Обеспечивайте достаточный контраст текста
- Используйте семантические HTML элементы

### Производительность
- Используйте `loading="lazy"` для изображений
- Применяйте `will-change` только для анимируемых элементов
- Оптимизируйте анимации с помощью `transform` и `opacity`

---

## 📚 Дополнительные ресурсы

### CSS переменные
Все цвета и размеры определены как CSS переменные в `globals.css` и могут быть легко изменены для кастомизации темы.

### Tailwind конфигурация
Полная конфигурация находится в `tailwind.config.ts` с расширенными настройками для типографики, цветов и анимаций.

### Компоненты
Все UI компоненты находятся в папке `src/components/ui/` и следуют единому стилю бренда.

---

*Этот брендбук является живым документом и должен обновляться при изменении дизайн-системы.*



