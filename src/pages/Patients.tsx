import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/hospital";
import { mockPatients } from "@/data/mockData";
import { PatientFormModal } from "@/components/modals/PatientFormModal";
import { ViewPatientModal } from "@/components/modals/ViewPatientModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Filter,
} from "lucide-react";
import {
  useCreatepatientMutation,
  useFetchpatientsoverviewsQuery,
  useFetchpatientsQuery,
} from "@/features/patientSlice";
import { PatientTable } from "@/components/dashboard/PatientTable";
import { useDebounce } from "@/hooks/use-debounce";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";


export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const {
    userInfo: { user },
  } = useSelector((state: RootState) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>(undefined);
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { data: patientsOverview, refetch: refetchOverview } =
    useFetchpatientsoverviewsQuery({});
  
  const [limit,setLimit]=useState(10)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const role = user?.role;
  const debouncedSearch = useDebounce(search, 400);
  const { data: patientsData, refetch } = useFetchpatientsQuery({
    page,
    limit,
    status:statusFilter,
    search: debouncedSearch,
  });


  const allPatientsData =
    patientsOverview !== undefined ? patientsOverview.patients : [];
  const data = patientsData !== undefined ? patientsData.data : [];

  const stats = {
    total: allPatientsData.length,
    admitted: allPatientsData.filter((p) => p.status === "admitted").length,
    outpatient: allPatientsData.filter((p) => p.status === "outpatient").length,
    critical: allPatientsData.filter((p) => p.status === "critical").length,
  };

  return (
    <DashboardLayout
      title="Patients"
      subtitle="Manage patient records and admissions"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Status:</span>{" "}
                {statusFilter === "all" ? "All" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("admitted")}>
                Admitted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("outpatient")}>
                Outpatient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("discharged")}>
                Discharged
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("critical")}>
                Critical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-card-foreground">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admitted</p>
              <p className="text-2xl font-bold text-primary">
                {stats.admitted}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <UserX className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outpatient</p>
              <p className="text-2xl font-bold text-success">
                {stats.outpatient}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.critical}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <PatientTable
        search={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        page={page}
        totalPages={patientsData?.pagination?.totalPages ?? 1}
        onPageChange={setPage}
        limit={limit}
        viewAll={() => {
          setPage(1);
          setLimit(10000000);
        }}
         viewPaginated={() => {
          setPage(1);
          setLimit(10);
        }}
        refetch={async () => {
          await refetch();
          await refetchOverview();
        }}
        patients={
          role === "doctor"
            ? (data.filter((p) => p.assignedDoctor === user?.name) ?? [])
            : (data ?? [])
        }
        title={role === "doctor" ? "My Patients" : "All Patients"}
      />

     
    
    </DashboardLayout>
  );
}
