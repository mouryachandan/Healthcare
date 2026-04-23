import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bone, HeartPulse, Apple, Sparkles } from 'lucide-react';
import client from '../../api/client';

const cats = [
  { label: 'Bone', icon: Bone, bg: 'bg-sky-100 text-sky-700' },
  { label: 'Heart', icon: HeartPulse, bg: 'bg-rose-100 text-rose-600' },
  { label: 'General', icon: Apple, bg: 'bg-amber-100 text-amber-700' },
];

export default function PatientHome() {
  const [q, setQ] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [rec, setRec] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/doctors/recommended?symptoms=general');
        setRec(data.slice(0, 4));
      } catch {
        setRec([]);
      }
    })();
  }, []);

  async function search(e) {
    e.preventDefault();
    try {
      const { data } = await client.get('/doctors', { params: { q } });
      setDoctors(data.slice(0, 8));
    } catch {
      setDoctors([]);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white shadow-card p-6 border border-slate-100">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-2">
          Find best doctor for you!
        </h2>
        <p className="text-slate-500 text-sm mb-4">Search by name, specialty, or hospital</p>
        <form onSubmit={search} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search for doctors…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-coral text-white px-6 py-3 font-semibold shadow-lg shadow-coral/30"
          >
            Search
          </button>
        </form>
      </section>

      <section>
        <h3 className="font-semibold text-slate-700 mb-3">Categories</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cats.map(({ label, icon: Icon, bg }) => (
            <Link
              key={label}
              to={`/patient/doctors?specialization=${encodeURIComponent(label)}`}
              className={`flex-shrink-0 w-28 h-28 rounded-2xl ${bg} flex flex-col items-center justify-center gap-2 font-bold text-xs uppercase shadow-sm`}
            >
              <Icon className="w-8 h-8" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {doctors.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-700 mb-3">Search results</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {doctors.map((d) => (
              <DoctorCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-haven-purple" />
          <h3 className="font-semibold text-slate-700">Recommended for you</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {rec.map((d) => (
            <DoctorCard key={d.id} d={d} />
          ))}
        </div>
        {!rec.length && (
          <p className="text-sm text-slate-500">Browse all doctors to get started.</p>
        )}
      </section>
    </div>
  );
}

function DoctorCard({ d }) {
  return (
    <Link
      to={`/patient/doctors/${d.id}`}
      className="block rounded-2xl p-4 bg-gradient-to-br from-sky-50 to-amber-50 border border-white shadow-card hover:shadow-lift transition"
    >
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-full bg-cyan-brand/20 flex items-center justify-center text-navy font-bold">
          {d.name?.charAt(0) || 'D'}
        </div>
        <div>
          <p className="font-bold text-navy">{d.name}</p>
          <p className="text-sm text-slate-600">
            {d.specialization}
            {d.hospital ? ` — ${d.hospital}` : ''}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ★ {d.ratingAvg || '—'} ({d.reviewCount || 0} reviews) · ₹{d.fees}
          </p>
        </div>
      </div>
    </Link>
  );
}
