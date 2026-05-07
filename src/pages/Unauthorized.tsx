import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <ShieldOff className="w-12 h-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        You don't have permission to view this page. Contact your admin if you
        think this is a mistake.
      </p>
      <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
    </div>
  );
};

export default Unauthorized;
