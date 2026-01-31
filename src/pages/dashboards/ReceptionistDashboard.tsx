import { useState } from 'react';
import { Calendar, UserPlus, Clock, Users, Phone, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHospitalData } from '@/contexts/HospitalDataContext';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { ViewPatientModal } from '@/components/modals/ViewPatientModal';
import { toast } from '@/hooks/use-toast';
import { Patient } from '@/types/hospital';

interface WaitingPatient {
  id: number;
  name: string;
  checkIn: string;
  doctor: string;
  status: 'waiting' | 'in-consultation';
}

const initialWaitingQueue: WaitingPatient[] = [
  { id: 1, name: 'Emily Carter', checkIn: '08:45 AM', doctor: 'Dr. Michael Chen', status: 'waiting' },
  { id: 2, name: 'James Anderson', checkIn: '09:00 AM', doctor: 'Dr. Sarah Lee', status: 'waiting' },
  { id: 3, name: 'Sophia Martinez', checkIn: '09:15 AM', doctor: 'Dr. Michael Chen', status: 'in-consultation' },
];

export function ReceptionistDashboard() {
  const { patients, appointments, addPatient, addAppointment } = useHospitalData();
  const [waitingQueue, setWaitingQueue] = useState<WaitingPatient[]>(initialWaitingQueue);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  const todayAppointments = appointments.filter(
    (a) => a.date === '2024-01-20'
  );

  const handleCallPatient = (id: number) => {
    setWaitingQueue((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'in-consultation' as const } : p
      )
    );
    const patient = waitingQueue.find((p) => p.id === id);
    toast({
      title: "Patient Called",
      description: `${patient?.name} has been called for consultation.`,
    });
  };

  const handleBookAppointment = (patient: Patient) => {
    setSelectedPatientForAppointment(patient);
    setAppointmentModalOpen(true);
  };

  const handlePatientInquiry = () => {
    toast({
      title: "Patient Inquiry",
      description: "Use the search function in the header to find patient records.",
    });
  };

  return (
    <DashboardLayout 
      title="Reception Dashboard" 
      subtitle="Manage appointments and patient check-ins."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon={Calendar}
        />
        <StatsCard
          title="Waiting Queue"
          value={waitingQueue.filter(w => w.status === 'waiting').length}
          icon={Clock}
        />
        <StatsCard
          title="Checked In"
          value={waitingQueue.length}
          icon={CheckCircle}
        />
        <StatsCard
          title="Total Patients"
          value={patients.length}
          icon={UserPlus}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button 
          className="h-16 text-base gap-3"
          onClick={() => setPatientModalOpen(true)}
        >
          <UserPlus className="w-5 h-5" />
          Register New Patient
        </Button>
        <Button 
          variant="outline" 
          className="h-16 text-base gap-3"
          onClick={() => {
            setSelectedPatientForAppointment(null);
            setAppointmentModalOpen(true);
          }}
        >
          <Calendar className="w-5 h-5" />
          Schedule Appointment
        </Button>
        <Button 
          variant="outline" 
          className="h-16 text-base gap-3"
          onClick={handlePatientInquiry}
        >
          <Phone className="w-5 h-5" />
          Patient Inquiry
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Queue */}
        <div className="bg-card rounded-xl shadow-card animate-slide-up">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Waiting Queue</h3>
            <Badge variant="secondary">{waitingQueue.length} patients</Badge>
          </div>
          <div className="divide-y divide-border">
            {waitingQueue.map((patient) => (
              <div key={patient.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Check-in: {patient.checkIn} · {patient.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.status === 'waiting' && (
                      <Button 
                        size="sm"
                        onClick={() => handleCallPatient(patient.id)}
                      >
                        Call Patient
                      </Button>
                    )}
                    <Badge 
                      variant={patient.status === 'in-consultation' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {patient.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Appointments */}
        <AppointmentList 
          appointments={todayAppointments} 
          title="Today's Appointments" 
        />
      </div>

      {/* Recent Registrations */}
      <div className="mt-8 bg-card rounded-xl shadow-card animate-slide-up">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Patient Registrations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Patient</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Blood Group</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.slice(0, 4).map((patient) => (
                <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.age} yrs, {patient.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{patient.phone}</p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 text-sm font-bold text-destructive">
                      {patient.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewPatient(patient)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleBookAppointment(patient)}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PatientFormModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
        mode="add"
        onSubmit={addPatient}
      />
      <AppointmentFormModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        mode="add"
        preselectedPatient={selectedPatientForAppointment}
        onSubmit={addAppointment}
      />
      <ViewPatientModal
        open={!!viewPatient}
        onOpenChange={(open) => !open && setViewPatient(null)}
        patient={viewPatient}
      />
    </DashboardLayout>
  );
}
