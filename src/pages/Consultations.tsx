import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Stethoscope,
  TestTube,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  ArrowRight,
  User,
  ClipboardList,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Consultation, LabTest } from "@/types/billing";
import { mockDepartments, mockPatients, mockDoctors } from "@/data/mockData";
import { useFetchpatientsQuery } from "@/features/patientSlice";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useFetchlabsoverviewsQuery } from "@/features/labTestSlice";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useCreatevisitMutation } from "@/features/visitsSlice";

const stageStyles = {
  "pre-lab": {
    bg: "bg-info/10",
    text: "text-info",
    border: "border-info/20",
    label: "Pre-Lab",
  },
  "awaiting-lab": {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
    label: "Awaiting Lab",
  },
  "post-lab": {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    label: "Post-Lab",
  },
  completed: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
    label: "Completed",
  },
};

export default function ConsultationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [totalTestFee, setTotalTestFee] = useState(0);

  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const limit = 5;
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("triage");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isFetching, refetch } = useFetchpatientsQuery({
    page,
    limit,
    search: debouncedSearch,
    track,
  });
  const [postConsultation] = useCreatevisitMutation({});
  const { data: testData } = useFetchlabsoverviewsQuery({});
  const test = testData !== undefined ? testData.data : [];

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    uuid: "",
    symptoms: "",
    prescribedTests: [] as LabTest[],
    notes: "",
  });
  const consultations = data !== undefined ? data.data : [];
  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedDoctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stats = {
    preLab: consultations.filter((c) => c.track === "triage").length,
    awaitingLab: consultations.filter((c) => c.stage === "awaiting-lab").length,
    postLab: consultations.filter((c) => c.stage === "post-lab").length,
    completed: consultations.filter((c) => c.stage === "completed").length,
  };

  const handleOpenAddModal = (data: Consultation) => {
    console.log(data);
    setFormData({
      uuid: data?.visits?.[0]?.uuid || "",
      patientId: data.uuid,
      patientMongoose: data?.visits[0].patientMongoose,
      chiefComplaint: "",
      symptoms: "",
      prescribedTests: [],
      notes: "",
    });
    setEditingConsultation(null);
    setIsFormModalOpen(true);
  };

  const handleView = (consultation: Consultation) => {
    console.log(consultation);
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
  };

  const handleAdvanceStage = (consultation: Consultation) => {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      track: "billing",
      totallabTestFee: totalTestFee,

      prescribedTests: formData.prescribedTests.map((t) => t._id),
    };
    await postConsultation(payload).unwrap();
    await refetch();
    toast({
      title: "consultation Staged",
      description: `Consultation started.`,
    });
    setIsFormModalOpen(false);
    console.log(payload);
    //  toast({
    //     title: "Stage Updated",
    //     description: `Consultation moved to .`,
    //   });
    //    setIsFormModalOpen(false);
    //     // setConsultations([newConsultation, ...consultations]);
    //     toast({ title: "Created", description: "New consultation started." });
    //   }
    //   setIsFormModalOpen(false);
  };
  useEffect(() => {
    const total = formData.prescribedTests.reduce(
      (sum, test) => sum + (test.price || 0),
      0,
    );

    setTotalTestFee(total);
  }, [formData.prescribedTests]);
  const filteredTests = search.length
    ? test.filter((t) =>
        t.testName.toLowerCase().includes(search.toLowerCase()),
      )
    : [];
  return (
    <DashboardLayout
      title="Consultations"
      subtitle="Manage patient consultations and lab workflows"
    >
      <span className="text-xs text-muted-foreground">${totalTestFee}</span>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Stethoscope className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pre-Lab</p>
                  <p className="text-2xl font-bold">{stats.preLab}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TestTube className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awaiting Lab</p>
                  <p className="text-2xl font-bold">{stats.awaitingLab}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Post-Lab</p>
                  <p className="text-2xl font-bold">{stats.postLab}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* setStageFilter(stageFilter);
               }

        {/* Tabs View */}
        <Tabs
          defaultValue="triage"
          onValueChange={async (value) => {
            setTrack(value);
            await refetch();
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="">All</TabsTrigger>
            <TabsTrigger value="triage">Pre-Lab</TabsTrigger>
            <TabsTrigger value="awaiting-lab">Awaiting Lab</TabsTrigger>
            <TabsTrigger value="post-lab">Post-Lab</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {["all", "triage", "awaiting-lab", "post-lab", "completed"].map(
            (tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {consultations
                  .filter((c) => tab === "all" || c.track === tab)
                  .map((consultation) => {
                    const style = stageStyles[consultation?.track];
                    return (
                      <Card
                        key={consultation.id}
                        className="hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col">
                            {/* Top Section: Patient & Status */}
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/30">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-bold leading-none">
                                    {consultation.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {consultation?.assignedDoctor?.name} •{" "}
                                    <span className="italic">
                                      {
                                        consultation.assignedDoctor?.department
                                          ?.name
                                      }
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "capitalize px-2 py-0 text-[10px]",
                                    style?.bg,
                                    style?.text,
                                    style?.border,
                                  )}
                                >
                                  {style?.label}
                                </Badge>
                                <div className="flex gap-1">
                                  {consultation.track !== "completed" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenAddModal(consultation)
                                      }
                                      className="h-8 text-xs gap-1"
                                    >
                                      Next <ArrowRight className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleView(consultation)}
                                      >
                                        <Eye className="w-4 h-4 mr-2" /> View
                                        Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(consultation)}
                                      >
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Middle Section: Vitals Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                  BP (mmHg)
                                </span>
                                <span className="font-mono text-sm">
                                  {consultation.visits[0]?.bp || "120/80"}
                                </span>
                              </div>
                              <div className="flex flex-col border-l pl-4">
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                  Heart Rate
                                </span>
                                <span className="font-mono text-sm">
                                  {consultation.visits[0]?.respiratoryRate ||
                                    "72"}{" "}
                                  bpm
                                </span>
                              </div>
                              <div className="flex flex-col border-l pl-4">
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                  Temp
                                </span>
                                <span className="font-mono text-sm">
                                  {consultation.visits[0]?.temperature ||
                                    "36.5"}
                                  °C
                                </span>
                              </div>
                              <div className="flex flex-col border-l pl-4">
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                  SpO2
                                </span>
                                <span className="font-mono text-sm">
                                  {consultation.visits[0]?.spo2 || "98"}%
                                </span>
                              </div>
                            </div>

                            {/* Bottom Section: Complaint & Tests */}
                            <div className="p-4 pt-0">
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm font-medium line-clamp-2">
                                  <span className="text-muted-foreground font-normal">
                                    Chief Complaint:{" "}
                                  </span>
                                  {consultation.chiefComplaint}
                                </p>

                                {consultation?.prescribedTests?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {consultation.prescribedTests.map(
                                      (test, i) => (
                                        <Badge
                                          key={i}
                                          variant="secondary"
                                          className="text-[10px] bg-white border"
                                        >
                                          {test}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {filteredConsultations.filter(
                  (c) => tab === "all" || c.track === tab,
                ).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No consultations found.
                  </div>
                )}
              </TabsContent>
            ),
          )}
        </Tabs>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConsultation ? "Edit Consultation" : "New Consultation"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Chief Complaint</Label>
              <Textarea
                value={formData.chiefComplaint}
                onChange={(e) =>
                  setFormData({ ...formData, chiefComplaint: e.target.value })
                }
                placeholder="Patient's main complaint..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Symptoms (comma-separated)</Label>
              <Input
                value={formData.symptoms}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                placeholder="headache, fever, fatigue"
              />
            </div>

            <div className="space-y-2">
              <Label>Prescribed Tests</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formData.prescribedTests.length
                      ? formData.prescribedTests
                          .map((t) => t.testName)
                          .join(", ")
                      : "Search & select tests"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Type to search..."
                      value={search}
                      onValueChange={setSearch}
                    />

                    {/* 👇 SHOW NOTHING until user types */}
                    {search.length > 0 && (
                      <>
                        {filteredTests.length === 0 ? (
                          <CommandEmpty>No tests found.</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {filteredTests.map((item) => {
                              const checked = formData.prescribedTests.some(
                                (t) => t._id === item._id,
                              );

                              return (
                                <CommandItem
                                  key={item._id}
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      prescribedTests: checked
                                        ? prev.prescribedTests.filter(
                                            (t) => t._id !== item._id,
                                          )
                                        : [...prev.prescribedTests, item],
                                    }));
                                  }}
                                  className="flex items-center justify-between"
                                >
                                  <span>{item.testName}</span>
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

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingConsultation ? "Update" : "Start Consultation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedConsultation?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedConsultation?.assignedDoctor.name} •{" "}
                    {selectedConsultation?.assignedDoctor?.department?.name}
                  </p>
                  <Badge
                    className={cn(
                      "mt-1",
                      stageStyles[selectedConsultation?.track]?.bg,
                      stageStyles[selectedConsultation?.track]?.text,
                    )}
                  >
                    {stageStyles[selectedConsultation?.track]?.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Chief Complaint
                  </h4>
                  <p>{selectedConsultation?.visits[0].chiefComplaint}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Consultation Fee
                  </h4>
                  <p className="text-lg font-semibold">
                    ${selectedConsultation?.assignedDoctor?.department?.fee}
                  </p>
                </div>
              </div>

              {selectedConsultation?.visits[0]?.symptoms?.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation?.visits[0]?.symptoms?.map((s, i) => (
                      <Badge key={i} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultation?.visits[0]?.prescribedTests?.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Tests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation?.visits[0]?.prescribedTests?.map((s, i) => (
                      <Badge key={i} variant="outline">
                        {s.testName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedConsultation?.visits[0]?.prescribedTests?.length > 0 && (
                <div className="space-y-2">
                  <Label>Prescribed Tests</Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {formData.prescribedTests.length
                          ? formData.prescribedTests
                              .map((t) => t._id)
                              .join(", ")
                          : "Select tests"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-64 p-2">
                      {test.map((test) => {
                        const checked = formData.prescribedTests.some(
                          (t) => t._id === test._id,
                        );

                        return (
                          <div
                            key={test._id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  prescribedTests: checked
                                    ? prev.prescribedTests.filter(
                                        (t) => t._id !== test._id,
                                      )
                                    : [...prev.prescribedTests, test],
                                }));
                              }}
                            />
                            <span className="text-sm">{test.testName}</span>
                          </div>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {selectedConsultation?.testResults && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Test Results
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedConsultation?.testResults).map(
                      ([test, result]) => (
                        <div
                          key={test}
                          className="flex justify-between p-2 bg-muted rounded"
                        >
                          <span>{test}</span>
                          <span className="font-medium">{result}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {selectedConsultation?.diagnosis && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Diagnosis
                  </h4>
                  <p className="font-semibold">
                    {selectedConsultation?.diagnosis}
                  </p>
                </div>
              )}

              {selectedConsultation?.medications &&
                selectedConsultation?.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Medications
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedConsultation?.medications.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedConsultation?.notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Notes
                  </h4>
                  <p className="text-sm">{selectedConsultation?.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created:{" "}
                  {new Date(
                    selectedConsultation?.createdAt,
                  ).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated:{" "}
                  {new Date(
                    selectedConsultation?.updatedAt,
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
