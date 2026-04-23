import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function DoctorProfile() {
  const [form, setForm] = useState({
    specialization: '',
    experience: 0,
    fees: 0,
    bio: '',
    hospital: '',
    city: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/doctors/profile/me');
        setForm({
          specialization: data.specialization || '',
          experience: data.experience || 0,
          fees: data.fees || 0,
          bio: data.bio || '',
          hospital: data.hospital || '',
          city: data.city || '',
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    try {
      await client.put('/doctors/profile/me', form);
      setMsg('Profile updated.');
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>
      <form
        onSubmit={save}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card space-y-4"
      >
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Specialization"
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Years exp."
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
          />
          <input
            type="number"
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Fees"
            value={form.fees}
            onChange={(e) => setForm({ ...form, fees: Number(e.target.value) })}
          />
        </div>
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Hospital / clinic"
          value={form.hospital}
          onChange={(e) => setForm({ ...form, hospital: e.target.value })}
        />
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <textarea
          className="w-full rounded-xl border px-3 py-2 text-sm min-h-[100px]"
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-700 text-white px-6 py-2 font-semibold"
        >
          Save
        </button>
      </form>
    </div>
  );
}
