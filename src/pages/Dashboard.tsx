import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { DoctorDashboard } from './dashboards/DoctorDashboard';
import { NurseDashboard } from './dashboards/NurseDashboard';
import { ReceptionistDashboard } from './dashboards/ReceptionistDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}
