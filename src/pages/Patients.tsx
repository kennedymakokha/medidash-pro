import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Patient } from '@/types/hospital';
import { mockPatients } from '@/data/mockData';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { ViewPatientModal } from '@/components/modals/ViewPatientModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Filter,
} from 'lucide-react';

const statusStyles = {
  admitted: 'bg-primary/10 text-primary border-primary/20',
  outpatient: 'bg-success/10 text-success border-success/20',
  discharged: 'bg-muted text-muted-foreground border-muted',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.email.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddPatient = (patientData: any) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      uuid: `patient-${Date.now()}`,
    };
    setPatients([newPatient, ...patients]);
    toast({
      title: 'Patient Added',
      description: `${patientData.name} has been registered successfully.`,
    });
  };

  const handleEditPatient = (patientData: any) => {
    if (!editPatient) return;
    setPatients(
      patients.map((p) =>
        p.id === editPatient.id ? { ...p, ...patientData } : p
      )
    );
    toast({
      title: 'Patient Updated',
      description: 'Patient information has been updated.',
    });
    setEditPatient(null);
  };

  const handleDeletePatient = () => {
    if (!deletePatient) return;
    setPatients(patients.filter((p) => p.id !== deletePatient.id));
    toast({
      title: 'Patient Removed',
      description: `${deletePatient.name} has been removed.`,
      variant: 'destructive',
    });
    setDeletePatient(null);
  };

  const stats = {
    total: patients.length,
    admitted: patients.filter((p) => p.status === 'admitted').length,
    outpatient: patients.filter((p) => p.status === 'outpatient').length,
    critical: patients.filter((p) => p.status === 'critical').length,
  };

  return (
    <DashboardLayout title="Patients" subtitle="Manage patient records and admissions">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
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
              <DropdownMenuItem onClick={() => setStatusFilter('admitted')}>Admitted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('outpatient')}>Outpatient</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('discharged')}>Discharged</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('critical')}>Critical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
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
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admitted</p>
              <p className="text-2xl font-bold text-primary">{stats.admitted}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <UserX className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outpatient</p>
              <p className="text-2xl font-bold text-success">{stats.outpatient}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Blood Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Doctor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground truncate">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} yrs • {patient.sex}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm">{patient.phone}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{patient.email}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{patient.bloodgroup}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', statusStyles[patient.status])}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                      {patient.assignedDoctor || 'Unassigned'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewPatient(patient)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditPatient(patient)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletePatient(patient)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No patients found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PatientFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        mode="add"
        onSubmit={handleAddPatient}
      />
      <PatientFormModal
        open={!!editPatient}
        onOpenChange={(open) => !open && setEditPatient(null)}
        patient={editPatient}
        mode="edit"
        onSubmit={handleEditPatient}
      />
      <ViewPatientModal
        open={!!viewPatient}
        onOpenChange={(open) => !open && setViewPatient(null)}
        patient={viewPatient}
      />
      <DeleteConfirmModal
        title="Delete Patient"
        description={`Are you sure you want to remove ${deletePatient?.name}? This action cannot be undone.`}
        open={!!deletePatient}
        onOpenChange={(open) => !open && setDeletePatient(null)}
        onConfirm={handleDeletePatient}
      />
    </DashboardLayout>
  );
}
