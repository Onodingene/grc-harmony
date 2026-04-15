import { useState } from "react";
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
import { Plus, Download, Trash2, Image as ImageIcon, Edit } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

// MCS Controls (from your Settings page)
interface MCSControl {
  id: string;
  controlId: string;
  name: string;
  status: "active" | "inactive";
}

const initialControls: MCSControl[] = [
  {
    id: "1",
    controlId: "MCS-001",
    name: "Segregation of Duties",
    status: "active",
  },
  {
    id: "2",
    controlId: "MCS-002",
    name: "Authorization Limits",
    status: "active",
  },
  {
    id: "3",
    controlId: "MCS-003",
    name: "Access Control Review",
    status: "active",
  },
];

interface Issue {
  id: string;
  title: string;
  control: string;
  rating: string;
  status: "Open" | "In Progress" | "Closed";
  owner: string;
  evidence?: string; // base64 image
  notes?: string; // remediation comments
}

const ratingColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const initialIssues: Issue[] = [
  {
    id: "ISS-001",
    title: "Missing SOD review for finance",
    control: "MCS-001",
    rating: "High",
    status: "Open",
    owner: "compliance@company.com",
    notes: "",
  },
  {
    id: "ISS-002",
    title: "Expired insurance policy",
    control: "MCS-002",
    rating: "Critical",
    status: "In Progress",
    owner: "finance@company.com",
    notes: "Waiting for renewal document",
  },
];

const Issues = () => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState("");

  // For adding new issue (manual fallback)
  const [form, setForm] = useState({
    title: "",
    control: "",
    rating: "",
    owner: "",
    notes: "",
  });

  const openAdd = () => {
    setForm({ title: "", control: "", rating: "", owner: "", notes: "" });
    setAddOpen(true);
  };

  const saveNewIssue = () => {
    if (!form.title || !form.control) return;
    const nextId = `ISS-${String(issues.length + 1).padStart(3, "0")}`;
    setIssues((prev) => [
      ...prev,
      {
        id: nextId,
        title: form.title,
        control: form.control,
        rating: form.rating || "Medium",
        status: "Open",
        owner: form.owner,
        notes: form.notes,
      },
    ]);
    setAddOpen(false);
  };

  const updateStatus = (
    id: string,
    newStatus: "Open" | "In Progress" | "Closed"
  ) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, status: newStatus } : issue
      )
    );
    setEditingStatusId(null);
  };

  const updateNotes = (id: string) => {
    if (!newNotes.trim()) return;
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, notes: newNotes } : issue
      )
    );
    setNewNotes("");
  };

  const handleEvidenceUpload = (id: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? { ...issue, evidence: e.target?.result as string }
            : issue
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const openDelete = (issue: Issue) => {
    setSelectedIssue(issue);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedIssue) return;
    setIssues((prev) => prev.filter((i) => i.id !== selectedIssue.id));
    setDeleteOpen(false);
    setSelectedIssue(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issues</h1>
          <p className="text-muted-foreground text-sm">
            Issues automatically created from failed MCS tests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(issues, "issues")}
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Log Manual Issue
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Issue ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Control</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-semibold">{i.id}</TableCell>
                <TableCell>{i.title}</TableCell>
                <TableCell className="font-mono">{i.control}</TableCell>
                <TableCell>
                  <Badge className={ratingColors[i.rating]}>{i.rating}</Badge>
                </TableCell>
                <TableCell>
                  {editingStatusId === i.id ? (
                    <Select
                      value={i.status}
                      onValueChange={(v) =>
                        updateStatus(
                          i.id,
                          v as "Open" | "In Progress" | "Closed"
                        )
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setEditingStatusId(i.id)}
                    >
                      {i.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{i.owner}</TableCell>

                {/* Evidence */}
                <TableCell>
                  {i.evidence ? (
                    <a
                      href={i.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={i.evidence}
                        alt="Evidence"
                        className="w-10 h-10 object-cover rounded border"
                      />
                    </a>
                  ) : (
                    <label className="cursor-pointer text-xs flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <ImageIcon className="w-4 h-4" /> Upload
                      <input
                        type="file"
                        accept="image/*"
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

                {/* Notes */}
                <TableCell className="max-w-xs">
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {i.notes || "—"}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIssue(i);
                        setNewNotes(i.notes || "");
                        const note = prompt(
                          "Add/Update remediation notes:",
                          i.notes || ""
                        );
                        if (note !== null) {
                          setIssues((prev) =>
                            prev.map((issue) =>
                              issue.id === i.id
                                ? { ...issue, notes: note }
                                : issue
                            )
                          );
                        }
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDelete(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Manual Issue</DialogTitle>
            <DialogDescription>
              Usually issues are created automatically from failed tests.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIssue?.id}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Issues;
