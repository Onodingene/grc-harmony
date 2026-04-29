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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Image as ImageIcon, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";

// ── Types ──────────────────────────────────────────────────────────────────

type IssueSeverity = "low" | "medium" | "high";
type IssueStatus = "open" | "in_progress" | "closed";
type RAG = "red" | "amber" | "green" | "grey";

interface Issue {
  id: string;
  issueId: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  dueDate: string | null;
  evidenceUrl: string | null;
  age: number;
  rag: RAG;
  control: { controlId: string; name: string; domain: string } | null;
  owner: { id: string; fullName: string; email: string } | null;
  actions: any[];
}

interface CompanyMember {
  id: string;
  fullName: string;
  email: string;
}

interface Control {
  id: string;
  controlId: string;
  name: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000";

const severityColors: Record<IssueSeverity, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const ragColors: Record<RAG, string> = {
  red: "bg-red-500",
  amber: "bg-yellow-400",
  green: "bg-green-500",
  grey: "bg-gray-300",
};

const statusLabel: Record<IssueStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

// ── Component ────────────────────────────────────────────────────────────────

const Issues = () => {
  const { toast } = useToast();
  const { selectedCountry } = useCountryStore();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "open">("all");

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  // Dropdown data
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [controls, setControls] = useState<Control[]>([]);

  // Add form
  const [form, setForm] = useState({
    controlId: "",
    description: "",
    severity: "medium" as IssueSeverity,
    ownerId: "",
    dueDate: "",
  });

  // Notes edit
  const [editNotes, setEditNotes] = useState("");

  // ── Load issues ──────────────────────────────────────────────────────────

  const loadIssues = () => {
    if (!selectedCountry?.id) return;
    setLoading(true);
    apiFetch<Issue[]>(
      `/issues?country_id=${
        selectedCountry ? selectedCountry.id : "all"
      }&status=${statusFilter}`
    )
      .then((res) => {
        if (res.data) setIssues(res.data);
        if (res.error)
          toast({
            title: "Error",
            description: res.error,
            variant: "destructive",
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIssues();
  }, [selectedCountry?.id, statusFilter]);

  // ── Load dropdowns ───────────────────────────────────────────────────────

  useEffect(() => {
    apiFetch<CompanyMember[]>("/company/members").then((res) => {
      if (res.data) setCompanyMembers(res.data);
    });
    apiFetch<Control[]>("/settings/controls").then((res) => {
      if (res.data) setControls(res.data);
    });
  }, []);

  // ── Status update ────────────────────────────────────────────────────────

  const updateStatus = async (id: string, newStatus: IssueStatus) => {
    const res = await apiFetch(`/issues/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    setEditingStatusId(null);
  };

  // ── Evidence upload ──────────────────────────────────────────────────────

  const handleEvidenceUpload = async (id: string, file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("issue_evidence", file);
    const uploadRes = await apiFetch<{ url: string }>(
      "/uploads/issue-evidence",
      {
        method: "POST",
        body: formData,
      }
    );
    if (uploadRes.error) {
      toast({
        title: "Upload failed",
        description: uploadRes.error,
        variant: "destructive",
      });
      return;
    }
    if (!uploadRes.data?.url) return;

    const updateRes = await apiFetch(`/issues/${id}`, {
      method: "PUT",
      body: JSON.stringify({ evidenceUrl: uploadRes.data.url }),
    });
    if (updateRes.error) {
      toast({
        title: "Error saving evidence",
        description: updateRes.error,
        variant: "destructive",
      });
      return;
    }
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, evidenceUrl: uploadRes.data!.url } : i
      )
    );
    toast({ title: "Evidence uploaded" });
  };

  // ── Notes update ─────────────────────────────────────────────────────────

  const handleSaveNotes = async () => {
    if (!selectedIssue) return;
    const res = await apiFetch(`/issues/${selectedIssue.id}`, {
      method: "PUT",
      body: JSON.stringify({ description: editNotes }),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    setIssues((prev) =>
      prev.map((i) =>
        i.id === selectedIssue.id ? { ...i, description: editNotes } : i
      )
    );
    toast({ title: "Notes updated" });
    setNotesOpen(false);
  };

  // ── Add manual issue ─────────────────────────────────────────────────────

  const saveNewIssue = async () => {
    if (!form.controlId || !form.description || !selectedCountry?.id) return;
    const body: Record<string, any> = {
      countryId: selectedCountry.id,
      controlId: form.controlId,
      description: form.description,
      severity: form.severity,
    };
    if (form.ownerId) body.ownerId = form.ownerId;
    if (form.dueDate) body.dueDate = form.dueDate;

    const res = await apiFetch<Issue>("/issues", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    if (res.data) setIssues((prev) => [res.data!, ...prev]);
    toast({ title: "Issue created" });
    setForm({
      controlId: "",
      description: "",
      severity: "medium",
      ownerId: "",
      dueDate: "",
    });
    setAddOpen(false);
  };

  // ── Delete issue ─────────────────────────────────────────────────────────
  // Note: the backend does not expose a DELETE /issues endpoint per the docs.
  // The delete button is kept for UI completeness but is disabled.

  // ── Export CSV ───────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    const rows = [
      [
        "Issue ID",
        "Control",
        "Description",
        "Severity",
        "Status",
        "Owner",
        "Due Date",
        "RAG",
      ],
      ...issues.map((i) => [
        i.issueId,
        i.control?.controlId ?? "",
        `"${i.description.replace(/"/g, '""')}"`,
        i.severity,
        i.status,
        i.owner?.fullName ?? "",
        i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "",
        i.rag,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "issues.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issues</h1>
          <p className="text-muted-foreground text-sm">
            Issues automatically created from failed or exception MCS tests
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | "open")}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="open">Open Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Log Manual Issue
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>RAG</TableHead>
              <TableHead>Issue ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Control</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && issues.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No issues found
                </TableCell>
              </TableRow>
            )}
            {issues.map((i) => (
              <TableRow key={i.id}>
                {/* RAG dot */}
                <TableCell>
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      ragColors[i.rag]
                    }`}
                    title={i.rag}
                  />
                </TableCell>

                <TableCell className="font-semibold">{i.issueId}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {i.description}
                </TableCell>
                <TableCell className="font-mono">
                  {i.control?.controlId ?? "—"}
                </TableCell>

                {/* Severity */}
                <TableCell>
                  <Badge
                    className={severityColors[i.severity]}
                    style={{ textTransform: "capitalize" }}
                  >
                    {i.severity}
                  </Badge>
                </TableCell>

                {/* Status — click to edit */}
                <TableCell>
                  {editingStatusId === i.id ? (
                    <Select
                      value={i.status}
                      onValueChange={(v) =>
                        updateStatus(i.id, v as IssueStatus)
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setEditingStatusId(i.id)}
                    >
                      {statusLabel[i.status]}
                    </Badge>
                  )}
                </TableCell>

                <TableCell>{i.owner?.fullName ?? "—"}</TableCell>
                <TableCell>
                  {i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"}
                </TableCell>

                {/* Evidence */}
                <TableCell>
                  {i.evidenceUrl ? (
                    <a
                      href={`${BASE_URL}${i.evidenceUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-300"
                      >
                        View
                      </Badge>
                    </a>
                  ) : (
                    <label className="cursor-pointer text-xs flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <ImageIcon className="w-4 h-4" /> Upload
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) =>
                          handleEvidenceUpload(
                            i.id,
                            e.target.files?.[0] || null
                          )
                        }
                      />
                    </label>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedIssue(i);
                      setEditNotes(i.description);
                      setNotesOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Add Manual Issue Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Manual Issue</DialogTitle>
            <DialogDescription>
              Usually issues are created automatically from failed tests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Control</label>
              <Select
                value={form.controlId}
                onValueChange={(v) => setForm({ ...form, controlId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select control" />
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
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Describe the issue..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={form.severity}
                onValueChange={(v) =>
                  setForm({ ...form, severity: v as IssueSeverity })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Owner</label>
              <Select
                value={form.ownerId}
                onValueChange={(v) => setForm({ ...form, ownerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {companyMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.fullName} — {m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveNewIssue}
              disabled={!form.controlId || !form.description}
            >
              Create Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Notes Dialog ── */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Description</DialogTitle>
            <DialogDescription>{selectedIssue?.issueId}</DialogDescription>
          </DialogHeader>
          <Input
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Update issue description..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog (kept for UX, backend has no delete endpoint) ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIssue?.issueId}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled>
              Delete Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Issues;
