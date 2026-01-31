import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, Appointment } from '@/types/hospital';
import { mockPatients as initialPatients, mockAppointments as initialAppointments, mockDepartments } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface HospitalDataContextType {
  patients: Patient[];
  appointments: Appointment[];
  departments: typeof mockDepartments;
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

const HospitalDataContext = createContext<HospitalDataContextType | undefined>(undefined);

export function HospitalDataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const addPatient = (patient: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patient,
      id: `patient-${Date.now()}`,
    };
    setPatients((prev) => [...prev, newPatient]);
    toast({
      title: "Patient Added",
      description: `${patient.name} has been registered successfully.`,
    });
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    toast({
      title: "Patient Updated",
      description: "Patient information has been updated.",
    });
  };

  const deletePatient = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setAppointments((prev) => prev.filter((a) => a.patientId !== id));
    toast({
      title: "Patient Deleted",
      description: `${patient?.name || 'Patient'} has been removed.`,
      variant: "destructive",
    });
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [...prev, newAppointment]);
    toast({
      title: "Appointment Scheduled",
      description: `Appointment for ${appointment.patientName} has been scheduled.`,
    });
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    toast({
      title: "Appointment Updated",
      description: "Appointment has been updated successfully.",
    });
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: "Appointment Cancelled",
      description: "Appointment has been removed.",
      variant: "destructive",
    });
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    toast({
      title: "Status Updated",
      description: `Appointment status changed to ${status}.`,
    });
  };

  return (
    <HospitalDataContext.Provider
      value={{
        patients,
        appointments,
        departments: mockDepartments,
        addPatient,
        updatePatient,
        deletePatient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
      }}
    >
      {children}
    </HospitalDataContext.Provider>
  );
}

export function useHospitalData() {
  const context = useContext(HospitalDataContext);
  if (context === undefined) {
    throw new Error('useHospitalData must be used within a HospitalDataProvider');
  }
  return context;
}
