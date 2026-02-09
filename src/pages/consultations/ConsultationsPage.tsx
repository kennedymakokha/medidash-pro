import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useConsultations } from "@/hooks/useConsultations";
import { ConsultationStats } from "./Components/ConsultationStats";
import { ConsultationTabs } from "./Components/ConsultationTabs";
import { ConsultationFormDialog } from "./Components/ConsultationFormDialog";
import { useState } from "react";
import { Consultation, LabTest } from "@/types/billing";

export default function ConsultationsPage() {
  const { data, isLoading, track, setTrack, createVisit } = useConsultations();
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);
  const consultations = data?.data ?? [];
  const [formData, setFormData] = useState({
    chiefComplaint: "",
    uuid: "",
    symptoms: "",
    patientId:"",
    prescribedTests: [] as LabTest[],
    notes: "",
  });
  const handleOpenAddModal = (data: Consultation) => {
    console.log(data);
    setFormData({
      uuid: data?.visits?.[0]?.uuid || "",
      patientId: data?.uuid,
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
        labTests={test}
        onSubmit={async (data, totalFee) => {
          await postConsultation({
            ...data,
            track: "billing",
            totallabTestFee: totalFee,
            prescribedTests: data.prescribedTests.map((t) => t._id),
          }).unwrap();
          refetch();
        }}
      />

      <ConsultationFormDialog />
      <ConsultationViewDialog />
    </DashboardLayout>
  );
}
