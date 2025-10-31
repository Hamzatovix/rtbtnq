/**
 * Lazy loading image component
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder = '/placeholder-image.jpg',
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <Image
          src={hasError ? placeholder : src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          quality={quality}
          sizes={sizes}
          priority={priority}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

/**
 * Optimized product image component
 */
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) => {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority={priority}
      sizes={sizes}
      quality={85}
    />
  );
};

/**
 * Thumbnail image component
 */
interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
}) => {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={300}
      height={300}
      className={`object-cover ${className}`}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
      quality={80}
    />
  );
};

/**
 * Hero image component
 */
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      priority={true}
      sizes="100vw"
      quality={90}
    />
  );
};

/**
 * Gallery image component
 */
interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const GalleryImage: React.FC<GalleryImageProps> = ({
  src,
  alt,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <LazyImage
        src={src}
        alt={alt}
        width={400}
        height={400}
        className="object-cover hover:scale-105 transition-transform duration-200"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        quality={85}
      />
    </div>
  );
};
