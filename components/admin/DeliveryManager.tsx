"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin/adminFetch';
import { MapPin, ShieldCheck, TrendingUp } from 'lucide-react';

const fetchDeliveryPartners = async () => {
  const res = await adminFetch('/api/admin/delivery-partners');
  if (!res.ok) throw new Error('Failed to load delivery partners');
  const data = await res.json();
  return data.partners || [];
};

const toggleAvailabilityStatus = async (id: string) => {
  const res = await adminFetch(`/api/admin/users/${id}/toggle-status`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to toggle partner availability');
  return res.json();
};

export default function DeliveryManager() {
  const queryClient = useQueryClient();
  const { data: partners = [], isLoading, error } = useQuery({
    queryKey: ['adminDeliveryPartners'],
    queryFn: fetchDeliveryPartners,
  });

  const mutation = useMutation({
    mutationFn: toggleAvailabilityStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDeliveryPartners'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Error toggling availability');
    }
  });

  const toggleAvailability = (id: string) => {
    mutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-600">Delivery management</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Partner operations</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Coordinate delivery partner availability, monitor live locations, and review operational performance metrics.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-700">Live network</div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading delivery partners...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Error loading delivery partners.</p>
        ) : partners.length === 0 ? (
          <p className="text-sm text-slate-500">No delivery partners found.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {partners.map((partner: any) => (
              <div key={partner.id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-950">{partner.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{partner.location}</p>
                  </div>
                  <span className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.25em] ${partner.status === 'On Duty' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {partner.status}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
                    <p className="font-black text-slate-950">{partner.completed}</p>
                    <p className="mt-1 uppercase tracking-[0.2em] text-slate-500">Deliveries</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
                    <p className="font-black text-slate-950">{partner.rating.toFixed(1)}</p>
                    <p className="mt-1 uppercase tracking-[0.2em] text-slate-500">Rating</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
                    <p className="font-black text-slate-950">{partner.status === 'On Duty' ? 'Live' : 'Paused'}</p>
                    <p className="mt-1 uppercase tracking-[0.2em] text-slate-500">Network</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAvailability(partner.id)}
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800 disabled:opacity-55"
                  >
                    <MapPin className="h-4 w-4" /> {partner.status === 'On Duty' ? 'Take offline' : 'Activate'}
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-900 transition hover:bg-emerald-100">
                    <TrendingUp className="h-4 w-4" /> Performance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Route optimization insights
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Review partner availability and route health to keep delivery costs down while meeting customer SLAs.</p>
      </section>
    </div>
  );
}

