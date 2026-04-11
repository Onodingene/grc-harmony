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
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-56 min-h-screen flex flex-col shrink-0 py-1">
      <div className="p-4 bg-white flex items-center justify-center">
        <h1 className="text-lg font-bold tracking-tight">Sun King</h1>
      </div>

      <nav className="flex-1 py-2 space-y-0.5 px-2 bg-[#f9d75c]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#f2c94c] text-black border-l-4 border-black pl-4"
                  : "text-black hover:bg-[#f7d96f]"
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
