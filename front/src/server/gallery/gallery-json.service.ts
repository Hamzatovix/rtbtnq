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
      
      // Приоритет: data (JSONB) > отдельные поля
      if (row.data && typeof row.data === 'object') {
        // Если data это объект, используем его
        const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        image = {
          id: dataObj.id || row.id || '',
          src: dataObj.src || row.src || '',
          alt: dataObj.alt || row.alt || '',
        }
      } else if (row.src) {
        // Используем отдельные поля если есть src
        image = {
          id: row.id || '',
          src: row.src || '',
          alt: row.alt || '',
        }
      } else {
        // Пропускаем записи без src
        console.warn('[Gallery] Пропущена запись без src:', row)
        return null
      }
      
      // Проверяем, что src не пустой
      if (!image.src) {
        console.warn('[Gallery] Пропущена запись с пустым src:', image)
        return null
      }
      
      console.log('[Gallery] Обработанное изображение:', image)
      return image
    }).filter((img): img is GalleryImage => img !== null)

    console.log('[Gallery] Итого загружено изображений:', images.length)
    return images
  } catch (err) {
    console.error('[Gallery] Ошибка при загрузке из Supabase:', err)
    return []
  }
}

async function saveGalleryToSupabase(images: GalleryImage[]): Promise<void> {
  console.log('[Gallery] Сохранение в Supabase:', {
    table: SUPABASE_GALLERY_TABLE,
    imagesCount: images.length,
    supabaseUrl: process.env.SUPABASE_URL,
  })

  const rows = images.map((image) => ({
    id: image.id,
    src: image.src,
    alt: image.alt || '',
    data: image, // Сохраняем полный объект в data для совместимости
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  console.log('[Gallery] Подготовлено строк для сохранения:', rows.length)
  if (rows.length > 0) {
    console.log('[Gallery] Первая строка:', {
      id: rows[0].id,
      src: rows[0].src,
      alt: rows[0].alt,
    })
  }

  try {
    // Удаляем все существующие записи и вставляем новые
    console.log('[Gallery] Удаление старых записей...')
    await supabaseDelete(SUPABASE_GALLERY_TABLE, 'id=not.is.null')
    console.log('[Gallery] Старые записи удалены')

    if (rows.length) {
      console.log('[Gallery] Вставка новых записей...')
      await supabaseUpsert(SUPABASE_GALLERY_TABLE, rows)
      console.log('[Gallery] Новые записи успешно вставлены')
    } else {
      console.log('[Gallery] Нет данных для вставки')
    }
  } catch (error) {
    console.error('[Gallery] Ошибка при сохранении в Supabase:', error)
    throw error
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

  // Всегда используем Supabase если он настроен (и локально, и на production)
  if (supabaseEnabled) {
    console.log('[Gallery] Используем Supabase для загрузки')
    try {
      const result = await loadGalleryFromSupabase()
      console.log('[Gallery] Загружено из Supabase:', result.length, 'изображений')
      return result
    } catch (error) {
      console.error('[Gallery] Ошибка в loadGalleryFromSupabase:', error)
      // На production не используем fallback на файл
      if (isVercel) {
        throw error
      }
      // Локально можем попробовать файл как fallback
      console.warn('[Gallery] Пробуем загрузить из файла как fallback...')
    }
  }

  // Fallback на файл только для локальной разработки без Supabase
  if (!isVercel) {
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

  // На production без Supabase - возвращаем пустой массив
  console.warn('[Gallery] Supabase не настроен на production, возвращаем пустой массив')
  return []
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
      supabaseUrl: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 30)}...` : 'не установлен',
    })

    // Используем Supabase если он настроен (как в products-json.service.ts)
    // Это гарантирует синхронизацию данных между устройствами
    if (supabaseEnabled) {
      console.log('[Gallery] Используем Supabase для сохранения (синхронизация между устройствами)')
      try {
        await saveGalleryToSupabase(images)
        console.log('[Gallery] ✅ Данные успешно сохранены в Supabase')
        return true
      } catch (saveError: any) {
        console.error('[Gallery] ❌ Ошибка при сохранении в Supabase:', saveError)
        console.error('[Gallery] Stack:', saveError?.stack)
        // На production выбрасываем ошибку
        if (isVercel) {
          throw new Error(`Ошибка сохранения в Supabase: ${saveError.message || 'Неизвестная ошибка'}`)
        }
        // Локально пробуем файл как fallback
        console.warn('[Gallery] Пробуем сохранить в локальный файл как fallback...')
      }
    }

    // На Vercel без Supabase - ошибка
    if (isVercel) {
      const errorMessage = 
        'Supabase не настроен для production. ' +
        'Установите переменные окружения SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в Vercel. ' +
        'См. документацию: md/GALLERY_SUPABASE_SETUP.md'
      console.error('[Gallery] ❌ Ошибка:', errorMessage)
      throw new Error(errorMessage)
    }

    // Локальная разработка без Supabase - используем файл
    console.warn('[Gallery] ⚠️ Supabase не настроен, используем локальный файл (данные НЕ будут синхронизироваться между устройствами)')
    const filePath = getGalleryPath()
    await writeFile(filePath, JSON.stringify({ images }, null, 2), 'utf8')
    console.log('[Gallery] Данные сохранены в локальный файл:', filePath)
    return true
  } catch (error) {
    console.error('[Gallery] ❌ Критическая ошибка при сохранении галереи:', error)
    throw error // Пробрасываем ошибку дальше для более информативного сообщения
  }
}

