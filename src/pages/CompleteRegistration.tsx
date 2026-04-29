import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setAuth, company } = useAuthStore();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    org: "",
    industry: "",
    country: "",
    role: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill org if it was captured on signup page before the Google redirect
    const pendingOrg = sessionStorage.getItem("pending_org");
    if (pendingOrg) {
      setForm((f) => ({ ...f, org: pendingOrg }));
      sessionStorage.removeItem("pending_org");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.org || !form.industry || !form.country || !form.role) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const res = await apiFetch<{
      user: { id: string; email: string; fullName: string; role: "admin" | "control_owner" | "tester" | "viewer" };
      company: { id: string; name: string };
    }>("/auth/complete-registration", {
      method: "POST",
      body: JSON.stringify({
        fullName: form.fullName,
        companyName: form.org,
        industry: form.industry,
        country: form.country,
        jobTitle: form.role,
        phone: form.phone,
      }),
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.data) {
      setAuth(res.data.user, res.data.company);
      toast({ title: "Welcome aboard!", description: "Your profile is now complete." });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
          <p className="text-muted-foreground text-sm">
            You're almost there! Tell us a bit more about you and your organization
            to finish setting up your account.
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org">Organization / Company Name *</Label>
              <Input
                id="org"
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                placeholder="Your Company"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial_services">Financial Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="energy">Energy & Utilities</SelectItem>
                    <SelectItem value="retail">Retail & Consumer</SelectItem>
                    <SelectItem value="telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="public_sector">Public Sector</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                    <SelectItem value="EG">Egypt</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue placeholder="What best describes your role?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cfo">CFO / Finance Director</SelectItem>
                  <SelectItem value="head_internal_audit">Head of Internal Audit</SelectItem>
                  <SelectItem value="risk_manager">Risk / Compliance Manager</SelectItem>
                  <SelectItem value="controller">Controller</SelectItem>
                  <SelectItem value="control_owner">Control Owner</SelectItem>
                  <SelectItem value="auditor">Auditor / Tester</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Finishing setup..." : "Complete Registration & Continue"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By continuing you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteRegistration;
