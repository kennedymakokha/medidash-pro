import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Plus,
  Download,
  FileText,
  Filter,
  Calendar,
  User,
  FileBarChart,
  FilePlus,
  DollarSign,
  ClipboardList,
} from 'lucide-react';

// --- Types & Role Configuration ---

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

const ROLE_PERMISSIONS: Record<string, Report['type'][]> = {
  admin: ['lab', 'radiology', 'discharge', 'prescription', 'general', 'billing'],
  doctor: ['lab', 'radiology', 'discharge', 'prescription', 'general'],
  nurse: ['lab', 'discharge', 'general'],
  lab_tech: ['lab'],
  finance: ['billing', 'general'],
  receptionist: ['general', 'billing'],
  patient: ['lab', 'radiology', 'prescription', 'general'],
};

const mockReports: Report[] = [
  { id: '1', title: 'Hematology Profile', type: 'lab', patientName: 'John Smith', doctorName: 'Dr. Michael Chen', date: '2024-01-20', status: 'completed', summary: 'WBC and RBC counts are normal. No signs of infection.' },
  { id: '2', title: 'Chest X-Ray Results', type: 'radiology', patientName: 'Mary Johnson', doctorName: 'Dr. Sarah Lee', date: '2024-01-19', status: 'reviewed', summary: 'Clear lung fields. Normal heart size.' },
  { id: '3', title: 'Surgery Discharge', type: 'discharge', patientName: 'Jennifer Davis', doctorName: 'Dr. Emily White', date: '2024-01-18', status: 'completed', summary: 'Patient stable post-op. Follow up in 2 weeks.' },
  { id: '4', title: 'Inpatient Billing Summary', type: 'billing', patientName: 'Robert Williams', doctorName: 'Finance Dept', date: '2024-01-20', status: 'pending', summary: 'Total insurance coverage pending approval.' },
  { id: '5', title: 'Annual Checkup Notes', type: 'general', patientName: 'David Brown', doctorName: 'Dr. James Wilson', date: '2024-01-21', status: 'completed', summary: 'Blood pressure slightly elevated. Suggested diet changes.' },
];

const typeStyles = {
  lab: { bg: 'bg-purple-100', color: 'text-purple-700', icon: FileBarChart },
  radiology: { bg: 'bg-orange-100', color: 'text-orange-700', icon: FileText },
  discharge: { bg: 'bg-green-100', color: 'text-green-700', icon: ClipboardList },
  prescription: { bg: 'bg-pink-100', color: 'text-pink-700', icon: FilePlus },
  general: { bg: 'bg-slate-100', color: 'text-slate-700', icon: FileText },
  billing: { bg: 'bg-emerald-100', color: 'text-emerald-700', icon: DollarSign },
};

// --- Main Component ---

