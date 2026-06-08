import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, SlidersHorizontal, ArrowDownAZ, CheckCircle } from 'lucide-react-native';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { searchService } from '../services/searchService';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SPACING } from '../services/theme';

export default function ProductListScreen({ route, navigation }) {
  const { category } = route.params || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('none'); // 'low-high', 'high-low', 'top-rated'
  const [filterInStock, setFilterInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchInputRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await api.getProducts(category);
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [category]);

  const baseProducts = debouncedSearchQuery.trim() !== '' 
    ? searchService.searchProducts(products, debouncedSearchQuery) 
    : products;

  const displayedProducts = baseProducts
    .filter(p => !filterInStock || (p.stock > 0 && p.inStock !== false))
    .sort((a, b) => {
      if (sortOrder === 'low-high') return a.price - b.price;
      if (sortOrder === 'high-low') return b.price - a.price;
      if (sortOrder === 'top-rated') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('low-high');
    else if (sortOrder === 'low-high') setSortOrder('high-low');
    else if (sortOrder === 'high-low') setSortOrder('top-rated');
    else setSortOrder('none');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(category) || t('All Products')}</Text>
        <TouchableOpacity style={styles.searchBtn} onPress={toggleSearch}>
          <Search color={COLORS.foreground} size={20} />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <View style={{ paddingBottom: SPACING.md }}>
          <SearchBar 
             inputRef={searchInputRef}
             value={searchQuery}
             onChangeText={setSearchQuery} 
          />
        </View>
      )}

      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterBtn} onPress={toggleSort}>
          <ArrowDownAZ size={16} color={sortOrder !== 'none' ? COLORS.primary : COLORS.gray[500]} />
          <Text style={[styles.filterText, sortOrder !== 'none' && styles.filterTextActive]}>
            {sortOrder === 'none' ? t('Sort') : sortOrder === 'low-high' ? t('Low-High') : sortOrder === 'high-low' ? t('High-Low') : t('Top Rated')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filterInStock && styles.filterBtnActive]} 
          onPress={() => setFilterInStock(!filterInStock)}
        >
          {filterInStock ? <CheckCircle size={16} color={COLORS.primary} /> : <SlidersHorizontal size={16} color={COLORS.gray[500]} />}
          <Text style={[styles.filterText, filterInStock && styles.filterTextActive]}>
            {t('In Stock Only')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>{t('No products found.')}</Text>
        }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 60,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 100,
    color: COLORS.gray[400],
    fontSize: 16,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  filterBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(92, 97, 242, 0.05)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  filterTextActive: {
    color: COLORS.primary,
  }
});
