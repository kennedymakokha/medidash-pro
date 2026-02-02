import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/hospital';
import { mockAppointments, mockPatients, mockDoctors } from '@/data/mockData';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Filter,
  CheckCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react';

const statusStyles = {
  scheduled: 'bg-primary/10 text-primary border-primary/20',
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAppointment = (data: Appointment) => {
    const newAppointment: Appointment = {
      ...data,
      id: Date.now().toString(),
    };
    setAppointments([newAppointment, ...appointments]);
    toast({
      title: 'Appointment Scheduled',
      description: `Appointment for ${data.patientName} has been created.`,
    });
  };

  const handleEditAppointment = (data: Appointment) => {
    if (!editAppointment) return;
    setAppointments(
      appointments.map((a) =>
        a.id === editAppointment.id ? { ...a, ...data } : a
      )
    );
    toast({
      title: 'Appointment Updated',
      description: 'Appointment details have been updated.',
    });
    setEditAppointment(null);
  };

  const handleDeleteAppointment = () => {
    if (!deleteAppointment) return;
    setAppointments(appointments.filter((a) => a.id !== deleteAppointment.id));
    toast({
      title: 'Appointment Cancelled',
      description: 'The appointment has been removed.',
      variant: 'destructive',
    });
    setDeleteAppointment(null);
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, status } : a))
    );
    toast({
      title: 'Status Updated',
      description: `Appointment marked as ${status}.`,
    });
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === 'scheduled').length,
    inProgress: appointments.filter((a) => a.status === 'in-progress').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  return (
    <DashboardLayout title="Appointments" subtitle="Manage patient appointments and schedules">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Status:</span> {statusFilter === 'all' ? 'All' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('scheduled')}>Scheduled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in-progress')}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span> Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold text-primary">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <PlayCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{appointment.patientName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="w-3 h-3" />
                    {appointment.doctorName}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditAppointment(appointment)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    {appointment.status === 'scheduled' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'in-progress')}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Start
                      </DropdownMenuItem>
                    )}
                    {appointment.status === 'in-progress' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Complete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteAppointment(appointment)}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {appointment.date}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {appointment.time}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={cn('capitalize', typeStyles[appointment.type])}>
                  {appointment.type}
                </Badge>
                <Badge variant="outline" className={cn('capitalize', statusStyles[appointment.status])}>
                  {appointment.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No appointments found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Modals */}
      <AppointmentFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        patients={mockPatients}
        doctors={mockDoctors}
        mode="add"
        onSubmit={handleAddAppointment}
      />
      <AppointmentFormModal
        open={!!editAppointment}
        onOpenChange={(open) => !open && setEditAppointment(null)}
        patients={mockPatients}
        doctors={mockDoctors}
        appointment={editAppointment}
        mode="edit"
        onSubmit={handleEditAppointment}
      />
      <DeleteConfirmModal
        title="Cancel Appointment"
        description={`Are you sure you want to cancel the appointment for ${deleteAppointment?.patientName}?`}
        open={!!deleteAppointment}
        onOpenChange={(open) => !open && setDeleteAppointment(null)}
        onConfirm={handleDeleteAppointment}
      />
    </DashboardLayout>
  );
}
