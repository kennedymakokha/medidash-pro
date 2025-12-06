import { UserPlus, CalendarPlus, FileText, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { label: 'Add Patient', icon: UserPlus, color: 'primary' },
  { label: 'New Appointment', icon: CalendarPlus, color: 'success' },
  { label: 'Create Report', icon: FileText, color: 'info' },
  { label: 'Assign Bed', icon: Bed, color: 'warning' },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card animate-slide-up">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex-col gap-2 hover:bg-accent hover:border-primary/20"
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
