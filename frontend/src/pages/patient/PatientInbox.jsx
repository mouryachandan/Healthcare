import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import client from '../../api/client';

export default function PatientInbox() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/appointments/mine');
        const map = new Map();
        for (const a of data) {
          const du = a.doctorId?.userId;
          const uid = du?._id || du;
          if (uid && !map.has(String(uid)))
            map.set(String(uid), { name: du?.name || 'Doctor', userId: String(uid) });
        }
        setRows([...map.values()]);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-2 flex items-center gap-2">
        <MessageCircle className="w-7 h-7" /> Messages
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Chat with doctors you have booked. Open a thread below.
      </p>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.userId}>
            <Link
              to={`/patient/chat/${r.userId}`}
              className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-card transition font-medium text-navy"
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
      {!rows.length && (
        <p className="text-slate-500 text-sm">Book an appointment to start messaging.</p>
      )}
    </div>
  );
}
