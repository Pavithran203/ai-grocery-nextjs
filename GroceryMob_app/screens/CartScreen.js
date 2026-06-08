import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { storeService } from '../services/storeService';
import CartItem from '../components/CartItem';
import LoginPromptModal from '../components/LoginPromptModal';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Info, 
  ChevronRight, 
  AlertCircle,
  Truck,
  CheckCircle2
} from 'lucide-react-native';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user, loginAsGuest } = useAuth();
  const { coords } = useLocation();
  const { t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Group items by store and calculate totals
  const storeGroups = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return [];

    const groups = {};
    cartItems.forEach(item => {
      const storeId = item.storeId || 'unknown';
      if (!groups[storeId]) {
        const store = storeService.getStoreById(storeId, coords?.latitude, coords?.longitude);
        groups[storeId] = {
          id: storeId,
          storeInfo: store,
          items: [],
          subtotal: 0,
        };
      }
      groups[storeId].items.push(item);
      groups[storeId].subtotal += (item.cartPrice || item.price || 0) * item.quantity;
    });

    return Object.values(groups).map(group => {
      // Calculate delivery info based on group subtotal
      const deliveryInfo = storeService.getStoreById(
        group.id, 
        coords?.latitude, 
        coords?.longitude, 
        group.subtotal
      )?.deliveryInfo;

      return {
        ...group,
        deliveryFee: deliveryInfo?.deliveryCharge || 0,
        deliveryInfo,
      };
    });
  }, [cartItems, coords]);

  const totals = useMemo(() => {
    const subtotal = storeGroups.reduce((acc, g) => acc + g.subtotal, 0);
    const deliveryFees = storeGroups.reduce((acc, g) => acc + g.deliveryFee, 0);
    const platformFee = 5;
    const grandTotal = subtotal + deliveryFees + platformFee;

    return { subtotal, deliveryFees, platformFee, grandTotal };
  }, [storeGroups]);

  const isCheckoutDisabled = storeGroups.some(g => g.storeInfo?.minOrder > 0 && g.subtotal < g.storeInfo.minOrder);

  const handleCheckout = () => {
    if (isCheckoutDisabled) return;
    if (user) {
      navigation.navigate('Checkout');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleContinueAsGuest = async () => {
    setShowLoginModal(false);
    await loginAsGuest();
    navigation.navigate('Checkout');
  };

  const renderStoreGroup = (group) => (
    <View key={group.id} style={styles.storeCard}>
      {/* Store Header */}
      <TouchableOpacity 
        style={styles.storeHeader}
        onPress={() => navigation.navigate('StoreDetail', { storeId: group.id })}
      >
        <View style={styles.storeIconBox}>
          <ShoppingBag size={20} color={COLORS.primary} />
        </View>
        <View style={styles.storeHeaderText}>
          <Text style={styles.storeName}>{t(group.storeInfo?.name || 'Local Store')}</Text>
          <View style={styles.storeMeta}>
            <View style={styles.metaItem}>
              <MapPin size={12} color={COLORS.gray[400]} />
              <Text style={styles.metaText}>{group.storeInfo?.distance || '??'} km</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Clock size={12} color={COLORS.gray[400]} />
              <Text style={styles.metaText}>{group.deliveryInfo?.estimatedTime || '30-45 mins'}</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color={COLORS.gray[300]} />
      </TouchableOpacity>

      {/* Delivery Status Badge */}
      <View style={[
        styles.deliveryBadge,
        group.deliveryInfo?.status === 'free' ? styles.freeBadge : styles.paidBadge
      ]}>
        {group.deliveryInfo?.status === 'free' ? (
          <>
            <CheckCircle2 size={14} color={COLORS.emerald[600]} />
            <Text style={styles.freeBadgeText}>{t('FREE DELIVERY')}</Text>
          </>
        ) : group.deliveryInfo?.isPickupOnly ? (
          <>
            <Info size={14} color={COLORS.amber[600]} />
            <Text style={styles.pickupBadgeText}>{t('PICKUP ONLY')}</Text>
          </>
        ) : (
          <>
            <Truck size={14} color={COLORS.primary} />
            <Text style={styles.paidBadgeText}>
              ₹{group.deliveryFee} {t('DELIVERY FEE')}
            </Text>
          </>
        )}
      </View>

      {/* Items in this store */}
      <View style={styles.itemsList}>
        {group.items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdate={updateQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </View>

      {/* Minimum Order Warning */}
      {group.storeInfo?.minOrder > 0 && group.subtotal < group.storeInfo.minOrder && (
        <View style={styles.minOrderWarning}>
          <AlertCircle size={14} color={COLORS.rose[500]} />
          <Text style={styles.minOrderWarningText}>
            {t('Add ₹')}{Math.ceil(group.storeInfo.minOrder - group.subtotal)} {t('more to reach minimum order of ₹')}{group.storeInfo.minOrder}
          </Text>
        </View>
      )}

      {/* Store Footer / Subtotal */}
      <View style={styles.storeFooter}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>{t('Items Subtotal')}</Text>
          <Text style={styles.footerValue}>₹{group.subtotal.toFixed(2)}</Text>
        </View>
        {group.deliveryFee > 0 && (
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>{t('Delivery Fee')}</Text>
            <Text style={styles.footerValue}>₹{group.deliveryFee.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.footerRow, styles.storeTotalRow]}>
          <Text style={styles.storeTotalLabel}>{t('Store Total')}</Text>
          <Text style={styles.storeTotalValue}>₹{(group.subtotal + group.deliveryFee).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <ShoppingBag size={64} color={COLORS.gray[200]} />
      </View>
      <Text style={styles.emptyTitle}>{t('Your cart is empty')}</Text>
      <Text style={styles.emptySubtitle}>{t("Looks like you haven't added anything to your cart yet.")}</Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.shopBtnText}>{t('Start Shopping')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('My Cart')}</Text>
          <Text style={styles.itemCount}>{cartItems.length} {t('items from')} {storeGroups.length} {t('stores')}</Text>
        </View>
      </View>

      {cartItems.length > 0 ? (
        <View style={{ flex: 1 }}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {storeGroups.map(renderStoreGroup)}

            {/* Multi-store delivery notice */}
            {storeGroups.length > 1 && (
              <View style={styles.multiStoreNotice}>
                <AlertCircle size={18} color={COLORS.indigo[600]} />
                <Text style={styles.multiStoreNoticeText}>
                  {t('Your order will arrive in multiple deliveries from different stores.')}
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
          
          {/* Stable & Compact Bill Summary Bar */}
          <View style={[
            styles.stableSummaryBar, 
            { paddingBottom: insets.bottom + 75 }
          ]}>
            <View style={styles.compactSummaryContent}>
              <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>{t('Items Total')}</Text>
                <Text style={styles.compactValue}>₹{totals.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.compactRow}>
                <Text style={styles.compactLabel}>
                  {totals.deliveryFees > 0 ? t('Delivery & Fees') : t('Platform Fees')}
                </Text>
                <Text style={styles.compactValue}>
                  ₹{(totals.deliveryFees + totals.platformFee).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.totalAndAction}>
              <View style={styles.totalPriceGroup}>
                <Text style={styles.totalLabel}>{t('Total Pay')}</Text>
                <Text style={styles.totalPrice}>₹{totals.grandTotal.toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.checkoutBtn, isCheckoutDisabled && styles.checkoutBtnDisabled]}
                onPress={handleCheckout}
                disabled={isCheckoutDisabled}
              >
                <Text style={styles.checkoutBtnText}>
                  {isCheckoutDisabled ? t('Below Min') : t('Checkout')}
                </Text>
                <ArrowRight size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        renderEmpty()
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
        onGuest={handleContinueAsGuest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.foreground },
  itemCount: { fontSize: 13, color: COLORS.gray[500], fontWeight: '600', marginTop: 2 },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.md },

  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeHeaderText: { flex: 1 },
  storeName: { fontSize: 17, fontWeight: '800', color: COLORS.foreground },
  storeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.gray[500], fontWeight: '600' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.gray[300], marginHorizontal: 8 },

  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  freeBadge: { backgroundColor: COLORS.emerald[50] },
  paidBadge: { backgroundColor: COLORS.gray[50] },
  freeBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.emerald[700] },
  paidBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.gray[700] },
  pickupBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.amber[700] },
  
  minOrderWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.rose[50],
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.rose[100],
  },
  minOrderWarningText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.rose[600],
    flex: 1,
  },

  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
    paddingTop: 16,
  },

  storeFooter: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  footerLabel: { fontSize: 13, color: COLORS.gray[500], fontWeight: '600' },
  footerValue: { fontSize: 13, color: COLORS.foreground, fontWeight: '700' },
  storeTotalRow: { marginTop: 4 },
  storeTotalLabel: { fontSize: 14, fontWeight: '800', color: COLORS.foreground },
  storeTotalValue: { fontSize: 15, fontWeight: '900', color: COLORS.primary },

  multiStoreNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.indigo[50],
    padding: 16,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.indigo[100],
  },
  multiStoreNoticeText: { flex: 1, fontSize: 13, color: COLORS.indigo[700], fontWeight: '700', lineHeight: 18 },

  // New Stable & Compact Bill Summary Bar
  stableSummaryBar: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 105, // Lifted to be above the floating tab bar (70 height + 25 bottom)
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  compactSummaryContent: {
    marginBottom: 10,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  compactValue: {
    fontSize: 12,
    color: COLORS.gray[700],
    fontWeight: '700',
  },
  totalAndAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 10,
  },
  totalPriceGroup: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 11,
    color: COLORS.gray[500],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  checkoutBtn: {
    flex: 1.8,
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  checkoutBtnDisabled: { backgroundColor: COLORS.gray[300] },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyIconBox: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.gray[50],
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14, color: COLORS.gray[400], textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20,
  },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20 },
  shopBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
