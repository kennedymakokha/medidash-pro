import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search, Plus, MoreHorizontal, Eye, Download, FileText, Filter,
  Calendar, User, Stethoscope, FileBarChart, FilePlus, ClipboardList,
} from 'lucide-react';
import { useFetchvisitsQuery, useFetchvisitlabordersQuery } from '@/features/visitsSlice';
import { useFetchpatientsQuery } from '@/features/patientSlice';
import { TableSkeleton } from '@/components/loaders';

interface Report {
  id: string;
  title: string;
  type: 'lab' | 'radiology' | 'discharge' | 'prescription' | 'general';
  patientName: string;
  doctorName: string;
  date: string;
  status: 'pending' | 'completed' | 'reviewed';
  summary?: string;
}

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  reviewed: 'bg-primary/10 text-primary border-primary/20',
};

const typeStyles = {
  lab: { bg: 'bg-primary/10', color: 'text-primary', icon: FileBarChart },
  radiology: { bg: 'bg-warning/10', color: 'text-warning', icon: FileText },
  discharge: { bg: 'bg-success/10', color: 'text-success', icon: ClipboardList },
  prescription: { bg: 'bg-accent', color: 'text-accent-foreground', icon: FilePlus },
  general: { bg: 'bg-muted', color: 'text-foreground', icon: FileText },
};

function mapVisitsToReports(visits: any[]): Report[] {
  return visits.map((v: any) => {
    const hasLab = v.labOrders && v.labOrders.length > 0;
    const hasDiagnosis = !!v.diagnosis;
    const type: Report['type'] = hasLab ? 'lab' : hasDiagnosis ? 'general' : 'general';
    
    let status: Report['status'] = 'pending';
    if (v.track === 'completed' || v.disposition) status = 'completed';
    else if (v.diagnosis) status = 'reviewed';

    return {
      id: v._id ?? v.id ?? '',
      title: hasDiagnosis ? `Diagnosis: ${v.diagnosis}` : hasLab ? 'Lab Order Report' : `Visit Report - ${v.track ?? 'general'}`,
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
  return orders.map((o: any) => ({
    id: o._id ?? o.uuid ?? '',
    title: `Lab: ${o.testId?.testName ?? o.testName ?? 'Unknown Test'}`,
    type: 'lab' as const,
    patientName: o.visitId?.patientMongoose?.name ?? o.patientName ?? 'Unknown',
    doctorName: o.visitId?.assignedDoctor?.name ?? o.orderedBy ?? 'Unassigned',
    date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
    status: o.status === 'completed' ? 'completed' as const : 'pending' as const,
    summary: o.result ?? `${o.testId?.testName ?? ''} - ${o.status}`,
  }));
}

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page] = useState(1);

  const { data: visitsData, isLoading: visitsLoading } = useFetchvisitsQuery({
    page, limit: 100, search: '', track: '',
  });
  const { data: labsData, isLoading: labsLoading } = useFetchvisitlabordersQuery({
    page, limit: 100, search: '', status: '',
  });

  const isLoading = visitsLoading || labsLoading;

  const reports = useMemo(() => {
    const visitReports = mapVisitsToReports(visitsData?.data ?? []);
    const labReports = mapLabOrdersToReports(labsData?.data ?? []);
    
    // Deduplicate by id
    const seen = new Set<string>();
    const combined: Report[] = [];
    [...labReports, ...visitReports].forEach(r => {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        combined.push(r);
      }
    });
    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [visitsData, labsData]);

  const [formData, setFormData] = useState({
    title: '', type: 'general' as Report['type'], patientName: '', summary: '',
  });

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.patientName.toLowerCase().includes(search.toLowerCase()) ||
      report.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    toast({ title: 'Report Created', description: `${formData.title} has been created.` });
    setCreateModalOpen(false);
    setFormData({ title: '', type: 'general', patientName: '', summary: '' });
  };

  const handleDownload = (report: Report) => {
    toast({ title: 'Downloading', description: `Downloading ${report.title}...` });
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    completed: reports.filter((r) => r.status === 'completed').length,
    reviewed: reports.filter((r) => r.status === 'reviewed').length,
  };

  return (
    <DashboardLayout title="Reports" subtitle="View and manage medical reports">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Type:</span> {typeFilter === 'all' ? 'All' : typeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('lab')}>Lab</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('radiology')}>Radiology</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('discharge')}>Discharge</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('prescription')}>Prescription</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('general')}>General</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span> Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-card-foreground', iconColor: 'bg-primary/10 text-primary' },
          { label: 'Pending', value: stats.pending, color: 'text-warning', iconColor: 'bg-warning/10 text-warning' },
          { label: 'Completed', value: stats.completed, color: 'text-success', iconColor: 'bg-success/10 text-success' },
          { label: 'Reviewed', value: stats.reviewed, color: 'text-primary', iconColor: 'bg-primary/10 text-primary' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.iconColor.split(' ')[0]}`}>
                <FileText className={`w-5 h-5 ${s.iconColor.split(' ')[1]}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : (
        <>
          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const typeConfig = typeStyles[report.type];
              const Icon = typeConfig.icon;
              return (
                <Card key={report.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", typeConfig.bg)}>
                          <Icon className={cn("w-5 h-5", typeConfig.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base truncate">{report.title}</CardTitle>
                          <Badge className={cn('capitalize text-xs mt-1', typeConfig.bg, typeConfig.color)}>{report.type}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewReport(report)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(report)}><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3 h-3" /><span className="truncate">{report.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Stethoscope className="w-3 h-3" /><span className="truncate">{report.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3" /><span>{report.date}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Badge variant="outline" className={cn('capitalize', statusStyles[report.status])}>{report.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No reports found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Report Details</DialogTitle></DialogHeader>
          {viewReport && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", typeStyles[viewReport.type].bg)}>
                  {(() => { const Icon = typeStyles[viewReport.type].icon; return <Icon className={cn("w-6 h-6", typeStyles[viewReport.type].color)} />; })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewReport.title}</h3>
                  <Badge className={cn('capitalize', typeStyles[viewReport.type].bg, typeStyles[viewReport.type].color)}>{viewReport.type}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Patient</p><p className="font-medium">{viewReport.patientName}</p></div>
                <div><p className="text-muted-foreground">Doctor</p><p className="font-medium">{viewReport.doctorName}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{viewReport.date}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant="outline" className={cn('capitalize', statusStyles[viewReport.status])}>{viewReport.status}</Badge></div>
              </div>
              {viewReport.summary && (
                <div><p className="text-muted-foreground text-sm mb-1">Summary</p><p className="text-sm bg-muted/50 p-3 rounded-lg">{viewReport.summary}</p></div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => handleDownload(viewReport)} className="gap-2"><Download className="w-4 h-4" /> Download Report</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New Report</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter report title" />
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
                    <SelectItem value="discharge">Discharge</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} placeholder="Patient name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Enter report summary..." rows={4} />
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
