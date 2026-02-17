import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  scanning: boolean;
  fingerprintData: string | null;
  onScan: () => void;
}

export function FingerprintSection({ scanning, fingerprintData, onScan }: Props) {
  return (
    <div className="bg-muted/40 p-4 rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Biometric Registration</Label>
        <Button type="button" onClick={onScan} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan Fingerprint"}
        </Button>
      </div>
      {fingerprintData && (
        <div className="text-xs bg-background p-2 rounded border max-h-32 overflow-auto">
          <pre>{fingerprintData}</pre>
        </div>
      )}
    </div>
  );
}
