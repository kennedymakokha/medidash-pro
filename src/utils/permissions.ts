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
      "pharmacy",
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
