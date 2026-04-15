import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

// Simulated current user email
const CURRENT_USER = "farouk@company.com";

interface TestRow {
  id: string;
  name: string;
  owner: string;
  dueDate: string;
  assignedTester: string;
  status: "Pending" | "Pass" | "Fail" | "Exception";
  population: number;
  sampleSize: number;
  exceptions: number;
}

const testPlanData: TestRow[] = [
  { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "john@company.com", dueDate: "2026-03-15", assignedTester: "farouk@company.com", status: "Pending", population: 0, sampleSize: 0, exceptions: 0 },
  { id: "MCS03", name: "Related Party Transactions & COI", owner: "sarah@company.com", dueDate: "2026-03-15", assignedTester: "farouk@company.com", status: "Pass", population: 25, sampleSize: 25, exceptions: 2 },
  { id: "MCS04", name: "Board of Directors Secretarial Requirements", owner: "sarah@company.com", dueDate: "2026-03-15", assignedTester: "", status: "Pending", population: 0, sampleSize: 0, exceptions: 0 },
  { id: "MCS11", name: "Personal Data Protection (GDPR)", owner: "alice@company.com", dueDate: "2026-04-15", assignedTester: "", status: "Pending", population: 0, sampleSize: 0, exceptions: 0 },
  { id: "MCS14", name: "Litigation Disputes", owner: "sarah@company.com", dueDate: "2026-04-15", assignedTester: "farouk@company.com", status: "Pending", population: 0, sampleSize: 0, exceptions: 0 },
  { id: "MCS20", name: "Customer & Inventory Master Data Management", owner: "mike@company.com", dueDate: "2026-03-15", assignedTester: "", status: "Pending", population: 0, sampleSize: 0, exceptions: 0 },
  { id: "MCS32", name: "Payment Processing", owner: "mike@company.com", dueDate: "2026-03-15", assignedTester: "farouk@company.com", status: "Fail", population: 20, sampleSize: 20, exceptions: 8 },
  { id: "MCS34", name: "Physical Stock Count, Reconciliation & Valuation", owner: "mike@company.com", dueDate: "2026-05-15", assignedTester: "farouk@company.com", status: "Exception", population: 30, sampleSize: 25, exceptions: 5 },
  { id: "MCS43", name: "Bank Account Reconciliations", owner: "mike@company.com", dueDate: "2026-05-15", assignedTester: "farouk@company.com", status: "Exception", population: 15, sampleSize: 15, exceptions: 4 },
];

const months = [
  { value: "all", label: "All Months" },
  { value: "2026-01", label: "January 2026" },
  { value: "2026-02", label: "February 2026" },
  { value: "2026-03", label: "March 2026" },
  { value: "2026-04", label: "April 2026" },
  { value: "2026-05", label: "May 2026" },
  { value: "2026-06", label: "June 2026" },
];

function calculateResult(population: number, sampleSize: number, exceptions: number): { result: string; percentage: number } {
  if (sampleSize === 0 || population === 0) return { result: "N/A", percentage: 0 };
  const passRate = ((sampleSize - exceptions) / sampleSize) * 100;
  return {
    result: passRate >= 80 ? "Pass" : "Fail",
    percentage: Math.round(passRate),
  };
}

