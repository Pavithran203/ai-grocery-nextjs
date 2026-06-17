import { NextResponse } from 'next/server';
import { dashboardMetrics, orderTrends, revenueSeries, lowStockProducts, inventoryAlerts, auditEvents } from '@/lib/admin/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    metrics: dashboardMetrics,
    orderTrends,
    revenueSeries,
    lowStockProducts,
    inventoryAlerts,
    auditEvents,
  });
}
