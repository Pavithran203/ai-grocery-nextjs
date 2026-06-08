import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LayoutGrid } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';

const GROCERY_CATEGORIES = [
  { id: 'rice-grains', name: 'Rice & Grains', emoji: '🍚', bgColor: '#FFF8F0', textColor: '#8B4513' },
  { id: 'dal-pulses', name: 'Dal & Pulses', emoji: '🫘', bgColor: '#FFF5E6', textColor: '#A0522D' },
  { id: 'atta-flour', name: 'Atta & Flour', emoji: '🌾', bgColor: '#FFFDE7', textColor: '#7C6600' },
  { id: 'oils-ghee', name: 'Oils & Ghee', emoji: '🫒', bgColor: '#F0FFF4', textColor: '#2D6A4F' },
  { id: 'masalas-spices', name: 'Masalas & Spices', emoji: '🌶️', bgColor: '#FFF0F0', textColor: '#CC3333' },
  { id: 'sugar-salt', name: 'Sugar & Salt', emoji: '🧂', bgColor: '#F5F5FF', textColor: '#4A4A8A' },
];

export default function GroceryCategories({ navigation }) {
  const { t } = useLanguage();

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryMarketplace', { category: category.name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <LayoutGrid size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>{t('Shop by Category')}</Text>
            <Text style={styles.subtitle}>{t('Explore local store categories')}</Text>
          </View>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {GROCERY_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.7}
            onPress={() => handleCategoryPress(category)}
            style={styles.item}
          >
            <View style={[styles.emojiCircle, { backgroundColor: category.bgColor }]}>
              <Text style={styles.emoji}>{category.emoji}</Text>
            </View>
            <Text style={[styles.name, { color: category.textColor }]} numberOfLines={2}>
              {t(category.name)}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('CategoryMarketplace', { category: 'All Products' })}
        >
          <View style={styles.viewAllCircle}>
            <Text style={styles.viewAllText}>{t('View All')}</Text>
          </View>
          <Text style={[styles.name, { opacity: 0 }]}>.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.saffron[500], justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.saffron[500], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  subtitle: { fontSize: 11, color: COLORS.gray[500], fontWeight: '600' },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 12,
    paddingBottom: SPACING.md,
  },
  item: {
    alignItems: 'center',
    width: 78,
  },
  emojiCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
  },
  name: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  viewAllCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[400],
  },
});
