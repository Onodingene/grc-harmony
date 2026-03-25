import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  Pass: "bg-green-100 text-green-800",
  Fail: "bg-red-100 text-red-800",
  "Not Tested": "bg-secondary text-muted-foreground",
  "In Progress": "bg-primary/20 text-primary-foreground",
};

const sampleTests = [
  { id: "T001", control: "MCS01", tester: "Omoyemi Tuga", date: "2026-03-15", result: "Pass" },
  { id: "T002", control: "MCS02", tester: "Mary Waititu", date: "2026-03-10", result: "Fail" },
  { id: "T003", control: "MCS03", tester: "Godson Iwuozo", date: "", result: "Not Tested" },
];

const Testing = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Testing</h1>
        <p className="text-muted-foreground text-sm">Record and track control test executions.</p>
      </div>
      <Button>Record New Test</Button>
    </div>
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10">
            <TableHead>Test ID</TableHead>
            <TableHead>Control</TableHead>
            <TableHead>Tester</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleTests.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-semibold">{t.id}</TableCell>
              <TableCell>{t.control}</TableCell>
              <TableCell>{t.tester}</TableCell>
              <TableCell>{t.date || "—"}</TableCell>
              <TableCell>
                <Badge className={statusColors[t.result] || ""}>{t.result}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default Testing;
