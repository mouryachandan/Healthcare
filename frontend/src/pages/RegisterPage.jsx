import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HeartPulse, Mail, Lock, User } from 'lucide-react';
import client from '../api/client';
import { setCredentials } from '../store/slices/authSlice';

export default function RegisterPage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [asDoctor, setAsDoctor] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'General Physician',
    fees: '500',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: asDoctor ? 'doctor' : 'user',
        ...(asDoctor && {
          specialization: form.specialization,
          fees: Number(form.fees),
        }),
      };
      const { data } = await client.post('/auth/register', payload);
      dispatch(setCredentials(data));
      nav(asDoctor ? '/doctor' : '/patient', { replace: true });
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen medisync-blob flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lift p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <HeartPulse className="w-10 h-10 text-coral" />
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">Join MediSync</h1>
            <p className="text-sm text-slate-500">Create your account</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setAsDoctor(false)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
              !asDoctor ? 'bg-cyan-brand text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setAsDoctor(true)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
              asDoctor ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Doctor
          </button>
        </div>

        {err && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <User className="w-5 h-5 text-slate-400" />
            <input
              className="flex-1 outline-none text-sm"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <Mail className="w-5 h-5 text-slate-400" />
            <input
              className="flex-1 outline-none text-sm"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <Lock className="w-5 h-5 text-slate-400" />
            <input
              className="flex-1 outline-none text-sm"
              type="password"
              placeholder="Password (min 6)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          {asDoctor && (
            <>
              <input
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Specialization"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                type="number"
                placeholder="Consultation fee"
                value={form.fees}
                onChange={(e) => setForm({ ...form, fees: e.target.value })}
              />
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-navy text-white py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Please wait…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
