import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthGate from './components/AuthGate';
import RequireAuth from './components/RequireAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PatientLayout from './layouts/PatientLayout';
import PatientHome from './pages/patient/PatientHome';
import DoctorsBrowse from './pages/patient/DoctorsBrowse';
import DoctorDetail from './pages/patient/DoctorDetail';
import MyAppointments from './pages/patient/MyAppointments';
import PrescriptionsPage from './pages/patient/PrescriptionsPage';
import NotificationsPage from './pages/patient/NotificationsPage';
import PatientChat from './pages/patient/PatientChat';
import PatientInbox from './pages/patient/PatientInbox';
import DoctorLayout from './layouts/DoctorLayout';
import DoctorQueue from './pages/doctor/DoctorQueue';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorUpload from './pages/doctor/DoctorUpload';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminLogs from './pages/admin/AdminLogs';

function RoleHome() {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return null;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
}

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<RoleHome />} />

        <Route element={<RequireAuth roles={['user']} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientHome />} />
            <Route path="doctors" element={<DoctorsBrowse />} />
            <Route path="doctors/:id" element={<DoctorDetail />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="messages" element={<PatientInbox />} />
            <Route path="chat/:userId" element={<PatientChat />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={['doctor']} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorQueue />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="upload" element={<DoctorUpload />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthGate>
  );
}
