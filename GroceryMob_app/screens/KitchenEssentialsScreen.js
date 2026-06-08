import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Navigation, Star, Truck, ShieldCheck, MapPin } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { storeService } from '../services/storeService';
import { generateStoreOffers } from '../data/campaigns';

export default function KitchenEssentialsScreen({ navigation }) {
  const { t } = useLanguage();
  const { coords, hasLocation } = useLocation();

  // Get all nearby stores
  const nearbyStores = useMemo(() => {
    if (!hasLocation) return storeService.getAllStores();
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 20); // 20km radius
  }, [hasLocation, coords]);

  // Generate combo offers for all nearby stores
  const comboOffers = useMemo(() => {
    let allOffers = [];
    nearbyStores.forEach(store => {
      const storeOffers = generateStoreOffers(store);
      // Filter only kitchen essential offers (which they all are currently)
      allOffers = [...allOffers, ...storeOffers.filter(o => o.isKitchenEssentialOffer)];
    });
    
    // Sort by discount
    return allOffers.sort((a, b) => b.discountPercent - a.discountPercent);
  }, [nearbyStores]);

  const handleOfferPress = (storeId) => {
    const store = storeService.getStoreById(storeId);
    if (store) {
      navigation.navigate('StoreDetail', { store });
    }
  };

  const renderOffer = ({ item: offer }) => (
    <TouchableOpacity 
      style={styles.offerCard} 
      activeOpacity={0.9} 
      onPress={() => handleOfferPress(offer.storeId)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeEmoji}>{offer.storeEmoji}</Text>
          <View>
            <Text style={styles.storeName}>{offer.storeName}</Text>
            <View style={styles.metaRow}>
              <View style={styles.ratingBox}>
                <Star size={10} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{offer.storeRating}</Text>
              </View>
              {offer.deliveryAvailable ? (
                <View style={styles.deliveryBadge}>
                  <Truck size={10} color={COLORS.primary} />
                  <Text style={styles.deliveryText}>{t('Delivery')}</Text>
                </View>
              ) : (
                <View style={[styles.deliveryBadge, { backgroundColor: COLORS.gray[100] }]}>
                  <MapPin size={10} color={COLORS.gray[500]} />
                  <Text style={[styles.deliveryText, { color: COLORS.gray[500] }]}>{t('Pickup')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{offer.discountPercent}% OFF</Text>
        </View>
      </View>

      <View style={styles.comboDetails}>
        <View style={styles.comboIconBox}>
          <Text style={styles.comboIcon}>{offer.emoji}</Text>
        </View>
        <View style={styles.comboContent}>
          <Text style={styles.comboTitle}>{t(offer.title)}</Text>
          <Text style={styles.comboItems} numberOfLines={2}>
            {offer.items.map(i => t(i)).join(' • ')}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.originalPrice}>₹{offer.originalPrice}</Text>
          <Text style={styles.offerPrice}>₹{offer.offerPrice}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewStoreBtn}
          onPress={() => handleOfferPress(offer.storeId)}
        >
          <Text style={styles.viewStoreText}>{t('View Store')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t('Kitchen Essentials')}</Text>
          <Text style={styles.headerSubtitle}>{t('Compare combos from local stores')}</Text>
        </View>
      </View>

      <FlatList
        data={comboOffers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.trustBanner}>
            <ShieldCheck size={20} color={COLORS.primary} />
            <Text style={styles.trustText}>
              {t('All combos are fresh & packed by verified local provision stores')}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
            <Text style={styles.emptyTitle}>{t('No offers nearby')}</Text>
            <Text style={styles.emptyHint}>{t('Try changing your location to see more stores.')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  headerSubtitle: { fontSize: 13, color: COLORS.gray[500], fontWeight: '500' },
  listContent: { padding: SPACING.md, paddingBottom: 40 },
  trustBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, marginBottom: 16, gap: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  trustText: { flex: 1, fontSize: 12, color: '#065F46', fontWeight: '600', lineHeight: 18 },
  offerCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeEmoji: { fontSize: 24, backgroundColor: COLORS.gray[50], padding: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[100], overflow: 'hidden' },
  storeName: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.foreground },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FFF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deliveryText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  discountBadge: { backgroundColor: COLORS.rose[500], paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  comboDetails: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.gray[50], padding: 12, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.gray[100] },
  comboIconBox: { width: 48, height: 48, backgroundColor: COLORS.white, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  comboIcon: { fontSize: 24 },
  comboContent: { flex: 1, justifyContent: 'center' },
  comboTitle: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  comboItems: { fontSize: 12, color: COLORS.gray[500], lineHeight: 18, fontWeight: '500' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.gray[100] },
  originalPrice: { fontSize: 13, color: COLORS.gray[400], textDecorationLine: 'line-through', fontWeight: '600', marginBottom: 2 },
  offerPrice: { fontSize: 22, fontWeight: '900', color: COLORS.foreground },
  viewStoreBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  viewStoreText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: COLORS.gray[500], textAlign: 'center' }
});
