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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Bed,
  User,
  Building2,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface BedData {
  id: string;
  bedNumber: string;
  ward: string;
  type: 'general' | 'icu' | 'private' | 'semi-private';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientName?: string;
  admissionDate?: string;
}

const mockBeds: BedData[] = [
  { id: '1', bedNumber: 'G-101', ward: 'General Ward A', type: 'general', status: 'occupied', patientName: 'John Smith', admissionDate: '2024-01-15' },
  { id: '2', bedNumber: 'G-102', ward: 'General Ward A', type: 'general', status: 'available' },
  { id: '3', bedNumber: 'G-103', ward: 'General Ward A', type: 'general', status: 'available' },
  { id: '4', bedNumber: 'ICU-01', ward: 'ICU', type: 'icu', status: 'occupied', patientName: 'Robert Williams', admissionDate: '2024-01-10' },
  { id: '5', bedNumber: 'ICU-02', ward: 'ICU', type: 'icu', status: 'reserved' },
  { id: '6', bedNumber: 'ICU-03', ward: 'ICU', type: 'icu', status: 'available' },
  { id: '7', bedNumber: 'P-201', ward: 'Private Wing', type: 'private', status: 'occupied', patientName: 'David Brown', admissionDate: '2024-01-18' },
  { id: '8', bedNumber: 'P-202', ward: 'Private Wing', type: 'private', status: 'maintenance' },
  { id: '9', bedNumber: 'SP-301', ward: 'Semi-Private', type: 'semi-private', status: 'available' },
  { id: '10', bedNumber: 'SP-302', ward: 'Semi-Private', type: 'semi-private', status: 'occupied', patientName: 'Mary Johnson', admissionDate: '2024-01-12' },
];

const statusStyles = {
  available: 'bg-success/10 text-success border-success/20',
  occupied: 'bg-primary/10 text-primary border-primary/20',
  maintenance: 'bg-warning/10 text-warning border-warning/20',
  reserved: 'bg-muted text-muted-foreground border-muted',
};

const typeStyles = {
  general: 'bg-muted text-foreground',
  icu: 'bg-destructive/10 text-destructive',
  private: 'bg-primary/10 text-primary',
  'semi-private': 'bg-accent text-accent-foreground',
};

export default function BedsPage() {
  const [beds, setBeds] = useState<BedData[]>(mockBeds);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editBed, setEditBed] = useState<BedData | null>(null);
  const [deleteBed, setDeleteBed] = useState<BedData | null>(null);

  const [formData, setFormData] = useState({
    bedNumber: '',
    ward: '',
    type: 'general' as BedData['type'],
    status: 'available' as BedData['status'],
  });

  const filteredBeds = beds.filter((bed) => {
    const matchesSearch =
      bed.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
      bed.ward.toLowerCase().includes(search.toLowerCase()) ||
      bed.patientName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bed.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    if (editBed) {
      setBeds(beds.map((b) => (b.id === editBed.id ? { ...b, ...formData } : b)));
      toast({ title: 'Bed Updated', description: 'Bed information has been updated.' });
      setEditBed(null);
    } else {
      const newBed: BedData = {
        ...formData,
        id: Date.now().toString(),
      };
      setBeds([...beds, newBed]);
      toast({ title: 'Bed Added', description: `Bed ${formData.bedNumber} has been added.` });
      setAddModalOpen(false);
    }
    setFormData({ bedNumber: '', ward: '', type: 'general', status: 'available' });
  };

  const handleDelete = () => {
    if (!deleteBed) return;
    setBeds(beds.filter((b) => b.id !== deleteBed.id));
    toast({ title: 'Bed Removed', description: `Bed ${deleteBed.bedNumber} has been removed.`, variant: 'destructive' });
    setDeleteBed(null);
  };

  const openEditModal = (bed: BedData) => {
    setFormData({
      bedNumber: bed.bedNumber,
      ward: bed.ward,
      type: bed.type,
      status: bed.status,
    });
    setEditBed(bed);
  };

  const stats = {
    total: beds.length,
    available: beds.filter((b) => b.status === 'available').length,
    occupied: beds.filter((b) => b.status === 'occupied').length,
    maintenance: beds.filter((b) => b.status === 'maintenance').length,
  };

  const isFormOpen = addModalOpen || !!editBed;

  return (
    <DashboardLayout title="Bed Management" subtitle="Manage hospital beds and occupancy">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search beds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Status:</span> {statusFilter === 'all' ? 'All' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('available')}>Available</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('occupied')}>Occupied</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('reserved')}>Reserved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('maintenance')}>Maintenance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Bed
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Beds</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-success">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl font-bold text-primary">{stats.occupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-warning">{stats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => (
          <Card key={bed.id} className={cn("shadow-card hover:shadow-elevated transition-shadow", bed.status === 'available' && 'border-success/30')}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg", bed.status === 'available' ? 'bg-success/10' : 'bg-muted')}>
                    <Bed className={cn("w-5 h-5", bed.status === 'available' ? 'text-success' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{bed.bedNumber}</CardTitle>
                    <p className="text-xs text-muted-foreground">{bed.ward}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditModal(bed)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteBed(bed)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={cn('capitalize text-xs', typeStyles[bed.type])}>
                  {bed.type}
                </Badge>
                <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[bed.status])}>
                  {bed.status}
                </Badge>
              </div>
              {bed.patientName && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium truncate">{bed.patientName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Since: {bed.admissionDate}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBeds.length === 0 && (
        <div className="text-center py-12">
          <Bed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No beds found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setAddModalOpen(false); setEditBed(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editBed ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bed Number</Label>
                <Input
                  value={formData.bedNumber}
                  onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                  placeholder="e.g., G-101"
                />
              </div>
              <div className="space-y-2">
                <Label>Ward</Label>
                <Input
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  placeholder="e.g., General Ward A"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as BedData['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="semi-private">Semi-Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as BedData['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddModalOpen(false); setEditBed(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editBed ? 'Update' : 'Add Bed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteConfirmModal
        title="Delete Bed"
        description={`Are you sure you want to remove bed ${deleteBed?.bedNumber}? This action cannot be undone.`}
        open={!!deleteBed}
        onOpenChange={(open) => !open && setDeleteBed(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
