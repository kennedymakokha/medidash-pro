// MedicationFormDialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { Medication } from "@/types/pharmacy";

export type MedicationFormData = {
  uuid: string;
  patientId?: string;
  patientMongoose?: string;
  prescribedMedications: Medication[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: MedicationFormData | null;
  medications: Medication[];
  onSubmit: (data: MedicationFormData, totalFee: number) => Promise<void>;
};

export function MedicationFormDialog({
  open,
  onClose,
  initialData,
  medications,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<MedicationFormData>({
    uuid: "",
    prescribedMedications: [],
  });

  const [search, setSearch] = useState("");
  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const total = formData.prescribedMedications.reduce(
      (sum, m) => sum + (m.unitPrice || 0),
      0,
    );
    setTotalFee(total);
  }, [formData.prescribedMedications]);

  const filteredMeds =
    search.length > 0
      ? medications.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, totalFee);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Medications" : "Prescribe Medications"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Medications</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {formData.prescribedMedications.length
                    ? formData.prescribedMedications.map((m) => m.name).join(", ")
                    : "Search & select medications"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search medications..."
                    value={search}
                    onValueChange={setSearch}
                  />

                  {search.length > 0 && (
                    <>
                      {filteredMeds.length === 0 ? (
                        <CommandEmpty>No medications found</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredMeds.map((med) => {
                            const checked = formData.prescribedMedications.some(
                              (m) => m._id === med._id,
                            );

                            return (
                              <CommandItem
                                key={med._id}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    prescribedMedications: checked
                                      ? prev.prescribedMedications.filter(
                                          (m) => m._id !== med._id,
                                        )
                                      : [...prev.prescribedMedications, med],
                                  }));
                                }}
                                className="flex justify-between"
                              >
                                {med.name}
                                {checked && <Check className="h-4 w-4" />}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-muted-foreground mt-1">
              Total Medication Fee: <b>Ksh {totalFee}</b>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
