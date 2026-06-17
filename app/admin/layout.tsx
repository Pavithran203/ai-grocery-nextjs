import type { ReactNode } from 'react';
import AdminQueryProvider from '@/components/admin/AdminQueryProvider';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'NearMart Admin Portal',
  description: 'Enterprise-grade admin platform for AI grocery operations and management.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminQueryProvider>
      <AdminShell>{children}</AdminShell>
    </AdminQueryProvider>
  );
}
