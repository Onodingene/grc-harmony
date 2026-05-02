import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";

const roleAccess: Record<string, string[]> = {
  "/dashboard": ["admin", "control_owner", "viewer"],
  "/consolidated": ["admin", "viewer"],
  "/controls": ["admin"],
  "/test-plan": ["admin", "control_owner", "tester"],
  "/testing": ["admin", "control_owner", "tester"],
  "/monthly-report": ["admin", "control_owner", "viewer"],
  "/issues": ["admin", "control_owner"],
  "/actions": ["admin", "control_owner"],
  "/audit": ["admin", "control_owner"],
  "/calendar": ["admin", "control_owner"],
  "/settings": ["admin"],
  "/billing": ["admin"],
  "/profile": ["admin", "control_owner", "tester", "viewer"],
};

interface ProtectedRouteProps {
  path: string;
  children: JSX.Element;
}

export default function ProtectedRoute({
  path,
  children,
}: ProtectedRouteProps) {
  const { user, isReady } = useAuthStore();
  console.log("User", user);

  // Still attempting session restore — show nothing yet
  if (!isReady) return null;

  // Not logged in — send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — send to dashboard
  const allowed = roleAccess[path] ?? [];
  if (!allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
