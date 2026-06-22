import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FallbackImage from './FallbackImage';
import { Plus, Minus, Heart, Star, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SPACING } from '../services/theme';
import LoginPromptModal from './LoginPromptModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

function ProductCard({ product, navigation, campaignDiscount, isDeliverable = true, storeOpen = true }) {
  if (!product || !product.id) return null;
  
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const inCart = cartItems.find(item => item.id === product.id);
  const isLiked = isInWishlist(product.id);
  const quantity = inCart ? inCart.quantity : 0;
  const outOfStock = product.stock === 0 || product.inStock === false;
  const canAdd = !outOfStock && storeOpen;

  const handleToggleWishlist = () => {
    if (!user || user.isGuest) {
      setShowLoginModal(true);
      return;
    }
    toggleWishlist(product);
  };

  // Campaign discount: UI-only price override
  const hasCampaign = typeof campaignDiscount === 'number' && campaignDiscount > 0;
  const displayPrice = hasCampaign
    ? Math.round(product.price * (1 - campaignDiscount / 100))
    : product.price;
  const originalPrice = hasCampaign ? product.price : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetail', { product, isDeliverable, isStoreOpen: storeOpen })}
        style={styles.imageContainer}
      >
        <FallbackImage source={{ uri: product.image }} style={styles.image} resizeMode="contain" type="product" productName={product.name} entityId={product.id || product._id} />
        {hasCampaign ? (
          <View style={[styles.badge, styles.campaignBadge]}>
            <Text style={[styles.badgeText, { color: '#fff' }]}>🔥 {campaignDiscount}% OFF</Text>
          </View>
        ) : null}
        <TouchableOpacity 
          style={styles.heartBtn} 
          onPress={handleToggleWishlist}
        >
          <Heart size={20} color={isLiked ? COLORS.rose[500] : COLORS.gray[400]} fill={isLiked ? COLORS.rose[500] : 'transparent'} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{t(product.category || 'Grocery')}</Text>
          {product.rating > 0 && (
            <View style={styles.ratingBox}>
              <Star size={10} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product, isDeliverable, isStoreOpen: storeOpen })}>
          <Text style={styles.name} numberOfLines={2}>{t(product.name)}</Text>
        </TouchableOpacity>
        <Text style={styles.unit}>{t(product.unit) || t('1 kg')}</Text>

        <View style={styles.stockRow}>
          {product.stockStatus === 'OUT_OF_STOCK' ? (
            <View style={[styles.stockBadge, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.stockText, { color: '#EF4444' }]}>{t('Out of Stock')}</Text>
            </View>
          ) : product.stockStatus === 'LIMITED' ? (
            <View style={[styles.stockBadge, { backgroundColor: '#FFFBEB' }]}>
              <Text style={[styles.stockText, { color: '#F59E0B' }]}>
                {t('Only')} {product.stockQuantity} {t('left')}
              </Text>
            </View>
          ) : product.isHighDemand ? (
            <View style={[styles.stockBadge, { backgroundColor: '#F0FFF4' }]}>
              <Text style={[styles.stockText, { color: COLORS.primary }]}>{t('High Demand')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceColumn}>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
            <Text style={styles.price}>₹{product.price}</Text>
          </View>

          {quantity > 0 && storeOpen ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => updateQuantity(product.id, quantity - 1)}
                disabled={product.stockStatus === 'OUT_OF_STOCK'}
              >
                <Minus size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => updateQuantity(product.id, quantity + 1)}
                disabled={product.stockStatus === 'OUT_OF_STOCK' || (product.stockStatus === 'LIMITED' && quantity >= product.stockQuantity)}
              >
                <Plus size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[
                styles.addButton, 
                (product.stockStatus === 'OUT_OF_STOCK' || !storeOpen) && styles.addButtonDisabled
              ]} 
              onPress={() => canAdd && product.stockStatus !== 'OUT_OF_STOCK' && addToCart(product, 1)}
              activeOpacity={storeOpen ? 0.7 : 1}
              disabled={!storeOpen || product.stockStatus === 'OUT_OF_STOCK'}
            >
              {storeOpen ? (
                <>
                  <Plus size={18} color="#fff" />
                  <Text style={styles.addButtonText}>{t('Add')}</Text>
                </>
              ) : (
                <Text style={styles.addButtonText}>{t('Closed')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
    </View>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 12,
    marginRight: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    height: 130,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '900' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  details: { paddingTop: 12, flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  category: { fontSize: 10, fontWeight: '700', color: COLORS.gray[400], textTransform: 'uppercase', letterSpacing: 0.5 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: '800', color: '#B45309' },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.foreground, lineHeight: 19, marginBottom: 2, height: 38 },
  unit: { fontSize: 11, color: COLORS.gray[500], marginBottom: 8, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 },
  priceColumn: { justifyContent: 'center' },
  originalPrice: { fontSize: 11, color: COLORS.gray[400], textDecorationLine: 'line-through', marginBottom: -2 },
  price: { fontSize: 17, fontWeight: '900', color: COLORS.foreground },
  stockRow: { height: 22, justifyContent: 'center', marginBottom: 8 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  stockText: { fontSize: 9, fontWeight: '800' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  addButtonDisabled: { backgroundColor: COLORS.gray[200], shadowOpacity: 0, elevation: 0 },
  addButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FFF4', borderRadius: 12, borderWidth: 1, borderColor: COLORS.emerald[100] },
  qtyBtn: { padding: 8 },
  quantityText: { fontSize: 14, fontWeight: '800', color: COLORS.foreground, minWidth: 20, textAlign: 'center' },
  campaignBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
  },
});
