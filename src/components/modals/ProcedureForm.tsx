import { useEffect, useState } from "react";

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
import { Switch } from "@/components/ui/switch";

import { generateUnifiedId } from "@/utils/culculateAge";
import { Procedure } from "@/types/billing";

interface ProcedureFodalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Procedure | null;
  onSubmit: (lab: Procedure) => void;
  mode: "add" | "edit";
}

const createDefaultForm = (): Procedure => ({
  uuid: generateUnifiedId("Procedure"),
  procedureName: "",
  category: "minor",
  description: "",
  price: 0,
  duration: "",
  requiresAnesthesia: false,
  status: "active",
});

export function ProcedureFormModal({
  open,
  onOpenChange,
  data,
  onSubmit,

  mode,
}: ProcedureFodalProps) {
  const [formData, setFormData] = useState<Procedure>(createDefaultForm);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && data) {
      setFormData(data);
    } else {
      setFormData(createDefaultForm());
    }
  }, [open, mode, data]);

  const updateField = <K extends keyof Procedure>(
    key: K,
    value: Procedure[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Lab Test" : "Edit Lab Test"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Procedure Name</Label>
            <Input
              value={formData.procedureName}
              onChange={(e) => updateField("procedureName", e.target.value)}
              placeholder="e.g., ECG/EKG"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  updateField("category", v as Procedure["category"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="therapeutic">Therapeutic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={formData.price}
                     onChange={(e) =>
                  updateField("price", Number(e.target.value))
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
               onChange={(e) => updateField("description", e.target.value)}

              placeholder="Brief description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  updateField("duration", v as Procedure["duration"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 min">15 Minutes</SelectItem>
                  <SelectItem value="30 Min">30 Min</SelectItem>
                  <SelectItem value="45 Min">45 Min</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hour">2 hour</SelectItem>
                  <SelectItem value="3 hour">3 hour</SelectItem>
                </SelectContent>
              </Select>
             
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  updateField("status", v as Procedure["status"])
                }
                >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="anesthesia" className="cursor-pointer">
              Requires Anesthesia
            </Label>
            <Switch
              id="anesthesia"
              checked={formData.requiresAnesthesia}
              onCheckedChange={(checked) =>
                updateField("requiresAnesthesia", checked)
              }
             
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
             onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
                {mode === "add" ? "Add Lab Test" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
