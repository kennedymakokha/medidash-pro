import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, Plus, MoreHorizontal, Eye, Download, FileText, Filter,
  Calendar, User, Stethoscope, FileBarChart, FilePlus, ClipboardList,
  DollarSign 
} from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/loaders';

// Redux Hooks
import { useFetchvisitsQuery, useFetchvisitlabordersQuery } from '@/features/visitsSlice';
import { cn } from '@/lib/utils'; // Assuming you have a utility for tailwind classes

// ---------------- TYPES ----------------

interface Report {
  id: string;
  title: string;
  type: 'lab' | 'radiology' | 'discharge' | 'prescription' | 'general' | 'billing';
  patientName: string;
  doctorName: string;
  date: string;
  status: 'pending' | 'completed' | 'reviewed';
  summary?: string;
}

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
};

const typeStyles = {
  lab: { bg: 'bg-purple-100', color: 'text-purple-700', icon: FileBarChart },
  radiology: { bg: 'bg-orange-100', color: 'text-orange-700', icon: FileText },
  discharge: { bg: 'bg-green-100', color: 'text-green-700', icon: ClipboardList },
  prescription: { bg: 'bg-pink-100', color: 'text-pink-700', icon: FilePlus },
  general: { bg: 'bg-slate-100', color: 'text-slate-700', icon: FileText },
  billing: { bg: 'bg-emerald-100', color: 'text-emerald-700', icon: DollarSign },
};

// ---------------- HELPERS ----------------

function mapVisitsToReports(visits: any[]): Report[] {
  return (visits || []).map((v: any) => {
    const hasLab = v.labOrders && v.labOrders.length > 0;
    const hasDiagnosis = !!v.diagnosis;
    const type: Report['type'] = hasLab ? 'lab' : 'general';
    
    let status: Report['status'] = 'pending';
    if (v.track === 'completed' || v.disposition) status = 'completed';
    else if (v.diagnosis) status = 'reviewed';

    return {
      id: v._id ?? v.id ?? Math.random().toString(),
      title: hasDiagnosis ? `Diagnosis: ${v.diagnosis}` : hasLab ? 'Lab Order Report' : `Visit Report`,
      type,
      patientName: v.patientMongoose?.name ?? 'Unknown Patient',
      doctorName: v.assignedDoctor?.name ?? 'Unassigned',
      date: v.createdAt ? new Date(v.createdAt).toISOString().split('T')[0] : '',
      status,
      summary: v.notes ?? v.chiefComplaint ?? '',
    };
  });
}

function mapLabOrdersToReports(orders: any[]): Report[] {
  return (orders || []).map((o: any) => ({
    id: o._id ?? o.uuid ?? Math.random().toString(),
    title: `Lab: ${o.testId?.testName ?? o.testName ?? 'Unknown Test'}`,
    type: 'lab' as const,
    patientName: o.visitId?.patientMongoose?.name ?? o.patientName ?? 'Unknown',
    doctorName: o.visitId?.assignedDoctor?.name ?? o.orderedBy ?? 'Unassigned',
    date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
    status: o.status === 'completed' ? 'completed' as const : 'pending' as const,
    summary: o.result ?? `${o.testId?.testName ?? ''} - ${o.status}`,
  }));
}

// ---------------- PAGE COMPONENT ----------------

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', type: 'general' as Report['type'], patientName: '', summary: '',
  });

  const { data: visitsData, isLoading: visitsLoading } = useFetchvisitsQuery({ page: 1, limit: 100 });
  const { data: labsData, isLoading: labsLoading } = useFetchvisitlabordersQuery({ page: 1, limit: 100 });

  const isLoading = visitsLoading || labsLoading;

  // Memoized Combined Reports
  const reports = useMemo(() => {
    const visitReports = mapVisitsToReports(visitsData?.data);
    const labReports = mapLabOrdersToReports(labsData?.data);
    
    const seen = new Set<string>();
    const combined: Report[] = [];

    [...labReports, ...visitReports].forEach(r => {
      if (r.id && !seen.has(r.id)) {
        seen.add(r.id);
        combined.push(r);
      }
    });

    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [visitsData, labsData]);

  // Derived Stats
  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    completed: reports.filter(r => r.status === 'completed').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
  }), [reports]);

  // Filtering Logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                         r.patientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDownloadPDF = (report: Report) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MEDICAL REPORT", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Title', report.title],
        ['Type', report.type],
        ['Patient', report.patientName],
        ['Doctor', report.doctorName],
        ['Date', report.date],
        ['Status', report.status],
      ],
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text("Summary:", 14, finalY + 10);
    doc.setFontSize(12);
    doc.text(report.summary || "No notes", 14, finalY + 20);

    doc.save(`${report.patientName}_report.pdf`);
    toast({ title: 'Downloaded', description: 'PDF generated successfully' });
  };

  const handleCreate = () => {
    toast({ title: 'Report Created', description: `${formData.title} has been created.` });
    setCreateModalOpen(false);
    setFormData({ title: '', type: 'general', patientName: '', summary: '' });
  };

  if (isLoading) return <TableSkeleton rows={6} columns={4} />;

  return (
    <DashboardLayout title="Reports" subtitle="View and manage medical reports">
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span>Type: {typeFilter === 'all' ? 'All' : typeFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['all', 'lab', 'radiology', 'discharge', 'prescription', 'general'].map(t => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)} className="capitalize">
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Report
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', iconColor: 'bg-primary/10 text-primary' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600', iconColor: 'bg-yellow-100 text-yellow-600' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600', iconColor: 'bg-green-100 text-green-600' },
          { label: 'Reviewed', value: stats.reviewed, color: 'text-blue-600', iconColor: 'bg-blue-100 text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", s.iconColor)}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const typeConfig = typeStyles[report.type] || typeStyles.general;
          const Icon = typeConfig.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", typeConfig.bg)}>
                      <Icon className={cn("w-5 h-5", typeConfig.color)} />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold truncate max-w-[150px]">{report.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] uppercase mt-1">{report.type}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewReport(report)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadPDF(report)}><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-3.5 h-3.5" /> <span className="truncate">{report.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> <span>{report.date}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Badge className={cn('capitalize border', statusStyles[report.status])}>{report.status}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-20 border rounded-xl bg-muted/20">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No reports found</h3>
        </div>
      )}

      {/* View Modal */}
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report Details</DialogTitle></DialogHeader>
          {viewReport && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", typeStyles[viewReport.type].bg)}>
                  {(() => { const Icon = typeStyles[viewReport.type].icon; return <Icon className={cn("w-6 h-6", typeStyles[viewReport.type].color)} />; })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewReport.title}</h3>
                  <p className="text-sm text-muted-foreground">{viewReport.patientName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div><p className="text-muted-foreground">Doctor</p><p className="font-medium">{viewReport.doctorName}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{viewReport.date}</p></div>
              </div>
              {viewReport.summary && (
                <div>
                   <Label className="text-muted-foreground">Summary</Label>
                   <p className="text-sm mt-1 p-3 border rounded-md">{viewReport.summary}</p>
                </div>
              )}
              <Button onClick={() => handleDownloadPDF(viewReport)} className="w-full gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Report</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Report Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Report['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}