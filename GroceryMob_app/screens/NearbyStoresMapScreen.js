import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Platform,
  ActivityIndicator,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Callout, Circle } from 'react-native-maps';
import { ChevronLeft, Star, Navigation, MapPin, Truck, Clock, Store, Heart } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { storeService } from '../services/storeService';

const { width, height } = Dimensions.get('window');

export default function NearbyStoresMapScreen({ navigation }) {
  const { t } = useLanguage();
  const { coords, hasLocation, loading: locationLoading, requestLocation, permissionStatus } = useLocation();
  const mapRef = useRef(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const slideAnim = useRef(new Animated.Value(200)).current;

  const stores = useMemo(() => {
    if (!hasLocation) return [];
    return storeService.getNearbyStores(coords.latitude, coords.longitude, 35); // Show up to 35km
  }, [hasLocation, coords?.latitude, coords?.longitude]);

  useEffect(() => {
    if (selectedStore) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 250,
        useNativeDriver: true
      }).start();
    }
  }, [selectedStore]);

  const handleMarkerPress = (store) => {
    setSelectedStore(store);
    mapRef.current?.animateToRegion({
      latitude: store.latitude - 0.005, // Offset to show card below
      longitude: store.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  };

  const centerOnUser = () => {
    if (hasLocation) {
      mapRef.current?.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  if (locationLoading && !hasLocation) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>{t('Finding your location...')}</Text>
      </View>
    );
  }

  if (!hasLocation && permissionStatus !== 'granted') {
    return (
      <View style={styles.loaderContainer}>
        <MapPin size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
        <Text style={[styles.title, { marginBottom: 8 }]}>{t('Location Access Required')}</Text>
        <Text style={[styles.loaderText, { textAlign: 'center', marginHorizontal: 40, marginBottom: 24 }]}>
          {t('Please enable location access to see nearby grocery stores on the map.')}
        </Text>
        <TouchableOpacity 
          style={[styles.viewStoreBtn, { width: 200, flex: 0 }]} 
          onPress={requestLocation}
        >
          <Text style={styles.viewStoreText}>{t('Enable Location')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: 16 }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: COLORS.gray[500], fontWeight: '700' }}>{t('Go Back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion = {
    latitude: coords?.latitude || 12.9716, // Default to Bangalore if no location
    longitude: coords?.longitude || 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => setSelectedStore(null)}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            onPress={() => handleMarkerPress(store)}
          >
            <View style={[
              styles.customMarker,
              { backgroundColor: store.isOpen ? COLORS.primary : COLORS.gray[400] }
            ]}>
              <Text style={styles.markerEmoji}>{store.emoji}</Text>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}

        {hasLocation && (
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={3000} // 3km delivery radius demo
            fillColor="rgba(45, 106, 79, 0.05)"
            strokeColor="rgba(45, 106, 79, 0.2)"
            strokeWidth={1}
          />
        )}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerOverlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.foreground} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('Nearby Stores')}</Text>
            <Text style={styles.subtitle}>{stores.length} {t('stores nearby')}</Text>
          </View>
          <TouchableOpacity style={styles.locationBtn} onPress={centerOnUser}>
            <Navigation size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Store Preview Card */}
      {selectedStore && (
        <Animated.View 
          style={[
            styles.previewCardContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.previewCard}>
            <View style={styles.cardHeader}>
              <View style={styles.storeIconContainer}>
                <Text style={styles.storeIcon}>{selectedStore.emoji}</Text>
              </View>
              <View style={styles.storeMainInfo}>
                <Text style={styles.storeName}>{selectedStore.name}</Text>
                <Text style={styles.storeAddress}>{selectedStore.address}</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: selectedStore.isOpen ? '#ECFDF5' : '#FEF2F2' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: selectedStore.isOpen ? '#059669' : '#EF4444' }
                ]}>
                  {selectedStore.isOpen ? t('Open') : t('Closed')}
                </Text>
              </View>
            </View>

            {selectedStore.deliveryInfo && (
              <View style={[
                styles.warningBox, 
                { backgroundColor: selectedStore.deliveryInfo.status === 'out_of_range' ? '#FEF2F2' : '#F0FFF4', marginBottom: 12 }
              ]}>
                <Truck size={14} color={selectedStore.deliveryInfo.status === 'out_of_range' ? '#EF4444' : COLORS.primary} />
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '700', 
                  color: selectedStore.deliveryInfo.status === 'out_of_range' ? '#EF4444' : COLORS.primary 
                }}>
                  {t(selectedStore.deliveryInfo.message)}
                </Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.statValue}>{selectedStore.rating}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <MapPin size={14} color={COLORS.primary} />
                <Text style={styles.statValue}>{selectedStore.distance} km</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Clock size={14} color={COLORS.gray[400]} />
                <Text style={styles.statValue}>{selectedStore.openTime}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.viewStoreBtn}
                onPress={() => navigation.navigate('StoreDetail', { store: selectedStore })}
              >
                <Store size={18} color="#fff" />
                <Text style={styles.viewStoreText}>{t('View Store')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  titleContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  locationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  // Custom Marker
  customMarker: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  markerEmoji: {
    fontSize: 18,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    position: 'absolute',
    bottom: -8,
  },
  // Preview Card
  previewCardContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeIcon: {
    fontSize: 24,
  },
  storeMainInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: 10,
    borderRadius: 14,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  divider: {
    width: 1,
    height: 15,
    backgroundColor: COLORS.gray[200],
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewStoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewStoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 10 },
});
