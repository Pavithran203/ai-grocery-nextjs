import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Tag, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';

const GROCERY_OFFERS = [
  {
    id: 'offer-1',
    title: 'Buy 5kg Rice',
    highlight: 'Get ₹50 OFF',
    description: 'On any 5kg rice pack from local stores',
    emoji: '🍚',
    bgColor: '#2D6A4F',
    requiredItems: [
      { keywords: ['rice'], exclude: ['flour', 'poha', 'mix'], targetWeight: 5, targetUnit: 'kg' }
    ],
    discountType: 'flat',
    discountValue: 50,
  },
  {
    id: 'offer-2',
    title: 'Cooking Oil Combo',
    highlight: 'Save ₹80',
    description: 'Buy 2L oil + 500ml ghee combo',
    emoji: '🫒',
    bgColor: '#C96A22',
    requiredItems: [
      { keywords: ['oil'], exclude: ['hair', 'massage', 'ghee'], targetWeight: 2, targetUnit: 'l' },
      { keywords: ['ghee'], exclude: [], targetWeight: 500, targetUnit: 'ml' }
    ],
    discountType: 'flat',
    discountValue: 80,
  },
  {
    id: 'offer-4',
    title: 'Atta + Dal Pack',
    highlight: 'Flat ₹100 OFF',
    description: 'Buy 5kg Atta + 2kg Dal together',
    emoji: '🌾',
    bgColor: '#5B4A3F',
    requiredItems: [
      { keywords: ['atta', 'wheat'], exclude: [], targetWeight: 5, targetUnit: 'kg' },
      { keywords: ['dal'], exclude: [], targetWeight: 2, targetUnit: 'kg' }
    ],
    discountType: 'flat',
    discountValue: 100,
  },
];

export default function GroceryOffers({ navigation }) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Tag size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>{t('Best Store Deals')}</Text>
            <Text style={styles.subtitle}>{t('Handpicked savings from local shops')}</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} decelerationRate="fast">
        {GROCERY_OFFERS.map((offer) => (
          <TouchableOpacity 
            key={offer.id} 
            style={[styles.card, { backgroundColor: offer.bgColor }]} 
            activeOpacity={0.85} 
            onPress={() => navigation.navigate('GroceryOfferDetails', { offer })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.offerEmoji}>{offer.emoji}</Text>
              <Text style={styles.offerTitle}>{t(offer.title)}</Text>
              <View style={styles.highlightPill}>
                <Text style={styles.highlightText}>{offer.highlight}</Text>
              </View>
              <Text style={styles.offerDesc}>{t(offer.description)}</Text>
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>{t('Shop Now')}</Text>
                <ChevronRight size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.blob} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.md },
  header: { paddingHorizontal: 20, marginBottom: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  subtitle: { fontSize: 11, color: COLORS.gray[500], fontWeight: '600' },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  card: { width: 180, borderRadius: 20, padding: 16, marginRight: 12, overflow: 'hidden', minHeight: 200 },
  cardContent: { zIndex: 2 },
  offerEmoji: { fontSize: 32, marginBottom: 8 },
  offerTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 6 },
  highlightPill: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  highlightText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  offerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', lineHeight: 15, marginBottom: 12 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ctaText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  blob: { position: 'absolute', right: -30, bottom: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
});
