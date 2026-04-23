import { useEffect, useState } from 'react';
import { Activity, CheckSquare, MoreHorizontal } from 'lucide-react';
import client from '../../api/client';

export default function DoctorQueue() {
  const [status, setStatus] = useState('');
  const [list, setList] = useState([]);

  async function load() {
    const { data } = await client.get('/appointments/doctor/list');
    setList(data);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = status ? list.filter((a) => a.status === status) : list;

  async function setAppt(id, s) {
    await client.patch(`/appointments/${id}/status`, { status: s });
    load();
  }

  const counts = {
    pending: list.filter((a) => a.status === 'pending').length,
    approved: list.filter((a) => a.status === 'approved').length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Home</h1>
      <p className="text-slate-500 text-sm mb-6">Today&apos;s patient queue</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Queue', n: counts.pending, active: status === 'pending', c: 'border-l-4 border-blue-600' },
          { label: 'Approved', n: counts.approved, active: status === 'approved', c: 'bg-blue-900 text-white' },
        ].map((x) => (
          <button
            key={x.label}
            type="button"
            onClick={() => setStatus(x.label === 'Queue' ? 'pending' : 'approved')}
            className={`rounded-xl p-4 text-left shadow-sm ${x.c} ${
              x.active ? 'ring-2 ring-blue-400' : 'bg-white'
            }`}
          >
            <p className="text-xs uppercase opacity-80">{x.label}</p>
            <p className="text-2xl font-bold">{x.n}</p>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setStatus('')}
          className="rounded-xl p-4 text-left bg-blue-500 text-white shadow-sm"
        >
          <p className="text-xs uppercase opacity-90">All</p>
          <p className="text-2xl font-bold">{list.length}</p>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Patient</th>
                <th className="text-left p-4">Contact</th>
                <th className="text-left p-4">Appointment</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a, i) => (
                <tr key={a._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="p-4 text-slate-400">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                        {a.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{a.userId?.name}</p>
                        <p className="text-xs text-slate-500">Patient</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{a.userId?.phone || a.userId?.email}</td>
                  <td className="p-4">
                    <p className="font-medium">{a.timeSlot}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(a.date).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {a.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAppt(a._id, 'approved')}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold"
                          >
                            <CheckSquare className="w-3 h-3" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppt(a._id, 'rejected')}
                            className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {a.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => setAppt(a._id, 'completed')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold"
                        >
                          <Activity className="w-3 h-3" /> Complete
                        </button>
                      )}
                      <button type="button" className="p-1 rounded hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
