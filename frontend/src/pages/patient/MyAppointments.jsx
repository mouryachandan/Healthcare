import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function MyAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get('/appointments/mine');
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    await client.patch(`/appointments/${id}/cancel`);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-4">My bookings</h1>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div
              key={a._id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-wrap justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-navy">
                  {a.doctorId?.userId?.name || 'Doctor'}
                </p>
                <p className="text-sm text-slate-600">
                  {new Date(a.date).toLocaleDateString()} · {a.timeSlot}
                </p>
                <span
                  className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    a.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : a.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : a.status === 'rejected' || a.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {a.status}
                </span>
              </div>
              {['pending', 'approved'].includes(a.status) && (
                <button
                  type="button"
                  onClick={() => cancel(a._id)}
                  className="self-start text-sm text-red-600 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
          {!list.length && <p className="text-slate-500">No appointments yet.</p>}
        </div>
      )}
    </div>
  );
}
