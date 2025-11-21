'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Image as ImageIcon, Plus, Loader2, GripVertical, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Загрузка изображений галереи
  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/gallery', { cache: 'no-store' })
      const data = await res.json()
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

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 5MB')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gallery')

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadData.url) {
        throw new Error(uploadData.error || 'Ошибка загрузки файла')
      }

      const galleryRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          src: uploadData.url,
          alt: file.name.replace(/\.[^/.]+$/, ''),
        }),
      })

      if (!galleryRes.ok) {
        const errorData = await galleryRes.json()
        throw new Error(errorData.error || 'Ошибка добавления в галерею')
      }

      await loadGallery()
    } catch (err: any) {
      console.error('Ошибка при загрузке изображения:', err)
      setError(err.message || 'Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Drag & Drop для переупорядочивания
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newImages = [...images]
    const [draggedItem] = newImages.splice(draggedIndex, 1)
    newImages.splice(dragOverIndex, 0, draggedItem)

    setImages(newImages)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Сохраняем новый порядок
    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: newImages }),
      })

      if (!res.ok) {
        throw new Error('Ошибка сохранения порядка')
      }
    } catch (err: any) {
      console.error('Ошибка при сохранении порядка:', err)
      setError('Не удалось сохранить порядок изображений')
      await loadGallery()
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

      setImages(updatedImages)

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-inkSoft dark:text-foreground">
            Галерея
          </h1>
          <p className="text-sm text-inkSoft/60 dark:text-muted-foreground mt-1">
            Управление изображениями галереи
          </p>
        </div>
        {images.length > 0 && (
          <div className="text-sm text-inkSoft/60 dark:text-muted-foreground">
            Всего: {images.length} {images.length === 1 ? 'изображение' : images.length < 5 ? 'изображения' : 'изображений'}
          </div>
        )}
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Загрузка нового изображения */}
      <div className="p-6 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            className={`inline-flex items-center justify-center px-6 py-3 border-2 border-dashed border-mistGray/30 dark:border-border rounded-xl text-sm font-medium text-inkSoft dark:text-foreground bg-white dark:bg-card hover:bg-mistGray/5 dark:hover:bg-muted/10 cursor-pointer transition-all duration-300 hover:border-sageTint dark:hover:border-primary ${
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
                <Upload className="h-4 w-4 mr-2" />
                Добавить изображение
              </>
            )}
          </label>
          <p className="text-xs text-inkSoft/50 dark:text-muted-foreground/70">
            Поддерживаются форматы: JPG, PNG, WebP. Максимум 5MB
          </p>
        </div>
      </div>

      {/* Список изображений */}
      {images.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-card text-center"
        >
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-inkSoft/30 dark:text-muted-foreground/30" />
          <p className="text-inkSoft/60 dark:text-muted-foreground text-lg mb-2">
            Галерея пуста
          </p>
          <p className="text-sm text-inkSoft/50 dark:text-muted-foreground/70">
            Добавьте первое изображение, чтобы начать
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-card hover:shadow-xl ${
                  draggedIndex === index
                    ? 'opacity-50 scale-95 border-sageTint dark:border-primary'
                    : dragOverIndex === index
                    ? 'border-sageTint dark:border-primary scale-105 shadow-lg'
                    : 'border-mistGray/30 dark:border-border hover:border-mistGray/50 dark:hover:border-border'
                }`}
              >
                {/* Drag handle */}
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Изображение */}
                <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-mistGray/10 dark:bg-muted/10 group-hover:ring-2 ring-sageTint/20 dark:ring-primary/20 transition-all">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    unoptimized={img.src.includes('blob.vercel-storage.com')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder/about_main_placeholder.webp'
                    }}
                  />
                  {/* Overlay при hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
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
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* Индикатор порядка (только на десктопе) */}
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                    #{index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Подсказка о drag & drop */}
      {images.length > 1 && (
        <div className="p-4 rounded-xl bg-mistGray/5 dark:bg-muted/10 border border-mistGray/20 dark:border-border">
          <p className="text-xs text-inkSoft/60 dark:text-muted-foreground text-center">
            💡 Перетащите изображения для изменения порядка отображения
          </p>
        </div>
      )}
    </div>
  )
}
