import { useState, useEffect } from "react";
import { ChevronRight, AlertCircle, CheckCircle, Clock, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

const MUSTARD = "#F5C518";

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

const RAGDot = ({ rate }: { rate: number }) => (
  <span className="w-3 h-3 rounded-full inline-block" style={{
    background: rate >= 80 ? "#22c55e" : rate >= 50 ? MUSTARD : "#ef4444"
  }} />
);

const Consolidated = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<CountryRow | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    apiFetch<ConsolidatedData>(`/consolidated?period=${currentMonth}`)
      .then((res) => { if (res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (selectedRow) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedRow(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          ← Back to consolidated view
        </button>
        <h1 className="text-2xl font-bold">{selectedRow.country.name} — {currentMonth}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Due", value: selectedRow.totalDue, icon: <CheckCircle className="w-4 h-4" style={{ color: MUSTARD }} /> },
            { label: "Tested", value: selectedRow.totalTested, icon: <Clock className="w-4 h-4 text-blue-400" /> },
            { label: "Pass Count", value: selectedRow.passCount, icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
            { label: "Open Issues", value: selectedRow.failCount + selectedRow.exceptionCount, icon: <AlertCircle className="w-4 h-4 text-red-400" /> },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-muted-foreground font-medium">{s.label}</span></div>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">Pass Rate</span>
              <span className="text-sm font-bold" style={{ color: MUSTARD }}>{selectedRow.passRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full" style={{ width: `${selectedRow.passRate}%`, background: MUSTARD }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" aria-hidden="true" />
          Consolidated View
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Click a country to view its detailed breakdown. Period: {currentMonth}</p>
      </div>

      <Card className="shadow-sm border overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Country Comparison Matrix</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1200px] text-left [&_th]:whitespace-nowrap [&_td]:align-top [&_td]:break-words">
            <thead>
              <tr style={{ background: MUSTARD }}>
                {["Country", "Total Due", "Tested", "Pass Count", "Exceptions", "Failures", "Pass Rate", "Coverage", "RAG", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-black font-semibold text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.rows.map((row, i) => (
                <tr key={row.country.id} className={`cursor-pointer transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50`} onClick={() => setSelectedRow(row)}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.country.name} <span className="text-xs text-muted-foreground">({row.country.code})</span></td>
                  <td className="px-4 py-3 text-gray-600">{row.totalDue}</td>
                  <td className="px-4 py-3 text-gray-600">{row.totalTested}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">{row.passCount}</td>
                  <td className="px-4 py-3 text-amber-700">{row.exceptionCount}</td>
                  <td className="px-4 py-3 text-red-700">{row.failCount}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-semibold" style={row.passRate >= 80 ? { background: "#d1fae5", color: "#065f46" } : { background: "#fee2e2", color: "#991b1b" }}>
                      {row.passRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.coverage}%</td>
                  <td className="px-4 py-3"><RAGDot rate={row.passRate} /></td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: MUSTARD }}>
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              {data?.totals && (
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3">{data.totals.totalDue}</td>
                  <td className="px-4 py-3">{data.totals.totalTested}</td>
                  <td className="px-4 py-3 text-green-700">{data.totals.passCount}</td>
                  <td className="px-4 py-3 text-amber-700">{data.totals.exceptionCount}</td>
                  <td className="px-4 py-3 text-red-700">{data.totals.failCount}</td>
                  <td className="px-4 py-3">{data.totals.passRate}%</td>
                  <td className="px-4 py-3">{data.totals.coverage}%</td>
                  <td className="px-4 py-3"><RAGDot rate={data.totals.passRate} /></td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Consolidated;