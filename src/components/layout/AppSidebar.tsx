import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Shield,
  ClipboardCheck,
  ListChecks,
  FileBarChart,
  AlertTriangle,
  Zap,
  Search,
  MessageSquare,
  CalendarDays,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/authStore";
import logo from "@/assets/logo.jpeg";

const allNavItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "control_owner", "tester", "viewer"],
  },
  {
    to: "/consolidated",
    label: "Consolidated",
    icon: Building2,
    roles: ["admin", "viewer", "tester"],
  },
  {
    to: "/controls",
    label: "Controls",
    icon: Shield,
    roles: ["admin", "tester", "viewer"],
  },
  {
    to: "/test-plan",
    label: "Test Plan",
    icon: ListChecks,
    roles: ["admin", "tester"],
  },
  {
    to: "/testing",
    label: "Testing",
    icon: ClipboardCheck,
    roles: ["admin", "tester", "control_owner"],
  },
  {
    to: "/monthly-report",
    label: "Monthly Report",
    icon: FileBarChart,
    roles: ["admin", "control_owner", "viewer", "tester"],
  },
  {
    to: "/issues",
    label: "Issues",
    icon: AlertTriangle,
    roles: ["admin", "control_owner", "tester"],
  },
  // {
  //   to: "/actions",
  //   label: "Actions",
  //   icon: Zap,
  //   roles: ["admin", "control_owner", "tester"],
  // },
  {
    to: "/audit",
    label: "Audit",
    icon: Search,
    roles: ["admin", "tester", "control_owner"],
  },
  {
    to: "/requests",
    label: "Requests",
    icon: MessageSquare,
    roles: ["admin", "tester", "control_owner"],
  },
  {
    to: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    roles: ["admin", "control_owner", "tester"],
  },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["admin", "tester"] },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const role = user?.role ?? "";
  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="w-60 h-screen sticky top-0 bg-sidebar flex flex-col shrink-0">
      <div className="p-3">
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
          <img src={logo} alt="Sun King logo" className="w-full h-auto" />
        </div>
      </div>

      <p className="px-5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-muted">
        Workspace
      </p>
      <nav className="flex-1 overflow-y-auto pb-2 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Separator className="mb-2 bg-sidebar-border/60" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-sidebar-foreground hover:bg-sidebar-accent w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
