import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

const teamEmails = [
  "john@company.com",
  "sarah@company.com",
  "mike@company.com",
  "alice@company.com",
  "farouk@company.com",
];

const KEY_AREAS = [
  "Fixed Asset",
  "HR",
  "Revenue",
  "Governance & Compliance",
  "Inventory",
  "IT",
  "Accounting and Reporting",
  "Taxation",
  "Treasury",
  "Sustainability",
  "Operations",
] as const;

interface Control {
  id: string;
  keyArea: string;
  name: string;
  risk: string;
  frequency: string;
  owner: string;
  tester: string;
  activity: "Active" | "Inactive";
  nature: "Manual" | "Automated";
  type: "Preventive" | "Corrective" | "Detective";
  testDueDate: string;
}

const initialControls: Control[] = [
  { id: "MCS01", keyArea: "Governance & Compliance", name: "Code of Business Conduct & Speak-up Culture", risk: "Corruption and Bribery, Money Laundering", frequency: "Monthly", owner: "john@company.com", tester: "farouk@company.com", activity: "Active", nature: "Manual", type: "Preventive", testDueDate: "2026-03-15" },
  { id: "MCS02", keyArea: "Governance & Compliance", name: "Fair Competition Compliance", risk: "Infringement of Fair Competition regulations", frequency: "Annual", owner: "sarah@company.com", tester: "", activity: "Active", nature: "Manual", type: "Detective", testDueDate: "2026-03-15" },
  { id: "MCS03", keyArea: "Governance & Compliance", name: "Related Party Transactions & COI", risk: "Poor tone at the top", frequency: "Monthly", owner: "sarah@company.com", tester: "farouk@company.com", activity: "Active", nature: "Manual", type: "Preventive", testDueDate: "2026-03-15" },
  { id: "MCS04", keyArea: "Governance & Compliance", name: "Board of Directors Secretarial Requirements", risk: "Lack of Board oversight", frequency: "Monthly", owner: "sarah@company.com", tester: "", activity: "Inactive", nature: "Manual", type: "Detective", testDueDate: "2026-03-15" },
  { id: "MCS05", keyArea: "Governance & Compliance", name: "Health, Safety & Environment", risk: "Health & Safety incidents", frequency: "Annual", owner: "john@company.com", tester: "", activity: "Active", nature: "Automated", type: "Corrective", testDueDate: "2026-06-30" },
];

const emptyForm: Control = {
  id: "", keyArea: "", name: "", risk: "", frequency: "", owner: "", tester: "", activity: "Active", nature: "Manual", type: "Preventive", testDueDate: "",
};

const Controls = () => {
  const [controls, setControls] = useState<Control[]>(initialControls);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Control>(emptyForm as Control);
  const [search, setSearch] = useState("");
  const [keyAreaFilter, setKeyAreaFilter] = useState("all");

  const openAdd = () => {
    const nextId = `MCS${String(controls.length + 1).padStart(2, "0")}`;
    setForm({ ...emptyForm, id: nextId });
    setEditIndex(null);
    setOpen(true);
  };

  const openEdit = (i: number) => {
    setForm({ ...controls[i] });
    setEditIndex(i);
    setOpen(true);
  };

  const save = () => {
    if (!form.name || !form.id) return;
    if (editIndex !== null) {
      setControls((prev) => prev.map((c, i) => (i === editIndex ? { ...form } : c)));
    } else {
      setControls((prev) => [...prev, { ...form }]);
    }
    setOpen(false);
  };

  const remove = (i: number) => setControls((prev) => prev.filter((_, idx) => idx !== i));

  const filtered = controls.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchKeyArea = keyAreaFilter === "all" || c.keyArea === keyAreaFilter;
    return matchSearch && matchKeyArea;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Controls</h1>
        <p className="text-muted-foreground text-sm">Manage MCS Controls — Add, edit, or remove Minimum Control Standards</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search controls..." className="max-w-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex items-center gap-3">
          <Select value={keyAreaFilter} onValueChange={setKeyAreaFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Key Areas</SelectItem>
              {KEY_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportToCSV(filtered, "controls")}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add New Control</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Control ID</TableHead>
              <TableHead>Control Name</TableHead>
              <TableHead>Key Area</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Tester</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Test Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const idx = controls.indexOf(c);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{c.keyArea}</Badge></TableCell>
                  <TableCell className="text-sm">{c.owner}</TableCell>
                  <TableCell className="text-sm">{c.tester || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.activity === "Active" ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}>
                      {c.activity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.nature}</TableCell>
                  <TableCell className="text-sm">{c.type}</TableCell>
                  <TableCell>{c.frequency}</TableCell>
                  <TableCell>{c.testDueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(idx)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => remove(idx)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editIndex !== null ? "Edit Control" : "Add New Control"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Control ID</Label>
                <Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Key Area</Label>
                <Select value={form.keyArea} onValueChange={(v) => setForm({ ...form, keyArea: v })}>
                  <SelectTrigger><SelectValue placeholder="Select key area" /></SelectTrigger>
                  <SelectContent>
                    {KEY_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Control Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Risk</Label><Input value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Owner (Email)</Label>
                <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                  <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                  <SelectContent>
                    {teamEmails.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Assign Tester (Email)</Label>
                <Select value={form.tester || "unassigned"} onValueChange={(v) => setForm({ ...form, tester: v === "unassigned" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select tester" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamEmails.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label>Activity</Label>
                <Select value={form.activity} onValueChange={(v: "Active" | "Inactive") => setForm({ ...form, activity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Control Nature</Label>
                <Select value={form.nature} onValueChange={(v: "Manual" | "Automated") => setForm({ ...form, nature: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automated">Automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Control Type</Label>
                <Select value={form.type} onValueChange={(v: "Preventive" | "Corrective" | "Detective") => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Detective">Detective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Test Due Date</Label>
                <Input type="date" value={form.testDueDate} onChange={(e) => setForm({ ...form, testDueDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editIndex !== null ? "Update" : "Add"} Control</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Controls;
