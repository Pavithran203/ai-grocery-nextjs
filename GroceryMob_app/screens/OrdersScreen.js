import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../services/theme';
import { Truck, CheckCircle, Package, Clock, ChevronLeft, LogIn } from 'lucide-react-native';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useTracking } from '../context/TrackingContext';
import { useLanguage } from '../context/LanguageContext';
import SkeletonLoader from '../components/SkeletonLoader';

export default function OrdersScreen({ navigation }) {
  const { orders, loadOrders, cancelOrder } = useOrders();
  const { user } = useAuth();
  const { startTracking, isTracking, activeOrderId } = useTracking();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(user ? true : false);
  const [cancellingId, setCancellingId] = useState(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleTrackOrder = (id) => {
    if (!isTracking || activeOrderId !== id) {
       startTracking(id);
    }
    navigation.navigate('TrackingScreen', { orderId: id });
  };

  const CANCEL_REASONS = [
    t('Changed my mind'),
    t('Found a better price elsewhere'),
    t('Ordered by mistake'),
    t('Expected delivery is too long'),
    t('Incorrect delivery address'),
    t('Want to change payment method')
  ];

  useEffect(() => {
    if (user) {
      const fetch = async () => {
        await loadOrders();
        setLoading(false);
      };
      fetch();
    }
  }, [user]);

  const renderOrder = ({ item }) => {
    // Determine timeline step based on status
    const steps = [t('Placed'), t('Packed'), t('Out for Delivery'), t('Delivered')];
    let currentStepIndex = steps.indexOf(t(item.status));
    if (currentStepIndex === -1 && item.status !== 'Cancelled') currentStepIndex = 0;

    const handleCancelRequest = () => {
       setSelectedOrderId(item.id);
       setIsCancelModalVisible(true);
    };

    const performCancel = async (reason) => {
       setIsCancelModalVisible(false);
       setCancellingId(item.id);
        // We can pass the reason to useOrders' cancelOrder if we update that context,
        // for now we'll just track it locally or show a success alert.
        await cancelOrder(item.id);
        setCancellingId(null);
        Alert.alert(t("Order Cancelled"), `${t('Reason')}: ${reason}`);
    };

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.id || t('Order ID N/A')}</Text>
            <Text style={styles.orderDate}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''} {t('at')} {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Delivered' ? COLORS.emerald[100] : COLORS.primary + '20' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Delivered' ? COLORS.emerald[700] : COLORS.primary }]}>
              {t(item.status)}
            </Text>
          </View>
        </View>

        {/* Multi-Store Badge */}
        {item.storeGroups && item.storeGroups.length > 1 && (
          <View style={styles.multiStoreBadge}>
             <Truck size={10} color={COLORS.white} />
             <Text style={styles.multiStoreBadgeText}>{t('MULTI-STORE ORDER')}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Store Breakdown if Multi-store */}
        {item.storeGroups ? (
          <View style={styles.storesBreakdown}>
            {item.storeGroups.map(group => (
              <View key={group.id} style={styles.storeMiniRow}>
                <View style={styles.storeMiniInfo}>
                  <Text style={styles.storeMiniName}>🏪 {t(group.storeInfo?.name)}</Text>
                  <Text style={styles.storeMiniDetails}>
                    {group.items?.length} {t('items')} • {group.deliveryInfo?.estimatedTime || '30m'}
                  </Text>
                </View>
                <Text style={styles.storeMiniSubtotal}>₹{group.subtotal.toFixed(0)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <>
            <Text style={styles.itemsTitle}>{t('Items')} ({item.items?.length || 0})</Text>
            <Text style={styles.itemsList} numberOfLines={2}>
              {item.items?.map(i => `${i.quantity}x ${t(i.name)}`).join(', ')}
            </Text>
          </>
        )}

        <View style={styles.divider} />

        {/* Timeline representation */}
        {item.status !== 'Cancelled' ? (
          <View style={styles.timeline}>
             {steps.map((step, idx) => {
                const passed = idx <= currentStepIndex;
                const active = idx === currentStepIndex;
                return (
                   <View key={step} style={styles.timelineStep}>
                      <View style={[styles.timelineDot, passed && styles.timelineDotPassed, active && styles.timelineDotActive]} />
                      <Text style={[styles.timelineText, passed && styles.timelineTextPassed]}>{step}</Text>
                      {idx < steps.length - 1 && <View style={[styles.timelineLine, passed && idx < currentStepIndex && styles.timelineLinePassed]} />}
                   </View>
                );
              })}
          </View>
        ) : (
          <View style={styles.cancelledAlert}>
            <Text style={styles.cancelledAlertText}>{t('Order Cancelled')}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>{t('Total Amount')}</Text>
            <Text style={styles.totalValue}>₹{(item.totalAmount || item.totalPrice || 0).toFixed(0)}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {item.status !== 'Delivered' && item.status !== 'Cancelled' && (
              <TouchableOpacity 
                style={[styles.cancelBtn, { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]} 
                onPress={() => handleTrackOrder(item.id || item._id || 'DEMO-123')}
              >
                <Text style={[styles.cancelBtnText, { color: COLORS.primary }]}>{t('Track')}</Text>
              </TouchableOpacity>
            )}
            {item.status === 'Placed' && (
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={handleCancelRequest}
                disabled={cancellingId === item.id}
              >
                <Text style={styles.cancelBtnText}>{cancellingId === item.id ? '...' : t('Cancel')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
              <ChevronLeft color={COLORS.foreground} size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>My Orders</Text>
            <View style={{ width: 44 }} />
        </View>
        <View style={{ padding: SPACING.md }}>
          <SkeletonLoader style={{ height: 200, marginBottom: 16 }} />
          <SkeletonLoader style={{ height: 200, marginBottom: 16 }} />
          <SkeletonLoader style={{ height: 200, marginBottom: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
              <ChevronLeft color={COLORS.foreground} size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>My Orders</Text>
            <View style={{ width: 44 }} />
        </View>
        <View style={styles.guestContainer}>
           <Package size={80} color={COLORS.gray[100]} />
           <Text style={styles.guestTitle}>{t('Track Your Orders')}</Text>
           <Text style={styles.guestSubtitle}>{t('Please login to view your order history and track active deliveries.')}</Text>
           <TouchableOpacity 
             style={styles.loginBtn} 
             onPress={() => navigation.navigate('Login')}
           >
             <LogIn size={20} color={COLORS.white} />
             <Text style={styles.loginBtnText}>{t('Login Now')}</Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const confirmCancellation = async (orderId, reason) => {
     setIsCancelModalVisible(false);
     setCancellingId(orderId);
     await cancelOrder(orderId);
     setCancellingId(null);
     Alert.alert(t("Success"), `${t('Your order has been cancelled.')}\n${t('Reason')}: ${reason}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
              <ChevronLeft color={COLORS.foreground} size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>My Orders</Text>
            <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={COLORS.gray[200]} />
              <Text style={styles.emptyText}>{t('No orders yet')}</Text>
              <Text style={styles.emptySub}>{t('When you place an order, it will show up here.')}</Text>
            </View>
          }
        />

        {/* Cancellation Reason Modal */}
        <Modal
          visible={isCancelModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsCancelModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Cancel Order')}</Text>
                <Text style={styles.modalSub}>{t('Please select a reason for cancellation')}</Text>
              </View>
              
              {CANCEL_REASONS.map((reason, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.reasonItem}
                  onPress={() => confirmCancellation(selectedOrderId, reason)}
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setIsCancelModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>{t('Go Back')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, height: 60, borderBottomWidth: 1, borderColor: COLORS.gray[100] },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  listContent: { padding: SPACING.md, paddingBottom: 40 },
  orderCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.gray[100], shadowColor: COLORS.foreground, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  orderDate: { fontSize: 12, color: COLORS.gray[500], fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  multiStoreBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: COLORS.indigo[600], 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    alignSelf: 'flex-start',
    marginTop: 8
  },
  multiStoreBadgeText: { 
    color: COLORS.white, 
    fontSize: 9, 
    fontWeight: '900', 
    letterSpacing: 0.5 
  },
  storesBreakdown: {
    gap: 12
  },
  storeMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  storeMiniInfo: {
    flex: 1
  },
  storeMiniName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.foreground
  },
  storeMiniDetails: {
    fontSize: 11,
    color: COLORS.gray[400],
    fontWeight: '600',
    marginTop: 2
  },
  storeMiniSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground
  },
  divider: { height: 1, backgroundColor: COLORS.gray[100], marginVertical: SPACING.md },
  itemsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.foreground, marginBottom: 6 },
  itemsList: { fontSize: 13, color: COLORS.gray[500], lineHeight: 20 },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginVertical: SPACING.sm },
  timelineStep: { alignItems: 'center', flex: 1, position: 'relative' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.gray[200], zIndex: 2 },
  timelineDotPassed: { backgroundColor: COLORS.primary },
  timelineDotActive: { borderWidth: 3, borderColor: COLORS.primary + '40' },
  timelineLine: { position: 'absolute', top: 6, left: '50%', right: '-50%', height: 2, backgroundColor: COLORS.gray[200], zIndex: 1 },
  timelineLinePassed: { backgroundColor: COLORS.primary },
  timelineText: { fontSize: 10, color: COLORS.gray[400], fontWeight: '700', marginTop: 8, textAlign: 'center' },
  timelineTextPassed: { color: COLORS.foreground },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderColor: COLORS.gray[100] },
  totalLabel: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  guestTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  guestSubtitle: { fontSize: 14, color: COLORS.gray[500], textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 },
  loginBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 30, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, width: '100%' },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: '40%' },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.foreground, marginTop: SPACING.md },
  emptySub: { fontSize: 14, color: COLORS.gray[500], marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.rose[500], backgroundColor: 'rgba(244, 63, 94, 0.05)' },
  cancelBtnText: { color: COLORS.rose[600], fontSize: 12, fontWeight: '800' },
  cancelledAlert: { marginVertical: SPACING.sm, padding: SPACING.sm, backgroundColor: COLORS.rose[50], borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.rose[200] },
  cancelledAlertText: { color: COLORS.rose[700], fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.xl },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: SPACING.xl },
  modalHeader: { marginBottom: SPACING.lg },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground, marginBottom: 4 },
  modalSub: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600' },
  reasonItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  reasonText: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  closeBtn: { marginTop: SPACING.lg, paddingVertical: 14, alignItems: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
});
