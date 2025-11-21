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
    console.log('[Gallery] Загрузка из Supabase, таблица:', SUPABASE_GALLERY_TABLE)
    console.log('[Gallery] URL запроса:', `${process.env.SUPABASE_URL}/rest/v1/${SUPABASE_GALLERY_TABLE}?select=id,src,alt,data&order=created_at.asc`)
    
    const query = 'select=id,src,alt,data&order=created_at.asc'
    console.log('[Gallery] Выполняем запрос с query:', query)
    
    const data = await supabaseSelect<Array<{ id: string; src?: string; alt?: string; data?: GalleryImage }>>(
      SUPABASE_GALLERY_TABLE,
      query,
    )

    console.log('[Gallery] Получены данные из Supabase:', {
      isArray: Array.isArray(data),
      count: Array.isArray(data) ? data.length : 0,
      dataType: typeof data,
      data: data,
      firstRow: Array.isArray(data) && data.length > 0 ? data[0] : null,
    })

    const images = (Array.isArray(data) ? data : []).map((row) => {
      // Если есть data (JSONB), используем его, иначе используем отдельные поля
      let image: GalleryImage
      
      if (row.data && typeof row.data === 'object') {
        // Если data это объект, используем его
        const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        image = {
          id: dataObj.id || row.id,
          src: dataObj.src || row.src || '',
          alt: dataObj.alt || row.alt || '',
        }
      } else {
        // Используем отдельные поля
        image = {
          id: row.id,
          src: row.src || '',
          alt: row.alt || '',
        }
      }
      
      console.log('[Gallery] Обработанное изображение:', image)
      return image
    })

    console.log('[Gallery] Итого загружено изображений:', images.length)
    return images
  } catch (err) {
    console.error('[Gallery] Ошибка при загрузке из Supabase:', err)
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
  const isVercel = isVercelEnvironment()
  const supabaseEnabled = isSupabaseEnabled()
  
  console.log('[Gallery] Загрузка галереи:', {
    isVercel,
    supabaseEnabled,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })

  if (supabaseEnabled) {
    console.log('[Gallery] Вызываем loadGalleryFromSupabase...')
    try {
      const result = await loadGalleryFromSupabase()
      console.log('[Gallery] loadGalleryFromSupabase вернул:', result.length, 'изображений')
      return result
    } catch (error) {
      console.error('[Gallery] Ошибка в loadGalleryFromSupabase:', error)
      throw error
    }
  }

  const filePath = getGalleryPath()
  try {
    console.log('[Gallery] Загрузка из файла:', filePath)
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    const images = data.images || []
    console.log('[Gallery] Загружено из файла:', images.length)
    return images
  } catch (error) {
    console.error('[Gallery] Ошибка при загрузке из файла:', error)
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

