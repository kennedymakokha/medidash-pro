import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Department } from "@/types/hospital";
import { mockDepartments } from "@/data/mockData";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  UserCheck,
  Stethoscope,
  DollarSign,
} from "lucide-react";
import {
  useCreatedepartmentMutation,
  useFetchdepartmentsQuery,
} from "@/features/departmentSlice";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetusersQuery } from "@/features/userSlice";

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [viewDept, setViewDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);
  const [headSearch, setHeadSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const debouncedSearch = useDebounce(search, 400);
  const { data, refetch } = useFetchdepartmentsQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const [postDept] = useCreatedepartmentMutation({});
  const [formData, setFormData] = useState({
    name: "",
    head: "",
    fee: 0,
  });
  const departments = data?.data ?? [];
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.head?.toLowerCase().includes(search.toLowerCase()),
  );
  const { data: users } = useGetusersQuery({ limit: 1000 });
  const userData = users?.data ?? [];
  const filteredUsers = userData.filter((user) =>
    user.name.toLowerCase().includes(headSearch.toLowerCase()),
  );
  const handleSubmit = async () => {
    // for (let index = 0; index < mockDepartments.length; index++) {
    //   const element = mockDepartments[index];
    //   element.head = "697f0df9ad6a852ee26c0119";
    //   element.fee = element.consultationFee;
    //   delete element.consultationFee;
    //   delete element._id;
    //   await postDept(element).unwrap();
    //   await refetch();

    //   console.log(element);
    // }
    if (editDept) {
      await postDept({ ...formData, uuid: (editDept as any).uuid }).unwrap();
      refetch()
      toast({
        title: "Department Updated",
        description: "Department information has been updated.",
      });
      setEditDept(null);
    } else {
      await postDept(formData).unwrap();
      refetch()
      toast({
        title: "Department Added",
        description: `${formData.name} has been added successfully.`,
      });
      setAddModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDept) return;
     await postDept({ ...deleteDept, isDeleted:true,uuid:deleteDept.uuid  }).unwrap();
     refetch()
    toast({
      title: "Department Removed",
      description: `${deleteDept.name} has been removed.`,
      variant: "destructive",
    });
    setDeleteDept(null);
  };

  const openEditModal = (dept: Department) => {
    setFormData({
      name: dept.name,
      head: dept.head || "",

      fee: dept.fee || 0,
    });
    setEditDept(dept);
  };

  const totalStaff = departments.reduce(
    (acc, d) => acc + (d.staffCount || 0),
    0,
  );
  const totalPatients = departments.reduce(
    (acc, d) => acc + (d.patientCount || 0),
    0,
  );

  const isFormOpen = addModalOpen || !!editDept;

  return (
    <DashboardLayout
      title="Departments"
      subtitle="Manage hospital departments and divisions"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Department
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold text-card-foreground">
                {departments.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold text-primary">{totalStaff}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold text-success">{totalPatients}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <DollarSign className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Consultation</p>
              <p className="text-2xl font-bold text-info">
                Ksh
                {Math.round(
                  departments.reduce((acc, d) => acc + (d.fee || 0), 0) /
                    departments.length,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => (
          <Card
            key={dept._id}
            className="shadow-card hover:shadow-elevated transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewDept(dept)}>
                      <Eye className="w-4 h-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditModal(dept)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteDept(dept)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dept.head && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4" />
                  <span>Head: {typeof dept.head === 'object' ? dept.head?.name : dept.head}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {dept?.staffs?.length ?? dept?.staffCount ?? 0} Staff
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20"
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  {dept?.patients?.length ?? dept?.patientCount ?? 0} Patients
                </Badge>
              </div>
              {dept.fee && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-info" />
                  <span className="font-semibold text-info">
                    Ksh {dept?.fee}
                  </span>
                  <span className="text-muted-foreground">
                    consultation fee
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No departments found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddModalOpen(false);
            setEditDept(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDept ? "Edit Department" : "Add New Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter department name"
              />
            </div>
            <div className="space-y-2">
              <Label>Department Head</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formData.head
                      ? userData.find((u) => u._id === formData.head)?.name
                      : "Search & select head"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search head..."
                      value={headSearch}
                      onValueChange={setHeadSearch}
                    />
                    {filteredUsers.length === 0 ? (
                      <CommandEmpty>No users found</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user._id}
                            onSelect={() => {
                              setFormData((prev) => ({
                                ...prev,
                                head: user._id,
                              }));
                              setHeadSearch(""); // optional: clear search after select
                            }}
                          >
                            {user.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>

            
              {/* <Input
                value={formData.head}
                onChange={(e) =>
                  setFormData({ ...formData, head: e.target.value })
                }
                placeholder="Enter department head name"
              /> */}
            </div>

            <div className="space-y-2">
              <Label>Consultation Fee </Label>
              <Input
                type="number"
                value={formData.fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fee: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter consultation fee"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddModalOpen(false);
                setEditDept(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editDept ? "Update" : "Add Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog
        open={!!viewDept}
        onOpenChange={(open) => !open && setViewDept(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>
          {viewDept && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewDept.name}</h3>
                  {viewDept.head && (
                    <p className="text-muted-foreground">
                      Head: {typeof viewDept.head === 'object' ? viewDept.head?.name : viewDept.head}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-card-foreground">
                    {viewDept?.staffs?.length ?? viewDept?.staffCount ?? 0}
                  </p>
                  <p className="text-muted-foreground">Staff Members</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <UserCheck className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold text-card-foreground">
                    {viewDept?.patients?.length ?? viewDept?.patientCount ?? 0}
                  </p>
                  <p className="text-muted-foreground">Current Patients</p>
                </div>
              </div>
              {viewDept.fee && (
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Consultation Fee
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      Ksh  {viewDept.fee}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteConfirmModal
        title="Delete Department"
        description={`Are you sure you want to remove ${deleteDept?.name}? This action cannot be undone.`}
        open={!!deleteDept}
        onOpenChange={(open) => !open && setDeleteDept(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
