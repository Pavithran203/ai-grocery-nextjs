import { BarChart3, Package, ShoppingBag, Users, Truck, FileText, Settings, Sparkles } from 'lucide-react';
import type { AdminRole } from './mockData';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AdminRole[];
}

export const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'DELIVERY_MANAGER'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'DELIVERY_MANAGER'] },
  { href: '/admin/users', label: 'Users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck, roles: ['SUPER_ADMIN', 'DELIVERY_MANAGER'] },
  { href: '/admin/reports', label: 'Reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/forecast', label: 'AI Forecasting', icon: Sparkles, roles: ['SUPER_ADMIN', 'INVENTORY_MANAGER'] },
];
