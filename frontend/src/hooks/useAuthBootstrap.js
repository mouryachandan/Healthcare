import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import client from '../api/client';
import { setUser, logout } from '../store/slices/authSlice';

export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (!token) return;
    if (user) return;
    (async () => {
      try {
        const { data } = await client.get('/auth/me');
        dispatch(setUser(data));
      } catch {
        dispatch(logout());
      }
    })();
  }, [token, user, dispatch]);
}
