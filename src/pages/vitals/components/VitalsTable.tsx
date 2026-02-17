import { Plus, MoreVertical, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/table/DataTable";
import { VitalRecord } from "@/types/hospital";
import { cn } from "@/lib/utils";
import { timeSince } from "@/utils/timeslice";

const statusStyles = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

function getVitalStatus(vital: any): "normal" | "warning" | "critical" {
  if (vital.temperature > 102 || vital.bloodPressureSystolic > 160 || vital.bloodPressureDiastolic > 100 || vital.heartRate > 120 || vital.oxygenSaturation < 90) return "critical";
  if (vital.temperature > 100 || vital.bloodPressureSystolic > 140 || vital.bloodPressureDiastolic > 90 || vital.heartRate > 100 || vital.oxygenSaturation < 95) return "warning";
  return "normal";
}

interface Props {
  visits: any[];
  search: string;
  onSearchChange: (v: string) => void;
  onRecord: (v: any) => void;
  onView: (v: any) => void;
  onEdit: (v: any) => void;
}

export function VitalsTable({ visits, search, onSearchChange, onRecord, onView, onEdit }: Props) {
  const normalized = visits?.map((v) => {
    const [sys, dia] = (v.bp ?? "/").split("/").map(Number);
    return { ...v, bloodPressureSystolic: sys || 0, bloodPressureDiastolic: dia || 0 };
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
          <th className="px-4 py-3 text-left">Temp (°F)</th>
          <th className="px-4 py-3 text-left">BP</th>
          <th className="px-4 py-3 text-left">HR</th>
          <th className="px-4 py-3 text-left">RR</th>
          <th className="px-4 py-3 text-left">SpO2</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      }
      rows={
        visits.length === 0 ? (
          <tr>
            <td colSpan={9} className="text-center py-8 text-muted-foreground">No vital records found</td>
          </tr>
        ) : (
          normalized.map((vital) => {
            const status = getVitalStatus(vital);
            return (
              <tr key={vital.id ?? vital._id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{vital?.patientMongoose?.name}</p>
                  <p className="text-xs text-muted-foreground">by {vital?.created_by?.name}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{timeSince(vital.createdAt)}</td>
                <td className={cn("px-4 py-3", vital.temperature > 100 && "text-warning font-medium")}>{vital.temperature}</td>
                <td className={cn("px-4 py-3", (vital.bloodPressureSystolic > 140 || vital.bloodPressureDiastolic > 90) && "text-warning font-medium")}>
                  {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                </td>
                <td className={cn("px-4 py-3", vital.heartRate > 100 && "text-warning font-medium")}>{vital.heartRate}</td>
                <td className="px-4 py-3">{vital.respiratoryRate}</td>
                <td className={cn("px-4 py-3", vital.oxygenSaturation < 95 && "text-warning font-medium")}>{vital.oxygenSaturation}%</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn("capitalize", statusStyles[status])}>{status}</Badge>
                </td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                  <Button onClick={() => onRecord(vital)} className="gap-2" size="sm">
                    <Plus className="w-4 h-4" /> Record Vitals
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(vital)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(vital)}><Edit className="w-4 h-4 mr-2" />Edit Record</DropdownMenuItem>
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
