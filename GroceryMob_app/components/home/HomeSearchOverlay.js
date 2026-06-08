import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, X, Search, Clock } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';
import ProductCard from '../ProductCard';

const TRENDING_SUGGESTIONS = ['rice', 'dal', 'atta', 'cooking oil', 'sugar', 'masala'];

export default function HomeSearchOverlay({
  searchQuery,
  searchedQueries,
  removeSearch,
  setSearchQuery,
  filteredProducts,
  liveSuggestions,
  navigation,
  t,
}) {
  // No query entered — show recent searches + trending
  if (searchQuery.length === 0) {
    return (
      <View style={styles.container}>
        {searchedQueries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Clock size={16} color={COLORS.gray[400]} />  {t('Recent Searches')}
            </Text>
            <View style={styles.pillContainer}>
              {searchedQueries.map(q => (
                <View key={q} style={styles.pillBox}>
                  <TouchableOpacity onPress={() => setSearchQuery(q)}>
                    <Text style={styles.pillText}>{q}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeSearch(q)}>
                    <X size={14} color={COLORS.gray[400]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <TrendingUp size={16} color={COLORS.gray[400]} />  {t('Trending Now')}
          </Text>
          <View style={styles.pillContainer}>
            {TRENDING_SUGGESTIONS.map(q => (
              <TouchableOpacity key={q} style={styles.trendingPill} onPress={() => setSearchQuery(q)}>
                <Search size={14} color={COLORS.primary} />
                <Text style={styles.trendingPillText}>{t(q)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Query entered — show results
  return (
    <View style={styles.container}>
      {liveSuggestions.length > 0 && (
        <View style={{ marginBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {liveSuggestions.map((suggestion, idx) => (
              <TouchableOpacity key={idx} style={styles.suggestionPill} onPress={() => setSearchQuery(suggestion)}>
                <Search size={14} color={COLORS.primary} />
                <Text style={styles.suggestionPillText}>{t(suggestion)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.resultTitle}>{t('search_results')} ({filteredProducts.length})</Text>

      {filteredProducts.length > 0 ? (
        <View style={styles.searchGrid}>
          {filteredProducts.map(product => (
            <View key={`search-${product.id}`} style={styles.searchGridItem}>
              <ProductCard product={product} navigation={navigation} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.noResultsText}>{t('no_products_found')} "{searchQuery}".</Text>
          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
            <TrendingUp size={16} color={COLORS.gray[400]} />  {t('Popular Searches')}
          </Text>
          <View style={styles.pillContainer}>
            {TRENDING_SUGGESTIONS.slice(0, 4).map(q => (
              <TouchableOpacity key={q} style={styles.trendingPill} onPress={() => setSearchQuery(q)}>
                <Search size={14} color={COLORS.primary} />
                <Text style={styles.trendingPillText}>{t(q)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, marginTop: SPACING.sm },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pillBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray[50], borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: COLORS.gray[100] },
  pillText: { fontSize: 13, color: COLORS.foreground, fontWeight: '500' },
  trendingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  trendingPillText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  suggestionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 6, borderWidth: 1, borderColor: COLORS.primary + '30' },
  suggestionPillText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  resultTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground, marginBottom: 4 },
  searchGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  searchGridItem: { width: '48%', marginBottom: SPACING.lg },
  noResultsText: { padding: SPACING.md, color: COLORS.gray[400], textAlign: 'center', marginTop: SPACING.xl, fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: SPACING.xl },
});
