import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function DoctorsBrowse() {
  const [params] = useSearchParams();
  const spec = params.get('specialization') || '';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await client.get('/doctors', {
          params: spec ? { specialization: spec } : {},
        });
        setList(data);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [spec]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-2">All doctors</h1>
      {spec && (
        <p className="text-sm text-slate-500 mb-4">
          Filter: <strong>{spec}</strong>{' '}
          <Link to="/patient/doctors" className="text-sky-600">
            Clear
          </Link>
        </p>
      )}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((d) => (
            <Link
              key={d.id}
              to={`/patient/doctors/${d.id}`}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-card transition"
            >
              <p className="font-bold text-navy">{d.name}</p>
              <p className="text-sm text-slate-600">{d.specialization}</p>
              <p className="text-xs text-slate-500 mt-2">
                {d.city} · ₹{d.fees} · ★ {d.ratingAvg || 'new'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
