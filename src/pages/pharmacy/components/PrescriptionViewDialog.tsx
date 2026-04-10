import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Prescription } from "@/types/pharmacy";

interface Props {
  open: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export function PrescriptionViewDialog({ open, onClose, prescription }: Props) {
  if (!prescription) return null;

  const total = prescription.medications.reduce(
    (sum, m) => sum + m.quantity * m.unitPrice,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prescription Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Patient:</span>
              <p className="font-medium">{prescription.patientName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Doctor:</span>
              <p className="font-medium">{prescription.doctorName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="capitalize ml-2">
                {prescription.status}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">
                {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold text-sm mb-2">Medications</h4>
            <div className="space-y-2">
              {prescription.medications.map((m, i) => (
                <div key={i} className="p-3 rounded-lg border bg-muted/30 text-sm">
                  <div className="flex justify-between">
                    <p className="font-medium">{m.medicationName}</p>
                    <span>KES {(m.quantity * m.unitPrice).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {m.dosage} • {m.frequency} • {m.duration} • Qty: {m.quantity}
                  </p>
                  {m.instructions && (
                    <p className="text-xs text-muted-foreground italic mt-1">{m.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>KES {total.toFixed(2)}</span>
          </div>

          {prescription.notes && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground">{prescription.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
