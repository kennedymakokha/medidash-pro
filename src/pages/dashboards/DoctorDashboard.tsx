import { Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PatientTable } from '@/components/dashboard/PatientTable';
import { mockPatients, mockAppointments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export function DoctorDashboard() {
  const { user } = useAuth();
  
  const myAppointments = mockAppointments.filter(
    (a) => a.doctorName === user?.name
  );
  
  const todayAppointments = myAppointments.filter(
    (a) => a.date === '2024-01-20'
  );

  const myPatients = mockPatients.filter(
    (p) => p.assignedDoctor === user?.name
  );

  return (
    <DashboardLayout 
      title="Doctor Dashboard" 
      subtitle={`Welcome, ${user?.name}. Your schedule for today.`}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="My Patients"
          value={myPatients.length}
          icon={Users}
        />
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon={Calendar}
        />
        <StatsCard
          title="Pending Consultations"
          value={todayAppointments.filter(a => a.status === 'scheduled').length}
          icon={Clock}
        />
        <StatsCard
          title="Completed Today"
          value={todayAppointments.filter(a => a.status === 'completed').length}
          icon={CheckCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AppointmentList 
          appointments={todayAppointments} 
          title="Today's Schedule" 
        />
        <AppointmentList 
          appointments={myAppointments.filter(a => a.date === '2024-01-21')} 
          title="Tomorrow's Schedule" 
        />
      </div>

      {/* My Patients */}
      <PatientTable patients={myPatients} title="My Patients" />
    </DashboardLayout>
  );
}
