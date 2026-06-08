// Legacy compatibility — re-exports from new demo store system
import { DEMO_STORES } from './demoStores';

export const NEARBY_STORES = DEMO_STORES;

export const getStoresByDistance = () => {
  return [...DEMO_STORES].sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

export const getOpenStores = () => {
  return DEMO_STORES.filter(s => {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const cur = h * 60 + m;
    const [oh, om] = s.openTime.split(':').map(Number);
    const [ch, cm] = s.closeTime.split(':').map(Number);
    return cur >= (oh * 60 + om) && cur <= (ch * 60 + cm);
  });
};

export const getDeliveryStores = () => {
  return getOpenStores().filter(s => s.deliveryAvailable);
};
