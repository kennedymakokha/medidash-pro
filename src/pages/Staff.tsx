import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Users, UserCheck, Filter } from "lucide-react";
import { useGetusersQuery, usePostuserMutation } from "@/features/userSlice";
import { useDebounce } from "@/hooks/use-debounce";
import { StaffTable } from "@/components/dashboard/StaffTable";
import { generateUnifiedId } from "@/utils/culculateAge";
import { StatsGridSkeleton, TableSkeleton } from "@/components/loaders";
import { useFetchdepartmentsQuery } from "@/features/departmentSlice";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "nurse" | "receptionist" | "technician" | "admin";
  department: any;
  status: "active" | "on-leave" | "inactive";
  joinDate: string;
}

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  "on-leave": "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-muted text-muted-foreground border-muted",
};

const roleColors = {
  nurse: "bg-primary/10 text-primary",
  receptionist: "bg-accent text-accent-foreground",
  technician: "bg-warning/10 text-warning",
  admin: "bg-destructive/10 text-destructive",
};

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const debouncedSearch = useDebounce(search, 400);
  const {
    data: users,
    refetch,
    isLoading,
  } = useGetusersQuery({ role: "", limit, page, search: debouncedSearch });
  const [staff, setStaff] = useState<Staff[]>([]);
  const { data } = useFetchdepartmentsQuery({});
  const staffmembers = users !== undefined ? users.data : [];

  const departments = data?.data ?? [];
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [deleteStaff, setDeleteStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "nurse" as Staff["role"],
    department: null as any,
    status: "active" as Staff["status"],
  });

  const [postDoctor] = usePostuserMutation({});

  const handleSubmit = async () => {
    if (editStaff) {
      await postDoctor(formData).unwrap();
      await refetch();
      toast({
        title: "Staff Updated",
        description: "Staff member information has been updated.",
      });
      setEditStaff(null);
    } else {
      await postDoctor({
        ...formData,
      }).unwrap();
      await refetch();
      toast({
        title: "Staff Added",
        description: `${formData.name} has been added successfully.`,
      });
      setAddModalOpen(false);
    }
    // if (edit1Staff) {
    //   await postDoctor(doctorData).unwrap()
    //   await refetch()
    //   toast({ title: 'Staff Updated', description: 'Staff member information has been updated.' });
    //   setEditStaff(null);
    // } else {
    //   const newStaff: Staff = {
    //     ...formData,
    //     id: Date.now().toString(),
    //     joinDate: new Date().toISOString().split('T')[0],
    //   };
    //   setStaff([newStaff, ...staff]);
    //   toast({ title: 'Staff Added', description: `${formData.name} has been added successfully.` });
    //   setAddModalOpen(false);
    // }
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "nurse",
      department: null,
      status: "active",
    });
  };

  const handleDelete = () => {
    if (!deleteStaff) return;
    setStaff(staff.filter((s) => s.id !== deleteStaff.id));
    toast({
      title: "Staff Removed",
      description: `${deleteStaff.name} has been removed.`,
      variant: "destructive",
    });
    setDeleteStaff(null);
  };

  const openEditModal = (s: Staff) => {
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      department: s.department,
      status: s.status,
    });
    setEditStaff(s);
  };

  const stats = {
    total: staffmembers.length,
    active: staffmembers.filter((s) => s.status === "active").length,
    nurses: staffmembers.filter((s) => s.role === "nurse").length,
    onLeave: staffmembers.filter((s) => s.status === "on-leave").length,
  };

  const isFormOpen = addModalOpen || !!editStaff;

  return (
    <DashboardLayout title="Staff" subtitle="Manage hospital staff members">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Role:</span>{" "}
                {roleFilter === "all" ? "All" : roleFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("nurse")}>
                Nurse
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("receptionist")}>
                Receptionist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("technician")}>
                Technician
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Staff
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">
                  {stats.active}
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
                <p className="text-sm text-muted-foreground">Nurses</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.nurses}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.onLeave}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <StaffTable
          staff={staffmembers}
          title="Staff table"
          search={search}
          statusStyles={statusStyles}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          setViewStaff={setViewStaff}
          setEditStaff={openEditModal}
          setDeleteStaff={setDeleteStaff}
          page={page}
          totalPages={users !== undefined ? users.pagination?.totalPages : 1}
          onPageChange={setPage}
        />
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddModalOpen(false);
            setEditStaff(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editStaff ? "Edit Staff" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) =>
                    setFormData({ ...formData, role: v as Staff["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as Staff["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(e) =>
                  setFormData({ ...formData, department: e })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dept" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
             
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddModalOpen(false);
                setEditStaff(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editStaff ? "Update" : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog
        open={!!viewStaff}
        onOpenChange={(open) => !open && setViewStaff(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {viewStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {viewStaff.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewStaff.name}</h3>
                  <Badge
                    className={cn("capitalize", roleColors[viewStaff.role])}
                  >
                    {viewStaff.role}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewStaff.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewStaff.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{viewStaff?.department?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={cn("capitalize", statusStyles[viewStaff.status])}
                  >
                    {viewStaff?.status?.replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Join Date</p>
                  <p className="font-medium">{viewStaff.joinDate}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteConfirmModal
        title="Delete Staff"
        description={`Are you sure you want to remove ${deleteStaff?.name}? This action cannot be undone.`}
        open={!!deleteStaff}
        onOpenChange={(open) => !open && setDeleteStaff(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
