import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import client from '../api/client';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      await client.post('/auth/reset-password', { token, password });
      setMsg('Password updated. Redirecting to login…');
      setTimeout(() => nav('/login'), 2000);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">New password</h1>
        {!token && (
          <p className="text-sm text-red-600 mb-4">Missing token in URL. Open the link from your email.</p>
        )}
        {msg && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">{msg}</div>
        )}
        {err && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <Lock className="w-5 h-5 text-slate-400" />
            <input
              className="flex-1 outline-none text-sm"
              type="password"
              placeholder="New password (min 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-2xl bg-navy text-white py-3 font-semibold disabled:opacity-50"
          >
            Update password
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm text-sky-600 mt-4">
          Back to login
        </Link>
      </div>
    </div>
  );
}
