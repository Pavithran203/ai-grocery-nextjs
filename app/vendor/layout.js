import VendorShell from '@/components/vendor/VendorShell';

export const metadata = {
  title: 'NearMart Vendor Dashboard',
  description: 'Manage your store, products, inventory, and orders on the NearMart platform.',
};

export default function VendorLayout({ children }) {
  return <VendorShell>{children}</VendorShell>;
}
