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

import { useFetchwardsoverviewsQuery } from "@/features/wordSlice";
import { useDebounce } from "@/hooks/use-debounce";
import { BedData, WardData } from "@/types/hospital";

interface bedFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bed?: BedData | null;
  onSubmit: (bed: BedData) => void;
  mode: "add" | "edit";
}

const createDefaultForm = (): BedData => ({
  uuid: generateUnifiedId("bed"),
  ward: "", // ✅ extract ID
  status: "available",
});

export function BedFormModal({
  open,
  onOpenChange,
  bed,
  onSubmit,

  mode,
}: bedFormModalProps) {
  const [formData, setFormData] = useState<BedData>(createDefaultForm);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && bed) {
      setFormData(bed);
    } else {
      setFormData(createDefaultForm());
    }
  }, [open, mode, bed]);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const { data: wards, refetch: refetchWards } = useFetchwardsoverviewsQuery({
    page,
    limit,

    search: debouncedSearch,
  });
  const updateField = <K extends keyof BedData>(key: K, value: BedData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const MockWards: WardData[] = wards !== undefined ? wards.data : [];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ward === "") {
      
      return;}
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          {mode === "add" ? "Add Lab Test" : "Edit Lab Test"}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ward</Label>

              <Select
                value={formData.ward}
                onValueChange={(v) => setFormData({ ...formData, ward: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {MockWards.map((item: WardData) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.wardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "add" ? "Add Lab Test" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
