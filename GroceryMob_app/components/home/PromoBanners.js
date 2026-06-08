import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Image,
} from 'react-native';
import { ChevronRight, Timer } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';
import { getActiveBanners } from '../../data/campaigns';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - SPACING.md * 2;

// Countdown hook
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

function getTimeRemaining(endDate) {
  const total = new Date(endDate) - new Date();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { days, hours, minutes, expired: false };
}

function CountdownPill({ endsAt }) {
  const { days, hours, minutes, expired } = useCountdown(endsAt);

  if (expired) {
    return (
      <View style={styles.countdownPill}>
        <Text style={styles.countdownText}>Expired</Text>
      </View>
    );
  }

  return (
    <View style={styles.countdownPill}>
      <Timer size={12} color="#fff" />
      <Text style={styles.countdownText}>
        {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m left
      </Text>
    </View>
  );
}

export default function PromoBanners({ navigation }) {
  const { t } = useLanguage();
  const banners = getActiveBanners();
  const bannerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-scroll
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % banners.length;
      setCurrentSlide(nextSlide);
      bannerRef.current?.scrollToIndex({ index: nextSlide, animated: true });
    }, 4500);
    return () => clearInterval(interval);
  }, [currentSlide, banners.length]);

  if (banners.length === 0) return null;

  const renderBanner = ({ item }) => {
    const [colorStart, colorEnd] = item.bannerBg;

    const handlePress = () => {
      if (item.navigationTarget === 'StoresTab') {
        navigation.navigate('StoresTab');
      } else if (item.navigationTarget === 'KitchenEssentials') {
        navigation.navigate('KitchenEssentials');
      } else if (item.navigationTarget === 'MonthlyEssentials') {
        navigation.navigate('MonthlyEssentials');
      } else if (item.navigationTarget) {
        navigation.navigate(item.navigationTarget);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[styles.banner, { backgroundColor: colorStart }]}
      >
        {/* Label */}
        {item.badge && (
          <View style={styles.limitedLabel}>
            <Text style={styles.limitedLabelText}>
              {t(item.badge)}
            </Text>
          </View>
        )}

        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerIcon}>{item.icon}</Text>
            <Text style={styles.bannerTitle}>{t(item.title)}</Text>
            <Text style={styles.bannerSubtitle}>{t(item.subtitle)}</Text>

            <View style={styles.ctaRow}>
              <View style={styles.ctaBtn}>
                <Text style={[styles.ctaText, { color: colorStart }]}>{t(item.ctaText)}</Text>
                <ChevronRight size={14} color={colorStart} />
              </View>
            </View>
          </View>

          <View style={styles.bannerRight}>
            <View style={[styles.imageCircle, { backgroundColor: colorEnd }]}>
              <Image source={{ uri: item.bannerImage }} style={styles.bannerImage} resizeMode="cover" />
            </View>
          </View>
        </View>

        {/* Decorative blob */}
        <View style={[styles.blob, { backgroundColor: colorEnd }]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={bannerRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            bannerRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 500);
        }}
      />
      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.activeDot]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  banner: {
    width: BANNER_WIDTH,
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    padding: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 195,
  },
  limitedLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 20,
    zIndex: 10,
  },
  limitedLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerLeft: {
    flex: 1,
    zIndex: 2,
  },
  bannerRight: {
    zIndex: 1,
  },
  bannerIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
    lineHeight: 18,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  countdownText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  discountPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  ctaText: {
    fontWeight: '800',
    fontSize: 12,
  },
  imageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerImage: {
    width: 100,
    height: 100,
  },
  blob: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    opacity: 0.25,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray[300],
  },
  activeDot: {
    width: 20,
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
