import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await client.get('/admin/logs');
      setLogs(data);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Activity logs</h1>
      <ul className="space-y-2">
        {logs.map((l) => (
          <li
            key={l._id}
            className="bg-white rounded-xl border border-slate-100 px-4 py-3 text-sm shadow-sm"
          >
            <span className="font-semibold">{l.action}</span>
            <span className="text-slate-500">
              {' '}
              · {l.actorId?.name || 'System'} ({l.actorId?.role})
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(l.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
