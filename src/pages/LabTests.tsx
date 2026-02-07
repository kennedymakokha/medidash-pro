import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestTube, Syringe, Search, Plus, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LabTest, Procedure } from "@/types/billing";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { formatCounter, generateUnifiedId } from "@/utils/culculateAge";
import { LabTable } from "./tabs/labTesttab";
import { ProcedureTable } from "./tabs/procedureTab";
import {
  useCreatelabMutation,
  useFetchlabsoverviewsQuery,
  useFetchlabsQuery,
} from "@/features/labTestSlice";
import { useSelector } from "react-redux";
import { useDebounce } from "@/hooks/use-debounce";
import type { RootState } from "@/store";
import {
  useFetchproceduressoverviewsQuery,
  useFetchproceduressQuery,
} from "@/features/procedureSlice";

export default function LabTestsPage() {
  const [activeTab, setActiveTab] = useState("tests");
  const { data: procedureOverview, refetch: refetchProcedureOverview } =
    useFetchproceduressoverviewsQuery({});
  const { data: labOverView, refetch: refetchLabsOverview } =
    useFetchlabsoverviewsQuery({});


  const {
    userInfo: { user },
  } = useSelector((state: RootState) => state.auth);

  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const role = user?.role;
  const debouncedSearch = useDebounce(search, 400);
  const { data: labsData, refetch } = useFetchlabsQuery({
    page,
    limit,

    search: debouncedSearch,
  });
  const { data: procedureData, refetch: refetchProcedure } =
    useFetchproceduressQuery({
      page,
      limit,

      search: debouncedSearch,
    });
  


  return (
    <DashboardLayout
      title="Lab Tests & Procedures"
      subtitle="Manage lab tests and medical procedures with pricing"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TestTube className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lab Tests</p>
                  <p className="text-2xl font-bold">
                    {labOverView?.data.length??0 }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Syringe className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Procedures</p>
                  <p className="text-2xl font-bold">
                    {procedureOverview?.data.length??0 }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tests" className="gap-2">
              <TestTube className="w-4 h-4" />
              Lab Tests
            </TabsTrigger>
            <TabsTrigger value="procedures" className="gap-2">
              <Syringe className="w-4 h-4" />
              Procedures
            </TabsTrigger>
          </TabsList>

          <LabTable
            search={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            page={page}
            totalPages={labsData?.pagination?.totalPages ?? 1}
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
              await refetchLabsOverview();
            }}
            filteredTests={labsData !== undefined ? labsData.data : []}
            title="Lab Tests"
          />
          <ProcedureTable
            search={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            page={page}
            totalPages={procedureData?.pagination?.totalPages ?? 1}
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
              await refetchProcedure();
              await refetchProcedureOverview();
            }}
            filteredTests={
              procedureData !== undefined ? procedureData.data : []
            }
            title="Lab Tests"
          />
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
