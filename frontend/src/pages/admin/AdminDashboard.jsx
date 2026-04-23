import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, Stethoscope, Calendar, UserPlus } from 'lucide-react';
import client from '../../api/client';

const COLORS = ['#7C3AED', '#14B8A6', '#CA8A04', '#38BDF8'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/admin/stats');
        setStats(data);
      } catch {
        setStats(null);
      }
    })();
  }, []);

  const pieData = stats
    ? [
        { name: 'Patients', value: stats.totalUsers },
        { name: 'Doctors', value: stats.totalDoctors },
        { name: 'Pending', value: stats.pendingDoctorApprovals },
      ]
    : [];

  const revenueFake = [
    { m: 'Jan', income: 40, expense: 24 },
    { m: 'Feb', income: 48, expense: 30 },
    { m: 'Mar', income: 55, expense: 28 },
    { m: 'Apr', income: 62, expense: 35 },
    { m: 'May', income: 58, expense: 32 },
    { m: 'Jun', income: 70, expense: 38 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Hospital admin overview</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total patients"
          value={stats?.totalUsers ?? '—'}
          hint="Registered users"
          icon={Users}
          tone="from-violet-500 to-purple-600"
        />
        <StatCard
          title="Verified doctors"
          value={stats?.totalDoctors ?? '—'}
          hint="Active providers"
          icon={Stethoscope}
          tone="from-teal-500 to-emerald-600"
        />
        <StatCard
          title="Appointments"
          value={stats?.totalAppointments ?? '—'}
          hint="All time"
          icon={Calendar}
          tone="from-amber-500 to-yellow-600"
        />
        <StatCard
          title="Pending approvals"
          value={stats?.pendingDoctorApprovals ?? '—'}
          hint="Doctor KYC"
          icon={UserPlus}
          tone="from-sky-500 to-blue-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">Revenue trend (demo)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueFake}>
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#CA8A04" strokeWidth={2} name="Income" />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#7C3AED"
                  strokeDasharray="5 5"
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">User mix</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, hint, icon: Icon, tone }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card border border-slate-100 flex gap-4">
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center text-white shadow-lg`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      </div>
    </div>
  );
}
