import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Package, Tag, Store, Image as ImageIcon, User } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

const PLACEHOLDER_PATTERNS = [
  'res.cloudinary.com/demo/image/upload',
  'samples/food/spices.jpg',
  'samples/food/fish-vegetables.jpg',
  'images.unsplash.com/photo-1488459739032-a6983b720182',
];

const simpleHash = (value) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
};

const buildUniqueOnlineImageUrl = (productName, productId, width = 400, height = 400) => {
  const safeName = productName?.trim() || 'grocery product';
  const safeId = productId?.trim() || safeName;
  const seed = simpleHash(safeId) || 100;
  const prompt = `macro photography of uncooked ${safeName} grocery, high quality, studio lighting, isolated`;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
};

const isPlaceholderUrl = (value) => {
  if (!value || typeof value !== 'string') return true;
  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern.toLowerCase()));
};

export default function FallbackImage({
  source,
  style,
  resizeMode = 'cover',
  iconSize = 24,
  containerStyle,
  type = 'default',
  productName = '',
  entityId = 'unknown',
  ...props
}) {
  const [imgUri, setImgUri] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let originalUri = source?.uri;
    if (!originalUri || typeof originalUri !== 'string' || originalUri.trim().length === 0 || isPlaceholderUrl(originalUri)) {
      setHasError(true);
      setFallbackFailed(false);
      return;
    }

    let normalizedUrl = originalUri.trim();
    if (normalizedUrl.startsWith('//')) {
      normalizedUrl = `https:${normalizedUrl}`;
    } else if (normalizedUrl.startsWith('http://') && !normalizedUrl.includes('localhost') && !normalizedUrl.includes('192.168.')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }

    setImgUri(normalizedUrl);
    setHasError(false);
    setFallbackFailed(false);
  }, [source?.uri]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    } else if (!fallbackFailed) {
      setFallbackFailed(true);
    }
  };

  const renderIcon = (iconType, size) => {
    switch (iconType) {
      case 'product':
        return <Tag size={size} color="#9CA3AF" strokeWidth={1.2} />;
      case 'restaurant':
        return <Store size={size} color="#9CA3AF" strokeWidth={1.2} />;
      case 'banner':
        return <ImageIcon size={size} color="#9CA3AF" strokeWidth={1.2} />;
      case 'avatar':
        return <User size={size} color="#9CA3AF" strokeWidth={1.2} />;
      default:
        return <Package size={size} color="#9CA3AF" strokeWidth={1.2} />;
    }
  };

  if (fallbackFailed) {
    return (
      <View style={[styles.fallbackContainer, style, containerStyle]}>
        <View style={styles.fallbackContent}>
          {renderIcon(type, iconSize * 1.5)}
          <Text style={styles.noImageText}>{t('No Image Available')}</Text>
        </View>
      </View>
    );
  }

  let finalUri = imgUri;
  if (hasError) {
    if (type === 'product') {
      finalUri = buildUniqueOnlineImageUrl(productName || 'product', entityId);
    } else {
      return (
        <View style={[styles.fallbackContainer, style, containerStyle]}>
          <View style={styles.fallbackContent}>
            {renderIcon(type, iconSize * 1.5)}
            <Text style={styles.noImageText}>{t('No Image Available')}</Text>
          </View>
        </View>
      );
    }
  }

  if (!finalUri) {
    return (
      <View style={[styles.fallbackContainer, style, containerStyle]}>
        <View style={styles.fallbackContent}>
          {renderIcon(type, iconSize * 1.5)}
          <Text style={styles.noImageText}>{t('No Image Available')}</Text>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: finalUri }}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fallbackContent: {
    alignItems: 'center',
    gap: 2,
    padding: 10,
  },
  noImageText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

