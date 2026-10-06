import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Percent,
  Target,
  Download,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { openEvidence } from "@/lib/evidence";
import { useCountryStore } from "@/lib/countryStore";
import logo from "@/assets/logo.jpeg";

// Brand chart colours (see --brand-* tokens in index.css).
const C = {
  pass: "#4FB3BF", // teal
  fail: "#E8804F", // orange
  exception: "#8C7558", // brown
  navy: "#0F1B3D",
  grid: "#ECE7DC",
  axis: "#6B7080",
};
const SEVERITY_COLOR: Record<string, string> = {
  high: "#E8804F",
  medium: "#8C7558",
  low: "#4FB3BF",
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #E3DDD0",
    fontSize: 12,
    boxShadow: "0 8px 24px rgba(15,27,61,0.12)",
  },
  cursor: { fill: "rgba(227,221,208,0.35)" },
};

const KpiTile = ({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof ClipboardList;
  accent: string;
}) => (
  <div className="relative overflow-hidden rounded-xl border border-border/80 bg-white px-4 py-2.5">
    <span
      className="absolute inset-x-0 top-0 h-1"
      style={{ background: accent }}
      aria-hidden
    />
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      {label}
    </div>
    <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
      {value}
    </p>
    {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
  </div>
);

const Panel = ({
  title,
  subtitle,
  className = "",
  legend,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  legend?: { label: string; color: string }[];
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-xl border border-border/80 bg-white p-4 flex flex-col ${className}`}
  >
    <div className="flex items-start justify-between gap-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
        {title}
      </p>
      {legend && (
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
    {subtitle && (
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    )}
    <div className="mt-2 flex-1 min-h-0">{children}</div>
  </div>
);

interface ReportMetrics {
  totalTests: number;
  passCount: number;
  exceptionCount: number;
  failCount: number;
  passRate: number;
  coverage: number;
}

interface DomainResult {
  domain: string;
  totalTests: number;
  passCount: number;
  exceptionCount: number;
  failCount: number;
  progress: number;
}

interface DetailedResult {
  testDate: string;
  controlId: string;
  controlName: string;
  controlDescription: string | null;
  domain: string;
  tester: { fullName: string; email: string };
  testProcedure: string | null;
  sampleSize: number;
  exceptions: number;
  result: "pass" | "fail";
  evidenceUrl: string | null;
  evidenceUrls: string[];
  comments: string | null;
  recommendation: string | null;
}

interface ReportIssue {
  issueId: string;
  controlId: string;
  controlName: string | null;
  controlDescription: string | null;
  description: string;
  severity: string;
  status: string;
  owner: { fullName: string; email: string } | null;
  dueDate: string | null;
}

interface MonthlyReportData {
  period: string;
  company: string;
  metrics: ReportMetrics;
  byDomain: DomainResult[];
  detailedResults: DetailedResult[];
  issues: ReportIssue[];
  recommendations: string[];
}

// Uploaded files are served at <host>/uploads, NOT under /api — strip the
// trailing /api so evidence links resolve to the static file route.
const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "");

// Testing is carried out one month after the activity it covers, so the work
// stored under period YYYY-MM is reported as the month before it. Only the
// label shifts — the stored period, and the test dates, are untouched.
const reportLabelFor = (period: string) => {
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr ?? "", 10);
  const monthNum = parseInt(monthStr ?? "", 10);
  if (isNaN(year) || isNaN(monthNum)) return period;
  // monthNum - 2 because the Date month index is zero-based.
  return new Date(year, monthNum - 2, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// Generate last 12 months as options
const generateMonthOptions = () => {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const value = `${year}-${month}`;
    options.push({ label: reportLabelFor(value), value });
  }
  return options;
};

const MonthlyReport = () => {
  const { toast } = useToast();
  const { selectedCountry } = useCountryStore();
  const [report, setReport] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const monthOptions = generateMonthOptions();

  // Default to current month in YYYY-MM format
  const [month, setMonth] = useState<string>(monthOptions[0]?.value ?? "");

  const fetchReport = (countryId: string, selectedMonth: string) => {
    setLoading(true);
    apiFetch<MonthlyReportData>(
      `/reports/monthly?country_id=${countryId ?? "all"}&month=${selectedMonth}`
    )
      .then((res) => {
        if (res.data) setReport(res.data);
        if (res.error)
          toast({
            title: "Error",
            description: res.error,
            variant: "destructive",
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!month) return;
    const countryId = selectedCountry?.id ?? "all";
    fetchReport(countryId, month);
  }, [selectedCountry?.id, month]);

  // Description of a tested control, falling back to its name/id.
  const controlDescriptionOf = (r: DetailedResult) =>
    r.controlDescription || r.controlName || r.controlId;

  // Description of an issue's control, falling back to its name/id.
  const issueControlDescriptionOf = (i: ReportIssue) =>
    i.controlDescription || i.controlName || i.controlId;

  // All evidence files for a row (array first, single URL as fallback).
  const evidenceUrlsOf = (r: DetailedResult) => {
    if (r.evidenceUrls && r.evidenceUrls.length > 0) return r.evidenceUrls;
    if (r.evidenceUrl) return [r.evidenceUrl];
    return [];
  };

  // Quote/escape a CSV field so commas, quotes and newlines are safe.
  const csvCell = (value: string | number | null | undefined) => {
    const str = value == null ? "" : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      [
        "Test Date",
        "Control ID",
        "Control Description",
        "Domain",
        "Tester",
        "Test Procedure",
        "Sample Size",
        "Failed Items",
        "Result",
        "Comment",
        "Recommendation",
      ],
      ...report.detailedResults.map((r) => [
        new Date(r.testDate).toLocaleDateString(),
        r.controlId,
        controlDescriptionOf(r),
        r.domain,
        r.tester.fullName,
        r.testProcedure ?? "",
        r.sampleSize,
        r.exceptions,
        r.result,
        r.comments ?? "",
        r.recommendation ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportLabelFor(month).replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!report) return;

    const esc = (value: string | number | null | undefined) => {
      const str = value == null ? "" : String(value);
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

    const m = report.metrics;
    const metricCards = [
      { label: "Total Tests", value: m.totalTests },
      { label: "Pass", value: m.passCount },
      { label: "Failed Items", value: m.exceptionCount },
      { label: "Fail", value: m.failCount },
      { label: "Pass Rate", value: `${m.passRate}%` },
      { label: "Coverage", value: `${m.coverage}%` },
    ]
      .map(
        (c) =>
          `<div class="metric"><span class="metric-label">${esc(
            c.label
          )}</span><span class="metric-value">${esc(c.value)}</span></div>`
      )
      .join("");

    const detailRows = report.detailedResults.length
      ? report.detailedResults
          .map(
            (r) => `<tr>
              <td>${esc(new Date(r.testDate).toLocaleDateString())}</td>
              <td>${esc(r.controlId)}</td>
              <td>${esc(controlDescriptionOf(r))}</td>
              <td>${esc(r.domain)}</td>
              <td>${esc(r.tester.fullName)}</td>
              <td>${esc(r.testProcedure ?? "—")}</td>
              <td>${esc(r.sampleSize)}</td>
              <td>${esc(r.exceptions)}</td>
              <td>${esc(r.result)}</td>
              <td>${esc(r.comments ?? "—")}</td>
              <td>${esc(r.recommendation ?? "—")}</td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="10" class="empty">No test results for this period</td></tr>`;

    const issueRows = report.issues.length
      ? report.issues
          .map(
            (i) => `<tr>
              <td>${esc(i.issueId)}</td>
              <td>${esc(issueControlDescriptionOf(i))}</td>
              <td>${esc(i.description)}</td>
              <td>${esc(i.severity)}</td>
              <td>${esc(i.status.replace("_", " "))}</td>
              <td>${esc(i.owner?.fullName ?? "—")}</td>
              <td>${esc(
                i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"
              )}</td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="7" class="empty">No issues for this period</td></tr>`;

    const recommendations = report.recommendations.length
      ? report.recommendations
          .map((rec) => `<li>${esc(rec)}</li>`)
          .join("")
      : `<li>All controls are performing well.</li>`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Monthly Test Report - ${esc(reportLabelFor(report.period))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif; color: #0F1B3D; margin: 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; }
  .period { color: #555; font-size: 12px; margin-bottom: 16px; }
  .metrics { display: flex; flex-wrap: wrap; gap: 12px; }
  .metric { border: 1px solid #e5e5e5; border-left: 4px solid #F5D63D; border-radius: 6px; padding: 8px 14px; min-width: 110px; }
  .metric-label { display: block; font-size: 10px; color: #777; text-transform: uppercase; }
  .metric-value { display: block; font-size: 18px; font-weight: bold; }
  /* Fixed layout + wrapping keeps long descriptions inside their column
     instead of running off the page and over the next one. "anywhere" also
     breaks unbroken strings such as long file names. */
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; table-layout: fixed; }
  th { background: #F5D63D; text-align: left; padding: 6px; word-wrap: break-word; }
  td { padding: 6px; border-bottom: 1px solid #eee; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; }
  .empty { text-align: center; color: #888; padding: 16px; }
  ul { font-size: 12px; padding-left: 18px; }
  @media print { body { margin: 12px; } }
</style>
</head>
<body>
  <h1>Governance, Risk and Compliance — Monthly Report</h1>
  <div class="period">${esc(report.company)} &middot; ${esc(
      reportLabelFor(report.period)
    )}</div>

  <h2>Summary</h2>
  <div class="metrics">${metricCards}</div>

  <h2>Detailed Test Results</h2>
  <table>
    <thead>
      <tr>
        <th>Test Date</th><th>Control ID</th><th>Control Description</th>
        <th>Domain</th><th>Tester</th><th>Test Procedure</th><th>Sample Size</th><th>Failed Items</th>
        <th>Result</th><th>Comment</th><th>Recommendation</th>
      </tr>
    </thead>
    <tbody>${detailRows}</tbody>
  </table>

  <h2>Issues Identified</h2>
  <table>
    <thead>
      <tr>
        <th>Issue ID</th><th>Control Description</th><th>Description</th>
        <th>Severity</th><th>Status</th><th>Owner</th><th>Due Date</th>
      </tr>
    </thead>
    <tbody>${issueRows}</tbody>
  </table>

  <h2>Recommendations</h2>
  <ul>${recommendations}</ul>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      toast({
        title: "Popup blocked",
        description: "Allow popups to export the report as PDF.",
        variant: "destructive",
      });
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // Give the new window a tick to render before invoking print.
    setTimeout(() => win.print(), 300);
  };

  const resultColor = (result: string) => {
    if (result === "pass") return "text-green-700";
    return "text-red-700";
  };

  const severityColor = (severity: string) => {
    if (severity === "high") return "text-red-600";
    if (severity === "medium") return "text-yellow-800";
    return "text-green-600";
  };

  const periodLabel = report ? reportLabelFor(report.period) : reportLabelFor(month);
  const businessLabel = selectedCountry?.name ?? "All Businesses";

  const outcomeData = report
    ? [
        { name: "Pass", value: report.metrics.passCount, color: C.pass },
        { name: "Fail", value: report.metrics.failCount, color: C.fail },
      ].filter((d) => d.value > 0)
    : [];

  const domainData = report
    ? report.byDomain.map((d) => ({
        domain: d.domain,
        Pass: d.passCount,
        Fail: d.failCount,
      }))
    : [];

  const severityData = report
    ? ["high", "medium", "low"].map((sev) => ({
        severity: sev[0].toUpperCase() + sev.slice(1),
        key: sev,
        count: report.issues.filter((i) => i.severity === sev).length,
      }))
    : [];

  return (
    <div className="space-y-4">
      {/* TOOLBAR (kept outside the board so screenshots stay clean) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 h-10">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none"
              aria-label="Report month"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 h-10 text-sm font-medium">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            {businessLabel}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={loading || !report}
              className="h-10 bg-brand-navy text-white hover:bg-brand-navy/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              Download CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* REPORT BOARD — sized to fit one screen for screenshots */}
      <section
        className={`rounded-2xl border border-border/80 bg-[#FBFAF7] shadow-[var(--shadow-card)] overflow-hidden transition-opacity ${
          loading ? "opacity-60" : ""
        }`}
      >
        <div className="bg-primary px-6 py-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-navy leading-none">
              Monthly Report
            </h1>
            <p className="mt-2 text-base md:text-lg font-semibold text-brand-navy/80">
              Control testing results · {periodLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-navy/70">
              Business
            </p>
            <p className="text-xl font-extrabold text-brand-navy">
              {businessLabel}
            </p>
          </div>
        </div>

        {!report ? (
          <div className="py-24 text-center text-muted-foreground text-sm">
            {loading ? "Loading report..." : "No data for this period."}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* KPI ROW */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <KpiTile
                label="Total tests"
                value={report.metrics.totalTests}
                icon={ClipboardList}
                accent={C.navy}
              />
              <KpiTile
                label="Pass"
                value={report.metrics.passCount}
                icon={CheckCircle2}
                accent={C.pass}
              />
              <KpiTile
                label="Fail"
                value={report.metrics.failCount}
                icon={XCircle}
                accent={C.fail}
              />
              <KpiTile
                label="Failed items"
                value={report.metrics.exceptionCount}
                sub="Exceptions in samples"
                icon={AlertTriangle}
                accent={C.exception}
              />
              <KpiTile
                label="Pass rate"
                value={`${report.metrics.passRate}%`}
                icon={Percent}
                accent={C.pass}
              />
              <KpiTile
                label="Coverage"
                value={`${report.metrics.coverage}%`}
                icon={Target}
                accent={C.navy}
              />
            </div>

            {/* CHARTS ROW */}
            <div className="grid gap-3 lg:grid-cols-3">
              <Panel
                title="Results by domain"
                subtitle="Tests passed and failed per key area"
                legend={[
                  { label: "Pass", color: C.pass },
                  { label: "Fail", color: C.fail },
                ]}
                className="lg:col-span-2 h-[250px]"
              >
                {domainData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={domainData}
                      margin={{ top: 18, right: 8, left: -18, bottom: 0 }}
                      barGap={2}
                    >
                      <CartesianGrid vertical={false} stroke={C.grid} />
                      <XAxis
                        dataKey="domain"
                        tick={{ fontSize: 11, fill: C.axis }}
                        tickLine={false}
                        axisLine={{ stroke: C.grid }}
                        interval={0}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: C.axis }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="Pass" fill={C.pass} radius={[4, 4, 0, 0]} maxBarSize={36}>
                        <LabelList dataKey="Pass" position="top" fontSize={11} fill={C.navy} />
                      </Bar>
                      <Bar dataKey="Fail" fill={C.fail} radius={[4, 4, 0, 0]} maxBarSize={36}>
                        <LabelList dataKey="Fail" position="top" fontSize={11} fill={C.navy} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Panel>

              <Panel
                title="Test outcome"
                subtitle={`${report.metrics.passCount} of ${report.metrics.passCount + report.metrics.failCount} tests passed`}
                legend={[
                  { label: "Pass", color: C.pass },
                  { label: "Fail", color: C.fail },
                ]}
                className="h-[250px]"
              >
                {outcomeData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="relative h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={outcomeData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="62%"
                          outerRadius="88%"
                          paddingAngle={outcomeData.length > 1 ? 2 : 0}
                          stroke="none"
                        >
                          {outcomeData.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-foreground">
                        {report.metrics.passRate}%
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Pass rate
                      </span>
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid gap-3 lg:grid-cols-3">
              <Panel
                title="Issues by severity"
                subtitle={`${report.issues.length} issue${report.issues.length === 1 ? "" : "s"} raised`}
                className="h-[160px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={severityData}
                    layout="vertical"
                    margin={{ top: 0, right: 28, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="severity"
                      width={60}
                      tick={{ fontSize: 11, fill: C.navy, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" name="Issues" radius={[0, 4, 4, 0]} barSize={14}>
                      {severityData.map((d) => (
                        <Cell key={d.key} fill={SEVERITY_COLOR[d.key]} />
                      ))}
                      <LabelList dataKey="count" position="right" fontSize={12} fill={C.navy} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              <Panel
                title="Key recommendations"
                className="lg:col-span-2 h-[160px]"
              >
                {report.recommendations.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4" style={{ color: C.pass }} />
                    All controls are performing well.
                  </div>
                ) : (
                  <ol className="space-y-2 overflow-hidden">
                    {report.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm leading-snug">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-brand-navy">
                          {idx + 1}
                        </span>
                        <span className="line-clamp-2">{rec}</span>
                      </li>
                    ))}
                    {report.recommendations.length > 3 && (
                      <li className="text-xs text-muted-foreground pl-7">
                        +{report.recommendations.length - 3} more below
                      </li>
                    )}
                  </ol>
                )}
              </Panel>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between pt-1">
              <img src={logo} alt="Sun King" className="h-6 w-auto mix-blend-multiply" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Governance, Risk and Compliance · {businessLabel}
              </span>
            </div>
          </div>
        )}
      </section>

      {!loading && report && (
        <>
          {/* DETAILED TABLE */}
          <section className="rounded-xl border bg-white shadow-[var(--shadow-card)] overflow-hidden">
            <h2 className="px-5 py-4 text-base font-bold border-b">
              Detailed Test Results
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-[1500px] w-full table-fixed text-xs text-left [&_th]:px-3 [&_th]:py-2.5 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top">
                <colgroup>
                  <col className="w-[90px]" />  {/* Test Date */}
                  <col className="w-[90px]" />  {/* Control ID */}
                  <col className="w-[260px]" /> {/* Control Description */}
                  <col className="w-[130px]" /> {/* Domain */}
                  <col className="w-[140px]" /> {/* Tester */}
                  <col className="w-[260px]" /> {/* Test Procedure */}
                  <col className="w-[80px]" />  {/* Sample Size */}
                  <col className="w-[80px]" />  {/* Failed Items */}
                  <col className="w-[80px]" />  {/* Result */}
                  <col className="w-[240px]" /> {/* Evidence & Comment */}
                  <col className="w-[240px]" /> {/* Recommendation */}
                </colgroup>
                <thead className="bg-muted/70 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="whitespace-nowrap">Test Date</th>
                    <th className="whitespace-nowrap">Control ID</th>
                    <th>Control Description</th>
                    <th className="whitespace-nowrap">Domain</th>
                    <th className="whitespace-nowrap">Tester</th>
                    <th>Test Procedure</th>
                    <th className="whitespace-nowrap">Sample Size</th>
                    <th className="whitespace-nowrap">Failed Items</th>
                    <th className="whitespace-nowrap">Result</th>
                    <th>Evidence &amp; Comment</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {report.detailedResults.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No test results for this period
                      </td>
                    </tr>
                  )}
                  {report.detailedResults.map((r, idx) => (
                    <tr key={idx} className="border-b border-border/70 hover:bg-muted/40">
                      <td className="whitespace-nowrap">
                        {new Date(r.testDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap font-semibold">{r.controlId}</td>
                      <td className="whitespace-normal break-words">
                        {controlDescriptionOf(r)}
                      </td>
                      <td className="whitespace-nowrap">{r.domain}</td>
                      <td className="whitespace-nowrap">{r.tester.fullName}</td>
                      <td className="whitespace-normal break-words">
                        {r.testProcedure || "—"}
                      </td>
                      <td className="whitespace-nowrap">{r.sampleSize}</td>
                      <td className="whitespace-nowrap">{r.exceptions}</td>
                      <td
                        className={`whitespace-nowrap font-semibold ${resultColor(r.result)}`}
                        style={{ textTransform: "capitalize" }}
                      >
                        {r.result}
                      </td>
                      <td className="whitespace-normal break-words">
                        {evidenceUrlsOf(r).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {evidenceUrlsOf(r).map((url, i) => (
                              <a
                                key={i}
                                href={`${BASE_URL}${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openEvidence(url);
                                }}
                                className="underline text-blue-700 cursor-pointer"
                              >
                                View{evidenceUrlsOf(r).length > 1 ? ` ${i + 1}` : ""}
                              </a>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                        {r.comments && (
                          <p className="mt-1 text-muted-foreground italic">
                            {r.comments}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-normal break-words">
                        {r.recommendation || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ISSUES */}
          <section className="rounded-xl border bg-white shadow-[var(--shadow-card)] overflow-hidden">
            <h2 className="px-5 py-4 text-base font-bold border-b">
              Issues Identified
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full table-fixed text-xs text-left [&_th]:px-3 [&_th]:py-2.5 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top">
                <colgroup>
                  <col className="w-[100px]" /> {/* Issue ID */}
                  <col className="w-[220px]" /> {/* Control Description */}
                  <col className="w-[280px]" /> {/* Description */}
                  <col className="w-[90px]" />  {/* Severity */}
                  <col className="w-[110px]" /> {/* Status */}
                  <col className="w-[150px]" /> {/* Owner */}
                  <col className="w-[110px]" /> {/* Due Date */}
                </colgroup>
                <thead className="bg-muted/70 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="whitespace-nowrap">Issue ID</th>
                    <th>Control Description</th>
                    <th>Description</th>
                    <th className="whitespace-nowrap">Severity</th>
                    <th className="whitespace-nowrap">Status</th>
                    <th className="whitespace-nowrap">Owner</th>
                    <th className="whitespace-nowrap">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {report.issues.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No issues for this period
                      </td>
                    </tr>
                  )}
                  {report.issues.map((i) => (
                    <tr key={i.issueId} className="border-b border-border/70 hover:bg-muted/40">
                      <td className="whitespace-nowrap font-semibold">{i.issueId}</td>
                      <td className="whitespace-normal break-words">
                        {issueControlDescriptionOf(i)}
                      </td>
                      <td className="whitespace-normal break-words">
                        {i.description}
                      </td>
                      <td
                        className={`whitespace-nowrap font-semibold ${severityColor(i.severity)}`}
                        style={{ textTransform: "capitalize" }}
                      >
                        {i.severity}
                      </td>
                      <td
                        className="whitespace-nowrap text-red-700"
                        style={{ textTransform: "capitalize" }}
                      >
                        {i.status.replace("_", " ")}
                      </td>
                      <td className="whitespace-nowrap">
                        {i.owner?.fullName ?? "—"}
                      </td>
                      <td className="whitespace-nowrap">
                        {i.dueDate
                          ? new Date(i.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* RECOMMENDATIONS */}
          <section className="rounded-xl border bg-white shadow-[var(--shadow-card)] p-5 space-y-2">
            <h2 className="text-base font-bold mb-3">Recommendations</h2>
            {report.recommendations.length === 0 && (
              <div className="rounded-lg bg-brand-teal/10 border-l-4 border-brand-teal p-3 text-sm flex items-start gap-2">
                <CheckCircle2
                  className="w-4 h-4 shrink-0 mt-0.5 text-brand-teal"
                  aria-hidden="true"
                />
                <span>All controls are performing well.</span>
              </div>
            )}
            {report.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-primary/15 border-l-4 border-primary p-3 text-sm flex items-start gap-2"
              >
                <AlertTriangle
                  className="w-4 h-4 shrink-0 mt-0.5 text-brand-navy"
                  aria-hidden="true"
                />
                <span>{rec}</span>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

const EmptyChart = () => (
  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
    No tests logged for this period.
  </div>
);

export default MonthlyReport;