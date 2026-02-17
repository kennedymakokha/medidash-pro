import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  uuid: string;
  patientId: string;
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: FormData;
  onChange: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

export function VitalsFormDialog({ open, onOpenChange, formData, onChange, onSubmit, isEditing }: Props) {
  const field = (key: keyof FormData, label: string, placeholder: string, type = "number", step?: string) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} type={type} step={step} placeholder={placeholder} value={formData[key]}
        onChange={(e) => onChange({ ...formData, [key]: e.target.value })} required={type === "number"} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Vital Record" : "Record New Vitals"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("temperature", "Temperature (°F)", "98.6", "number", "0.1")}
            {field("heartRate", "Heart Rate (bpm)", "72")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("bloodPressureSystolic", "BP Systolic (mmHg)", "120")}
            {field("bloodPressureDiastolic", "BP Diastolic (mmHg)", "80")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("respiratoryRate", "Respiratory Rate", "16")}
            {field("oxygenSaturation", "Oxygen Saturation (%)", "98")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("weight", "Weight (lbs) - Optional", "180")}
            {field("height", "Height (in) - Optional", "72")}
          </div>
          <div>
            <Label htmlFor="notes">Notes - Optional</Label>
            <Input id="notes" placeholder="Any observations..." value={formData.notes}
              onChange={(e) => onChange({ ...formData, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEditing ? "Update Record" : "Save Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
