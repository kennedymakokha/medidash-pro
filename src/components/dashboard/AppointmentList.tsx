import { useState } from 'react';
import { Clock, User, MoreVertical, Play, Check, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/hospital';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { useHospitalData } from '@/contexts/HospitalDataContext';

interface AppointmentListProps {
  appointments: Appointment[];
  title?: string;
}

const statusStyles = {
  scheduled: 'bg-info/10 text-info border-info/20',
  'in-progress': 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const typeStyles = {
  checkup: 'bg-primary/10 text-primary',
  followup: 'bg-accent text-accent-foreground',
  emergency: 'bg-destructive/10 text-destructive',
  surgery: 'bg-warning/10 text-warning',
};

export function AppointmentList({ appointments, title = "Today's Appointments" }: AppointmentListProps) {
  const { updateAppointment, updateAppointmentStatus, deleteAppointment } = useHospitalData();
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [deleteAppointmentData, setDeleteAppointmentData] = useState<Appointment | null>(null);

  const handleEditSubmit = (appointmentData: Omit<Appointment, 'id'>) => {
    if (editAppointment) {
      updateAppointment(editAppointment.id, appointmentData);
    }
  };

  const handleDelete = () => {
    if (deleteAppointmentData) {
      deleteAppointment(deleteAppointmentData.id);
      setDeleteAppointmentData(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl shadow-card animate-slide-up">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        </div>
        <div className="divide-y divide-border">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No appointments scheduled
            </div>
          ) : (
            appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-muted/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{appointment.patientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{appointment.time}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                          typeStyles[appointment.type]
                        )}>
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("capitalize", statusStyles[appointment.status])}>
                      {appointment.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {appointment.status === 'scheduled' && (
                          <DropdownMenuItem 
                            onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Consultation
                          </DropdownMenuItem>
                        )}
                        {appointment.status === 'in-progress' && (
                          <DropdownMenuItem 
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setEditAppointment(appointment)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Appointment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <DropdownMenuItem 
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Appointment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => setDeleteAppointmentData(appointment)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AppointmentFormModal
        open={!!editAppointment}
        onOpenChange={(open) => !open && setEditAppointment(null)}
        appointment={editAppointment}
        mode="edit"
        patients={[]}
        doctors={[]}
        onSubmit={handleEditSubmit}
      />
      <DeleteConfirmModal
        open={!!deleteAppointmentData}
        onOpenChange={(open) => !open && setDeleteAppointmentData(null)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        description={`Are you sure you want to delete this appointment for ${deleteAppointmentData?.patientName}?`}
      />
    </>
  );
}
