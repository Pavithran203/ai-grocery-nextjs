/**
 * Order Intelligence Service
 * Analyzes order history to power Buy Again and reorder features.
 */

/**
 * Extract and score all products from order history.
 * Scoring: frequency(+5), recency(+4), quantity(+2)
 */
export function getBuyAgainItems(orders = []) {
  if (!orders || orders.length === 0) return [];

  const productMap = {};
  const now = new Date().getTime();

  orders.forEach((order, orderIdx) => {
    if (order.status === 'Cancelled') return;
    const orderDate = new Date(order.createdAt || Date.now()).getTime();
    const daysSince = Math.max(1, (now - orderDate) / (1000 * 60 * 60 * 24));

    (order.items || []).forEach(item => {
      if (!item || !item.id) return;
      const key = item.id;

      if (!productMap[key]) {
        productMap[key] = {
          ...item,
          _frequency: 0,
          _totalQty: 0,
          _lastOrderDate: order.createdAt,
          _lastOrderId: order.id,
          _recencyScore: 0,
          _daysSince: daysSince,
        };
      }

      productMap[key]._frequency += 1;
      productMap[key]._totalQty += (item.quantity || 1);

      // Keep the most recent order date
      if (orderDate > new Date(productMap[key]._lastOrderDate || 0).getTime()) {
        productMap[key]._lastOrderDate = order.createdAt;
        productMap[key]._lastOrderId = order.id;
        productMap[key]._daysSince = daysSince;
      }
    });
  });

  // Score and sort
  const scored = Object.values(productMap).map(item => {
    const frequencyScore = item._frequency * 5;
    const recencyScore = Math.max(0, 4 - Math.floor(item._daysSince / 7)); // Decay over weeks
    const quantityScore = Math.min(item._totalQty, 5) * 2;
    const totalScore = frequencyScore + recencyScore + quantityScore;

    return {
      ...item,
      _score: totalScore,
      _frequencyLabel: item._frequency >= 3 ? 'Frequent' : item._frequency >= 2 ? 'Ordered twice' : 'Ordered once',
    };
  });

  return scored
    .filter(item => item.price && item.name) // Remove invalid
    .sort((a, b) => b._score - a._score);
}

/**
 * Get the last complete order for "Reorder Entire Basket"
 */
export function getLastOrder(orders = []) {
  const valid = orders.filter(o => o && o.status !== 'Cancelled' && o.items && o.items.length > 0);
  return valid.length > 0 ? valid[0] : null;
}

/**
 * Format relative date string
 */
export function formatOrderDate(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
