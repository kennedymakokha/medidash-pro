import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types/hospital';
import { User, Phone, Mail, MapPin, Droplets, Calendar, Stethoscope, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

const statusStyles = {
  admitted: 'bg-info/10 text-info border-info/20',
  outpatient: 'bg-success/10 text-success border-success/20',
  discharged: 'bg-muted text-muted-foreground border-muted',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function ViewPatientModal({ open, onOpenChange, patient }: ViewPatientModalProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {patient.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">{patient.age} years, {patient.gender}</p>
              <Badge variant="outline" className={cn("mt-1 capitalize", statusStyles[patient.status])}>
                {patient.status}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{patient.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{patient.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{patient.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Droplets className="w-4 h-4 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="text-sm font-bold text-destructive">{patient.bloodGroup}</p>
              </div>
            </div>
            {patient.assignedDoctor && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Stethoscope className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Doctor</p>
                  <p className="text-sm font-medium">{patient.assignedDoctor}</p>
                </div>
              </div>
            )}
            {patient.room && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <DoorOpen className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="text-sm font-medium">{patient.room}</p>
                </div>
              </div>
            )}
            {patient.admissionDate && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Admission Date</p>
                  <p className="text-sm font-medium">{patient.admissionDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
