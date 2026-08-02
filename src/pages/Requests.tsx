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
import { Plus, Send, Paperclip, MessageSquare, Trash2 } from "lucide-react";
import { apiFetch, getAccessToken } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";
import { useAuthStore } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { openEvidence } from "@/lib/evidence";

interface Person {
  id: string;
  fullName: string | null;
  email: string;
}

interface RequestMessage {
  id: string;
  message: string;
  evidenceUrls: string[];
  createdAt: string;
  author: Person;
}

interface DocumentRequest {
  id: string;
  requestId: string;
  period: string;
  subject: string;
  message: string;
  dueDate: string | null;
  status: "open" | "responded" | "closed";
  createdAt: string;
  control: { id: string; controlId: string; name: string; domain: string };
  requester: Person;
  recipient: Person;
  messages: RequestMessage[];
}

interface ControlOption {
  id: string;
  controlId: string;
  name: string;
}

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  responded: "bg-blue-100 text-blue-800",
  closed: "bg-green-100 text-green-800",
};

const nameOf = (p?: Person | null) =>
  p ? (p.fullName ?? p.email) : "—";

const currentPeriod = () => new Date().toISOString().slice(0, 7);

const emptyForm = {
  controlId: "",
  period: currentPeriod(),
  recipientId: "",
  subject: "",
  message: "",
  dueDate: "",
};

