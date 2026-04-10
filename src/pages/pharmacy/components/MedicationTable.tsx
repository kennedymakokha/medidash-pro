import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, PackagePlus } from "lucide-react";
import { Medication } from "@/types/pharmacy";

interface Props {
  medications: Medication[];
  onEdit: (med: Medication) => void;
  onDelete: (med: Medication) => void;
  onRestock: (med: Medication) => void;
}

const statusVariant = (status: Medication["status"]) => {
  switch (status) {
    case "in-stock": return "default";
    case "low-stock": return "secondary";
    case "out-of-stock": return "destructive";
    case "expired": return "destructive";
    default: return "default";
  }
};

export function MedicationTable({ medications, onEdit, onDelete, onRestock }: Props) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden sm:table-cell">Strength</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="hidden lg:table-cell">Unit Price</TableHead>
            <TableHead className="hidden lg:table-cell">Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No medications found
              </TableCell>
            </TableRow>
          ) : (
            medications.map((med) => (
              <TableRow key={med._id || med.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{med.name}</p>
                    {med.genericName && (
                      <p className="text-xs text-muted-foreground">{med.genericName}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell capitalize">{med.category}</TableCell>
                <TableCell className="hidden sm:table-cell">{med.strength}</TableCell>
                <TableCell>
                  <span className={med.quantityInStock <= med.reorderLevel ? "text-destructive font-semibold" : ""}>
                    {med.quantityInStock}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">KES {med.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(med.expiryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(med.status)} className="capitalize text-xs">
                    {med.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onRestock(med)} title="Restock">
                      <PackagePlus className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onEdit(med)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(med)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
