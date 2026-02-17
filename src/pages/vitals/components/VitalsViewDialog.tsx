import { Activity, Heart, Thermometer, Wind, Droplets } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VitalRecord } from "@/types/hospital";
import { cn } from "@/lib/utils";

const statusStyles = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

function getVitalStatus(vital: VitalRecord): "normal" | "warning" | "critical" {
  if (vital.temperature > 102 || vital.bloodPressureSystolic > 160 || vital.bloodPressureDiastolic > 100 || vital.heartRate > 120 || vital.oxygenSaturation < 90) return "critical";
  if (vital.temperature > 100 || vital.bloodPressureSystolic > 140 || vital.bloodPressureDiastolic > 90 || vital.heartRate > 100 || vital.oxygenSaturation < 95) return "warning";
  return "normal";
}

interface Props { vital: VitalRecord | null; onClose: () => void }

export function VitalsViewDialog({ vital, onClose }: Props) {
  if (!vital) return null;
  const status = getVitalStatus(vital);

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
              <p className="font-semibold">{vital.patientName}</p>
              <p className="text-sm text-muted-foreground">{vital.recordedAt}</p>
            </div>
            <Badge variant="outline" className={cn("ml-auto capitalize", statusStyles[status])}>{status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {metricCard(<Thermometer className="w-4 h-4" />, "Temperature", `${vital.temperature}°F`)}
            {metricCard(<Heart className="w-4 h-4" />, "Heart Rate", `${vital.heartRate} bpm`)}
            {metricCard(<Droplets className="w-4 h-4" />, "Blood Pressure", `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`)}
            {metricCard(<Wind className="w-4 h-4" />, "Respiratory Rate", `${vital.respiratoryRate}/min`)}
          </div>
          {metricCard(<Activity className="w-4 h-4" />, "Oxygen Saturation", `${vital.oxygenSaturation}%`)}
          {(vital.weight || vital.height) && (
            <div className="grid grid-cols-2 gap-4">
              {vital.weight && <div className="p-3 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">Weight</span><p className="font-semibold">{vital.weight} lbs</p></div>}
              {vital.height && <div className="p-3 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">Height</span><p className="font-semibold">{vital.height} in</p></div>}
            </div>
          )}
          {vital.notes && <div className="p-3 rounded-lg bg-muted/50"><span className="text-xs text-muted-foreground">Notes</span><p className="text-sm mt-1">{vital.notes}</p></div>}
          <div className="text-sm text-muted-foreground">Recorded by: {vital?.vitalsNurseId?.name}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
