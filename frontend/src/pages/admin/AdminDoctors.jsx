import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminDoctors() {
  const [pending, setPending] = useState([]);

  async function load() {
    const { data } = await client.get('/admin/doctors/pending');
    setPending(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id, approve) {
    await client.patch(`/admin/doctors/${id}/verify`, { approve });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Doctor approvals</h1>
      <div className="space-y-3">
        {pending.map((d) => (
          <div
            key={d._id}
            className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap justify-between gap-3 shadow-sm"
          >
            <div>
              <p className="font-semibold">{d.userId?.name}</p>
              <p className="text-sm text-slate-500">{d.userId?.email}</p>
              <p className="text-sm mt-1">
                {d.specialization} · ₹{d.fees}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => verify(d._id, true)}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => verify(d._id, false)}
                className="rounded-xl border border-red-200 text-red-600 px-4 py-2 text-sm font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!pending.length && (
          <p className="text-slate-500">No pending doctor registrations.</p>
        )}
      </div>
    </div>
  );
}
