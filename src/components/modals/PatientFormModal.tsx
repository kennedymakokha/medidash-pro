import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/hospital";
import { useGetusersQuery } from "@/features/userSlice";
import { FingerprintSection } from "./patient/FingerprintSection";
import { PatientFormFields } from "./patient/PatientFormFields";

interface PatientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSubmit: (patient: Patient) => void;
  mode: "add" | "edit";
}

const defaultForm = {
  name: "", dob: null as Date | null, sex: "male" as "male" | "female" | "other",
  phone: "", address: "", bloodgroup: "A+",
  status: "outpatient" as Patient["status"],
  assignedDoctor: "", room: "", nationalId: "",
};

export function PatientFormModal({ open, onOpenChange, patient, onSubmit, mode }: PatientFormModalProps) {
  const [formData, setFormData] = useState(defaultForm);
  const [scanning, setScanning] = useState(false);
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);

  const { data: users } = useGetusersQuery({ role: "doctor", limit: 10, page: 1, search: "" });
  const doctors = users?.data ?? [];

  useEffect(() => {
    if (!open) return;
    if (patient && mode === "edit") {
      setFormData({
        name: patient.name ?? "",
        dob: patient.dob ? new Date(patient.dob) : null,
        sex: (patient.sex ?? "male") as any,
        phone: patient.phone ?? "",
        address: patient.address ?? "",
        bloodgroup: patient.bloodgroup ?? "A+",
        status: patient.status ?? "outpatient",
        assignedDoctor: typeof patient.assignedDoctor === "object"
          ? (patient.assignedDoctor as any)?._id ?? ""
          : patient.assignedDoctor ?? "",
        room: patient.room ?? "",
        nationalId: patient.nationalId ?? "",
      });
    } else {
      setFormData(defaultForm);
      setFingerprintData(null);
    }
  }, [open, patient, mode]);

  const scanFingerprint = async () => {
    try {
      setScanning(true);
      const response = await fetch("http://localhost:3000/scan", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");
      setFingerprintData(data.output);
    } catch (error) {
      console.error(error);
      alert("Fingerprint scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData = {
      ...formData,
      uuid: (patient as any)?.uuid ?? "",
      email: (patient as any)?.email ?? "",
      dob: formData.dob ? formData.dob.toISOString().split("T")[0] : "",
      fingerprint: fingerprintData,
      visits: [],
    } as unknown as Patient;
    onSubmit(patientData);
    console.log(patientData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Patient" : "Edit Patient"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FingerprintSection scanning={scanning} fingerprintData={fingerprintData} onScan={scanFingerprint} />
          <PatientFormFields formData={formData} onChange={setFormData} doctors={doctors} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{mode === "add" ? "Add Patient" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
