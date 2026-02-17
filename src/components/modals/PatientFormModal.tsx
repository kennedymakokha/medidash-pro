import { useState, useEffect } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Patient } from "@/types/hospital";
import { useGetusersQuery } from "@/features/userSlice";
import { Doctor } from "@/data/mockData";

interface PatientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSubmit: (patient: Patient) => void;
  mode: "add" | "edit";
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statusOptions: Patient["status"][] = [
  "outpatient",
  "admitted",
  "critical",
  "discharged",
];

export function PatientFormModal({
  open,
  onOpenChange,
  patient,
  onSubmit,
  mode,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    dob: null as Date | null,
    sex: "male" as "male" | "female" | "other",
    phone: "",
    address: "",
    bloodgroup: "A+",
    status: "outpatient" as Patient["status"],
    assignedDoctor: "",
    room: "",
    nationalId: "",
  });

  const [scanning, setScanning] = useState(false);
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);

  const { data: users } = useGetusersQuery({
    role: "doctor",
    limit: 10,
    page: 1,
    search: "",
  });

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
        assignedDoctor:
          typeof patient.assignedDoctor === "object"
            ? patient.assignedDoctor?._id
            : patient.assignedDoctor ?? "",
        room: patient.room ?? "",
        nationalId: patient.nationalId ?? "",
      });
    } else {
      resetForm();
    }
  }, [open, patient, mode]);

  const resetForm = () => {
    setFormData({
      name: "",
      dob: null,
      sex: "male",
      phone: "",
      address: "",
      bloodgroup: "A+",
      status: "outpatient",
      assignedDoctor: "",
      room: "",
      nationalId: "",
    });
    setFingerprintData(null);
  };

  const scanFingerprint = async () => {
    try {
      setScanning(true);

      const response = await fetch("http://localhost:3000/scan", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scan failed");
      }

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
      dob: formData.dob
        ? formData.dob.toISOString().split("T")[0]
        : "",
      fingerprint: fingerprintData, // optional save
      visits: [],
    } as Patient;

    onSubmit(patientData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Patient" : "Edit Patient"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Fingerprint Section */}
          <div className="bg-muted/40 p-4 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                Biometric Registration
              </Label>

              <Button
                type="button"
                onClick={scanFingerprint}
                disabled={scanning}
              >
                {scanning ? "Scanning..." : "Scan Fingerprint"}
              </Button>
            </div>

            {fingerprintData && (
              <div className="text-xs bg-background p-2 rounded border max-h-32 overflow-auto">
                <pre>{fingerprintData}</pre>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Full Name */}
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

            {/* Date of Birth */}
            <div>
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    {formData.dob
                      ? format(formData.dob, "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                  <Calendar
                    mode="single"
                    selected={formData.dob ?? undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, dob: date ?? null })
                    }
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
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

            {/* Address */}
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            {/* National ID */}
            <div>
              <Label>National ID</Label>
              <Input
                value={formData.nationalId}
                onChange={(e) =>
                  setFormData({ ...formData, nationalId: e.target.value })
                }
              />
            </div>

            {/* Assigned Doctor */}
            <div>
              <Label>Assigned Doctor</Label>
              <Select
                value={formData.assignedDoctor}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedDoctor: value })
                }
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

            {/* Room */}
            <div>
              <Label>Room</Label>
              <Input
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
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
              {mode === "add" ? "Add Patient" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
