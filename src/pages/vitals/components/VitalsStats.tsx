import { Activity, TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VitalRecord } from "@/types/hospital";

function getVitalStatus(vital: VitalRecord): "normal" | "warning" | "critical" {
  if (vital.temperature > 102 || vital.bloodPressureSystolic > 160 || vital.bloodPressureDiastolic > 100 || vital.heartRate > 120 || vital.oxygenSaturation < 90) return "critical";
  if (vital.temperature > 100 || vital.bloodPressureSystolic > 140 || vital.bloodPressureDiastolic > 90 || vital.heartRate > 100 || vital.oxygenSaturation < 95) return "warning";
  return "normal";
}

interface Props { vitals: VitalRecord[] }

export function VitalsStats({ vitals }: Props) {
  const critical = vitals.filter((v) => getVitalStatus(v) === "critical").length;
  const warning = vitals.filter((v) => getVitalStatus(v) === "warning").length;
  const normal = vitals.filter((v) => getVitalStatus(v) === "normal").length;

  const stats = [
    { label: "Total Records", value: vitals.length, icon: Activity, color: "bg-primary/10 text-primary" },
    { label: "Normal", value: normal, icon: TrendingUp, color: "bg-success/10 text-success", valueClass: "text-success" },
    { label: "Warning", value: warning, icon: AlertTriangle, color: "bg-warning/10 text-warning", valueClass: "text-warning" },
    { label: "Critical", value: critical, icon: TrendingDown, color: "bg-destructive/10 text-destructive", valueClass: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.valueClass ?? ""}`}>{s.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
