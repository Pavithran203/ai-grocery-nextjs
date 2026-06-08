"use client";
import React, { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { storeService } from '../../../services/storeService';
import { api } from '../../../services/api';
import { useStore } from '../../../context/StoreContext';
import ProductsContent from '../../../components/ProductsContent';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Clock, Truck } from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.id;
  const { t } = useTranslation();
  const { coords: userCoords } = useLocation();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getShopProducts } = useStore();

  useEffect(() => {
    async function fetchData() {
      const coords = userCoords || { latitude: 13.0827, longitude: 80.2707 };
      const storeData = storeService.getStoreById(storeId, coords.latitude, coords.longitude);
      setStore(storeData);
      
      const allProducts = await api.getProducts();
      setProducts(allProducts);
      setLoading(false);
    }
    if (storeId) fetchData();
  }, [storeId, getShopProducts]);

  if (loading) return <div className="p-20 text-center font-black">Loading Store...</div>;
  if (!store) return <div className="p-20 text-center font-black text-red-500">Store Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Store Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <Link href="/stores" className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-6 hover:text-emerald-500 transition-colors">
            <ArrowLeft size={16} />
            Back to Stores
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] sm:rounded-[40px] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-5xl sm:text-6xl shadow-inner shrink-0">
              {store.logo || store.emoji}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{store.name}</h1>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black" style={{ backgroundColor: store.status.bgColor, color: store.status.color }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: store.status.color }} />
                  {t[store.status.label] || store.status.label}
                </div>
              </div>
              
              <p className="text-gray-500 font-medium mb-4 max-w-2xl">{store.description || 'Premium grocery store with a wide range of fresh products and essentials.'}</p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <span className="font-black text-gray-900 dark:text-white">{store.rating}</span>
                  <span className="text-gray-400">(500+ reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-500" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{store.distance} km away</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-blue-500" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{store.deliveryInfo?.message || 'Delivery available'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-black mb-6">Products from {store.name}</h2>
        <ProductsContent products={products} store={store} />
      </div>
    </div>
  );
}
