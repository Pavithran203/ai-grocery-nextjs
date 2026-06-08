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
// Generates a simulated path from a nearby store to the customer's coordinates
const generateDeliveryPath = (customerCoords) => {
  const { latitude: lat, longitude: lng } = customerCoords || { latitude: 13.0827, longitude: 80.2707 }; // Default Chennai
  
  // Create a "store" slightly offset from the user (about 1.5km away)
  const storeLat = lat + 0.008;
  const storeLng = lng - 0.005;

  return [
    { lat: storeLat, lng: storeLng, label: "FreshKart Store" },
    { lat: storeLat - 0.002, lng: storeLng + 0.001, label: "" },
    { lat: storeLat - 0.005, lng: storeLng + 0.003, label: "" },
    { lat: lat + 0.001, lng: lng - 0.001, label: "" },
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
  const currentPos = path[deliveryBoyPos];
  const pathCoords = path.map(p => [p.lat, p.lng]);
  const center = [(storePos.lat + customerPos.lat) / 2, (storePos.lng + customerPos.lng) / 2];

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "280px", width: "100%", borderRadius: "0 0 24px 24px" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {/* Route line */}
      <Polyline positions={pathCoords} pathOptions={{ color: "#10B981", weight: 4, dashArray: "8,8", opacity: 0.7 }} />

      {/* Store marker */}
      <Marker position={[storePos.lat, storePos.lng]} icon={storeIcon}>
        <Popup><b>🏪 {t('tracking.storeName', 'Near Mart Store')}</b><br/>{t('tracking.nearbyStore', 'Nearby Store')}</Popup>
      </Marker>

      {/* Customer marker */}
      <Marker position={[customerPos.lat, customerPos.lng]} icon={customerIcon}>
        <Popup><b>🏠 {t('location.currentLocation', 'Your Location')}</b><br/>{t('checkout.deliveryAddress', 'Delivery address')}</Popup>
      </Marker>

      {/* Delivery boy marker */}
      <Marker position={[currentPos.lat, currentPos.lng]} icon={bikeIcon}>
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

  // Generate dynamic path based on user coordinates
  const path = useMemo(() => generateDeliveryPath(coords), [coords]);

  // Simulate stage progression
  useEffect(() => {
    const stageTimings = [2000, 4000, 6000];
    let currentStage = 0;
    const advance = () => {
      if (currentStage < DELIVERY_STAGES.length - 1) {
        const timeout = setTimeout(() => {
          currentStage++;
          setStage(currentStage);
          advance();
        }, stageTimings[currentStage] || 8000);
        return timeout;
      }
    };
    const t = advance();
    return () => clearTimeout(t);
  }, [DELIVERY_STAGES]);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Simulate delivery boy moving
  useEffect(() => {
    posIntervalRef.current = setInterval(() => {
      setDeliveryBoyPos(prev => {
        if (prev < path.length - 1) return prev + 1;
        clearInterval(posIntervalRef.current);
        return prev;
      });
    }, 4000);
    return () => clearInterval(posIntervalRef.current);
  }, [path]);

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

        {/* ETA Card */}
        <div className="!bg-[#064E3B] rounded-[32px] p-8 text-white shadow-2xl shadow-emerald-900/30 border border-emerald-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">{t('tracking.estimatedDelivery', 'Estimated Delivery')}</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-emerald-400" />
                </div>
                <span className="text-5xl font-black tracking-tight">{timeLeft} <span className="text-2xl text-emerald-400">{t('tracking.min', 'mins')}</span></span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-black/20 rounded-2xl px-5 py-3 border border-white/5 backdrop-blur-md">
                <p className="font-black text-xl text-white">{order?.estimatedDelivery || '15 mins'}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">{t('checkout.expressDeliveryPromise', 'Express delivery')}</p>
              </div>
            </div>
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
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
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

          {/* Real OpenStreetMap via Leaflet */}
          <LeafletMap deliveryBoyPos={deliveryBoyPos} path={path} />
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