const statusColor = (s: string) => {
  switch (s) {
    case "Pass": return "bg-green-100 text-green-800 border-green-300";
    case "Fail": return "bg-red-100 text-red-800 border-red-300";
    case "Exception": return "bg-orange-100 text-orange-800 border-orange-300";
    case "N/A": return "bg-gray-100 text-gray-600 border-gray-300";
    default: return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

const TestPlan = () => {
  const [data, setData] = useState<TestRow[]>(testPlanData);
  const [monthFilter, setMonthFilter] = useState("all");
  const [testDialog, setTestDialog] = useState(false);
  const [testingRow, setTestingRow] = useState<number | null>(null);
  const [testForm, setTestForm] = useState({ population: 0, sampleSize: 0, exceptions: 0 });

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (monthFilter === "all") return true;
      return row.dueDate.startsWith(monthFilter);
    });
  }, [data, monthFilter]);

  const completed = filtered.filter(d => {
    const { result } = calculateResult(d.population, d.sampleSize, d.exceptions);
    return result === "Pass";
  }).length;
  const tested = filtered.filter(d => d.sampleSize > 0).length;
  const progress = filtered.length > 0 ? Math.round((tested / filtered.length) * 100) : 0;

  const openTest = (idx: number) => {
    const row = data[idx];
    setTestForm({ population: row.population, sampleSize: row.sampleSize, exceptions: row.exceptions });
    setTestingRow(idx);
    setTestDialog(true);
  };

  const saveTest = () => {
    if (testingRow === null) return;
    const { result } = calculateResult(testForm.population, testForm.sampleSize, testForm.exceptions);
    setData(prev => prev.map((r, i) => i === testingRow ? {
      ...r,
      population: testForm.population,
      sampleSize: testForm.sampleSize,
      exceptions: testForm.exceptions,
      status: result === "N/A" ? "Pending" : result as "Pass" | "Fail",
    } : r));
    setTestDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Monthly Test Plan — Consolidated</h1>
        <div className="flex items-center gap-3">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportToCSV(filtered, "test-plan")}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-1">Testing Progress: {tested}/{filtered.length} tested ({completed} passed)</p>
        <div className="flex items-center gap-3 max-w-xs">
          <Progress value={progress} className="h-4 flex-1 [&>div]:bg-primary" />
          <span className="text-sm font-semibold">{progress}%</span>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              <TableHead className="text-primary-foreground font-bold">Control ID</TableHead>
              <TableHead className="text-primary-foreground font-bold">Control Name</TableHead>
              <TableHead className="text-primary-foreground font-bold">Owner</TableHead>
              <TableHead className="text-primary-foreground font-bold">Due Date</TableHead>
              <TableHead className="text-primary-foreground font-bold">Assigned Tester</TableHead>
              <TableHead className="text-primary-foreground font-bold">Population</TableHead>
              <TableHead className="text-primary-foreground font-bold">Sample</TableHead>
              <TableHead className="text-primary-foreground font-bold">Exceptions</TableHead>
              <TableHead className="text-primary-foreground font-bold">Result</TableHead>
              <TableHead className="text-primary-foreground font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => {
              const globalIdx = data.indexOf(row);
              const { result, percentage } = calculateResult(row.population, row.sampleSize, row.exceptions);
              const isAssignedToMe = row.assignedTester === CURRENT_USER;
              return (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-bold text-primary">{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.owner}</TableCell>
                  <TableCell>{row.dueDate}</TableCell>
                  <TableCell>{row.assignedTester || "-"}</TableCell>
                  <TableCell>{row.population || "-"}</TableCell>
                  <TableCell>{row.sampleSize || "-"}</TableCell>
                  <TableCell>{row.exceptions || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(result)}>
                      {result === "N/A" ? "Pending" : `${result} (${percentage}%)`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAssignedToMe ? (
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs px-3" onClick={() => openTest(globalIdx)}>
                        Test
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Test Result — {testingRow !== null ? data[testingRow].id : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Population Size</Label>
              <Input type="number" min={0} value={testForm.population} onChange={(e) => setTestForm({ ...testForm, population: Number(e.target.value) })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Sample Size</Label>
              <Input type="number" min={0} value={testForm.sampleSize} onChange={(e) => setTestForm({ ...testForm, sampleSize: Number(e.target.value) })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Exceptions Found</Label>
              <Input type="number" min={0} value={testForm.exceptions} onChange={(e) => setTestForm({ ...testForm, exceptions: Number(e.target.value) })} />
            </div>
            {testForm.sampleSize > 0 && (
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm font-medium">
                  Calculated Result: {(() => {
                    const { result, percentage } = calculateResult(testForm.population, testForm.sampleSize, testForm.exceptions);
                    return <Badge variant="outline" className={statusColor(result)}>{result} ({percentage}%)</Badge>;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">≥80% pass rate = Pass, &lt;80% = Fail</p>
              </div>
            )}
          </div>
          <DialogFooter><Button onClick={saveTest}>Save Result</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestPlan;
