import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FallbackImage from './FallbackImage';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';

export default function CategorySection({ categories, navigation }) {
  const { t } = useLanguage();
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.container}
      snapToAlignment="center"
      decelerationRate="fast"
    >
      {categories.map((category, index) => (
        <TouchableOpacity 
          key={category._id || category.id || index.toString()}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CategoryMarketplace', { category: category.name })}
          style={styles.item}
        >
          <View style={styles.imageWrapper}>
            <FallbackImage source={{ uri: category.image }} style={styles.image} />
          </View>
          <Text style={styles.name}>{t(category.name)}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.item}
        onPress={() => navigation.navigate('CategoryMarketplace', { category: 'All Products' })}
      >
        <View style={styles.viewAllWrapper}>
          <Text style={styles.viewAllText}>{t('View All')}</Text>
        </View>
        <Text style={[styles.name, { opacity: 0 }]}>.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  item: {
    alignItems: 'center',
    width: 80,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    shadowColor: COLORS.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  name: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  viewAllWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[400],
  }
});
