import { Users, UserCheck } from 'lucide-react';
import { Department } from '@/types/hospital';

interface DepartmentCardProps {
  department: Department;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 group">
      <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {department.name}
      </h4>
      <p className="text-sm text-muted-foreground mt-1">{department.head}</p>
      
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">{department?.staffs?.length}</p>
            <p className="text-xs text-muted-foreground">Staff</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-success/10">
            <UserCheck className="w-3.5 h-3.5 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">{department?.patients?.length}</p>
            <p className="text-xs text-muted-foreground">Patients</p>
          </div>
        </div>
      </div>
    </div>
  );
}
