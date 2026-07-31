import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { openEvidence } from "@/lib/evidence";
import { useCountryStore } from "@/lib/countryStore";

const StatCard = ({
  title,
  value,
  borderColor,
  textColor,
}: {
  title: string;
  value: string | number;
  borderColor: string;
  textColor: string;
}) => (
  <div
    className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderColor}`}
  >
    <p className="text-xs text-muted-foreground">{title}</p>
    <h2 className={`text-2xl font-bold ${textColor}`}>{value}</h2>
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
  result: "pass" | "exception" | "fail";
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
        "Exceptions",
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
      { label: "Exceptions", value: m.exceptionCount },
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
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; }
  .period { color: #555; font-size: 12px; margin-bottom: 16px; }
  .metrics { display: flex; flex-wrap: wrap; gap: 12px; }
  .metric { border: 1px solid #e5e5e5; border-left: 4px solid #f9d75c; border-radius: 6px; padding: 8px 14px; min-width: 110px; }
  .metric-label { display: block; font-size: 10px; color: #777; text-transform: uppercase; }
  .metric-value { display: block; font-size: 18px; font-weight: bold; }
  /* Fixed layout + wrapping keeps long descriptions inside their column
     instead of running off the page and over the next one. "anywhere" also
     breaks unbroken strings such as long file names. */
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; table-layout: fixed; }
  th { background: #f9d75c; text-align: left; padding: 6px; word-wrap: break-word; }
  td { padding: 6px; border-bottom: 1px solid #eee; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; }
  .empty { text-align: center; color: #888; padding: 16px; }
  ul { font-size: 12px; padding-left: 18px; }
  @media print { body { margin: 12px; } }
</style>
</head>
<body>
  <h1>Monthly Test Report</h1>
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
        <th>Domain</th><th>Tester</th><th>Test Procedure</th><th>Sample Size</th><th>Exceptions</th>
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
    if (result === "pass") return "text-green-600";
    if (result === "exception") return "text-yellow-800";
    return "text-red-600";
  };

  const severityColor = (severity: string) => {
    if (severity === "high") return "text-red-600";
    if (severity === "medium") return "text-yellow-800";
    return "text-green-600";
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Monthly Test Report</h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={loading || !report}
                  className="bg-[#f9d75c] text-black hover:bg-[#f5cd3a] px-3 py-2 h-auto rounded-md text-sm font-medium"
                >
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
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="border rounded-md px-3 py-2 text-sm text-muted-foreground">
            {selectedCountry?.name ?? "All Countries"}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Loading report...
          </div>
        )}

        {!loading && !report && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No data for this period.
          </div>
        )}

        {!loading && report && (
          <>
            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                title="TOTAL TESTS"
                value={report.metrics.totalTests}
                borderColor="border-yellow-400"
                textColor="text-black"
              />
              <StatCard
                title="PASS"
                value={report.metrics.passCount}
                borderColor="border-green-500"
                textColor="text-green-600"
              />
              <StatCard
                title="EXCEPTIONS"
                value={report.metrics.exceptionCount}
                borderColor="border-yellow-500"
                textColor="text-yellow-700"
              />
              <StatCard
                title="FAIL"
                value={report.metrics.failCount}
                borderColor="border-red-500"
                textColor="text-red-600"
              />
              <StatCard
                title="PASS RATE"
                value={`${report.metrics.passRate}%`}
                borderColor="border-yellow-400"
                textColor="text-yellow-700"
              />
            </div>

            {/* DOMAIN */}
            <div>
              <h2 className="text-sm font-semibold mb-2">
                Test Results by Domain
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {report.byDomain.map((d) => {
                  const passRate = d.totalTests
                    ? (d.passCount / d.totalTests) * 100
                    : 0;
                  return (
                    <div
                      key={d.domain}
                      className="bg-white p-4 rounded-lg shadow-sm border"
                    >
                      <h3 className="font-semibold text-sm mb-2">{d.domain}</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Tests
                          </span>
                          <span>{d.totalTests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pass</span>
                          <span className="text-green-600 font-medium">
                            {d.passCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Exceptions
                          </span>
                          <span className="text-yellow-800 font-medium">
                            {d.exceptionCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fail</span>
                          <span className="text-red-600 font-medium">
                            {d.failCount}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Progress</span>
                          <span>{Math.round(passRate)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              passRate === 100
                                ? "bg-green-500"
                                : passRate > 0
                                ? "bg-yellow-400"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DETAILED TABLE */}
            <div>
              <h2 className="text-sm font-semibold mb-2">
                Detailed Test Results
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-[1500px] w-full table-fixed text-xs text-left [&_th]:p-2 [&_td]:p-2 [&_td]:align-top">
                  <colgroup>
                    <col className="w-[90px]" />  {/* Test Date */}
                    <col className="w-[90px]" />  {/* Control ID */}
                    <col className="w-[260px]" /> {/* Control Description */}
                    <col className="w-[130px]" /> {/* Domain */}
                    <col className="w-[140px]" /> {/* Tester */}
                    <col className="w-[260px]" /> {/* Test Procedure */}
                    <col className="w-[80px]" />  {/* Sample Size */}
                    <col className="w-[80px]" />  {/* Exceptions */}
                    <col className="w-[80px]" />  {/* Result */}
                    <col className="w-[240px]" /> {/* Evidence & Comment */}
                    <col className="w-[240px]" /> {/* Recommendation */}
                  </colgroup>
                  <thead className="bg-[#f9d75c] text-left">
                    <tr>
                      <th className="whitespace-nowrap">Test Date</th>
                      <th className="whitespace-nowrap">Control ID</th>
                      <th>Control Description</th>
                      <th className="whitespace-nowrap">Domain</th>
                      <th className="whitespace-nowrap">Tester</th>
                      <th>Test Procedure</th>
                      <th className="whitespace-nowrap">Sample Size</th>
                      <th className="whitespace-nowrap">Exceptions</th>
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
                      <tr key={idx} className="border-b">
                        <td className="whitespace-nowrap">
                          {new Date(r.testDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap">{r.controlId}</td>
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
                          className={`whitespace-nowrap ${resultColor(r.result)}`}
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
                                  className="underline text-blue-600 cursor-pointer"
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
            </div>

            {/* ISSUES */}
            <div>
              <h2 className="text-sm font-semibold mb-2">Issues Identified</h2>
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full table-fixed text-xs text-left [&_th]:p-2 [&_td]:p-2 [&_td]:align-top">
                  <colgroup>
                    <col className="w-[100px]" /> {/* Issue ID */}
                    <col className="w-[220px]" /> {/* Control Description */}
                    <col className="w-[280px]" /> {/* Description */}
                    <col className="w-[90px]" />  {/* Severity */}
                    <col className="w-[110px]" /> {/* Status */}
                    <col className="w-[150px]" /> {/* Owner */}
                    <col className="w-[110px]" /> {/* Due Date */}
                  </colgroup>
                  <thead className="bg-[#f9d75c] text-left">
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
                      <tr key={i.issueId} className="border-b">
                        <td className="whitespace-nowrap">{i.issueId}</td>
                        <td className="whitespace-normal break-words">
                          {issueControlDescriptionOf(i)}
                        </td>
                        <td className="whitespace-normal break-words">
                          {i.description}
                        </td>
                        <td
                          className={`whitespace-nowrap ${severityColor(i.severity)}`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {i.severity}
                        </td>
                        <td
                          className="whitespace-nowrap text-red-600"
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
            </div>

            {/* RECOMMENDATIONS */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold mb-2">Recommendations</h2>
              {report.recommendations.length === 0 && (
                <div className="bg-green-50 border-l-4 border-green-600 p-3 text-xs flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-px text-green-700"
                    aria-hidden="true"
                  />
                  <span>All controls are performing well.</span>
                </div>
              )}
              {report.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs flex items-start gap-2"
                >
                  <AlertTriangle
                    className="w-4 h-4 shrink-0 mt-px text-yellow-800"
                    aria-hidden="true"
                  />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyReport;