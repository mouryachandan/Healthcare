import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const t = store.getState().auth.token;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) store.dispatch(logout());
    return Promise.reject(err);
  }
);

export default client;
