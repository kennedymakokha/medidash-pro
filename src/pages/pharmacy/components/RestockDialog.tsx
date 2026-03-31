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
import { useState, useEffect } from "react";
import { Medication } from "@/types/pharmacy";

interface Props {
  open: boolean;
  onClose: () => void;
  medication: Medication | null;
  onSubmit: (data: { medicationId: string; quantity: number; supplier: string; batchNumber: string; unitCost: number }) => void;
}

export function RestockDialog({ open, onClose, medication, onSubmit }: Props) {
  const [form, setForm] = useState({
    quantity: 0,
    supplier: "",
    batchNumber: "",
    unitCost: 0,
  });

  useEffect(() => {
    if (open) {
      setForm({ quantity: 0, supplier: "", batchNumber: "", unitCost: medication?.unitPrice || 0 });
    }
  }, [open, medication]);

  if (!medication) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      medicationId: medication._id || medication.id || "",
      ...form,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restock: {medication.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Current stock: <strong>{medication.quantityInStock}</strong> units
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Quantity to Add</Label>
            <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Unit Cost</Label>
              <Input type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Restock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
