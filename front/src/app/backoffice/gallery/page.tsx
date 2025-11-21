'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Image as ImageIcon, Plus, Loader2 } from 'lucide-react'

type GalleryImage = {
  id: string
  src: string
  alt: string
}

export default function BackofficeGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузка изображений галереи
  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      setLoading(true)
      console.log('[Gallery Frontend] Загрузка галереи...')
      const res = await fetch('/api/gallery', { cache: 'no-store' })
      const data = await res.json()
      console.log('[Gallery Frontend] Получены данные:', {
        imagesCount: data.images?.length || 0,
        images: data.images,
      })
      setImages(data.images || [])
      setError(null)
    } catch (err) {
      console.error('[Gallery Frontend] Ошибка при загрузке галереи:', err)
      setError('Не удалось загрузить галерею')
    } finally {
      setLoading(false)
    }
  }

  // Загрузка нового изображения
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Файл должен быть изображением')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Загружаем файл на сервер
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gallery') // Указываем папку для галереи

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadData.url) {
        throw new Error(uploadData.error || 'Ошибка загрузки файла')
      }

      // Добавляем изображение в галерею
      const galleryRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          src: uploadData.url,
          alt: file.name.replace(/\.[^/.]+$/, ''), // Имя файла без расширения как alt
        }),
      })

      if (!galleryRes.ok) {
        const errorData = await galleryRes.json()
        throw new Error(errorData.error || 'Ошибка добавления в галерею')
      }

      // Обновляем список
      await loadGallery()
    } catch (err: any) {
      console.error('Ошибка при загрузке изображения:', err)
      setError(err.message || 'Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
      // Сбрасываем input
      e.target.value = ''
    }
  }

  // Удаление изображения
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить это изображение из галереи?')) return

    try {
      setError(null)
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка удаления')
      }

      // Обновляем список
      await loadGallery()
    } catch (err: any) {
      console.error('Ошибка при удалении изображения:', err)
      setError(err.message || 'Ошибка при удалении изображения')
    }
  }

  // Обновление alt текста
  const handleAltUpdate = async (id: string, newAlt: string) => {
    try {
      setError(null)
      const updatedImages = images.map((img) =>
        img.id === id ? { ...img, alt: newAlt } : img
      )

      // Обновляем локально для мгновенной обратной связи
      setImages(updatedImages)

      // Сохраняем на сервере (через перезапись всего файла)
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: updatedImages }),
      })

      if (!res.ok) {
        throw new Error('Ошибка сохранения')
      }
    } catch (err: any) {
      console.error('Ошибка при обновлении alt:', err)
      setError(err.message || 'Ошибка при обновлении')
      // Откатываем изменения
      await loadGallery()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sageTint dark:text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-inkSoft dark:text-foreground">
            Галерея
          </h1>
          <p className="text-sm text-inkSoft/60 dark:text-muted-foreground mt-1">
            Управление изображениями галереи
          </p>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Загрузка нового изображения */}
      <div className="p-6 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-card">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="gallery-upload"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="gallery-upload"
            className={`inline-flex items-center justify-center px-6 py-3 border border-mistGray/30 dark:border-border rounded-xl text-sm font-medium text-inkSoft dark:text-foreground bg-white dark:bg-card hover:bg-mistGray/10 dark:hover:bg-muted/20 cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Добавить изображение
              </>
            )}
          </label>
        </div>
      </div>

      {/* Список изображений */}
      {images.length === 0 ? (
        <div className="p-12 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-card text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-inkSoft/40 dark:text-muted-foreground" />
          <p className="text-inkSoft/60 dark:text-muted-foreground">
            Галерея пуста. Добавьте первое изображение.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative p-4 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-card hover:shadow-lg transition-all"
            >
              {/* Изображение */}
              <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-mistGray/10 dark:bg-muted/10">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={img.src.includes('blob.vercel-storage.com')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.webp'
                  }}
                />
              </div>

              {/* Alt текст */}
              <div className="space-y-2">
                <Label htmlFor={`alt-${img.id}`} className="text-xs text-inkSoft/60 dark:text-muted-foreground">
                  Alt текст
                </Label>
                <Input
                  id={`alt-${img.id}`}
                  value={img.alt}
                  onChange={(e) => {
                    const updatedImages = images.map((i) =>
                      i.id === img.id ? { ...i, alt: e.target.value } : i
                    )
                    setImages(updatedImages)
                  }}
                  onBlur={(e) => handleAltUpdate(img.id, e.target.value)}
                  placeholder="Описание изображения"
                  className="text-sm"
                />
              </div>

              {/* Кнопка удаления */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(img.id)}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Информация */}
      <div className="p-4 rounded-xl bg-mistGray/5 dark:bg-muted/10 border border-mistGray/20 dark:border-border">
        <p className="text-xs text-inkSoft/60 dark:text-muted-foreground">
          Всего изображений: {images.length}
        </p>
      </div>
    </div>
  )
}

