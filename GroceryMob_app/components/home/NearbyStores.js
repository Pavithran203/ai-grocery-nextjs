import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MapPin, Star, Clock, Truck, ChevronRight, Navigation, LocateFixed, Map as MapIcon, Heart, Filter } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { useFavorites } from '../../context/FavoriteContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import StoreFilters from './StoreFilters';
import LoginPromptModal from '../LoginPromptModal';

export default function NearbyStores({ navigation }) {
  const { t } = useLanguage();
  const { coords, hasLocation, loading, requestLocation } = useLocation();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Get all nearby stores (unsorted for metadata)
  const allStores = useMemo(() => {
    if (!hasLocation) return [];
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 20, []);
  }, [hasLocation, coords?.latitude, coords?.longitude]);

  // Get sorted list for display
  const allNearbyStores = useMemo(() => {
    if (!hasLocation) return [];
    let result = storeService.getNearbyStores(
      coords.latitude, 
      coords.longitude, 
      20, 
      favorites
    );
    result = storeService.filterStores(result, activeFilters);
    return result;
  }, [hasLocation, coords?.latitude, coords?.longitude, favorites, activeFilters]);

  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleStorePress = (store) => {
    navigation.navigate('StoreDetail', { store });
  };

  const handleToggleFavorite = (storeId) => {
    if (!user || user.isGuest) {
      setShowLoginModal(true);
      return;
    }
    toggleFavorite(storeId);
  };

  const handleEnableLocation = async () => {
    await requestLocation();
  };

  const clearFilters = () => setActiveFilters([]);

  // No location — show prompt
  if (!hasLocation && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <MapPin size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>{t('Nearby Stores')}</Text>
              <Text style={styles.subtitle}>{t('Discover local grocery stores')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptEmoji}>📍</Text>
          <Text style={styles.promptTitle}>{t('Enable location to find stores near you')}</Text>
          <Text style={styles.promptDesc}>
            {t('We need your location to show nearby Kirana stores and calculate delivery distance.')}
          </Text>
          <View style={styles.promptActions}>
            <TouchableOpacity style={styles.enableBtn} onPress={handleEnableLocation}>
              <LocateFixed size={16} color="#fff" />
              <Text style={styles.enableBtnText}>{t('Enable Location')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zipBtn} onPress={() => navigation.navigate('StoresTab')}>
              <Text style={styles.zipBtnText}>{t('Use ZIP Code')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Loading state — show header + skeleton instead of returning null
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <MapPin size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>{t('Nearby Stores')}</Text>
              <Text style={styles.subtitle}>{t('Finding stores...')}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // No stores found at all (BEFORE any filters) — genuinely no stores nearby
  if (allStores.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <MapPin size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>{t('Nearby Stores')}</Text>
              <Text style={styles.subtitle}>{t('No stores found nearby')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('StoresTab')}>
            <Text style={styles.seeAllText}>{t('Browse All')}</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🏪</Text>
          <Text style={styles.emptyText}>{t('No grocery stores found in your area. Try browsing all stores.')}</Text>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => navigation.navigate('StoresTab')}>
            <Text style={styles.clearFiltersBtnText}>{t('View All Stores')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Determine which filter label to show in empty message
  const getActiveFilterLabel = () => {
    if (activeFilters.length === 0) return '';
    const filterLabels = {
      'open_now': 'Open Now',
      'free_delivery': 'Free Delivery',
      'pickup_only': 'Pickup Only',
      'top_rated': 'Top Rated',
      'nearby_3km': 'Within 3 km',
    };
    return activeFilters.map(f => t(filterLabels[f] || f)).join(', ');
  };

  const renderStore = ({ item: store }) => {
    const isFav = isFavorite(store.id);
    const delInfo = store.deliveryInfo;
    const status = store.status;
    const isClosed = status.type === 'CLOSED' || status.type === 'CLOSED_TODAY';
    
    return (
      <TouchableOpacity 
        style={[styles.card, isClosed && styles.cardDisabled]} 
        activeOpacity={isClosed ? 1 : 0.85} 
        onPress={() => !isClosed && handleStorePress(store)}
      >
        <View style={styles.cardTop}>
          <View style={[styles.storeEmoji, isClosed && { backgroundColor: COLORS.gray[100] }]}>
            <Text style={{ fontSize: 22, opacity: isClosed ? 0.5 : 1 }}>{store.emoji}</Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.favBtn} 
              onPress={() => handleToggleFavorite(store.id)}
            >
              <Heart 
                size={16} 
                color={isFav ? COLORS.rose[500] : COLORS.gray[400]} 
                fill={isFav ? COLORS.rose[500] : 'transparent'} 
              />
            </TouchableOpacity>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {t(status.label)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.storeName, isClosed && { color: COLORS.gray[400] }]} numberOfLines={1}>
          {store.name}
        </Text>
        <View style={styles.typePill}>
          <Text style={styles.typeText}>{t(store.storeType)}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Star size={12} color={isClosed ? COLORS.gray[300] : "#F59E0B"} fill={isClosed ? COLORS.gray[300] : "#F59E0B"} />
            <Text style={[styles.ratingText, isClosed && { color: COLORS.gray[400] }]}>{store.rating}</Text>
          </View>
          <View style={styles.distanceBox}>
            <Navigation size={11} color={isClosed ? COLORS.gray[300] : COLORS.primary} />
            <Text style={[styles.distanceText, isClosed && { color: COLORS.gray[400] }]}>{store.distance} km</Text>
          </View>
          <View style={styles.pinBox}>
            <Text style={styles.pinText}>{store.zipCode}</Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          {delInfo && delInfo.isDeliverable && store.deliveryAvailable ? (
            <View style={[
              styles.deliveryBadge, 
              { backgroundColor: delInfo.status === 'free' ? '#ECFDF5' : '#F0FFF4' }
            ]}>
              <Truck size={10} color={COLORS.primary} />
              <Text style={styles.deliveryText}>
                {delInfo.isWithinFreeDistance ? t('Free Delivery') : t(delInfo.message)}
              </Text>
            </View>
          ) : store.pickupAvailable ? (
            <View style={[styles.deliveryBadge, { backgroundColor: COLORS.gray[100] }]}>
              <MapPin size={10} color={COLORS.gray[500]} />
              <Text style={[styles.deliveryText, { color: COLORS.gray[600] }]}>{t('Pickup Only')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.timingRow}>
          <Clock size={11} color={COLORS.gray[400]} />
          <Text style={styles.timingText}>{store.openTime} – {store.closeTime}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Nearby Stores Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <MapPin size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>{t('Nearby Stores')}</Text>
            <Text style={styles.subtitle}>{allStores.length} {t('trusted local stores near you')}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.seeAllBtn} 
            onPress={() => navigation.navigate('NearbyStoresMap')}
          >
            <MapIcon size={14} color={COLORS.primary} />
            <Text style={styles.seeAllText}>{t('View Map')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('StoresTab')}>
            <Text style={styles.seeAllText}>{t('See All')}</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters — always visible when stores exist */}
      <StoreFilters 
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={clearFilters}
        showModal={showFilterModal}
        setShowModal={setShowFilterModal}
      />

      {/* Store list or filter-empty message */}
      {allNearbyStores.length > 0 ? (
        <FlatList
          data={allNearbyStores}
          renderItem={renderStore}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
        />
      ) : (
        <View style={styles.filterEmptyContainer}>
          <Text style={styles.filterEmptyEmoji}>🔍</Text>
          <Text style={styles.filterEmptyTitle}>
            {t('No stores match')} "{getActiveFilterLabel()}"
          </Text>
          <Text style={styles.filterEmptyDesc}>
            {t('No related stores available nearby for this filter. Try a different filter or browse all stores.')}
          </Text>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
            <Text style={styles.clearFiltersBtnText}>{t('Clear All Filters')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <LoginPromptModal 
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigation.navigate('Login');
        }}
        onSignup={() => {
          setShowLoginModal(false);
          navigation.navigate('Signup');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.md, marginBottom: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  subtitle: { fontSize: 11, color: COLORS.gray[500], fontWeight: '600' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FFF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  seeAllText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  // Store card
  card: { width: 210, backgroundColor: COLORS.white, borderRadius: 18, padding: 14, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] },
  cardDisabled: { opacity: 0.8, backgroundColor: COLORS.gray[50], borderColor: COLORS.gray[200] },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  favBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray[100], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  storeEmoji: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800' },
  storeName: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  typePill: { backgroundColor: '#F4F9F4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10 },
  typeText: { fontSize: 10, fontWeight: '700', color: '#3D6B4A' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '800', color: COLORS.foreground },
  distanceBox: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FFF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  distanceText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  pinBox: { backgroundColor: COLORS.gray[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: COLORS.gray[200] },
  pinText: { fontSize: 10, fontWeight: '800', color: COLORS.gray[500] },
  badgesRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  deliveryText: { fontSize: 9, fontWeight: '800', color: COLORS.primary },
  freeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#059669' },
  freeText: { fontSize: 9, fontWeight: '900', color: '#059669' },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timingText: { fontSize: 10, fontWeight: '600', color: COLORS.gray[400] },
  // Prompt card
  promptCard: { marginHorizontal: SPACING.md, backgroundColor: COLORS.white, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray[100], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  promptEmoji: { fontSize: 40, marginBottom: 12 },
  promptTitle: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, textAlign: 'center', marginBottom: 8 },
  promptDesc: { fontSize: 13, color: COLORS.gray[500], textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  promptActions: { flexDirection: 'row', gap: 10 },
  enableBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  enableBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  zipBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray[200] },
  zipBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.gray[500] },
  // Empty state
  emptyContainer: { padding: 30, alignItems: 'center', backgroundColor: COLORS.gray[50], marginHorizontal: SPACING.md, borderRadius: 20, borderWidth: 1, borderColor: COLORS.gray[100], borderStyle: 'dashed' },
  emptyText: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  clearFiltersBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  clearFiltersBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  // Filter empty state
  filterEmptyContainer: { padding: 24, alignItems: 'center', backgroundColor: '#FFFBF0', marginHorizontal: SPACING.md, borderRadius: 20, borderWidth: 1, borderColor: '#FFE8B2', marginBottom: SPACING.sm },
  filterEmptyEmoji: { fontSize: 36, marginBottom: 8 },
  filterEmptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, textAlign: 'center', marginBottom: 6 },
  filterEmptyDesc: { fontSize: 12, color: COLORS.gray[500], fontWeight: '600', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
});
