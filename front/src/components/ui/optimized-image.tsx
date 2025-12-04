'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  loading?: 'lazy' | 'eager'
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy',
  fallbackSrc,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoaded(false)
      setHasError(false)
      return
    }
    setHasError(true)
    onError?.()
  }

  // Для fill изображений
  if (fill) {
    return (
      <>
        {/* Placeholder фон пока изображение загружается */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
        )}
        
        <Image
          src={hasError ? '/placeholder/about_main_placeholder.svg' : currentSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={currentSrc.startsWith('/uploads/') || currentSrc.includes('blob.vercel-storage.com')}
          className={`${className} relative z-10 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        />
      </>
    )
  }

  // Для фиксированных размеров
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={hasError ? '/placeholder/about_main_placeholder.svg' : currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={currentSrc.startsWith('/uploads/') || currentSrc.includes('blob.vercel-storage.com')}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
