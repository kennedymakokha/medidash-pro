import { User, Visit } from "./hospital";

export interface LabTest {
  id?: string;
  _id?:string
  clinic?:string
  uuid?:string
  testName: string;
  category: 'blood' | 'urine' | 'imaging' | 'pathology' | 'other';
  description: string;
  price: number;
  turnaroundTime: string;
  requiresFasting: boolean;
  status: 'active' | 'inactive';
}

export interface Procedure {
  id?: string;
  procedureName: string;
  uuid?:string
  clinic?:string
  category: 'minor' | 'major' | 'diagnostic' | 'therapeutic';
  description: string;
  price: number;
  duration: string;
  requiresAnesthesia: boolean;
  status: 'active' | 'inactive';
}

export interface Consultation {
  id?: string;
   _id?: string;
  uuid?:string
  patientId?: string;
  patientMongoose?:string;
  visits?: Visit[]
  name?: string;
  doctorId?: string;
  doctorName?: string;
  departmentId?: string;
  departmentName?: string;
  track: 'pre-lab' | 'awaiting-lab' | 'post-lab' | 'completed';
  chiefComplaint: string;
  symptoms: string[];
  diagnosis?: string;
  prescribedTests: string[];
  testResults?: Record<string, string>;
  prescribedProcedures: string[];
  medications?: string[];
  notes: string;
  assignedDoctor:User
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}
