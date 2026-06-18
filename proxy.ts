import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'STORE_MANAGER' | 'INVENTORY_MANAGER' | 'DELIVERY_MANAGER';

const API_PERMISSIONS: Record<string, AdminRole[]> = {
  '/api/admin/metrics': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'DELIVERY_MANAGER'],
  '/api/admin/products': ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER'],
  '/api/admin/orders': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'DELIVERY_MANAGER'],
  '/api/admin/users': ['SUPER_ADMIN', 'ADMIN'],
  '/api/admin/delivery': ['SUPER_ADMIN', 'DELIVERY_MANAGER'],
  '/api/admin/reports': ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER'],
  '/api/admin/settings': ['SUPER_ADMIN', 'ADMIN'],
  '/api/admin/forecast': ['SUPER_ADMIN', 'INVENTORY_MANAGER'],
};

function getPermissionPath(pathname: string): string | null {
  if (API_PERMISSIONS[pathname]) return pathname;
  for (const prefix of Object.keys(API_PERMISSIONS)) {
    if (pathname.startsWith(prefix + '/')) return prefix;
  }
  return null;
}

function decodeToken(token: string): { role: AdminRole } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'demo' || parts[2] !== 'token') return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || typeof payload.role !== 'string') return null;
    return { role: payload.role as AdminRole };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  const permissionPath = getPermissionPath(pathname);
  if (!permissionPath) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Authentication required.' },
      { status: 401 },
    );
  }

  const token = authHeader.slice(7);
  const decoded = decodeToken(token);
  if (!decoded) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token.' },
      { status: 401 },
    );
  }

  const allowed = API_PERMISSIONS[permissionPath];
  if (!allowed.includes(decoded.role)) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};
