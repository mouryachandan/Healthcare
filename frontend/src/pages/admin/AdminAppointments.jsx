import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminAppointments() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await client.get('/appointments/admin/all');
      setList(data);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">All appointments</h1>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-3">Patient</th>
              <th className="text-left p-3">Doctor</th>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-t border-slate-100">
                <td className="p-3">{a.userId?.name}</td>
                <td className="p-3">{a.doctorId?.userId?.name}</td>
                <td className="p-3">
                  {new Date(a.date).toLocaleDateString()} {a.timeSlot}
                </td>
                <td className="p-3 font-semibold">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
