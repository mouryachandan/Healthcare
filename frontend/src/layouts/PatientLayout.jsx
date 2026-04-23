import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  FileText,
  MessageCircle,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react';
import { useState } from 'react';
import { logout } from '../store/slices/authSlice';
import client from '../api/client';
import { useEffect } from 'react';

export default function PatientLayout() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/notifications');
        setUnread(data.filter((n) => !n.read).length);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
      isActive ? 'bg-cyan-brand text-white shadow-lg shadow-cyan-brand/30' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/80 to-white">
      <header className="sticky top-0 z-30 bg-cyan-brand text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg bg-white/10"
            onClick={() => setOpen(!open)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-display font-bold text-lg tracking-tight">MediSync</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 rounded-full bg-white/10"
              onClick={() => nav('/patient/notifications')}
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full" />
              )}
            </button>
            <div className="hidden sm:flex flex-col items-end text-sm">
              <span className="font-semibold">{user?.name}</span>
              <span className="text-white/80 text-xs">Patient</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'P'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        <aside
          className={`${
            open ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static z-20 w-64 min-h-[calc(100vh-56px)] bg-white border-r border-slate-100 p-4 transition-transform`}
        >
          <nav className="space-y-1">
            <NavLink to="/patient" end className={linkClass}>
              <LayoutDashboard className="w-5 h-5" /> Home
            </NavLink>
            <NavLink to="/patient/doctors" className={linkClass}>
              <Search className="w-5 h-5" /> Find doctors
            </NavLink>
            <NavLink to="/patient/appointments" className={linkClass}>
              <CalendarDays className="w-5 h-5" /> My bookings
            </NavLink>
            <NavLink to="/patient/prescriptions" className={linkClass}>
              <FileText className="w-5 h-5" /> Reports
            </NavLink>
            <NavLink to="/patient/messages" className={linkClass}>
              <MessageCircle className="w-5 h-5" /> Messages
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              nav('/login');
            }}
            className="mt-8 w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </aside>
        {open && (
          <button
            type="button"
            className="fixed inset-0 bg-black/30 z-10 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
