import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

interface Action {
  id: string;
  description: string;
  issue: string;
  dueDate: string;
  status: string;
  owner: string;
}

const statusColors: Record<string, string> = {
  Open: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Complete: "bg-green-100 text-green-800",
};

const initialActions: Action[] = [
  { id: "ACT-001", description: "Complete SOD review for finance team", issue: "ISS-001", dueDate: "2026-04-15", status: "In Progress", owner: "Theophilus Okolie" },
  { id: "ACT-002", description: "Renew group insurance policy", issue: "ISS-002", dueDate: "2026-03-30", status: "Open", owner: "Victory Olumuyiwa" },
  { id: "ACT-003", description: "Distribute CoBC to new hires", issue: "ISS-003", dueDate: "2026-04-01", status: "Complete", owner: "Omoyemi Tuga" },
];

const emptyAction: Omit<Action, "id"> = { description: "", issue: "", dueDate: "", status: "", owner: "" };

const Actions = () => {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyAction);

  const openAdd = () => { setForm(emptyAction); setOpen(true); };

  const save = () => {
    if (!form.description) return;
    const nextId = `ACT-${String(actions.length + 1).padStart(3, "0")}`;
    setActions((prev) => [...prev, { id: nextId, ...form }]);
    setOpen(false);
  };

  const set = (key: keyof Omit<Action, "id">, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Actions</h1>
          <p className="text-muted-foreground text-sm">Track remediation actions to closure.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV(actions, "actions")}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Action</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Action ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-semibold">{a.id}</TableCell>
                <TableCell>{a.description}</TableCell>
                <TableCell>{a.issue}</TableCell>
                <TableCell>{a.dueDate}</TableCell>
                <TableCell><Badge className={statusColors[a.status]}>{a.status}</Badge></TableCell>
                <TableCell>{a.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Action</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Related Issue</Label><Input value={form.issue} onChange={(e) => set("issue", e.target.value)} placeholder="e.g. ISS-001" /></div>
            <div className="grid gap-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => set("owner", e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save Action</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Actions;
