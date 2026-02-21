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
import { useFetchdepartmentsQuery } from '@/features/departmentSlice';
import { useGetusersQuery, usePostuserMutation } from '@/features/userSlice';
import { StatsGridSkeleton, CardSkeleton } from '@/components/loaders';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
};

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);
  const { data: depts } = useFetchdepartmentsQuery({})
  const { data: users, refetch, isLoading, isFetching } = useGetusersQuery({ role: "doctor", limit: 10, page: 1, search })
  const doctors = users !== undefined ? users?.data : [];
  const [postDoctor] = usePostuserMutation({})
  const pagination = users?.pagination;
  const showLoading = isLoading;


  const handleAddDoctor = async (doctorData: Doctor) => {
    await postDoctor(doctorData).unwrap()
    await refetch()
    toast({
      title: 'Doctor Added',
      description: `${doctorData.name} has been added successfully.`,
    });

  };

  const handleEditDoctor = async (doctorData: Doctor) => {
    console.log(editDoctor);

    if (!editDoctor) return;

    await postDoctor(editDoctor).unwrap()
    await refetch()
    toast({
      title: 'Doctor Updated',
      description: 'Doctor information has been updated.',
    });
    setEditDoctor(null);
  };

  const handleDeleteDoctor = async () => {
    if (!deleteDoctor) return;
    await postDoctor({ ...deleteDoctor, isDeleted: true }).unwrap();
    await refetch()
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
      {showLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
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
            <p className="text-2xl font-bold text-card-foreground">{depts !== undefined ? depts.length : 0}</p>
          </div>
        </div>
      )}

      {/* Doctors Grid */}
      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-card animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
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
                  {doctor?.department?.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {doctor.phone_number}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {doctor.email}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn('capitalize', statusStyles[doctor.status])}>
                  {doctor?.status?.replace('-', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">{doctor.experience} yrs exp</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showLoading && doctors.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No doctors found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Modals */}
      <DoctorFormModal
        open={addModalOpen}
        departments={depts?.data ?? []}
        onOpenChange={setAddModalOpen}
        mode="add"
        onSubmit={handleAddDoctor}
      />
      <DoctorFormModal
        open={!!editDoctor}
        departments={depts?.data ?? []}
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
