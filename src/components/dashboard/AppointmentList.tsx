import { Clock, User, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/hospital';
import { Badge } from '@/components/ui/badge';

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
  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {appointments.map((appointment, index) => (
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
                <button className="p-1 hover:bg-muted rounded-md transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
