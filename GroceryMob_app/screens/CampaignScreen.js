import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Timer, Tag } from 'lucide-react-native';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SPACING } from '../services/theme';

const { width } = Dimensions.get('window');

function getTimeRemaining(endDate) {
  const total = new Date(endDate) - new Date();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { days, hours, minutes, expired: false };
}

export default function CampaignScreen({ route, navigation }) {
  const { campaign } = route.params;
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(campaign.endsAt));
  const [sortOrder, setSortOrder] = useState('none');

  useEffect(() => {
    const fetchCampaignProducts = async () => {
      try {
        // Fetch products from all campaign categories in parallel
        const promises = campaign.categories.map(cat => api.getProducts(cat));
        const results = await Promise.all(promises);
        const allProducts = results.flat();
        
        // Deduplicate by product id
        const seen = new Set();
        const unique = allProducts.filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        
        setProducts(unique);
      } catch (error) {
        console.error('CampaignScreen fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaignProducts();
  }, [campaign.categories]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(campaign.endsAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [campaign.endsAt]);

  const [colorStart] = campaign.bannerBg;

  const displayedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price;
    if (sortOrder === 'high-low') return b.price - a.price;
    return 0;
  });

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('low-high');
    else if (sortOrder === 'low-high') setSortOrder('high-low');
    else setSortOrder('none');
  };

  const renderHeader = () => (
    <View>
      {/* Campaign Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: colorStart }]}>
        <Text style={styles.infoIcon}>{campaign.icon}</Text>
        <Text style={styles.infoTitle}>{t(campaign.title)}</Text>
        <Text style={styles.infoDesc}>{t(campaign.description)}</Text>

        <View style={styles.infoStatsRow}>
          <View style={styles.infoPill}>
            <Tag size={12} color="#fff" />
            <Text style={styles.infoPillText}>{t('FLAT')} {campaign.discountPercent}% {t('OFF')}</Text>
          </View>
          <View style={styles.infoPill}>
            <Timer size={12} color="#fff" />
            <Text style={styles.infoPillText}>
              {timeLeft.expired
                ? t('Expired')
                : `${timeLeft.days}${t('d')} ${timeLeft.hours}${t('h')} ${timeLeft.minutes}${t('m left')}`
              }
            </Text>
          </View>
        </View>

        {/* Category pills */}
        <View style={styles.categoryRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {campaign.categories.map(cat => (
              <View key={cat} style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{t(cat)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{products.length} {t('Products')}</Text>
        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort}>
          <Text style={styles.sortBtnText}>
            {sortOrder === 'none' ? t('Sort') : sortOrder === 'low-high' ? t('Price: Low-High') : t('Price: High-Low')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{campaign.icon} {t(campaign.title)}</Text>
          {!timeLeft.expired && (
            <View style={styles.headerTimer}>
              <Timer size={10} color={COLORS.primary} />
              <Text style={styles.headerTimerText}>
                {timeLeft.days}{t('d')} {timeLeft.hours}{t('h')} {t('left')}
              </Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Loading campaign deals...')}</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              navigation={navigation}
              campaignDiscount={campaign.discountPercent}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('No products found for this campaign.')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 60,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  headerTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  headerTimerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoBanner: {
    marginHorizontal: SPACING.md,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  infoPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  categoryRow: {
    marginTop: 16,
  },
  chipScroll: {
    gap: 8,
    paddingRight: 12,
  },
  categoryPill: {
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[500],
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 120,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray[400],
    fontSize: 15,
    textAlign: 'center',
  },
});
