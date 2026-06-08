import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, MapPin, Star, Clock, Truck, Search, X, Phone, Navigation, Heart, ShoppingBag } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useFavorites } from '../context/FavoriteContext';
import { storeService } from '../services/storeService';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useCart } from '../context/CartContext';
import { generateStoreOffers } from '../data/campaigns';

export default function StoreDetailScreen({ route, navigation }) {
  const { store } = route.params;
  const { t } = useLanguage();
  const { coords } = useLocation();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { getCartTotal, getStoreSubtotal, addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  
  const storeSubtotal = getStoreSubtotal(store.id);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Dynamic height based on expansion
  const headerHeightThreshold = detailsExpanded ? 350 : 220; 

  const handleBuyCombo = (offer) => {
    const comboProduct = {
      id: offer.id,
      name: t(offer.title),
      price: offer.offerPrice,
      originalPrice: offer.originalPrice,
      image: null,
      emoji: offer.emoji,
      storeId: storeData.id,
      storeName: storeData.name,
      weight: 'Combo Pack',
      isCombo: true
    };
    addToCart(comboProduct, 1);
  };

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [headerHeightThreshold, headerHeightThreshold + 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [headerHeightThreshold, headerHeightThreshold + 40],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });

  const storeData = useMemo(() => {
    return storeService.getStoreById(store.id, coords?.latitude, coords?.longitude, storeSubtotal) || store;
  }, [store.id, coords?.latitude, coords?.longitude, storeSubtotal]);

  const delInfo = useMemo(() => {
    return storeData?.deliveryInfo;
  }, [storeData]);

  // Generate store-specific combo offers
  const storeOffers = useMemo(() => {
    return generateStoreOffers(storeData);
  }, [storeData]);

  const isFav = isFavorite(storeData.id);
  const allProducts = useMemo(() => storeService.getStoreProducts(storeData), [storeData.id]);

  const displayProducts = useMemo(() => {
    let filtered = selectedCategory
      ? allProducts.filter(p => p.category === selectedCategory)
      : allProducts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allProducts, selectedCategory, searchQuery]);

  const renderCategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipScroll}
    >
      <TouchableOpacity
        style={[styles.chip, !selectedCategory && styles.chipActive]}
        onPress={() => setSelectedCategory(null)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
          {t('All')} ({allProducts.length})
        </Text>
      </TouchableOpacity>
      {storeData.categories.map(cat => {
        const count = allProducts.filter(p => p.category === cat).length;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {t(cat)} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { zIndex: 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{storeData.name}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            style={[styles.searchBtn, { backgroundColor: isFav ? 'rgba(225, 29, 72, 0.1)' : COLORS.gray[50] }]} 
            onPress={() => toggleFavorite(storeData.id)}
          >
            <Heart size={20} color={isFav ? COLORS.rose[500] : COLORS.foreground} fill={isFav ? COLORS.rose[500] : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBtn} onPress={() => { setSearchVisible(!searchVisible); setSearchQuery(''); }}>
            {searchVisible ? <X size={20} color={COLORS.foreground} /> : <Search size={20} color={COLORS.foreground} />}
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <View style={{ marginBottom: SPACING.sm, zIndex: 20 }}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      )}

      {/* Store Info Card - NOW STABLE AT TOP */}
      <View style={styles.compactInfoCard}>
        <View style={styles.compactHeader}>
          <View style={styles.compactEmojiBox}>
            <Text style={{ fontSize: 28 }}>{storeData.emoji}</Text>
          </View>
          <View style={styles.compactMainInfo}>
            <Text style={styles.compactStoreName}>{storeData.name}</Text>
            <View style={styles.compactMetaRow}>
              <View style={styles.compactRatingBox}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.compactRatingText}>{storeData.rating}</Text>
              </View>
              <Text style={styles.compactDot}>•</Text>
              <Text style={styles.compactAreaText}>{storeData.area}</Text>
              <Text style={styles.compactDot}>•</Text>
              <Text style={styles.compactDistText}>{storeData.distance} km</Text>
            </View>
          </View>
          <View style={[
            styles.compactStatusBadge, 
            { backgroundColor: storeData.status.bgColor }
          ]}>
            <Text style={[
              styles.compactStatusText, 
              { color: storeData.status.color }
            ]}>
              {t(storeData.status.label)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.expandToggle} 
          onPress={() => setDetailsExpanded(!detailsExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandToggleText}>
            {detailsExpanded ? t('Hide Store Details') : t('View Store Details')}
          </Text>
          <View style={[styles.expandIconBox, detailsExpanded && { transform: [{ rotate: '180deg' }] }]}>
            <ChevronDown size={14} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {detailsExpanded && (
          <>
            {/* Store Location & Timing Section - RESTORED */}
            <View style={styles.locationSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <MapPin size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('Address')}</Text>
                  <Text style={styles.infoValue}>
                    {storeData.address}, {storeData.area}, {storeData.city} - {storeData.zipCode}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Clock size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('Store Timing')}</Text>
                  <Text style={styles.infoValue}>
                    {storeData.openTime} – {storeData.closeTime} • {t(storeData.status.label)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Delivery Information Card - Re-aligned & Professional */}
            <View style={styles.deliveryCard}>
              {!storeData.deliveryAvailable ? (
                <View style={styles.pickupOnlyCard}>
                  <View style={styles.pickupHeader}>
                    <View style={styles.pickupEmojiBox}>
                      <Text style={{ fontSize: 20 }}>🛍️</Text>
                    </View>
                    <View>
                      <Text style={styles.pickupTitle}>{t('Pickup Only')}</Text>
                      <Text style={styles.pickupSubtitle}>{t('Self pickup available at store')}</Text>
                    </View>
                  </View>
                </View>
              ) : delInfo?.status === 'out_of_range' ? (
                <View style={styles.pickupOnlyCard}>
                  <View style={styles.pickupHeader}>
                    <View style={[styles.pickupEmojiBox, { backgroundColor: COLORS.rose[50] }]}>
                      <MapPin size={20} color={COLORS.rose[500]} />
                    </View>
                    <View>
                      <Text style={[styles.pickupTitle, { color: COLORS.rose[600] }]}>{t('Not Deliverable')}</Text>
                      <Text style={styles.pickupSubtitle}>{t('Delivery not available for your location')}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.deliveryGrid}>
                  {/* Delivery Fee Section */}
                  <View style={styles.deliveryGridItem}>
                    <Truck size={18} color={COLORS.primary} />
                    <View style={styles.deliveryItemContent}>
                      <Text style={styles.deliveryMainText}>
                        {delInfo?.deliveryCharge === 0 ? t('FREE') : `₹${delInfo?.deliveryCharge}`}
                      </Text>
                      <Text style={styles.deliverySubText}>
                        {delInfo?.deliveryCharge === 0 ? t('Delivery') : t('Delivery Fee')}
                      </Text>
                    </View>
                  </View>

                  {/* Delivery Time Section */}
                  <View style={styles.deliveryGridItem}>
                    <Clock size={18} color={COLORS.gray[400]} />
                    <View style={styles.deliveryItemContent}>
                      <Text style={styles.deliveryMainText}>{delInfo?.estimatedTime || '30-45 mins'}</Text>
                      <Text style={styles.deliverySubText}>{t('Delivery Time')}</Text>
                    </View>
                  </View>

                  {/* Delivery Area / Distance Info Section */}
                  <View style={styles.deliveryGridItem}>
                    <Navigation size={18} color={COLORS.gray[400]} />
                    <View style={styles.deliveryItemContent}>
                      <Text style={styles.deliveryMainText}>
                        {t('Delivery within')} {delInfo?.maxRadius || 15} km
                      </Text>
                      <Text style={styles.deliverySubText}>
                        {delInfo?.freeDistance > 0 
                          ? `${t('Free within')} ${delInfo.freeDistance} km`
                          : t('Delivery Area')}
                      </Text>
                    </View>
                  </View>

                  {/* Minimum Order Section */}
                  {delInfo?.minOrder > 0 && (
                    <View style={styles.deliveryGridItem}>
                      <ShoppingBag size={18} color={COLORS.rose[500]} />
                      <View style={styles.deliveryItemContent}>
                        <Text style={styles.deliveryMainText}>₹{delInfo.minOrder}</Text>
                        <Text style={styles.deliverySubText}>{t('Minimum Order')}</Text>
                      </View>
                    </View>
                  )}

                  {/* Free Delivery Logic Message */}
                  <View style={styles.freeDeliveryUnlock}>
                    <View style={styles.unlockHeader}>
                      <Truck size={14} color={delInfo?.deliveryCharge === 0 ? COLORS.emerald[600] : COLORS.primary} />
                      <Text style={[styles.unlockText, delInfo?.deliveryCharge === 0 && { color: COLORS.emerald[700] }]}>
                        {delInfo?.minOrder > 0 && storeSubtotal < delInfo.minOrder
                          ? `${t('Min order ₹')}${delInfo.minOrder} ${t('required for delivery')}`
                          : delInfo?.deliveryCharge === 0 
                            ? t('You are eligible for free delivery') 
                            : `${t('Free delivery on orders above')} ₹${delInfo?.freeThreshold || 500}`}
                      </Text>
                    </View>
                    
                    {delInfo?.minOrder > 0 && storeSubtotal > 0 && storeSubtotal < delInfo.minOrder ? (
                      <>
                        <Text style={styles.progressHint}>
                          {t('Add')} ₹{Math.max(0, delInfo.minOrder - storeSubtotal)} {t('more to place order')}
                        </Text>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { backgroundColor: COLORS.rose[500], width: `${Math.min(100, (storeSubtotal / delInfo.minOrder) * 100)}%` }]} />
                        </View>
                      </>
                    ) : delInfo?.deliveryCharge > 0 && storeSubtotal > 0 && (
                      <>
                        <Text style={styles.progressHint}>
                          {t('Add')} ₹{Math.max(0, (delInfo?.freeThreshold || 500) - storeSubtotal)} {t('more for free delivery')}
                        </Text>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${Math.min(100, (storeSubtotal / (delInfo?.freeThreshold || 500)) * 100)}%` }]} />
                        </View>
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Categories Filter - NOW STABLE AT TOP */}
      <View style={styles.categoriesContainer}>
        {renderCategoryChips()}
      </View>

      {/* Main Content */}
      <Animated.FlatList
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        data={displayProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <>
            {/* Offer Zone */}
            {!selectedCategory && storeOffers && storeOffers.length > 0 && (
              <View style={styles.offerZoneContainer}>
                <View style={styles.offerZoneHeader}>
                  <Text style={{ fontSize: 20 }}>🔥</Text>
                  <Text style={styles.offerZoneTitle}>{t('Offer Zone')}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerScroll}>
                  {storeOffers.map(offer => (
                    <TouchableOpacity key={offer.id} style={styles.storeOfferCard} activeOpacity={0.9}>
                      <View style={styles.storeOfferTop}>
                        <View style={styles.storeOfferIconBox}>
                          <Text style={styles.storeOfferIcon}>{offer.emoji}</Text>
                        </View>
                        <View style={styles.storeOfferDiscount}>
                          <Text style={styles.storeOfferDiscountText}>{offer.discountPercent}% OFF</Text>
                        </View>
                      </View>
                      <Text style={styles.storeOfferTitle}>{t(offer.title)}</Text>
                      <Text style={styles.storeOfferItems} numberOfLines={2}>
                        {offer.items.map(i => t(i)).join(' • ')}
                      </Text>
                      <View style={styles.storeOfferPriceRow}>
                        <View>
                          <Text style={styles.storeOfferOriginalPrice}>₹{offer.originalPrice}</Text>
                          <Text style={styles.storeOfferPrice}>₹{offer.offerPrice}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.buyComboBtn}
                          onPress={() => handleBuyCombo(offer)}
                        >
                          <Text style={styles.buyComboBtnText}>{t('Buy Combo')}</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={{ paddingHorizontal: SPACING.md, marginTop: 12 }}>
              <Text style={styles.resultCount}>
                {displayProducts.length} {t('products')}
                {selectedCategory ? ` ${t('in')} ${t(selectedCategory)}` : ''}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            navigation={navigation} 
            isDeliverable={delInfo?.isDeliverable !== false}
            storeOpen={storeData.isOpen} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🔍</Text>
            <Text style={styles.emptyText}>{t('No products found')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  stickyCategoryBar: {
    position: 'absolute',
    top: 60, // Height of header
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, height: 56 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  // Compact Detail Styles
  compactInfoCard: { 
    marginHorizontal: SPACING.md, 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    padding: 16, 
    marginTop: 10,
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: COLORS.gray[100], 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    elevation: 3 
  },
  compactHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  compactEmojiBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  compactMainInfo: { flex: 1 },
  compactStoreName: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, marginBottom: 2 },
  compactMetaRow: { flexDirection: 'row', alignItems: 'center' },
  compactRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  compactRatingText: { fontSize: 11, fontWeight: '700', color: COLORS.foreground },
  compactDot: { fontSize: 11, color: COLORS.gray[300], marginHorizontal: 4 },
  compactAreaText: { fontSize: 11, color: COLORS.gray[500], fontWeight: '600' },
  compactDistText: { fontSize: 11, color: COLORS.primary, fontWeight: '800' },
  compactStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  compactStatusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },

  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  expandIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },

  deliveryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    marginBottom: 8,
  },
  deliveryGrid: {
    gap: 16,
  },
  deliveryGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryItemContent: {
    flex: 1,
  },
  deliveryMainText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  deliverySubText: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
    marginTop: 1,
  },
  freeDeliveryUnlock: {
    marginTop: 8,
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.1)',
  },
  unlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  unlockText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald[700],
  },
  progressHint: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[500],
    marginBottom: 8,
    marginTop: -2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.emerald[500],
    borderRadius: 3,
  },
  locationSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
    lineHeight: 18,
  },
  pickupOnlyCard: {
    paddingVertical: 4,
  },
  pickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickupEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  pickupSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
  },

  chipScroll: { paddingHorizontal: SPACING.md, gap: 10, alignItems: 'center' },
  categoriesContainer: { 
    backgroundColor: COLORS.white, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.gray[100],
    marginBottom: 4
  },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22, 
    backgroundColor: COLORS.gray[50], 
    borderWidth: 1, 
    borderColor: COLORS.gray[200],
    minWidth: 60
  },
  chipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  chipText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: COLORS.gray[500],
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  chipTextActive: { color: '#fff' },
  listContent: { padding: SPACING.md, paddingBottom: 120 },
  resultCount: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: COLORS.gray[400], 
    marginBottom: 12, 
    paddingHorizontal: 4, 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.gray[400], fontWeight: '600', marginTop: 12 },
  
  // Offer Zone Styles
  offerZoneContainer: { paddingVertical: SPACING.md, backgroundColor: '#FFFBF0', borderBottomWidth: 1, borderBottomColor: '#FFE8B2', marginBottom: 12 },
  offerZoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, marginBottom: 12 },
  offerZoneTitle: { fontSize: 16, fontWeight: '800', color: COLORS.foreground },
  offerScroll: { paddingHorizontal: SPACING.md, gap: 12, paddingBottom: 8 },
  storeOfferCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 12, width: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#FFE8B2' },
  storeOfferTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  storeOfferIconBox: { backgroundColor: '#FFFBF0', padding: 6, borderRadius: 10 },
  storeOfferIcon: { fontSize: 20 },
  storeOfferDiscount: { backgroundColor: COLORS.rose[500], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  storeOfferDiscountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  storeOfferTitle: { fontSize: 14, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  storeOfferItems: { fontSize: 11, color: COLORS.gray[500], lineHeight: 16, fontWeight: '500', marginBottom: 8, height: 32 },
  storeOfferPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.gray[100] },
  storeOfferOriginalPrice: { fontSize: 12, color: COLORS.gray[400], textDecorationLine: 'line-through', fontWeight: '600' },
  storeOfferPrice: { fontSize: 16, fontWeight: '900', color: COLORS.foreground },
  buyComboBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyComboBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
