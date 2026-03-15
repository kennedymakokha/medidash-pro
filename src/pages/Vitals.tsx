import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useFetchpatientsoverviewsQuery } from "@/features/patientSlice";
import {
  useCreatevisitMutation,
  useFetchvisitsQuery,
} from "@/features/visitsSlice";
import { VitalsStats, calculateEWS, getEWSStatus } from "./vitals/components/VitalsStats";
import { VitalsTable } from "./vitals/components/VitalsTable";
import { VitalsFormDialog } from "./vitals/components/VitalsFormDialog";
import { VitalsViewDialog } from "./vitals/components/VitalsViewDialog";
import { VitalRecord } from "@/types/hospital";

const defaultForm = {
  uuid: "",
  patientId: "",
  patientMongoose: "",
  temperature: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRate: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  weight: "",
  height: "",
  notes: "",
};

export default function VitalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [editingVital, setEditingVital] = useState<VitalRecord | null>(null);
  const [viewingVital, setViewingVital] = useState<VitalRecord | null>(null);
  const [page] = useState(1);
  const [formData, setFormData] = useState(defaultForm);

  const [postVital] = useCreatevisitMutation();
  const { userInfo: { user } } = useSelector((state: RootState) => state.auth);

  const { data: visitsData, refetch } = useFetchvisitsQuery({
    limit: 5,
    page,
    search: "",
    track: "triage",
  });

  const { data: allData } = useFetchvisitsQuery({
    limit: 100000000000,
    page,
    search: "",
  });

  const visits = visitsData?.data ?? [];
  const allVitals = allData?.data ?? [];

  /* ------------------ AUTO RESET FILTER ------------------ */
  useEffect(() => {
    if (!filter) return;

    const timer = setTimeout(() => setFilter(""), 60000); // reset after 1 min
    return () => clearTimeout(timer);
  }, [filter]);

  /* ------------------ FORM HANDLERS ------------------ */
  const handleRecord = (data: VitalRecord) => {
    setFormData({
      ...defaultForm,
      uuid: data.uuid,
      patientId: data.patientMongoose?._id ?? "",
      patientMongoose: data.patientMongoose?._id ?? "",
    });
    setEditingVital(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vital: VitalRecord) => {
    setEditingVital(vital);
    setFormData({
      uuid: vital.uuid ?? "",
      patientId: vital.patientId,
      patientMongoose: vital.patientMongoose,
      temperature: vital.temperature.toString(),
      bloodPressureSystolic: vital.bloodPressureSystolic.toString(),
      bloodPressureDiastolic: vital.bloodPressureDiastolic.toString(),
      heartRate: vital.heartRate.toString(),
      respiratoryRate: vital.respiratoryRate.toString(),
      oxygenSaturation: vital.oxygenSaturation.toString(),
      weight: vital.weight?.toString() ?? "",
      height: vital.height?.toString() ?? "",
      notes: vital.notes ?? "",
    });
    setIsFormOpen(true);
  };

const handleSubmit = async (e: React.FormEvent) => {
  try {
    e.preventDefault();

    // Convert string values to numbers for calculation
    const vitalsPayload = {
      temperature: parseFloat(formData.temperature),
      heartRate: parseInt(formData.heartRate),
      bloodPressureSystolic: parseInt(formData.bloodPressureSystolic),
      bloodPressureDiastolic: parseInt(formData.bloodPressureDiastolic),
      oxygenSaturation: parseInt(formData.oxygenSaturation),
    };

    // Calculate EWS score & status
    const ewsScore = calculateEWS(vitalsPayload);
    const ewsStatus = getEWSStatus(ewsScore);

    await postVital({
      ...formData,
      bp: `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}`,
      bmi: `${parseInt(formData.weight) / parseInt(formData.height)}`,
      vitalsNurseId: user?._id,
      track: "pre-lab",
      status: ewsStatus, // attach the EWS status here
    }).unwrap();

    await refetch();
    toast({
      title: "Vitals Recorded",
      description: "Vital record saved successfully.",
    });

    setIsFormOpen(false);
    setFormData(defaultForm);
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to save vital record.",
      variant: "destructive",
    });
  }
};

  return (
    <DashboardLayout
      title="Vitals"
      subtitle="Monitor and record patient vital signs"
    >
      <div className="space-y-6">
        <VitalsStats setFilter={setFilter} vitals={allVitals} />

        <VitalsTable
          filter={filter}
          visits={
            filter === ""
              ? visits
              : filter === "all"
                ? allVitals
                : allVitals.filter((v) => getEWSStatus(calculateEWS(v)) === filter)
          }
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onRecord={handleRecord}
          onView={(v) => {
            setViewingVital(v);
            setIsViewOpen(true);
          }}
          onEdit={handleEdit}
        />
      </div>

      <VitalsFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingVital}
      />

      <VitalsViewDialog
        vital={viewingVital}
        onClose={() => {
          setIsViewOpen(false);
          setViewingVital(null);
        }}
      />
    </DashboardLayout>
  );
}