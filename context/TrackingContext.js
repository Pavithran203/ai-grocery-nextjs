// Client Component
"use client";
import React, { createContext, useContext, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TrackingContext = createContext(null);

const DEFAULT_LOC = { latitude: 13.0827, longitude: 80.2707 };
const WAREHOUSE_OFFSET = { lat: 0.04, lng: 0.04 };

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

function getHeading(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const l1 = lat1 * Math.PI / 180;
  const l2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(l2);
  const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export function TrackingProvider({ children }) {
  const { t } = useTranslation();
  const [isTracking, setIsTracking] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  
  const [userLoc, setUserLoc] = useState(DEFAULT_LOC);
  const [warehouseLoc, setWarehouseLoc] = useState(DEFAULT_LOC);
  const [riderLoc, setRiderLoc] = useState(DEFAULT_LOC);
  
  const [heading, setHeading] = useState(0);
  const [progressIdx, setProgressIdx] = useState(0); 
  const [currentStage, setCurrentStage] = useState('Order Placed'); 
  const [eta, setEta] = useState(15);
  const [distanceKm, setDistanceKm] = useState(0);

  const timerRef = useRef(null);

  const startTracking = async (orderId) => {
    if (isTracking && activeOrderId === orderId) return;

    if (timerRef.current) clearInterval(timerRef.current);
    
    setActiveOrderId(orderId);
    setIsTracking(true);
    setCurrentStage('Order Placed');
    setProgressIdx(0);
    setEta(15);

    let fUserLoc = DEFAULT_LOC;
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        fUserLoc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      } catch (e) {
        console.log('Location fallback');
      }
    }
    const fWhLoc = { latitude: fUserLoc.latitude + WAREHOUSE_OFFSET.lat, longitude: fUserLoc.longitude + WAREHOUSE_OFFSET.lng };

    setUserLoc(fUserLoc);
    setWarehouseLoc(fWhLoc);
    setRiderLoc(fWhLoc);

    let coords = [fWhLoc, fUserLoc];
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fWhLoc.longitude},${fWhLoc.latitude};${fUserLoc.longitude},${fUserLoc.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        coords = data.routes[0].geometry.coordinates.map(c => ({ latitude: c[1], longitude: c[0] }));
      }
    } catch (e) {}

    setRouteCoords(coords);
    setDistanceKm(getDistance(fWhLoc.latitude, fWhLoc.longitude, fUserLoc.latitude, fUserLoc.longitude));

    setTimeout(() => {
      setCurrentStage('Packed');
      setTimeout(() => {
        setCurrentStage('Out for Delivery');
        startMovementEngine(coords, fUserLoc);
      }, 3000);
    }, 3000);
  };

  const startMovementEngine = (coords, finalUserLoc) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const TOTAL_TIME_MS = 60000;
    const intervalMs = TOTAL_TIME_MS / coords.length;
    let idx = 0;

    timerRef.current = setInterval(() => {
      if (idx >= coords.length - 1) {
        clearInterval(timerRef.current);
        setCurrentStage('Delivered');
        setEta(0);
        setDistanceKm(0);
        setRiderLoc(finalUserLoc);
        return;
      }

      const p1 = coords[idx];
      const p2 = coords[idx + 1];
      
      setHeading(getHeading(p1.latitude, p1.longitude, p2.latitude, p2.longitude));
      setRiderLoc(p2);
      
      const dist = getDistance(p2.latitude, p2.longitude, finalUserLoc.latitude, finalUserLoc.longitude);
      setDistanceKm(dist);

      if (dist < 0.5) {
        setCurrentStage('Arriving Soon');
      }
      
      const progressPercent = idx / coords.length;
      setEta(Math.max(0, Math.ceil((1 - progressPercent) * 15)));

      setProgressIdx(idx);
      idx++;
    }, intervalMs);
  };

  const getProximityMessage = () => {
    if (currentStage === 'Order Placed') return t('tracking.preparingItems');
    if (currentStage === 'Packed') return t('tracking.waitingPartner');
    if (currentStage === 'Delivered') return t('tracking.orderDelivered');
    
    if (distanceKm > 5) return t('tracking.riderOnWay');
    if (distanceKm > 2) return t('tracking.riderCloser');
    if (distanceKm > 0.5) return t('tracking.riderNearby');
    if (distanceKm > 0.1) return t('tracking.riderAway', { dist: Math.round(distanceKm * 1000) });
    return t('tracking.riderAlmostArrived');
  };

  return (
    <TrackingContext.Provider value={{
      isTracking, activeOrderId, routeCoords,
      userLoc, warehouseLoc, riderLoc, heading,
      currentStage, eta, distanceKm,
      getProximityMessage, startTracking, progressIdx
    }}>
      {children}
    </TrackingContext.Provider>
  );
}

export const useTracking = () => {
  return useContext(TrackingContext);
};
