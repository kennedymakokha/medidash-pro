import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestTube, Syringe } from "lucide-react";
import { LabTable } from "./tabs/labTesttab";
import { ProcedureTable } from "./tabs/procedureTab";
import {
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
import { StatsGridSkeleton, TableSkeleton } from "@/components/loaders";
import { Skeleton } from "@/components/ui/skeleton";

export default function LabTestsPage() {
  const [activeTab, setActiveTab] = useState("tests");
  const { data: procedureOverview, refetch: refetchProcedureOverview, isLoading: procedureOverviewLoading } =
    useFetchproceduressoverviewsQuery({});
  const { data: labOverView, refetch: refetchLabsOverview, isLoading: labOverviewLoading } =
    useFetchlabsoverviewsQuery({});


  const {
    userInfo: { user },
  } = useSelector((state: RootState) => state.auth);

  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const role = user?.role;
  const debouncedSearch = useDebounce(search, 400);
  const { data: labsData, refetch, isLoading: labsLoading } = useFetchlabsQuery({
    page,
    limit,
    search: debouncedSearch,
  });
  const { data: procedureData, refetch: refetchProcedure, isLoading: proceduresLoading } =
    useFetchproceduressQuery({
      page,
      limit,
      search: debouncedSearch,
    });
  
  const showStatsLoading = labOverviewLoading || procedureOverviewLoading;
  const showTableLoading = activeTab === "tests" ? labsLoading : proceduresLoading;


  return (
    <DashboardLayout
      title="Lab Tests & Procedures"
      subtitle="Manage lab tests and medical procedures with pricing"
    >
      <div className="space-y-6">
        {/* Stats */}
        {showStatsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
                      {labOverView?.data.length ?? 0}
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
                      {procedureOverview?.data.length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

          {showTableLoading ? (
            <div className="mt-6">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : (
            <>
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
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
