import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { VisitReportPDFButton } from "./visitReportDownloadButton";
import { useParams } from "react-router-dom";
import { useFetchVisitReportQuery } from "@/features/visitsSlice";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function VisitDetailView() {
  const { id } = useParams();
  const { data, isLoading } = useFetchVisitReportQuery(id);
  const report = data ? data.report : {};
  const { visit, patient, labs, procedures, invoice } = report;
  return (
    <DashboardLayout
      title={`Visit Report: ${report?.visit?.patientMongoose?.name}`}
      subtitle={` Visit Date: ${new Date(visit?.createdAt).toLocaleDateString()} |
              Doctor: ${visit?.assignedDoctor?.name}`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold"></h1>
            <p className="text-muted-foreground"></p>
            <Badge>{patient?.status}</Badge>
          </div>
          <VisitReportPDFButton report={report} />
        </div>

        {/* Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Vitals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <p>BP: {visit?.bp}</p>
            <p>Pulse: {visit?.pulse}</p>
            <p>Respiratory Rate: {visit?.respiratoryRate}</p>
            <p>Oxygen Saturation: {visit?.oxygenSaturation}</p>
            <p>Temperature: {visit?.temperature}</p>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Chief Complaint: {visit?.chiefComplaint}</p>
            <p>Symptoms: {visit?.symptoms.join(", ")}</p>
            <p>Diagnosis: {visit?.diagnosis}</p>
            <p>Disposition: {visit?.disposition}</p>
            <p>Notes: {visit?.notes}</p>
          </CardContent>
        </Card>

        {/* Labs */}
        <Card>
          <CardHeader>
            <CardTitle>Lab Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {labs?.map((lab) => (
              <div
                key={lab?._id}
                className="flex justify-between border-b py-2"
              >
                <span>{lab?.testId?.testName}</span>
                <span>{lab?.results ?? "Pending"}</span>
                <Badge>{lab?.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Procedures & Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Procedures & Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold">Procedures</h4>
            {procedures?.map((proc) => (
              <p key={proc?._id}>
                {proc?.procedureName} - {proc?.status}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Consultation Fee: {invoice?.consultationFee}</p>
            <p>Lab Fee: {invoice?.labFee}</p>
            <p>Medications Fee: {invoice?.medFee}</p>
            <p>Other Fee: {invoice?.otherFee}</p>
            <p>Boarding Fee: {invoice?.boardingFee}</p>
            <p className="font-bold">
              Total:{" "}
              {invoice?.consultationFee +
                invoice?.labFee +
                invoice?.medFee +
                invoice?.otherFee +
                invoice?.boardingFee}
            </p>
            <Badge>{invoice?.status}</Badge>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
