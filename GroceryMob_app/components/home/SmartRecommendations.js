import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FallbackImage from '../FallbackImage';
import { Sparkles, Plus, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useCart } from '../../context/CartContext';
import { getSmartPicks, getRecommendationReason } from '../../services/recommendationService';
import { triggerSuccess } from '../../utils/Haptics';

const PickCard = memo(({ product, reason, onAdd, onPress, t }) => {
  if (!product || !product.id) return null;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onPress(product)}>
      <View style={styles.reasonTag}>
        <Text style={styles.reasonText}>{t(reason)}</Text>
      </View>
      <FallbackImage source={{ uri: product.image }} style={styles.image} type="product" productName={product.name} entityId={product.id || product._id} />
      <Text numberOfLines={2} style={styles.name}>{t(product.name)}</Text>
      <Text style={styles.unit}>{t(product.unit)}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.price}>₹{product.price}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(product)}>
          <Plus size={14} color="#fff" />
        </TouchableOpacity>
      </View>
      {product.rating && (
        <View style={styles.ratingRow}>
          <Text style={styles.ratingStar}>⭐</Text>
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export const SmartRecommendations = memo(({ navigation, allProducts = [] }) => {
  const { t } = useLanguage();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserProfile, trackProductView, trackCartAdd } = usePreferences();
  const { addToCart } = useCart();

  const generatePicks = useCallback(() => {
    if (!allProducts || allProducts.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const validProducts = allProducts.filter(p => p && (p.id || p._id));
      const profile = getUserProfile();
      const smartPicks = getSmartPicks(validProducts, profile, [], 10);
      setPicks(smartPicks.filter(p => p && (p.id || p._id)));
    } catch (e) {
      console.error('SmartRecommendations error:', e);
    } finally {
      setLoading(false);
    }
  }, [allProducts, getUserProfile]);

  useEffect(() => {
    generatePicks();
  }, [generatePicks]);

  useEffect(() => {
    if (!navigation) return;
    const unsubscribe = navigation.addListener('focus', () => {
      generatePicks();
    });
    return unsubscribe;
  }, [navigation, generatePicks]);

  const handleAdd = useCallback((product) => {
    if (!product) return;
    triggerSuccess();
    addToCart(product);
    if (product.category) trackCartAdd(product.category);
  }, [addToCart, trackCartAdd]);

  const handlePress = useCallback((product) => {
    if (!product || !product.id) return;
    trackProductView(product.id);
    navigation.navigate('ProductDetail', { product });
  }, [navigation, trackProductView]);

  if (loading || picks.length === 0) return null;

  const profile = getUserProfile();
  const hasActivity = Object.keys(profile.orderedCategories).length > 0 || Object.keys(profile.viewedProducts).length > 0 || profile.searchedQueries.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Sparkles size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>
              {hasActivity ? t('Recommended For You') : t('Popular Near You')}
            </Text>
            <Text style={styles.subtitle}>
              {hasActivity ? t('Based on your kitchen needs') : t('What locals are buying')}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={picks}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => `rec-${item?.id || item?._id || Math.random()}`}
        renderItem={({ item }) => (
          <PickCard 
            product={item} 
            reason={getRecommendationReason(item, profile)} 
            onAdd={handleAdd} 
            onPress={handlePress} 
            t={t} 
          />
        )}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </View>
  );
});

export default SmartRecommendations;

const styles = StyleSheet.create({
  container: { margin: SPACING.md, borderRadius: 24, backgroundColor: '#1A4731', paddingVertical: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  title: { fontSize: 18, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  refreshBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(224,122,47,0.2)', justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingLeft: 16, paddingRight: 8 },
  card: { width: 155, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 12, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  reasonTag: { backgroundColor: 'rgba(224,122,47,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  reasonText: { fontSize: 9, fontWeight: '700', color: '#FFD6A5' },
  image: { width: '100%', height: 85, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  name: { fontSize: 13, fontWeight: '800', color: '#E0F0E0', lineHeight: 17 },
  unit: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, marginBottom: 8 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '900', color: '#9AE6B4' },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  ratingStar: { fontSize: 10 },
  ratingText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
});
