import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  async function load() {
    const { data } = await client.get('/admin/users');
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(u) {
    await client.patch(`/admin/users/${u._id}/block`, { blocked: !u.isBlocked });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Users</h1>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">
                  {u.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => toggle(u)}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        u.isBlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
