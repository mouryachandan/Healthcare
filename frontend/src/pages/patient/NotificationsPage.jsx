import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import client from '../../api/client';

export default function NotificationsPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/notifications');
        setList(data);
        await client.post('/notifications/read-all');
      } catch {
        setList([]);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-4 flex items-center gap-2">
        <Bell className="w-7 h-7" /> Notifications
      </h1>
      <ul className="space-y-2">
        {list.map((n) => (
          <li
            key={n._id}
            className={`rounded-2xl border px-4 py-3 ${n.read ? 'bg-slate-50 border-slate-100' : 'bg-sky-50 border-sky-100'}`}
          >
            <p className="font-semibold text-sm">{n.title}</p>
            <p className="text-sm text-slate-600">{n.message}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      {!list.length && <p className="text-slate-500">You are all caught up.</p>}
    </div>
  );
}
