import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Appointment, Patient } from "@/types/hospital";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { Doctor } from "@/data/mockData";
import { useGetusersQuery } from "@/features/userSlice";
import {
  useFetchpatientsoverviewsQuery,
  useFetchpatientsQuery,
} from "@/features/patientSlice";
import { generateUnifiedId } from "@/utils/culculateAge";

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  doctors: Doctor[];
  appointment?: Appointment | null;
  preselectedPatient?: Patient | null;
  onSubmit: (appointment: any) => void;
  mode: "add" | "edit";
}

const appointmentTypes: Appointment["type"][] = [
  "checkup",
  "followup",
  "emergency",
  "surgery",
];

export function AppointmentFormModal({
  open,
  onOpenChange,
  appointment,
  preselectedPatient,
  onSubmit,
  mode,
}: AppointmentFormModalProps) {
  const { data: users } = useGetusersQuery({
    role: "doctor",
    limit: 10,
    page: 1,
    search: "",
  });
  const doctors = users?.data ?? [];
  const { data: patientsData } = useFetchpatientsQuery({
    page: 1,
    limit: 100000,
  });
  const patients = patientsData?.data ?? [];

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    type: "checkup" as Appointment["type"],
    status: "scheduled" as Appointment["status"],
    notes: "",
  });
  const convertTo24Hour = (time12: string) => {
    if (!time12) return "";
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");

    let h = parseInt(hours);

    if (modifier === "PM" && h !== 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${minutes}`;
  };
const convertTo12Hour = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours);

  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};
  useEffect(() => {
    if (appointment && mode === "edit") {
      setFormData({
        patientId: appointment.patientId?._id || "",
        patientName: appointment.patientId?.name || "",

        doctorId: appointment.doctorId?._id || "",
        doctorName: appointment.doctorId?.name || "",

        date: appointment.date,
        time: convertTo24Hour(appointment.time),
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || "",
        cancellationReason: appointment.cancellationReason || "",
      });
    } else if (preselectedPatient) {
      setFormData({
        patientId: preselectedPatient.id,
        patientName: preselectedPatient.name,
        doctorId: "",
        doctorName: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        type: "checkup",
        status: "scheduled",
        notes: "",
        cancellationReason: "",
      });
    } else {
      setFormData({
        patientId: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        type: "checkup",
        status: "scheduled",
        notes: "",
        cancellationReason: "",
      });
    }
  }, [appointment, preselectedPatient, mode, open]);
  const handlePatientChange = (patientId: string) => {
    const selected = patients.find((p) => p._id === patientId);

    setFormData((prev) => ({
      ...prev,
      patientId,
      patientName: selected?.name || "",
    }));
  };

  const handleDoctorChange = (doctorId: string) => {
    const selected = doctors.find((d: any) => d._id === doctorId);

    setFormData((prev) => ({
      ...prev,
      doctorId,
      doctorName: selected?.name || "",
    }));
  };

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      uuid: generateUnifiedId("appointment"),
      patientId: formData.patientId,
      patientName: formData.patientName,
      doctorId: formData.doctorId,
      doctorName: formData.doctorName,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      status: formData.status,
      notes: formData.notes || undefined,
    });
    onOpenChange(false);
  };

  // start
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Schedule Appointment" : "Edit Appointment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient</Label>
            <Select
              value={formData.patientId}
              onValueChange={handlePatientChange}
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
                  <SelectItem key={patient._id} value={patient._id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={formData.doctorId} // ✅ MUST be doctorId
              onValueChange={handleDoctorChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map((doctor: any) => (
                  <SelectItem key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => {
                  const time24 = e.target.value;
                  const [hours, minutes] = time24.split(":");
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  const formattedTime = `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
                  setFormData({ ...formData, time: formattedTime });
                }}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type">Appointment Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Appointment["type"]) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {mode === "edit" && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Appointment["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional notes..."
              rows={3}
            />
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
              {mode === "add" ? "Schedule" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
