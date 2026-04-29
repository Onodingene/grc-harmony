import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";

interface TestPlanRow {
  id: string;
  controlId: string;
  name: string;
  domain: string;
  frequency: string;
  nature: string;
  type: string;
  owner: { id: string; fullName: string; email: string };
  assignedTester: { id: string; fullName: string; email: string } | null;
  dueDate: string;
  status: "pending" | "pass" | "exception" | "fail";
  testResult: {
    population: number;
    sampleSize: number;
    exceptions: number;
    result: string;
    testedAt: string;
  } | null;
}

const statusColor = (s: string) => {
  switch (s) {
    case "pass":
      return "bg-green-100 text-green-800 border-green-300";
    case "fail":
      return "bg-red-100 text-red-800 border-red-300";
    case "exception":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

const TestPlan = () => {
  const { selectedCountry } = useCountryStore();
  const [data, setData] = useState<TestPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = d.toISOString().slice(0, 7);
    return {
      value: val,
      label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      key: i,
    };
  });

  useEffect(() => {
    if (!selectedCountry) return;
    setLoading(true);
    apiFetch<TestPlanRow[]>(
      `/test-plan?country_id=${
        selectedCountry ? selectedCountry.id : "all"
      }&month=${monthFilter}`
    )
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCountry, monthFilter]);

  const tested = data.filter((r) => r.status !== "pending").length;
  const passed = data.filter((r) => r.status === "pass").length;
  const progress =
    data.length > 0 ? Math.round((tested / data.length) * 100) : 0;

  const exportCSV = () => {
    const rows = data.map((r) => ({
      "Control ID": r.controlId,
      Name: r.name,
      Domain: r.domain,
      Owner: r.owner?.email ?? "",
      Tester: r.assignedTester?.email ?? "",
      "Due Date": r.dueDate,
      Status: r.status,
    }));
    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "test-plan.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">
          Monthly Test Plan — {selectedCountry?.name ?? "All Countries"}
        </h1>
        <div className="flex items-center gap-3">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.key} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-1">
          Testing Progress: {tested}/{data.length} tested ({passed} passed)
        </p>
        <div className="flex items-center gap-3 max-w-xs">
          <Progress value={progress} className="h-4 flex-1" />
          <span className="text-sm font-semibold">{progress}%</span>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              {[
                "Control ID",
                "Control Name",
                "Domain",
                "Owner",
                "Assigned Tester",
                "Due Date",
                "Population",
                "Sample",
                "Exceptions",
                "Status",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="text-primary-foreground font-bold whitespace-nowrap"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading test plan...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No controls due this month.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-bold text-primary">
                    {row.controlId}
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.domain}</TableCell>
                  <TableCell className="text-sm">
                    {row.owner?.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.assignedTester?.email ?? "—"}
                  </TableCell>
                  <TableCell>{row.dueDate}</TableCell>
                  <TableCell>{row.testResult?.population ?? "—"}</TableCell>
                  <TableCell>{row.testResult?.sampleSize ?? "—"}</TableCell>
                  <TableCell>{row.testResult?.exceptions ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColor(row.status)}
                    >
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TestPlan;
