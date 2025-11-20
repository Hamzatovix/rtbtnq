import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { isSupabaseEnabled, supabaseDelete, supabaseSelect, supabaseUpsert } from '@/lib/supabase-admin'

const SUPABASE_GALLERY_TABLE = process.env.SUPABASE_GALLERY_TABLE || 'gallery'

export interface GalleryImage {
  id: string
  src: string
  alt: string
}

function getGalleryPath(): string {
  const root = process.cwd()
  return join(root, 'src', 'data', 'gallery.json')
}

async function loadGalleryFromSupabase(): Promise<GalleryImage[]> {
  try {
    const data = await supabaseSelect<Array<{ id: string; src?: string; alt?: string; data?: GalleryImage }>>(
      SUPABASE_GALLERY_TABLE,
      'select=id,src,alt,data&order=created_at.asc',
    )

    return (Array.isArray(data) ? data : []).map((row) => {
      // Если есть data (JSONB), используем его, иначе используем отдельные поля
      if (row.data) {
        return {
          id: row.data.id || row.id,
          src: row.data.src || '',
          alt: row.data.alt || '',
        }
      }
      return {
        id: row.id,
        src: row.src || '',
        alt: row.alt || '',
      }
    })
  } catch (err) {
    console.error('Supabase loadGallery error:', err)
    return []
  }
}

async function saveGalleryToSupabase(images: GalleryImage[]): Promise<void> {
  const rows = images.map((image) => ({
    id: image.id,
    src: image.src,
    alt: image.alt || '',
    data: image, // Сохраняем полный объект в data для совместимости
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  // Удаляем все существующие записи и вставляем новые
  await supabaseDelete(SUPABASE_GALLERY_TABLE, 'id=not.is.null')

  if (rows.length) {
    await supabaseUpsert(SUPABASE_GALLERY_TABLE, rows)
  }
}

export async function loadGallery(): Promise<GalleryImage[]> {
  if (isSupabaseEnabled()) {
    return await loadGalleryFromSupabase()
  }

  const filePath = getGalleryPath()
  try {
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    return data.images || []
  } catch (error) {
    console.error('Ошибка при загрузке галереи:', error)
    return []
  }
}

function isVercelEnvironment(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_URL)
}

export async function saveGallery(images: GalleryImage[]): Promise<boolean> {
  try {
    const isVercel = isVercelEnvironment()
    const supabaseEnabled = isSupabaseEnabled()
    
    console.log('[Gallery] Сохранение галереи:', {
      isVercel,
      supabaseEnabled,
      imagesCount: images.length,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    // На Vercel всегда используем Supabase
    if (isVercel) {
      if (!supabaseEnabled) {
        const errorMessage = 
          'Supabase не настроен для production. ' +
          'Установите переменные окружения SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в Vercel. ' +
          'См. документацию: md/GALLERY_SUPABASE_SETUP.md'
        console.error('[Gallery] Ошибка:', errorMessage)
        throw new Error(errorMessage)
      }
      console.log('[Gallery] Используем Supabase для сохранения')
      await saveGalleryToSupabase(images)
      return true
    }

    // Локальная разработка: используем Supabase если настроен, иначе файл
    if (isSupabaseEnabled()) {
      await saveGalleryToSupabase(images)
      return true
    }

    const filePath = getGalleryPath()
    await writeFile(filePath, JSON.stringify({ images }, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Ошибка при сохранении галереи:', error)
    throw error // Пробрасываем ошибку дальше для более информативного сообщения
  }
}

