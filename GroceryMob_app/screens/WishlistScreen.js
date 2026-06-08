import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { COLORS, SPACING } from '../services/theme';
import { Heart, ChevronLeft, LogIn } from 'lucide-react-native';

export default function WishlistScreen({ navigation }) {
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isGuest = !user || user.isGuest;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('My Wishlist')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {isGuest ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconBox}>
            <LogIn size={64} color={COLORS.gray[200]} />
          </View>
          <Text style={styles.emptyTitle}>{t('Login Required')}</Text>
          <Text style={styles.emptySubtitle}>{t('Please login to save your favorite products and access your wishlist anytime.')}</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.shopBtnText}>{t('Login Now')}</Text>
          </TouchableOpacity>
        </View>
      ) : wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <ProductCard product={item} navigation={navigation} />
            </View>
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.iconBox}>
            <Heart size={64} color={COLORS.gray[200]} />
          </View>
          <Text style={styles.emptyTitle}>{t('Nothing here yet')}</Text>
          <Text style={styles.emptySubtitle}>{t('Save your favorite items to your wishlist to find them easily later.')}</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
            <Text style={styles.shopBtnText}>{t('Explore Products')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, height: 60,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray[50],
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  listContent: { padding: SPACING.sm, paddingBottom: 100 },
  gridItem: { flex: 1, padding: SPACING.xs },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  iconBox: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.gray[50],
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.gray[400], textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20 },
  shopBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
