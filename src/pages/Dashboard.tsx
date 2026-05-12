import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ClipboardList,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useCountryStore } from "@/lib/countryStore";

interface DashboardData {
  role: string;
  period: string;
  // Admin
  totalControls?: number;
  controlsDueThisMonth?: number;
  tested?: number;
  passCount?: number;
  exceptionCount?: number;
  failCount?: number;
  passRate?: number;
  overdueCount?: number;
  openIssuesCount?: number;
  criticalIssuesCount?: number;
  pendingActionsCount?: number;
  overdueActionsCount?: number;
  activeUsersCount?: number;
  controlOwnersCount?: number;
  // Tester
  totalAssignedTests?: number;
  currentPeriodTests?: number;
  closedIssuesCount?: number;
  pendingConfirmationCount?: number;
  // Viewer (subset of above)
  totalTested?: number;
  recentActivity?: {
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
    setLoading(true);
    apiFetch<DashboardData>(
      `/dashboard?country_id=${selectedCountry ? selectedCountry.id : "all"}`,
    )
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCountry]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const role = (data?.role ?? user?.role) as string | undefined;
  console.log("user role:", user?.role, "| data role:", data?.role);

  // ── Stat sets per role ──────────────────────────────────────────────────
  const adminStats = data
    ? [
        {
          label: "Total Controls",
          value: String(data.totalControls ?? 0),
          icon: Shield,
          trend: `${data.controlsDueThisMonth ?? 0} due this month`,
        },
        {
          label: "Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
        },
        {
          label: "Tests Passed",
          value: `${data.passRate ?? 0}%`,
          icon: CheckCircle,
          trend: `${data.passCount ?? 0} passed this period`,
        },
        {
          label: "Pending Actions",
          value: String(data.pendingActionsCount ?? 0),
          icon: Clock,
          trend: `${data.overdueActionsCount ?? 0} overdue`,
        },
        {
          label: "Active Users",
          value: String(data.activeUsersCount ?? 0),
          icon: Users,
          trend: `${data.controlOwnersCount ?? 0} control owners`,
        },
      ]
    : [];

  const ownerStats = data
    ? [
        {
          label: "My Controls Due",
          value: String(data.controlsDueThisMonth ?? 0),
          icon: Shield,
          trend: `${data.overdueCount ?? 0} overdue`,
        },
        {
          label: "My Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
        },
        {
          label: "Pass Rate",
          value: `${data.passRate ?? 0}%`,
          icon: CheckCircle,
          trend: "This period",
        },
        {
          label: "Pending Actions",
          value: String(data.pendingActionsCount ?? 0),
          icon: Clock,
          trend: `${data.overdueActionsCount ?? 0} overdue`,
        },
      ]
    : [];

  const testerStats = data
    ? [
        {
          label: "Controls Tested",
          value: String(data.currentPeriodTests ?? 0),
          icon: CheckCircle,
          trend: `${data.passCount ?? 0} passed / ${data.failCount ?? 0} failed`,
        },
        {
          label: "Controls Untested",
          value: String(
            (data.totalAssignedTests ?? 0) - (data.currentPeriodTests ?? 0),
          ),
          icon: ClipboardList,
          trend: `Out of ${data.totalAssignedTests ?? 0} assigned`,
        },
        {
          label: "Total Assigned",
          value: String(data.totalAssignedTests ?? 0),
          icon: Shield,
          trend: "Controls assigned to you",
        },
        {
          label: "Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
        },
        {
          label: "Pending Confirmation",
          value: String(data.pendingConfirmationCount ?? 0),
          icon: Clock,
          trend: "Awaiting owner confirmation",
        },
        {
          label: "Closed Issues",
          value: String(data.closedIssuesCount ?? 0),
          icon: CheckCircle,
          trend: "Issues resolved",
        },
      ]
    : [];

  const viewerStats = data
    ? [
        {
          label: "Total Controls",
          value: String(data.totalControls ?? 0),
          icon: Shield,
          trend: "Company-wide",
        },
        {
          label: "Pass Rate",
          value: `${data.passRate ?? 0}%`,
          icon: CheckCircle,
          trend: `${data.passCount ?? 0} of ${data.totalTested ?? 0} tests passed`,
        },
        {
          label: "Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
        },
      ]
    : [];

  const statsMap: Record<string, typeof adminStats> = {
    admin: adminStats,
    control_owner: ownerStats,
    tester: testerStats,
    viewer: viewerStats,
  };

  const subtitleMap: Record<string, string> = {
    admin: "Here's what's happening across your controls today.",
    control_owner: "Here's the status of your assigned controls.",
    tester: "Here's a summary of your testing activity.",
    viewer: "Here's a read-only overview of the company's compliance status.",
  };

  const stats = role ? (statsMap[role] ?? adminStats) : adminStats;
  const subtitle = role
    ? (subtitleMap[role] ?? subtitleMap.admin)
    : subtitleMap.admin;

  const colsMap: Record<string, string> = {
    admin: "lg:grid-cols-3",
    control_owner: "lg:grid-cols-4",
    tester: "lg:grid-cols-3",
    viewer: "lg:grid-cols-3",
  };
  const cols = role ? (colsMap[role] ?? "lg:grid-cols-3") : "lg:grid-cols-3";

  const showActivity = role !== "viewer";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
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
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-4`}>
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showActivity && (
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
                      <TableCell className="text-muted-foreground">
                        {timeAgo(a.createdAt)}
                      </TableCell>
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
      )}
    </div>
  );
};

export default Dashboard;
