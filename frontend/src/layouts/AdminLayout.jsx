import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  ScrollText,
  LogOut,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

export default function AdminLayout() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const item = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
      isActive
        ? 'bg-haven-soft text-haven-purple shadow-sm'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen haven-bg flex">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-300 flex items-center justify-center text-white font-bold">
            +
          </div>
          <div>
            <p className="font-display font-bold text-slate-800">MediSync</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          <NavLink to="/admin" end className={item}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={item}>
            <Users className="w-5 h-5" /> Patients
          </NavLink>
          <NavLink to="/admin/doctors" className={item}>
            <Stethoscope className="w-5 h-5" /> Doctors
          </NavLink>
          <NavLink to="/admin/appointments" className={item}>
            <Calendar className="w-5 h-5" /> Appointments
          </NavLink>
          <NavLink to="/admin/logs" className={item}>
            <ScrollText className="w-5 h-5" /> Activity
          </NavLink>
        </nav>
        <div className="pt-4 border-t border-slate-100 text-sm">
          <p className="font-semibold text-slate-800 px-2">{user?.name}</p>
          <p className="text-xs text-slate-500 px-2 mb-2">Super admin</p>
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              nav('/login');
            }}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center px-6 gap-4">
          <div className="flex-1 max-w-md relative">
            <input
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
              placeholder="Search here"
              readOnly
            />
          </div>
        </header>
        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
