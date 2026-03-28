// src/utils/permissions.ts

import { Feature } from "@/types/permissions";
import { UserRole } from "@/types/hospital";

export const canAccessFeature = (
  feature: Feature,
  userRole: UserRole,
  clinic: any
) => {
  const rolePermissions: Record<UserRole, Feature[]> = {
    admin: [
      "dashboard",
      "patients",
      "appointments",
      "consultations",
      "doctors",
      "departments",
      "staff",
      "lab",
      "patient-care",
      "vitals",
      "beds",
      "finance",
      "reports",
    ],
    doctor: [
      "dashboard",
      "patients",
      "appointments",
      "consultations",
      "lab",
      "vitals",
      "reports",
    ],
    nurse: [
      "dashboard",
      "patients",
      "lab",
      "vitals",
      "patient-care",
      "beds",
    ],
    receptionist: [
      "dashboard",
      "patients",
      "appointments",
      "doctors",
      "finance",
      "beds",
    ],
    finance: [
      "dashboard", 
      "finance", 
      "reports",
      "patients", // Usually needed to find who to bill
    ],
    lab_tech: [
      "dashboard", 
      "lab", 
      "patients", 
      "vitals",
    ],
  };

  // Role permission check
  if (!rolePermissions[userRole]?.includes(feature)) {
    return false;
  }

  // Feature-specific clinic restrictions
  if (feature === "beds" && !clinic?.inpatient) {
    return false;
  }

  return true;
};
