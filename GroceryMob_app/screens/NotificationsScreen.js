import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Bell, ShoppingBag, Tag, Truck, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Order Delivered!',
    message: 'Your order from Fresh Mart has been delivered successfully. Rate your experience!',
    time: '2 mins ago',
    type: 'delivery',
    icon: <Truck size={20} color="#fff" />,
    bgColor: COLORS.emerald[500],
    read: false,
  },
  {
    id: '2',
    title: 'Huge Savings Alert! 🏷️',
    message: 'Get 50% OFF on all monthly essentials at Organic Pantry. Limited time offer!',
    time: '1 hour ago',
    type: 'offer',
    icon: <Tag size={20} color="#fff" />,
    bgColor: COLORS.saffron[500],
    read: false,
  },
  {
    id: '3',
    title: 'New Store Nearby!',
    message: 'Daily Needs Grocery is now available in your area. Check out their products.',
    time: '3 hours ago',
    type: 'store',
    icon: <ShoppingBag size={20} color="#fff" />,
    bgColor: COLORS.primary,
    read: true,
  },
  {
    id: '4',
    title: 'Item Restocked',
    message: 'Organic Brown Rice is now back in stock at Whole Foods. Grab it before it sells out!',
    time: 'Yesterday',
    type: 'stock',
    icon: <Bell size={20} color="#fff" />,
    bgColor: COLORS.indigo[800],
    read: true,
  }
];

export default function NotificationsScreen({ navigation }) {
  const { t } = useLanguage();

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notifCard, !item.read && styles.unreadCard]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
        {item.icon}
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle}>{t(item.title)}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{t(item.message)}</Text>
        <Text style={styles.notifTime}>{t(item.time)}</Text>
      </View>
      <ChevronRight size={18} color={COLORS.gray[300]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Notifications')}</Text>
        <TouchableOpacity style={styles.clearBtn}>
          <Trash2 size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={64} color={COLORS.gray[200]} />
            <Text style={styles.emptyText}>{t('No notifications yet')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: COLORS.gray[50] },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  clearBtn: { padding: 8 },
  listContent: { padding: SPACING.md },
  notifCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  unreadCard: { 
    borderColor: COLORS.primary + '20',
    backgroundColor: COLORS.primary + '05',
  },
  iconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notifContent: { flex: 1, marginHorizontal: 16 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '800', color: COLORS.foreground },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  notifMessage: { fontSize: 13, color: COLORS.gray[500], lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: COLORS.gray[400], fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: COLORS.gray[400], fontWeight: '700', marginTop: 16 },
});
