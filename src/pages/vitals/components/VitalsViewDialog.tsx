import { Activity, Heart, Thermometer, Wind, Droplets } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

function getVitalStatus(vital: any): "normal" | "warning" | "critical" {
  const temp = Number(vital.temperature) || 0;
  const sys = Number(vital.bloodPressureSystolic) || 0;
  const dia = Number(vital.bloodPressureDiastolic) || 0;
  const hr = Number(vital.heartRate ?? vital.pulse) || 0;
  const spo2 = Number(vital.oxygenSaturation) || 0;
  if (temp > 102 || sys > 160 || dia > 100 || hr > 120 || spo2 < 90) return "critical";
  if (temp > 100 || sys > 140 || dia > 90 || hr > 100 || spo2 < 95) return "warning";
  return "normal";
}

interface Props { vital: any | null; onClose: () => void }

export function VitalsViewDialog({ vital, onClose }: Props) {
  if (!vital) return null;
  const status = getVitalStatus(vital);
  const [sys, dia] = (vital.bp ?? "0/0").split("/").map(Number);

  const metricCard = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}<span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );

  return (
    <Dialog open={!!vital} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Vital Details</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{vital?.patientMongoose?.name ?? vital.patientName}</p>
              <p className="text-sm text-muted-foreground">{vital.recordedAt ?? vital.createdAt}</p>
            </div>
            <Badge variant="outline" className={cn("ml-auto capitalize", statusStyles[status])}>{status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {metricCard(<Thermometer className="w-4 h-4" />, "Temperature", `${vital.temperature}°C`)}
            {metricCard(<Heart className="w-4 h-4" />, "Heart Rate", `${vital.heartRate ?? vital.pulse} bpm`)}
            {metricCard(<Droplets className="w-4 h-4" />, "Blood Pressure", `${sys}/${dia}`)}
            {metricCard(<Wind className="w-4 h-4" />, "Respiratory Rate", `${vital.respiratoryRate}/min`)}
          </div>
          {metricCard(<Activity className="w-4 h-4" />, "Oxygen Saturation", `${vital.oxygenSaturation}%`)}
          {(vital.weight || vital.height) && (
            <div className="grid grid-cols-2 gap-4">
              {vital.weight && <div className="p-3 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">Weight</span><p className="font-semibold">{vital.weight} kg</p></div>}
              {vital.height && <div className="p-3 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">Height</span><p className="font-semibold">{vital.height} cm</p></div>}
            </div>
          )}
          {vital.notes && <div className="p-3 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">Notes</span><p className="text-sm mt-1">{vital.notes}</p></div>}
          <div className="text-sm text-muted-foreground">Recorded by: {vital?.vitalsNurseId?.name ?? vital?.created_by?.name}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
