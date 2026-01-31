import { useState } from 'react';
import { UserPlus, CalendarPlus, FileText, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { CreateReportModal } from '@/components/modals/CreateReportModal';
import { AssignBedModal } from '@/components/modals/AssignBedModal';
import { useHospitalData } from '@/contexts/HospitalDataContext';

export function QuickActions() {
  const { addPatient, addAppointment } = useHospitalData();
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [bedModalOpen, setBedModalOpen] = useState(false);

  const actions = [
    { label: 'Add Patient', icon: UserPlus, onClick: () => setPatientModalOpen(true) },
    { label: 'New Appointment', icon: CalendarPlus, onClick: () => setAppointmentModalOpen(true) },
    { label: 'Create Report', icon: FileText, onClick: () => setReportModalOpen(true) },
    { label: 'Assign Bed', icon: Bed, onClick: () => setBedModalOpen(true) },
  ];

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
        onOpenChange={setPatientModalOpen}
        mode="add"
        onSubmit={addPatient}
      />
      <AppointmentFormModal
        open={appointmentModalOpen}
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
