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
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  status: 'admitted' | 'outpatient' | 'discharged' | 'critical';
  admissionDate?: string;
  assignedDoctor?: string;
  room?: string;
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

export interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface Department {
  id: string;
  name: string;
  head: string;
  staffCount: number;
  patientCount: number;
}
