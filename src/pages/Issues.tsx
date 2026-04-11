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
import { Plus, Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

interface Issue {
  id: string;
  title: string;
  control: string;
  rating: string;
  status: string;
  owner: string;
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
    control: "MCS12",
    rating: "High",
    status: "Open",
    owner: "Theophilus Okolie",
  },
  {
    id: "ISS-002",
    title: "Expired insurance policy",
    control: "MCS08",
    rating: "Critical",
    status: "In Progress",
    owner: "Victory Olumuyiwa",
  },
  {
    id: "ISS-003",
    title: "Late CoBC distribution",
    control: "MCS01",
    rating: "Medium",
    status: "Open",
    owner: "Omoyemi Tuga",
  },
];

const emptyIssue: Omit<Issue, "id"> = {
  title: "",
  control: "",
  rating: "",
  status: "",
  owner: "",
};

const Issues = () => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyIssue);

  const openAdd = () => {
    setForm(emptyIssue);
    setOpen(true);
  };

  const save = () => {
    if (!form.title) return;
    const nextId = `ISS-${String(issues.length + 1).padStart(3, "0")}`;
    setIssues((prev) => [...prev, { id: nextId, ...form }]);
    setOpen(false);
  };

  const set = (key: keyof Omit<Issue, "id">, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issues</h1>
          <p className="text-muted-foreground text-sm">
            Track and remediate control deficiencies.
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
            <Plus className="w-4 h-4 mr-1" /> Log Issue
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-semibold">{i.id}</TableCell>
                <TableCell>{i.title}</TableCell>
                <TableCell>{i.control}</TableCell>
                <TableCell>
                  <Badge className={ratingColors[i.rating]}>{i.rating}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{i.status}</Badge>
                </TableCell>
                <TableCell>{i.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Issue</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Related Control</Label>
              <Input
                value={form.control}
                onChange={(e) => set("control", e.target.value)}
                placeholder="e.g. MCS01"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Rating</Label>
              <Select
                value={form.rating}
                onValueChange={(v) => set("rating", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Owner</Label>
              <Input
                value={form.owner}
                onChange={(e) => set("owner", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>Save Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Issues;
