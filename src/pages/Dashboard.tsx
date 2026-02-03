import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHospitalData } from '@/contexts/HospitalDataContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PatientTable } from '@/components/dashboard/PatientTable';
import { DepartmentCard } from '@/components/dashboard/DepartmentCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { ViewPatientModal } from '@/components/modals/ViewPatientModal';
import { toast } from '@/hooks/use-toast';
import { Users, Calendar, Bed, DollarSign, Clock, CheckCircle, Heart, Thermometer, AlertTriangle, CheckSquare, ClipboardList, UserPlus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { useCreatepatientMutation, useFetchpatientsoverviewsQuery, useFetchpatientsQuery } from '@/features/patientSlice';
import { useDebounce } from '@/hooks/use-debounce';
import { Patient } from '@/types/hospital';
import { useFetchdepartmentsQuery } from '@/features/departmentSlice';
import { useGetusersoverviewQuery, useGetusersQuery } from '@/features/userSlice';

function UnifiedDashboard() {
  const { userInfo: { user } } = useSelector((state: any) => state.auth)
  const { appointments, addAppointment } = useHospitalData();
  const [page, setPage] = useState(1);
  const limit = 5;
  const [search, setSearch] = useState('');
  const role = user?.role;
  const debouncedSearch = useDebounce(search, 400);
  const today = '2024-01-20';
  const [postPatient] = useCreatepatientMutation({})
  const { data: depts } = useFetchdepartmentsQuery({})
  const { data: users } = useGetusersoverviewQuery({})
  const allusers = users !== undefined ? users : []
  const docs = allusers.filter(p => p.role === 'doctor')
  const nurses = allusers.filter(p => p.role === 'nurses')
  const receptionists = allusers.filter(p => p.role === 'receptionists')

  const {
    data: overview
  } = useFetchpatientsoverviewsQuery({});

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useFetchpatientsQuery({
    page,
    limit,
    search: debouncedSearch,
  });


  const patients = overview !== undefined ? overview.patients : []

  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);

  // Role-based data
  const myPatients = role === 'doctor' ? patients.filter(p => p.assignedDoctor === user?.name) : [];
  const myAppointments = role === 'doctor' ? appointments.filter(a => a.doctorName === user?.name) : [];
  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const criticalPatients = patients.filter(p => p.status === 'critical');
  const admittedPatients = patients.filter(p => p.status === 'admitted' || p.status === 'critical');
  const departments = depts !== undefined ? depts : []
  // Receptionist waiting queue
  const [waitingQueue, setWaitingQueue] = useState([
    { id: 1, name: 'Emily Carter', checkIn: '08:45 AM', doctor: 'Dr. Michael Chen', status: 'waiting' },
    { id: 2, name: 'James Anderson', checkIn: '09:00 AM', doctor: 'Dr. Sarah Lee', status: 'waiting' },
    { id: 3, name: 'Sophia Martinez', checkIn: '09:15 AM', doctor: 'Dr. Michael Chen', status: 'in-consultation' },
  ]);

  const handleCallPatient = (id) => {
    setWaitingQueue(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'in-consultation' } : p)
    );
    const patient = waitingQueue.find(p => p.id === id);
    toast({ title: 'Patient Called', description: `${patient?.name} has been called for consultation.` });
  };
  const addPatient = async (Data: Patient) => {
    await postPatient(Data).unwrap()
    await refetch()
    toast({
      title: 'Doctor Added',
      description: `${Data.name} has been added successfully.`,
    });

  };
  return (
    <DashboardLayout
      title="Hospital Dashboard"
      subtitle={`Welcome, ${user?.name}`}
    >
      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {role === 'admin' && (
          <>
            <StatsCard title="Total Patients" value={patients.length} icon={Users} />
            <StatsCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} />
            <StatsCard title="Admitted Patients" value={admittedPatients.length} icon={Bed} />
            <StatsCard title="Revenue (Monthly)" value="$248,500" icon={DollarSign} />
          </>
        )}
        {role === 'doctor' && (
          <>
            <StatsCard title="My Patients" value={myPatients.length} icon={Users} />
            <StatsCard title="Today's Appointments" value={todayAppointments.filter(a => a.doctorName === user?.name).length} icon={Calendar} />
            <StatsCard title="Pending Consultations" value={myAppointments.filter(a => a.status === 'scheduled').length} icon={Clock} />
            <StatsCard title="Completed Today" value={myAppointments.filter(a => a.status === 'completed').length} icon={CheckCircle} />
          </>
        )}
        {role === 'nurse' && (
          <>
            <StatsCard title="Patients Under Care" value={admittedPatients.length} icon={Heart} />
            <StatsCard title="Critical Patients" value={criticalPatients.length} icon={AlertTriangle} />
            <StatsCard title="Pending Tasks" value={0} icon={ClipboardList} />
            <StatsCard title="Completed Today" value={0} icon={CheckSquare} />
          </>
        )}
        {role === 'receptionist' && (
          <>
            <StatsCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} />
            <StatsCard title="Waiting Queue" value={waitingQueue.filter(w => w.status === 'waiting').length} icon={Clock} />
            <StatsCard title="Checked In" value={waitingQueue.length} icon={CheckCircle} />
            <StatsCard title="Total Patients" value={patients.length} icon={UserPlus} />
          </>
        )}
      </div>
      {/* --- Quick Actions --- */}

      {/* --- Quick Actions / Receptionist / Admin --- */}
      {(role === 'receptionist') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button className="h-16 text-base gap-3" onClick={() => setPatientModalOpen(true)}>
            <UserPlus className="w-5 h-5" /> Register New Patient
          </Button>
          <Button variant="outline" className="h-16 text-base gap-3" onClick={() => setAppointmentModalOpen(true)}>
            <Calendar className="w-5 h-5" /> Schedule Appointment
          </Button>
          <Button variant="outline" className="h-16 text-base gap-3" onClick={() => toast({ title: 'Patient Inquiry', description: 'Search patient records using the header.' })}>
            <Phone className="w-5 h-5" /> Patient Inquiry
          </Button>
        </div>
      )}

      {/* --- Main Content Grid --- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <AppointmentList
            appointments={role === 'doctor' ? myAppointments : todayAppointments}
            title="Today's Appointments"
          />
          {/* For doctor: Upcoming Appointments */}
          {role === 'doctor' && (
            <AppointmentList
              appointments={myAppointments.filter(a => a.date !== today)}
              title="Upcoming Appointments"
            />
          )}
        </div>

        {/* Quick Actions (Admin only) */}
        {role === 'admin' && (
          <div className="lg:col-span-1">
            <QuickActions refetch={refetch} doctors={docs !== undefined ? docs : []} patients={patients} />
          </div>
        )}
      </div>


      {/* --- Departments --- */}
      {role === 'admin' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Departments Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments?.map(dept => <DepartmentCard key={dept._id} department={dept} />)}
          </div>
        </div>
      )}

      {/* --- Patients Table --- */}
      {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
        <PatientTable
          search={search}
          onSearchChange={(value) => { setPage(1); setSearch(value); }}
          page={page}
          totalPages={data?.pagination?.totalPages ?? 1}
          onPageChange={setPage}
          refetch={() => { refetch(); }}
          patients={role === 'doctor'
            ? data?.data.filter(p => p.assignedDoctor === user?.name) ?? []
            : data?.data ?? []
          }
          title={role === 'doctor' ? 'My Patients' : 'All Patients'}
        />
      )}


      {/* --- Nurse Tasks & Critical Patients --- */}
      {role === 'nurse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card animate-slide-up">
            <h3 className="p-6 font-semibold">Care Tasks</h3>
            {/* TODO: Render vital tasks */}
          </div>
          <div className="bg-card rounded-xl shadow-card animate-slide-up">
            <h3 className="p-6 font-semibold">Critical Patients</h3>
            {criticalPatients.map(p => (
              <div key={p.id} className="p-4">{p.name} - {p.room}</div>
            ))}
          </div>
        </div>
      )}

      {/* --- Receptionist Waiting Queue --- */}
      {role === 'receptionist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-card animate-slide-up">
            <h3 className="p-6 font-semibold">Waiting Queue</h3>
            {waitingQueue.map(p => (
              <div key={p.id} className="flex justify-between p-4">
                <div>{p.name} - {p.checkIn}</div>
                {p.status === 'waiting' && <Button size="sm" onClick={() => handleCallPatient(p.id)}>Call</Button>}
                <Badge>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Modals --- */}
      <PatientFormModal
        refetch={() => { refetch(); }}
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
        mode="add"
        onSubmit={addPatient}
      />
      <AppointmentFormModal
        doctors={docs !== undefined ? docs : []}
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        patients={patients}
        mode="add"
        preselectedPatient={selectedPatientForAppointment}
        onSubmit={addAppointment}
      />
      <ViewPatientModal open={!!viewPatient} onOpenChange={open => !open && setViewPatient(null)} patient={viewPatient} />
    </DashboardLayout>
  );
}
export default UnifiedDashboard