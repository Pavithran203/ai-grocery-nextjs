import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Package, Plus, ShoppingBag, MapPin, Truck, Store, Clock } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { storeService } from '../../services/storeService';
import { generateStoreOffers } from '../../data/campaigns';
import { useNavigation } from '@react-navigation/native';
import { triggerSuccess } from '../../utils/Haptics';
import Toast from 'react-native-root-toast';

export default function MonthlyEssentials() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { coords, hasLocation } = useLocation();
  const navigation = useNavigation();

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
      // Let's filter to only include 'monthly-mega' or 'family-grocery' templates for this specific widget, or just take the best ones
      const relevantOffers = storeOffers.filter(o => o.title.toLowerCase().includes('monthly') || o.title.toLowerCase().includes('family') || o.title.toLowerCase().includes('cooking'));
      allOffers = [...allOffers, ...relevantOffers];
    });
    
    // Sort: Priority stores first, then by highest discount
    return allOffers.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return b.discountPercent - a.discountPercent;
    }).slice(0, 8); // Top 8 offers
  }, [nearbyStores]);

  const handleBuyCombo = (offer) => {
    const comboProduct = {
      id: offer.id,
      name: t(offer.title),
      price: offer.offerPrice,
      originalPrice: offer.originalPrice,
      image: null,
      emoji: offer.emoji,
      storeId: offer.storeId,
      storeName: offer.storeName,
      weight: 'Combo Pack',
      isCombo: true
    };
    addToCart(comboProduct, 1);
  };

  const handleStorePress = (storeId) => {
    const store = storeService.getStoreById(storeId);
    if (store) {
      navigation.navigate('StoreDetail', { store });
    }
  };

  if (comboOffers.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <ShoppingBag size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>{t('Monthly Essentials')}</Text>
            <Text style={styles.subtitle}>{t('Store combo packs for your kitchen')}</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} snapToInterval={280 + 12} decelerationRate="fast">
        {comboOffers.map((offer) => {
          const savings = offer.originalPrice - offer.offerPrice;
          return (
            <TouchableOpacity 
              key={offer.id} 
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => handleStorePress(offer.storeId)}
            >
              <View style={styles.cardTop}>
                <View style={styles.storeBadge}>
                  <Text style={styles.storeEmoji}>{offer.storeEmoji}</Text>
                  <Text style={styles.storeNameText} numberOfLines={1}>{offer.storeName}</Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{offer.discountPercent}% OFF</Text>
                </View>
              </View>

              <View style={styles.comboHeader}>
                <Text style={styles.packEmoji}>{offer.emoji}</Text>
                <Text style={styles.packTitle} numberOfLines={2}>{t(offer.title)}</Text>
              </View>

              <View style={styles.itemsList}>
                <Text style={styles.itemText} numberOfLines={2}>
                  {offer.items.map(i => t(i)).join(' • ')}
                </Text>
              </View>

              {/* Store & Delivery Info */}
              <View style={styles.storeDetailsBox}>
                <View style={styles.detailRow}>
                  <Store size={12} color={COLORS.gray[500]} />
                  <Text style={styles.detailText}>{t('Sold by')} {offer.storeName}</Text>
                </View>
                {offer.storeDistance != null && (
                  <View style={styles.detailRow}>
                    <MapPin size={12} color={COLORS.gray[500]} />
                    <Text style={styles.detailText}>{offer.storeDistance.toFixed(1)} km away</Text>
                  </View>
                )}
                {offer.deliveryAvailable ? (
                  <>
                    <View style={styles.detailRow}>
                      <Truck size={12} color={COLORS.primary} />
                      <Text style={[styles.detailText, { color: COLORS.primary }]}>
                        {(offer.deliveryCharge === 0 && offer.freeDeliveryThreshold < 1000) ? t('Free Delivery') : `${t('Free over')} ₹${offer.freeDeliveryThreshold}`}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={12} color={COLORS.gray[500]} />
                      <Text style={styles.detailText}>{offer.estimatedDeliveryTime || '30-45 mins'}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.detailRow}>
                    <MapPin size={12} color={COLORS.gray[500]} />
                    <Text style={styles.detailText}>{t('Pickup Only')}</Text>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <View>
                  <Text style={styles.originalPrice}>₹{offer.originalPrice}</Text>
                  <Text style={styles.offerPrice}>₹{offer.offerPrice}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => handleBuyCombo(offer)}>
                  <Text style={styles.addBtnText}>{t('Buy Combo')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.md },
  header: { paddingHorizontal: 20, marginBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  subtitle: { fontSize: 11, color: COLORS.gray[500], fontWeight: '600' },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  card: { width: 280, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  storeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  storeEmoji: { fontSize: 16, backgroundColor: COLORS.gray[50], padding: 4, borderRadius: 8, overflow: 'hidden' },
  storeNameText: { fontSize: 13, fontWeight: '800', color: COLORS.foreground, flexShrink: 1 },
  discountBadge: { backgroundColor: COLORS.rose[500], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  comboHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  packEmoji: { fontSize: 24 },
  packTitle: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, flex: 1, lineHeight: 20 },
  itemsList: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  itemText: { fontSize: 12, color: COLORS.gray[500], fontWeight: '500', lineHeight: 18 },
  storeDetailsBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 12, gap: 6, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 11, color: COLORS.gray[600], fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  originalPrice: { fontSize: 12, color: COLORS.gray[400], textDecorationLine: 'line-through', marginBottom: 2, fontWeight: '600' },
  offerPrice: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  addBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' }
});
