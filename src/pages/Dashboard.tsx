import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useCountryStore } from "@/lib/countryStore";

interface DashboardData {
  period: string;
  totalControls: number;
  controlsDueThisMonth: number;
  tested: number;
  passCount: number;
  exceptionCount: number;
  failCount: number;
  passRate: number;
  overdueCount: number;
  openIssuesCount: number;
  criticalIssuesCount: number;
  pendingActionsCount: number;
  overdueActionsCount: number;
  activeUsersCount: number;
  controlOwnersCount: number;
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
    createdAt: string;
    user: { fullName: string; email: string };
  }[];
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCountry) return;
    setLoading(true);
    apiFetch<DashboardData>(`/dashboard?country_id=${selectedCountry.id}`)
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCountry]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Format timestamp to relative time
  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const isAdmin = user?.role === "admin";

  const adminStats = data
    ? [
        { label: "Total Controls", value: String(data.totalControls), icon: Shield, trend: `${data.controlsDueThisMonth} due this month` },
        { label: "Open Issues", value: String(data.openIssuesCount), icon: AlertTriangle, trend: `${data.criticalIssuesCount} critical` },
        { label: "Tests Passed", value: `${data.passRate}%`, icon: CheckCircle, trend: `${data.passCount} passed this period` },
        { label: "Pending Actions", value: String(data.pendingActionsCount), icon: Clock, trend: `${data.overdueActionsCount} overdue` },
        { label: "Active Users", value: String(data.activeUsersCount), icon: Users, trend: `${data.controlOwnersCount} control owners` },
      ]
    : [];

  const ownerStats = data
    ? [
        { label: "Controls Due", value: String(data.controlsDueThisMonth), icon: Shield, trend: `${data.overdueCount} overdue` },
        { label: "My Open Issues", value: String(data.openIssuesCount), icon: AlertTriangle, trend: `${data.criticalIssuesCount} critical` },
        { label: "Pass Rate", value: `${data.passRate}%`, icon: CheckCircle, trend: "This period" },
        { label: "Pending Actions", value: String(data.pendingActionsCount), icon: Clock, trend: `${data.overdueActionsCount} overdue` },
      ]
    : [];

  const stats = isAdmin ? adminStats : ownerStats;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.fullName ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening across your controls today.
        </p>
      </div>

      {/* Stats grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4`}>
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentActivity?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentActivity.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.action}</TableCell>
                    <TableCell>{a.detail}</TableCell>
                    <TableCell>{a.user.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(a.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No recent activity yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;