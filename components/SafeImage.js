"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Image as ImageIcon, Store, Tag, User } from 'lucide-react';
import { buildUniqueOnlineImageUrl, isPlaceholderUrl } from '../services/imageUtils';

const FALLBACK_ASSETS = {
  restaurant: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400',
  banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
};

const FALLBACK_ICONS = {
  product: <Tag className="w-1/3 h-1/3 text-gray-300 dark:text-gray-600" />,
  restaurant: <Store className="w-1/3 h-1/3 text-gray-300 dark:text-gray-600" />,
  banner: <ImageIcon className="w-1/3 h-1/3 text-gray-300 dark:text-gray-600" />,
  avatar: <User className="w-1/3 h-1/3 text-gray-300 dark:text-gray-600" />,
  default: <ImageIcon className="w-1/3 h-1/3 text-gray-300 dark:text-gray-600" />
};

export default function SafeImage({
  src,
  alt = 'Image',
  type = 'default',
  entityId = 'unknown',
  productName = '',
  componentName = 'unknown',
  className = '',
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  objectFit = 'cover',
  unoptimized = false
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let normalizedUrl = src;
    
    if (!normalizedUrl || normalizedUrl === 'undefined' || normalizedUrl === 'null' || isPlaceholderUrl(normalizedUrl)) {
      setErrorCount(1); // Skip straight to fallback
      return;
    }

    if (typeof normalizedUrl === 'string') {
      if (normalizedUrl.startsWith('//')) {
        normalizedUrl = `https:${normalizedUrl}`;
      } else if (normalizedUrl.startsWith('http://')) {
        normalizedUrl = normalizedUrl.replace('http://', 'https://');
      }
    }

    setImgSrc(normalizedUrl);
    setErrorCount(0);
  }, [src]);

  const handleError = () => {
    console.warn(`[Image Error] Failed to load image level ${errorCount}:`, {
      url: errorCount === 0 ? imgSrc : (errorCount === 1 && type === 'product' ? 'pollinations.ai' : 'unsplash'),
      route: pathname,
      component: componentName,
      entityId
    });
    setErrorCount(prev => prev + 1);
  };

  if (imgSrc === null && errorCount === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        {FALLBACK_ICONS[type] || FALLBACK_ICONS.default}
      </div>
    );
  }

  if (errorCount >= 3) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        {FALLBACK_ICONS[type] || FALLBACK_ICONS.default}
      </div>
    );
  }

  let currentSrc = imgSrc;
  if (errorCount === 1) {
    if (type === 'product') {
      currentSrc = buildUniqueOnlineImageUrl(productName || alt || 'grocery product', entityId || productName, 400, 400);
    } else {
      currentSrc = FALLBACK_ASSETS[type] || FALLBACK_ASSETS.default;
    }
  } else if (errorCount >= 2) {
    currentSrc = FALLBACK_ASSETS[type] || FALLBACK_ASSETS.default;
  }

  const imageProps = {
    src: currentSrc,
    alt,
    className: `${className} ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`,
    onError: handleError,
    priority,
    unoptimized: unoptimized || (errorCount > 0 && type !== 'product')
  };

  if (fill) {
    imageProps.fill = true;
    if (sizes) imageProps.sizes = sizes;
  } else {
    imageProps.width = width || 400;
    imageProps.height = height || 400;
  }

  return (
    <Image {...imageProps} />
  );
}
