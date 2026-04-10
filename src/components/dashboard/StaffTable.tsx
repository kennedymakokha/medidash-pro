import { useState } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/table/DataTable';
import { Staff } from '@/types/hospital';

interface StaffTableProps {
    staff: Staff[];
    title: string;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    search: string;
    setViewStaff: any;
    setEditStaff: any;
    setDeleteStaff: any;
    statusStyles: any
    onSearchChange: (value: string) => void;
}

const roleColors = {
    doctor: 'bg-info/10 text-info border-info/20',
    nurse: 'bg-success/10 text-success border-success/20',
    admin: 'bg-warning/10 text-warning border-warning/20',
};



export function StaffTable({
    staff,
    title,
    page,
    totalPages,
    onPageChange,
    search,
    setViewStaff,
    setEditStaff,
    setDeleteStaff,
    statusStyles,
    onSearchChange,
}: StaffTableProps) {
    // const [viewStaff, setViewStaff] = useState<Staff | null>(null);
    // const [editStaff, setEditStaff] = useState<Staff | null>(null);
    // const [deleteStaff, setDeleteStaff] = useState<Staff | null>(null);

    return (
        <>
            <DataTable
                title={title}
                search={search}
                onSearchChange={onSearchChange}
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                columns={
                    <tr className="bg-muted/50">
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
                            Staff Member
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-xs font-semibold uppercase">
                            Contact
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase">Role</th>
                        <th className="hidden lg:table-cell px-6 py-3 text-xs font-semibold uppercase">
                            Department
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold uppercase">
                            Actions
                        </th>
                    </tr>
                }
                rows={staff.map((member) => (
                    <tr key={member._id} className="hover:bg-muted/30">
                        {/* Staff */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                        {member.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground md:hidden">
                                        {member.phone_number}
                                    </p>
                                </div>
                            </div>
                        </td>

                        {/* Contact */}
                        <td className="hidden md:table-cell px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {member.phone_number}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[180px]">{member.email}</span>
                            </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                            <Badge className={cn('capitalize', roleColors[member.role])}>
                                {member.role}
                            </Badge>
                        </td>

                        {/* Department */}
                        <td className="hidden lg:table-cell px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Building2 className="w-3 h-3" />
                                {member?.department ? (typeof member.department === 'object' ? (member.department as { name?: string })?.name : member.department) : '-'}
                            </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(statusStyles[member.status])}>
                                {member.status}
                            </Badge>

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewStaff(member)}>
                                        <Eye className="w-4 h-4 mr-2" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditStaff(member)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setDeleteStaff(member)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </td>
                    </tr>
                ))}
            />

            {/* Modals go here (View/Edit/Delete) */}
        </>
    );
}
