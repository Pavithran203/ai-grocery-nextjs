import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import LiveTrackingCard from '../components/LiveTrackingCard';
import BuyAgain from '../components/BuyAgain';
import { COLORS, SPACING } from '../services/theme';
import { useLanguage } from '../context/LanguageContext';
import { usePreferences } from '../context/PreferencesContext';
import { useDebounce } from '../hooks/useDebounce';
import { searchService } from '../services/searchService';
import { storeService } from '../services/storeService';

// New home components
import WelcomeSection from '../components/home/WelcomeSection';
import PromoBanners from '../components/home/PromoBanners';
import GroceryCategories from '../components/home/GroceryCategories';
import NearbyStores from '../components/home/NearbyStores';
import MonthlyEssentials from '../components/home/MonthlyEssentials';
import GroceryOffers from '../components/home/GroceryOffers';
import HomeSearchOverlay from '../components/home/HomeSearchOverlay';
import FavoriteStores from '../components/home/FavoriteStores';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  const { searchedQueries, trackSearch, removeSearch } = usePreferences();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchVisible, setSearchVisible] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allProd = await api.getProducts();
        setAllProducts(allProd);
        storeService.syncWithBackend(allProd);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setSearchVisible(false);
      setSearchQuery('');
    });
    return unsubscribe;
  }, [navigation]);

  const handleSearchPress = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      if (searchQuery.trim().length > 0) {
        trackSearch(searchQuery);
      }
      setSearchQuery('');
    }
  };

  const handleProfilePress = () => navigation.navigate('ProfileTab');
  const handleAddressPress = () => navigation.navigate('AddressScreen');

  // Use debounced query for heavy filtering
  const filteredProducts = searchService.searchProducts(allProducts, debouncedSearchQuery);
  // Use raw query for fast live suggestions
  const liveSuggestions = searchService.getSuggestions(allProducts, searchQuery);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
        onAddressPress={handleAddressPress}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      {searchVisible && (
        <SearchBar
          inputRef={searchInputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => trackSearch(searchQuery)}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ padding: SPACING.md }}>
            <SkeletonLoader style={{ height: 80, marginBottom: 16, borderRadius: 16 }} />
            <SkeletonLoader style={{ height: 180, marginBottom: 20, borderRadius: 20 }} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <SkeletonLoader style={{ width: 68, height: 68, borderRadius: 22 }} />
              <SkeletonLoader style={{ width: 68, height: 68, borderRadius: 22 }} />
              <SkeletonLoader style={{ width: 68, height: 68, borderRadius: 22 }} />
              <SkeletonLoader style={{ width: 68, height: 68, borderRadius: 22 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonLoader style={{ width: '48%', height: 200, borderRadius: 18 }} />
              <SkeletonLoader style={{ width: '48%', height: 200, borderRadius: 18 }} />
            </View>
          </View>
        ) : searchVisible ? (
          <HomeSearchOverlay
            searchQuery={searchQuery}
            searchedQueries={searchedQueries}
            removeSearch={removeSearch}
            setSearchQuery={setSearchQuery}
            filteredProducts={filteredProducts}
            liveSuggestions={liveSuggestions}
            navigation={navigation}
            t={t}
          />
        ) : (
          <>
            {/* Live Tracking Overview */}
            <LiveTrackingCard />

            {/* Welcome Greeting */}
            <WelcomeSection />

            {/* Promotional Banners */}
            <PromoBanners navigation={navigation} />

            {/* Grocery Categories */}
            <GroceryCategories navigation={navigation} />

            {/* Favorite Stores - Only if user has pinned stores */}
            <FavoriteStores navigation={navigation} />

            {/* Nearby Stores — Primary Feature */}
            <NearbyStores navigation={navigation} />

            {/* Buy Again */}
            <BuyAgain navigation={navigation} />

            {/* Monthly Essentials Combos */}
            <MonthlyEssentials />

            {/* Grocery Offers */}
            <GroceryOffers navigation={navigation} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 120 },
});
