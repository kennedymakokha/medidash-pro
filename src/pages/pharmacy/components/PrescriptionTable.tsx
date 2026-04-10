import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle } from "lucide-react";
import { Prescription } from "@/types/pharmacy";

interface Props {
  prescriptions: Prescription[];
  onView: (rx: Prescription) => void;
  onDispense: (rx: Prescription) => void;
}

const statusVariant = (status: Prescription["status"]) => {
  switch (status) {
    case "pending": return "secondary";
    case "dispensed": return "default";
    case "partially-dispensed": return "outline";
    case "cancelled": return "destructive";
    default: return "default";
  }
};

export function PrescriptionTable({ prescriptions, onView, onDispense }: Props) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead className="hidden md:table-cell">Doctor</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No prescriptions found
              </TableCell>
            </TableRow>
          ) : (
            prescriptions.map((rx) => (
              <TableRow key={rx._id || rx.id}>
                <TableCell className="font-medium">{rx.patientName}</TableCell>
                <TableCell className="hidden md:table-cell">{rx.doctorName}</TableCell>
                <TableCell>{rx.medications.length} item(s)</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(rx.status)} className="capitalize text-xs">
                    {rx.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onView(rx)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {rx.status === "pending" && (
                      <Button size="icon" variant="ghost" onClick={() => onDispense(rx)} title="Dispense">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
