import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  Shield,
  ClipboardCheck,
  ListChecks,
  FileBarChart,
  AlertTriangle,
  Zap,
  Search,
  CalendarDays,
  Settings,
  CreditCard,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consolidated", label: "Consolidated", icon: Globe },
  { to: "/controls", label: "Controls", icon: Shield },
  { to: "/test-plan", label: "Test Plan", icon: ListChecks },
  { to: "/testing", label: "Testing", icon: ClipboardCheck },
  { to: "/monthly-report", label: "Monthly Report", icon: FileBarChart },
  { to: "/issues", label: "Issues", icon: AlertTriangle },
  { to: "/actions", label: "Actions", icon: Zap },
  { to: "/audit", label: "Audit", icon: Search },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/billing", label: "Billing", icon: CreditCard },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-56 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-secondary tracking-tight">
          GRC Control Tool
        </h1>
      </div>
      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
              ? "bg-black text-white"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
