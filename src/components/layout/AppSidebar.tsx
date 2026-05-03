import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  User,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
// import logo from "@/assets/logo.png";
import logo from "@/assets/logo.jpeg";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consolidated", label: "Consolidated", icon: Globe },
  { to: "/controls", label: "Controls", icon: Shield },
  { to: "/test-plan", label: "Test Plan", icon: ListChecks },
  { to: "/testing", label: "Testing", icon: ClipboardCheck },
  { to: "/monthly-report", label: "Monthly Report", icon: FileBarChart },
  { to: "/issues", label: "Issues", icon: AlertTriangle },
  // { to: "/actions", label: "Actions", icon: Zap },
  // { to: "/audit", label: "Audit", icon: Search },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
  // { to: "/billing", label: "Billing", icon: CreditCard },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
      <div className="border-b border-sidebar-border flex items-center w-full">
        <img 
            src={logo}
            alt="GRC Control Tool Logo" 
            className="h-18 w-full "
            />
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
      <div className="px-2 pb-3">
        <Separator className="mb-2" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
