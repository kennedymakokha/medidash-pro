// ConsultationFormDialog.tsx
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { Consultation, LabTest } from "@/types/billing";

export type ConsultationFormData = {
  uuid: string;
  patientId?: string;
  patientMongoose?: string;
  chiefComplaint: string;
  symptoms: string;
  prescribedTests: LabTest[];
  notes: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: ConsultationFormData | null;
  labTests: LabTest[];
  onSubmit: (data: ConsultationFormData, totalFee: number) => Promise<void>;
 
};

export function ConsultationFormDialog({
  open,
  onClose,
  initialData,
  labTests,
  onSubmit,
  
}: Props) {
  const [formData, setFormData] = useState<ConsultationFormData>({
    uuid: "",
    chiefComplaint: "",
    symptoms: "",
    prescribedTests: [],
    
    notes: "",
  });

  const [search, setSearch] = useState("");
  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const total = formData.prescribedTests.reduce(
      (sum, t) => sum + (t.price || 0),
      0,
    );
    setTotalFee(total);
  }, [formData.prescribedTests]);

  const filteredTests =
    search.length > 0
      ? labTests.filter((t) =>
          t.testName.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, totalFee);
    onClose();
  };

  console.log(formData);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Consultation" : "New Consultation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Chief Complaint</Label>
            <Textarea
              value={formData.chiefComplaint}
              onChange={(e) =>
                setFormData({ ...formData, chiefComplaint: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Symptoms</Label>
            <Input
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              placeholder="fever, headache"
            />
          </div>

          <div>
            <Label>Prescribed Tests</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {formData.prescribedTests.length
                    ? formData.prescribedTests.map((t) => t.testName).join(", ")
                    : "Search & select tests"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search tests..."
                    value={search}
                    onValueChange={setSearch}
                  />

                  {search.length > 0 && (
                    <>
                      {filteredTests.length === 0 ? (
                        <CommandEmpty>No tests found</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredTests.map((test) => {
                            const checked = formData.prescribedTests.some(
                              (t) => t._id === test._id,
                            );

                            return (
                              <CommandItem
                                key={test._id}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    prescribedTests: checked
                                      ? prev.prescribedTests.filter(
                                          (t) => t._id !== test._id,
                                        )
                                      : [...prev.prescribedTests, test],
                                  }));
                                }}
                                className="flex justify-between"
                              >
                                {test.testName}
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
              Total Lab Fee: <b>Ksh  {totalFee}</b>
            </p>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
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
