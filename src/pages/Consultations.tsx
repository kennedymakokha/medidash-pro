import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Stethoscope,
  TestTube,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  ArrowRight,
  User,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Consultation } from '@/types/billing';
import { mockDepartments, mockPatients, mockDoctors } from '@/data/mockData';

const mockConsultations: Consultation[] = [
  {
    id: '1',
    patientId: 'patient-001',
    patientName: 'John Smith',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen',
    departmentId: '1',
    departmentName: 'Cardiology',
    stage: 'pre-lab',
    chiefComplaint: 'Chest pain and shortness of breath',
    symptoms: ['chest pain', 'shortness of breath', 'fatigue'],
    prescribedTests: ['ECG', 'Chest X-Ray', 'Blood Panel'],
    prescribedProcedures: [],
    notes: 'Patient reports intermittent chest pain for the past week.',
    consultationFee: 150,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '2',
    patientId: 'patient-002',
    patientName: 'Mary Johnson',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Sarah Lee',
    departmentId: '2',
    departmentName: 'Neurology',
    stage: 'awaiting-lab',
    chiefComplaint: 'Recurring headaches',
    symptoms: ['headaches', 'dizziness', 'nausea'],
    prescribedTests: ['MRI Brain', 'Blood Sugar'],
    prescribedProcedures: [],
    notes: 'Scheduled for MRI. Results pending.',
    consultationFee: 200,
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-19T15:30:00Z',
  },
  {
    id: '3',
    patientId: 'patient-003',
    patientName: 'Robert Williams',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen',
    departmentId: '1',
    departmentName: 'Cardiology',
    stage: 'post-lab',
    chiefComplaint: 'Follow-up after cardiac event',
    symptoms: ['mild chest discomfort'],
    prescribedTests: ['Stress Test', 'Lipid Panel'],
    testResults: { 'Stress Test': 'Normal', 'Lipid Panel': 'Elevated cholesterol' },
    prescribedProcedures: [],
    medications: ['Atorvastatin 20mg', 'Aspirin 81mg'],
    diagnosis: 'Hyperlipidemia',
    notes: 'Lab results reviewed. Starting statin therapy.',
    consultationFee: 150,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '4',
    patientId: 'patient-004',
    patientName: 'Jennifer Davis',
    doctorId: 'doctor-4',
    doctorName: 'Dr. Emily White',
    departmentId: '4',
    departmentName: 'Pediatrics',
    stage: 'completed',
    chiefComplaint: 'Annual checkup',
    symptoms: [],
    prescribedTests: [],
    prescribedProcedures: [],
    diagnosis: 'Healthy',
    notes: 'Routine checkup complete. All vitals normal.',
    consultationFee: 100,
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:45:00Z',
  },
];

