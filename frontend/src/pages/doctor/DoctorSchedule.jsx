import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function DoctorSchedule() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timesText, setTimesText] = useState('09:00, 10:00, 11:00, 14:00');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/doctors/profile/me');
        if (data.availability?.length) {
          const first = data.availability[0];
          setDate(new Date(first.date).toISOString().slice(0, 10));
          setTimesText(first.times.join(', '));
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function save() {
    setMsg('');
    const times = timesText.split(/[,;]+/).map((t) => t.trim()).filter(Boolean);
    try {
      await client.put('/doctors/profile/me/availability', {
        availability: [{ date, times }],
      });
      setMsg('Availability saved.');
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Availability</h1>
      <p className="text-slate-500 text-sm mb-6">
        Add at least one day and comma-separated slots (24h). Patients only see published slots.
      </p>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Time slots</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm min-h-[80px]"
            value={timesText}
            onChange={(e) => setTimesText(e.target.value)}
          />
        </div>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-blue-700 text-white px-6 py-2 font-semibold"
        >
          Save slots
        </button>
      </div>
    </div>
  );
}
