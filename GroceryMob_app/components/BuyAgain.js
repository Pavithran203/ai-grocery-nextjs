import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FallbackImage from './FallbackImage';
import { Clock, Plus, RotateCcw, ShoppingCart, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useOrders } from '../context/OrdersContext';
import { useCart } from '../context/CartContext';
import { getBuyAgainItems, getLastOrder, formatOrderDate } from '../services/orderService';
import { triggerSuccess } from '../utils/Haptics';
import Toast from 'react-native-root-toast';

const BuyAgainCard = memo(({ item, onAdd }) => {
  if (!item || !item.id) return null;
  return (
    <View style={styles.card}>
      {/* Frequency tag */}
      <View style={styles.freqTag}>
        <Text style={styles.freqText}>
          {item._frequency >= 3 ? '🔄 Frequent' : item._frequency >= 2 ? '✌️ x' + item._frequency : '📦 x1'}
        </Text>
      </View>

      {/* Image */}
      <FallbackImage source={{ uri: item.image }} style={styles.image} />

      {/* Info */}
      <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>
        {formatOrderDate(item._lastOrderDate)} • Qty: {item._totalQty}
      </Text>

      {/* Price + Buy Again */}
      <View style={styles.bottomRow}>
        <Text style={styles.price}>₹{item.price}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
          <RotateCcw size={12} color="#fff" />
          <Text style={styles.addBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function BuyAgain({ navigation }) {
  const [buyAgainItems, setBuyAgainItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const { orders } = useOrders();
  const { addToCart } = useCart();

  useEffect(() => {
    if (orders && orders.length > 0) {
      const items = getBuyAgainItems(orders);
      setBuyAgainItems(items.slice(0, 12));
      setLastOrder(getLastOrder(orders));
    } else {
      setBuyAgainItems([]);
      setLastOrder(null);
    }
  }, [orders]);

  const handleAdd = useCallback((item) => {
    triggerSuccess();
    addToCart(item, item.quantity || 1);
    Toast.show(`${item.name} added to cart!`, {
      duration: 1500, position: Toast.positions.BOTTOM,
      backgroundColor: COLORS.emerald[600], textColor: '#fff', opacity: 1,
    });
  }, [addToCart]);

  const handleReorderAll = useCallback(() => {
    if (!lastOrder || !lastOrder.items) return;
    lastOrder.items.forEach(item => {
      if (item && item.id) addToCart(item, item.quantity || 1);
    });
    triggerSuccess();
    Toast.show(`${lastOrder.items.length} items added to cart! 🛒`, {
      duration: 2000, position: Toast.positions.BOTTOM,
      backgroundColor: COLORS.emerald[600], textColor: '#fff', opacity: 1,
    });
  }, [lastOrder, addToCart]);

  // No order history
  if (buyAgainItems.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Clock size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>Buy Again</Text>
            <Text style={styles.subtitle}>Quick restock your favorites</Text>
          </View>
        </View>
        {lastOrder && (
          <TouchableOpacity style={styles.reorderAllBtn} onPress={handleReorderAll}>
            <ShoppingCart size={14} color={COLORS.emerald[700]} />
            <Text style={styles.reorderAllText}>Reorder All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Last Order Summary */}
      {lastOrder && (
        <TouchableOpacity style={styles.lastOrderBar} onPress={() => navigation.navigate('OrdersTab')}>
          <View style={styles.lastOrderInfo}>
            <Text style={styles.lastOrderLabel}>Last Order</Text>
            <Text style={styles.lastOrderDetail}>
              #{lastOrder.id?.slice(-6)} • {lastOrder.items?.length} items • ₹{lastOrder.totalAmount}
            </Text>
          </View>
          <ChevronRight size={16} color={COLORS.gray[400]} />
        </TouchableOpacity>
      )}

      {/* Buy Again Cards */}
      <FlatList
        data={buyAgainItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => `ba-${item.id}`}
        renderItem={({ item }) => <BuyAgainCard item={item} onAdd={handleAdd} />}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: SPACING.md,
    backgroundColor: '#ECFDF5',
    borderRadius: 28,
    paddingVertical: 20,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#059669',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#064E3B' },
  subtitle: { fontSize: 11, color: '#047857', fontWeight: '600' },
  reorderAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#D1FAE5', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0',
  },
  reorderAllText: { fontSize: 11, fontWeight: '800', color: COLORS.emerald[700] },

  // Last order bar
  lastOrderBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#D1FAE5',
  },
  lastOrderInfo: { flex: 1 },
  lastOrderLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gray[400], textTransform: 'uppercase' },
  lastOrderDetail: { fontSize: 12, fontWeight: '700', color: '#064E3B', marginTop: 2 },

  listContent: { paddingLeft: 16, paddingRight: 8 },

  // Card
  card: {
    width: 145, backgroundColor: '#fff',
    borderRadius: 18, padding: 12,
    marginRight: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  freqTag: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8,
  },
  freqText: { fontSize: 9, fontWeight: '800', color: '#047857' },
  image: {
    width: '100%', height: 75, borderRadius: 12,
    backgroundColor: '#F3F4F6', marginBottom: 8,
  },
  name: { fontSize: 12, fontWeight: '800', color: '#1F2937', lineHeight: 16 },
  meta: { fontSize: 9, color: '#9CA3AF', marginTop: 3, marginBottom: 8 },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  price: { fontSize: 15, fontWeight: '900', color: '#059669' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#059669', paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 10,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 2,
  },
  addBtnText: { fontSize: 11, fontWeight: '900', color: '#fff' },
});
