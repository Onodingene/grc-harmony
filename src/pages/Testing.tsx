import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Eye } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

interface TestRecord {
  id: string;
  controlId: string;
  testDate: string;
  testName: string;
  sampleSize: string;
  population: string;
  exceptionFound: string;
  testResult: string;
  evidenceResponse: string;
  testProcedure: string;
  comments: string;
}

const statusColors: Record<string, string> = {
  Pass: "bg-green-100 text-green-800",
  Fail: "bg-red-100 text-red-800",
  "Not Tested": "bg-secondary text-muted-foreground",
  "In Progress": "bg-primary/20 text-primary-foreground",
};

const initialTests: TestRecord[] = [
  { id: "T001", controlId: "MCS01", testDate: "2026-03-15", testName: "CoBC Distribution Review", sampleSize: "25", population: "150", exceptionFound: "0", testResult: "Pass", evidenceResponse: "All evidence collected", testProcedure: "Reviewed CoBC acknowledgement forms for sample employees", comments: "No exceptions noted" },
  { id: "T002", controlId: "MCS02", testDate: "2026-03-10", testName: "Fair Competition Training Check", sampleSize: "30", population: "200", exceptionFound: "3", testResult: "Fail", evidenceResponse: "Partial evidence", testProcedure: "Verified training completion records", comments: "3 employees missing training certificates" },
  { id: "T003", controlId: "MCS03", testDate: "", testName: "RPT Disclosure Verification", sampleSize: "", population: "", exceptionFound: "", testResult: "Not Tested", evidenceResponse: "", testProcedure: "Review quarterly RPT disclosures", comments: "Scheduled for Q2" },
];

const emptyTest: Omit<TestRecord, "id"> = { controlId: "", testDate: "", testName: "", sampleSize: "", population: "", exceptionFound: "", testResult: "", evidenceResponse: "", testProcedure: "", comments: "" };

const Testing = () => {
  const [tests, setTests] = useState<TestRecord[]>(initialTests);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<string>("");
  const [form, setForm] = useState(emptyTest);

  const openAdd = () => { setForm(emptyTest); setOpen(true); };

  const save = () => {
    if (!form.controlId || !form.testName) return;
    const nextId = `T${String(tests.length + 1).padStart(3, "0")}`;
    setTests((prev) => [...prev, { id: nextId, ...form }]);
    setOpen(false);
  };

  const viewHistory = (controlId: string) => {
    setSelectedControl(controlId);
    setHistoryOpen(true);
  };

  const historyTests = tests.filter((t) => t.controlId === selectedControl);

  const set = (key: keyof Omit<TestRecord, "id">, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testing</h1>
          <p className="text-muted-foreground text-sm">Record and track control test executions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(tests, "testing")}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Record New Test</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Test ID</TableHead>
              <TableHead>Control ID</TableHead>
              <TableHead>Test Date</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Sample Size</TableHead>
              <TableHead>Population</TableHead>
              <TableHead>Exceptions</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-semibold">{t.id}</TableCell>
                <TableCell>{t.controlId}</TableCell>
                <TableCell>{t.testDate || "—"}</TableCell>
                <TableCell>{t.testName}</TableCell>
                <TableCell>{t.sampleSize || "—"}</TableCell>
                <TableCell>{t.population || "—"}</TableCell>
                <TableCell>{t.exceptionFound || "—"}</TableCell>
                <TableCell><Badge className={statusColors[t.testResult] || ""}>{t.testResult}</Badge></TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => viewHistory(t.controlId)}>
                    <Eye className="w-3 h-3 mr-1" /> History
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Test Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Test</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="grid gap-1.5"><Label>Control ID</Label><Input value={form.controlId} onChange={(e) => set("controlId", e.target.value)} placeholder="e.g. MCS01" /></div>
            <div className="grid gap-1.5"><Label>Test Date</Label><Input type="date" value={form.testDate} onChange={(e) => set("testDate", e.target.value)} /></div>
            <div className="col-span-2 grid gap-1.5"><Label>Test Name</Label><Input value={form.testName} onChange={(e) => set("testName", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Sample Size</Label><Input type="number" value={form.sampleSize} onChange={(e) => set("sampleSize", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Population</Label><Input type="number" value={form.population} onChange={(e) => set("population", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Exception Found</Label><Input type="number" value={form.exceptionFound} onChange={(e) => set("exceptionFound", e.target.value)} /></div>
            <div className="grid gap-1.5">
              <Label>Test Result</Label>
              <Select value={form.testResult} onValueChange={(v) => set("testResult", v)}>
                <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Tested">Not Tested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid gap-1.5"><Label>Test Procedure</Label><Textarea value={form.testProcedure} onChange={(e) => set("testProcedure", e.target.value)} /></div>
            <div className="col-span-2 grid gap-1.5"><Label>Evidence Response</Label><Textarea value={form.evidenceResponse} onChange={(e) => set("evidenceResponse", e.target.value)} /></div>
            <div className="col-span-2 grid gap-1.5"><Label>Comments</Label><Textarea value={form.comments} onChange={(e) => set("comments", e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save Test</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Test History — {selectedControl}</DialogTitle></DialogHeader>
          {historyTests.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No test history for this control.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sample</TableHead>
                  <TableHead>Exceptions</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyTests.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-semibold">{t.id}</TableCell>
                    <TableCell>{t.testDate || "—"}</TableCell>
                    <TableCell>{t.testName}</TableCell>
                    <TableCell>{t.sampleSize}/{t.population}</TableCell>
                    <TableCell>{t.exceptionFound || "0"}</TableCell>
                    <TableCell><Badge className={statusColors[t.testResult] || ""}>{t.testResult}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testing;
