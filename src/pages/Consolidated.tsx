import { useState, useEffect } from "react";
import {
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  CalendarDays,
  ClipboardList,
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

// Brand colours (see --brand-* tokens in index.css).
const C = {
  yellow: "#F5D63D",
  navy: "#0F1B3D",
  teal: "#4FB3BF",
  orange: "#E8804F",
  brown: "#8C7558",
  grid: "#ECE7DC",
  axis: "#6B7080",
};

interface CountryRow {
  country: { id: string; name: string; code: string };
  totalDue: number;
  totalTested: number;
  passCount: number;
  exceptionCount: number;
  failCount: number;
  passRate: number;
  coverage: number;
}

interface ConsolidatedData {
  period: string;
  rows: CountryRow[];
  totals: {
    totalDue: number;
    totalTested: number;
    passCount: number;
    exceptionCount: number;
    failCount: number;
    passRate: number;
    coverage: number;
  };
}

// Last 12 months as YYYY-MM options, newest first.
const generateMonthOptions = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return { value, label };
  });
};

const ragLabel = (rate: number) => (rate >= 80 ? "Green" : rate >= 50 ? "Amber" : "Red");

const RAGDot = ({ rate }: { rate: number }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
    <span
      className="w-2.5 h-2.5 rounded-full inline-block"
      style={{ background: rate >= 80 ? "#22a06b" : rate >= 50 ? C.yellow : "#d64545" }}
    />
    {ragLabel(rate)}
  </span>
);

const Consolidated = () => {
  const monthOptions = generateMonthOptions();
  const [period, setPeriod] = useState(monthOptions[0].value);
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<CountryRow | null>(null);

  const periodLabel =
    monthOptions.find((m) => m.value === period)?.label ?? period;

  useEffect(() => {
    setLoading(true);
    setSelectedRow(null);
    apiFetch<ConsolidatedData>(`/consolidated?period=${period}`)
      .then((res) => setData(res.data ?? null))
      .finally(() => setLoading(false));
  }, [period]);

  const monthFilter = (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 h-10">
      <CalendarDays className="w-4 h-4 text-muted-foreground" />
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="bg-transparent text-sm font-medium outline-none"
        aria-label="Filter by month"
      >
        {monthOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (selectedRow) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedRow(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back to consolidated view
        </button>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Business
            </p>
            <h1 className="text-3xl font-extrabold">
              {selectedRow.country.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{periodLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Due", value: selectedRow.totalDue, icon: ClipboardList, color: C.navy },
            { label: "Tested", value: selectedRow.totalTested, icon: Clock, color: C.brown },
            { label: "Pass Count", value: selectedRow.passCount, icon: CheckCircle, color: C.teal },
            { label: "Open Issues", value: selectedRow.failCount + selectedRow.exceptionCount, icon: AlertCircle, color: C.orange },
          ].map((s) => (
            <Card key={s.label} className="relative overflow-hidden">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: s.color }} />
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  {s.label}
                </div>
                <div className="text-3xl font-extrabold mt-1">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Pass Rate", value: selectedRow.passRate, color: C.teal },
            { label: "Coverage", value: selectedRow.coverage, color: C.navy },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-5">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-sm font-bold">{m.value}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{ width: `${m.value}%`, background: m.color }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartData = (data?.rows ?? []).map((r) => ({
    name: r.country.name,
    "Pass rate": r.passRate,
    Coverage: r.coverage,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Briefcase className="w-7 h-7" aria-hidden="true" />
            Consolidated View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare every business side by side. Click a business for its
            detailed breakdown.
          </p>
        </div>
        {monthFilter}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-72 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      ) : !data || data.rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            No business data for {periodLabel}.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Due", value: data.totals.totalDue, color: C.navy },
              { label: "Tested", value: data.totals.totalTested, color: C.brown },
              { label: "Pass Rate", value: `${data.totals.passRate}%`, color: C.teal },
              { label: "Coverage", value: `${data.totals.coverage}%`, color: C.orange },
            ].map((s) => (
              <Card key={s.label} className="relative overflow-hidden">
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: s.color }} />
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="text-3xl font-extrabold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">All businesses · {periodLabel}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Pass rate & coverage by business</CardTitle>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.teal }} /> Pass rate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.navy }} /> Coverage
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 18, right: 8, left: -16, bottom: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke={C.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.axis }} tickLine={false} axisLine={{ stroke: C.grid }} interval={0} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v: number) => `${v}%`}
                    contentStyle={{ borderRadius: 10, border: "1px solid #E3DDD0", fontSize: 12 }}
                    cursor={{ fill: "rgba(227,221,208,0.35)" }}
                  />
                  <Bar dataKey="Pass rate" fill={C.teal} radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="Pass rate" position="top" fontSize={11} fill={C.navy} formatter={(v: number) => `${v}%`} />
                  </Bar>
                  <Bar dataKey="Coverage" fill={C.navy} radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="Coverage" position="top" fontSize={11} fill={C.navy} formatter={(v: number) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Matrix */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Business Comparison Matrix</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px] text-left [&_th]:whitespace-nowrap [&_td]:align-top [&_td]:break-words">
                <thead className="bg-primary">
                  <tr>
                    {["Business", "Total Due", "Tested", "Pass Count", "Exceptions", "Failures", "Pass Rate", "Coverage", "RAG", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-brand-navy font-bold text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {data.rows.map((row) => (
                    <tr
                      key={row.country.id}
                      className="cursor-pointer bg-white transition-colors hover:bg-primary/10"
                      onClick={() => setSelectedRow(row)}
                    >
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        {row.country.name}{" "}
                        <span className="text-xs font-normal text-muted-foreground">({row.country.code})</span>
                      </td>
                      <td className="px-4 py-3">{row.totalDue}</td>
                      <td className="px-4 py-3">{row.totalTested}</td>
                      <td className="px-4 py-3 font-medium">{row.passCount}</td>
                      <td className="px-4 py-3">{row.exceptionCount}</td>
                      <td className="px-4 py-3">{row.failCount}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-md text-xs font-semibold"
                          style={
                            row.passRate >= 80
                              ? { background: "#dff3f5", color: "#1f6670" }
                              : { background: "#fbe6dc", color: "#8a3a14" }
                          }
                        >
                          {row.passRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.coverage}%</td>
                      <td className="px-4 py-3"><RAGDot rate={row.passRate} /></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs font-semibold text-brand-navy">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3">{data.totals.totalDue}</td>
                    <td className="px-4 py-3">{data.totals.totalTested}</td>
                    <td className="px-4 py-3">{data.totals.passCount}</td>
                    <td className="px-4 py-3">{data.totals.exceptionCount}</td>
                    <td className="px-4 py-3">{data.totals.failCount}</td>
                    <td className="px-4 py-3">{data.totals.passRate}%</td>
                    <td className="px-4 py-3">{data.totals.coverage}%</td>
                    <td className="px-4 py-3"><RAGDot rate={data.totals.passRate} /></td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Consolidated;
