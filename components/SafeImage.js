"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Image as ImageIcon, Store, Tag, User } from 'lucide-react';
import { buildUniqueOnlineImageUrl, isPlaceholderUrl } from '../services/imageUtils';

const FALLBACK_ASSETS = {
  restaurant: '/images/restaurant-placeholder.webp',
  banner: '/images/banner-placeholder.webp',
  avatar: '/images/avatar-placeholder.webp',
  default: '/images/product-placeholder.webp'
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
  const [hasError, setHasError] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let normalizedUrl = src;
    
    if (!normalizedUrl || normalizedUrl === 'undefined' || normalizedUrl === 'null' || isPlaceholderUrl(normalizedUrl)) {
      setHasError(true);
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
    setHasError(false);
    setAssetFailed(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      console.warn(`[Image Error] Failed to load image:`, {
        url: imgSrc,
        route: pathname,
        component: componentName,
        entityId
      });
      setHasError(true);
    } else if (!assetFailed) {
      setAssetFailed(true);
    }
  };

  if (imgSrc === null && !hasError) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        {FALLBACK_ICONS[type] || FALLBACK_ICONS.default}
      </div>
    );
  }

  if (hasError && assetFailed) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 ${className}`} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        {FALLBACK_ICONS[type] || FALLBACK_ICONS.default}
      </div>
    );
  }

  let currentSrc = imgSrc;
  if (hasError) {
    if (type === 'product') {
      currentSrc = buildUniqueOnlineImageUrl(productName || alt || 'grocery product', entityId || productName, 400, 400);
    } else {
      currentSrc = FALLBACK_ASSETS[type] || FALLBACK_ASSETS.default;
    }
  }

  const imageProps = {
    src: currentSrc,
    alt,
    className: `${className} ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`,
    onError: handleError,
    priority,
    unoptimized: unoptimized || (hasError && type !== 'product' && !assetFailed)
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
