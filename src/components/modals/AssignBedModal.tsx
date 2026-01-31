import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHospitalData } from '@/contexts/HospitalDataContext';

interface AssignBedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roomTypes = [
  { prefix: 'Room', range: [101, 120] },
  { prefix: 'ICU', range: [1, 10] },
  { prefix: 'Ward', range: ['A', 'B', 'C', 'D'] },
];

export function AssignBedModal({ open, onOpenChange }: AssignBedModalProps) {
  const { patients, updatePatient } = useHospitalData();
  const [patientId, setPatientId] = useState('');
  const [roomType, setRoomType] = useState('Room');
  const [roomNumber, setRoomNumber] = useState('');

  const eligiblePatients = patients.filter(
    (p) => p.status === 'admitted' || p.status === 'critical' || p.status === 'outpatient'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = `${roomType} ${roomNumber}`;
    updatePatient(patientId, { 
      room, 
      status: 'admitted',
      admissionDate: new Date().toISOString().split('T')[0]
    });
    onOpenChange(false);
    setPatientId('');
    setRoomNumber('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Bed to Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Select Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose patient" />
              </SelectTrigger>
              <SelectContent>
                {eligiblePatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room">Room</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Ward">Ward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Number</Label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., 201"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!patientId || !roomNumber}>
              Assign Bed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
