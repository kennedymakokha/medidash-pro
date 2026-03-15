import {
  Activity,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VitalRecord } from "@/types/hospital";

/* ---------------- EARLY WARNING SCORE ---------------- */

export function calculateEWS(vital: VitalRecord) {
  let score = 0;

  const temp = vital.temperature;
  const hr = vital.heartRate;
  const sys = vital.bloodPressureSystolic;
  const spo2 = vital.oxygenSaturation;

  // TEMPERATURE
  if (temp < 34 || temp > 38) score += 3;
  else if (temp >= 34 && temp < 35) score += 2;
  else if (temp < 36.1 || temp > 37.5) score += 1;

  // HEART RATE
  if (hr < 50 || hr > 130) score += 3;
  else if (hr > 110) score += 2;
  else if (hr < 60 || hr > 100) score += 1;

  // SYSTOLIC BP
  if (sys < 90 || sys >= 180) score += 3;
  else if (sys >= 140) score += 2;
  else if (sys < 100) score += 1;

  // OXYGEN
  if (spo2 < 90) score += 3;
  else if (spo2 <= 92) score += 2;
  else if (spo2 <= 94) score += 1;

  return score;
}

export function getEWSStatus(score: number): "normal" | "warning" | "critical" {
  if (score >= 5) return "critical";
  if (score >= 3) return "warning";
  return "normal";
}

/* ---------------- COMPONENT ---------------- */

interface Props {
  vitals: VitalRecord[];
  setFilter: (arg: string) => void;
}

export function VitalsStats({ vitals, setFilter }: Props) {
  const statuses = vitals.map((v) => getEWSStatus(calculateEWS(v)));

  const critical = statuses.filter((s) => s === "critical").length;
  const warning = statuses.filter((s) => s === "warning").length;
  const normal = statuses.filter((s) => s === "normal").length;

  const stats = [
    {
      label: "Total Records",
      value: vitals.length,
      icon: Activity,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Normal",
      value: normal,
      icon: TrendingUp,
      color: "bg-success/10 text-success",
      valueClass: "text-success",
    },
    {
      label: "Warning",
      value: warning,
      icon: AlertTriangle,
      color: "bg-warning/10 text-warning",
      valueClass: "text-warning",
    },
    {
      label: "Critical",
      value: critical,
      icon: TrendingDown,
      color: "bg-destructive/10 text-destructive",
      valueClass: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent
            onClick={() =>
              setFilter(
                s.label === "Total Records"
                  ? "all"
                  : s.label.toLowerCase()
              )
            }
            className="p-4 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.valueClass ?? ""}`}>
                  {s.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}