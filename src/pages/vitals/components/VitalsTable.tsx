import { Plus, MoreVertical, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/table/DataTable";
import { Visit } from "@/types/hospital";
import { cn } from "@/lib/utils";
import { timeSince } from "@/utils/timeslice";

const statusStyles = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const highlightStyles = {
  normal: "",
  warning: "text-warning font-semibold",
  critical: "text-destructive font-bold",
};

/* ---------------- VITAL SEVERITY ---------------- */

function getVitalSeverity(
  value: number,
  type: "temp" | "sys" | "dia" | "hr" | "spo2"
) {
  switch (type) {
    case "temp":
      if (value < 34 || value > 38.5) return "critical";
      if (value < 36.1 || value > 37.5) return "warning";
      return "normal";

    case "sys":
      if (value < 90 || value >= 160) return "critical";
      if (value < 100 || value >= 140) return "warning";
      return "normal";

    case "dia":
      if (value >= 100) return "critical";
      if (value >= 90) return "warning";
      return "normal";

    case "hr":
      if (value < 50 || value > 120) return "critical";
      if (value < 60 || value > 100) return "warning";
      return "normal";

    case "spo2":
      if (value < 90) return "critical";
      if (value < 95) return "warning";
      return "normal";

    default:
      return "normal";
  }
}

/* ---------------- EARLY WARNING SCORE ---------------- */

function calculateEWS(vital: VitalRecord) {
  let score = 0;

  const temp = vital.temperature;
  const hr = vital.heartRate;
  const sys = vital.bloodPressureSystolic;
  const spo2 = vital.oxygenSaturation;

  if (temp < 34 || temp > 38) score += 3;
  else if (temp >= 34 && temp < 35) score += 2;
  else if (temp < 36.1 || temp > 37.5) score += 1;

  if (hr < 50 || hr > 130) score += 3;
  else if (hr > 110) score += 2;
  else if (hr < 60 || hr > 100) score += 1;

  if (sys < 90 || sys >= 180) score += 3;
  else if (sys >= 140) score += 2;
  else if (sys < 100) score += 1;

  if (spo2 < 90) score += 3;
  else if (spo2 <= 92) score += 2;
  else if (spo2 <= 94) score += 1;

  return score;
}

function getEWSStatus(score: number): "normal" | "warning" | "critical" {
  if (score >= 5) return "critical";
  if (score >= 3) return "warning";
  return "normal";
}

/* ---------------- TYPES ---------------- */

interface Props {
  visits: Visit[];
  search: string;
  filter: string;
  onSearchChange: (v: string) => void;
  onRecord: (v: Visit) => void;
  onView: (v: Visit) => void;
  onEdit: (v: Visit) => void;
}

/* ---------------- COMPONENT ---------------- */

export function VitalsTable({
  visits,
  search,
  onSearchChange,
  onRecord,
  onView,
  onEdit,
}: Props) {
  const normalized = visits?.map((v) => {
    const [sys, dia] = (v.bp ?? "0/0").split("/").map(Number);
    return {
      ...v,
      bloodPressureSystolic: sys || 0,
      bloodPressureDiastolic: dia || 0,
    };
  });

  return (
    <DataTable
      title="Vital Records"
      search={search}
      onSearchChange={onSearchChange}
      columns={
        <tr>
          <th className="px-4 py-3 text-left">Patient</th>
          <th className="px-4 py-3 text-left">Recorded</th>
          <th className="px-4 py-3 text-left">Temp (°C)</th>
          <th className="px-4 py-3 text-left">BP</th>
          <th className="px-4 py-3 text-left">HR</th>
          <th className="px-4 py-3 text-left">RR</th>
          <th className="px-4 py-3 text-left">SpO₂</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      }
      rows={
        visits.length === 0 ? (
          <tr>
            <td colSpan={9} className="text-center py-8 text-muted-foreground">
              No vital records found
            </td>
          </tr>
        ) : (
          normalized.map((vital) => {
            const tempStatus = getVitalSeverity(vital?.temperature, "temp");
            const sysStatus = getVitalSeverity(
              vital.bloodPressureSystolic,
              "sys"
            );
            const diaStatus = getVitalSeverity(
              vital.bloodPressureDiastolic,
              "dia"
            );
            const hrStatus = getVitalSeverity(vital.heartRate, "hr");
            const spo2Status = getVitalSeverity(
              vital.oxygenSaturation,
              "spo2"
            );

            const bpStatus =
              sysStatus === "critical" || diaStatus === "critical"
                ? "critical"
                : sysStatus === "warning" || diaStatus === "warning"
                ? "warning"
                : "normal";

            const score = calculateEWS(vital);
            const status = getEWSStatus(score);

            return (
              <tr
                key={vital.id ?? vital._id}
                className={cn(
                  "hover:bg-muted/50",
                  status === "critical" && "bg-destructive/5"
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {vital?.patientMongoose?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {vital?.created_by?.name}
                  </p>
                </td>

                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {timeSince(vital.createdAt)}
                </td>

                <td className={cn("px-4 py-3", highlightStyles[tempStatus])}>
                  {vital.temperature}
                </td>

                <td className={cn("px-4 py-3", highlightStyles[bpStatus])}>
                  {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                </td>

                <td className={cn("px-4 py-3", highlightStyles[hrStatus])}>
                  {vital.heartRate}
                </td>

                <td className="px-4 py-3">
                  {vital.respiratoryRate}
                </td>

                <td className={cn("px-4 py-3", highlightStyles[spo2Status])}>
                  {vital.oxygenSaturation}%
                </td>

                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", statusStyles[status])}
                  >
                    {status} ({score})
                  </Badge>
                </td>

                <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                  <Button
                    onClick={() => onRecord(vital)}
                    className="gap-2"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    Record Vitals
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(vital)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onEdit(vital)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })
        )
      }
    />
  );
}