const Requests = () => {
  const { selectedCountry } = useCountryStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Control owners respond only: they see requests addressed to them and can
  // reply, but never raise or close one.
  const isResponder = user?.role === "control_owner";

  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [controls, setControls] = useState<ControlOption[]>([]);
  const [members, setMembers] = useState<(Person & { role: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<DocumentRequest | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const countryId = selectedCountry?.id ?? "all";

  const load = useCallback(async () => {
    setLoading(true);
    const [reqRes, controlsRes, membersRes] = await Promise.all([
      apiFetch<DocumentRequest[]>(
        `/requests?country_id=${countryId}&status=${statusFilter}`,
      ),
      isResponder
        ? Promise.resolve({ data: null, error: null })
        : apiFetch<ControlOption[]>(`/settings/controls?country_id=${countryId}`),
      isResponder
        ? Promise.resolve({ data: null, error: null })
        : apiFetch<(Person & { role: string })[]>(`/audit/recipients`),
    ]);
    if (reqRes.data) setRequests(reqRes.data);
    if (controlsRes.data) setControls(controlsRes.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (reqRes.error) {
      toast({
        title: "Could not load requests",
        description: reqRes.error,
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [countryId, statusFilter, isResponder, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep an open thread in step after a reload.
  useEffect(() => {
    if (!detail) return;
    const fresh = requests.find((r) => r.id === detail.id);
    if (fresh) setDetail(fresh);
  }, [requests]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isOverdue = (r: DocumentRequest) =>
    !!r.dueDate && r.status !== "closed" && new Date(r.dueDate) < new Date();

  const overdueCount = useMemo(
    () => requests.filter(isOverdue).length,
    [requests],
  );

  const send = async () => {
    if (!form.controlId || !form.recipientId) {
      toast({
        title: "Pick a control and a recipient",
        variant: "destructive",
      });
      return;
    }
    if (!form.subject.trim() || !form.message.trim()) {
      toast({ title: "Add a subject and a message", variant: "destructive" });
      return;
    }

    setSaving(true);
    const res = await apiFetch<{ emailSent?: boolean; emailError?: string }>(
      "/requests",
      {
        method: "POST",
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
        }),
      },
    );
    setSaving(false);

    if (res.error) {
      toast({
        title: "Could not send request",
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    const to = members.find((m) => m.id === form.recipientId);
    toast({
      title: res.data?.emailSent
        ? `Request emailed to ${to?.email ?? "recipient"}`
        : "Request saved, but the email failed",
      description: res.data?.emailSent ? undefined : res.data?.emailError,
      variant: res.data?.emailSent ? undefined : "destructive",
    });
    setFormOpen(false);
    setForm({ ...emptyForm, period: currentPeriod() });
    load();
  };

  const sendReply = async () => {
    if (!detail) return;
    if (!reply.trim() && files.length === 0) {
      toast({ title: "Write a reply or attach a file", variant: "destructive" });
      return;
    }

    setReplying(true);
    let evidenceUrls: string[] = [];

    if (files.length > 0) {
      const fd = new FormData();
      files.forEach((f) => fd.append("test_evidence", f));
      const token = getAccessToken();
      try {
        const up = await fetch(
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
        const data = await up.json();
        if (data.error) {
          toast({
            title: "Upload failed",
            description: data.error,
            variant: "destructive",
          });
          setReplying(false);
          return;
        }
        evidenceUrls = (data.data ?? []).map((f: { url: string }) => f.url);
      } catch {
        toast({ title: "Upload failed", variant: "destructive" });
        setReplying(false);
        return;
      }
    }

    const res = await apiFetch(`/requests/${detail.id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: reply.trim() || `Attached ${evidenceUrls.length} file(s).`,
        evidenceUrls,
      }),
    });
    setReplying(false);

    if (res.error) {
      toast({
        title: "Could not send",
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Sent" });
    setReply("");
    setFiles([]);
    load();
  };

  const setStatus = async (r: DocumentRequest, status: string) => {
    const res = await apiFetch(`/requests/${r.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.error) {
      toast({
        title: "Could not update",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    load();
  };

  const remove = async (r: DocumentRequest) => {
    if (!window.confirm(`Delete ${r.requestId}? This removes the whole thread.`))
      return;
    const res = await apiFetch(`/requests/${r.id}`, { method: "DELETE" });
    if (res.error) {
      toast({
        title: "Could not delete",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    if (detail?.id === r.id) setDetail(null);
    toast({ title: `${r.requestId} deleted` });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Requests</h1>
          <p className="text-muted-foreground text-sm">
            {isResponder
              ? "Documents and information requested from you."
              : "Ask control owners for documents or information, and track what is outstanding."}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {!isResponder && (
            <Button
              onClick={() => {
                setForm({ ...emptyForm, period: currentPeriod() });
                setFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> New Request
            </Button>
          )}
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {overdueCount} request{overdueCount > 1 ? "s are" : " is"} past the
          date it was needed by.
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table className="min-w-[1100px] text-left [&_th]:whitespace-nowrap [&_td]:align-top [&_td]:break-words">
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Ref</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Control</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>{isResponder ? "From" : "To"}</TableHead>
              <TableHead>Needed by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Replies</TableHead>
              {!isResponder && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={isResponder ? 8 : 9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading requests…
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isResponder ? 8 : 9}
                  className="text-center py-8 text-muted-foreground"
                >
                  {isResponder
                    ? "Nothing has been requested from you."
                    : "No requests yet. Raise one to ask a control owner for a document."}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">
                    <button
                      className="underline underline-offset-2 hover:text-primary"
                      onClick={() => {
                        setDetail(r);
                        setReply("");
                        setFiles([]);
                      }}
                    >
                      {r.requestId}
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-normal min-w-[200px] max-w-[320px]">
                    {r.subject}
                  </TableCell>
                  <TableCell>{r.control.controlId}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell className="whitespace-normal min-w-[140px] max-w-[220px]">
                    {nameOf(isResponder ? r.requester : r.recipient)}
                  </TableCell>
                  <TableCell>
                    {r.dueDate ? (
                      <span className={isOverdue(r) ? "text-destructive font-medium" : ""}>
                        {new Date(r.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[r.status]}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.messages.length}</TableCell>
                  {!isResponder && (
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status !== "closed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => setStatus(r, "closed")}
                          >
                            Close
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => setStatus(r, "open")}
                          >
                            Reopen
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Delete request"
                          onClick={() => remove(r)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New request */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Control</Label>
              <Select
                value={form.controlId}
                onValueChange={(v) => set("controlId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Which control is this about?" />
                </SelectTrigger>
                <SelectContent>
                  {controls.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.controlId} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Send to</Label>
              <Select
                value={form.recipientId}
                onValueChange={(v) => set("recipientId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Who should provide this?" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {nameOf(m)} ({m.role.replace("_", " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Subject</Label>
              <Input
                placeholder="e.g. Monthly inventory report"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>What do you need?</Label>
              <Textarea
                rows={3}
                placeholder="Describe exactly what you are asking for…"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Period</Label>
                <Input
                  type="month"
                  value={form.period}
                  onChange={(e) => set("period", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Needed by</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              They will get an email with this request and a link to respond.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={send} disabled={saving}>
              <Send className="w-4 h-4 mr-1" />
              {saving ? "Sending…" : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thread */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detail?.requestId} · {detail?.subject}
            </DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {detail.control.controlId} · {detail.control.name} ·{" "}
                {detail.period}
                {detail.dueDate && (
                  <>
                    {" · needed by "}
                    <span className={isOverdue(detail) ? "text-destructive font-medium" : ""}>
                      {new Date(detail.dueDate).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              <div className="rounded border p-2 space-y-1 bg-primary/5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {nameOf(detail.requester)}
                  </span>
                  <Badge className="bg-primary/15 text-primary">Request</Badge>
                  <span className="ml-auto">
                    {new Date(detail.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {detail.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Replies
                </Label>
                {detail.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No replies yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {detail.messages.map((m) => (
                      <div key={m.id} className="rounded border p-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {nameOf(m.author)}
                          </span>
                          <span className="ml-auto">
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {m.message}
                        </p>
                        {m.evidenceUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {m.evidenceUrls.map((u, i) => (
                              <button
                                key={`${u}-${i}`}
                                className="text-xs text-primary hover:underline"
                                onClick={() => openEvidence(u)}
                              >
                                {u.split("/").pop()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded border p-2 space-y-2">
                <Textarea
                  rows={2}
                  placeholder={
                    isResponder
                      ? "Reply and attach the documents requested…"
                      : "Add a message or chase this up…"
                  }
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {files.length} file(s) ready to send
                  </p>
                )}
                <div className="flex gap-2 items-center flex-wrap">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    />
                    <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <Paperclip className="w-4 h-4" /> Attach files
                    </span>
                  </label>
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={sendReply}
                    disabled={replying}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {replying ? "Sending…" : "Send"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The other person is emailed when you send this.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;
