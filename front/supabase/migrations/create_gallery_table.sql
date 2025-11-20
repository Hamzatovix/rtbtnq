-- Создание таблицы gallery для хранения изображений галереи
-- Выполните этот SQL в Supabase SQL Editor

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT DEFAULT '',
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание индекса для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at);

-- Включение Row Level Security (опционально, если нужна защита)
-- ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (если RLS включен)
-- CREATE POLICY "Allow public read access" ON gallery FOR SELECT USING (true);

-- Политика для записи (если RLS включен, используйте service_role ключ для записи)
-- CREATE POLICY "Allow service role write access" ON gallery FOR ALL USING (true);

