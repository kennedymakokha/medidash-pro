import { useState } from 'react';
import { Activity, Heart, Thermometer, AlertTriangle, CheckSquare, ClipboardList } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHospitalData } from '@/contexts/HospitalDataContext';
import { toast } from '@/hooks/use-toast';

interface VitalTask {
  id: number;
  patient: string;
  room: string;
  task: string;
  time: string;
  status: 'pending' | 'urgent' | 'completed';
}

const initialVitalTasks: VitalTask[] = [
  { id: 1, patient: 'John Smith', room: '201', task: 'Blood Pressure Check', time: '09:00 AM', status: 'pending' },
  { id: 2, patient: 'Robert Williams', room: 'ICU-3', task: 'Vital Signs Monitor', time: '09:30 AM', status: 'urgent' },
  { id: 3, patient: 'David Brown', room: '305', task: 'Medication Administration', time: '10:00 AM', status: 'pending' },
  { id: 4, patient: 'John Smith', room: '201', task: 'Temperature Check', time: '10:30 AM', status: 'completed' },
  { id: 5, patient: 'Robert Williams', room: 'ICU-3', task: 'IV Fluid Change', time: '11:00 AM', status: 'pending' },
];

export function NurseDashboard() {
  const { patients } = useHospitalData();
  const [vitalTasks, setVitalTasks] = useState<VitalTask[]>(initialVitalTasks);

  const criticalPatients = patients.filter(p => p.status === 'critical');
  const admittedPatients = patients.filter(p => p.status === 'admitted');

  const handleStartTask = (taskId: number) => {
    setVitalTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: 'completed' as const } : task
      )
    );
    const task = vitalTasks.find((t) => t.id === taskId);
    toast({
      title: "Task Completed",
      description: `${task?.task} for ${task?.patient} has been marked as done.`,
    });
  };

  const handleMonitorPatient = (patientName: string) => {
    toast({
      title: "Monitoring Started",
      description: `Now monitoring ${patientName}'s vitals.`,
    });
  };

  const handleRecordVitals = (patientName: string) => {
    toast({
      title: "Vitals Recorded",
      description: `Vitals for ${patientName} have been recorded.`,
    });
  };

  return (
    <DashboardLayout 
      title="Nurse Dashboard" 
      subtitle="Monitor patient vitals and manage care tasks."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Patients Under Care"
          value={admittedPatients.length + criticalPatients.length}
          icon={Heart}
        />
        <StatsCard
          title="Critical Patients"
          value={criticalPatients.length}
          icon={AlertTriangle}
        />
        <StatsCard
          title="Pending Tasks"
          value={vitalTasks.filter(t => t.status === 'pending').length}
          icon={ClipboardList}
        />
        <StatsCard
          title="Completed Today"
          value={vitalTasks.filter(t => t.status === 'completed').length}
          icon={CheckSquare}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks List */}
        <div className="bg-card rounded-xl shadow-card animate-slide-up">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">Care Tasks</h3>
          </div>
          <div className="divide-y divide-border">
            {vitalTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      task.status === 'urgent' ? "bg-destructive/10" : 
                      task.status === 'completed' ? "bg-success/10" : "bg-primary/10"
                    )}>
                      {task.status === 'urgent' ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : task.status === 'completed' ? (
                        <CheckSquare className="w-5 h-5 text-success" />
                      ) : (
                        <Activity className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{task.task}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.patient} · {task.room} · {task.time}
                      </p>
                    </div>
                  </div>
                  {task.status !== 'completed' && (
                    <Button 
                      variant={task.status === 'urgent' ? 'destructive' : 'outline'} 
                      size="sm"
                      onClick={() => handleStartTask(task.id)}
                    >
                      {task.status === 'urgent' ? 'Urgent - Complete' : 'Complete'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Patients */}
        <div className="bg-card rounded-xl shadow-card animate-slide-up">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Critical Patients</h3>
            <Badge variant="destructive">Needs Attention</Badge>
          </div>
          <div className="divide-y divide-border">
            {criticalPatients.map((patient) => (
              <div key={patient.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="font-bold text-destructive">{patient.bloodGroup}</span>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.room} · {patient.assignedDoctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRecordVitals(patient.name)}
                    >
                      <Thermometer className="w-4 h-4 mr-1" />
                      Vitals
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleMonitorPatient(patient.name)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {criticalPatients.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No critical patients at the moment
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
