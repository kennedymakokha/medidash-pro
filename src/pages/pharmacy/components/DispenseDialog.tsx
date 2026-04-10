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
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Prescription, PrescriptionItem } from "@/types/pharmacy";

interface Props {
  open: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  onSubmit: (prescriptionId: string, items: PrescriptionItem[]) => void;
}

export function DispenseDialog({ open, onClose, prescription, onSubmit }: Props) {
  const [items, setItems] = useState<PrescriptionItem[]>([]);

  useEffect(() => {
    if (prescription) {
      setItems(
        prescription.medications.map((m) => ({
          ...m,
          dispensedQuantity: m.quantity,
        }))
      );
    }
  }, [prescription]);

  if (!prescription) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.dispensedQuantity || 0) * item.unitPrice,
    0
  );

  const updateQty = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, dispensedQuantity: Math.min(qty, item.quantity) } : item
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispense Medication</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Patient: <strong>{prescription.patientName}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Doctor: <strong>{prescription.doctorName}</strong>
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{item.medicationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.dosage} • {item.frequency} • {item.duration}
                  </p>
                  {item.instructions && (
                    <p className="text-xs text-muted-foreground italic mt-1">{item.instructions}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  KES {item.unitPrice}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs">Qty to dispense:</Label>
                <Input
                  type="number"
                  min={0}
                  max={item.quantity}
                  value={item.dispensedQuantity || 0}
                  onChange={(e) => updateQty(idx, Number(e.target.value))}
                  className="w-20 h-8"
                />
                <span className="text-xs text-muted-foreground">/ {item.quantity} prescribed</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="font-semibold">Total: KES {totalAmount.toFixed(2)}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(prescription._id || prescription.id || "", items)}>
            Confirm Dispense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
