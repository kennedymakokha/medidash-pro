import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Heart,
  Activity,
  Pill,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Bed,
  Thermometer,
} from "lucide-react";
import { useFetchtasksQuery } from "@/features/patientsCareSlice";

interface CareTask {
  id: string;
  patientName: string;
  room: string;
  task: string;
  type: "medication" | "vitals" | "care" | "assessment";
  priority: "high" | "medium" | "low";
  dueTime: string;
  completed: boolean;
}



const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const typeIcons = {
  medication: Pill,
  vitals: Activity,
  care: Heart,
  assessment: Thermometer,
};

const typeStyles = {
  medication: "bg-primary/10 text-primary",
  vitals: "bg-warning/10 text-warning",
  care: "bg-success/10 text-success",
  assessment: "bg-accent text-accent-foreground",
};

export default function PatientCarePage() {

  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  const { data } = useFetchtasksQuery({ page, limit, search: search });
 
  const tasks = data?.data??[]
  
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.patientName.toLowerCase().includes(search.toLowerCase()) ||
      task.task.toLowerCase().includes(search.toLowerCase()) ||
      task.room.toLowerCase().includes(search.toLowerCase());
    const matchesCompleted = showCompleted || !task.completed;
    return matchesSearch && matchesCompleted;
  });

  const toggleTask = (id: string) => {
    // setTasks(
    //   tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    // );
    // const task = tasks.find((t) => t.id === id);
    // if (task) {
    //   toast({
    //     title: task.completed ? "Task Reopened" : "Task Completed",
    //     description: `${task.task} for ${task.patientName}`,
    //   });
    // }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "high" && !t.completed)
      .length,
  };

  const groupedTasks = {
    high: filteredTasks.filter((t) => t.priority === "high"),
    medium: filteredTasks.filter((t) => t.priority === "medium"),
    low: filteredTasks.filter((t) => t.priority === "low"),
  };
 console.log(groupedTasks);
  return (
    <DashboardLayout
      title="Patient Care"
      subtitle="Daily care tasks and patient rounds"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks or patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="showCompleted"
            checked={showCompleted}
            onCheckedChange={(checked) => setShowCompleted(!!checked)}
          />
          <label
            htmlFor="showCompleted"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Show completed
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-card-foreground">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.highPriority}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by Priority */}
      <div className="space-y-6">
        {["high", "medium", "low"].map((priority) => {
          const priorityTasks =
            groupedTasks[priority as keyof typeof groupedTasks];
          if (priorityTasks.length === 0) return null;

          return (
            <div key={priority}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    priorityStyles[priority as keyof typeof priorityStyles],
                  )}
                >
                  {priority} Priority
                </Badge>
                <span className="text-muted-foreground text-sm">
                  ({priorityTasks.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priorityTasks.map((task) => {
                  const Icon = typeIcons[task.type];
                  return (
                    <Card
                      key={task._id}
                      className={cn(
                        "shadow-card hover:shadow-elevated transition-all cursor-pointer",
                        task.completed && "opacity-60",
                      )}
                      onClick={() => toggleTask(task._id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={task.completed}
                              className="mt-1"
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() => toggleTask(task._id)}
                            />
                            <div>
                              <CardTitle
                                className={cn(
                                  "text-base",
                                  task.completed && "line-through",
                                )}
                              >
                                {task.task}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    typeStyles[task.type],
                                  )}
                                >
                                  {/* <Icon className="w-3 h-3 mr-1" /> */}
                                  {task.type??priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{task.patientName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-3 h-3" />
                            <span>{task.room}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{task.dueTime}</span>
                          </div>
                          {task.completed && (
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/20 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Done
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No tasks found
          </h3>
          <p className="text-sm text-muted-foreground">
            All caught up or try adjusting your search
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
