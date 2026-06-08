import { api } from './api';

export const comboService = {
  getActiveCombos: async () => {
    try {
      return await api.getActiveCombos();
    } catch (error) {
      console.error('Error fetching combos:', error);
      return [];
    }
  },
  
  generateSmartCombos: async () => {
    try {
      return await api.getSmartCombos();
    } catch (error) {
      console.error('Error fetching smart combos:', error);
      return [];
    }
  },

  addComboToCart: async (comboId) => {
    try {
      const data = await api.addComboToCart(comboId);
      return { success: true, cart: data.cart };
    } catch (error) {
      console.error('Error adding combo to cart:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
