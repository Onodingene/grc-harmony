import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { apiFetch, setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

const Signup = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    org: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await apiFetch<{
      accessToken: string;
      user: { id: string; email: string; fullName: string; role: 'admin' | 'control_owner' | 'tester' | 'viewer' };
      company: { id: string; name: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        fullName: form.name,
        companyName: form.org,
      }),
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.data) {
      setAccessToken(res.data.accessToken);
      setAuth(res.data.user, res.data.company);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-primary">GRC</span> Control Tool
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Wunmi Lolace"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org">Organization / Company Name</Label>
              <Input
                id="org"
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                placeholder="Your Company"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = 'http://localhost:3030/api/auth/google';
              }}
            >
              Sign up with Google
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;