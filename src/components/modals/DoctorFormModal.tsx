import { useState, useEffect } from 'react';
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
import { Doctor, mockDepartments } from '@/data/mockData';
import { Department } from '@/types/hospital';
import { generateUnifiedId } from '@/utils/culculateAge';

interface DoctorFormModalProps {
  open: boolean;
  departments: Department[]
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  onSubmit: (doctor: Omit<Doctor, 'id'>) => void;
  mode: 'add' | 'edit';
}

const specialties = [
  'Cardiologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Emergency Medicine',
  'Intensivist',
  'General Surgeon',
  'Dermatologist',
  'Psychiatrist',
  'Radiologist',
];

const statusOptions: Doctor['status'][] = ['active', 'on-leave', 'inactive'];

export function DoctorFormModal({
  open,
  onOpenChange,
  departments,
  doctor,
  onSubmit,
  mode,
}: DoctorFormModalProps) {
  const [formData, setFormData] = useState({
    uuid: undefined,
    name: '',
    email: '',
    phone_number: '',
    specialty: '',
    department: '',
    status: 'active' as Doctor['status'],
    experience: 0,
    qualification: '',
    schedule: '',
    role: "",
  });

  useEffect(() => {
    if (!open) return;

    if (doctor && mode === 'edit') {
      setFormData({
        uuid: doctor.uuid,
        name: doctor.name ?? '',
        email: doctor.email ?? '',
        phone_number: doctor.phone_number ?? '',
        specialty: doctor.specialty ?? '',
        department: doctor.department ?? '',
        status: doctor.status ?? 'active',
        experience: doctor.experience ?? 0,
        qualification: doctor.qualification ?? '',
        schedule: doctor.schedule ?? '',
        role: "doctor",
      });
    } else {
      setFormData({
        uuid:undefined,
        name: '',
        email: '',
        phone_number: '',
        specialty: '',
        department: '',
        status: 'active',
        experience: 0,
        qualification: '',
        schedule: '',
        role: "doctor"
      });
    }
  }, [open, doctor, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log(formData)
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Doctor' : 'Edit Doctor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@hospital.com"
                required
              />
            </div>

            <div>
              <Label>phone</Label>
              <Input
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+1 234-567-8900"
                required
              />
            </div>

            <div>
              <Label>Specialty</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => setFormData({ ...formData, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Experience (years)</Label>
              <Input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Doctor['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Qualification</Label>
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="MD, FACC"
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Schedule</Label>
              <Input
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="Mon-Fri 9AM-5PM"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Doctor' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
