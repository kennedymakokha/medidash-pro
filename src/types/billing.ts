export interface LabTest {
  id: string;
  name: string;
  category: 'blood' | 'urine' | 'imaging' | 'pathology' | 'other';
  description: string;
  price: number;
  turnaroundTime: string;
  requiresFasting: boolean;
  status: 'active' | 'inactive';
}

export interface Procedure {
  id: string;
  name: string;
  category: 'minor' | 'major' | 'diagnostic' | 'therapeutic';
  description: string;
  price: number;
  duration: string;
  requiresAnesthesia: boolean;
  status: 'active' | 'inactive';
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  stage: 'pre-lab' | 'awaiting-lab' | 'post-lab' | 'completed';
  chiefComplaint: string;
  symptoms: string[];
  diagnosis?: string;
  prescribedTests: string[];
  testResults?: Record<string, string>;
  prescribedProcedures: string[];
  medications?: string[];
  notes: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}
