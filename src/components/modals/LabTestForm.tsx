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
import { LabTest } from "@/types/billing";

interface LabFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab?: LabTest | null;
  onSubmit: (lab: LabTest) => void;
  mode: "add" | "edit";
}

const createDefaultForm = (): LabTest => ({
  uuid: generateUnifiedId("labtest"),
  testName: "",
  category: "blood",
  description: "",
  price: 0,
  turnaroundTime: "",
  requiresFasting: false,
  status: "active",
});

export function LabFormModal({
  open,
  onOpenChange,
  lab,
  onSubmit,

  mode,
}: LabFormModalProps) {
  const [formData, setFormData] = useState<LabTest>(createDefaultForm);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && lab) {
      setFormData(lab);
    } else {
      setFormData(createDefaultForm());
    }
  }, [open, mode, lab]);

  const updateField = <K extends keyof LabTest>(
    key: K,
    value: LabTest[K]
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
          {/* Test Name */}
          <div className="space-y-2">
            <Label>Test Name</Label>
            <Input
              value={formData.testName}
              onChange={(e) => updateField("testName", e.target.value)}
              placeholder="e.g., Complete Blood Count"
              required
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  updateField("category", v as LabTest["category"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood</SelectItem>
                  <SelectItem value="urine">Urine</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  updateField("price", Number(e.target.value))
                }
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Brief description..."
            />
          </div>

          {/* Turnaround & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Turnaround Time</Label>
              <Input
                value={formData.turnaroundTime}
                onChange={(e) =>
                  updateField("turnaroundTime", e.target.value)
                }
                placeholder="e.g., 2–4 hours"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  updateField("status", v as LabTest["status"])
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

          {/* Requires Fasting */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="fasting">Requires Fasting</Label>
            <Switch
              id="fasting"
              checked={formData.requiresFasting}
              onCheckedChange={(checked) =>
                updateField("requiresFasting", checked)
              }
            />
          </div>

          {/* Actions */}
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
