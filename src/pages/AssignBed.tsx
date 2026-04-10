import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bed, User, Search, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useFetchpatientsQuery } from "@/features/patientSlice";
import { useFetchbedsQuery, useAssignBedMutation } from "@/features/bedSlice";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignBedPage() {
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [notes, setNotes] = useState("");
  const debouncedSearch = useDebounce(patientSearch, 400);

  const { data: patientsData, isLoading: patientsLoading } = useFetchpatientsQuery({
    page: 1, limit: 100, search: debouncedSearch, status: "", track: "", billing: "",
  });
  const { data: bedsData, isLoading: bedsLoading, refetch: refetchBeds } = useFetchbedsQuery({
    page: 1, limit: 1000, search: "",
  });
  const [assignBed, { isLoading: assigning }] = useAssignBedMutation();

  const patients = patientsData?.data ?? [];
  const beds = (bedsData?.data ?? []).filter((b: any) => b.status === "available");
  const selectedPatient = patients.find((p: any) => (p._id || p.id || p.uuid) === selectedPatientId);
  const selectedBed = beds.find((b: any) => (b._id || b.id || b.uuid) === selectedBedId);

  const handleAssign = async () => {
    if (!selectedPatientId || !selectedBedId) return;
    try {
      await assignBed({
        patientId: selectedPatientId,
        bedId: selectedBedId,
        notes,
      }).unwrap();
      toast({ title: "Bed Assigned", description: `Patient has been assigned to bed successfully.` });
      setSelectedPatientId("");
      setSelectedBedId("");
      setNotes("");
      refetchBeds();
    } catch {
      toast({ title: "Error", description: "Failed to assign bed.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Assign Bed" subtitle="Assign a patient to an available bed">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Select Patient */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
              Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-9"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {patientsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))
              ) : patients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No patients found</p>
              ) : (
                patients.map((patient: any) => {
                  const pid = patient._id || patient.id || patient.uuid;
                  const isSelected = pid === selectedPatientId;
                  return (
                    <button
                      key={pid}
                      onClick={() => setSelectedPatientId(pid)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.uuid} • {patient.sex}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{patient.status}</Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Bed */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
              Select Available Bed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {beds.length} bed{beds.length !== 1 ? "s" : ""} available
            </p>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {bedsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))
              ) : beds.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No available beds</p>
              ) : (
                beds.map((bed: any) => {
                  const bid = bed._id || bed.id || bed.uuid;
                  const isSelected = bid === selectedBedId;
                  return (
                    <button
                      key={bid}
                      onClick={() => setSelectedBedId(bid)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                          <Bed className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{bed.bedNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {bed.ward?.wardName || bed.ward} • {bed.ward?.type || "General"}
                          </p>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Confirm */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
              Confirm Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient && selectedBed ? (
              <>
                <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{selectedPatient.name}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">
                      {selectedBed.bedNumber} — {selectedBed.ward?.wardName || selectedBed.ward}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Notes (optional)</Label>
                  <Textarea
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleAssign}
                  disabled={assigning}
                >
                  {assigning ? "Assigning..." : "Assign Bed"}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Bed className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a patient and a bed to continue
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
