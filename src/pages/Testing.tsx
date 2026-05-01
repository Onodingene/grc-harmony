import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Plus, Eye } from "lucide-react";
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

const months = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);

  return {
    value: d.toISOString().slice(0, 7),
    label: d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    key: Math.random(),
  };
});

const emptyForm = {
  controlId: "",
  countryId: "",
  period: "",
  testName: "",
  population: 0,
  sampleSize: 0,
  exceptions: 0,
  result: "pass" as "pass" | "exception" | "fail",
  testProcedure: "",
  comments: "",
};

const Testing = () => {
  const { toast } = useToast();
  const { selectedCountry } = useCountryStore();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [availableControls, setAvailableControls] = useState<
    AvailableControl[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [countries, setCountries] = useState<
    { id: string; name: string; code: string }[]
  >([]);

  const buildTestName = (controlId: string, period: string) => {
    const ctrl = availableControls.find((c) => c.id === controlId);

    if (!ctrl) return "";

    return `${ctrl.controlId} — ${ctrl.name} ${period}`;
  };

  const loadPageData = async (month: string) => {
    setLoading(true);

    const countryId = selectedCountry ? selectedCountry.id : "all";

    const [resultsRes, availableRes] = await Promise.all([
      apiFetch<TestResult[]>(
        `/testing/results?country_id=${countryId}&month=${month}`
      ),
      apiFetch<AvailableControl[]>(
        `/testing/available?country_id=${countryId}&month=${month}`
      ),
    ]);

    if (resultsRes.data) setTests(resultsRes.data);
    if (availableRes.data) setAvailableControls(availableRes.data);

    setLoading(false);
  };

  useEffect(() => {
    apiFetch<{ id: string; name: string; code: string }[]>(
      "/settings/countries"
    ).then((res) => {
      if (res.data) {
        setCountries(res.data);
      }
    });
  }, []);

  useEffect(() => {
    loadPageData(selectedMonth);
  }, [selectedCountry, selectedMonth]);

  const openAdd = async () => {
    const countryId = selectedCountry?.id ?? "";

    setForm({
      ...emptyForm,
      countryId,
      period: currentMonth,
    });

    setEvidenceFile(null);

    const res = await apiFetch<AvailableControl[]>(
      `/testing/available?country_id=${
        selectedCountry ? selectedCountry.id : "all"
      }&month=${currentMonth}`
    );

    if (res.data) setAvailableControls(res.data);

    setOpen(true);
  };

  const refreshControlsForFormMonth = async (period: string) => {
    const res = await apiFetch<AvailableControl[]>(
      `/testing/available?country_id=${
        selectedCountry ? selectedCountry.id : "all"
      }&month=${period}`
    );

    if (res.data) setAvailableControls(res.data);
  };

  const handleSave = async () => {
    if (!form.controlId || !form.testName) return;

    setSaving(true);

    let evidenceUrl = "";

    if (evidenceFile) {
      setUploading(true);

      const fd = new FormData();
      fd.append("test_evidence", evidenceFile);

      const token = getAccessToken();

      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_URL}/uploads/test-evidence`,
        {
          method: "POST",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        }
      );

      const uploadData = await uploadRes.json();
      // console.log(uploadData);

      setUploading(false);

      if (uploadData.error) {
        toast({
          title: "Upload failed",
          description: uploadData.error,
          variant: "destructive",
        });

        setSaving(false);
        return;
      }

      evidenceUrl = uploadData.data.url;
    }

    const res = await apiFetch<TestResult>("/testing/log", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        evidenceUrl: evidenceUrl || undefined,
      }),
    });

    setSaving(false);

    if (res.error) {
      toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    if (res.data) {
      if (form.period === selectedMonth) {
        setTests((prev) => [res.data!, ...prev]);
      }

      setAvailableControls((prev) =>
        prev.filter((c) => c.id !== form.controlId)
      );

      toast({
        title: "Test logged",
        description: `Result: ${form.result.toUpperCase()}${
          form.result !== "pass" ? " — Issue auto-created" : ""
        }`,
      });
    }

    setOpen(false);
  };

  const viewHistory = (controlId: string) => {
    setSelectedControlId(controlId);
    setHistoryOpen(true);
  };

  const historyTests = tests.filter(
    (t) => t.control?.controlId === selectedControlId
  );

  const exportCSV = () => {
    if (!tests.length) return;

    const rows = tests.map((t) => ({
      "Test ID": t.testId,
      "Control ID": t.control?.controlId,
      Name: t.control?.name,
      Period: t.period,
      Date: t.testedAt,
      Sample: t.sampleSize,
      Population: t.population,
      Exceptions: t.exceptions,
      Result: t.result,
    }));

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");

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
          <p className="text-muted-foreground text-sm">
            Record and track control test executions — {selectedCountry?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
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

          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>

          <Button onClick={openAdd} disabled={availableControls.length === 0}>
            <Plus className="w-4 h-4 mr-1" /> Record New Test
          </Button>
        </div>
      </div>

      {availableControls.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {availableControls.length} control
          {availableControls.length > 1 ? "s" : ""} still pending testing for
          this selected period.
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Test ID</TableHead>
              <TableHead>Control ID</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No tests recorded.
                </TableCell>
              </TableRow>
            ) : (
              tests.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.testId}</TableCell>
                  <TableCell>{t.control?.controlId}</TableCell>
                  <TableCell>{t.testName}</TableCell>
                  <TableCell>{t.period}</TableCell>
                  <TableCell>
                    {new Date(t.testedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[t.result]}>{t.result}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewHistory(t.control?.controlId)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      History
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record New Test</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 grid gap-1.5">
              <Label>Country</Label>
              <Select
                onValueChange={(v) => {
                  setForm((prev) => ({
                    ...prev,
                    countryId: v,
                  }));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a Country" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>

                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label>Control</Label>
              <Select
                value={form.controlId}
                onValueChange={(v) => {
                  setForm((prev) => ({
                    ...prev,
                    controlId: v,
                    testName: buildTestName(v, prev.period),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select control to test" />
                </SelectTrigger>
                <SelectContent>
                  {availableControls.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.controlId} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Period</Label>
              <Select
                value={form.period}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    period: v,
                    testName: form.controlId
                      ? `${
                          availableControls.find((c) => c.id === form.controlId)
                            ?.controlId
                        } — ${
                          availableControls.find((c) => c.id === form.controlId)
                            ?.name
                        } ${v}`
                      : form.testName,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.key} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 grid gap-1.5">
              <Label>Test Name</Label>
              <Input
                value={form.testName}
                onChange={(e) => setForm({ ...form, testName: e.target.value })}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Population</Label>
              <Input
                type="number"
                min={0}
                value={form.population}
                onChange={(e) =>
                  setForm({ ...form, population: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Sample Size</Label>
              <Input
                type="number"
                min={0}
                value={form.sampleSize}
                onChange={(e) =>
                  setForm({ ...form, sampleSize: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Exceptions Found</Label>
              <Input
                type="number"
                min={0}
                value={form.exceptions}
                onChange={(e) =>
                  setForm({ ...form, exceptions: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Result</Label>
              <Select
                value={form.result}
                onValueChange={(v: "pass" | "exception" | "fail") =>
                  setForm({ ...form, result: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 grid gap-1.5">
              <Label>Test Procedure</Label>
              <Textarea
                value={form.testProcedure}
                onChange={(e) =>
                  setForm({ ...form, testProcedure: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 grid gap-1.5">
              <Label>Comments</Label>
              <Textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
              />
            </div>

            <div className="col-span-2 grid gap-1.5">
              <Label>Evidence File (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                />
                {evidenceFile && (
                  <span className="text-xs text-muted-foreground">
                    {evidenceFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, JPEG, PNG, WebP, XLSX, CSV — max 10MB
              </p>
            </div>

            {form.result !== "pass" && (
              <div className="col-span-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                ⚠ An issue will be automatically created for this {form.result}{" "}
                result.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {uploading ? "Uploading..." : saving ? "Saving..." : "Save Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testing;
