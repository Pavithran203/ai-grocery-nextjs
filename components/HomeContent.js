"use client";

import React from 'react';
import PromoBanners from './home/PromoBanners';
import GroceryCategories from './home/GroceryCategories';
import SmartRecommendations from './home/SmartRecommendations';
import MonthlyEssentials from './home/MonthlyEssentials';
import NearbyStores from './home/NearbyStores';
import GroceryOffers from './home/GroceryOffers';
import LiveTrackingCard from './home/LiveTrackingCard';
import HeroSection from './home/HeroSection';
import ComboOffers from './home/ComboOffers';
import { useStore } from '@/context/StoreContext';
import { products } from '@/services/mockData';

export default function HomeContent({ allProducts = [], bundles = [] }) {
  const { 
    selectedStore, 
    matchedShops,
    selectStore,
    getShopProducts
  } = useStore();

  return (
    <>
      {/* ── Landing Hero ── */}
      <HeroSection />

      <div className="max-w-7xl mx-auto pb-32 space-y-12 lg:space-y-20 pt-8">
      {/* Live Tracking Overview (Only visible if active order) */}
      <LiveTrackingCard />

      {/* Seasonal & Festival Combo Offers (Auto-hides if none active) */}
      {/* <ComboOffers bundles={bundles} /> */}

      {/* Promotional Banners */}
      <PromoBanners />

      {/* Grocery Categories */}
      <GroceryCategories />

      {/* Nearby Stores */}
      <NearbyStores />

      {/* AI Recommendations */}
      <SmartRecommendations allProducts={getShopProducts(allProducts, selectedStore)} />

      {/* Monthly Essentials */}
      <MonthlyEssentials />

      {/* Trending Products (Grocery Offers) */}
      <GroceryOffers />
      </div>
    </>
  );
}
