import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";

const roleAccess: Record<string, string[]> = {
  "/dashboard": ["admin", "control_owner", "tester", "viewer"],
  "/consolidated": ["admin", "viewer", "tester"],
  "/controls": ["admin", "tester", "control_owner"],
  "/test-plan": ["admin", "tester"],
  "/testing": ["admin", "tester", "control_owner"],
  "/monthly-report": ["admin", "control_owner", "viewer", "tester"],
  "/issues": ["admin", "control_owner", "tester"],
  "/actions": ["admin", "control_owner", "tester"],
  "/audit": ["admin", "control_owner"],
  "/calendar": ["admin", "control_owner", "tester"],
  "/settings": ["admin","tester"],
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

  if (!isReady) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = roleAccess[path] ?? [];
  if (!allowed.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
