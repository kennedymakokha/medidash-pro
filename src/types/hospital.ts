export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: Department;
}

export interface Patient {
  uuid: string;
  dob: string;
  id?: string;
  name: string;
  visits: Visit[]
  age?: number;
  sex?: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  bloodgroup: string;
  status: 'admitted' | 'outpatient' | 'discharged' | 'critical';
  admissionDate?: string;
  assignedDoctor?: User;
  room?: string;
  nokName?: string;
  nokRelationship?: string;
  nokPhone?: string;
  isDeleted?: boolean
  nationalId?: string
}

export interface Visit {
  _id: string;
  visitDate: string | null;
  createdAt: string;
  bp?: string;
  pulse?: string;
  temperature?: string;
  respiratoryRate?: string;
  notes?: string;
  diagnosis?: string;
  disposition?: string;
  created_by?: { name: string };
  labOrders?: string;
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
  uuid: string,
  name: string;
  email: string;
  phone: string;
  role: 'nurse' | 'receptionist' | 'technician' | 'admin';
  department: string;
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
  fee?: number;

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


export interface BedData {
  id?: string;
  bedNumber?:string
  uuid: string;
  ward: string;
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  
}
export interface WardData {
  _id?: string;
  wardName: string;
  uuid?: string;
  type: 'general' | 'icu' | 'private' | 'semi-private';
  gender: 'female' | 'male';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';

}