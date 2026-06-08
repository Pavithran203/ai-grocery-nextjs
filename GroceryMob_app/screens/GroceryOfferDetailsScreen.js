import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Truck, MapPin, Tag } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { storeService } from '../services/storeService';
import { seededRandom } from '../data/campaigns'; // Reusing seed generator for pricing variance

export default function GroceryOfferDetailsScreen({ route, navigation }) {
  const { offer } = route.params;
  const { t } = useLanguage();
  const { coords, hasLocation } = useLocation();
  const { addToCart } = useCart();
  
  // Track custom selections per store: { storeId: { reqIndex: selectedOptionIndex } }
  const [customSelections, setCustomSelections] = useState({});

  // Get all nearby stores
  const nearbyStores = useMemo(() => {
    if (!hasLocation) return storeService.getAllStores();
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 20);
  }, [hasLocation, coords]);

  // Helper to parse product units (e.g., "5 kg", "500 g", "1 L")
  const parseUnit = (unitStr) => {
    if (!unitStr) return { value: 1, type: 'pc' };
    const match = unitStr.toLowerCase().match(/([\d.]+)\s*([a-z]+)/);
    if (match) {
      return { value: parseFloat(match[1]), type: match[2].trim() };
    }
    return { value: 1, type: 'pc' };
  };

  // Helper to calculate how many of the product we need to reach the target amount
  const getMultiplier = (productUnit, targetUnit, targetWeight) => {
    const pWeight = productUnit.value;
    const pType = productUnit.type;
    
    // Normalize to base units (grams or ml)
    const pBase = (pType === 'kg' || pType === 'l') ? pWeight * 1000 : pWeight;
    const targetBase = (targetUnit === 'kg' || targetUnit === 'l') ? targetWeight * 1000 : targetWeight;

    if (pBase === 0) return 1;
    return Math.max(1, Math.ceil(targetBase / pBase));
  };

  // Filter eligible stores that have ALL required items for this combo
  const eligibleStores = useMemo(() => {
    return nearbyStores.map(store => {
      const products = storeService.getStoreProducts(store);
      const matchedProducts = [];
      const matchedIds = new Set();

      // Ensure the store contains at least one product matching each required item spec
      const hasAll = offer.requiredItems.every(req => {
        // Find ALL products that match ANY keyword and NO exclude words, and are in stock
        const potentialMatches = products.filter(p => {
          if (!p.inStock) return false;
          const text = `${p.name.toLowerCase()} ${p.category.toLowerCase()}`;
          const hasKeyword = req.keywords.some(k => text.includes(k.toLowerCase()));
          const hasExclude = req.exclude && req.exclude.some(ex => text.includes(ex.toLowerCase()));
          return hasKeyword && !hasExclude;
        });

        // Filter out products already matched for a previous requirement in this combo
        const availableMatches = potentialMatches.filter(p => !matchedIds.has(p.id));

        if (availableMatches.length > 0) {
          // Default to the first available match
          const match = availableMatches[0];
          matchedIds.add(match.id);
          
          const pUnit = parseUnit(match.unit);
          const multiplier = getMultiplier(pUnit, req.targetUnit, req.targetWeight);
          
          matchedProducts.push({
            selectedProduct: {
              ...match,
              quantity: multiplier,
              aggregatePrice: match.price * multiplier,
              displayUnit: `${multiplier} x ${match.unit || '1 pc'}`
            },
            options: availableMatches.map(m => {
              const mUnit = parseUnit(m.unit);
              const mMult = getMultiplier(mUnit, req.targetUnit, req.targetWeight);
              return {
                ...m,
                quantity: mMult,
                aggregatePrice: m.price * mMult,
                displayUnit: `${mMult} x ${m.unit || '1 pc'}`
              };
            })
          });
          return true;
        }
        return false;
      });

      if (!hasAll) return null;

      // Initial price based on defaults
      const originalPrice = matchedProducts.reduce((sum, p) => sum + p.selectedProduct.aggregatePrice, 0);
      let offerPrice = originalPrice;
      if (offer.discountType === 'flat') {
        offerPrice = Math.max(0, originalPrice - offer.discountValue);
      } else if (offer.discountType === 'percent') {
        offerPrice = Math.round(originalPrice * (1 - offer.discountValue / 100));
      }

      return {
        ...store,
        matchedProducts,
        offerPrice,
        originalPrice,
        discountPercent: Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      };
    }).filter(s => s !== null).sort((a, b) => a.offerPrice - b.offerPrice); // Sort by lowest price
  }, [nearbyStores, offer]);

  // Apply custom selections to eligible stores
  const processedStores = useMemo(() => {
    return eligibleStores.map(store => {
      const selections = customSelections[store.id] || {};
      
      const matchedProducts = store.matchedProducts.map((group, reqIdx) => {
        const selectedIdx = selections[reqIdx] || 0;
        return group.options[selectedIdx] || group.selectedProduct;
      });

      const originalPrice = matchedProducts.reduce((sum, p) => sum + p.aggregatePrice, 0);
      let offerPrice = originalPrice;
      if (offer.discountType === 'flat') {
        offerPrice = Math.max(0, originalPrice - offer.discountValue);
      } else if (offer.discountType === 'percent') {
        offerPrice = Math.round(originalPrice * (1 - offer.discountValue / 100));
      }

      return {
        ...store,
        matchedProducts, // These are the currently selected ones
        rawMatchedProducts: store.matchedProducts, // Keep the options for UI
        offerPrice,
        originalPrice,
        discountPercent: Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      };
    });
  }, [eligibleStores, customSelections]);

  const handleSelectOption = (storeId, reqIndex, optionIndex) => {
    setCustomSelections(prev => ({
      ...prev,
      [storeId]: {
        ...(prev[storeId] || {}),
        [reqIndex]: optionIndex
      }
    }));
  };

  const handleBuyCombo = (store) => {
    // Instead of adding a mock combo, we can add the actual items to the cart,
    // or add a pseudo combo product that bundles them.
    // The safest way that preserves the discount is adding a pseudo combo:
    const comboProduct = {
      id: `${store.id}-${offer.id}`,
      name: t(offer.title),
      price: store.offerPrice,
      originalPrice: store.originalPrice,
      image: store.matchedProducts[0]?.image || null,
      emoji: offer.emoji,
      storeId: store.id,
      storeName: store.name,
      weight: 'Combo Pack',
      isCombo: true,
      comboItems: store.matchedProducts // Keep track of what's inside
    };
    addToCart(comboProduct, 1);
  };

  const handleStorePress = (storeId) => {
    const store = storeService.getStoreById(storeId);
    if (store) {
      navigation.navigate('StoreDetail', { store });
    }
  };

  const renderStoreCard = ({ item: store }) => (
    <View style={styles.storeCard}>
      <View style={styles.cardHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeEmoji}>{store.emoji}</Text>
          <View>
            <Text style={styles.storeName}>{store.name}</Text>
            <View style={styles.metaRow}>
              <View style={styles.ratingBox}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{store.rating}</Text>
              </View>
              {store.deliveryAvailable ? (
                <View style={styles.deliveryBadge}>
                  <Truck size={10} color={COLORS.primary} />
                  <Text style={styles.deliveryText}>
                    {store.deliveryInfo?.deliveryCharge === 0 ? t('Free Delivery') : `₹${store.deliveryInfo?.deliveryCharge} ${t('Delivery')}`}
                  </Text>
                </View>
              ) : (
                <View style={[styles.deliveryBadge, { backgroundColor: COLORS.gray[100] }]}>
                  <MapPin size={10} color={COLORS.gray[500]} />
                  <Text style={[styles.deliveryText, { color: COLORS.gray[500] }]}>{t('Pickup Only')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Show the actual matching products from this store */}
      <View style={styles.matchedProductsContainer}>
        <Text style={styles.matchedProductsTitle}>{t('Products in this combo:')}</Text>
        {store.rawMatchedProducts.map((group, reqIdx) => {
          const selections = customSelections[store.id] || {};
          const selectedIdx = selections[reqIdx] || 0;
          const p = group.options[selectedIdx] || group.selectedProduct;
          
          return (
            <View key={reqIdx} style={styles.requirementGroup}>
              <View style={styles.matchedProductRow}>
                {p.image ? (
                  <Image source={{ uri: p.image }} style={styles.matchedProductImage} />
                ) : (
                  <View style={styles.matchedProductImagePlaceholder}>
                    <Text style={styles.matchedProductEmoji}>📦</Text>
                  </View>
                )}
                <View style={styles.matchedProductInfo}>
                  <Text style={styles.matchedProductName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.matchedProductWeight}>{p.displayUnit}</Text>
                </View>
                <View style={styles.priceColumn}>
                  {p.quantity > 1 && <Text style={styles.unitPriceText}>₹{p.price} / {p.unit || 'pc'}</Text>}
                  <Text style={styles.matchedProductPrice}>₹{p.aggregatePrice}</Text>
                </View>
              </View>
              
              {group.options.length > 1 && (
                <View style={styles.optionsWrapper}>
                  <Text style={styles.optionsLabel}>{t('Preferred Option:')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll} contentContainerStyle={styles.optionsScrollContent}>
                    {group.options.map((opt, optIdx) => (
                      <TouchableOpacity 
                        key={opt.id}
                        style={[styles.optionChip, selectedIdx === optIdx && styles.selectedOptionChip]}
                        onPress={() => handleSelectOption(store.id, reqIdx, optIdx)}
                      >
                        <Text style={[styles.optionText, selectedIdx === optIdx && styles.selectedOptionText]}>
                          {opt.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.logisticsRow}>
        <Text style={styles.logisticsText}>
          {(store.distance ?? 0).toFixed(1)} km away • {store.estimatedDeliveryTime || '30-45 mins'}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <View>
          <View style={styles.originalPriceRow}>
            <Text style={styles.originalPrice}>₹{store.originalPrice}</Text>
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>
                {offer.discountType === 'flat' ? `- ₹${offer.discountValue}` : `- ${offer.discountValue}%`}
              </Text>
            </View>
          </View>
          <Text style={styles.offerPrice}>₹{store.offerPrice}</Text>
        </View>
        <TouchableOpacity 
          style={styles.buyBtn}
          onPress={() => handleBuyCombo(store)}
        >
          <Text style={styles.buyBtnText}>{t('Buy Combo')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{t(offer.title)}</Text>
          <Text style={styles.headerSubtitle}>{t('Select a store to buy this combo')}</Text>
        </View>
      </View>

      {/* Hero Banner Section */}
      <View style={[styles.heroBanner, { backgroundColor: offer.bgColor }]}>
        <Text style={styles.heroEmoji}>{offer.emoji}</Text>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{t(offer.title)}</Text>
          <View style={styles.heroHighlightPill}>
            <Text style={styles.heroHighlightText}>{offer.highlight}</Text>
          </View>
          <Text style={styles.heroDesc}>{t(offer.description)}</Text>
        </View>
        <View style={styles.blob} />
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('Eligible Stores')}</Text>
          <Text style={styles.listCount}>{eligibleStores.length} {t('found')}</Text>
        </View>

        <FlatList
          data={processedStores}
          renderItem={renderStoreCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
              <Text style={styles.emptyTitle}>{t('No stores available')}</Text>
              <Text style={styles.emptyHint}>{t('None of the nearby stores have all the required items for this combo.')}</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.white },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground },
  headerSubtitle: { fontSize: 12, color: COLORS.gray[500], fontWeight: '500' },
  heroBanner: { flexDirection: 'row', alignItems: 'center', margin: SPACING.md, padding: 16, borderRadius: 16, overflow: 'hidden', minHeight: 100 },
  heroEmoji: { fontSize: 48, marginRight: 16, zIndex: 2 },
  heroContent: { flex: 1, zIndex: 2 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroHighlightPill: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  heroHighlightText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  heroDesc: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  blob: { position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  listContainer: { flex: 1, backgroundColor: COLORS.gray[50] },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: 12 },
  listTitle: { fontSize: 16, fontWeight: '800', color: COLORS.foreground },
  listCount: { fontSize: 12, fontWeight: '600', color: COLORS.gray[500] },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 40 },
  storeCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeEmoji: { fontSize: 24, backgroundColor: COLORS.gray[50], padding: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[100], overflow: 'hidden' },
  storeName: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.foreground },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FFF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deliveryText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  
  matchedProductsContainer: { backgroundColor: COLORS.gray[50], borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.gray[100] },
  matchedProductsTitle: { fontSize: 12, fontWeight: '700', color: COLORS.gray[500], marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  matchedProductRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  matchedProductImage: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[200], marginRight: 10 },
  matchedProductImagePlaceholder: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[200], marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  matchedProductEmoji: { fontSize: 16 },
  matchedProductInfo: { flex: 1, justifyContent: 'center' },
  matchedProductName: { fontSize: 13, fontWeight: '700', color: COLORS.foreground, marginBottom: 2 },
  matchedProductWeight: { fontSize: 11, color: COLORS.gray[500], fontWeight: '500' },
  priceColumn: { alignItems: 'flex-end' },
  unitPriceText: { fontSize: 10, color: COLORS.gray[400], marginBottom: 2, fontWeight: '500' },
  matchedProductPrice: { fontSize: 13, fontWeight: '800', color: COLORS.foreground },
  
  requirementGroup: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100], paddingBottom: 12 },
  optionsWrapper: { marginTop: 8, paddingLeft: 42 },
  optionsLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gray[400], marginBottom: 6, textTransform: 'uppercase' },
  optionsScroll: { flexDirection: 'row' },
  optionsScrollContent: { gap: 8, paddingRight: 16 },
  optionChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[200] },
  selectedOptionChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 11, fontWeight: '600', color: COLORS.gray[600] },
  selectedOptionText: { color: COLORS.white },

  logisticsRow: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100], marginBottom: 12 },
  logisticsText: { fontSize: 12, color: COLORS.gray[600], fontWeight: '500' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  originalPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  originalPrice: { fontSize: 13, color: COLORS.gray[400], textDecorationLine: 'line-through', fontWeight: '600' },
  offerPrice: { fontSize: 24, fontWeight: '900', color: COLORS.foreground },
  discountTag: { backgroundColor: COLORS.rose[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: COLORS.rose[100] },
  discountTagText: { fontSize: 11, fontWeight: '800', color: COLORS.rose[600] },
  buyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  buyBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: COLORS.gray[500], textAlign: 'center', paddingHorizontal: 20 }
});
