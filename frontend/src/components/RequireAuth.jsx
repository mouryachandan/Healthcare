import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RequireAuth({ roles }) {
  const { token, user } = useSelector((s) => s.auth);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles?.length && user && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'user') return <Navigate to="/patient" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
