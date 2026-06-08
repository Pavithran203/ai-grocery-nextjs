import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Star, Clock, Truck, Search, X, Navigation, LocateFixed, Phone, Store } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { storeService } from '../services/storeService';
import StoreFilters from '../components/home/StoreFilters';

export default function StoresScreen({ navigation }) {
  const { t } = useLanguage();
  const { coords, hasLocation, loading, requestLocation, permissionStatus } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState(hasLocation ? 'nearby' : 'zip');
  const [zipInput, setZipInput] = useState('');
  const [zipStores, setZipStores] = useState([]);
  const [requesting, setRequesting] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const nearbyStores = useMemo(() => {
    if (!hasLocation) return [];
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 15);
  }, [hasLocation, coords?.latitude, coords?.longitude]);

  const allStores = useMemo(() => {
    return storeService.getAllStores(coords?.latitude, coords?.longitude);
  }, [coords?.latitude, coords?.longitude]);

  const activeStores = filterMode === 'nearby' ? nearbyStores : filterMode === 'zip' ? zipStores : allStores;

  const displayStores = useMemo(() => {
    let result = storeService.searchStores(searchQuery, activeStores);
    result = storeService.filterStores(result, activeFilters);
    return result;
  }, [activeStores, searchQuery, activeFilters]);

  const clearFilters = () => setActiveFilters([]);

  const handleStorePress = (store) => {
    navigation.navigate('StoreDetail', { store });
  };

  const handleNearbyPress = async () => {
    setFilterMode('nearby');
    if (!hasLocation) {
      setRequesting(true);
      await requestLocation();
      setRequesting(false);
    }
  };

  const handleAllPress = () => {
    setFilterMode('all');
  };

  const handleZipSubmit = () => {
    if (zipInput.length >= 5) {
      const results = storeService.getStoresByZip(zipInput);
      setZipStores(results);
      setFilterMode('zip');
    }
  };

  const renderStore = ({ item: store }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => handleStorePress(store)}>
      <View style={styles.cardRow}>
        <View style={styles.storeEmoji}>
          <Text style={{ fontSize: 28 }}>{store.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? '#ECFDF5' : '#FEF2F2' }]}>
              <View style={[styles.statusDot, { backgroundColor: store.isOpen ? '#059669' : '#EF4444' }]} />
              <Text style={[styles.statusText, { color: store.isOpen ? '#059669' : '#EF4444' }]}>
                {store.isOpen ? t('Open') : t('Closed')}
              </Text>
            </View>
          </View>

          <Text style={styles.storeType}>{t(store.storeType)} • {store.area}</Text>
          <Text style={styles.address} numberOfLines={1}>{store.address}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{store.rating}</Text>
            </View>
            {store.distance != null && (
              <View style={styles.distanceBox}>
                <Navigation size={11} color={COLORS.primary} />
                <Text style={styles.distanceText}>{store.distance} km</Text>
              </View>
            )}
            <View style={styles.pinBox}>
              <Text style={styles.pinText}>{store.zipCode}</Text>
            </View>
          </View>

          <View style={styles.deliveryRow}>
            {store.deliveryAvailable ? (
              <View style={[styles.deliveryBadge, { backgroundColor: store.deliveryInfo?.status === 'free' ? '#ECFDF5' : '#F0FFF4' }]}>
                <Truck size={11} color={COLORS.primary} />
                <Text style={styles.deliveryText}>
                  {store.deliveryInfo?.status === 'free' 
                    ? t('FREE DELIVERY') 
                    : `${t('₹')}${store.deliveryInfo?.deliveryCharge || 40} ${t('DELIVERY')}`}
                </Text>
              </View>
            ) : (
              <View style={[styles.deliveryBadge, { backgroundColor: COLORS.gray[100] }]}>
                <MapPin size={11} color={COLORS.gray[500]} />
                <Text style={[styles.deliveryText, { color: COLORS.gray[500] }]}>{t('Pickup Only')}</Text>
              </View>
            )}
          </View>

          <View style={styles.timingRow}>
            <Clock size={11} color={COLORS.gray[400]} />
            <Text style={styles.timingText}>{store.openTime} – {store.closeTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {filterMode === 'all' ? t('All Stores') : 
           filterMode === 'zip' ? t('Stores by ZIP') : 
           t('Nearby Stores')}
        </Text>
        <Text style={styles.headerSubtitle}>{t('Discover trusted local grocery stores')}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={18} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('Search stores, areas...')}
          placeholderTextColor={COLORS.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'nearby' && styles.filterBtnActive]}
          onPress={handleNearbyPress}
        >
          {requesting ? (
            <ActivityIndicator size={14} color="#fff" />
          ) : (
            <Navigation size={14} color={filterMode === 'nearby' ? '#fff' : COLORS.gray[500]} />
          )}
          <Text style={[styles.filterText, filterMode === 'nearby' && styles.filterTextActive]}>{t('Nearby')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'zip' && styles.filterBtnActive]}
          onPress={() => setFilterMode('zip')}
        >
          <MapPin size={14} color={filterMode === 'zip' ? '#fff' : COLORS.gray[500]} />
          <Text style={[styles.filterText, filterMode === 'zip' && styles.filterTextActive]}>{t('ZIP Code')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'all' && styles.filterBtnActive]}
          onPress={handleAllPress}
        >
          <Store size={14} color={filterMode === 'all' ? '#fff' : COLORS.gray[500]} />
          <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextActive]}>{t('All')}</Text>
        </TouchableOpacity>
      </View>

      {/* ZIP Input Row - Moved to separate row for stability */}
      {filterMode === 'zip' && (
        <View style={styles.zipContainer}>
          <View style={styles.zipInputBox}>
            <MapPin size={16} color={COLORS.primary} />
            <TextInput
              style={styles.zipInput}
              placeholder={t('Enter 6-digit PIN code')}
              placeholderTextColor={COLORS.gray[300]}
              value={zipInput}
              onChangeText={setZipInput}
              keyboardType="number-pad"
              maxLength={6}
              onSubmitEditing={handleZipSubmit}
            />
            {zipInput.length > 0 && (
              <TouchableOpacity onPress={() => { setZipInput(''); setZipStores([]); }}>
                <X size={16} color={COLORS.gray[300]} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.zipGoBtn, zipInput.length < 5 && { opacity: 0.6 }]} 
            onPress={handleZipSubmit}
            disabled={zipInput.length < 5}
          >
            <Text style={styles.zipGoText}>{t('Find Stores')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <StoreFilters 
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        onClearAll={clearFilters}
        showModal={showFilterModal}
        setShowModal={setShowFilterModal}
      />

      {/* Count */}
      {displayStores.length > 0 && (
        <Text style={styles.countText}>
          {displayStores.length} {t('stores found')}
          {filterMode === 'nearby' && hasLocation ? ` • ${t('within 15 km')}` : ''}
        </Text>
      )}

      {/* Store List */}
      <FlatList
        data={displayStores}
        renderItem={renderStore}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {activeFilters.length > 0 ? (
              <>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                <Text style={styles.emptyTitle}>{t('No stores match filters')}</Text>
                <Text style={styles.emptyHint}>{t('Try removing some filters to see more stores.')}</Text>
                <TouchableOpacity style={styles.emptyEnableBtn} onPress={clearFilters}>
                  <Text style={styles.emptyEnableBtnText}>{t('Clear All Filters')}</Text>
                </TouchableOpacity>
              </>
            ) : filterMode === 'nearby' && !hasLocation ? (
              <>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📍</Text>
                <Text style={styles.emptyTitle}>{t('Location access needed')}</Text>
                <Text style={styles.emptyHint}>
                  {permissionStatus === 'denied'
                    ? t('Location was denied. Please enable it in your device settings, or use ZIP code.')
                    : t('Allow location access to discover nearby stores.')}
                </Text>
                <TouchableOpacity style={styles.emptyEnableBtn} onPress={handleNearbyPress}>
                  <LocateFixed size={16} color="#fff" />
                  <Text style={styles.emptyEnableBtnText}>{t('Enable Location')}</Text>
                </TouchableOpacity>
              </>
            ) : filterMode === 'zip' && zipInput.length < 5 ? (
              <>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                <Text style={styles.emptyTitle}>{t('Enter a ZIP code')}</Text>
                <Text style={styles.emptyHint}>{t('Type a 6-digit PIN code above and tap Go to find stores.')}</Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
                <Text style={styles.emptyTitle}>{t('No stores found')}</Text>
                <Text style={styles.emptyHint}>{t('Try a different ZIP code or switch to Nearby mode.')}</Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.foreground },
  headerSubtitle: { fontSize: 14, color: COLORS.gray[500], fontWeight: '500', marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: SPACING.md, height: 48, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray[100], gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.foreground, fontWeight: '500' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, gap: 10 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200] },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  filterText: { fontSize: 13, fontWeight: '700', color: COLORS.gray[500] },
  filterTextActive: { color: '#fff' },
  zipContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.md, gap: 10 },
  zipInputBox: { flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 12, height: 46, borderWidth: 1.5, borderColor: COLORS.gray[100], gap: 8 },
  zipInput: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.foreground },
  zipGoBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 14, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 },
  zipGoText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  countText: { fontSize: 12, fontWeight: '700', color: COLORS.gray[400], paddingHorizontal: SPACING.md, marginBottom: 6 },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 120 },
  card: { backgroundColor: COLORS.white, borderRadius: 18, padding: SPACING.md, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: COLORS.gray[100] },
  cardRow: { flexDirection: 'row', gap: 14 },
  storeEmoji: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  storeName: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, flex: 1, marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800' },
  storeType: { fontSize: 12, color: COLORS.gray[500], fontWeight: '600', marginBottom: 2 },
  address: { fontSize: 11, color: COLORS.gray[400], fontWeight: '500', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '800', color: COLORS.foreground },
  reviewText: { fontSize: 10, color: COLORS.gray[400], fontWeight: '600' },
  distanceBox: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FFF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  distanceText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  pinBox: { backgroundColor: COLORS.gray[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: COLORS.gray[200] },
  pinText: { fontSize: 10, fontWeight: '800', color: COLORS.gray[500] },
  deliveryRow: { marginTop: 8 },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  deliveryText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timingText: { fontSize: 10, fontWeight: '600', color: COLORS.gray[400] },
  emptyContainer: { paddingTop: 60, alignItems: 'center', paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground, marginBottom: 8, textAlign: 'center' },
  emptyHint: { fontSize: 13, color: COLORS.gray[400], textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  emptyEnableBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  emptyEnableBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
