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
import { Input } from "@/components/ui/input";
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
  status: "pending" | "pass" | "fail";
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
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState("all");

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

  const personEmails = useMemo(() => {
    const set = new Set<string>();
    data.forEach((r) => {
      if (r.owner?.email) set.add(r.owner.email);
      if (r.assignedTester?.email) set.add(r.assignedTester.email);
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data.filter((r) => {
      const matchesSearch =
        q === "" ||
        r.controlId.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q);
      const matchesPerson =
        personFilter === "all" ||
        r.owner?.email === personFilter ||
        r.assignedTester?.email === personFilter;
      return matchesSearch && matchesPerson;
    });
    // Backend already returns rows sorted ascending by dueDate; preserve that order.
    return rows
      .slice()
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [data, search, personFilter]);

  useEffect(() => {
    // if (!selectedCountry) return;
    setLoading(true);
    apiFetch<TestPlanRow[]>(
      `/test-plan?country_id=${
        selectedCountry ? selectedCountry.id : "all"
      }&month=${monthFilter}`
    )
      .then((res) => {
        console.log(res);

        if (res.data) setData(res.data);
      })
      .catch((e) => console.error(e))
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
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Search by control ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {personEmails.map((email) => (
                <SelectItem key={email} value={email}>
                  {email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Table className="min-w-[1400px] text-left [&_th]:whitespace-nowrap [&_td]:align-top [&_td]:break-words">
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
                "Failed Items",
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
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No controls due this month.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-bold text-primary">
                    {row.controlId}
                  </TableCell>
                  <TableCell className="whitespace-normal min-w-[220px] max-w-[360px]">
                    {row.name}
                  </TableCell>
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
