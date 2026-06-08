// AI-like keyword mapping — grocery essentials only
const KEYWORD_MAP = {
  'cooking': ['oil', 'rice', 'dal', 'flour', 'spices', 'salt', 'sugar', 'ghee', 'masala'],
  'staples': ['rice', 'dal', 'flour', 'oil', 'sugar', 'salt', 'atta'],
  'monthly': ['rice', 'dal', 'oil', 'sugar', 'salt', 'atta', 'ghee'],
  'masala': ['turmeric', 'chilli', 'coriander', 'garam masala', 'pepper', 'cumin', 'mustard'],
  'spice': ['turmeric', 'chilli', 'coriander', 'garam masala', 'pepper', 'cumin', 'mustard'],
  'breakfast': ['rava', 'vermicelli', 'idli', 'rice flour', 'urad dal'],
  'oil': ['sunflower', 'groundnut', 'gingelly', 'coconut', 'sesame'],
  'flour': ['atta', 'maida', 'besan', 'ragi', 'rice flour'],
};

export const searchService = {
  searchProducts: (products, query) => {
    if (!query || query.trim() === '') return [];

    const q = query.toLowerCase().trim();
    
    // Check if query triggers an AI mapping
    let searchTerms = [q];
    for (const [key, values] of Object.entries(KEYWORD_MAP)) {
      if (q.includes(key) || key.includes(q)) {
        searchTerms = [...searchTerms, ...values];
      }
    }

    const scoredProducts = products.map(product => {
      let score = 0;
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const tags = (product.tags || []).map(t => t.toLowerCase());

      // Evaluate against all active search terms (original + mapped)
      searchTerms.forEach(term => {
        // Priority 1: Exact Name Match
        if (name === term) {
          score += 10;
        } 
        // Priority 2: Partial Name Match
        else if (name.includes(term)) {
          score += 4;
        }

        // Priority 3: Category Match
        if (category === term || category.includes(term)) {
          score += 3;
        }

        // Priority 4: Tag Match
        if (tags.some(tag => tag.includes(term))) {
          score += 2;
        }

        // Priority 5: Description Match
        if (desc.includes(term)) {
          score += 1;
        }
      });

      return { product, score };
    });

    // Filter out zero scores and sort by highest score first
    return scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  },

  getSuggestions: (products, query) => {
    if (!query || query.trim() === '') return [];
    
    const q = query.toLowerCase().trim();
    const suggestions = new Set();

    // 1. Check for AI mapping suggestions
    for (const [key, values] of Object.entries(KEYWORD_MAP)) {
      if (key.startsWith(q)) {
        suggestions.add(key);
      }
    }

    // 2. Add matching categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(q)) {
        suggestions.add(cat);
      }
    });

    // 3. Add exact matching product names (up to 5 total)
    for (const product of products) {
      if (suggestions.size >= 5) break;
      if (product.name && product.name.toLowerCase().includes(q)) {
        suggestions.add(product.name);
      }
    }

    return Array.from(suggestions).slice(0, 5);
  }
};
