/**
 * Customer Order Store
 * 
 * Bridges customer-side orders (stored in localStorage by OrdersContext)
 * with the admin panel, so all orders placed by any account are visible
 * in the admin dashboard and orders manager.
 * 
 * Customer orders are stored under `nearmart_orders_{userId}` keys.
 * This module also maintains a shared admin key `nearmart_admin_orders`
 * that aggregates all customer orders for the admin panel.
 */

const ADMIN_ORDERS_KEY = 'nearmart_admin_orders';
const ORDERS_PREFIX = 'nearmart_orders_';

export interface CustomerOrder {
  id: string;
  _id?: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  status: string;
  orderStatus?: string;
  assignedTo: string;
  placedAt: string;
  createdAt?: string;
  deliveryEta: string;
  address: string;
  paymentMethod: string;
  items: { productId?: string; id?: string; name: string; quantity: number; price: number }[];
  statusHistory: { status: string; timestamp: string }[];
  notes: string;
}

/**
 * Save an order to the shared admin-visible store.
 * Called from OrdersContext or checkout when a new order is placed.
 */
export function pushOrderToAdminStore(order: any): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getAdminCustomerOrders();
    // Prevent duplicates
    const orderId = order.id || order._id;
    if (existing.some(o => (o.id || o._id) === orderId)) return;

    const normalized = normalizeOrderForAdmin(order);
    existing.unshift(normalized);
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('[AdminOrderStore] Failed to push order:', e);
  }
}

/**
 * Read all customer orders from the shared admin store.
 */
export function getAdminCustomerOrders(): CustomerOrder[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ADMIN_ORDERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('[AdminOrderStore] Failed to read orders:', e);
  }
  return [];
}

/**
 * Scan ALL localStorage keys for customer order data.
 * This finds orders placed by any user account (nearmart_orders_*).
 * Used for initial sync or if the shared store is empty.
 */
export function scanAllCustomerOrders(): CustomerOrder[] {
  if (typeof window === 'undefined') return [];

  const allOrders: CustomerOrder[] = [];
  const seenIds = new Set<string>();

  try {
    // First, get orders from the shared admin store
    const adminOrders = getAdminCustomerOrders();
    adminOrders.forEach(o => {
      const id = o.id || o._id || '';
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        allOrders.push(o);
      }
    });

    // Then scan all nearmart_orders_* keys for any orders not yet in the admin store
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(ORDERS_PREFIX)) continue;

      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(data)) continue;

        data.forEach((order: any) => {
          const orderId = order.id || order._id;
          if (!orderId || seenIds.has(orderId)) return;
          seenIds.add(orderId);

          const normalized = normalizeOrderForAdmin(order);
          allOrders.push(normalized);

          // Also push to shared store for future reads
          pushOrderToAdminStore(order);
        });
      } catch (e) {
        // Skip malformed entries
      }
    }
  } catch (e) {
    console.error('[AdminOrderStore] Scan failed:', e);
  }

  // Sort newest first
  allOrders.sort((a, b) => {
    const dateA = new Date(a.placedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.placedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return allOrders;
}

/**
 * Update an order's status in the shared admin store.
 */
export function updateAdminOrderStatus(orderId: string, newStatus: string): CustomerOrder | null {
  if (typeof window === 'undefined') return null;

  try {
    const orders = getAdminCustomerOrders();
    const idx = orders.findIndex(o => (o.id || o._id) === orderId);
    if (idx === -1) return null;

    let assignedTo = orders[idx].assignedTo || 'Unassigned';
    
    // Automatically assign a partner if it's going out for delivery and doesn't have one
    if (newStatus === 'Out for Delivery' && (!assignedTo || assignedTo === 'Unassigned')) {
      const partners = ['Ravi Kumar', 'Priya Sharma', 'Karan Singh', 'Sneha Joshi'];
      assignedTo = partners[Math.floor(Math.random() * partners.length)];
    }

    orders[idx] = {
      ...orders[idx],
      status: newStatus,
      orderStatus: newStatus,
      assignedTo,
      statusHistory: [
        ...(orders[idx].statusHistory || []),
        { status: newStatus, timestamp: new Date().toISOString() },
      ],
    };

    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
    return orders[idx];
  } catch (e) {
    console.error('[AdminOrderStore] Failed to update status:', e);
    return null;
  }
}

/**
 * Normalize a customer-side order object into the format expected by admin components.
 */
function normalizeOrderForAdmin(order: any): CustomerOrder {
  const id = order.id || order._id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const createdAt = order.createdAt || order.placedAt || new Date().toISOString();

  // Extract customer name from various possible locations
  const customerName =
    order.customer?.name ||
    order.deliveryAddress?.fullName ||
    order.customer ||
    'Web Customer';

  const email =
    order.email ||
    order.deliveryAddress?.email ||
    'customer@nearmart.com';

  const phone =
    order.phone ||
    order.deliveryAddress?.phone ||
    '+91 00000 00000';

  const address =
    order.address ||
    (order.deliveryAddress
      ? `${order.deliveryAddress.line1 || ''}, ${order.deliveryAddress.city || ''} ${order.deliveryAddress.pincode || ''}`
      : 'Address not available');

  // Normalize items
  const items = (order.items || []).map((item: any) => ({
    productId: item.productId || item.id || '',
    name: item.name || 'Unknown Item',
    quantity: item.quantity || 1,
    price: item.price || 0,
  }));

  const subtotal = order.subtotal || order.total || items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const deliveryFee = order.deliveryFee ?? 0;
  const tax = order.tax ?? 0;
  const amount = order.total || order.amount || (subtotal + deliveryFee + tax);

  // Map status from customer-side format (lowercase) to admin format (Title Case)
  const statusMap: Record<string, string> = {
    placed: 'Pending',
    pending: 'Pending',
    confirmed: 'Packed',
    packed: 'Packed',
    shipped: 'Out for Delivery',
    'out for delivery': 'Out for Delivery',
    'out_for_delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  const rawStatus = String(order.status || order.orderStatus || 'placed').toLowerCase();
  const status = statusMap[rawStatus] || 'Pending';

  // Build status history
  let statusHistory = order.statusHistory || [];
  if (!statusHistory.length) {
    statusHistory = [{ status, timestamp: createdAt }];
  }

  const paymentMethod = order.paymentMethod || 'UPI';

  return {
    id,
    customer: typeof customerName === 'string' ? customerName : String(customerName),
    email: typeof email === 'string' ? email : String(email),
    phone: typeof phone === 'string' ? phone : String(phone),
    amount,
    subtotal,
    deliveryFee,
    tax,
    status,
    orderStatus: status,
    assignedTo: order.assignedTo || 'Unassigned',
    placedAt: createdAt,
    createdAt,
    deliveryEta: order.deliveryEta || '15-25 min',
    address: typeof address === 'string' ? address : String(address),
    paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : String(paymentMethod),
    items,
    statusHistory,
    notes: order.notes || order.instruction || '',
  };
}
