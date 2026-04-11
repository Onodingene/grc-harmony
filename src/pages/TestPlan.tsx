import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

const testPlanData = [
  { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Omoyemi Tuga", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS03", name: "Related Party Transactions & COI", owner: "Mary Waititu", dueDate: "2026-03-15", assignedTester: "@farouk", status: "Pass" },
  { id: "MCS04", name: "Board of Directors Secretarial Requirements", owner: "Mary Waititu", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS11", name: "Personal Data Protection (GDPR)", owner: "Olamide Ayo-Ogunlade", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS14", name: "Litigation Disputes", owner: "Mary Waititu", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS20", name: "Customer & Inventory Master Data Management", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS22.2", name: "Customer Credit Limits – Partnership", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS23", name: "Invoicing", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS24", name: "Accounts Receivable Valuation", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS25", name: "Onboarding/Offboarding & HR Master Data", owner: "HR Manager", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS26", name: "Payroll Processing", owner: "HR Manager", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS27", name: "Labour Law Compliance", owner: "HR Manager", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS28", name: "Employee Pension & Benefits", owner: "HR Manager", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS31", name: "Three-Way/Two-Way Match & Direct Vendor Invoices", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS32", name: "Payment Processing", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "@farouk", status: "Fail" },
  { id: "MCS33", name: "Accruals for Un-invoiced Expenditures", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS34", name: "Physical Stock Count, Reconciliation & Valuation", owner: "Operations", dueDate: "2026-03-15", assignedTester: "@farouk", status: "Exception" },
  { id: "MCS35", name: "Inventory Documentation (IMPEX)", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS42", name: "GL Account Reconciliations", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS43", name: "Bank Account Reconciliations", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "@farouk", status: "Exception" },
  { id: "MCS44", name: "Intercompany Balance Reconciliations", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS45", name: "Manual Journal Entries", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS48", name: "Legal Structure & Consolidation Hierarchy", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS49", name: "Consolidation of Financial Statements", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS50", name: "Statutory Financial Statements", owner: "Regional Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS51", name: "Tax Risk Assessment & Reporting", owner: "Tax Manager", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS55", name: "Indirect Taxes (VAT)", owner: "Tax Manager", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS57", name: "Cash Transactions Policy", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
  { id: "MCS60", name: "Forex & Interest Rate Risk Monitoring", owner: "Finance Controller", dueDate: "2026-03-15", assignedTester: "-", status: "Pending" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "Pass": return "bg-green-100 text-green-800 border-green-300";
    case "Fail": return "bg-red-100 text-red-800 border-red-300";
    case "Exception": return "bg-orange-100 text-orange-800 border-orange-300";
    default: return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

const TestPlan = () => {
  const [data] = useState(testPlanData);
  const completed = data.filter(d => d.status === "Pass").length;
  const progress = Math.round((completed / data.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Monthly Test Plan — March 2026 — All Countries (Consolidated)</h1>
        <Button size="sm" variant="outline" onClick={() => exportToCSV(data, "test-plan")}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div>
        <p className="text-sm font-semibold mb-1">Monthly Progress:</p>
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
              <TableHead className="text-primary-foreground font-bold">Status</TableHead>
              <TableHead className="text-primary-foreground font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                <TableCell className="font-bold text-primary">{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>{row.assignedTester}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor(row.status)}>{row.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs px-3">Test</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TestPlan;
