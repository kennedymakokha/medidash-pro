import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

export type PrescribedMedication = {
  _id: string;
  name: string;
  unitPrice?: number;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
};

export type MedicationFormData = {
  uuid: string;
  patientId?: string;
  patientMongoose?: string;
  prescribedMedications: PrescribedMedication[];
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
      (sum, m) => sum + (m.unitPrice || 0) * (m.quantity || 1),
      0
    );
    setTotalFee(total);
  }, [formData.prescribedMedications]);

  const filteredMeds =
    search.length > 0
      ? medications.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const handleAddMedication = (med: Medication) => {
    setFormData((prev) => {
      if (prev.prescribedMedications.some((m) => m._id === med._id)) {
        return prev; // prevent duplicates
      }

      return {
        ...prev,
        prescribedMedications: [
          ...prev.prescribedMedications,
          {
            _id: med._id,
            name: med.name,
            unitPrice: med.unitPrice,
            dosage: "",
            frequency: "",
            duration: "",
            quantity: 1,
            instructions: "",
          },
        ],
      };
    });
  };

  const updateMedication = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.prescribedMedications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prescribedMedications: updated };
    });
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prescribedMedications: prev.prescribedMedications.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.prescribedMedications.length === 0) {
      alert("Add at least one medication");
      return;
    }

    await onSubmit(formData, totalFee);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Prescription" : "New Prescription"}
          </DialogTitle>
          <DialogDescription>
            Add medications, dosage, frequency, and duration for this patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Picker */}
          <div>
            <Label>Add Medication</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  Search medications...
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search..."
                    value={search}
                    onValueChange={setSearch}
                  />

                  {search.length > 0 && (
                    <>
                      {filteredMeds.length === 0 ? (
                        <CommandEmpty>No results</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredMeds.map((med) => {
                            const checked = formData.prescribedMedications.some(
                              (m) => m._id === med._id
                            );

                            return (
                              <CommandItem
                                key={med._id}
                                onSelect={() => handleAddMedication(med)}
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
          </div>

          {/* Prescription List */}
          <div className="space-y-4">
            {formData.prescribedMedications.map((med, index) => (
              <div
                key={med._id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{med.name}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeMedication(index)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <input
                    placeholder="Dosage"
                    className="input"
                    value={med.dosage}
                    onChange={(e) =>
                      updateMedication(index, "dosage", e.target.value)
                    }
                  />
                  <input
                    placeholder="Frequency"
                    className="input"
                    value={med.frequency}
                    onChange={(e) =>
                      updateMedication(index, "frequency", e.target.value)
                    }
                  />
                  <input
                    placeholder="Duration"
                    className="input"
                    value={med.duration}
                    onChange={(e) =>
                      updateMedication(index, "duration", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    className="input"
                    value={med.quantity}
                    onChange={(e) =>
                      updateMedication(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <input
                  placeholder="Instructions (optional)"
                  className="input w-full"
                  value={med.instructions}
                  onChange={(e) =>
                    updateMedication(index, "instructions", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          {/* Total */}
          <p className="text-sm">
            Total Fee: <b>Ksh {totalFee}</b>
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Prescription</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}