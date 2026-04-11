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
import {
  useCreatevisitMutation,
  useFetchlabOrdersForAVisitQuery,
  useFetchvisitsQuery,
} from "@/features/visitsSlice";
import { ConsultationSkeleton } from "@/components/loaders";
import { PostLabActionDialog } from "./Components/postlabModal";
import { MedicationFormDialog } from "./Components/medicationFormDialog";
import { useFetchMedicationsQuery } from "@/features/pharmacySlice";
import { Medication } from "@/types/pharmacy";

export default function ConsultationsPage() {
  const { data, isLoading, track, setTrack, refetch } = useConsultations();
  const consultations = data?.data ?? [];
  // API hooks
  const {
    data: medsData,
    isLoading: medsLoading,
    refetch: refetchMeds,
  } = useFetchMedicationsQuery({
    page: 1,
    limit: 10000,
    search: "",
    status: "",
  });
  const { data: consultationData } = useFetchvisitsQuery({
    page: 1,
    limit: 200000000,
  });

  const [postLabModalOpen, setPostLabModalOpen] = useState(false);
  const [postLabConsultation, setPostLabConsultation] =
    useState<Consultation | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null);

  const { data: labsData } = useFetchlabsQuery({
    page: 1,
    limit: 10000,
    search: "",
    status: "",
  });
  let vId = "";
  const labTests: LabTest[] = labsData?.data ?? [];

  const [postConsultation] = useCreatevisitMutation();
  const intittialFormData = {
    chiefComplaint: "",

    uuid: "",
    patientId: "",
    visitId: "",
    patientMongoose: "",
    orderedBy: "",
    symptoms: "",
    prescribedTests: [] as LabTest[],
    notes: "",
    orderedAt: Date(),
  };
  const [formData, setFormData] = useState(intittialFormData);
  const { data: labTest, refetch: refetchLO } = useFetchlabOrdersForAVisitQuery(
    {
      id: vId,
    },
  );
  const VisitTests: LabTest[] = labTest?.data ?? [];
  const handleOpenAddModal = async (data: Consultation) => {
    if (data.track === "post-lab") {
      vId = data._id;
      await refetchLO();
      setPostLabConsultation(data);
      setPostLabModalOpen(true);
      setFormData({
        uuid: data?.uuid,
        patientId: data?.patientMongoose,
        visitId: data?._id,
        patientMongoose: data?.patientMongoose,
        orderedBy: data?.assignedDoctor?._id ?? "",
        chiefComplaint: "",
        symptoms: "",
        prescribedTests: [],
        notes: "",
        orderedAt: Date(),
      });
      return;
    }
    setFormData({
      uuid: data?.uuid,
      patientId: data?.patientMongoose,
      visitId: data?._id,
      patientMongoose: data?.patientMongoose,
      orderedBy: data?.assignedDoctor?._id ?? "",
      chiefComplaint: "",
      symptoms: "",
      prescribedTests: [],
      notes: "",
      orderedAt: Date(),
    });
    setEditingConsultation(null);
    setIsFormModalOpen(true);
  };
  const handleSendToWard = async (consultation: Consultation) => {
    toast({
      title: "Patient sent to ward",
      description: "Ward admission initiated.",
    });

    setPostLabModalOpen(false);
  };

  const handleSendToPharmacy = async (formPayload, totalFee) => {
    try {
      await postConsultation({
        // 🔹 Parent metadata
        uuid: formData.uuid,
        visitId: formData.visitId,
        patientId: formData.patientId,
        patientMongoose: formData.patientMongoose,
        track: "med_billing",
        status: "pending",
        medFee: totalFee,
        medications: formPayload.prescribedMedications.map((t) => t._id),
      }).unwrap();

      await refetch();

      toast({
        title: "Medication Staged",
        description: "Consultation started.",
      });

      setIsMedicationModalOpen(false);
    } catch (error) {
      alert(JSON.stringify(error));
      toast({
        title: "Error",
        description: "Failed to save consultation.",
        variant: "destructive",
      });
    }
  };
  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
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
      <ConsultationStats consultations={consultationData?.data ?? []} />

      <ConsultationTabs
        consultations={consultations}
        track={track}
        onChange={setTrack}
        onNext={handleOpenAddModal}
        onView={handleView}
        onEdit={() => console.log("object")}
      />

      <MedicationFormDialog
        open={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        initialData={{ uuid: "", prescribedMedications: [] }}
        medications={medsData?.data ?? []}
        onSubmit={handleSendToPharmacy}
      />
      <ConsultationFormDialog
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingConsultation ? formData : null}
        labTests={labTests}
        VisitTests={VisitTests}
        onSubmit={async (formPayload, totalFee) => {
          try {
            await postConsultation({
              // 🔹 Parent metadata
              uuid: formData.uuid,
              visitId: formData.visitId,
              patientId: formData.patientId,
              patientMongoose: formData.patientMongoose,
              orderedBy: formData.orderedBy,

              // 🔹 Dialog data
              chiefComplaint: formPayload.chiefComplaint,
              symptoms: formPayload.symptoms,
              notes: formPayload.notes,

              track:
                formPayload.prescribedTests.length > 0
                  ? "lab_billing"
                  : "med_billing",

              status: "pending",
              totallabTestFee: totalFee,

              prescribedTests: formPayload.prescribedTests.map((t) => t._id),
            }).unwrap();

            await refetch();

            toast({
              title: "Consultation Staged",
              description: "Consultation started.",
            });

            setIsFormModalOpen(false);
          } catch {
            toast({
              title: "Error",
              description: "Failed to save consultation.",
              variant: "destructive",
            });
          }
        }}
      />

      <ConsultationViewDialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        consultation={selectedConsultation}
      />
      <PostLabActionDialog
        open={postLabModalOpen}
        onClose={() => setPostLabModalOpen(false)}
        consultation={postLabConsultation}
        onWard={handleSendToWard}
        onPharmacy={() => setIsMedicationModalOpen(true)}
      />
    </DashboardLayout>
  );
}
