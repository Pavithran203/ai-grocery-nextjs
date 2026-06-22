import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FallbackImage from '../components/FallbackImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, ShoppingCart, Star } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SPACING } from '../services/theme';
import LoginPromptModal from '../components/LoginPromptModal';

export default function ProductDetailScreen({ route, navigation }) {
  const { product, megaDeal, isStoreOpen = true } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { cartItems, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { trackView } = usePreferences();
  const { t } = useLanguage();
  
  const inCart = cartItems.find(item => item.id === product.id);
  const isLiked = isInWishlist(product.id);
  const outOfStock = product.stock === 0 || product.inStock === false;
  const isDisabled = outOfStock || !isStoreOpen;

  const handleToggleWishlist = () => {
    if (!user || user.isGuest) {
      setShowLoginModal(true);
      return;
    }
    toggleWishlist(product);
  };

  // Mega Deal pricing
  const hasMegaDeal = megaDeal && megaDeal.dealPrice;
  const displayPrice = hasMegaDeal ? megaDeal.dealPrice : product.price;
  const originalPrice = hasMegaDeal ? (product.mrp || Math.round(product.price * 1.25)) : null;

  useEffect(() => {
    trackView(product.category);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <FallbackImage source={{ uri: product.image }} style={styles.image} resizeMode="contain" type="product" productName={product.name} entityId={product.id || product._id} />
          {hasMegaDeal ? (
            <View style={[styles.badge, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.badgeText}>{t(megaDeal.dealConfig?.badge || '🔥 Mega Deal')}</Text>
            </View>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>-{Math.round(((product.originalPrice || product.price * 1.2) - product.price) / (product.originalPrice || product.price * 1.2) * 100)}%</Text>
            </View>
          )}
          <TouchableOpacity 
             style={styles.heartBtn}
             onPress={handleToggleWishlist}
          >
            <Heart size={24} color={isLiked ? COLORS.rose[500] : COLORS.gray[400]} fill={isLiked ? COLORS.rose[500] : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{t(product.category)}</Text>
              <Text style={styles.name}>{t(product.name)}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{displayPrice.toFixed ? displayPrice.toFixed(2) : displayPrice}</Text>
            {originalPrice && (
              <Text style={{ fontSize: 14, color: COLORS.gray[400], textDecorationLine: 'line-through', marginLeft: 8 }}>₹{originalPrice}</Text>
            )}
            <View style={[styles.stockBadge, outOfStock ? styles.outOfStock : styles.inStock]}>
              <Text style={[styles.stockText, outOfStock ? styles.outOfStockText : styles.inStockText]}>
                {outOfStock ? t('Out of Stock') : t('In Stock')}
              </Text>
            </View>
          </View>

          {hasMegaDeal && (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#92400E' }}>{t('Mega Deal Active!')}</Text>
                <Text style={{ fontSize: 12, color: '#B45309' }}>{t('You save')} ₹{megaDeal.savings} • {megaDeal.dealConfig?.type === 'percent' ? `${megaDeal.dealConfig.value}% ${t('OFF')}` : `₹${megaDeal.dealConfig?.value} ${t('OFF')}`}</Text>
              </View>
            </View>
          )}
          
          <Text style={styles.description}>
            {t("High-quality")} {t(product.name)} {t("sourced for your daily kitchen needs.")} 
            {t("Experience the best quality and value with our handpicked grocery essentials, delivered fresh from your trusted local store.")}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('Quality')}</Text>
              <Text style={styles.statValue}>{t('Premium')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('Packed')}</Text>
              <Text style={styles.statValue}>{product.unit || '1 kg'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('Delivery')}</Text>
              <Text style={styles.statValue}>30-60m</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!isStoreOpen && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedBannerText}>{t('This store is currently closed')}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={[styles.addBtn, isDisabled && styles.addBtnDisabled]}
          onPress={() => !isDisabled && addToCart(product)}
          disabled={isDisabled}
        >
          <ShoppingCart color={COLORS.white} size={20} />
          <Text style={styles.addBtnText}>
            {!isStoreOpen ? t('Store Closed') : outOfStock ? t('Out of Stock') : (inCart ? t('Add More to Cart') : t('Add to Cart'))}
          </Text>
        </TouchableOpacity>
      </View>

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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 60,
    alignItems: 'center',
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  badge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  heartBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.foreground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  content: {
    padding: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  category: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.rose[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  inStock: {
    backgroundColor: COLORS.emerald[100],
  },
  outOfStock: {
    backgroundColor: COLORS.rose[100],
  },
  stockText: {
    fontSize: 12,
    fontWeight: '800',
  },
  inStockText: {
    color: COLORS.emerald[700],
  },
  outOfStockText: {
    color: COLORS.rose[700],
  },
  description: {
    fontSize: 15,
    color: COLORS.gray[500],
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.lg,
    borderRadius: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  addBtnDisabled: {
    backgroundColor: COLORS.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  closedBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  closedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
});
