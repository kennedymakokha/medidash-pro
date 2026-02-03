export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface Patient {
  uuid: string;
  dob: any;
  id?: string;
  name: string;
  visits: any[]
  age?: number;
  sex?: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  bloodgroup: string;
  status: 'admitted' | 'outpatient' | 'discharged' | 'critical';
  admissionDate?: string;
  assignedDoctor?: any;
  room?: string;
  nokName?: string;
  nokRelationship?: string;
  nokPhone?: string;
  isDeleted?: boolean
  nationalId?: string
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'checkup' | 'followup' | 'emergency' | 'surgery';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  notes?: string;
}

export interface Staff {
  _id: string;
  uuid:string,
  name: string;
  email: string;
  phone: string;
  role: 'nurse' | 'receptionist' | 'technician' | 'admin';
  department: any;
  status: 'active' | 'on-leave' | 'inactive';
  joinDate: string;
}


export interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface Department {
  _id: string;
  name: string;
  head?: string;
  staffCount?: number;
  patientCount?: number;
  consultationFee?: number;
}


export interface VitalRecord {
  id: string;
  uuid?: string,
  patientId: string;
  patientName: string;
  recordedAt: string;
  recordedBy: string;
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  notes?: string;
}
