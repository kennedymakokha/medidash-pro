// src/components/modals/NewVisitModal.tsx
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Patient } from "@/types/hospital";

interface NewVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onAssignDoctor: (patientId: string, doctorId: string) => void;
}

export function NewVisitModal({
  open,
  onOpenChange,
  patient,
  onAssignDoctor,
}: NewVisitModalProps) {
  const [doctorId, setDoctorId] = useState("");

  if (!patient) return null;

  return (
    
    <Modal open={open} onOpenChange={onOpenChange} title="Assign New Doctor">
      <div className="space-y-4">
        <p>Assign a new doctor for {patient.name}</p>
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">Select Doctor</option>
          {/* Populate dynamically from your doctors list */}
          <option value="doc1">Dr. Smith</option>
          <option value="doc2">Dr. Jane</option>
        </select>
        <Button
          onClick={() => {
            if (doctorId) {
              onAssignDoctor(patient._id, doctorId);
              onOpenChange(false);
            }
          }}
        >
          Assign Doctor
        </Button>
      </div>
    </Modal>
  );
}
