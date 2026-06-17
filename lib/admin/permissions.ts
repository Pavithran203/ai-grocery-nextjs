import type { AdminRole } from './mockData';

export const PAGE_PERMISSIONS: Record<string, AdminRole[]> = {
  '/admin': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'DELIVERY_MANAGER'],
  '/admin/products': ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER'],
  '/admin/orders': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'DELIVERY_MANAGER'],
  '/admin/users': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/delivery': ['SUPER_ADMIN', 'DELIVERY_MANAGER'],
  '/admin/reports': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER'],
  '/admin/settings': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/forecast': ['SUPER_ADMIN', 'INVENTORY_MANAGER'],
};

export const API_PERMISSIONS: Record<string, AdminRole[]> = {
  '/api/admin/metrics': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'DELIVERY_MANAGER'],
  '/api/admin/products': ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER'],
  '/api/admin/orders': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'DELIVERY_MANAGER'],
  '/api/admin/users': ['SUPER_ADMIN', 'ADMIN'],
  '/api/admin/delivery': ['SUPER_ADMIN', 'DELIVERY_MANAGER'],
  '/api/admin/reports': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER'],
  '/api/admin/settings': ['SUPER_ADMIN', 'ADMIN'],
  '/api/admin/forecast': ['SUPER_ADMIN', 'INVENTORY_MANAGER'],
};

export function canAccess(role: AdminRole | undefined, path: string): boolean {
  if (!role) return false;
  const allowed = PAGE_PERMISSIONS[path];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function canAccessApi(role: AdminRole | undefined, path: string): boolean {
  if (!role) return false;
  if (API_PERMISSIONS[path]?.includes(role)) return true;
  for (const [prefix, roles] of Object.entries(API_PERMISSIONS)) {
    if (path.startsWith(prefix + '/') && roles.includes(role)) return true;
  }
  return false;
}
