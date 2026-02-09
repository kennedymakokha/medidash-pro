import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserPlus,
  ClipboardList,
  Building2,
  Settings,
  LogOut,
  Heart,
  Stethoscope,
  Activity,
  Bed,
  X,
  TestTube,
  FileText,
  DollarSign,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/hospital';
import { toast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { RootState } from '@/store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  implemented?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist'], implemented: true },
  { label: 'Patients', href: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'], implemented: true },
  { label: 'Appointments', href: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'receptionist'], implemented: true },
  { label: 'Consultations', href: '/consultations', icon: FileText, roles: ['admin', 'doctor'], implemented: true },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope, roles: ['admin', 'receptionist'], implemented: true },
  { label: 'Departments', href: '/departments', icon: Building2, roles: ['admin'], implemented: true },
  { label: 'Staff', href: '/staff', icon: UserPlus, roles: ['admin'], implemented: true },
  { label: 'Lab Tests', href: '/lab-tests', icon: TestTube, roles: ['admin', 'doctor', 'nurse'], implemented: true },
  { label: 'Patient Care', href: '/patient-care', icon: Heart, roles: ['admin','nurse'], implemented: true },
  { label: 'Vitals', href: '/vitals', icon: Activity, roles: ['admin','nurse', 'doctor'], implemented: true },
  { label: 'Bed Management', href: '/beds', icon: Bed, roles: ['admin', 'nurse', 'receptionist'], implemented: true },
  { label: 'Lab Orders', href: '/lab-orders', icon: FlaskConical, roles: ['admin', 'doctor', 'nurse'], implemented: true },
  { label: 'Finance', href: '/finance', icon: DollarSign, roles: ['admin', 'receptionist'], implemented: true },
  { label: 'Reports', href: '/reports', icon: ClipboardList, roles: ['admin', 'doctor'], implemented: true },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo: { user } } = useSelector((state: RootState) => state.auth)
  const { logout } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (!item.implemented) {
      e.preventDefault();
      toast({
        title: "Coming Soon",
        description: `The ${item.label} page is under development.`,
      });
    } else {
      onClose?.();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Coming Soon",
      description: "Settings page is under development.",
    });
  };

  return (
    <aside className="h-screen w-64 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-sidebar-foreground">MediCare</h1>
              <p className="text-[10px] lg:text-xs text-sidebar-foreground/60">Hospital Management</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.implemented ? item.href : '#'}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !item.implemented && "opacity-70"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {!item.implemented && (
                <span className="ml-auto text-[10px] bg-sidebar-accent px-1.5 py-0.5 rounded">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 lg:p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-sidebar-accent mb-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs lg:text-sm font-semibold text-sidebar-primary-foreground">
              {user?.clinic?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSettingsClick}
            className="flex-1 flex items-center justify-center gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
