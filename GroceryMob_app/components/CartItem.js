import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FallbackImage from './FallbackImage';
import { Plus, Minus, Trash2, Tag } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CartItem({ item, onUpdate, onRemove }) {
  const { comboItemIds } = useCart();
  const { t } = useLanguage();
  
  const isComboItem = comboItemIds.has(item.id);
  const displayPrice = item.cartPrice || item.price;
  const originalPrice = item.originalPrice || item.price;
  const hasSavings = isComboItem && originalPrice > displayPrice;
  const savings = hasSavings ? originalPrice - displayPrice : 0;

  return (
    <View style={[styles.container, isComboItem && styles.comboContainer]}>
      {isComboItem && (
        <View style={styles.comboBadge}>
          <Tag size={10} color={COLORS.white} />
          <Text style={styles.comboBadgeText}>{t('COMBO')}</Text>
        </View>
      )}
      <View style={styles.imageBox}>
        <FallbackImage source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{t(item.name)}</Text>
        <Text style={styles.category}>{t(item.category)}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{displayPrice.toFixed(2)}</Text>
          {hasSavings && (
            <>
              <Text style={styles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>{t('Save')} ₹{savings}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
          <Trash2 size={16} color={COLORS.rose[500]} />
        </TouchableOpacity>
        
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => onUpdate(item.id, item.quantity - 1)} style={styles.stepBtn}>
            <Minus size={14} color={COLORS.foreground} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => onUpdate(item.id, item.quantity + 1)} style={styles.stepBtn}>
            <Plus size={14} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  comboContainer: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.indigo[50] + '30',
  },
  comboBadge: {
    position: 'absolute',
    top: 0,
    left: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    gap: 3,
  },
  comboBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  imageBox: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  category: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: COLORS.emerald[400] + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald[600],
  },
  actions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  removeBtn: {
    padding: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: 4,
    gap: 10,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '800',
    width: 20,
    textAlign: 'center',
  }
});
