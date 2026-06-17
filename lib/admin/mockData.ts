export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'STORE_MANAGER' | 'INVENTORY_MANAGER' | 'DELIVERY_MANAGER' | 'VENDOR';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  token: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export const adminUsers = [
  { id: 'u1', name: 'Super Admin', email: 'superadmin@nearmart.com', password: 'Super123!', role: 'SUPER_ADMIN' as AdminRole },
  { id: 'u2', name: 'Admin Lead', email: 'admin@nearmart.com', password: 'Admin123!', role: 'ADMIN' as AdminRole },
  { id: 'u3', name: 'Store Manager', email: 'manager@nearmart.com', password: 'Manager123!', role: 'STORE_MANAGER' as AdminRole },
  { id: 'u4', name: 'Inventory Manager', email: 'inventory@nearmart.com', password: 'Inventory123!', role: 'INVENTORY_MANAGER' as AdminRole },
  { id: 'u5', name: 'Delivery Manager', email: 'delivery@nearmart.com', password: 'Delivery123!', role: 'DELIVERY_MANAGER' as AdminRole },
  { id: 'u6', name: 'Vendor Account', email: 'vendor@nearmart.com', password: 'Vendor123!', role: 'VENDOR' as AdminRole },
];

export const dashboardMetrics = {
  totalOrders: 2841,
  revenueToday: 1584200,
  activeUsers: 612,
  activePartners: 84,
  lowStock: 12,
  cancelledOrders: 18,
  pendingOrders: 76,
  averageDeliveryMinutes: 23,
};

export const orderTrends = [
  { day: 'Mon', orders: 408, revenue: 42100 },
  { day: 'Tue', orders: 512, revenue: 52300 },
  { day: 'Wed', orders: 472, revenue: 49200 },
  { day: 'Thu', orders: 580, revenue: 62400 },
  { day: 'Fri', orders: 725, revenue: 78600 },
  { day: 'Sat', orders: 811, revenue: 92500 },
  { day: 'Sun', orders: 733, revenue: 82900 },
];

export const revenueSeries = [
  { month: 'Jan', revenue: 3400000 },
  { month: 'Feb', revenue: 3850000 },
  { month: 'Mar', revenue: 4120000 },
  { month: 'Apr', revenue: 4360000 },
  { month: 'May', revenue: 4700000 },
  { month: 'Jun', revenue: 4980000 },
];

export const lowStockProducts = [
  { id: 'p19', name: 'Basmati Rice 5kg', stock: 8, category: 'Rice & Grains' },
  { id: 'p39', name: 'Sunflower Oil 1L', stock: 16, category: 'Oil & Ghee' },
  { id: 'p23', name: 'Moong Dal', stock: 22, category: 'Dal & Pulses' },
  { id: 'p38', name: 'Pure Cow Ghee', stock: 5, category: 'Oil & Ghee' },
];