const stageStyles = {
  'pre-lab': { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20', label: 'Pre-Lab' },
  'awaiting-lab': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', label: 'Awaiting Lab' },
  'post-lab': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', label: 'Post-Lab' },
  'completed': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', label: 'Completed' },
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    chiefComplaint: '',
    symptoms: '',
    prescribedTests: '',
    notes: '',
  });

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stats = {
    preLab: consultations.filter(c => c.stage === 'pre-lab').length,
    awaitingLab: consultations.filter(c => c.stage === 'awaiting-lab').length,
    postLab: consultations.filter(c => c.stage === 'post-lab').length,
    completed: consultations.filter(c => c.stage === 'completed').length,
  };

  const handleOpenAddModal = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      departmentId: '',
      chiefComplaint: '',
      symptoms: '',
      prescribedTests: '',
      notes: '',
    });
    setEditingConsultation(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (consultation: Consultation) => {
    setFormData({
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      departmentId: consultation.departmentId,
      chiefComplaint: consultation.chiefComplaint,
      symptoms: consultation.symptoms.join(', '),
      prescribedTests: consultation.prescribedTests.join(', '),
      notes: consultation.notes,
    });
    setEditingConsultation(consultation);
    setIsFormModalOpen(true);
  };

  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
  };

  const handleAdvanceStage = (consultation: Consultation) => {
    const stageOrder: Consultation['stage'][] = ['pre-lab', 'awaiting-lab', 'post-lab', 'completed'];
    const currentIndex = stageOrder.indexOf(consultation.stage);
    if (currentIndex < stageOrder.length - 1) {
      const newStage = stageOrder[currentIndex + 1];
      setConsultations(consultations.map(c =>
        c.id === consultation.id ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c
      ));
      toast({
        title: 'Stage Updated',
        description: `Consultation moved to ${stageStyles[newStage].label}.`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = mockPatients.find(p => p.id === formData.patientId);
    const doctor = mockDoctors.find(d => d.id === formData.doctorId);
    const department = mockDepartments.find(d => d._id === formData.departmentId);

    if (!patient || !doctor || !department) {
      toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    if (editingConsultation) {
      setConsultations(consultations.map(c =>
        c.id === editingConsultation.id
          ? {
              ...c,
              chiefComplaint: formData.chiefComplaint,
              symptoms: formData.symptoms.split(',').map(s => s.trim()),
              prescribedTests: formData.prescribedTests.split(',').map(t => t.trim()),
              notes: formData.notes,
              updatedAt: new Date().toISOString(),
            }
          : c
      ));
      toast({ title: 'Updated', description: 'Consultation updated successfully.' });
    } else {
      const newConsultation: Consultation = {
        id: `cons-${Date.now()}`,
        patientId: formData.patientId,
        patientName: patient.name,
        doctorId: formData.doctorId,
        doctorName: doctor.name,
        departmentId: formData.departmentId,
        departmentName: department.name,
        stage: 'pre-lab',
        chiefComplaint: formData.chiefComplaint,
        symptoms: formData.symptoms.split(',').map(s => s.trim()),
        prescribedTests: formData.prescribedTests.split(',').map(t => t.trim()),
        prescribedProcedures: [],
        notes: formData.notes,
        consultationFee: 150, // Default fee
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConsultations([newConsultation, ...consultations]);
      toast({ title: 'Created', description: 'New consultation started.' });
    }
    setIsFormModalOpen(false);
  };

  return (
    <DashboardLayout title="Consultations" subtitle="Manage patient consultations and lab workflows">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Stethoscope className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pre-Lab</p>
                  <p className="text-2xl font-bold">{stats.preLab}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TestTube className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awaiting Lab</p>
                  <p className="text-2xl font-bold">{stats.awaitingLab}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Post-Lab</p>
                  <p className="text-2xl font-bold">{stats.postLab}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="pre-lab">Pre-Lab</SelectItem>
                <SelectItem value="awaiting-lab">Awaiting Lab</SelectItem>
                <SelectItem value="post-lab">Post-Lab</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOpenAddModal} className="gap-2">
            <Plus className="w-4 h-4" />
            New Consultation
          </Button>
        </div>

        {/* Tabs View */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pre-lab">Pre-Lab</TabsTrigger>
            <TabsTrigger value="awaiting-lab">Awaiting Lab</TabsTrigger>
            <TabsTrigger value="post-lab">Post-Lab</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {['all', 'pre-lab', 'awaiting-lab', 'post-lab', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filteredConsultations
                .filter(c => tab === 'all' || c.stage === tab)
                .map((consultation) => {
                  const style = stageStyles[consultation.stage];
                  return (
                    <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{consultation.patientName}</h3>
                              <p className="text-sm text-muted-foreground">{consultation.doctorName}</p>
                              <p className="text-sm text-muted-foreground">{consultation.departmentName}</p>
                            </div>
                          </div>

                          <div className="flex-1 md:px-6">
                            <p className="font-medium text-sm">{consultation.chiefComplaint}</p>
                            {consultation.prescribedTests.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {consultation.prescribedTests.map((test, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {test}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge className={cn('capitalize', style.bg, style.text, style.border)}>
                              {style.label}
                            </Badge>
                            <div className="flex gap-1">
                              {consultation.stage !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAdvanceStage(consultation)}
                                  className="gap-1"
                                >
                                  Next <ArrowRight className="w-3 h-3" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(consultation)}>
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(consultation)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {filteredConsultations.filter(c => tab === 'all' || c.stage === tab).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No consultations found.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConsultation ? 'Edit Consultation' : 'New Consultation'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(v) => setFormData({ ...formData, patientId: v })}
                  disabled={!!editingConsultation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((p) => (
                      <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(v) => setFormData({ ...formData, doctorId: v })}
                  disabled={!!editingConsultation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
                disabled={!!editingConsultation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chief Complaint</Label>
              <Textarea
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="Patient's main complaint..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Symptoms (comma-separated)</Label>
              <Input
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="headache, fever, fatigue"
              />
            </div>

            <div className="space-y-2">
              <Label>Prescribed Tests (comma-separated)</Label>
              <Input
                value={formData.prescribedTests}
                onChange={(e) => setFormData({ ...formData, prescribedTests: e.target.value })}
                placeholder="Blood Panel, X-Ray"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingConsultation ? 'Update' : 'Start Consultation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedConsultation.patientName}</h3>
                  <p className="text-muted-foreground">{selectedConsultation.doctorName} • {selectedConsultation.departmentName}</p>
                  <Badge className={cn(
                    'mt-1',
                    stageStyles[selectedConsultation.stage].bg,
                    stageStyles[selectedConsultation.stage].text
                  )}>
                    {stageStyles[selectedConsultation.stage].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Chief Complaint</h4>
                  <p>{selectedConsultation.chiefComplaint}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Consultation Fee</h4>
                  <p className="text-lg font-semibold">${selectedConsultation.consultationFee}</p>
                </div>
              </div>

              {selectedConsultation.symptoms.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation.symptoms.map((s, i) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultation.prescribedTests.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Prescribed Tests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConsultation.prescribedTests.map((t, i) => (
                      <Badge key={i} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultation.testResults && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Test Results</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedConsultation.testResults).map(([test, result]) => (
                      <div key={test} className="flex justify-between p-2 bg-muted rounded">
                        <span>{test}</span>
                        <span className="font-medium">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedConsultation.diagnosis && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Diagnosis</h4>
                  <p className="font-semibold">{selectedConsultation.diagnosis}</p>
                </div>
              )}

              {selectedConsultation.medications && selectedConsultation.medications.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Medications</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedConsultation.medications.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsultation.notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
                  <p className="text-sm">{selectedConsultation.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created: {new Date(selectedConsultation.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {new Date(selectedConsultation.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
