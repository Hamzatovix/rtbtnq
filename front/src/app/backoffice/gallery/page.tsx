'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Image as ImageIcon, Plus, Loader2, GripVertical, Upload, Sparkles } from 'lucide-react'
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
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number; error?: string }[]>([])
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

  // Загрузка нового изображения (одного или нескольких)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Валидация всех файлов
    const invalidFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return true
      if (file.size > 5 * 1024 * 1024) return true
      return false
    })

    if (invalidFiles.length > 0) {
      setError('Некоторые файлы не прошли валидацию. Убедитесь, что все файлы - изображения размером до 5MB')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setUploadingFiles(files.map(f => ({ name: f.name, progress: 0 })))

      const uploadPromises = files.map(async (file, index) => {
        try {
          // Обновляем прогресс
          setUploadingFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 25 } : f
          ))

          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', 'gallery')

          setUploadingFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 50 } : f
          ))

          const uploadRes = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
          })

          const uploadData = await uploadRes.json()

          if (!uploadData.url) {
            throw new Error(uploadData.error || 'Ошибка загрузки файла')
          }

          setUploadingFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 75 } : f
          ))

          console.log('[Gallery Admin] Отправка запроса на добавление в галерею:', {
            src: uploadData.url,
            alt: file.name.replace(/\.[^/.]+$/, ''),
          })

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

          console.log('[Gallery Admin] Ответ API:', {
            ok: galleryRes.ok,
            status: galleryRes.status,
            statusText: galleryRes.statusText,
          })

          if (!galleryRes.ok) {
            const errorData = await galleryRes.json()
            console.error('[Gallery Admin] Ошибка API:', errorData)
            throw new Error(errorData.error || errorData.details || 'Ошибка добавления в галерею')
          }

          setUploadingFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 100 } : f
          ))

          const addedImage = await galleryRes.json()
          console.log('[Gallery Admin] Изображение добавлено:', addedImage)
          return { success: true, file: file.name }
        } catch (err: any) {
          console.error(`Ошибка при загрузке изображения ${file.name}:`, err)
          // Помечаем файл как ошибку, но продолжаем загрузку остальных
          setUploadingFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: 0, error: err.message || 'Ошибка загрузки' } : f
          ))
          return { success: false, file: file.name, error: err.message || 'Ошибка загрузки' }
        }
      })

      // Ждем завершения всех загрузок (успешных и неуспешных)
      const results = await Promise.allSettled(uploadPromises)
      
      // Подсчитываем успешные и неуспешные загрузки
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length
      
      if (failed > 0) {
        setError(`Загружено: ${successful}, ошибок: ${failed}. Проверьте файлы с ошибками.`)
      }
      
      // Обновляем галерею только если были успешные загрузки
      if (successful > 0) {
        await loadGallery()
      }
      
      setUploadingFiles([])
    } catch (err: any) {
      console.error('Ошибка при загрузке изображений:', err)
      setError(err.message || 'Ошибка при загрузке изображений')
      setUploadingFiles([])
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
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-sageTint/30 border-t-sageTint dark:border-primary/30 dark:border-t-primary rounded-full mx-auto mb-4"
          />
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 font-mono text-xs uppercase tracking-[0.15em]">Загрузка галереи...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-fintage-graphite/20 dark:border-fintage-graphite/45">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/10 dark:to-accent/5 border border-fintage-graphite/20 dark:border-fintage-graphite/45 flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent dark:text-accent" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">
              Галерея
            </h1>
          </div>
          <p className="text-[9px] sm:text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] ml-10 sm:ml-13">
            Управление изображениями галереи
          </p>
        </div>
        {images.length > 0 && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm bg-fintage-graphite/10 dark:bg-fintage-graphite/20 border border-fintage-graphite/20 dark:border-fintage-graphite/45">
            <span className="text-xs sm:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.1em]">
              {images.length}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-fintage-graphite/50 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">
              {images.length === 1 ? 'изображение' : images.length < 5 ? 'изображения' : 'изображений'}
            </span>
          </div>
        )}
      </div>

      {/* Сообщение об ошибке */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-sm bg-fintage-punch/10 dark:bg-fintage-punch/20 border border-fintage-punch/30 dark:border-fintage-punch/40 text-fintage-punch dark:text-fintage-punch font-mono text-xs uppercase tracking-[0.1em]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Загрузка нового изображения */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 rounded-sm border-2 border-dashed border-fintage-graphite/30 dark:border-fintage-graphite/40 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 hover:border-accent/50 dark:hover:border-accent/50 transition-fintage"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="gallery-upload"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <motion.label
            htmlFor="gallery-upload"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-sm text-xs sm:text-sm font-mono uppercase tracking-[0.15em] text-fintage-charcoal dark:text-fintage-offwhite bg-fintage-offwhite dark:bg-fintage-charcoal border-2 border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:border-accent dark:hover:border-accent hover:bg-hover-bg dark:hover:bg-hover-bg cursor-pointer transition-fintage shadow-fintage-sm hover:shadow-fintage-md ${
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
                Добавить изображения
              </>
            )}
          </motion.label>
          <p className="text-[10px] sm:text-xs font-mono text-fintage-graphite/50 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">
            Поддерживаются форматы: JPG, PNG, WebP. Максимум 5MB на файл. Можно выбрать несколько файлов
          </p>
        </div>
        
        {/* Прогресс загрузки нескольких файлов */}
        {uploadingFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadingFiles.map((file, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.1em]">
                  <span className={`truncate flex-1 mr-2 ${file.error ? 'text-fintage-punch dark:text-fintage-punch' : 'text-fintage-graphite/60 dark:text-fintage-graphite/75'}`}>
                    {file.name}
                  </span>
                  <span className={file.error ? 'text-fintage-punch dark:text-fintage-punch' : 'text-fintage-graphite/60 dark:text-fintage-graphite/75'}>
                    {file.error ? 'Ошибка' : `${file.progress}%`}
                  </span>
                </div>
                {file.error ? (
                  <p className="text-[10px] font-mono text-fintage-punch dark:text-fintage-punch uppercase tracking-[0.1em]">
                    {file.error}
                  </p>
                ) : (
                  <div className="w-full h-1.5 bg-fintage-graphite/20 dark:bg-fintage-graphite/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-accent dark:bg-accent"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Список изображений */}
      {images.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-16 rounded-sm border-2 border-dashed border-fintage-graphite/30 dark:border-fintage-graphite/40 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-fintage-graphite/10 dark:bg-fintage-graphite/20 mb-6">
            <ImageIcon className="h-10 w-10 text-fintage-graphite/30 dark:text-fintage-graphite/30" />
          </div>
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 text-lg mb-2 font-display-vintage font-black uppercase tracking-tighter">
            Галерея пуста
          </p>
          <p className="text-sm font-mono text-fintage-graphite/50 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">
            Добавьте первое изображение, чтобы начать
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative p-3 sm:p-4 md:p-5 rounded-sm border-2 transition-fintage bg-fintage-offwhite dark:bg-fintage-charcoal hover:shadow-fintage-md ${
                  draggedIndex === index
                    ? 'opacity-50 scale-95 border-accent dark:border-accent shadow-fintage-md'
                    : dragOverIndex === index
                    ? 'border-accent dark:border-accent scale-105 shadow-fintage-md ring-2 ring-accent/20 dark:ring-accent/20'
                    : 'border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:border-fintage-graphite/50 dark:hover:border-fintage-graphite/50'
                }`}
              >
                {/* Drag handle */}
                <motion.div 
                  className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </motion.div>

                {/* Изображение */}
                <div className="relative aspect-[4/3] mb-3 sm:mb-4 rounded-sm overflow-hidden bg-fintage-graphite/10 dark:bg-fintage-graphite/10 group-hover:ring-2 ring-accent/20 dark:ring-accent/20 transition-fintage">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    unoptimized={img.src.startsWith('/uploads/') || img.src.includes('blob.vercel-storage.com') || img.src.startsWith('http')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder/about_main_placeholder.svg'
                      if (process.env.NODE_ENV === 'development') {
                        console.warn('[Gallery Admin] Ошибка загрузки изображения:', img.src)
                      }
                    }}
                  />
                  {/* Overlay при hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Alt текст */}
                <div className="space-y-2">
                  <Label htmlFor={`alt-${img.id}`} className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">
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
                    className="text-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 focus:border-accent dark:focus:border-accent"
                  />
                </div>

                {/* Кнопка удаления */}
                <motion.div
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(img.id)}
                    className="bg-fintage-punch/10 dark:bg-fintage-punch/20 hover:bg-fintage-punch/15 dark:hover:bg-fintage-punch/25 text-fintage-punch dark:text-fintage-punch rounded-sm border border-fintage-punch/30 dark:border-fintage-punch/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Индикатор порядка */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-2.5 py-1 rounded-sm bg-fintage-charcoal/70 dark:bg-fintage-charcoal/70 backdrop-blur-sm text-fintage-offwhite dark:text-fintage-offwhite text-xs font-mono uppercase tracking-[0.15em] border border-fintage-offwhite/20 dark:border-fintage-offwhite/20 shadow-fintage-sm">
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-sm bg-fintage-graphite/5 dark:bg-fintage-graphite/10 border border-fintage-graphite/20 dark:border-fintage-graphite/45"
        >
          <p className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 text-center flex items-center justify-center gap-2 uppercase tracking-[0.15em]">
            <GripVertical className="w-4 h-4" />
            Перетащите изображения для изменения порядка отображения
          </p>
        </motion.div>
      )}
    </div>
  )
}
