import { useState } from 'react';
import { UserPlus, CalendarPlus, FileText, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { CreateReportModal } from '@/components/modals/CreateReportModal';
import { AssignBedModal } from '@/components/modals/AssignBedModal';
import { useHospitalData } from '@/contexts/HospitalDataContext';
import { Patient } from '@/types/hospital';
import { useCreatepatientMutation, useFetchpatientsQuery } from '@/features/patientSlice';
import { toast } from '@/hooks/use-toast';

export function QuickActions({ refetch, patients, doctors }) {

  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [postPatient] = useCreatepatientMutation({})

  const actions = [
    { label: 'Add Patient', icon: UserPlus, onClick: () => setPatientModalOpen(true) },
    { label: 'New Appointment', icon: CalendarPlus, onClick: () => setAppointmentModalOpen(true) },
    { label: 'Create Report', icon: FileText, onClick: () => setReportModalOpen(true) },
    { label: 'Assign Bed', icon: Bed, onClick: () => setBedModalOpen(true) },
  ];
  const addPatient = async (Data: Patient) => {
    await postPatient(Data).unwrap()
    await refetch()
    toast({
      title: 'Doctor Added',
      description: `${Data.name} has been added successfully.`,
    });

  };
  const addAppointment = async (Data: Patient) => {
    await postPatient(Data).unwrap()
    await refetch()
    toast({
      title: 'Doctor Added',
      description: `${Data.name} has been added successfully.`,
    });

  };
  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-card animate-slide-up">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-accent hover:border-primary/20"
              onClick={action.onClick}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <PatientFormModal
        open={patientModalOpen}
        onSubmit={addPatient}
        onOpenChange={setPatientModalOpen}
        mode="add"
      />
      <AppointmentFormModal
        open={appointmentModalOpen}
        patients={patients}
        doctors={doctors}
        onOpenChange={setAppointmentModalOpen}
        mode="add"
        onSubmit={addAppointment}
      />
      <CreateReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
      />
      <AssignBedModal
        open={bedModalOpen}
        onOpenChange={setBedModalOpen}
      />
    </>
  );
}