export default function ReportsPage() {
  const { userInfo: { user } } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'patient';
  
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const allowedTypes = ROLE_PERMISSIONS[userRole] || ['general'];

  const [formData, setFormData] = useState({
    title: '',
    type: allowedTypes[0], 
    patientName: '',
    summary: '',
  });

  // --- PDF Logic ---
  const handleDownloadPDF = (report: Report) => {
    const doc = new jsPDF();
    
    // Header styling
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text("MEDICAL REPORT", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Document ID: ${report.id}`, 14, 33);
    doc.text(`Issued: ${new Date().toLocaleDateString()}`, 160, 33);

    // Metadata Table
    autoTable(doc, {
      startY: 50,
      head: [['Category', 'Details']],
      body: [
        ['Report Title', report.title],
        ['Report Type', report.type.toUpperCase()],
        ['Patient Name', report.patientName],
        ['Assigned Staff', report.doctorName],
        ['Status', report.status.toUpperCase()],
        ['Record Date', report.date],
      ],
      headStyles: { fillColor: [79, 70, 229] }, // Indigo
    });

    // Findings Section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text("Clinical Observations & Findings", 14, finalY);

    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    const splitText = doc.splitTextToSize(report.summary || "No notes recorded.", 180);
    doc.text(splitText, 14, finalY + 10);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text("Generated via Hospital Management System - Internal Use Only", 105, 285, { align: 'center' });

    doc.save(`${report.patientName.replace(/\s+/g, '_')}_Report.pdf`);
    toast({ title: "PDF Generated", description: "Report has been downloaded successfully." });
  };

  // --- Filter Logic ---
  const filteredReports = reports.filter((report) => {
    const isTypeAllowed = allowedTypes.includes(report.type);
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.patientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = typeFilter === 'all' || report.type === typeFilter;
    
    const isAuthorized = userRole === 'admin' 
        ? true 
        : userRole === 'patient' 
            ? report.patientName === user?.name 
            : true;

    return isTypeAllowed && matchesSearch && matchesFilter && isAuthorized;
  });

  const handleCreate = () => {
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      type: formData.type as Report['type'],
      doctorName: user?.name || 'System User',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setReports([newReport, ...reports]);
    toast({ title: 'Report Saved', description: `New ${formData.type} entry created successfully.` });
    setCreateModalOpen(false);
  };

  return (
    <DashboardLayout title="Medical Reports" subtitle={`Accessing as ${userRole.toUpperCase()}`}>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 capitalize">
                <Filter className="w-4 h-4" />
                {typeFilter === 'all' ? 'All Records' : typeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>View All Allowed</DropdownMenuItem>
              {allowedTypes.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)} className="capitalize">
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {userRole !== 'patient' && (
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 h-11 px-6 shadow-sm">
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const config = typeStyles[report.type] || typeStyles.general;
          const Icon = config.icon;
          return (
            <Card 
              key={report.id} 
              className="group hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => setViewReport(report)}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className={cn("p-2.5 rounded-xl transition-colors", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <Badge variant={report.status === 'pending' ? 'secondary' : 'default'} className="capitalize text-[10px]">
                  {report.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-4 line-clamp-1">{report.title}</CardTitle>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> 
                    <span className="text-foreground font-medium">{report.patientName}</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full gap-2 text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(report);
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* --- View Modal --- */}
      <Dialog open={!!viewReport} onOpenChange={(o) => !o && setViewReport(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Report Details</DialogTitle>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
                <div className={cn("p-3 rounded-xl", typeStyles[viewReport.type].bg)}>
                  {(() => { const Icon = typeStyles[viewReport.type].icon; return <Icon className={cn("w-6 h-6", typeStyles[viewReport.type].color)} />; })()}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{viewReport.title}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{viewReport.type} Report</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm px-2">
                <div><p className="text-muted-foreground mb-1">Patient Name</p><p className="font-semibold text-base">{viewReport.patientName}</p></div>
                <div><p className="text-muted-foreground mb-1">Attending Staff</p><p className="font-semibold text-base">{viewReport.doctorName}</p></div>
                <div><p className="text-muted-foreground mb-1">Date Created</p><p className="font-semibold text-base">{viewReport.date}</p></div>
                <div><p className="text-muted-foreground mb-1">Status</p><Badge className="capitalize">{viewReport.status}</Badge></div>
              </div>

              <div className="space-y-2 px-2">
                <Label className="text-muted-foreground">Clinical Observations</Label>
                <div className="p-4 bg-slate-50 rounded-xl text-sm leading-relaxed border italic">
                  "{viewReport.summary || "No specific notes provided."}"
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 gap-2" variant="default" onClick={() => handleDownloadPDF(viewReport)}>
                  <Download className="w-4 h-4" /> Download Report
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setViewReport(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Create Modal --- */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Generate New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Document Title</Label>
              <Input 
                placeholder="e.g. Lab Results - Glucose" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Category</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({...formData, type: v as any})}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedTypes.map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Patient Search</Label>
                <Input 
                  placeholder="Full Name" 
                  value={formData.patientName} 
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Findings / Summary</Label>
              <Textarea 
                placeholder="Describe clinical findings..."
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Discard</Button>
            <Button onClick={handleCreate}>Save & Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}