export const productCategories = ['Staples', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Snacks'];

export const products = [
  { id: 'p19', name: 'Basmati Rice 5kg', category: 'Rice & Grains', variants: ['5kg'], price: 550, stock: 8, available: true, rating: 4.9 },
  { id: 'p20', name: 'Wheat Flour - Atta 5kg', category: 'Flour & Baking', variants: ['5kg'], price: 245, stock: 42, available: true, rating: 4.8 },
  { id: 'p39', name: 'Sunflower Oil 1L', category: 'Oil & Ghee', variants: ['1L'], price: 145, stock: 16, available: true, rating: 4.7 },
  { id: 'p38', name: 'Pure Cow Ghee', category: 'Oil & Ghee', variants: ['500ml'], price: 350, stock: 56, available: true, rating: 4.9 },
  { id: 'p23', name: 'Moong Dal', category: 'Dal & Pulses', variants: ['1kg'], price: 130, stock: 120, available: true, rating: 4.6 },
  { id: 'p30', name: 'Turmeric Powder', category: 'Masalas & Spices', variants: ['100g'], price: 35, stock: 134, available: true, rating: 4.9 },
];

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface StatusEntry {
  status: string;
  timestamp: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  status: string;
  assignedTo: string;
  placedAt: string;
  deliveryEta: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  statusHistory: StatusEntry[];
  notes: string;
}

export const orders: Order[] = [
  {
    id: 'o1001', customer: 'Nisha Patel', email: 'nisha.p@gmail.com', phone: '+91 98765 41001',
    amount: 1025, subtotal: 955, deliveryFee: 35, tax: 35,
    status: 'Packed', assignedTo: 'Ravi',
    placedAt: '2026-06-08 10:42', deliveryEta: '11:20',
    address: '42, Lake View Apartments, Sector 12, Chennai',
    paymentMethod: 'UPI (Google Pay)',
    items: [
      { productId: 'p19', name: 'Basmati Rice 5kg', quantity: 1, price: 550 },
      { productId: 'p23', name: 'Moong Dal', quantity: 2, price: 130 },
      { productId: 'p39', name: 'Sunflower Oil 1L', quantity: 1, price: 145 },
    ],
    statusHistory: [
      { status: 'Pending', timestamp: '2026-06-08T10:42:00Z' },
      { status: 'Packed', timestamp: '2026-06-08T10:58:00Z' },
    ],
    notes: 'Leave at door. Ring bell twice.',
  },
  {
    id: 'o1002', customer: 'Amit Sharma', email: 'amit.sharma@gmail.com', phone: '+91 98765 41002',
    amount: 3015, subtotal: 2925, deliveryFee: 40, tax: 50,
    status: 'Out for Delivery', assignedTo: 'Priya',
    placedAt: '2026-06-08 09:58', deliveryEta: '10:40',
    address: '7, Sunshine Colony, Sector 5, Chennai',
    paymentMethod: 'Card (Visa)',
    items: [
      { productId: 'p38', name: 'Pure Cow Ghee', quantity: 2, price: 350 },
      { productId: 'p18', name: 'Ponni Rice 5kg', quantity: 3, price: 345 },
      { productId: 'p22', name: 'Urad Dal', quantity: 5, price: 140 },
      { productId: 'p20', name: 'Wheat Flour - Atta 5kg', quantity: 2, price: 245 },
    ],
    statusHistory: [
      { status: 'Pending', timestamp: '2026-06-08T09:58:00Z' },
      { status: 'Packed', timestamp: '2026-06-08T10:12:00Z' },
      { status: 'Out for Delivery', timestamp: '2026-06-08T10:30:00Z' },
    ],
    notes: '',
  },
  {
    id: 'o1003', customer: 'Geeta Rao', email: 'geeta.r@gmail.com', phone: '+91 98765 41003',
    amount: 456, subtotal: 421, deliveryFee: 0, tax: 35,
    status: 'Delivered', assignedTo: 'Karan',
    placedAt: '2026-06-08 08:30', deliveryEta: '09:05',
    address: '15, Green Park Residency, Sector 8, Chennai',
    paymentMethod: 'COD',
    items: [
      { productId: 'p30', name: 'Turmeric Powder', quantity: 3, price: 35 },
      { productId: 'p37', name: 'Sugar 1kg', quantity: 2, price: 48 },
      { productId: 'p24', name: 'Chana Dal', quantity: 2, price: 100 },
      { productId: 'p36', name: 'Salt 1kg', quantity: 1, price: 20 },
    ],
    statusHistory: [
      { status: 'Pending', timestamp: '2026-06-08T08:30:00Z' },
      { status: 'Packed', timestamp: '2026-06-08T08:45:00Z' },
      { status: 'Out for Delivery', timestamp: '2026-06-08T08:55:00Z' },
      { status: 'Delivered', timestamp: '2026-06-08T09:05:00Z' },
    ],
    notes: '',
  },
  {
    id: 'o1004', customer: 'Rahul Joshi', email: 'rahul.j@gmail.com', phone: '+91 98765 41004',
    amount: 425, subtotal: 390, deliveryFee: 0, tax: 35,
    status: 'Pending', assignedTo: 'Unassigned',
    placedAt: '2026-06-08 11:04', deliveryEta: '12:00',
    address: '88, Tower B, Riverside Apartments, Sector 3, Chennai',
    paymentMethod: 'UPI (PhonePe)',
    items: [
      { productId: 'p39', name: 'Sunflower Oil 1L', quantity: 1, price: 145 },
      { productId: 'p20', name: 'Wheat Flour - Atta 5kg', quantity: 1, price: 245 },
    ],
    statusHistory: [
      { status: 'Pending', timestamp: '2026-06-08T11:04:00Z' },
    ],
    notes: 'Call before delivery.',
  },
  {
    id: 'o1005', customer: 'Priyanka Singh', email: 'priyanka.s@gmail.com', phone: '+91 98765 41005',
    amount: 1100, subtotal: 1000, deliveryFee: 50, tax: 50,
    status: 'Cancelled', assignedTo: 'Unassigned',
    placedAt: '2026-06-08 07:20', deliveryEta: '08:00',
    address: '22, Elite Enclave, Sector 14, Chennai',
    paymentMethod: 'Card (Mastercard)',
    items: [
      { productId: 'p19', name: 'Basmati Rice 5kg', quantity: 1, price: 550 },
      { productId: 'p34', name: 'Coriander Powder', quantity: 3, price: 30 },
      { productId: 'p57', name: 'Jaggery Powder - Nattu Sakkarai', quantity: 2, price: 85 },
      { productId: 'p40', name: 'Coconut Oil', quantity: 1, price: 190 },
    ],
    statusHistory: [
      { status: 'Pending', timestamp: '2026-06-08T07:20:00Z' },
      { status: 'Cancelled', timestamp: '2026-06-08T07:45:00Z' },
    ],
    notes: 'Customer cancelled due to change of plans.',
  },
];

export const customers = [
  { id: 'c201', name: 'Aanya Kapoor', email: 'aanya.kapoor@gmail.com', orders: 14, loyaltyPoints: 460, status: 'Active' },
  { id: 'c202', name: 'Rohit Mehra', email: 'rohit.mehra@gmail.com', orders: 9, loyaltyPoints: 220, status: 'Active' },
  { id: 'c203', name: 'Deepa Nair', email: 'deepa.nair@gmail.com', orders: 27, loyaltyPoints: 710, status: 'Blocked' },
  { id: 'c204', name: 'Kunal Iyer', email: 'kunal.iyer@gmail.com', orders: 6, loyaltyPoints: 120, status: 'Active' },
];

export const deliveryPartners = [
  { id: 'd301', name: 'Ravi Kumar', location: 'Sector 11', status: 'On Duty', completed: 22, rating: 4.9 },
  { id: 'd302', name: 'Priya Sharma', location: 'Sector 5', status: 'On Duty', completed: 18, rating: 4.7 },
  { id: 'd303', name: 'Karan Singh', location: 'Sector 14', status: 'Offline', completed: 34, rating: 4.8 },
  { id: 'd304', name: 'Sneha Joshi', location: 'Sector 2', status: 'On Duty', completed: 12, rating: 4.5 },
];

export const couponPrograms = [
  { id: 'cp01', code: 'FRESH10', discount: '10%', active: true, expiry: '2026-07-31' },
  { id: 'cp02', code: 'FAST20', discount: '20%', active: false, expiry: '2026-06-15' },
  { id: 'cp03', code: 'REFERRAL50', discount: '₹50', active: true, expiry: '2026-08-31' },
];

export const inventoryAlerts = [
  { id: 'i401', product: 'Pure Cow Ghee', issue: 'Expiring Soon', quantity: 5, warehouse: 'Cold Storage 2' },
  { id: 'i402', product: 'Basmati Rice 5kg', issue: 'Low Stock', quantity: 8, warehouse: 'Staple Hub' },
  { id: 'i403', product: 'Sunflower Oil 1L', issue: 'Low Stock', quantity: 16, warehouse: 'Warehouse A' },
];

export const auditEvents: AuditEntry[] = [
  { id: 'a501', timestamp: '2026-06-08 10:14', actor: 'Super Admin', action: 'Updated delivery surcharge', details: 'Changed city-wide delivery charge from ₹35 to ₹30' },
  { id: 'a502', timestamp: '2026-06-08 09:58', actor: 'Inventory Manager', action: 'Added stock', details: 'Updated stock of Moong Dal by 120 units' },
  { id: 'a503', timestamp: '2026-06-08 08:42', actor: 'Store Manager', action: 'Published product', details: 'Enabled Pure Cow Ghee for online sale' },
];

export const settings = {
  currency: 'INR',
  paymentGateway: 'Razorpay',
  taxRate: 5,
  deliveryCharge: 30,
  darkMode: true,
  lowStockThreshold: 25,
};

export const createJwtToken = (email: string, role: AdminRole) => {
  const payload = { email, role, issuedAt: Date.now() };
  return `demo.${Buffer.from(JSON.stringify(payload)).toString('base64')}.token`;
};
