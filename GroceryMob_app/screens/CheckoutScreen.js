import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Switch
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft, CheckCircle, CreditCard, MapPin, Truck,
  Clock, Package, Smartphone, Landmark, Gift, Tag, X, AlertCircle, ShoppingBag, Info
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { couponService } from '../services/couponService';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { usePreferences } from '../context/PreferencesContext';
import { useOrders } from '../context/OrdersContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { storeService } from '../services/storeService';
import { triggerSuccess, triggerLight } from '../utils/Haptics';
import { COLORS, SPACING } from '../services/theme';
import { useAuth } from '../context/AuthContext';
import GuestCheckoutModal from '../components/GuestCheckoutModal';

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { id: 'upi', label: 'UPI / Google Pay', icon: '📱', desc: 'PhonePe, GPay, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
];

export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { 
    cartItems, getCartTotal, clearCart, appliedCoupon, 
    applyCouponToCart, removeCouponFromCart, syncGuestCart 
  } = useCart();
  const { getDefaultAddress, formatAddress } = useAddress();
  const { trackOrder } = usePreferences();
  const { addLocalOrder, orders } = useOrders();
  const { coins, addCoins, redeemCoins } = useLoyalty();
  const { t } = useLanguage();
  const { user, loginAsGuest } = useAuth();
  const { coords } = useLocation();

  const [selectedDeliveryType, setSelectedDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [couponInput, setCouponInput] = useState('');
  const [useCoins, setUseCoins] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const defaultAddress = getDefaultAddress();
  const isFirstOrder = orders.length === 0;

  // Group items by store for realistic multi-store order summary
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
      const deliveryInfo = storeService.getStoreById(group.id, coords?.latitude, coords?.longitude, group.subtotal)?.deliveryInfo;
      let fee = selectedDeliveryType === 'pickup' ? 0 : (deliveryInfo?.deliveryCharge ?? 40);
      if (isFirstOrder && selectedDeliveryType === 'delivery') fee = 0;

      return {
        ...group,
        deliveryFee: fee,
        deliveryInfo,
      };
    });
  }, [cartItems, coords, selectedDeliveryType, isFirstOrder]);

  const subtotal = useMemo(() => storeGroups.reduce((acc, g) => acc + g.subtotal, 0), [storeGroups]);
  const totalDeliveryFees = useMemo(() => storeGroups.reduce((acc, g) => acc + g.deliveryFee, 0), [storeGroups]);
  const platformFee = 5;

  let discount = 0;
  let discountLabel = '';

  if (useCoins && coins >= 100) {
    discount = Math.floor(subtotal * 0.10);
    discountLabel = t('Coins Discount (10%)');
  } else if (appliedCoupon) {
    if (appliedCoupon.type === 'delivery') {
      // For multi-store, delivery coupon might zero out all delivery fees
      discount = 0; // Handled by zeroing deliveryFee in the final calculation
      discountLabel = `Coupon: ${appliedCoupon.code} (Free Delivery)`;
    } else {
      discount = Math.floor(appliedCoupon.discountAmount) || 0;
      discountLabel = `Coupon: ${appliedCoupon.code}`;
    }
  }

  const finalDeliveryFee = appliedCoupon?.type === 'delivery' ? 0 : totalDeliveryFees;
  const finalGrandTotal = Math.max(0, subtotal + finalDeliveryFee + platformFee - discount);

  // Checks if any store is out of range
  const isAnyStoreUndeliverable = selectedDeliveryType === 'delivery' && storeGroups.some(g => g.deliveryInfo?.isDeliverable === false);

  // Auto-validate persisted coupon
  useEffect(() => {
    if (appliedCoupon) {
      const res = couponService.validateCoupon(appliedCoupon.code, subtotal);
      if (!res.success) {
        removeCouponFromCart();
        Alert.alert(t("Coupon Removed"), t(res.message));
      } else if (res.coupon.discountAmount !== appliedCoupon.discountAmount) {
        applyCouponToCart(res.coupon);
      }
    }
  }, [subtotal]);

  const handleApplyCoupon = () => {
    const res = couponService.validateCoupon(couponInput, subtotal);
    if (res.success) {
      applyCouponToCart(res.coupon);
      setCouponInput('');
    } else {
      Alert.alert(t("Invalid Coupon"), t(res.message));
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert(t('Empty Cart'), t('Your cart is empty.'));
      return;
    }

    if (isAnyStoreUndeliverable) {
      Alert.alert(t('Delivery Unavailable'), t('One or more stores in your cart do not deliver to your current location. Please remove those items or choose pickup.'));
      return;
    }

    const belowMinStore = storeGroups.find(g => g.storeInfo?.minOrder > 0 && g.subtotal < g.storeInfo.minOrder);
    if (belowMinStore) {
      Alert.alert(t('Minimum Order Not Met'), `${t('Minimum order for')} ${belowMinStore.storeInfo.name} ${t('is ₹')}${belowMinStore.storeInfo.minOrder}. ${t('Please add more items.')}`);
      return;
    }

    const isGuestWithoutDetails = user?.isGuest && (!user.phone || !user.addresses || user.addresses.length === 0);
    if (!user || isGuestWithoutDetails) {
      setShowGuestModal(true);
      return;
    }

    if (!defaultAddress && selectedDeliveryType === 'delivery') {
      Alert.alert(t('No Address'), t('Please add a delivery address first.'));
      return;
    }

    Alert.alert(
      t('Confirm Order'),
      storeGroups.length > 1 
        ? `${t('Place multi-delivery order for')} ₹${finalGrandTotal.toFixed(2)}?`
        : `${t('Place order for')} ₹${finalGrandTotal.toFixed(2)}?`,
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Confirm'), onPress: () => processOrder(), style: 'default' }
      ]
    );
  };

  const handleGuestContinue = async (guestData) => {
    setShowGuestModal(false);
    setLoading(true);
    try {
      const finalAddress = guestData.address || defaultAddress;
      await loginAsGuest({ ...guestData, address: finalAddress });
      const syncedItems = await syncGuestCart();
      await processOrder(finalAddress, syncedItems);
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to initialize guest checkout.');
    }
  };

  const processOrder = async (guestAddress = null, forcedItems = null) => {
    setLoading(true);
    const targetAddress = guestAddress || defaultAddress || (user?.isGuest ? user?.addresses?.[0] : null);
    const itemsToOrder = forcedItems || cartItems;
    
    try {
        // Multi-store realistic order processing
        // In a real app, this might hit multiple endpoints or one batch endpoint.
        // For the demo, we'll hit createOrder for the primary store and log the others locally.
        const primaryGroup = storeGroups[0];
        
        await api.createOrder({
          deliveryAddress: targetAddress ? {
            fullName: targetAddress.fullName,
            phone: targetAddress.phone,
            line1: targetAddress.line1,
            line2: targetAddress.line2 || '',
            city: targetAddress.city,
            state: targetAddress.state || 'N/A',
            pincode: targetAddress.pincode,
          } : null,
          paymentMethod: selectedPayment,
          notes: storeGroups.length > 1 ? `Multi-store Order (${storeGroups.length} stores)` : 'Single-store Order',
          isGuestOrder: !!user?.isGuest,
          storeId: primaryGroup.id,
          storeName: primaryGroup.storeInfo?.name,
          subtotal: subtotal,
          deliveryFee: finalDeliveryFee,
          discount: discount,
          deliveryType: selectedDeliveryType
        });

        await addLocalOrder({
          items: [...itemsToOrder],
          totalAmount: finalGrandTotal,
          paymentMethod: selectedPayment,
          deliveryType: selectedDeliveryType,
          storeName: storeGroups.length > 1 ? `${storeGroups[0].storeInfo?.name} + ${storeGroups.length - 1} more` : storeGroups[0].storeInfo?.name,
          storeGroups: storeGroups // Persist group info for UI
        });

      trackOrder(cartItems);
      if (useCoins && coins >= 100) await redeemCoins(100, `Redeemed for order`);
      await addCoins(10, `Earned from order`);
      await clearCart();
      triggerSuccess();
      setStep(2);
    } catch (error) {
      console.log('Order simulation fallback');
      await addLocalOrder({
        items: [...itemsToOrder],
        totalAmount: finalGrandTotal,
        paymentMethod: selectedPayment,
        deliveryType: selectedDeliveryType,
        storeName: storeGroups[0]?.storeInfo?.name
      });
      await clearCart();
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <CheckCircle size={72} color={COLORS.emerald[500]} />
        </View>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>{t('Orders Placed!')}</Text>
        <Text style={styles.successSubtitle}>
          {storeGroups.length > 1 
            ? `${t('Your items will arrive in')} ${storeGroups.length} ${t('separate deliveries.')}`
            : t('Your items will arrive shortly.')}
        </Text>
        <View style={styles.successInfo}>
          {storeGroups.map(g => (
            <Text key={g.id} style={styles.successInfoText}>
              ✅ {g.storeInfo?.name}: {g.deliveryInfo?.estimatedTime || '30-40 mins'}
            </Text>
          ))}
        </View>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.homeBtnText}>{t('Back to Home')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ordersBtn} onPress={() => navigation.navigate('OrdersTab')}>
          <Text style={styles.ordersBtnText}>{t('Track Orders')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Checkout')}</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Delivery Mode */}
        <View style={styles.section}>
          <View style={styles.slotsContainer}>
            <TouchableOpacity
              style={[styles.slotCard, selectedDeliveryType === 'delivery' && styles.slotCardActive]}
              onPress={() => setSelectedDeliveryType('delivery')}
            >
              <Truck size={24} color={selectedDeliveryType === 'delivery' ? COLORS.primary : COLORS.gray[400]} />
              <Text style={[styles.slotLabel, selectedDeliveryType === 'delivery' && styles.slotLabelActive]}>{t('Delivery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.slotCard, selectedDeliveryType === 'pickup' && styles.slotCardActive]}
              onPress={() => setSelectedDeliveryType('pickup')}
            >
              <ShoppingBag size={24} color={selectedDeliveryType === 'pickup' ? COLORS.primary : COLORS.gray[400]} />
              <Text style={[styles.slotLabel, selectedDeliveryType === 'pickup' && styles.slotLabelActive]}>{t('Pickup')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        {selectedDeliveryType === 'delivery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t('Delivery Address')}</Text>
            </View>
            {defaultAddress ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressName}>{defaultAddress.fullName}</Text>
                <Text style={styles.addressText}>{formatAddress(defaultAddress)}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddressScreen')}>
                  <Text style={styles.changeBtn}>{t('Change Address')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addAddressCard} onPress={() => navigation.navigate('AddressScreen')}>
                <Text style={styles.addAddressText}>+ {t('Add Address')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stores Included */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('Store Summary')}</Text>
          </View>
          {storeGroups.map(group => (
            <View key={group.id} style={styles.storeMiniCard}>
              <View style={styles.storeMiniHeader}>
                <Text style={styles.storeMiniName}>Store: {group.storeInfo?.name}</Text>
                <View style={styles.storeMiniMeta}>
                   <Clock size={12} color={COLORS.gray[400]} />
                   <Text style={styles.storeMiniMetaText}>{group.deliveryInfo?.estimatedTime || '30m'}</Text>
                </View>
              </View>
              <View style={styles.storeMiniItems}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeMiniItemsText}>{t('Items Total')}: ₹{group.subtotal.toFixed(2)}</Text>
                  <Text style={[styles.storeMiniItemsText, { marginTop: 4 }]}>
                    {t('Delivery')}: <Text style={[group.deliveryFee === 0 ? { color: COLORS.emerald[600], fontWeight: '900' } : { color: COLORS.foreground }]}>
                      {group.deliveryFee === 0 ? t('FREE') : `₹${group.deliveryFee}`}
                    </Text>
                  </Text>
                  <Text style={[styles.storeMiniItemsText, { marginTop: 4 }]}>
                    {t('Delivery Time')}: {group.deliveryInfo?.estimatedTime || '30-45 mins'}
                  </Text>
                </View>
              </View>
              {group.deliveryInfo?.isDeliverable === false && selectedDeliveryType === 'delivery' && (
                <View style={styles.errorBanner}>
                   <AlertCircle size={14} color={COLORS.rose[500]} />
                   <Text style={styles.errorText}>{t('Out of Delivery Range')}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('Bill Details')}</Text>
          </View>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('Items Subtotal')}</Text>
              <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('Total Delivery Fees')}</Text>
              <Text style={[styles.priceValue, finalDeliveryFee === 0 && styles.priceFree]}>
                {finalDeliveryFee === 0 ? t('FREE') : `₹${finalDeliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('Platform Fee')}</Text>
              <Text style={styles.priceValue}>₹{platformFee.toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: COLORS.emerald[600] }]}>{discountLabel}</Text>
                <Text style={styles.priceDiscount}>−₹{discount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>{t('Grand Total')}</Text>
              <Text style={styles.totalValue}>₹{finalGrandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('Payment Method')}</Text>
          </View>
          {PAYMENT_METHODS.slice(0, 2).map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentCard, selectedPayment === method.id && styles.paymentCardActive]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Text style={styles.paymentEmoji}>{method.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentLabel}>{t(method.label)}</Text>
                <Text style={styles.paymentDesc}>{t(method.desc)}</Text>
              </View>
              <View style={[styles.radio, selectedPayment === method.id && styles.radioActive]}>
                {selectedPayment === method.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>{t('To Pay')}</Text>
          <Text style={styles.footerValue}>₹{finalGrandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, (loading || isAnyStoreUndeliverable) && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading || isAnyStoreUndeliverable}
        >
          <Text style={styles.placeOrderText}>
            {loading ? t('Processing...') : t('Place Order')}
          </Text>
        </TouchableOpacity>
      </View>

      <GuestCheckoutModal 
        visible={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onContinue={handleGuestContinue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, height: 64, alignItems: 'center',
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F1F3F5',
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground },
  scrollContent: { padding: SPACING.md },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.foreground },
  
  slotsContainer: { flexDirection: 'row', gap: 12 },
  slotCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#F1F3F5',
  },
  slotCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '05' },
  slotLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray[500], marginTop: 8 },
  slotLabelActive: { color: COLORS.primary },

  addressCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F3F5' },
  addressName: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  addressText: { fontSize: 13, color: COLORS.gray[500], lineHeight: 18, marginBottom: 10 },
  changeBtn: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  addAddressCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', alignItems: 'center' },
  addAddressText: { color: COLORS.primary, fontWeight: '700' },

  storeMiniCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F3F5' },
  storeMiniHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  storeMiniName: { fontSize: 15, fontWeight: '800', color: COLORS.foreground },
  storeMiniMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeMiniMetaText: { fontSize: 11, color: COLORS.gray[400], fontWeight: '600' },
  storeMiniItems: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeMiniItemsText: { fontSize: 13, color: COLORS.gray[500], fontWeight: '600' },
  miniFeeBox: { backgroundColor: '#F8F9FA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniFeeText: { fontSize: 11, fontWeight: '800', color: COLORS.gray[600] },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: COLORS.rose[50], padding: 8, borderRadius: 8 },
  errorText: { fontSize: 11, fontWeight: '700', color: COLORS.rose[600] },

  paymentCard: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#F1F3F5' },
  paymentCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '05' },
  paymentEmoji: { fontSize: 22, marginRight: 12 },
  paymentLabel: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  paymentDesc: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DEE2E6', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  priceCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F3F5' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600' },
  priceValue: { fontSize: 14, fontWeight: '700', color: COLORS.foreground },
  priceFree: { color: COLORS.emerald[600], fontWeight: '800' },
  priceDiscount: { fontSize: 14, fontWeight: '700', color: COLORS.emerald[600] },
  priceDivider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 8 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: COLORS.foreground },
  totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 12, color: COLORS.gray[500], fontWeight: '700' },
  footerValue: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  placeOrderBtn: { flex: 1.5, backgroundColor: COLORS.primary, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  placeOrderBtnDisabled: { backgroundColor: COLORS.gray[300] },
  placeOrderText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, padding: 30 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.emerald[50], justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successEmoji: { fontSize: 32, marginBottom: 10 },
  successTitle: { fontSize: 24, fontWeight: '900', color: COLORS.foreground, marginBottom: 10 },
  successSubtitle: { fontSize: 15, color: COLORS.gray[500], textAlign: 'center', marginBottom: 30 },
  successInfo: { width: '100%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, marginBottom: 30, gap: 10 },
  successInfoText: { fontSize: 14, fontWeight: '700', color: COLORS.gray[700] },
  homeBtn: { backgroundColor: COLORS.primary, width: '100%', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  homeBtnText: { color: COLORS.white, fontWeight: '800' },
  ordersBtn: { width: '100%', height: 54, borderRadius: 16, borderWidth: 1.5, borderColor: '#DEE2E6', justifyContent: 'center', alignItems: 'center' },
  ordersBtnText: { fontWeight: '700', color: COLORS.foreground },
});
