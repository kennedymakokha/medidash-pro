import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Format_phone_number } from "@/utils/formatPhone";
import calculateAge from "@/utils/culculateAge";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormData {
  name: string;
  dob: string;
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
  doctors: any[];
}

export function PatientFormFields({ formData, onChange, doctors }: Props) {
  // const dobString = formData.dob ? formData.dob.toISOString() : undefined;
  // const age = calculateAge(dobString);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Full Name</Label>
        <Input value={formData.name} onChange={(e) => onChange({ ...formData, name: e.target.value })} required />
      </div>

      {/* <div>
        <Label>Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-full justify-start text-left">
              {formData.dob ? format(formData.dob, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto">
            <Calendar
              mode="single"
              selected={formData.dob ?? undefined}
              onSelect={(date) => onChange({ ...formData, dob: date ?? null })}
              captionLayout="dropdown"
              fromYear={1900}
              toYear={new Date().getFullYear()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div> */}
     <div>
  <label className="block text-sm font-medium text-gray-700">
    Date of Birth <span className="text-red-500">*</span> 
  </label>
  <input
    type="date"
    value={formData.dob}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    onChange={(e) => onChange({ ...formData, dob: e.target.value })}
    
  />
</div>

      <div>
        <Label>Gender</Label>
        <Select value={formData.sex} onValueChange={(v) => onChange({ ...formData, sex: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          value={formData.phone}
          type="tel"
          placeholder= "07160181616" 
          onChange={(e) => onChange({ ...formData, phone: Format_phone_number(e.target.value) })}
         
        />
      </div>

      <div>
        <Label>Blood Group</Label>
        <Select value={formData.bloodgroup} onValueChange={(v) => onChange({ ...formData, bloodgroup: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {bloodGroups.map((bg) => (<SelectItem key={bg} value={bg}>{bg}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Address</Label>
        <Input value={formData.address} onChange={(e) => onChange({ ...formData, address: e.target.value })} required />
      </div>

     
        <div>
          <Label>National ID</Label>
          <Input
            value={formData.nationalId}
            type="number"
            placeholder="11836176"
            onChange={(e) => onChange({ ...formData, nationalId: e.target.value })}
          />
        </div>
      

      <div>
        <Label>Assigned Doctor</Label>
        <Select value={formData.assignedDoctor} onValueChange={(v) => onChange({ ...formData, assignedDoctor: v })}>
          <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
          <SelectContent>
            {doctors.map((doc: any) => (
              <SelectItem key={doc._id} value={doc._id}>{doc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <hr className="col-span-2" />
    
        <>
          <div>
            <Label>Next Of Kin</Label>
            <Input value={formData.nokName ?? ""} placeholder="James Ng'ang'a"
              onChange={(e) => onChange({ ...formData, nokName: e.target.value })} />
          </div>
          <div>
            <Label>Relationship</Label>
            <Input placeholder="Dad" value={formData.nokRelationship ?? ""}
              onChange={(e) => onChange({ ...formData, nokRelationship: e.target.value })}
              required={(formData?.nokName?.length ?? 0) > 0} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={formData.nokPhone ?? ""} placeholder="07281781617"
              onChange={(e) => onChange({ ...formData, nokPhone: e.target.value })}
              required={(formData?.nokRelationship?.length ?? 0) > 0} />
          </div>
        </>
     
    </div>
  );
}
