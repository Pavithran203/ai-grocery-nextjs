import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Heart, Star, Navigation, Clock, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoriteContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';

export default function FavoriteStores({ navigation }) {
  const { t } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const { coords } = useLocation();
  const { user } = useAuth();

  const isGuest = !user || user.isGuest;

  const favoriteStores = useMemo(() => {
    if (isGuest || !favorites || favorites.length === 0) return [];
    
    return favorites
      .map(id => storeService.getStoreById(id, coords?.latitude, coords?.longitude))
      .filter(s => s !== null);
  }, [favorites, coords, isGuest]);

  // Guest View / Empty View
  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Heart size={20} color="#fff" fill="#fff" />
            </View>
            <View>
              <Text style={styles.title}>{t('Your Favorite Stores')}</Text>
              <Text style={styles.subtitle}>{t('Login for personalized stores')}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.guestCard}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.guestContent}>
            <Text style={styles.guestTitle}>{t('Save your favorite stores')}</Text>
            <Text style={styles.guestSubtitle}>{t('Login to access your personalized stores and track them anytime.')}</Text>
            <View style={styles.guestBtn}>
              <Text style={styles.guestBtnText}>{t('Login')}</Text>
            </View>
          </View>
          <View style={styles.guestIcon}>
             <Heart size={40} color={COLORS.rose[100]} fill={COLORS.rose[100]} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (favoriteStores.length === 0) return null;

  const handleStorePress = (store) => {
    navigation.navigate('StoreDetail', { store });
  };

  const renderStore = ({ item: store }) => {
    const status = store.status;
    const isClosed = status.type === 'CLOSED' || status.type === 'CLOSED_TODAY';

    return (
      <TouchableOpacity 
        style={[styles.card, isClosed && styles.cardDisabled]} 
        onPress={() => !isClosed && handleStorePress(store)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.emojiCircle}>
            <Text style={{ fontSize: 24 }}>{store.emoji}</Text>
          </View>
          <TouchableOpacity 
            style={styles.favBtn} 
            onPress={() => toggleFavorite(store.id)}
          >
            <Heart size={16} color={COLORS.rose[500]} fill={COLORS.rose[500]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{store.rating}</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{store.distance} km</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{t(status.label)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Heart size={20} color="#fff" fill="#fff" />
          </View>
          <View>
            <Text style={styles.title}>{t('Your Favorite Stores')}</Text>
            <Text style={styles.subtitle}>{favoriteStores.length} {t('saved for quick access')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('StoresTab')}>
          <Text style={styles.seeAllText}>{t('See All')}</Text>
          <ChevronRight size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={favoriteStores}
        keyExtractor={item => item.id}
        renderItem={renderStore}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 20, paddingRight: 16, marginBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.rose[500], justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.rose[500], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  subtitle: { fontSize: 11, color: COLORS.gray[500], fontWeight: '600' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FFF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  seeAllText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  listContent: { paddingHorizontal: SPACING.md, gap: 12 },
  card: { 
    width: 160, backgroundColor: COLORS.white, borderRadius: 20, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: COLORS.gray[100]
  },
  cardDisabled: { opacity: 0.7, backgroundColor: COLORS.gray[50] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  emojiCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center' },
  favBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  storeName: { fontSize: 14, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '800', color: COLORS.foreground },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.gray[300], marginHorizontal: 6 },
  metaText: { fontSize: 11, color: COLORS.gray[400], fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '800' },
  guestCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: '#FFF1F2',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  guestContent: {
    flex: 1,
    paddingRight: 10,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.rose[600],
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 12,
    color: COLORS.rose[400],
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 14,
  },
  guestBtn: {
    backgroundColor: COLORS.rose[500],
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  guestBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  guestIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
