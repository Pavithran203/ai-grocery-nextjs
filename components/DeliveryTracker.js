"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  CheckCircle2, Phone, Star, MapPin, Package,
  ChefHat, Bike, Home, Clock, Navigation, Sparkles, ArrowLeft
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";

// ─── Path Generator ───
// Helper: Fallback mock path if OSRM fails
const getFallbackPath = (lat, lng) => {
  const storeLat = lat + 0.012;
  const storeLng = lng - 0.008;
  return [
    { lat: storeLat, lng: storeLng, label: "NearMart Store" },
    { lat: storeLat - 0.006, lng: storeLng + 0.004, label: "" },
    { lat: lat + 0.002, lng: lng - 0.002, label: "" },
    { lat: lat, lng: lng, label: "Your Location" },
  ];
};

// Dynamically import Leaflet components to avoid SSR "window is not defined" error
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false });

let L;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

// ─── Leaflet Map Component (loaded dynamically, no SSR) ───
function LeafletMapInner({ deliveryBoyPos, path }) {
  const { t } = useTranslation();
  // Fix leaflet default icon issue in Next.js
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  const storeIcon = useMemo(() => L.divIcon({
    html: `<div style="background:#3B82F6;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);">🏪</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }), []);

  const customerIcon = useMemo(() => L.divIcon({
    html: `<div style="background:#10B981;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);">🏠</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }), []);

  const bikeIcon = useMemo(() => L.divIcon({
    html: `<div style="background:#F97316;color:white;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 6px 20px rgba(249,115,22,0.5);animation:bounce 1s infinite alternate;">🛵</div>`,
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  }), []);

  const storePos = path[0];
  const customerPos = path[path.length - 1];
  const pathCoords = path.map(p => [p.lat, p.lng]);
  const center = [(storePos.lat + customerPos.lat) / 2, (storePos.lng + customerPos.lng) / 2];

  const markerRef = useRef(null);

  // Smoothly interpolate the delivery partner's position between points at 60fps
  useEffect(() => {
    let animationFrame;
    let startTime = null;
    const duration = 4000; // Matches the interval in the parent component

    const targetPos = path[deliveryBoyPos];
    const startPos = deliveryBoyPos > 0 ? path[deliveryBoyPos - 1] : path[0];

    // If we're already at the end or haven't moved, just set it directly
    if (deliveryBoyPos === 0 || startPos === targetPos) {
      if (markerRef.current) {
        markerRef.current.setLatLng([targetPos.lat, targetPos.lng]);
      }
      return;
    }

    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear interpolation (lerp)
      const currentLat = startPos.lat + (targetPos.lat - startPos.lat) * progress;
      const currentLng = startPos.lng + (targetPos.lng - startPos.lng) * progress;

      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [deliveryBoyPos, path]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "280px", width: "100%", borderRadius: "0 0 24px 24px" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {/* Route line */}
      <Polyline positions={pathCoords} pathOptions={{ color: "#10B981", weight: 5, opacity: 0.9 }} />

      {/* Store marker */}
      <Marker position={[storePos.lat, storePos.lng]} icon={storeIcon}>
        <Popup><b>🏪 {t('tracking.storeName', 'Near Mart Store')}</b><br/>{t('tracking.nearbyStore', 'Nearby Store')}</Popup>
      </Marker>

      {/* Customer marker */}
      <Marker position={[customerPos.lat, customerPos.lng]} icon={customerIcon}>
        <Popup><b>🏠 {t('location.currentLocation', 'Your Location')}</b><br/>{t('checkout.deliveryAddress', 'Delivery address')}</Popup>
      </Marker>

      {/* Delivery boy marker (Animated via Ref) */}
      <Marker ref={markerRef} position={[path[0].lat, path[0].lng]} icon={bikeIcon}>
        <Popup><b>🛵 {t('tracking.deliveryPartner', 'Delivery Partner')}</b><br/>{t('tracking.onTheWay', 'On the way!')}</Popup>
      </Marker>
    </MapContainer>
  );
}

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMap = dynamic(
  () => Promise.resolve(LeafletMapInner),
  { ssr: false, loading: () => {
    const { t } = useTranslation();
    return (
      <div className="h-[280px] bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center rounded-b-3xl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-gray-500">{t('tracking.loadingLiveMap', 'Loading live map...')}</p>
        </div>
      </div>
    );
  }}
);

export default function DeliveryTracker({ order }) {
  const { coords } = useLocation();
  const [stage, setStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(18);
  const [deliveryBoyPos, setDeliveryBoyPos] = useState(0);
  const intervalRef = useRef(null);
  const posIntervalRef = useRef(null);
  const { t } = useTranslation();

  // Live stages mapped to translation keys
  const DELIVERY_STAGES = useMemo(() => [
    { id: 0, label: t('tracking.stageConfirmed', 'Order Confirmed'), icon: <CheckCircle2 className="w-5 h-5" />, color: "emerald", desc: t('tracking.stageConfirmedDesc', "We've received your order!") },
    { id: 1, label: t('tracking.stagePicking', 'Picking Items'), icon: <Package className="w-5 h-5" />, color: "blue", desc: t('tracking.stagePickingDesc', "Our team is packing your fresh items.") },
    { id: 2, label: t('tracking.stageDelivery', 'Out for Delivery'), icon: <Bike className="w-5 h-5" />, color: "orange", desc: t('tracking.stageDeliveryDesc', "Your order is on the way!") },
    { id: 3, label: t('tracking.stageDelivered', 'Delivered'), icon: <Home className="w-5 h-5" />, color: "emerald", desc: t('tracking.stageDeliveredDesc', "Enjoy your fresh groceries! 🎉") },
  ], [t]);

  // Real-world dynamic path fetching from OSRM
  const [path, setPath] = useState([]);
  useEffect(() => {
    let isMounted = true;
    const fetchRoute = async () => {
      const { latitude: lat, longitude: lng } = coords || { latitude: 13.0827, longitude: 80.2707 };
      const storeLat = lat + 0.015;
      const storeLng = lng - 0.010;
      
      try {
        // Fetch actual road geometry from OSRM
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${storeLng},${storeLat};${lng},${lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data && data.routes && data.routes[0]) {
          const coordsArr = data.routes[0].geometry.coordinates;
          const mappedPath = coordsArr.map(c => ({ lat: c[1], lng: c[0] }));
          if (isMounted) setPath(mappedPath);
        } else {
          throw new Error('No route found');
        }
      } catch(e) {
        if (isMounted) setPath(getFallbackPath(lat, lng));
      }
    };
    fetchRoute();
    return () => { isMounted = false; };
  }, [coords]);

  // Simulate stage progression up to Out For Delivery
  const { updateOrderStatus } = require('@/context/OrdersContext').useOrders();
  
  // Use a ref to always hold the latest update function without triggering re-renders
  const updateRef = useRef(updateOrderStatus);
  useEffect(() => {
    updateRef.current = updateOrderStatus;
  }, [updateOrderStatus]);

  useEffect(() => {
    const stageTimings = [3000, 4000]; // Reaches stage 2 (Out for delivery) in 7 seconds
    let currentStage = 0;
    const advance = () => {
      if (currentStage < 2) {
        const timeout = setTimeout(() => {
          currentStage++;
          setStage(currentStage);
          
          // Map stage index to actual string statuses
          const statusMap = ['confirmed', 'preparing', 'out_for_delivery'];
          if (order && (order.id || order.orderId) && updateRef.current) {
             updateRef.current(order.id || order.orderId, statusMap[currentStage]);
          }

          advance();
        }, stageTimings[currentStage]);
        return timeout;
      }
    };
    const t = advance();
    return () => clearTimeout(t);
  }, [order]);

  // Trigger Delivered (Stage 3) ONLY when bike reaches the destination
  useEffect(() => {
    if (path.length > 0 && deliveryBoyPos === path.length - 1 && stage === 2) {
      setStage(3);
      setTimeLeft(0);
      if (order && (order.id || order.orderId) && updateRef.current) {
         updateRef.current(order.id || order.orderId, 'delivered');
      }
    }
  }, [deliveryBoyPos, path, stage, order]);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Simulate delivery boy moving along the real path ONLY when Out For Delivery
  useEffect(() => {
    if (path.length === 0 || stage < 2) return;
    
    // Calculate speed based on total path points (roughly ~40 seconds total journey)
    const intervalTime = Math.max(800, Math.floor(40000 / path.length)); 
    
    posIntervalRef.current = setInterval(() => {
      setDeliveryBoyPos(prev => {
        if (prev < path.length - 1) return prev + 1;
        clearInterval(posIntervalRef.current);
        return prev;
      });
    }, intervalTime);
    return () => clearInterval(posIntervalRef.current);
  }, [path, stage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 relative">
        
        {/* Back Button */}
        <div className="flex justify-start mb-2">
            <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                {t('common.backToHome', 'Back to Home')}
            </Link>
        </div>

        {/* Success Header */}
        <div className="text-center py-6">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('tracking.orderPlaced', 'Order Placed! 🎉')}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t('common.order', 'Order')} <span className="font-black text-emerald-600 dark:text-emerald-400">#{order?.orderId || 'NEW'}</span> {t('tracking.confirmed', 'confirmed')}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t('tracking.transactionId', 'Transaction ID')}: {order?.transactionId || 'TXN-PENDING'}</p>
        </div>

        {/* Zepto-Style Order Status Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
          {/* Top Tag */}
          <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/20">
            <Sparkles size={12} /> On time
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
            {/* Left: ETA and Status */}
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-1">{t('tracking.arrivingIn', 'Arriving in')}</p>
              <h2 className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-2">
                {timeLeft} <span className="text-2xl">mins</span>
              </h2>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-tight max-w-[200px]">
                Your order is <span className="lowercase">{DELIVERY_STAGES[stage]?.label || 'getting ready'}</span>
              </p>
            </div>

            {/* Right: Mock Promo / Ad & Coins Earned */}
            <div className="flex flex-col gap-3 md:w-48">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-800/30 flex flex-col justify-center text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm">NearMart</span>
                  <span className="text-[10px] font-black text-gray-500">PLUS</span>
                </div>
                <p className="font-black text-sm text-gray-800 dark:text-gray-200 leading-tight">Switch to <span className="text-emerald-600">10% Savings</span></p>
                <button className="mt-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                  Apply Now
                </button>
              </div>
              
              {/* Coins Earned Banner */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="text-xl">💰</div>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Loyalty Reward</p>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-100">+{Math.floor((order?.total || order?.amount || 0) / 10)} Coins earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: View Map (Decorative scroll trigger) */}
          <div className="bg-gray-50 dark:bg-gray-950 p-4 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <MapPin size={18} />
              </div>
              <span className="font-black text-gray-800 dark:text-gray-200 text-sm">Track your order</span>
            </div>
            <button 
              onClick={() => document.getElementById('live-map-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              View Map
            </button>
          </div>
        </div>

        {/* Live Delivery Stage Tracker */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="font-black text-gray-800 dark:text-white text-lg mb-6">{t('tracking.liveOrderStatus', 'Live Order Status')}</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-800 z-0"></div>
            <div
              className="absolute left-5 top-5 w-0.5 bg-emerald-500 z-0 transition-all duration-1000"
              style={{ height: `${(stage / (DELIVERY_STAGES.length - 1)) * 100}%` }}
            ></div>

            <div className="space-y-6 relative z-10">
              {DELIVERY_STAGES.map((s, i) => {
                const isCompleted = i <= stage;
                const isActive = i === stage;
                return (
                  <div key={s.id} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    } ${isActive ? 'ring-4 ring-emerald-200 dark:ring-emerald-800 scale-110' : ''}`}>
                      {s.icon}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-black text-sm transition-colors ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {s.label}
                        {isActive && <span className="ml-2 text-emerald-500 text-xs font-bold animate-pulse">● {t('common.live', 'LIVE')}</span>}
                      </p>
                      {isCompleted && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real Live Map */}
        <div id="live-map-section" className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-500" />
              <h2 className="font-black text-gray-800 dark:text-white">{t('tracking.liveDeliveryMap', 'Live Delivery Map')}</h2>
            </div>
            <span className="flex items-center gap-1 text-xs text-orange-500 font-black">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping inline-block"></span>
              {t('common.live', 'LIVE')}
            </span>
          </div>

          {/* The Map */}
          <div className="w-full relative z-0">
            {path.length > 0 ? (
              <LeafletMap deliveryBoyPos={deliveryBoyPos} path={path} />
            ) : (
              <div className="h-[280px] bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center rounded-b-3xl">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm font-bold text-gray-500">{t('tracking.loadingLiveMap', 'Loading live map...')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Boy Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="font-black text-gray-800 dark:text-white text-lg mb-4">{t('tracking.yourDeliveryPartner', 'Your Delivery Partner')}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(order?.deliveryBoy?.name || 'Partner').replace(' ','')}&backgroundColor=b6e3f4`}
                alt={order?.deliveryBoy?.name || 'Partner'}
                className="w-16 h-16 rounded-2xl border-2 border-emerald-200 bg-emerald-50"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                <Bike className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-black text-gray-900 dark:text-white text-lg">{order?.deliveryBoy?.name || t('common.connecting', 'Connecting...')}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{order?.deliveryBoy?.rating || '4.5'} · {t('common.excellent', 'Excellent')}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{order?.deliveryBoy?.vehicle || t('tracking.deliveryBike', 'Delivery Bike')}</p>
            </div>
            <a
              href={`tel:${order?.deliveryBoy?.phone || '#'}`}
              className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" />
              {t('common.call', 'Call')}
            </a>
          </div>
        </div>

        {/* Order Details (Items List) */}
        {order?.items && order.items.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="font-black text-gray-800 dark:text-white text-lg mb-4">{t('cart.yourOrder', 'Order Details')}</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=100'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="font-bold text-gray-600 dark:text-gray-400 text-sm">Total Paid</span>
              <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">₹{order.total || order.amount || 0}</span>
            </div>
          </div>
        )}

        {/* Continue Shopping */}
        <div className="text-center pb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black hover:underline text-sm"
          >
            ← {t('cart.continueShopping', 'Continue Shopping')}
          </a>
        </div>

      </div>
    </div>
  );
}
