import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  Paperclip,
  FileText,
  Send,
  MessageSquare,
} from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";
import { apiFetch, getAccessToken } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";
import { useAuthStore } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { openEvidence } from "@/lib/evidence";

interface FailedControl {
  id: string;
  controlId: string;
  name: string;
  description: string;
  domain: string;
  frequency: string;
  countryId: string;
  failedTestCount: number;
}

interface Member {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
}

interface AuditCommentRecord {
  id: string;
  message: string;
  period: string | null;
  isRequest: boolean;
  evidenceUrls: string[];
  createdAt: string;
  author?: { id: string; fullName: string | null; email: string } | null;
}

interface AuditIssueRecord {
  id: string;
  auditIssueId: string;
  description: string;
  severity: string;
  status: string;
  evidenceUrls: string[];
  createdAt: string;
  createdBy?: { fullName: string | null; email: string } | null;
}

interface AuditPeriodRecord {
  id: string;
  period: string;
  dueDate: string | null;
  evidenceUrls: string[];
  issues: AuditIssueRecord[];
}

interface DuePeriod {
  period: string;
  month: string;
  monthNum: number;
  year: number;
  dueDate: string;
}

interface AuditRecord {
  id: string;
  auditId: string;
  areaProcess: string | null;
  auditName: string;
  objectives: string | null;
  scope: string | null;
  keyRisks: string | null;
  lead: string | null;
  procedures: string | null;
  startMonth: string;
  dueDay: number;
  frequency: string;
  recipient: { id: string; fullName: string | null; email: string } | null;
  comments: AuditCommentRecord[];
  control: {
    id: string;
    controlId: string;
    name: string;
    description: string;
    domain: string;
    frequency: string;
  };
  duePeriods: DuePeriod[];
  periods: AuditPeriodRecord[];
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annually: "Semi-annually",
  annual: "Annual",
  as_needed: "As needed",
};

const severityColors: Record<string, string> = {
  low: "bg-secondary text-muted-foreground",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-blue-100 text-blue-800",
  closed: "bg-green-100 text-green-800",
};

const emptyForm = {
  controlId: "",
  areaProcess: "",
  auditName: "",
  objectives: "",
  scope: "",
  keyRisks: "",
  lead: "",
  procedures: "",
  startMonth: "",
  dueDay: "15",
  recipientId: "",
};

const NO_RECIPIENT = "__none__";

