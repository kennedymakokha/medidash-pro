import { useState, useEffect } from 'react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Patient } from '@/types/hospital';
import { useCreatepatientMutation } from '@/features/patientSlice';
import { generateUnifiedId } from '@/utils/culculateAge';
import { useGetusersQuery } from '@/features/userSlice';
import { Doctor } from '@/data/mockData';

interface PatientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSubmit: (patient: Patient) => void;
  mode: 'add' | 'edit';
  refetch?: () => Promise<void> | void;

}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const statusOptions: Patient['status'][] = [
  'outpatient',
  'admitted',
  'critical',
  'discharged',
];

export function PatientFormModal({
  open,
  onOpenChange,
  patient,
  onSubmit,
  refetch,
  mode,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState({
    uuid: generateUnifiedId('patient'),
    name: '',
    dob: null as Date | null,
    sex: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    address: '',
    bloodgroup: 'A+',
    status: 'outpatient' as Patient['status'],
    assignedDoctor: '',
    room: '',
    nokName: "",
    nokRelationship: "",
    nokPhone: "",
    nationalId: "",
    admissionDate: ""
  });
  const { data: users } = useGetusersQuery({ role: "doctor", limit: 10, page: 1, search: "" })
  const doctors = users !== undefined ? users?.data : [];

  useEffect(() => {
    if (!open) return;

    if (patient && mode === 'edit') {
      setFormData({
        uuid: patient.uuid,
        name: patient.name ?? '',
        dob: patient.dob ? new Date(patient.dob) : null,
        sex: (patient.sex ?? 'male').toLowerCase() as any,
        phone: patient.phone ?? '',
        email: patient.email ?? '',
        address: patient.address ?? '',
        bloodgroup: patient.bloodgroup ?? 'A+',
        status: patient.status ?? 'outpatient',
        assignedDoctor: patient.assignedDoctor ?? '',
        room: patient.room ?? '',
        nokName: patient.nokName ?? '',
        nokPhone: patient.nokPhone ?? '',
        nokRelationship: patient.nokRelationship ?? '',
        nationalId: patient.nationalId ?? '',
        admissionDate: patient.admissionDate ?? '',

      });
    } else {
      setFormData({
        uuid: generateUnifiedId('patient'),
        name: '',
        dob: null,
        sex: 'male',
        phone: '',
        email: '',
        address: '',
        bloodgroup: 'A+',
        status: 'outpatient',
        assignedDoctor: '',
        room: '',
        nokName: '',
        nokPhone: '',
        nokRelationship: '',
        nationalId: "",
        admissionDate: ""
      });
    }
  }, [open, patient, mode]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   onSubmit({
  //     ...formData, admissionDate:
  //       formData.status === 'admitted' || formData.status === 'critical'
  //         ? new Date().toISOString().split('T')[0]
  //         : undefined,
  //   });

  //   onOpenChange(false);

  // };
  const handleSubmit = (e: React.FormEvent) => {
    console.log(formData)
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Patient' : 'Edit Patient'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* DOB Date Picker */}
            <div>
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {formData.dob
                      ? format(formData.dob, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dob ?? undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, dob: date ?? null })
                    }
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    disabled={(date) => date > new Date()}
                    className="rounded-lg border shadow-sm p-3"
                    classNames={{
                      caption: 'flex justify-center gap-2 mb-2',
                      caption_label: 'hidden',
                      dropdown:
                        'px-2 py-1 rounded-md border bg-background text-sm',
                      nav: 'space-x-1',
                      nav_button:
                        'h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground',
                      table: 'w-full border-collapse space-y-1',
                      head_cell:
                        'text-muted-foreground font-medium text-xs',
                      cell:
                        'h-9 w-9 text-center text-sm rounded-md hover:bg-accent',
                      day_selected:
                        'bg-primary text-primary-foreground hover:bg-primary',
                      day_today:
                        'border border-primary text-primary',
                    }}
                    initialFocus
                  />

                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) =>
                  setFormData({ ...formData, sex: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            {/* Blood Group */}
            <div>
              <Label>Blood Group</Label>
              <Select
                value={formData.bloodgroup}
                onValueChange={(value) =>
                  setFormData({ ...formData, bloodgroup: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            {/* Blood Group */}
            <div>
              <Label>National ID</Label>
              <Input
                value={formData.nationalId}
                onChange={(e) =>
                  setFormData({ ...formData, nationalId: e.target.value })
                } />
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Patient['status'] })
                }
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room */}
            <div>
              <Label>Room</Label>
              <Input
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                placeholder="Room 201"
              />
            </div>

            {/* Doctor */}

            <div className="col-span-2">
              <Label>Assigned Doctor</Label>
              <Select
                value={formData.assignedDoctor}
                onValueChange={(value) => setFormData({ ...formData, assignedDoctor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc: Doctor) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Next of Kin */}
            <div className="col-span-2 pt-4 border-t">
              <Label className="text-sm font-semibold text-muted-foreground">
                Next of Kin
              </Label>
            </div>

            <div>
              <Label>Name</Label>
              <Input
                value={formData.nokName}
                onChange={(e) =>
                  setFormData({ ...formData, nokName: e.target.value })
                }
                placeholder="Full name"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={formData.nokPhone}
                onChange={(e) =>
                  setFormData({ ...formData, nokPhone: e.target.value })
                }
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="col-span-2">
              <Label>Relationship</Label>
              <Input
                value={formData.nokRelationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nokRelationship: e.target.value,
                  })
                }
                placeholder="Spouse, Brother, Parent"
              />
            </div>

          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Patient' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
