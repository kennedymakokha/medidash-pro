import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { Invoice } from "@/types/finance";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useCreatepaymentMutation,
  useFetchpaymentsQuery,
} from "@/features/paymentSlice";
import { FinanceStats } from "./finance/components/FinanceStats";
import { InvoiceTable } from "./finance/components/InvoiceTable";
import { InvoiceViewDialog } from "./finance/components/InvoiceViewDialog";
import { PaymentDialog } from "./finance/components/PaymentDialog";
import { useSocket } from "@/contexts/SocketContext";

export default function FinancePage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [postPayment] = useCreatepaymentMutation({});
  const debouncedSearch = useDebounce(search, 400);
  const { socket } = useSocket();
  const { data, isLoading, refetch } = useFetchpaymentsQuery({
    page,
    limit: 5,
    track: "billing",
    search: debouncedSearch,
  });
  const invoices: Invoice[] = data?.data ?? [];

  const handleMarkPaid = async (paymentMethod: string) => {
    if (!payModalInvoice) return;
    const track = payModalInvoice?.patientId?.track;
    const trackMap: Record<string, { field: string; next: string }> = {
      lab_billing: { field: "labFeepaidAt", next: "lab" },
      reg_billing: { field: "consultationFeepaidAt", next: "triage" },
      med_billing: { field: "medFeepaidAt", next: "pharmacy" },
    };
    const config = trackMap[track];
    if (!config) return;

    try {
      await postPayment({
        uuid: payModalInvoice.uuid,
        patientId: payModalInvoice.patientId._id,
        visitId: payModalInvoice.visitId._id,
        status: "paid",
        track: config.next,
        paymentMethod,
        [config.field]: new Date(),
      }).unwrap();
      await refetch();
      toast({
        title: "Payment Successful",
        description: "Payment has been recorded.",
      });
      setPayModalInvoice(null);
    } catch {
      toast({
        title: "Payment Failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onUpdate = (data: any) => {
      console.log("✅ Updated:", data);
      refetch(); // 👈 THIS is required
    };
    socket.onAny((event, ...args) => {
      console.log("📡 EVENT:", event, args);
    });
    socket.on("visit:update", onUpdate);

    return () => {
      socket.off("visit:update", onUpdate);
    };
  }, [socket]);
  return (
    <DashboardLayout
      title="Finance & Billing"
      subtitle="Manage invoices, payments, and revenue tracking"
    >
      <div className="space-y-6">
        {/* <FinanceStats invoices={invoices} /> */}
        <InvoiceTable
          invoices={invoices}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onView={setSelectedInvoice}
          onPay={setPayModalInvoice}
        />
        <InvoiceViewDialog
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
        <PaymentDialog
          invoice={payModalInvoice}
          onClose={() => setPayModalInvoice(null)}
          onConfirm={handleMarkPaid}
        />
      </div>
    </DashboardLayout>
  );
}
