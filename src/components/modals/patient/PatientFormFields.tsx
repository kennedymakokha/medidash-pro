import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Format_phone_number } from "@/utils/formatPhone";
import calculateAge from "@/utils/culculateAge";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormData {
  name: string;
  dob: Date | null;
  sex: "male" | "female" | "other";
  phone: string;
  address: string;
  bloodgroup: string;
  status: "admitted" | "outpatient" | "discharged" | "critical";
  assignedDoctor: string;
  nationalId: string;
  nokName?: string;
  nokRelationship?: string;
  nokPhone?: string;
  guardianphone?: string;
  room?: string;
  password?: string;
  [key: string]: any;
}

interface Props {
  formData: FormData;
  onChange: (data: FormData) => void;
  doctors: Doctor[];
}

export function PatientFormFields({ formData, onChange, doctors }: Props) {
  // Ensure we handle the date conversion safely for the age calculation
  const dobValue = formData.dob instanceof Date 
    ? formData.dob.toISOString().split("T")[0] 
    : formData.dob || "";

  const age = calculateAge(dobValue);
  const isAdult = (age ?? 0) >= 18;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 1. Full Name */}
      <div className="col-span-2">
        <Label>Full Name <span className="text-destructive">*</span></Label>
        <Input
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* 2. Date of Birth - Restored and Styled */}
      <div>
        <Label className="flex items-center gap-1">
          Date of Birth
          {isAdult && <span className="text-destructive">*</span>}
        </Label>
        <Input
          type="date"
          value={formData.dob instanceof Date ? formData.dob.toISOString().split('T')[0] : (formData.dob ?? "")}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            const dateStr = e.target.value;
            onChange({ ...formData, dob: dateStr ? new Date(dateStr) : null });
          }}
          required={isAdult}
        />
        {age !== null && (
          <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">
            Age: {age} Years
          </p>
        )}
      </div>

      {/* 3. Gender */}
      <div>
        <Label>Gender</Label>
        <Select
          value={formData.sex}
          onValueChange={(v) => onChange({ ...formData, sex: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. Primary Phone Number */}
      <div>
        <Label>
          {isAdult ? "Patient Phone" : "Guardian Phone"}
          {isAdult && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          value={formData.phone}
          type="tel"
          placeholder={isAdult ? "0716..." : "Primary Guardian No."}
          onChange={(e) =>
            onChange({
              ...formData,
              phone: Format_phone_number(e.target.value),
            })
          }
          required={isAdult}
        />
      </div>

      {/* 5. Blood Group */}
      <div>
        <Label>Blood Group</Label>
        <Select
          value={formData.bloodgroup}
          onValueChange={(v) => onChange({ ...formData, bloodgroup: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {bloodGroups.map((bg) => (
              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 6. Address */}
      <div className="col-span-2">
        <Label>Residential Address <span className="text-destructive">*</span></Label>
        <Input
          value={formData.address}
          placeholder="e.g. Eldoret, Section 64"
          onChange={(e) => onChange({ ...formData, address: e.target.value })}
          required
        />
      </div>

      {/* 7. National ID - Restored specifically for adults */}
      {isAdult && (
        <div className="col-span-1">
          <Label>National ID</Label>
          <Input
            value={formData.nationalId}
            type="number"
            placeholder="12345678"
            onChange={(e) =>
              onChange({ ...formData, nationalId: e.target.value })
            }
          />
        </div>
      )}

      {/* 8. Assigned Doctor */}
      <div className={isAdult ? "col-span-1" : "col-span-2"}>
        <Label>Assigned Doctor</Label>
        <Select
          value={formData.assignedDoctor}
          onValueChange={(v) => onChange({ ...formData, assignedDoctor: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doc: any) => (
              <SelectItem key={doc._id} value={doc._id}>
                {doc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Next of Kin Section - Always visible for Adults */}
      {isAdult && (
        <>
          <div className="col-span-2 pt-4">
            <hr />
            <p className="text-sm font-bold text-muted-foreground mt-4 uppercase tracking-wider">Next of Kin Information</p>
          </div>
          <div>
            <Label>NOK Name</Label>
            <Input
              value={formData.nokName ?? ""}
              placeholder="Full Name"
              onChange={(e) => onChange({ ...formData, nokName: e.target.value })}
            />
          </div>
          <div>
            <Label>Relationship</Label>
            <Input
              value={formData.nokRelationship ?? ""}
              placeholder="e.g. Brother"
              onChange={(e) => onChange({ ...formData, nokRelationship: e.target.value })}
              required={!!formData.nokName}
            />
          </div>
          <div className="col-span-2">
            <Label>NOK Phone</Label>
            <Input
              value={formData.nokPhone ?? ""}
              placeholder="07..."
              onChange={(e) =>
                onChange({ ...formData, nokPhone: Format_phone_number(e.target.value) })
              }
              required={!!formData.nokName}
            />
          </div>
        </>
      )}
    </div>
  );
}