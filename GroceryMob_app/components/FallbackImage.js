import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

export default function FallbackImage({ source, style, resizeMode = 'cover', iconSize = 24, containerStyle, ...props }) {
  const [hasError, setHasError] = useState(false);
  const { t } = useLanguage();

  // Determine if URL exists and is valid
  const hasSource = source && typeof source.uri === 'string' && source.uri.trim().length > 0;
  
  // Avoid using the generic placeholder logic if we have this component
  const isPlaceholder = hasSource && source.uri.includes('placehold.co');

  if (!hasSource || isPlaceholder || hasError) {
    return (
      <View style={[styles.fallbackContainer, style, containerStyle]}>
        <View style={styles.fallbackContent}>
          <Package size={iconSize * 1.5} color="#9CA3AF" strokeWidth={1.2} />
          <Text style={styles.fallbackText}>📦</Text>
          <Text style={styles.noImageText}>{t('No Image Available')}</Text>
        </View>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
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
  fallbackText: {
    fontSize: 20,
    marginBottom: 2,
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
