import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Doctor, mockDoctors } from '@/data/mockData';
import { DoctorFormModal } from '@/components/modals/DoctorFormModal';
import { ViewDoctorModal } from '@/components/modals/ViewDoctorModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Stethoscope,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doctor.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doctor-${Date.now()}`,
    };
    setDoctors((prev) => [...prev, newDoctor]);
    toast({
      title: 'Doctor Added',
      description: `${doctorData.name} has been added successfully.`,
    });
  };

  const handleEditDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    if (!editDoctor) return;
    setDoctors((prev) =>
      prev.map((d) => (d.id === editDoctor.id ? { ...d, ...doctorData } : d))
    );
    toast({
      title: 'Doctor Updated',
      description: 'Doctor information has been updated.',
    });
    setEditDoctor(null);
  };

  const handleDeleteDoctor = () => {
    if (!deleteDoctor) return;
    setDoctors((prev) => prev.filter((d) => d.id !== deleteDoctor.id));
    toast({
      title: 'Doctor Removed',
      description: `${deleteDoctor.name} has been removed.`,
      variant: 'destructive',
    });
    setDeleteDoctor(null);
  };

  return (
    <DashboardLayout title="Doctors" subtitle="Manage hospital doctors and specialists">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, specialty, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total Doctors</p>
          <p className="text-2xl font-bold text-card-foreground">{doctors.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success">{doctors.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">On Leave</p>
          <p className="text-2xl font-bold text-warning">{doctors.filter(d => d.status === 'on-leave').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Departments</p>
          <p className="text-2xl font-bold text-card-foreground">{new Set(doctors.map(d => d.department)).size}</p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow animate-slide-up"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewDoctor(doctor)}>
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditDoctor(doctor)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteDoctor(doctor)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                {doctor.department}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {doctor.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {doctor.email}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn('capitalize', statusStyles[doctor.status])}>
                {doctor.status.replace('-', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground">{doctor.experience} yrs exp</span>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No doctors found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Modals */}
      <DoctorFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        mode="add"
        onSubmit={handleAddDoctor}
      />
      <DoctorFormModal
        open={!!editDoctor}
        onOpenChange={(open) => !open && setEditDoctor(null)}
        doctor={editDoctor}
        mode="edit"
        onSubmit={handleEditDoctor}
      />
      <ViewDoctorModal
        open={!!viewDoctor}
        onOpenChange={(open) => !open && setViewDoctor(null)}
        doctor={viewDoctor}
      />
      <DeleteConfirmModal
        title="Delete Doctor"
        description={`Are you sure you want to remove ${deleteDoctor?.name}? This action cannot be undone.`}
        open={!!deleteDoctor}
        onOpenChange={(open) => !open && setDeleteDoctor(null)}
        onConfirm={handleDeleteDoctor}
      />
    </DashboardLayout>
  );
}
