export interface Medication {
  _id?: string;
  id?: string;
  uuid?: string;
  name: string;
  genericName?: string;
  category: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'inhaler' | 'other';
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate: string;
  quantityInStock: number;
  reorderLevel: number;
  unitPrice: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

export interface Prescription {
  _id?: string;
  id?: string;
  uuid?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitId?: string;
  consultationId?: string;
  medications: PrescriptionItem[];
  status: 'pending' | 'dispensed' | 'partially-dispensed' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionItem {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  dispensedQuantity?: number;
  unitPrice: number;
  instructions?: string;
}

export interface DispenseRecord {
  _id?: string;
  id?: string;
  prescriptionId: string;
  patientName: string;
  dispensedBy: string;
  dispensedAt: string;
  items: PrescriptionItem[];
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'insurance';
}

export interface RestockRecord {
  _id?: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  supplier?: string;
  batchNumber?: string;
  unitCost: number;
  restockedBy: string;
  restockedAt: string;
}
