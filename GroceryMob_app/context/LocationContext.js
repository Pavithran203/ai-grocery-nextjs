import * as Location from 'expo-location';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAddress } from './AddressContext';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState(null); // null = not yet determined
  const [zipCode, setZipCode] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('undetermined'); // 'undetermined' | 'granted' | 'denied'
  const [loading, setLoading] = useState(true);
  const { addresses, addAddress } = useAddress();

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setLocationText('');
        setCoords(null);
        setLoading(false);
        return false;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        if (Platform.OS === 'android') {
          try { await Location.enableNetworkProviderAsync(); } catch (e) { /* ignore */ }
        }
        const recheckServices = await Location.hasServicesEnabledAsync();
        if (!recheckServices) {
          setPermissionStatus('denied');
          setCoords(null);
          setLocationText('');
          setLoading(false);
          return false;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCoords(userCoords);

      const geocode = await Location.reverseGeocodeAsync(userCoords);
      if (geocode.length > 0) {
        const addr = geocode[0];
        const text = [addr.city || addr.subregion || addr.district, addr.region || addr.country].filter(Boolean).join(', ');
        setLocationText(text);
        if (addr.postalCode) setZipCode(addr.postalCode);

        if (addresses.length === 0) {
          addAddress({
            label: 'Current Location',
            fullName: 'My Location',
            phone: '',
            line1: addr.name || addr.street || addr.district || '',
            line2: '',
            city: addr.city || addr.subregion || '',
            state: addr.region || '',
            pincode: addr.postalCode || '',
          });
        }
      }
      setLoading(false);
      return true;
    } catch (err) {
      console.log('Location error:', err.message);
      setPermissionStatus('denied');
      setCoords(null);
      setLocationText('');
      setLoading(false);
      return false;
    }
  }, [addresses, addAddress]);

  const getCurrentAddress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission denied');

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        if (Platform.OS === 'android') {
          try { await Location.enableNetworkProviderAsync(); } catch (e) { throw new Error('Location services disabled'); }
        } else {
          throw new Error('Location services disabled');
        }
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        if (geocode[0].postalCode) setZipCode(geocode[0].postalCode);
        return geocode[0];
      }
      throw new Error('Could not resolve address');
    } catch (err) {
      console.error('getCurrentAddress error:', err);
      throw err;
    }
  };

  const setUserZipCode = (zip) => setZipCode(zip);

  // Derived flags
  const hasLocation = coords !== null;
  const hasZip = zipCode.length >= 5;
  const locationAvailable = hasLocation || hasZip;

  return (
    <LocationContext.Provider value={{
      locationText,
      coords,
      zipCode,
      permissionStatus,
      loading,
      hasLocation,
      hasZip,
      locationAvailable,
      requestLocation,
      getCurrentAddress,
      setUserZipCode,
    }}>
      {children}
    </LocationContext.Provider>
  );
};
