export interface LabTestItem {
  testName: string;
  description: string;
  price: string | number;
}

export interface Medication {
  name: string;
  price: string | number;
}

export interface InvoiceVisit {
  _id: string;
  prescribedTests?: LabTestItem[];
  medications?: Medication[];
}

export interface InvoicePatient {
  _id: string;
  name: string;
  track: string;
}

export interface Invoice {
  _id: string;
  uuid: string;
  patientId: InvoicePatient;
  visitId: InvoiceVisit;
  track:string,
  createdAt: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod?: "cash" | "card" | "insurance" | "mobile";
  total: number;
  consultationFee?: number;
  labFee?: number;
  medFee?: number;
  name?: string;
}

export interface InvoiceItem {
  description: string;
  category: "consultation" | "lab-test" | "procedure" | "medication" | "bed" | "other";
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  patientName: string;
  amount: number;
  method: "cash" | "card" | "insurance" | "mobile";
  date: string;
  reference?: string;
}
