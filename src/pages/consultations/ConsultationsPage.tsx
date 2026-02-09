import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useConsultations } from "@/hooks/useConsultations";
import { ConsultationStats } from "./Components/ConsultationStats";
import { ConsultationTabs } from "./Components/ConsultationTabs";
import { ConsultationFormDialog } from "./Components/ConsultationFormDialog";
import { ConsultationViewDialog } from "./Components/ConsultationViewDialog";
import { useState } from "react";
import { Consultation, LabTest } from "@/types/billing";
import { useFetchlabsQuery } from "@/features/labTestSlice";
import { toast } from "@/hooks/use-toast";
import { useCreatevisitMutation } from "@/features/visitsSlice";
import { ConsultationSkeleton } from "@/components/loaders";

export default function ConsultationsPage() {
  const { data, isLoading, track, setTrack, refetch } = useConsultations();
  const consultations = data?.data ?? [];

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  const { data: labsData } = useFetchlabsQuery({ page: 1, limit: 10000, search: "", status: "" });
  const labTests: LabTest[] = labsData?.data ?? [];

  const [postConsultation] = useCreatevisitMutation();

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    uuid: "",
    patientId: "",
    patientMongoose: "",
    symptoms: "",
    prescribedTests: [] as LabTest[],
    notes: "",
  });

  const handleOpenAddModal = (data: Consultation) => {
    setFormData({
      uuid: data?.visits?.[0]?.uuid || "",
      patientId: data?.uuid || "",
      patientMongoose: data?.visits?.[0]?.patientMongoose || "",
      chiefComplaint: "",
      symptoms: "",
      prescribedTests: [],
      notes: "",
    });
    setEditingConsultation(null);
    setIsFormModalOpen(true);
  };

  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
  };

  const handleEdit = (consultation: Consultation) => {
    setFormData({
      uuid: consultation.uuid || "",
      patientId: consultation.patientId || "",
      patientMongoose: consultation.patientMongoose || "",
      chiefComplaint: consultation.chiefComplaint,
      symptoms: consultation.symptoms?.join(", ") || "",
      prescribedTests: [],
      notes: consultation.notes,
    });
    setEditingConsultation(consultation);
    setIsFormModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Consultations">
        <ConsultationSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Consultations">
      <ConsultationStats consultations={consultations} />

      <ConsultationTabs
        consultations={consultations}
        track={track}
        onChange={setTrack}
        onNext={handleOpenAddModal}
        onView={handleView}
        onEdit={handleEdit}
      />

      <ConsultationFormDialog
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingConsultation ? formData : null}
        labTests={labTests}
        onSubmit={async (formPayload, totalFee) => {
          try {
            await postConsultation({
              ...formPayload,
              track: "billing",
              totallabTestFee: totalFee,
              prescribedTests: formPayload.prescribedTests.map((t) => t._id),
            }).unwrap();
            await refetch();
            toast({ title: "Consultation Staged", description: "Consultation started." });
            setIsFormModalOpen(false);
          } catch {
            toast({ title: "Error", description: "Failed to save consultation.", variant: "destructive" });
          }
        }}
      />

      <ConsultationViewDialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        consultation={selectedConsultation}
      />
    </DashboardLayout>
  );
}
