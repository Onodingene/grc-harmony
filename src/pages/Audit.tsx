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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

interface AuditRecord {
  id: string;
  title: string;
  scope: string;
  status: string;
  lead: string;
  startDate: string;
}

const statusColors: Record<string, string> = {
  Planned: "bg-secondary text-muted-foreground",
  Fieldwork: "bg-blue-100 text-blue-800",
  Reporting: "bg-yellow-100 text-yellow-800",
  Issued: "bg-green-100 text-green-800",
};

const initialAudits: AuditRecord[] = [
  {
    id: "AUD-001",
    title: "Q1 MCS Compliance Audit",
    scope: "All Controls",
    status: "Fieldwork",
    lead: "Oluwaseun Oyedepo",
    startDate: "2026-03-01",
  },
  {
    id: "AUD-002",
    title: "Annual ICOFR Review",
    scope: "Financial Controls",
    status: "Planned",
    lead: "Ramakant Patil",
    startDate: "2026-06-01",
  },
];

const emptyAudit: Omit<AuditRecord, "id"> = {
  title: "",
  scope: "",
  status: "",
  lead: "",
  startDate: "",
};

const Audit = () => {
  const [audits, setAudits] = useState<AuditRecord[]>(initialAudits);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyAudit);

  const openAdd = () => {
    setForm(emptyAudit);
    setOpen(true);
  };

  const save = () => {
    if (!form.title) return;
    const nextId = `AUD-${String(audits.length + 1).padStart(3, "0")}`;
    setAudits((prev) => [...prev, { id: nextId, ...form }]);
    setOpen(false);
  };

  const set = (key: keyof Omit<AuditRecord, "id">, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit</h1>
          <p className="text-muted-foreground text-sm">
            Plan and execute internal audits with evidence tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(audits, "audits")}
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> New Audit
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Audit ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-semibold">{a.id}</TableCell>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.scope}</TableCell>
                <TableCell>
                  <Badge className={statusColors[a.status]}>{a.status}</Badge>
                </TableCell>
                <TableCell>{a.lead}</TableCell>
                <TableCell>{a.startDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Audit</DialogTitle>
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
              <Label>Scope</Label>
              <Input
                value={form.scope}
                onChange={(e) => set("scope", e.target.value)}
              />
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
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                  <SelectItem value="Reporting">Reporting</SelectItem>
                  <SelectItem value="Issued">Issued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Lead</Label>
              <Input
                value={form.lead}
                onChange={(e) => set("lead", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>Save Audit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Audit;
