import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VisitReport {
  visit: any;
  patient: any;
  labs: any[];
  procedures: any[];
  invoice: any;
}

export function VisitReportPDFButton({ report }: { report: VisitReport }) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // ---------------- HEADER ----------------
    doc.setFontSize(22);
    doc.text(`${report?.branch?.branchName?.toUpperCase()}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`${report?.branch?.address}`, 14, 28);
    doc.text(`Tel: ${report?.branch?.phone_number} | Email: info@${report?.branch?.branchName?.toLowerCase().replace(/\s+/g, '')}.com`, 14, 34);

    // Horizontal line
    doc.line(14, 38, 195, 38);

    // ---------------- TITLE ----------------
    doc.setFontSize(18);
    doc.text("VISIT REPORT", 14, 50);

    // ---------------- PATIENT INFO ----------------
    autoTable(doc, {
      startY: 60,
      head: [["Field", "Value"]],
      body: [
        ["Patient Name", report.patient?.name],
        ["Patient ID", report.patient?.uuid],
        ["Status", report.patient?.status],
        ["DOB", report.patient?.dob],
        ["Sex", report.patient?.sex],
        ["Phone", report.patient?.phone],
      ],
    });

    // ---------------- VISIT INFO ----------------
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Field", "Value"]],
      body: [
        ["Visit Date", report.visit?.visitDate],
        ["Doctor", report.visit?.assignedDoctor?.name],
        ["Track", report.visit?.track],
        ["Disposition", report.visit?.disposition],
        ["Diagnosis", report.visit?.diagnosis],
        ["Chief Complaint", report.visit?.chiefComplaint],
        ["Notes", report.visit?.notes],
      ],
    });

    // ---------------- VITALS ----------------
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Vital", "Value"]],
      body: [
        ["BP", report.visit?.bp],
        ["Pulse", report.visit?.pulse],
        ["Respiratory Rate", report.visit?.respiratoryRate],
        ["Oxygen Saturation", report.visit?.oxygenSaturation],
        ["Temperature", report.visit?.temperature],
      ],
    });

    // ---------------- LABS ----------------
    if (report.labs?.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Test", "Result", "Status"]],
        body: report.labs.map((lab) => [
          lab.testId?.testName ?? "Unknown",
          lab.results ?? "Pending",
          lab.status,
        ]),
      });
    }

    // ---------------- PROCEDURES ----------------
    if (report.procedures?.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Procedure", "Status", "Notes"]],
        body: report.procedures.map((proc) => [
          proc.procedureName,
          proc.status,
          proc.notes ?? "",
        ]),
      });
    }

    // ---------------- INVOICE ----------------
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Fee Type", "Amount"]],
      body: [
        ["Consultation", report.invoice?.consultationFee],
        ["Lab", report.invoice?.labFee],
        ["Medications", report.invoice?.medFee],
        ["Other", report.invoice?.otherFee],
        ["Boarding", report.invoice?.boardingFee],
        ["Status", report.invoice?.status],
      ],
    });

    // ---------------- FOOTER ----------------
    const pageHeight = doc.internal.pageSize.height;
    doc.line(14, pageHeight - 30, 195, pageHeight - 30);
    doc.setFontSize(12);
    doc.text("Physician Signature: ____________________", 14, pageHeight - 20);
    doc.text("Date: ____________________", 150, pageHeight - 20);

    // Save
    doc.save(`${report.patient?.name}_visit_report.pdf`);
    toast({
      title: "Downloaded",
      description: "Visit report PDF generated successfully",
    });
  };

  return (
    <Button onClick={handleDownloadPDF} className="gap-2">
      <Download className="w-4 h-4" />
      Download PDF
    </Button>
  );
}
