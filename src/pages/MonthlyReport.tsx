import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
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
  domain: string;
  tester: { fullName: string; email: string };
  sampleSize: number;
  exceptions: number;
  result: "pass" | "exception" | "fail";
  evidenceUrl: string | null;
}

interface ReportIssue {
  issueId: string;
  controlId: string;
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

const BASE_URL = import.meta.env.VITE_API_URL;

// Generate last 12 months as options
const generateMonthOptions = () => {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    options.push({ label, value: `${year}-${month}` });
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

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      [
        "Test Date",
        "Control ID",
        "Control Name",
        "Domain",
        "Tester",
        "Sample Size",
        "Exceptions",
        "Result",
      ],
      ...report.detailedResults.map((r) => [
        new Date(r.testDate).toLocaleDateString(),
        r.controlId,
        r.controlName,
        r.domain,
        r.tester.fullName,
        r.sampleSize,
        r.exceptions,
        r.result,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resultColor = (result: string) => {
    if (result === "pass") return "text-green-600";
    if (result === "exception") return "text-yellow-600";
    return "text-red-600";
  };

  const severityColor = (severity: string) => {
    if (severity === "high") return "text-red-600";
    if (severity === "medium") return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Monthly Test Report</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!month) return;
                const countryId = selectedCountry?.id ?? "all";
                fetchReport(countryId, month);
              }}
              className="bg-[#f9d75c] px-3 py-2 rounded-md text-sm font-medium"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-gray-100 px-3 py-2 rounded-md text-sm"
            >
              Export CSV
            </button>
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
                textColor="text-yellow-600"
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
                textColor="text-yellow-600"
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
                          <span className="text-yellow-600 font-medium">
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
                <table className="w-full text-xs">
                  <thead className="bg-[#f9d75c] text-left">
                    <tr>
                      <th className="p-2">Test Date</th>
                      <th>Control ID</th>
                      <th>Control Name</th>
                      <th>Domain</th>
                      <th>Tester</th>
                      <th>Sample Size</th>
                      <th>Exceptions</th>
                      <th>Result</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.detailedResults.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No test results for this period
                        </td>
                      </tr>
                    )}
                    {report.detailedResults.map((r, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">
                          {new Date(r.testDate).toLocaleDateString()}
                        </td>
                        <td>{r.controlId}</td>
                        <td>{r.controlName}</td>
                        <td>{r.domain}</td>
                        <td>{r.tester.fullName}</td>
                        <td>{r.sampleSize}</td>
                        <td>{r.exceptions}</td>
                        <td
                          className={resultColor(r.result)}
                          style={{ textTransform: "capitalize" }}
                        >
                          {r.result}
                        </td>
                        <td>
                          {r.evidenceUrl ? (
                            <a
                              href={`${BASE_URL}${r.evidenceUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-blue-600"
                            >
                              View
                            </a>
                          ) : (
                            "—"
                          )}
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
              <table className="w-full text-xs">
                <thead className="bg-[#f9d75c] text-left">
                  <tr>
                    <th className="p-2">Issue ID</th>
                    <th>Control ID</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Due Date</th>
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
                      <td className="p-2">{i.issueId}</td>
                      <td>{i.controlId}</td>
                      <td>{i.description}</td>
                      <td
                        className={severityColor(i.severity)}
                        style={{ textTransform: "capitalize" }}
                      >
                        {i.severity}
                      </td>
                      <td
                        className="text-red-600"
                        style={{ textTransform: "capitalize" }}
                      >
                        {i.status.replace("_", " ")}
                      </td>
                      <td>{i.owner?.fullName ?? "—"}</td>
                      <td>
                        {i.dueDate
                          ? new Date(i.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold mb-2">Recommendations</h2>
              {report.recommendations.length === 0 && (
                <div className="bg-green-50 border-l-4 border-green-600 p-3 text-xs">
                  ✅ All controls are performing well.
                </div>
              )}
              {report.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs"
                >
                  {rec}
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
