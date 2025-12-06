import { Users, Calendar, Bed, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PatientTable } from '@/components/dashboard/PatientTable';
import { DepartmentCard } from '@/components/dashboard/DepartmentCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { mockPatients, mockAppointments, mockDepartments } from '@/data/mockData';

export function AdminDashboard() {
  const todayAppointments = mockAppointments.filter(
    (a) => a.date === '2024-01-20' && a.status !== 'cancelled'
  );

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="Welcome back! Here's what's happening in your hospital today."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Patients"
          value="1,284"
          change={12}
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          change={5}
          trend="up"
          icon={Calendar}
        />
        <StatsCard
          title="Available Beds"
          value="45/120"
          change={-3}
          trend="down"
          icon={Bed}
        />
        <StatsCard
          title="Revenue (Monthly)"
          value="$248,500"
          change={18}
          trend="up"
          icon={DollarSign}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Appointments */}
        <div className="lg:col-span-2">
          <AppointmentList appointments={todayAppointments} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Departments */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Departments Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockDepartments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      </div>

      {/* Patients Table */}
      <PatientTable patients={mockPatients} />
    </DashboardLayout>
  );
}
