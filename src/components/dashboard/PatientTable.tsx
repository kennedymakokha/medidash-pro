import { useState } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/types/hospital';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewPatientModal } from '@/components/modals/ViewPatientModal';
import { PatientFormModal } from '@/components/modals/PatientFormModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { useHospitalData } from '@/contexts/HospitalDataContext';

interface PatientTableProps {
  patients: Patient[];
  title?: string;
}

const statusStyles = {
  admitted: 'bg-info/10 text-info border-info/20',
  outpatient: 'bg-success/10 text-success border-success/20',
  discharged: 'bg-muted text-muted-foreground border-muted',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function PatientTable({ patients, title = "Recent Patients" }: PatientTableProps) {
  const { updatePatient, deletePatient } = useHospitalData();
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatientData, setDeletePatientData] = useState<Patient | null>(null);

  const handleEditSubmit = (patientData: Omit<Patient, 'id'>) => {
    if (editPatient) {
      updatePatient(editPatient.id, patientData);
    }
  };

  const handleDelete = () => {
    if (deletePatientData) {
      deletePatient(deletePatientData.id);
      setDeletePatientData(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age/Gender</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blood</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{patient.age} yrs</p>
                    <p className="text-xs text-muted-foreground capitalize">{patient.gender}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 text-sm font-bold text-destructive">
                      {patient.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("capitalize", statusStyles[patient.status])}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{patient.assignedDoctor || '-'}</p>
                    {patient.room && (
                      <p className="text-xs text-muted-foreground">{patient.room}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewPatient(patient)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditPatient(patient)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeletePatientData(patient)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ViewPatientModal
        open={!!viewPatient}
        onOpenChange={(open) => !open && setViewPatient(null)}
        patient={viewPatient}
      />
      <PatientFormModal
        open={!!editPatient}
        onOpenChange={(open) => !open && setEditPatient(null)}
        patient={editPatient}
        mode="edit"
        onSubmit={handleEditSubmit}
      />
      <DeleteConfirmModal
        open={!!deletePatientData}
        onOpenChange={(open) => !open && setDeletePatientData(null)}
        onConfirm={handleDelete}
        title="Delete Patient"
        description={`Are you sure you want to delete ${deletePatientData?.name}? This action cannot be undone and will also remove all associated appointments.`}
      />
    </>
  );
}
