import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Stethoscope,
  UserCircle2,
} from 'lucide-react';
import client from '../api/client';
import { setCredentials } from '../store/slices/authSlice';

export default function LoginPage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [mode, setMode] = useState('password');
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const loginRole =
    role === 'admin' ? undefined : role === 'doctor' ? 'doctor' : 'user';

  async function onPasswordLogin(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', {
        email,
        password,
        role: loginRole,
      });
      dispatch(setCredentials(data));
      redirectByRole(data.user.role);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    setErr('');
    setLoading(true);
    try {
      await client.post('/auth/send-otp', { email });
      setOtpSent(true);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/verify-otp', {
        email,
        code: otp,
        role: loginRole,
      });
      dispatch(setCredentials(data));
      redirectByRole(data.user.role);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  function redirectByRole(r) {
    if (r === 'admin') nav('/admin', { replace: true });
    else if (r === 'doctor') nav('/doctor', { replace: true });
    else nav('/patient', { replace: true });
  }

  return (
    <div className="min-h-screen medisync-blob flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-card mb-4">
            <HeartPulse className="w-9 h-9 text-coral" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy">MediSync</h1>
          <p className="text-slate-500 mt-1">Care that stays in sync</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lift p-6 sm:p-8 border border-slate-100">
          <p className="text-center text-sky-600 font-medium mb-4">Choose account type</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { id: 'user', label: 'Patient', Icon: UserCircle2 },
              { id: 'doctor', label: 'Doctor', Icon: Stethoscope },
              { id: 'admin', label: 'Staff', Icon: Shield },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-1 transition ${
                  role === id
                    ? 'border-cyan-brand bg-cyan-50 text-navy'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Icon className="w-7 h-7" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-slate-500 text-sm mb-4">
            {role === 'doctor'
              ? 'Hello doctor! Sign in to manage your practice.'
              : role === 'admin'
                ? 'Staff access — super admin accounts only.'
                : 'Hello! Find and book the best doctors.'}
          </p>

          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                mode === 'password' ? 'bg-white shadow text-navy' : 'text-slate-500'
              }`}
              onClick={() => {
                setMode('password');
                setOtpSent(false);
                setOtp('');
              }}
            >
              Password
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                mode === 'otp' ? 'bg-white shadow text-navy' : 'text-slate-500'
              }`}
              onClick={() => {
                setMode('otp');
                setOtpSent(false);
                setOtp('');
              }}
            >
              Email OTP
            </button>
          </div>

          {err && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              {err}
            </div>
          )}

          {mode === 'password' ? (
            <form onSubmit={onPasswordLogin} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-sky-600 bg-white px-1">
                  Email
                </span>
                <div className="flex items-center gap-2 rounded-2xl border-2 border-sky-100 focus-within:border-cyan-brand px-3 pt-5 pb-2">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    className="flex-1 outline-none text-sm"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 rounded-2xl border-2 border-sky-100 focus-within:border-cyan-brand px-3 py-2.5">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <input
                    className="flex-1 outline-none text-sm"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-sky-600 whitespace-nowrap"
                  >
                    Forgot?
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Link to="/register" className="text-sm text-slate-500">
                  No account?{' '}
                  <span className="text-sky-600 font-semibold">Signup</span>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-navy text-white px-6 py-3 font-semibold shadow-lg shadow-navy/25 hover:bg-navy-dark disabled:opacity-60"
                >
                  Login
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : mode === 'otp' && !otpSent ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 text-center">
                We will send a one-time password to your email.
              </p>
              <div className="flex items-center gap-2 rounded-2xl border-2 border-sky-100 px-3 py-2.5">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  className="flex-1 outline-none text-sm"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading || !email}
                className="w-full rounded-2xl bg-cyan-brand text-white py-3 font-semibold hover:brightness-95 disabled:opacity-50"
              >
                Send OTP
              </button>
            </div>
          ) : mode === 'otp' && otpSent ? (
            <form onSubmit={verifyOtp} className="space-y-4">
              <p className="text-sm text-slate-600 text-center">
                Enter the OTP sent to <strong>{email}</strong>
              </p>
              <input
                className="w-full rounded-2xl border-2 border-sky-100 px-4 py-3 text-center tracking-[0.4em] text-lg font-mono"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-sm"
                  onClick={() => {
                    setOtp('');
                    setOtpSent(false);
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-navy text-white py-2 text-sm font-semibold"
                >
                  Verify
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
