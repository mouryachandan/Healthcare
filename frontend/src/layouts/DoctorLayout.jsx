import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

export default function DoctorLayout() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const link = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-semibold ${
      isActive ? 'bg-white text-blue-700 shadow' : 'text-white/90 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <p className="font-semibold leading-tight">{user?.name}</p>
              <p className="text-xs text-white/80">MediSync Clinic</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/doctor" end className={link}>
              <span className="inline-flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Queue
              </span>
            </NavLink>
            <NavLink to="/doctor/schedule" className={link}>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Schedule
              </span>
            </NavLink>
            <NavLink to="/doctor/profile" className={link}>
              <span className="inline-flex items-center gap-1">
                <User className="w-4 h-4" /> Profile
              </span>
            </NavLink>
            <NavLink to="/doctor/upload" className={link}>
              <span className="inline-flex items-center gap-1">Upload</span>
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-white/10"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                nav('/login');
              }}
              className="inline-flex items-center gap-1 text-sm font-medium bg-white/10 px-3 py-2 rounded-full"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
