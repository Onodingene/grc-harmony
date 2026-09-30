import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ClipboardList,
  XCircle,
  Globe,
  CalendarDays,
  ArrowUpRight,
  Activity,
  type LucideIcon,
} from "lucide-react";
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

interface CountryRow {
  country: { id: string; name: string; code: string };
  totalDue: number;
  totalTested: number;
  passCount: number;
  failCount: number;
  passRate: number;
  coverage: number;
}

// Status colours are reserved for pass/fail state and always ship with an
// icon and a label, never colour alone.
const STATUS = { good: "#0ca30c", critical: "#d03b3b" };
// Single-hue magnitude colour for the per-country pass-rate bars.
const MAGNITUDE = "#2a78d6";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  link: string;
  // Flags a tile that needs attention (e.g. critical issues, overdue items).
  alert?: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { countries, selectedCountry, setSelectedCountry } = useCountryStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [countryRows, setCountryRows] = useState<CountryRow[]>([]);
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

  const role = (data?.role ?? user?.role) as string | undefined;
  const showCountries =
    !selectedCountry &&
    countries.length > 1 &&
    (role === "admin" || role === "viewer" || role === "tester");

  // Per-country snapshot, only when looking across every country.
  useEffect(() => {
    if (!showCountries || !data?.period) return;
    apiFetch<{ rows: CountryRow[] }>(
      `/consolidated?period=${data.period}`,
    ).then((res) => {
      if (res.data?.rows) setCountryRows(res.data.rows);
    });
  }, [showCountries, data?.period]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const periodLabel = data?.period
    ? new Date(`${data.period}-01T00:00:00`).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : "";

  // ── Stat sets per role ──────────────────────────────────────────────────
  const adminStats: Stat[] = data
    ? [
        {
          label: "Total Controls",
          value: String(data.totalControls ?? 0),
          icon: Shield,
          trend: `${data.controlsDueThisMonth ?? 0} due this month`,
          link: "/controls",
        },
        {
          label: "Overdue Tests",
          value: String(data.overdueCount ?? 0),
          icon: CalendarDays,
          trend: "Due this month, past due day",
          link: "/test-plan",
          alert: (data.overdueCount ?? 0) > 0,
        },
        {
          label: "Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
          link: "/issues",
          alert: (data.criticalIssuesCount ?? 0) > 0,
        },
        {
          label: "Failed Items",
          value: String(data.exceptionCount ?? 0),
          icon: XCircle,
          trend: `${data.failCount ?? 0} tests failed this period`,
          link: "/testing",
        },
        {
          label: "Pending Actions",
          value: String(data.pendingActionsCount ?? 0),
          icon: Clock,
          trend: `${data.overdueActionsCount ?? 0} overdue`,
          link: "/actions",
          alert: (data.overdueActionsCount ?? 0) > 0,
        },
        {
          label: selectedCountry ? `People in ${selectedCountry.name}` : "Active Users",
          value: String(data.activeUsersCount ?? 0),
          icon: Users,
          trend: `${data.controlOwnersCount ?? 0} control owners`,
          link: "/settings",
        },
      ]
    : [];

  const ownerStats: Stat[] = data
    ? [
        {
          label: "My Controls Due",
          value: String(data.controlsDueThisMonth ?? 0),
          icon: Shield,
          trend: `${data.overdueCount ?? 0} overdue`,
          link: "/controls",
          alert: (data.overdueCount ?? 0) > 0,
        },
        {
          label: "My Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
          link: "/issues",
          alert: (data.criticalIssuesCount ?? 0) > 0,
        },
        {
          label: "Failed Items",
          value: String(data.exceptionCount ?? 0),
          icon: XCircle,
          trend: `${data.failCount ?? 0} tests failed this period`,
          link: "/testing",
        },
        {
          label: "Pending Actions",
          value: String(data.pendingActionsCount ?? 0),
          icon: Clock,
          trend: `${data.overdueActionsCount ?? 0} overdue`,
          link: "/actions",
          alert: (data.overdueActionsCount ?? 0) > 0,
        },
      ]
    : [];

  const testerStats: Stat[] = data
    ? [
        {
          label: "Controls Untested",
          value: String(
            (data.totalAssignedTests ?? 0) - (data.currentPeriodTests ?? 0),
          ),
          icon: ClipboardList,
          trend: `Out of ${data.totalAssignedTests ?? 0} assigned`,
          link: "/test-plan",
        },
        {
          label: "Failed Items",
          value: String(data.exceptionCount ?? 0),
          icon: XCircle,
          trend: `${data.failCount ?? 0} tests failed this period`,
          link: "/testing",
        },
        {
          label: "Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
          link: "/issues",
          alert: (data.criticalIssuesCount ?? 0) > 0,
        },
        {
          label: "Pending Confirmation",
          value: String(data.pendingConfirmationCount ?? 0),
          icon: Clock,
          trend: "Awaiting owner confirmation",
          link: "/issues",
        },
        {
          label: "Closed Issues",
          value: String(data.closedIssuesCount ?? 0),
          icon: CheckCircle,
          trend: "Issues resolved",
          link: "/issues",
        },
        {
          label: "Total Assigned",
          value: String(data.totalAssignedTests ?? 0),
          icon: Shield,
          trend: "Controls assigned to you",
          link: "/test-plan",
        },
      ]
    : [];

  const viewerStats: Stat[] = data
    ? [
        {
          label: "Total Controls",
          value: String(data.totalControls ?? 0),
          icon: Shield,
          trend: selectedCountry ? selectedCountry.name : "Across your countries",
          link: "/controls",
        },
        {
          label: "Failed Items",
          value: String(data.exceptionCount ?? 0),
          icon: XCircle,
          trend: `${data.failCount ?? 0} tests failed this period`,
          link: "/testing",
        },
        {
          label: "Open Issues",
          value: String(data.openIssuesCount ?? 0),
          icon: AlertTriangle,
          trend: `${data.criticalIssuesCount ?? 0} critical`,
          link: "/issues",
          alert: (data.criticalIssuesCount ?? 0) > 0,
        },
      ]
    : [];

  const statsMap: Record<string, Stat[]> = {
    admin: adminStats,
    control_owner: ownerStats,
    tester: testerStats,
    viewer: viewerStats,
  };

  const subtitleMap: Record<string, string> = {
    admin: "Here's what's happening across your controls today.",
    control_owner: "Here's the status of your assigned controls.",
    tester: "Here's a summary of your testing activity.",
    viewer: "Here's a read-only overview of compliance status.",
  };

  const stats = role ? (statsMap[role] ?? adminStats) : adminStats;
  const subtitle = role
    ? (subtitleMap[role] ?? subtitleMap.admin)
    : subtitleMap.admin;

  const showActivity = role !== "viewer";

  // This period's outcomes, shared by every role.
  const pass = data?.passCount ?? 0;
  const fail = data?.failCount ?? 0;
  const testedTotal = pass + fail;
  const passRate = data?.passRate ?? 0;
  const due = role === "admin" ? (data?.controlsDueThisMonth ?? 0) : 0;
  const coverage = due > 0 ? Math.min(100, Math.round((testedTotal / due) * 100)) : null;

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-36 bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl bg-neutral-950 text-white p-6 md:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <Globe className="w-3 h-3" />
                {selectedCountry?.name ?? "All countries"}
              </span>
              {periodLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <CalendarDays className="w-3 h-3" />
                  {periodLabel}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {greeting}, {user?.fullName?.split(" ")[0] ?? "there"}
              </h1>
              <p className="text-white/70 text-sm mt-1">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-end gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/60">
                Pass rate
              </p>
              <p className="text-4xl md:text-5xl font-bold text-primary leading-none mt-1">
                {passRate}%
              </p>
              <p className="text-xs text-white/60 mt-1">
                {pass} of {testedTotal} tests this period
              </p>
            </div>
            {coverage !== null && (
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">
                  Coverage
                </p>
                <p className="text-4xl md:text-5xl font-bold leading-none mt-1">
                  {coverage}%
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {testedTotal} of {due} due tested
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            onClick={() => navigate(s.link)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(s.link);
              }
            }}
            className="group rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    s.alert ? "bg-red-50 text-red-700" : "bg-primary/15 text-foreground"
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">{s.label}</p>
              <p className="text-3xl font-bold tracking-tight mt-0.5">{s.value}</p>
              <p
                className={`text-xs mt-1 flex items-center gap-1 ${
                  s.alert ? "text-red-700 font-medium" : "text-muted-foreground"
                }`}
              >
                {s.alert && <AlertTriangle className="w-3 h-3" />}
                {s.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* ── This period's testing ── */}
        <Card className="rounded-xl shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Test outcomes</CardTitle>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {testedTotal === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No tests logged this period yet.
              </p>
            ) : (
              <>
                <div
                  className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
                  role="img"
                  aria-label={`${pass} passed, ${fail} failed`}
                >
                  {pass > 0 && (
                    <div
                      title={`Passed: ${pass}`}
                      style={{ width: `${(pass / testedTotal) * 100}%`, background: STATUS.good }}
                    />
                  )}
                  {fail > 0 && (
                    <div
                      title={`Failed: ${fail}`}
                      style={{ width: `${(fail / testedTotal) * 100}%`, background: STATUS.critical }}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: STATUS.good }} />
                      Passed
                    </p>
                    <p className="text-2xl font-semibold mt-1">{pass}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" style={{ color: STATUS.critical }} />
                      Failed
                    </p>
                    <p className="text-2xl font-semibold mt-1">{fail}</p>
                  </div>
                </div>
              </>
            )}
            {role !== "viewer" && (
              <button
                onClick={() => navigate("/testing")}
                className="text-sm font-medium inline-flex items-center gap-1 hover:underline"
              >
                Go to testing <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </CardContent>
        </Card>

        {/* ── Countries at a glance (all-countries view) or activity ── */}
        {showCountries ? (
          <Card className="rounded-xl shadow-sm lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Countries at a glance</CardTitle>
              <p className="text-xs text-muted-foreground">
                Pass rate this period · select a country to focus on it
              </p>
            </CardHeader>
            <CardContent>
              {countryRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No country data yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {countryRows.map((r) => (
                    <li key={r.country.id}>
                      <button
                        onClick={() => {
                          const c = countries.find((x) => x.id === r.country.id);
                          if (c) setSelectedCountry(c);
                        }}
                        title={`${r.country.name}: ${r.passCount} passed, ${r.failCount} failed, ${r.totalTested} of ${r.totalDue} due tested`}
                        className="w-full grid grid-cols-[7rem_1fr_3rem] sm:grid-cols-[9rem_1fr_3rem_6rem] items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                      >
                        <span className="font-medium truncate">
                          {r.country.name}
                        </span>
                        <span className="h-2 rounded-full bg-muted overflow-hidden">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${r.passRate}%`, background: MAGNITUDE }}
                          />
                        </span>
                        <span className="text-right font-semibold tabular-nums">
                          {r.passRate}%
                        </span>
                        <span className="hidden sm:block text-right text-xs text-muted-foreground tabular-nums">
                          {r.totalTested}/{r.totalDue} tested
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : (
          showActivity && (
            <ActivityCard
              className="lg:col-span-3"
              items={data?.recentActivity ?? []}
              timeAgo={timeAgo}
              onOpen={() => navigate("/audit")}
            />
          )
        )}
      </div>

      {showCountries && showActivity && (
        <ActivityCard
          items={data?.recentActivity ?? []}
          timeAgo={timeAgo}
          onOpen={() => navigate("/audit")}
        />
      )}
    </div>
  );
};

const ActivityCard = ({
  items,
  timeAgo,
  onOpen,
  className = "",
}: {
  items: NonNullable<DashboardData["recentActivity"]>;
  timeAgo: (iso: string) => string;
  onOpen: () => void;
  className?: string;
}) => (
  <Card className={`rounded-xl shadow-sm ${className}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        <Activity className="w-4 h-4" /> Recent activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      {items.length ? (
        <ol className="relative space-y-1">
          {items.map((a) => (
            <li key={a.id}>
              <button
                onClick={onOpen}
                className="w-full flex items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted"
              >
                <span className="mt-0.5 w-8 h-8 shrink-0 rounded-full bg-primary/20 text-xs font-bold flex items-center justify-center">
                  {(a.user.fullName ?? a.user.email)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    <span className="font-medium">{a.user.fullName}</span>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    {a.action}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {a.detail}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(a.createdAt)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">
          No recent activity yet.
        </p>
      )}
    </CardContent>
  </Card>
);

export default Dashboard;
