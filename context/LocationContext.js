"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAddress } from './AddressContext';
import { useTranslation } from 'react-i18next';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [locationText, setLocationText] = useState('');
  // Default to the geographic center of all 25 Chennai stores (Guindy/Saidapet area)
  const [coords, setCoords] = useState({ latitude: 13.0071, longitude: 80.2200 });
  const [zipCode, setZipCode] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [loading, setLoading] = useState(true);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const { addresses, addAddress } = useAddress();
  const { i18n } = useTranslation();
  const language = i18n.language;

  // Load from storage on mount
  useEffect(() => {
    const savedText = localStorage.getItem('fk_location_text');
    const savedCoords = localStorage.getItem('fk_coords');
    const savedZip = localStorage.getItem('fk_zip');

    if (savedText) setLocationText(savedText);
    if (savedCoords) setCoords(JSON.parse(savedCoords));
    if (savedZip) setZipCode(savedZip);
    
    setLoading(false);
  }, []);

  // Save to storage when changed
  useEffect(() => {
    if (locationText) localStorage.setItem('fk_location_text', locationText);
    if (coords) localStorage.setItem('fk_coords', JSON.stringify(coords));
    if (zipCode) localStorage.setItem('fk_zip', zipCode);
  }, [locationText, coords, zipCode]);

  // Map app language to ISO codes for Nominatim
  const getLangCode = useCallback((lang) => {
    const mapping = {
      'en': 'en',
      'ta': 'ta',
      'te': 'te',
      'kn': 'kn',
      'ml': 'ml',
      'hi': 'hi'
    };
    return mapping[lang] || 'en';
  }, []);

  // Reverse geocode coordinates via Nominatim
  const reverseGeocode = async (lat, lng) => {
    const langCode = getLangCode(language);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${langCode},en;q=0.5`
    );
    const data = await res.json();
    return data;
  };

  const requestLocation = useCallback(async (force = false) => {
    if (!force && (locationText || coords)) return true;
    
    setLoading(true);

    if (!("geolocation" in navigator)) {
      setPermissionStatus('denied');
      setLoading(false);
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(userCoords);
          setPermissionStatus('granted');

          try {
            const data = await reverseGeocode(userCoords.latitude, userCoords.longitude);
            const addr = data.address || {};
            const text = [
              addr.city || addr.town || addr.village || addr.suburb || addr.county,
              addr.state || addr.country
            ].filter(Boolean).join(', ');
            setLocationText(text);
            if (addr.postcode) setZipCode(addr.postcode);

            // Auto-create first address (matching mobile behavior)
            if (addresses.length === 0) {
              addAddress({
                label: 'Home',
                fullName: 'My Location',
                phone: '',
                line1: addr.road || addr.suburb || addr.neighbourhood || '',
                line2: '',
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                pincode: addr.postcode || '',
              });
            }

            setLoading(false);
            resolve(true);
          } catch (err) {
            console.error('Geocoding error:', err);
            setLoading(false);
            resolve(false);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setPermissionStatus('denied');
          setLoading(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, [addresses, addAddress, locationText, coords]);

  useEffect(() => {
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update location text when language changes
  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      reverseGeocode(coords.latitude, coords.longitude)
        .then(data => {
          const addr = data.address || {};
          const text = [
            addr.city || addr.town || addr.village || addr.suburb || addr.county,
            addr.state || addr.country
          ].filter(Boolean).join(', ');
          if (text) {
            setLocationText(text);
            localStorage.setItem('fk_location_text', text);
          }
        })
        .catch(err => console.error("Language geocode failed", err));
    }
  }, [language, coords]); // Depend on language and coords

  // Get current address details (for auto-fill in forms)
  const getCurrentAddress = async () => {
    if (!("geolocation" in navigator)) {
      throw new Error('Geolocation not supported');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            const addr = data.address || {};
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            if (addr.postcode) setZipCode(addr.postcode);
            resolve(addr);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(new Error('Location permission denied'));
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            reject(new Error('Location services are disabled'));
          } else {
            reject(new Error('Location request timed out'));
          }
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  };

  // Reverse geocode arbitrary coordinates (for map selection)
  const reverseGeocodeCoords = async (lat, lng) => {
    const data = await reverseGeocode(lat, lng);
    const addr = data.address || {};
    return {
      road: addr.road || addr.suburb || addr.neighbourhood || '',
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      postcode: addr.postcode || '',
      display: data.display_name || '',
    };
  };

  const setUserZipCode = (zip) => setZipCode(zip);

  const hasLocation = coords !== null;
  const hasZip = zipCode.length >= 5;
  const locationAvailable = hasLocation || hasZip;

  return (
    <LocationContext.Provider value={{
      locationText,
      setLocationText,
      coords,
      zipCode,
      permissionStatus,
      loading,
      hasLocation,
      hasZip,
      locationAvailable,
      requestLocation,
      getCurrentAddress,
      reverseGeocodeCoords,
      setUserZipCode,
      isLocationModalOpen,
      setLocationModalOpen,
    }}>
      {children}
    </LocationContext.Provider>
  );
};
