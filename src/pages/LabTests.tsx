import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/table/DataTable';
import {
  TestTube,
  Syringe,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { LabTest, Procedure } from '@/types/billing';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';

const mockLabTests: LabTest[] = [
  { id: '1', name: 'Complete Blood Count (CBC)', category: 'blood', description: 'Full blood panel including WBC, RBC, platelets', price: 45, turnaroundTime: '2-4 hours', requiresFasting: false, status: 'active' },
  { id: '2', name: 'Lipid Panel', category: 'blood', description: 'Cholesterol and triglyceride levels', price: 55, turnaroundTime: '4-6 hours', requiresFasting: true, status: 'active' },
  { id: '3', name: 'Urinalysis', category: 'urine', description: 'Complete urine analysis', price: 30, turnaroundTime: '1-2 hours', requiresFasting: false, status: 'active' },
  { id: '4', name: 'Chest X-Ray', category: 'imaging', description: 'Standard chest radiograph', price: 120, turnaroundTime: '30 min', requiresFasting: false, status: 'active' },
  { id: '5', name: 'MRI Brain', category: 'imaging', description: 'Magnetic resonance imaging of brain', price: 850, turnaroundTime: '1-2 days', requiresFasting: false, status: 'active' },
  { id: '6', name: 'Biopsy Analysis', category: 'pathology', description: 'Tissue sample analysis', price: 200, turnaroundTime: '3-5 days', requiresFasting: false, status: 'active' },
  { id: '7', name: 'Blood Sugar (Fasting)', category: 'blood', description: 'Fasting glucose test', price: 25, turnaroundTime: '1 hour', requiresFasting: true, status: 'active' },
  { id: '8', name: 'Thyroid Panel', category: 'blood', description: 'TSH, T3, T4 levels', price: 85, turnaroundTime: '4-6 hours', requiresFasting: false, status: 'inactive' },
];

const mockProcedures: Procedure[] = [
  { id: '1', name: 'ECG/EKG', category: 'diagnostic', description: 'Electrocardiogram', price: 75, duration: '15 min', requiresAnesthesia: false, status: 'active' },
  { id: '2', name: 'Echocardiogram', category: 'diagnostic', description: 'Ultrasound of heart', price: 350, duration: '45 min', requiresAnesthesia: false, status: 'active' },
  { id: '3', name: 'Endoscopy', category: 'diagnostic', description: 'Upper GI examination', price: 800, duration: '30 min', requiresAnesthesia: true, status: 'active' },
  { id: '4', name: 'Colonoscopy', category: 'diagnostic', description: 'Colon examination', price: 1200, duration: '45 min', requiresAnesthesia: true, status: 'active' },
  { id: '5', name: 'Wound Suturing', category: 'minor', description: 'Minor wound closure', price: 150, duration: '20 min', requiresAnesthesia: true, status: 'active' },
  { id: '6', name: 'Cardiac Catheterization', category: 'major', description: 'Heart catheter procedure', price: 5000, duration: '2 hours', requiresAnesthesia: true, status: 'active' },
  { id: '7', name: 'Physical Therapy Session', category: 'therapeutic', description: '1-hour therapy session', price: 120, duration: '1 hour', requiresAnesthesia: false, status: 'active' },
  { id: '8', name: 'IV Infusion', category: 'therapeutic', description: 'Intravenous medication delivery', price: 85, duration: '30-60 min', requiresAnesthesia: false, status: 'active' },
];

const testCategoryStyles = {
  blood: 'bg-destructive/10 text-destructive',
  urine: 'bg-warning/10 text-warning',
  imaging: 'bg-info/10 text-info',
  pathology: 'bg-primary/10 text-primary',
  other: 'bg-muted text-muted-foreground',
};

const procedureCategoryStyles = {
  minor: 'bg-success/10 text-success',
  major: 'bg-destructive/10 text-destructive',
  diagnostic: 'bg-info/10 text-info',
  therapeutic: 'bg-primary/10 text-primary',
};

export default function LabTestsPage() {
  const [labTests, setLabTests] = useState<LabTest[]>(mockLabTests);
  const [procedures, setProcedures] = useState<Procedure[]>(mockProcedures);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tests');

  // Lab Test Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [deleteTest, setDeleteTest] = useState<LabTest | null>(null);
  const [testFormData, setTestFormData] = useState({
    name: '',
    category: 'blood' as LabTest['category'],
    description: '',
    price: '',
    turnaroundTime: '',
    requiresFasting: false,
    status: 'active' as LabTest['status'],
  });

  // Procedure Modal State
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [deleteProcedure, setDeleteProcedure] = useState<Procedure | null>(null);
  const [procedureFormData, setProcedureFormData] = useState({
    name: '',
    category: 'minor' as Procedure['category'],
    description: '',
    price: '',
    duration: '',
    requiresAnesthesia: false,
    status: 'active' as Procedure['status'],
  });

  const filteredTests = labTests.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProcedures = procedures.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lab Test Handlers
  const handleOpenTestModal = (test?: LabTest) => {
    if (test) {
      setEditingTest(test);
      setTestFormData({
        name: test.name,
        category: test.category,
        description: test.description,
        price: test.price.toString(),
        turnaroundTime: test.turnaroundTime,
        requiresFasting: test.requiresFasting,
        status: test.status,
      });
    } else {
      setEditingTest(null);
      setTestFormData({
        name: '',
        category: 'blood',
        description: '',
        price: '',
        turnaroundTime: '',
        requiresFasting: false,
        status: 'active',
      });
    }
    setIsTestModalOpen(true);
  };

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTest) {
      setLabTests(labTests.map(t =>
        t.id === editingTest.id
          ? { ...t, ...testFormData, price: parseFloat(testFormData.price) }
          : t
      ));
      toast({ title: 'Updated', description: 'Lab test updated successfully.' });
    } else {
      const newTest: LabTest = {
        id: `test-${Date.now()}`,
        ...testFormData,
        price: parseFloat(testFormData.price),
      };
      setLabTests([newTest, ...labTests]);
      toast({ title: 'Added', description: 'New lab test added.' });
    }
    setIsTestModalOpen(false);
  };

  const handleDeleteTest = () => {
    if (!deleteTest) return;
    setLabTests(labTests.filter(t => t.id !== deleteTest.id));
    toast({ title: 'Deleted', description: 'Lab test removed.', variant: 'destructive' });
    setDeleteTest(null);
  };

  // Procedure Handlers
  const handleOpenProcedureModal = (procedure?: Procedure) => {
    if (procedure) {
      setEditingProcedure(procedure);
      setProcedureFormData({
        name: procedure.name,
        category: procedure.category,
        description: procedure.description,
        price: procedure.price.toString(),
        duration: procedure.duration,
        requiresAnesthesia: procedure.requiresAnesthesia,
        status: procedure.status,
      });
    } else {
      setEditingProcedure(null);
      setProcedureFormData({
        name: '',
        category: 'minor',
        description: '',
        price: '',
        duration: '',
        requiresAnesthesia: false,
        status: 'active',
      });
    }
    setIsProcedureModalOpen(true);
  };

  const handleSubmitProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProcedure) {
      setProcedures(procedures.map(p =>
        p.id === editingProcedure.id
          ? { ...p, ...procedureFormData, price: parseFloat(procedureFormData.price) }
          : p
      ));
      toast({ title: 'Updated', description: 'Procedure updated successfully.' });
    } else {
      const newProcedure: Procedure = {
        id: `proc-${Date.now()}`,
        ...procedureFormData,
        price: parseFloat(procedureFormData.price),
      };
      setProcedures([newProcedure, ...procedures]);
      toast({ title: 'Added', description: 'New procedure added.' });
    }
    setIsProcedureModalOpen(false);
  };

  const handleDeleteProcedure = () => {
    if (!deleteProcedure) return;
    setProcedures(procedures.filter(p => p.id !== deleteProcedure.id));
    toast({ title: 'Deleted', description: 'Procedure removed.', variant: 'destructive' });
    setDeleteProcedure(null);
  };

  const testStats = {
    total: labTests.length,
    active: labTests.filter(t => t.status === 'active').length,
    avgPrice: Math.round(labTests.reduce((sum, t) => sum + t.price, 0) / labTests.length),
  };

  const procedureStats = {
    total: procedures.length,
    active: procedures.filter(p => p.status === 'active').length,
    avgPrice: Math.round(procedures.reduce((sum, p) => sum + p.price, 0) / procedures.length),
  };

  return (
    <DashboardLayout title="Lab Tests & Procedures" subtitle="Manage lab tests and medical procedures with pricing">
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
                  <p className="text-2xl font-bold">{testStats.total}</p>
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
                  <p className="text-2xl font-bold">{procedureStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Test Price</p>
                  <p className="text-2xl font-bold">${testStats.avgPrice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <DollarSign className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Procedure Price</p>
                  <p className="text-2xl font-bold">${procedureStats.avgPrice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tests or procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => activeTab === 'tests' ? handleOpenTestModal() : handleOpenProcedureModal()}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'tests' ? 'Lab Test' : 'Procedure'}
          </Button>
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

          {/* Lab Tests Tab */}
          <TabsContent value="tests">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Test Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell">Turnaround</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden sm:table-cell">Fasting</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTests.map((test) => (
                        <tr key={test.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <p className="font-medium">{test.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{test.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('capitalize', testCategoryStyles[test.category])}>
                              {test.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {test.turnaroundTime}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold">${test.price}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {test.requiresFasting && (
                              <Badge variant="outline" className="gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Yes
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                              {test.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenTestModal(test)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteTest(test)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Procedure Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell">Duration</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden sm:table-cell">Anesthesia</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProcedures.map((proc) => (
                        <tr key={proc.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <p className="font-medium">{proc.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{proc.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('capitalize', procedureCategoryStyles[proc.category])}>
                              {proc.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {proc.duration}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold">${proc.price}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {proc.requiresAnesthesia && (
                              <Badge variant="outline" className="gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Required
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={proc.status === 'active' ? 'default' : 'secondary'}>
                              {proc.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenProcedureModal(proc)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteProcedure(proc)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lab Test Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Lab Test' : 'Add Lab Test'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTest} className="space-y-4">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input
                value={testFormData.name}
                onChange={(e) => setTestFormData({ ...testFormData, name: e.target.value })}
                placeholder="e.g., Complete Blood Count"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={testFormData.category}
                  onValueChange={(v) => setTestFormData({ ...testFormData, category: v as LabTest['category'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood">Blood</SelectItem>
                    <SelectItem value="urine">Urine</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="pathology">Pathology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={testFormData.price}
                  onChange={(e) => setTestFormData({ ...testFormData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={testFormData.description}
                onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Turnaround Time</Label>
                <Input
                  value={testFormData.turnaroundTime}
                  onChange={(e) => setTestFormData({ ...testFormData, turnaroundTime: e.target.value })}
                  placeholder="e.g., 2-4 hours"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={testFormData.status}
                  onValueChange={(v) => setTestFormData({ ...testFormData, status: v as LabTest['status'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label htmlFor="fasting" className="cursor-pointer">Requires Fasting</Label>
              <Switch
                id="fasting"
                checked={testFormData.requiresFasting}
                onCheckedChange={(checked) => setTestFormData({ ...testFormData, requiresFasting: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTest ? 'Update' : 'Add Test'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Procedure Modal */}
      <Dialog open={isProcedureModalOpen} onOpenChange={setIsProcedureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProcedure ? 'Edit Procedure' : 'Add Procedure'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProcedure} className="space-y-4">
            <div className="space-y-2">
              <Label>Procedure Name</Label>
              <Input
                value={procedureFormData.name}
                onChange={(e) => setProcedureFormData({ ...procedureFormData, name: e.target.value })}
                placeholder="e.g., ECG/EKG"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={procedureFormData.category}
                  onValueChange={(v) => setProcedureFormData({ ...procedureFormData, category: v as Procedure['category'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="therapeutic">Therapeutic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={procedureFormData.price}
                  onChange={(e) => setProcedureFormData({ ...procedureFormData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={procedureFormData.description}
                onChange={(e) => setProcedureFormData({ ...procedureFormData, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={procedureFormData.duration}
                  onChange={(e) => setProcedureFormData({ ...procedureFormData, duration: e.target.value })}
                  placeholder="e.g., 30 min"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={procedureFormData.status}
                  onValueChange={(v) => setProcedureFormData({ ...procedureFormData, status: v as Procedure['status'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label htmlFor="anesthesia" className="cursor-pointer">Requires Anesthesia</Label>
              <Switch
                id="anesthesia"
                checked={procedureFormData.requiresAnesthesia}
                onCheckedChange={(checked) => setProcedureFormData({ ...procedureFormData, requiresAnesthesia: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProcedureModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingProcedure ? 'Update' : 'Add Procedure'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modals */}
      <DeleteConfirmModal
        title="Delete Lab Test"
        description={`Are you sure you want to delete "${deleteTest?.name}"? This action cannot be undone.`}
        open={!!deleteTest}
        onOpenChange={(open) => !open && setDeleteTest(null)}
        onConfirm={handleDeleteTest}
      />

      <DeleteConfirmModal
        title="Delete Procedure"
        description={`Are you sure you want to delete "${deleteProcedure?.name}"? This action cannot be undone.`}
        open={!!deleteProcedure}
        onOpenChange={(open) => !open && setDeleteProcedure(null)}
        onConfirm={handleDeleteProcedure}
      />
    </DashboardLayout>
  );
}
