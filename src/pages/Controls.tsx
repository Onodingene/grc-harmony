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

interface Control {
  id: string;
  domain: string;
  name: string;
  risk: string;
  frequency: string;
  owner: string;
}

const initialControls: Control[] = [
  { id: "MCS01", domain: "Governance & Compliance", name: "Code of Business Conduct & Speak-up Culture", risk: "Corruption and Bribery, Money Laundering", frequency: "Monthly", owner: "Omoyemi Tuga" },
  { id: "MCS02", domain: "Governance & Compliance", name: "Fair Competition Compliance", risk: "Infringement of Fair Competition regulations", frequency: "Annual", owner: "Mary Waititu" },
  { id: "MCS03", domain: "Governance & Compliance", name: "Related Party Transactions & COI", risk: "Poor tone at the top", frequency: "Monthly", owner: "Mary Waititu" },
  { id: "MCS04", domain: "Governance & Compliance", name: "Board of Directors Secretarial Requirements", risk: "Lack of Board oversight", frequency: "Monthly", owner: "Mary Waititu" },
  { id: "MCS05", domain: "Governance & Compliance", name: "Health, Safety & Environment", risk: "Health & Safety incidents", frequency: "Annual", owner: "Omoyemi Tuga" },
];

const emptyControl: Omit<Control, "id"> = { domain: "", name: "", risk: "", frequency: "", owner: "" };

const Controls = () => {
  const [controls, setControls] = useState<Control[]>(initialControls);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState(emptyControl);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");

  const openAdd = () => { setForm(emptyControl); setEditIndex(null); setOpen(true); };
  const openEdit = (i: number) => { const { id, ...rest } = controls[i]; setForm(rest); setEditIndex(i); setOpen(true); };

  const save = () => {
    if (!form.name) return;
    if (editIndex !== null) {
      setControls((prev) => prev.map((c, i) => (i === editIndex ? { ...c, ...form } : c)));
    } else {
      const nextId = `MCS${String(controls.length + 1).padStart(2, "0")}`;
      setControls((prev) => [...prev, { id: nextId, ...form }]);
    }
    setOpen(false);
  };

  const remove = (i: number) => setControls((prev) => prev.filter((_, idx) => idx !== i));

  const filtered = controls.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domainFilter === "all" || c.domain.toLowerCase().includes(domainFilter);
    return matchSearch && matchDomain;
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
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="governance">Governance & Compliance</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportToCSV(filtered, "controls")}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add New Control</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Control ID</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Control Name</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">{c.id}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{c.domain}</Badge></TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-sm">{c.risk}</TableCell>
                <TableCell>{c.frequency}</TableCell>
                <TableCell>{c.owner}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(controls.indexOf(c))}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => remove(controls.indexOf(c))}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editIndex !== null ? "Edit Control" : "Add New Control"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Domain</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Governance & Compliance">Governance & Compliance</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="IT & Security">IT & Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Control Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Risk</Label><Input value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} /></div>
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
            <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editIndex !== null ? "Update" : "Add"} Control</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Controls;
