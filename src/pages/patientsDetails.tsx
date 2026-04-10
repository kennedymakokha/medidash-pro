import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TableSkeleton } from "@/components/loaders";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFetchpatientByIDQuery,
  useFetchVisitsByPatientQuery,
} from "@/features/patientSlice";
import { Link, useNavigate, useParams } from "react-router-dom";

// pages/patients/[id].tsx
export default function PatientDetailsPage() {
  const { id } = useParams();
  const { data, isLoading } = useFetchpatientByIDQuery(id);

  if (isLoading) return <Skeleton />;
 
const  patient = data.data??{}
  return (
    <DashboardLayout title={patient.name} subtitle="Patient Details">
      <div className="grid gap-4">
        <p>Status: {patient.status}</p>
        <p>Blood Group: {patient.bloodgroup}</p>
        <p>DOB: {patient.dob}</p>
        <p>Phone: {patient.phone_number|| patient.guardianphone}</p>
        {/* ... other fields */}
      </div>
      <VisitsList data={patient} />
    </DashboardLayout>
  );
}

function VisitsList({ data }: { data: any }) {

  const navigate = useNavigate();
  // if (isLoading) return <TableSkeleton rows={3} columns={4} />;
 
const visits = data?.visits ?? [];

  // if (isLoading) return <TableSkeleton rows={3} columns={4} />;
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">Visits</h2>
      <div className="space-y-4">
        {
        visits.map((visit) => (
          <div
            key={visit._id}
            className="border rounded p-4 flex justify-between"
          >
            <div>
              <p>Date: {new Date(visit.createdAt).toLocaleDateString()}</p>
              <p>Doctor: {visit.assignedDoctor?.name}</p>
              <p>Status: {visit.track}</p>
            </div>
            <Button   onClick={() => navigate(`/visits/${visit._id}`)}>
              View Report
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
