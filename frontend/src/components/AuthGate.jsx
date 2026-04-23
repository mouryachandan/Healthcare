import { useSelector } from 'react-redux';
import { useAuthBootstrap } from '../hooks/useAuthBootstrap';

export default function AuthGate({ children }) {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  useAuthBootstrap();

  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 text-sm">Loading session…</div>
      </div>
    );
  }
  return children;
}
