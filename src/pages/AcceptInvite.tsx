import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Shield, Eye as EyeIcon, EyeOff, CheckCircle2, XCircle, Crown, Edit } from "lucide-react";
import { apiFetch, setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";

type Role = "admin" | "control_owner" | "tester" | "viewer";

interface Invite {
  email: string;
  role: Role;
  companyName: string;
  invitedByName: string;
  invitedByEmail: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

const roleLabel: Record<Role, { label: string; icon: React.ReactNode; color: string }> = {
  admin:         { label: "Admin",         icon: <Crown className="w-3 h-3" />,  color: "bg-red-100 text-red-800" },
  control_owner: { label: "Control Owner", icon: <Shield className="w-3 h-3" />, color: "bg-blue-100 text-blue-800" },
  tester:        { label: "Tester",        icon: <Edit className="w-3 h-3" />,   color: "bg-green-100 text-green-800" },
  viewer:        { label: "Viewer",        icon: <EyeIcon className="w-3 h-3" />,color: "bg-gray-100 text-gray-800" },
};

const AcceptInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();

  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // After-accept step
  const [stage, setStage] = useState<"review" | "set_password" | "done_declined">("review");
  const [form, setForm] = useState({ fullName: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setError("Missing invite token"); setLoading(false); return; }
    apiFetch<Invite>(`/invites/${token}`)
      .then((res) => {
        if (res.error) setError(res.error);
        else if (res.data) setInvite(res.data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDecline = async () => {
    setSubmitting(true);
    const res = await apiFetch(`/invites/${token}/decline`, { method: "POST" });
    setSubmitting(false);
    if (res.error) { toast({ title: "Error", description: res.error, variant: "destructive" }); return; }
    setStage("done_declined");
  };

  const handleAccept = () => setStage("set_password");

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!form.fullName.trim()) { setError("Please enter your full name"); return; }

    setSubmitting(true);
    const res = await apiFetch<{
      accessToken: string;
      user: { id: string; email: string; fullName: string; role: Role };
      company: { id: string; name: string };
    }>(`/invites/${token}/accept`, {
      method: "POST",
      body: JSON.stringify({ fullName: form.fullName, password: form.password }),
    });
    setSubmitting(false);

    if (res.error) { setError(res.error); return; }

    if (res.data) {
      setAccessToken(res.data.accessToken);
      setAuth(res.data.user, res.data.company);
      toast({ title: "Welcome to the team!", description: `You've joined ${res.data.company.name}` });
      navigate("/dashboard");
    }
  };

  // ── Loading / error states ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invitation Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">
              The invitation may have expired or already been used. Please ask your admin to send a new invite.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "done_declined") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <XCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Invitation Declined</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You've declined the invitation to join <strong>{invite?.companyName}</strong>.
              We've let {invite?.invitedByName} know.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Set password stage (after accept) ──
  if (stage === "set_password" && invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Join <span className="text-primary">{invite.companyName}</span>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Set a password to finish creating your account.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={invite.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account & Join"}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline w-full text-center"
                onClick={() => setStage("review")}
              >
                Back
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Review stage (GitHub-style) ──
  if (!invite) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">
            You've been invited to join{" "}
            <span className="text-primary">{invite.companyName}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <strong>{invite.invitedByName}</strong> ({invite.invitedByEmail}) has invited you
            to collaborate on their GRC workspace.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Invited email
              </span>
              <span className="font-medium">{invite.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Role
              </span>
              <Badge variant="secondary" className={roleLabel[invite.role].color}>
                <span className="mr-1">{roleLabel[invite.role].icon}</span>
                {roleLabel[invite.role].label}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-medium">
                {new Date(invite.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
              disabled={submitting}
            >
              <XCircle className="w-4 h-4 mr-1" /> Decline
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={submitting || invite.status !== "pending"}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Accept Invitation
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
