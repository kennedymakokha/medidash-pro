import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Consultation } from "@/types/billing";

interface Props {
  open: boolean;
  onClose: () => void;
  consultation: Consultation | null;
  onWard: (consultation: Consultation) => void;
  onPharmacy: (consultation: Consultation) => void;
}

export function PostLabActionDialog({
  open,
  onClose,
  consultation,
  onWard,
  onPharmacy,
}: Props) {
  if (!consultation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Post Lab Decision</DialogTitle>
        </DialogHeader>

        <div className="py-4 text-sm text-muted-foreground">
          Patient has completed laboratory tests.
          <br />
          Where should the patient go next?
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={() => onWard(consultation)}
          >
            Send to Ward
          </Button>

          <Button
            onClick={() => onPharmacy(consultation)}
          >
            Send to Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}