const Audit = () => {
  const { selectedCountry } = useCountryStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Control owners are responders: they see only audits addressed to them and
  // can reply / upload, but never create or edit.
  const isResponder = user?.role === "control_owner";

  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [failedControls, setFailedControls] = useState<FailedControl[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AuditRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<AuditRecord | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueSeverity, setIssueSeverity] = useState("medium");
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const countryId = selectedCountry?.id ?? "all";

  const load = useCallback(async () => {
    setLoading(true);
    // Responders can only read their own audits — the picker endpoints are
    // auditor-only, so don't call them.
    const [auditRes, controlsRes, membersRes] = await Promise.all([
      apiFetch<AuditRecord[]>(`/audit?country_id=${countryId}`),
      isResponder
        ? Promise.resolve({ data: null, error: null })
        : apiFetch<FailedControl[]>(
            `/audit/failed-controls?country_id=${countryId}`,
          ),
      isResponder
        ? Promise.resolve({ data: null, error: null })
        : apiFetch<Member[]>(`/audit/recipients`),
    ]);
    if (auditRes.data) setAudits(auditRes.data);
    if (controlsRes.data) setFailedControls(controlsRes.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (auditRes.error) {
      toast({
        title: "Could not load audits",
        description: auditRes.error,
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [countryId, toast, isResponder]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the open detail dialog in sync after a reload.
  useEffect(() => {
    if (!detail) return;
    const fresh = audits.find((a) => a.id === detail.id);
    if (fresh) setDetail(fresh);
  }, [audits]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Frequency is never chosen by hand — it always mirrors the audited control.
  const selectedControl = useMemo(() => {
    if (editing) return editing.control;
    return failedControls.find((c) => c.id === form.controlId) ?? null;
  }, [editing, failedControls, form.controlId]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (a: AuditRecord) => {
    setEditing(a);
    setForm({
      controlId: a.control.id,
      areaProcess: a.areaProcess ?? "",
      auditName: a.auditName,
      objectives: a.objectives ?? "",
      scope: a.scope ?? "",
      keyRisks: a.keyRisks ?? "",
      lead: a.lead ?? "",
      procedures: a.procedures ?? "",
      startMonth: a.startMonth,
      dueDay: String(a.dueDay),
      recipientId: a.recipient?.id ?? "",
    });
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.auditName.trim()) {
      toast({ title: "Audit Name is required", variant: "destructive" });
      return;
    }
    if (!editing && !form.controlId) {
      toast({ title: "Select a control to audit", variant: "destructive" });
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(form.startMonth)) {
      toast({ title: "Pick a start month", variant: "destructive" });
      return;
    }

    setSaving(true);
    const body = {
      areaProcess: form.areaProcess,
      auditName: form.auditName,
      objectives: form.objectives,
      scope: form.scope,
      keyRisks: form.keyRisks,
      lead: form.lead,
      procedures: form.procedures,
      startMonth: form.startMonth,
      dueDay: Number(form.dueDay),
      recipientId: form.recipientId || null,
      ...(editing ? {} : { controlId: form.controlId }),
    };

    const res = editing
      ? await apiFetch<AuditRecord>(`/audit/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        })
      : await apiFetch<AuditRecord>(`/audit`, {
          method: "POST",
          body: JSON.stringify(body),
        });
    setSaving(false);

    if (res.error) {
      toast({
        title: editing ? "Could not update audit" : "Could not create audit",
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    toast({ title: editing ? "Audit updated" : "Audit created" });
    setFormOpen(false);
    load();
  };

  const remove = async (a: AuditRecord) => {
    if (
      !window.confirm(
        `Delete ${a.auditId}? This also removes its evidence and audit issues.`,
      )
    )
      return;
    const res = await apiFetch(`/audit/${a.id}`, { method: "DELETE" });
    if (res.error) {
      toast({
        title: "Could not delete audit",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: `${a.auditId} deleted` });
    if (detail?.id === a.id) setDetail(null);
    load();
  };

  const openDetail = (a: AuditRecord) => {
    setDetail(a);
    setDetailPeriod(a.duePeriods[0]?.period ?? "");
    setIssueText("");
    setIssueSeverity("medium");
    setCommentText("");
  };

  // Posting as a request is what emails the recipient; a plain comment doesn't.
  const postComment = async (asRequest: boolean) => {
    if (!detail) return;
    if (!commentText.trim()) {
      toast({ title: "Write a message first", variant: "destructive" });
      return;
    }
    if (asRequest && !detail.recipient) {
      toast({
        title: "No recipient set",
        description: "Edit the audit and choose who should respond.",
        variant: "destructive",
      });
      return;
    }

    setSendingComment(true);
    const res = await apiFetch<{ emailSent?: boolean; emailError?: string }>(
      `/audit/${detail.id}/comments`,
      {
        method: "POST",
        body: JSON.stringify({
          message: commentText,
          period: detailPeriod || undefined,
          isRequest: asRequest,
        }),
      },
    );
    setSendingComment(false);

    if (res.error) {
      toast({
        title: "Could not post",
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    if (asRequest) {
      toast({
        title: res.data?.emailSent
          ? `Request emailed to ${detail.recipient?.email}`
          : "Request posted, but the email failed",
        description: res.data?.emailSent ? undefined : res.data?.emailError,
        variant: res.data?.emailSent ? undefined : "destructive",
      });
    } else {
      toast({ title: "Comment added" });
    }
    setCommentText("");
    load();
  };

  const currentPeriodRow = useMemo(() => {
    if (!detail) return null;
    return detail.periods.find((p) => p.period === detailPeriod) ?? null;
  }, [detail, detailPeriod]);

  const uploadEvidence = async (files: FileList | null) => {
    if (!detail || !detailPeriod || !files || files.length === 0) return;

    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((file) => fd.append("test_evidence", file));
    const token = getAccessToken();

    try {
      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_URL}/uploads/test-evidence-multiple`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "ngrok-skip-browser-warning": "true",
          },
          body: fd,
        },
      );
      const uploadData = await uploadRes.json();
      if (uploadData.error) {
        toast({
          title: "Upload failed",
          description: uploadData.error,
          variant: "destructive",
        });
        return;
      }

      const urls = (uploadData.data ?? []).map((f: { url: string }) => f.url);
      const res = await apiFetch(
        `/audit/${detail.id}/periods/${detailPeriod}/evidence`,
        { method: "POST", body: JSON.stringify({ evidenceUrls: urls }) },
      );
      if (res.error) {
        toast({
          title: "Could not attach evidence",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
      toast({ title: `${urls.length} file(s) attached` });
      load();
    } finally {
      setUploading(false);
    }
  };

  const raiseIssue = async () => {
    if (!detail || !detailPeriod) return;
    if (!issueText.trim()) {
      toast({ title: "Describe the issue first", variant: "destructive" });
      return;
    }
    const res = await apiFetch(
      `/audit/${detail.id}/periods/${detailPeriod}/issues`,
      {
        method: "POST",
        body: JSON.stringify({
          description: issueText,
          severity: issueSeverity,
        }),
      },
    );
    if (res.error) {
      toast({
        title: "Could not raise issue",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Audit issue raised" });
    setIssueText("");
    load();
  };

  const setIssueStatus = async (issue: AuditIssueRecord, status: string) => {
    const res = await apiFetch(`/audit/issues/${issue.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.error) {
      toast({
        title: "Could not update issue",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    load();
  };

  const csvRows = audits.map((a) => ({
    auditId: a.auditId,
    areaProcess: a.areaProcess ?? "",
    auditName: a.auditName,
    control: a.control.controlId,
    frequency: FREQUENCY_LABELS[a.frequency] ?? a.frequency,
    lead: a.lead ?? "",
    recipient: a.recipient?.email ?? "",
    startMonth: a.startMonth,
    dueDay: a.dueDay,
    openIssues: a.periods.reduce(
      (n, p) => n + p.issues.filter((i) => i.status !== "closed").length,
      0,
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit</h1>
          <p className="text-muted-foreground text-sm">
            {isResponder
              ? "Audit requests sent to you. Reply and upload the documents requested."
              : "Audits raised against controls. Each audit follows its control's testing schedule."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(csvRows, "audits")}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          {!isResponder && (
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-1" /> New Audit
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table className="min-w-[1200px] text-left [&_th]:whitespace-nowrap [&_td]:align-top [&_td]:break-words">
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Audit ID</TableHead>
              <TableHead>Area / Process</TableHead>
              <TableHead>Audit Name</TableHead>
              <TableHead>Control</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Open Issues</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Loading audits…
                </TableCell>
              </TableRow>
            ) : audits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {isResponder
                    ? "No audit requests have been sent to you."
                    : "No audits yet. Raise one against any control."}
                </TableCell>
              </TableRow>
            ) : (
              audits.map((a) => {
                const openIssues = a.periods.reduce(
                  (n, p) => n + p.issues.filter((i) => i.status !== "closed").length,
                  0,
                );
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-semibold">
                      <button
                        className="underline underline-offset-2 hover:text-primary"
                        onClick={() => openDetail(a)}
                      >
                        {a.auditId}
                      </button>
                    </TableCell>
                    <TableCell className="whitespace-normal min-w-[160px] max-w-[240px]">
                      {a.areaProcess || "—"}
                    </TableCell>
                    <TableCell className="whitespace-normal min-w-[220px] max-w-[360px]">
                      {a.auditName}
                    </TableCell>
                    <TableCell>{a.control.controlId}</TableCell>
                    <TableCell>
                      {FREQUENCY_LABELS[a.frequency] ?? a.frequency}
                    </TableCell>
                    <TableCell>{a.lead || "—"}</TableCell>
                    <TableCell className="whitespace-normal min-w-[140px] max-w-[220px]">
                      {a.recipient
                        ? (a.recipient.fullName ?? a.recipient.email)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {a.startMonth} · day {a.dueDay}
                    </TableCell>
                    <TableCell>
                      {openIssues > 0 ? (
                        <Badge className="bg-red-100 text-red-800">{openIssues}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button aria-label="View audit detail" size="sm" variant="ghost" onClick={() => openDetail(a)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        {!isResponder && (
                          <>
                            <Button aria-label="Edit audit" size="sm" variant="ghost" onClick={() => openEdit(a)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button aria-label="Delete audit" size="sm" variant="ghost" onClick={() => remove(a)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Audit" : "New Audit"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Audit ID *</Label>
              <Input
                value={editing ? editing.auditId : "Auto-generated"}
                disabled
                readOnly
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Area / Process</Label>
              <Input
                value={form.areaProcess}
                onChange={(e) => set("areaProcess", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Audit Name *</Label>
              <Input
                value={form.auditName}
                onChange={(e) => set("auditName", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Objectives</Label>
              <Textarea
                rows={2}
                value={form.objectives}
                onChange={(e) => set("objectives", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Scope</Label>
              <Textarea
                rows={2}
                value={form.scope}
                onChange={(e) => set("scope", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Key Risks</Label>
              <Input
                value={form.keyRisks}
                onChange={(e) => set("keyRisks", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Key Controls (IDs)</Label>
              {editing ? (
                <Input
                  value={`${editing.control.controlId} — ${editing.control.name}`}
                  disabled
                  readOnly
                />
              ) : (
                <Select
                  value={form.controlId}
                  onValueChange={(v) => set("controlId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a control with failed tests" />
                  </SelectTrigger>
                  <SelectContent>
                    {failedControls.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground">
                        No controls with failed tests available
                      </div>
                    ) : (
                      failedControls.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.controlId} — {c.name} ({c.failedTestCount} failed)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {editing && (
                <p className="text-xs text-muted-foreground">
                  The audited control can't be changed — create a new audit instead.
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label>Lead</Label>
              <Input
                value={form.lead}
                onChange={(e) => set("lead", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Recipient</Label>
              <Select
                value={form.recipientId || NO_RECIPIENT}
                onValueChange={(v) =>
                  set("recipientId", v === NO_RECIPIENT ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Who should respond to this audit?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_RECIPIENT}>No recipient</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.fullName ?? m.email} ({m.role.replace("_", " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                They'll see this audit in their own Audit tab. They're emailed
                only when you send a request.
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label>Procedures / Test Steps</Label>
              <Textarea
                rows={3}
                value={form.procedures}
                onChange={(e) => set("procedures", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Frequency</Label>
              <Input
                value={
                  selectedControl
                    ? (FREQUENCY_LABELS[selectedControl.frequency] ??
                      selectedControl.frequency)
                    : "Set by the selected control"
                }
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Follows the control's frequency on the calendar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Start Month</Label>
                <Input
                  type="month"
                  value={form.startMonth}
                  onChange={(e) => set("startMonth", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Day of Month</Label>
                <Select value={form.dueDay} onValueChange={(v) => set("dueDay", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Audit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Per-period detail: evidence + issues */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detail?.auditId} · {detail?.auditName}
            </DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-5">
              <div className="text-sm text-muted-foreground">
                Control {detail.control.controlId} · {detail.control.name} ·{" "}
                {FREQUENCY_LABELS[detail.frequency] ?? detail.frequency}
                {detail.recipient && (
                  <>
                    {" · "}
                    <span>
                      Recipient:{" "}
                      {detail.recipient.fullName ?? detail.recipient.email}
                    </span>
                  </>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label>Period</Label>
                <Select value={detailPeriod} onValueChange={setDetailPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent>
                    {detail.duePeriods.map((p) => (
                      <SelectItem key={p.period} value={p.period}>
                        {p.month} {p.year} (due {p.dueDate.slice(0, 10)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Each period keeps its own evidence and issues.
                </p>
              </div>

              {/* Evidence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Evidence</Label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      disabled={uploading || !detailPeriod}
                      onChange={(e) => uploadEvidence(e.target.files)}
                    />
                    <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <Paperclip className="w-4 h-4" />
                      {uploading ? "Uploading…" : "Attach files"}
                    </span>
                  </label>
                </div>
                {currentPeriodRow && currentPeriodRow.evidenceUrls.length > 0 ? (
                  <ul className="space-y-1">
                    {currentPeriodRow.evidenceUrls.map((url, i) => (
                      <li key={`${url}-${i}`}>
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => openEvidence(url)}
                        >
                          {url.split("/").pop()}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No evidence for this period yet.
                  </p>
                )}
              </div>

              {/* Conversation — requests and replies */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Conversation
                </Label>

                {detail.comments.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {detail.comments.map((c) => (
                      <div
                        key={c.id}
                        className={`rounded border p-2 space-y-1 ${
                          c.isRequest ? "border-primary/40 bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {c.author?.fullName ?? c.author?.email ?? "Unknown"}
                          </span>
                          {c.isRequest && (
                            <Badge className="bg-primary/15 text-primary">
                              Request
                            </Badge>
                          )}
                          {c.period && <span>· {c.period}</span>}
                          <span className="ml-auto">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {c.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No messages yet.
                  </p>
                )}

                <div className="rounded border p-2 space-y-2">
                  <Textarea
                    rows={2}
                    placeholder={
                      isResponder
                        ? "Reply to this request…"
                        : "Write a message, or request documents from the recipient…"
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => postComment(false)}
                      disabled={sendingComment}
                    >
                      {isResponder ? "Reply" : "Add Comment"}
                    </Button>
                    {!isResponder && (
                      <Button
                        size="sm"
                        onClick={() => postComment(true)}
                        disabled={sendingComment || !detail.recipient}
                        title={
                          detail.recipient
                            ? `Emails ${detail.recipient.email}`
                            : "Set a recipient first"
                        }
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {sendingComment ? "Sending…" : "Send Request"}
                      </Button>
                    )}
                  </div>
                  {!isResponder && (
                    <p className="text-xs text-muted-foreground">
                      "Send Request" emails the recipient. "Add Comment" doesn't.
                    </p>
                  )}
                </div>
              </div>

              {/* Issues */}
              <div className="space-y-2">
                <Label>Audit Issues</Label>
                {currentPeriodRow && currentPeriodRow.issues.length > 0 ? (
                  <div className="space-y-2">
                    {currentPeriodRow.issues.map((i) => (
                      <div key={i.id} className="rounded border p-2 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{i.auditIssueId}</span>
                          <Badge className={severityColors[i.severity]}>
                            {i.severity}
                          </Badge>
                          <Badge className={statusColors[i.status]}>
                            {i.status.replace("_", " ")}
                          </Badge>
                          {!isResponder && (
                            <Select
                              value={i.status}
                              onValueChange={(v) => setIssueStatus(i, v)}
                            >
                              <SelectTrigger className="h-7 w-[130px] ml-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In progress</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <p className="text-sm">{i.description}</p>
                        {i.evidenceUrls.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {i.evidenceUrls.map((url, n) => (
                              <button
                                key={`${url}-${n}`}
                                className="text-xs text-primary hover:underline"
                                onClick={() => openEvidence(url)}
                              >
                                {url.split("/").pop()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No issues raised for this period.
                  </p>
                )}

                {!isResponder && (
                  <div className="rounded border p-2 space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Describe the audit issue…"
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Select value={issueSeverity} onValueChange={setIssueSeverity}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={raiseIssue} disabled={!detailPeriod}>
                        Raise Issue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Audit;
