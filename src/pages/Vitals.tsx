import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFetchpatientsoverviewsQuery } from "@/features/patientSlice";
import { generateUnifiedId } from "@/utils/culculateAge";
import {
  useCreatevisitMutation,
  useFetchvisitsQuery,
} from "@/features/visitsSlice";
import { DataTable } from "@/components/table/DataTable";
import { timeSince } from "@/utils/timeslice";
import { VitalRecord } from "@/types/hospital";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

function getVitalStatus(vital: VitalRecord): "normal" | "warning" | "critical" {
  if (
    vital.temperature > 102 ||
    vital.bloodPressureSystolic > 160 ||
    vital.bloodPressureDiastolic > 100 ||
    vital.heartRate > 120 ||
    vital.oxygenSaturation < 90
  ) {
    return "critical";
  }
  if (
    vital.temperature > 100 ||
    vital.bloodPressureSystolic > 140 ||
    vital.bloodPressureDiastolic > 90 ||
    vital.heartRate > 100 ||
    vital.oxygenSaturation < 95
  ) {
    return "warning";
  }
  return "normal";
}

const statusStyles = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<VitalRecord | null>(null);
  const [viewingVital, setViewingVital] = useState<VitalRecord | null>(null);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [search, setSearch] = useState("");
  const [postVital] = useCreatevisitMutation({});
  const { data: overview } = useFetchpatientsoverviewsQuery({});
  const patients = overview !== undefined ? overview.patients : [];
  const { data, refetch } = useFetchvisitsQuery({ limit, page, search,track:"triage" });
  const visits = data !== undefined ? data.data : [];
 const { userInfo: { user } } = useSelector((state: RootState) => state.auth)
  const [formData, setFormData] = useState({
    uuid: "",
    patientId: "",
    temperature: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  });

  const criticalCount =
    vitals?.filter((v) => getVitalStatus(v) === "critical").length || 0;
  const warningCount =
    vitals?.filter((v) => getVitalStatus(v) === "warning").length || 0;
  const normalCount =
    vitals?.filter((v) => getVitalStatus(v) === "normal").length || 0;

  const resetForm = () => {
    setFormData({
      uuid: "",
      patientId: "",
      temperature: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
      notes: "",
    });
    setEditingVital(null);
  };

  const handleOpenAddModal = (data) => {
    resetForm();

    setFormData({
      ...formData,
      uuid: data.uuid,
      patientId: data.patientMongoose._id,
      
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (vital: VitalRecord) => {
    setEditingVital(vital);
    setFormData({
      uuid: vital.uuid,
      patientId: vital.patientId,
      temperature: vital.temperature.toString(),
      bloodPressureSystolic: vital.bloodPressureSystolic.toString(),
      bloodPressureDiastolic: vital.bloodPressureDiastolic.toString(),
      heartRate: vital.heartRate.toString(),
      respiratoryRate: vital.respiratoryRate.toString(),
      oxygenSaturation: vital.oxygenSaturation.toString(),
      weight: vital.weight?.toString() || "",
      height: vital.height?.toString() || "",
      notes: vital.notes || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await postVital({
      ...formData,
      bp: `${formData.bloodPressureDiastolic}/${formData.bloodPressureSystolic}`,
      bmi: `${parseInt(formData.weight) / parseInt(formData.height)}`,
      vitalsNurseId:user?._id,
      track:"pre-lab"
    }).unwrap();
    await refetch();
    toast({
      title: "Record Updated succesfully ",
      description: "Vital record has been updated successfully.",
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const normalizedVisits = visits?.map((v) => {
    const [sys, dia] = v.bp.split("/").map(Number);
    return {
      ...v,
      bloodPressureSystolic: sys,
      bloodPressureDiastolic: dia,
    };
  });

  return (
    <DashboardLayout
      title="Vitals"
      subtitle="Monitor and record patient vital signs"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* <Button onClick={handleOpenAddModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Record Vitals
          </Button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{vitals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Normal</p>
                  <p className="text-2xl font-bold text-success">
                    {normalCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warning</p>
                  <p className="text-2xl font-bold text-warning">
                    {warningCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">
                    {criticalCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by patient name or recorded by..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vitals Table */}
        <DataTable
          title="Vital Records"
          search={searchQuery}
          onSearchChange={setSearchQuery}
          columns={
            <tr>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Recorded</th>
              <th className="px-4 py-3 text-left">Temp (°F)</th>
              <th className="px-4 py-3 text-left">BP</th>
              <th className="px-4 py-3 text-left">HR</th>
              <th className="px-4 py-3 text-left">RR</th>
              <th className="px-4 py-3 text-left">SpO2</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          }
          rows={
            visits.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No vital records found
                </td>
              </tr>
            ) : (
              normalizedVisits.map((vital) => {
                const status = getVitalStatus(vital);

                return (
                  <tr key={vital.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {vital?.patientMongoose?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {vital?.created_by?.name}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {timeSince(vital.createdAt)}
                    </td>

                    <td
                      className={cn(
                        "px-4 py-3",
                        vital.temperature > 100 && "text-warning font-medium",
                      )}
                    >
                      {vital.temperature}
                    </td>

                    <td
                      className={cn(
                        "px-4 py-3",
                        (vital.bloodPressureSystolic > 140 ||
                          vital.bloodPressureDiastolic > 90) &&
                          "text-warning font-medium",
                      )}
                    >
                      {vital.bloodPressureSystolic}/
                      {vital.bloodPressureDiastolic}
                    </td>

                    <td
                      className={cn(
                        "px-4 py-3",
                        vital.heartRate > 100 && "text-warning font-medium",
                      )}
                    >
                      {vital.heartRate}
                    </td>

                    <td className="px-4 py-3">{vital.respiratoryRate}</td>

                    <td
                      className={cn(
                        "px-4 py-3",
                        vital.oxygenSaturation < 95 &&
                          "text-warning font-medium",
                      )}
                    >
                      {vital.oxygenSaturation}%
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[status])}
                      >
                        {status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        onClick={() => handleOpenAddModal(vital)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Record Vitals
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setViewingVital(vital);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(vital)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Record
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => handleDelete(vital.uuid)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )
          }
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVital ? "Edit Vital Record" : "Record New Vitals"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="72"
                  value={formData.heartRate}
                  onChange={(e) =>
                    setFormData({ ...formData, heartRate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bpSystolic">BP Systolic (mmHg)</Label>
                <Input
                  id="bpSystolic"
                  type="number"
                  placeholder="120"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodPressureSystolic: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="bpDiastolic">BP Diastolic (mmHg)</Label>
                <Input
                  id="bpDiastolic"
                  type="number"
                  placeholder="80"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodPressureDiastolic: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  placeholder="16"
                  value={formData.respiratoryRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      respiratoryRate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  placeholder="98"
                  value={formData.oxygenSaturation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oxygenSaturation: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (lbs) - Optional</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="180"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="height">Height (in) - Optional</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="72"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes - Optional</Label>
              <Input
                id="notes"
                placeholder="Any observations..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingVital ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vital Details</DialogTitle>
          </DialogHeader>
          {viewingVital && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{viewingVital.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {viewingVital.recordedAt}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto capitalize",
                    statusStyles[getVitalStatus(viewingVital)],
                  )}
                >
                  {getVitalStatus(viewingVital)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-xs">Temperature</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {viewingVital.temperature}°F
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">Heart Rate</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {viewingVital.heartRate} bpm
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs">Blood Pressure</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {viewingVital.bloodPressureSystolic}/
                    {viewingVital.bloodPressureDiastolic}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs">Respiratory Rate</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {viewingVital.respiratoryRate}/min
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs">Oxygen Saturation</span>
                </div>
                <p className="text-lg font-semibold">
                  {viewingVital.oxygenSaturation}%
                </p>
              </div>

              {(viewingVital.weight || viewingVital.height) && (
                <div className="grid grid-cols-2 gap-4">
                  {viewingVital.weight && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">
                        Weight
                      </span>
                      <p className="font-semibold">{viewingVital.weight} lbs</p>
                    </div>
                  )}
                  {viewingVital.height && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">
                        Height
                      </span>
                      <p className="font-semibold">{viewingVital.height} in</p>
                    </div>
                  )}
                </div>
              )}

              {viewingVital.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Notes</span>
                  <p className="text-sm mt-1">{viewingVital.notes}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Recorded by: {viewingVital?.vitalsNurseId?.name}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
