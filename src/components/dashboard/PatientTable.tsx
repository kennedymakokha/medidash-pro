import { useState } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/types/hospital';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import calculateAge from '@/utils/culculateAge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewPatientModal } from '@/components/modals/ViewPatientModal';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { highlightText } from '@/utils/highlightText';
import { DataTable } from '@/components/table/DataTable';
import { useCreatepatientMutation } from '@/features/patientSlice';

interface PatientTableProps {
  patients: Patient[];
  title: string;
  refetch?: () => Promise<void>;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const statusStyles = {
  admitted: 'bg-info/10 text-info border-info/20',
  outpatient: 'bg-success/10 text-success border-success/20',
  discharged: 'bg-muted text-muted-foreground border-muted',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function PatientTable({
  patients,
  title,
  page,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  refetch,
}: PatientTableProps) {
  const [postPatient] = useCreatepatientMutation();
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatientData, setDeletePatientData] = useState<Patient | null>(null);

  const deletePatient = async (patient: Patient | null) => {
    if (!patient) return;
    try {
      await postPatient({ ...patient, isDeleted: true }).unwrap();
      await refetch();
      setDeletePatientData(null);
    } catch (error) {
      console.error('Failed to delete patient', error);
    }
  };

  return (
    <>
      <DataTable
        title={title}
        search={search}
        onSearchChange={onSearchChange}
        actionButton={<Button variant="outline" size="sm">View All</Button>}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        columns={
          <tr className="bg-muted/50">
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase">Patient</th>
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase">Age/Gender</th>
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase">Blood</th>
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase">Status</th>
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase">Doctor</th>
            <th className="text-right px-6 py-3 text-xs font-semibold uppercase">Actions</th>
          </tr>
        }
        rows={patients.map((patient) => (
          <tr key={patient.uuid} className="hover:bg-muted/30">
            <td className="px-6 py-4">
              <p className="font-medium">{highlightText(patient.name, search)}</p>
              <p className="text-sm text-muted-foreground">{highlightText(patient.phone ?? '', search)}</p>
            </td>
            <td className="px-6 py-4">{calculateAge(patient.dob)} yrs</td>
            <td className="px-6 py-4">{patient.bloodgroup}</td>
            <td className="px-6 py-4">
              <Badge className={cn(statusStyles[patient.status])}>{patient.status}</Badge>
            </td>
            <td className="px-6 py-4">{patient.assignedDoctor || '-'}</td>
            <td className="px-6 py-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewPatient(patient)}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditPatient(patient)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeletePatientData(patient)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      />

      <ViewPatientModal open={!!viewPatient} onOpenChange={() => setViewPatient(null)} patient={viewPatient} />
      <PatientFormModal
        refetch={refetch}
        open={!!editPatient}
        onOpenChange={() => setEditPatient(null)}
        patient={editPatient}
        mode="edit"
      />
      <DeleteConfirmModal
        title="Delete Patient"
        description={`Are you sure you want to delete ${deletePatientData?.name}?`}
        open={!!deletePatientData}
        onOpenChange={() => setDeletePatientData(null)}
        onConfirm={() => deletePatient(deletePatientData)}
      />
    </>
  );
}
