import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Truck,
  ShoppingBag,
  Filter,
  ArrowDownAZ,
  X,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { storeService } from '../services/storeService';
import { api } from '../services/api';

const FilterChip = ({ id, label, icon: Icon, activeFilters, toggleFilter, t }) => {
  const isActive = activeFilters.includes(id);
  return (
    <TouchableOpacity 
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={() => toggleFilter(id)}
    >
      {Icon && <Icon size={14} color={isActive ? COLORS.white : COLORS.gray[600]} style={{ marginRight: 6 }} />}
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{t(label)}</Text>
      {isActive && <X size={12} color={COLORS.white} style={{ marginLeft: 6 }} />}
    </TouchableOpacity>
  );
};

export default function CategoryMarketplaceScreen({ route, navigation }) {
  const { category } = route.params;
  const { t } = useLanguage();
  const { coords, hasLocation } = useLocation();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('best_match'); // 'best_match', 'price_low', 'price_high', 'rating', 'nearest', 'fastest'
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);

  // 1. Fetch all products from all stores in this category
  const allProducts = useMemo(() => {
    const lat = coords?.latitude;
    const lon = coords?.longitude;
    const stores = storeService.getAllStores(lat, lon);
    
    const combinedProducts = [];
    stores.forEach(store => {
      const searchCat = category === 'All Products' ? null : category;
      const storeProducts = storeService.getStoreProductsByCategory(store, searchCat);
      
      // Efficiently push products with store context
      for (const p of storeProducts) {
        combinedProducts.push({
          ...p,
          store: store
        });
      }
    });
    
    return combinedProducts;
  }, [category, coords?.latitude, coords?.longitude, syncTrigger]);

  useEffect(() => {
    let active = true;
    const fetchAndSync = async () => {
      try {
        setLoading(true);
        const allProd = await api.getProducts();
        if (active) {
          storeService.syncWithBackend(allProd);
          setSyncTrigger(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to sync backend products in CategoryMarketplaceScreen:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAndSync();
    return () => {
      active = false;
    };
  }, [category]);

  // 2. Filter Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q)
      );
    }

    // Active Filters
    if (activeFilters.length > 0) {
      result = result.filter(p => {
        return activeFilters.every(filterId => {
          switch (filterId) {
            case 'free_delivery':
              return p.store.deliveryInfo?.status === 'free';
            case 'pickup_only':
              return p.store.deliveryAvailable === false && p.store.pickupAvailable === true;
            case 'delivery_available':
              return p.store.deliveryAvailable === true && p.store.deliveryInfo?.isDeliverable !== false;
            case 'fast_delivery':
              return p.store.estimatedDeliveryTime && parseInt(p.store.estimatedDeliveryTime) <= 30;
            case 'top_rated_store':
              return Number(p.store.rating || 0) >= 4.2;
            case 'in_stock':
              return p.inStock;
            case 'nearby_5km':
              return p.store.distance !== null && p.store.distance <= 5;
            case 'nearby_10km':
              return p.store.distance !== null && p.store.distance <= 10;
            default:
              return true;
          }
        });
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.store.rating - a.store.rating);
        break;
      case 'nearest':
        result.sort((a, b) => (a.store.distance || 999) - (b.store.distance || 999));
        break;
      case 'fastest':
        result.sort((a, b) => {
          const aTime = parseInt(a.store.estimatedDeliveryTime) || 999;
          const bTime = parseInt(b.store.estimatedDeliveryTime) || 999;
          return aTime - bTime;
        });
        break;
      default:
        // Best match: prioritize nearby AND high rated
        result.sort((a, b) => {
          const aScore = (a.store.rating * 10) - (a.store.distance * 2);
          const bScore = (b.store.rating * 10) - (b.store.distance * 2);
          return bScore - aScore;
        });
    }

    return result;
  }, [allProducts, searchQuery, activeFilters, sortBy]);

  const toggleFilter = useCallback((filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  }, []);

  const renderProductCard = useCallback(({ item: p }) => {
    const isOutOfStock = !p.inStock;

    return (
      <View style={styles.productCard}>
        <View style={styles.cardMain}>
          <Image source={{ uri: p.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
              <View style={styles.ratingBox}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{p.rating}</Text>
              </View>
            </View>
            <Text style={styles.brandText}>{p.brand}</Text>
            <Text style={styles.weightText}>{p.unit}</Text>
            
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.originalPrice}>₹{p.originalPrice}</Text>
                <Text style={styles.price}>₹{p.price}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, isOutOfStock && styles.disabledBtn]}
                onPress={() => !isOutOfStock && addToCart(p, 1)}
                disabled={isOutOfStock}
              >
                <Text style={styles.addBtnText}>{isOutOfStock ? t('Out of Stock') : t('Add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.storeDivider} />

        <View style={styles.storeInfoRow}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeEmoji}>{p.store.emoji}</Text>
            <View>
                <Text style={styles.storeName} numberOfLines={1}>{p.store.name}</Text>
                <View style={styles.logisticsRow}>
                  <View style={styles.storeRatingTiny}>
                    <Star size={8} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.storeRatingTextTiny}>{p.store.rating}</Text>
                  </View>
                  <Text style={styles.logisticsDivider}> • </Text>
                  <MapPin size={10} color={COLORS.gray[400]} />
                  <Text style={styles.logisticsText}>{(p.store.distance ?? '0.0')} km • </Text>
                <Clock size={10} color={COLORS.gray[400]} />
                <Text style={styles.logisticsText}>{p.store.estimatedDeliveryTime || '30 mins'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.deliveryBadgeContainer}>
            {p.store.deliveryAvailable ? (
              <View style={[styles.deliveryBadge, p.store.deliveryInfo?.status === 'free' && styles.freeDeliveryBadge]}>
                <Truck size={10} color={p.store.deliveryInfo?.status === 'free' ? COLORS.primary : COLORS.gray[500]} />
                <Text style={[styles.deliveryBadgeText, p.store.deliveryInfo?.status === 'free' && styles.freeDeliveryBadgeText]}>
                  {p.store.deliveryInfo?.message || t('Delivery')}
                </Text>
              </View>
            ) : (
              <View style={styles.pickupBadge}>
                <ShoppingBag size={10} color={COLORS.saffron[600]} />
                <Text style={styles.pickupBadgeText}>{t('Pickup Only')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }, [addToCart, t]);



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t(category)}</Text>
          <Text style={styles.headerSubtitle}>{filteredProducts.length} {t('Products Available')}</Text>
        </View>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Search size={22} color={COLORS.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.gray[400]} />
          <TextInput
            placeholder={`${t('Search in')} ${t(category)}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={COLORS.gray[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setIsFilterVisible(true)}>
            <SlidersHorizontal size={14} color={COLORS.foreground} />
            <Text style={styles.sortBtnText}>{t('Filter')}</Text>
          </TouchableOpacity>
          <View style={styles.filterDivider} />
          <FilterChip id="free_delivery" label="Free Delivery" icon={Truck} activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />
          <FilterChip id="nearby_5km" label="Within 5km" icon={MapPin} activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />
          <FilterChip id="in_stock" label="In Stock" activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />
          <FilterChip id="fast_delivery" label="Fast Delivery" icon={Clock} activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />
          <FilterChip id="delivery_available" label="Delivery" activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />
          <FilterChip id="pickup_only" label="Pickup" icon={ShoppingBag} activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />
          <FilterChip id="top_rated_store" label="Top Stores" icon={Star} activeFilters={activeFilters} toggleFilter={toggleFilter} t={t} />

          {activeFilters.length > 0 && (
            <TouchableOpacity 
              style={styles.clearAllBtn}
              onPress={() => setActiveFilters([])}
            >
              <X size={14} color={COLORS.rose[500]} style={{ marginRight: 4 }} />
              <Text style={styles.clearAllText}>{t('Clear All')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Fetching marketplace deals...')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <ShoppingBag size={48} color={COLORS.gray[300]} />
              </View>
              <Text style={styles.emptyTitle}>{t('No Products Found')}</Text>
              <Text style={styles.emptySubtitle}>{t('Try adjusting your filters or search query to find products.')}</Text>
              <TouchableOpacity 
                style={styles.resetBtn}
                onPress={() => {
                  setActiveFilters([]);
                  setSearchQuery('');
                  setSortBy('best_match');
                }}
              >
                <Text style={styles.resetBtnText}>{t('Reset All Filters')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Sorting Bottom Sheet Simulation (Simplified for now) */}
      {isFilterVisible && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsFilterVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('Sort & Filter')}</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <X size={24} color={COLORS.foreground} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sheetSectionTitle}>{t('Sort By')}</Text>
            <View style={styles.sortGrid}>
              {[
                { id: 'best_match', label: 'Best Match' },
                { id: 'price_low', label: 'Lowest Price' },
                { id: 'price_high', label: 'Highest Price' },
                { id: 'rating', label: 'Top Rated Store' },
                { id: 'nearest', label: 'Nearest Store' },
                { id: 'fastest', label: 'Fastest Delivery' },
              ].map(option => (
                <TouchableOpacity 
                  key={option.id}
                  style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
                  onPress={() => {
                    setSortBy(option.id);
                  }}
                >
                  <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
                    {t(option.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity 
                style={styles.sheetResetBtn}
                onPress={() => {
                  setSortBy('best_match');
                  setActiveFilters([]);
                }}
              >
                <Text style={styles.sheetResetBtnText}>{t('Reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyBtn}
                onPress={() => setIsFilterVisible(false)}
              >
                <Text style={styles.applyBtnText}>{t('Show Products')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  filtersWrapper: {
    marginBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    paddingBottom: 4,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: 12,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.rose[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.rose[100],
    marginLeft: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.rose[600],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 8,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.foreground,
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 2,
  },
  brandText: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
    marginTop: 1,
  },
  weightText: {
    fontSize: 11,
    color: COLORS.gray[400],
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.gray[300],
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  disabledBtn: {
    backgroundColor: COLORS.gray[100],
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  storeDivider: {
    height: 1,
    backgroundColor: COLORS.gray[50],
    marginHorizontal: 12,
  },
  storeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.gray[50],
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.foreground,
    maxWidth: 150,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  storeRatingTiny: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  storeRatingTextTiny: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 2,
  },
  logisticsDivider: {
    fontSize: 10,
    color: COLORS.gray[300],
  },
  logisticsText: {
    fontSize: 10,
    color: COLORS.gray[500],
    fontWeight: '600',
    marginLeft: 2,
  },
  deliveryBadgeContainer: {
    alignItems: 'flex-end',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  freeDeliveryBadge: {
    backgroundColor: '#F0FFF4',
    borderColor: '#C6F6D5',
  },
  deliveryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray[500],
    marginLeft: 3,
  },
  freeDeliveryBadgeText: {
    color: COLORS.primary,
  },
  pickupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEEBC8',
  },
  pickupBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.saffron[600],
    marginLeft: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  sheetSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 16,
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    minWidth: '47%',
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2,
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetResetBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  sheetResetBtnText: {
    color: COLORS.foreground,
    fontSize: 16,
    fontWeight: '700',
  }
});
