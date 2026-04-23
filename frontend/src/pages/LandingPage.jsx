import { Link } from 'react-router-dom';
import { HeartPulse, Shield, Stethoscope } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen medisync-blob flex flex-col">
      <header className="max-w-5xl mx-auto w-full flex justify-between items-center px-6 py-6">
        <span className="font-display font-bold text-navy text-xl flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-coral" /> MediSync
        </span>
        <Link
          to="/login"
          className="rounded-full bg-navy text-white px-6 py-2 text-sm font-semibold shadow-lg"
        >
          Sign in
        </Link>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-navy leading-tight">
            Healthcare that stays in sync.
          </h1>
          <p className="text-slate-600 text-lg">
            Book verified doctors, manage hospital operations, and collaborate in real time — built
            for patients, clinicians, and administrators.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-2xl bg-cyan-brand text-white px-8 py-3 font-semibold shadow-lg shadow-cyan-brand/30"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border-2 border-navy text-navy px-8 py-3 font-semibold"
            >
              Login
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 pt-6">
            {[
              { Icon: Stethoscope, t: 'Patients', d: 'Search, book, prescriptions' },
              { Icon: Shield, t: 'Admins', d: 'Analytics & access control' },
              { Icon: HeartPulse, t: 'Doctors', d: 'Queue & availability' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-2xl bg-white/80 border border-white p-4 shadow-sm">
                <Icon className="w-8 h-8 text-cyan-brand mb-2" />
                <p className="font-bold text-navy">{t}</p>
                <p className="text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 w-full max-w-md">
          <div className="rounded-3xl bg-white shadow-lift p-8 border border-slate-100 rotate-1 hover:rotate-0 transition-transform">
            <p className="text-sm font-semibold text-sky-600 mb-2">Live platform</p>
            <p className="text-2xl font-display font-bold text-navy mb-4">MERN + MongoDB</p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>JWT + email OTP</li>
              <li>Socket.io chat</li>
              <li>Cloudinary files</li>
              <li>Razorpay ready</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
