import { useState, useMemo } from 'react';
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
  Search, Plus, Download, FileText, Filter, User,
  FileBarChart, FilePlus, DollarSign, ClipboardList,
} from 'lucide-react';

import {
  useFetchvisitsQuery,
  useFetchvisitlabordersQuery,
} from '@/features/visitsSlice';

import { TableSkeleton } from '@/components/loaders';

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

// ---------------- ROLE PERMISSIONS ----------------

const ROLE_PERMISSIONS: Record<string, Report['type'][]> = {
  admin: ['lab', 'radiology', 'discharge', 'prescription', 'general', 'billing'],
  doctor: ['lab', 'radiology', 'discharge', 'prescription', 'general'],
  nurse: ['lab', 'discharge', 'general'],
  lab_tech: ['lab'],
  finance: ['billing', 'general'],
  receptionist: ['general', 'billing'],
  patient: ['lab', 'radiology', 'prescription', 'general'],
};

// ---------------- STYLES ----------------

const typeStyles = {
  lab: { bg: 'bg-purple-100', color: 'text-purple-700', icon: FileBarChart },
  radiology: { bg: 'bg-orange-100', color: 'text-orange-700', icon: FileText },
  discharge: { bg: 'bg-green-100', color: 'text-green-700', icon: ClipboardList },
  prescription: { bg: 'bg-pink-100', color: 'text-pink-700', icon: FilePlus },
  general: { bg: 'bg-slate-100', color: 'text-slate-700', icon: FileText },
  billing: { bg: 'bg-emerald-100', color: 'text-emerald-700', icon: DollarSign },
};

// ---------------- MAPPERS ----------------

function mapVisitsToReports(visits: any[]): Report[] {
  return visits.map((v: any) => {
    const hasLab = v.labOrders && v.labOrders.length > 0;
    const hasDiagnosis = !!v.diagnosis;

    let status: Report['status'] = 'pending';
    if (v.track === 'completed' || v.disposition) status = 'completed';
    else if (v.diagnosis) status = 'reviewed';

    return {
      id: v._id ?? v.id ?? '',
      title: hasDiagnosis
        ? `Diagnosis: ${v.diagnosis}`
        : hasLab
        ? 'Lab Order Report'
        : 'Visit Report',
      type: hasLab ? 'lab' : 'general',
      patientName: v.patientMongoose?.name ?? 'Unknown Patient',
      doctorName: v.assignedDoctor?.name ?? 'Unassigned',
      date: v.createdAt
        ? new Date(v.createdAt).toISOString().split('T')[0]
        : '',
      status,
      summary: v.notes ?? v.chiefComplaint ?? '',
    };
  });
}

function mapLabOrdersToReports(orders: any[]): Report[] {
  return orders.map((o: any) => ({
    id: o._id ?? o.uuid ?? '',
    title: `Lab: ${o.testId?.testName ?? o.testName ?? 'Unknown Test'}`,
    type: 'lab',
    patientName:
      o.visitId?.patientMongoose?.name ?? o.patientName ?? 'Unknown',
    doctorName:
      o.visitId?.assignedDoctor?.name ?? o.orderedBy ?? 'Unassigned',
    date: o.createdAt
      ? new Date(o.createdAt).toISOString().split('T')[0]
      : '',
    status: o.status === 'completed' ? 'completed' : 'pending',
    summary: o.result ?? `${o.testName} - ${o.status}`,
  }));
}

// ---------------- COMPONENT ----------------

export default function ReportsPage() {
  const { userInfo: { user } } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'patient';

  const allowedTypes = ROLE_PERMISSIONS[userRole] || ['general'];

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: allowedTypes[0],
    patientName: '',
    summary: '',
  });

  const [page] = useState(1);

  const { data: visitsData, isLoading: visitsLoading } =
    useFetchvisitsQuery({ page, limit: 100, search: '', track: '' });

  const { data: labsData, isLoading: labsLoading } =
    useFetchvisitlabordersQuery({ page, limit: 100, search: '', status: '' });

  const isLoading = visitsLoading || labsLoading;

  const reports = useMemo(() => {
    const visitReports = mapVisitsToReports(visitsData?.data ?? []);
    const labReports = mapLabOrdersToReports(labsData?.data ?? []);

    const seen = new Set<string>();
    const combined: Report[] = [];

    [...labReports, ...visitReports].forEach((r) => {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        combined.push(r);
      }
    });

    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [visitsData, labsData]);

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

    doc.text("Summary:", 14, (doc as any).lastAutoTable.finalY + 10);
    doc.text(report.summary || "No notes", 14, (doc as any).lastAutoTable.finalY + 20);

    doc.save(`${report.patientName}_report.pdf`);

    toast({ title: 'Downloaded', description: 'PDF generated successfully' });
  };

  const filteredReports = reports.filter((r) => {
    const isAllowed = allowedTypes.includes(r.type);
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = typeFilter === 'all' || r.type === typeFilter;

    const isAuthorized =
      userRole === 'admin'
        ? true
        : userRole === 'patient'
        ? r.patientName === user?.name
        : true;

    return isAllowed && matchesSearch && matchesFilter && isAuthorized;
  });

  if (isLoading) {
    return <TableSkeleton rows={6} columns={3} />;
  }

  return (
    <DashboardLayout title="Medical Reports" subtitle={`Accessing as ${userRole}`}>
      
      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {typeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTypeFilter('all')}>
              All
            </DropdownMenuItem>
            {allowedTypes.map((t) => (
              <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                {t}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const config = typeStyles[report.type];
          const Icon = config.icon;

          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <Icon className={config.color} />
                  <Badge>{report.status}</Badge>
                </div>
                <CardTitle>{report.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm">{report.patientName}</p>

                <Button
                  className="mt-3 w-full"
                  onClick={() => handleDownloadPDF(report)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}