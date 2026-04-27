import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Eye, Upload } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/lib/api";

interface AvailableControl {
  id: string;
  controlId: string;
  name: string;
  domain: string;
  frequency: string;
  owner: { id: string; fullName: string; email: string };
  assignedTester: { id: string; fullName: string; email: string };
}

interface TestResult {
  id: string;
  testId: string;
  controlId: string;
  period: string;
  testName: string;
  population: number;
  sampleSize: number;
  exceptions: number;
  result: "pass" | "exception" | "fail";
  evidenceUrl: string | null;
  testProcedure: string | null;
  comments: string | null;
  testedAt: string;
  control: { controlId: string; name: string; domain: string };
  tester: { fullName: string; email: string };
}

const statusColors: Record<string, string> = {
  pass: "bg-green-100 text-green-800",
  fail: "bg-red-100 text-red-800",
  exception: "bg-orange-100 text-orange-800",
};

const emptyForm = {
  controlId: "", countryId: "", period: "",
  testName: "", population: 0, sampleSize: 0,
  exceptions: 0, result: "pass" as "pass" | "exception" | "fail",
  testProcedure: "", comments: "", evidenceUrl: "",
};

const Testing = () => {
  const { toast } = useToast();
  const { selectedCountry } = useCountryStore();

  const [tests, setTests] = useState<TestResult[]>([]);
  const [availableControls, setAvailableControls] = useState<AvailableControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!selectedCountry) return;
    setLoading(true);

    Promise.all([
      apiFetch<TestResult[]>(`/testing/results?country_id=${selectedCountry.id}&month=${currentMonth}`),
      apiFetch<AvailableControl[]>(`/testing/available?country_id=${selectedCountry.id}&month=${currentMonth}`),
    ]).then(([resultsRes, availableRes]) => {
      if (resultsRes.data) setTests(resultsRes.data);
      if (availableRes.data) setAvailableControls(availableRes.data);
    }).finally(() => setLoading(false));
  }, [selectedCountry]);

  const openAdd = () => {
    setForm({ ...emptyForm, countryId: selectedCountry?.id ?? "", period: currentMonth });
    setEvidenceFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.controlId || !form.testName) return;
    setSaving(true);

    let evidenceUrl = "";

    // Step 1: upload evidence file first if selected
    if (evidenceFile) {
      setUploading(true);
      const fd = new FormData();
      fd.append("test_evidence", evidenceFile);
      const token = getAccessToken();
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/uploads/test-evidence`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const uploadData = await uploadRes.json();
      setUploading(false);
      if (uploadData.error) {
        toast({ title: "Upload failed", description: uploadData.error, variant: "destructive" });
        setSaving(false);
        return;
      }
      evidenceUrl = uploadData.data.url;
    }

    // Step 2: log the test
    const res = await apiFetch<TestResult>("/testing/log", {
      method: "POST",
      body: JSON.stringify({ ...form, evidenceUrl: evidenceUrl || undefined }),
    });

    setSaving(false);

    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }

    if (res.data) {
      setTests((prev) => [res.data!, ...prev]);
      // Remove from available controls since it's now tested
      setAvailableControls((prev) => prev.filter((c) => c.id !== form.controlId));
      toast({ title: "Test logged", description: `Result: ${form.result.toUpperCase()}${form.result !== "pass" ? " — Issue auto-created" : ""}` });
    }

    setOpen(false);
  };

  const viewHistory = (controlId: string) => {
    setSelectedControlId(controlId);
    setHistoryOpen(true);
  };

  const historyTests = tests.filter((t) => t.control?.controlId === selectedControlId);

  const exportCSV = () => {
    const rows = tests.map((t) => ({
      "Test ID": t.testId, "Control ID": t.control?.controlId,
      "Name": t.control?.name, "Date": t.testedAt,
      "Sample": t.sampleSize, "Population": t.population,
      "Exceptions": t.exceptions, "Result": t.result,
    }));
    if (!rows.length) return;
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "testing.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testing</h1>
          <p className="text-muted-foreground text-sm">Record and track control test executions — {selectedCountry?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={openAdd} disabled={availableControls.length === 0}>
            <Plus className="w-4 h-4 mr-1" /> Record New Test
          </Button>
        </div>
      </div>

      {availableControls.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {availableControls.length} control{availableControls.length > 1 ? "s" : ""} still pending testing this month.
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Test ID</TableHead>
              <TableHead>Control ID</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Sample</TableHead>
              <TableHead>Population</TableHead>
              <TableHead>Exceptions</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : tests.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No tests recorded this month.</TableCell></TableRow>
            ) : tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-semibold">{t.testId}</TableCell>
                <TableCell>{t.control?.controlId}</TableCell>
                <TableCell>{t.testName}</TableCell>
                <TableCell>{new Date(t.testedAt).toLocaleDateString()}</TableCell>
                <TableCell>{t.sampleSize}</TableCell>
                <TableCell>{t.population}</TableCell>
                <TableCell>{t.exceptions}</TableCell>
                <TableCell>
                  <Badge className={statusColors[t.result] ?? ""}>
                    {t.result.charAt(0).toUpperCase() + t.result.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => viewHistory(t.control?.controlId)}>
                    <Eye className="w-3 h-3 mr-1" /> History
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Record Test Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record New Test</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 grid gap-1.5">
              <Label>Control</Label>
              <Select value={form.controlId} onValueChange={(v) => {
                const ctrl = availableControls.find((c) => c.id === v);
                setForm({ ...form, controlId: v, testName: ctrl ? `${ctrl.controlId} — ${ctrl.name} ${currentMonth}` : "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Select control to test" /></SelectTrigger>
                <SelectContent>
                  {availableControls.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.controlId} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label>Test Name</Label>
              <Input value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
            </div>
            <div className="grid gap-1.5"><Label>Population</Label><Input type="number" min={0} value={form.population} onChange={(e) => setForm({ ...form, population: Number(e.target.value) })} /></div>
            <div className="grid gap-1.5"><Label>Sample Size</Label><Input type="number" min={0} value={form.sampleSize} onChange={(e) => setForm({ ...form, sampleSize: Number(e.target.value) })} /></div>
            <div className="grid gap-1.5"><Label>Exceptions Found</Label><Input type="number" min={0} value={form.exceptions} onChange={(e) => setForm({ ...form, exceptions: Number(e.target.value) })} /></div>
            <div className="grid gap-1.5">
              <Label>Result</Label>
              <Select value={form.result} onValueChange={(v: "pass" | "exception" | "fail") => setForm({ ...form, result: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label>Test Procedure</Label>
              <Textarea value={form.testProcedure} onChange={(e) => setForm({ ...form, testProcedure: e.target.value })} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label>Comments</Label>
              <Textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label>Evidence File (optional)</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)} />
                {evidenceFile && <span className="text-xs text-muted-foreground">{evidenceFile.name}</span>}
              </div>
              <p className="text-xs text-muted-foreground">PDF, JPEG, PNG, WebP, XLSX, CSV — max 10MB</p>
            </div>
            {form.result !== "pass" && (
              <div className="col-span-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                ⚠ An issue will be automatically created for this {form.result} result.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {uploading ? "Uploading..." : saving ? "Saving..." : "Save Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Test History — {selectedControlId}</DialogTitle></DialogHeader>
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
                    <TableCell className="font-semibold">{t.testId}</TableCell>
                    <TableCell>{new Date(t.testedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{t.testName}</TableCell>
                    <TableCell>{t.sampleSize}/{t.population}</TableCell>
                    <TableCell>{t.exceptions}</TableCell>
                    <TableCell><Badge className={statusColors[t.result] ?? ""}>{t.result}</Badge></TableCell>
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