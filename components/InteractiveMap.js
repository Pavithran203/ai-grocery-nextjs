"use client";

import { useState, useEffect } from 'react';
import { MapPin, Check, Loader2, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// We need a wrapper to use hooks like useMap inside the MapContainer
const MapHooksWrapper = ({ center, setPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (center && map.flyTo) {
      map.flyTo(center, 16);
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return null;
};

export default function InteractiveMap({ onConfirm, onCancel }) {
  const [position, setPosition] = useState({ lat: 13.0827, lng: 80.2707 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setIsClient(true);
    
    // Fix Leaflet icons only on client
    const L = require('leaflet');
    
    // Create custom Emerald Pin icon
    const iconHtml = `
      <div style="
        background-color: #10B981;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(16,185,129,0.4);
        border: 3px solid white;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: iconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    window.L_CUSTOM_ICON = customIcon;
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const langCode = i18n.language || 'en';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&accept-language=${langCode}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isClient) return (
    <div className="w-full aspect-[4/3] rounded-[32px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-800">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 animate-fadeIn">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative group shrink-0">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          )}
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('location.searchPlaceholder', 'Search for area, street, or landmark...')}
          className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-emerald-500/20 transition-all shadow-inner"
        />
      </form>

      {/* Map Container */}
      <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-xl z-0 shrink-0 group">
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution='&copy; Google Maps' />
          <MapHooksWrapper center={position} setPosition={setPosition} />
          {isClient && window.L_CUSTOM_ICON && (
            <Marker position={position} icon={window.L_CUSTOM_ICON} />
          )}
        </MapContainer>
        
        {/* Map Overlay Button (Locate Me) */}
        <div className="absolute top-4 right-4 z-[1000]">
          <div className="bg-white dark:bg-gray-900 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
             <MapPin className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Selected Area Indicator */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border-2 border-emerald-500/10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MapPin className="w-5 h-5" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1.5">{t('location.pinnedLocation', 'Pinned Location')}</p>
                <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">
                  {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </p>
             </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button 
          onClick={() => onConfirm(position)}
          disabled={isFinalizing}
          className="w-full gradient-btn py-4 rounded-2xl text-white font-black shadow-xl flex items-center justify-center gap-3 active:scale-95"
        >
          {isFinalizing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t('location.finalizing', 'Finalizing...')}</>
          ) : (
            <>{t('location.confirmLocation', 'Confirm Selected Location')} <Check className="w-5 h-5" /></>
          )}
        </button>

        <button 
          onClick={onCancel} 
          className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-500 transition-colors"
        >
          {t('location.cancelGoBack', 'Cancel and Go Back')}
        </button>
      </div>
    </div>
  );
}
