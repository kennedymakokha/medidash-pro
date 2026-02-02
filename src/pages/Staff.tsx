import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Filter,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'nurse' | 'receptionist' | 'technician' | 'admin';
  department: string;
  status: 'active' | 'on-leave' | 'inactive';
  joinDate: string;
}

const mockStaff: Staff[] = [
  { id: '1', name: 'Jane Wilson', email: 'jane.wilson@hospital.com', phone: '+1 234-567-2001', role: 'nurse', department: 'Emergency', status: 'active', joinDate: '2022-03-15' },
  { id: '2', name: 'Tom Harris', email: 'tom.harris@hospital.com', phone: '+1 234-567-2002', role: 'receptionist', department: 'Front Desk', status: 'active', joinDate: '2023-01-10' },
  { id: '3', name: 'Alice Brown', email: 'alice.brown@hospital.com', phone: '+1 234-567-2003', role: 'nurse', department: 'ICU', status: 'active', joinDate: '2021-07-22' },
  { id: '4', name: 'Bob Martinez', email: 'bob.martinez@hospital.com', phone: '+1 234-567-2004', role: 'technician', department: 'Radiology', status: 'on-leave', joinDate: '2022-09-05' },
  { id: '5', name: 'Carol Davis', email: 'carol.davis@hospital.com', phone: '+1 234-567-2005', role: 'admin', department: 'Administration', status: 'active', joinDate: '2020-11-18' },
  { id: '6', name: 'David Lee', email: 'david.lee@hospital.com', phone: '+1 234-567-2006', role: 'nurse', department: 'Pediatrics', status: 'active', joinDate: '2023-04-30' },
];

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
};

const roleColors = {
  nurse: 'bg-primary/10 text-primary',
  receptionist: 'bg-accent text-accent-foreground',
  technician: 'bg-warning/10 text-warning',
  admin: 'bg-destructive/10 text-destructive',
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [deleteStaff, setDeleteStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'nurse' as Staff['role'],
    department: '',
    status: 'active' as Staff['status'],
  });

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = () => {
    if (editStaff) {
      setStaff(staff.map((s) => (s.id === editStaff.id ? { ...s, ...formData } : s)));
      toast({ title: 'Staff Updated', description: 'Staff member information has been updated.' });
      setEditStaff(null);
    } else {
      const newStaff: Staff = {
        ...formData,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0],
      };
      setStaff([newStaff, ...staff]);
      toast({ title: 'Staff Added', description: `${formData.name} has been added successfully.` });
      setAddModalOpen(false);
    }
    setFormData({ name: '', email: '', phone: '', role: 'nurse', department: '', status: 'active' });
  };

  const handleDelete = () => {
    if (!deleteStaff) return;
    setStaff(staff.filter((s) => s.id !== deleteStaff.id));
    toast({ title: 'Staff Removed', description: `${deleteStaff.name} has been removed.`, variant: 'destructive' });
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
    total: staff.length,
    active: staff.filter((s) => s.status === 'active').length,
    nurses: staff.filter((s) => s.role === 'nurse').length,
    onLeave: staff.filter((s) => s.status === 'on-leave').length,
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
                <span className="hidden sm:inline">Role:</span> {roleFilter === 'all' ? 'All' : roleFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRoleFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('nurse')}>Nurse</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('receptionist')}>Receptionist</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('technician')}>Technician</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('admin')}>Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Staff
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
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
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
              <p className="text-2xl font-bold text-success">{stats.active}</p>
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
              <p className="text-2xl font-bold text-primary">{stats.nurses}</p>
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
              <p className="text-2xl font-bold text-warning">{stats.onLeave}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground truncate">{member.name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">{member.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {member.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', roleColors[member.role])}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      {member.department}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', statusStyles[member.status])}>
                      {member.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewStaff(member)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(member)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteStaff(member)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No staff found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setAddModalOpen(false); setEditStaff(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as Staff['role'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Staff['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddModalOpen(false); setEditStaff(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editStaff ? 'Update' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewStaff} onOpenChange={(open) => !open && setViewStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {viewStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{viewStaff.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewStaff.name}</h3>
                  <Badge className={cn('capitalize', roleColors[viewStaff.role])}>{viewStaff.role}</Badge>
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
                  <p className="font-medium">{viewStaff.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={cn('capitalize', statusStyles[viewStaff.status])}>
                    {viewStaff.status.replace('-', ' ')}
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
