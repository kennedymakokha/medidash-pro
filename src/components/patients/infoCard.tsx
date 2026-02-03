import { cn } from "@/lib/utils";

function Info({
    label,
    value,
    icon,
    strong,
}: {
    label: string;
    value?: string;
    icon?: React.ReactNode;
    strong?: boolean;
}) {
    if (!value) return null;

    return (
        <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("text-sm", strong && "font-bold")}>{value}</p>
            </div>
        </div>
    );
} export default Info