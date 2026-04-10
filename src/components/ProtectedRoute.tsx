// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | object>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return null; // or a spinner

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ message: "You must be logged in to access this page." }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;