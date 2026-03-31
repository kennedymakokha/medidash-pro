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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Medication } from "@/types/pharmacy";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Medication>) => void;
  initialData?: Medication | null;
}

const categories: Medication["category"][] = [
  "tablet", "capsule", "syrup", "injection", "cream", "drops", "inhaler", "other",
];

export function MedicationFormDialog({ open, onClose, onSubmit, initialData }: Props) {
  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "tablet" as Medication["category"],
    dosageForm: "",
    strength: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    quantityInStock: 0,
    reorderLevel: 10,
    unitPrice: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        genericName: initialData.genericName || "",
        category: initialData.category || "tablet",
        dosageForm: initialData.dosageForm || "",
        strength: initialData.strength || "",
        manufacturer: initialData.manufacturer || "",
        batchNumber: initialData.batchNumber || "",
        expiryDate: initialData.expiryDate?.split("T")[0] || "",
        quantityInStock: initialData.quantityInStock || 0,
        reorderLevel: initialData.reorderLevel || 10,
        unitPrice: initialData.unitPrice || 0,
      });
    } else {
      setForm({
        name: "", genericName: "", category: "tablet", dosageForm: "",
        strength: "", manufacturer: "", batchNumber: "", expiryDate: "",
        quantityInStock: 0, reorderLevel: 10, unitPrice: 0,
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Medication" : "Add Medication"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Generic Name</Label>
              <Input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Medication["category"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Strength</Label>
              <Input value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} placeholder="e.g. 500mg" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dosage Form</Label>
              <Input value={form.dosageForm} onChange={(e) => setForm({ ...form, dosageForm: e.target.value })} placeholder="e.g. Oral" />
            </div>
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={form.quantityInStock} onChange={(e) => setForm({ ...form, quantityInStock: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Unit Price</Label>
              <Input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? "Update" : "Add Medication"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
