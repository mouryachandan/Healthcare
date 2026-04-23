import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import client from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      setMsg('If an account exists, check your email for a reset link.');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy mb-2">Forgot password</h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your email and we will send a reset link.
        </p>
        {msg && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">{msg}</div>
        )}
        {err && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <Mail className="w-5 h-5 text-slate-400" />
            <input
              className="flex-1 outline-none text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-brand text-white py-3 font-semibold disabled:opacity-50"
          >
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}
