import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";
import { useToast } from "@/hooks/use-toast";

interface Control {
  id: string;
  controlId: string;
  name: string;
  domain: string;
  risk: string;
  frequency: string;
  status: "active" | "inactive";
  nature: string;
  type: string;
  testDueDay: number;
  countryId: string;
  ownerId: string | null;
  testerId: string | null;
  owner?: { id: string; fullName: string; email: string };
  tester?: { id: string; fullName: string; email: string };
}

interface CompanyMember {
  id: string;
  fullName: string;
  email: string;
}

const emptyForm = {
  controlId: "", name: "", domain: "", risk: "",
  frequency: "monthly", nature: "manual", type: "preventive",
  status: "active" as "active" | "inactive",
  testDueDay: 15, countryId: "",
  ownerId: "", testerId: "",
};

const Controls = () => {
  const { toast } = useToast();
  const { countries, selectedCountry } = useCountryStore();
  const [controls, setControls] = useState<Control[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");

  useEffect(() => {
    apiFetch<CompanyMember[]>("/company/members").then((r) => {
      if (r.data) setMembers(r.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch<Control[]>("/settings/controls").then((r) => {
      if (r.data) setControls(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, countryId: selectedCountry?.id ?? "" });
    setEditingControl(null);
    setOpen(true);
  };

  const openEdit = (c: Control) => {
    setForm({
      controlId: c.controlId, name: c.name, domain: c.domain, risk: c.risk,
      frequency: c.frequency, nature: c.nature, type: c.type,
      status: c.status, testDueDay: c.testDueDay, countryId: c.countryId,
      ownerId: c.ownerId ?? "", testerId: c.testerId ?? "",
    });
    setEditingControl(c);
    setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.controlId) return;
    const body = {
      ...form,
      ownerId: form.ownerId || undefined,
      testerId: form.testerId || undefined,
    };

    if (editingControl) {
      const res = await apiFetch<Control>(`/settings/controls/${editingControl.id}`, {
        method: "PUT", body: JSON.stringify(body),
      });
      if (res.error) { toast({ title: "Error", description: res.error, variant: "destructive" }); return; }
      if (res.data) setControls((prev) => prev.map((c) => c.id === editingControl.id ? res.data! : c));
      toast({ title: "Control updated" });
    } else {
      const res = await apiFetch<Control>("/settings/controls", {
        method: "POST", body: JSON.stringify(body),
      });
      if (res.error) { toast({ title: "Error", description: res.error, variant: "destructive" }); return; }
      if (res.data) setControls((prev) => [...prev, res.data!]);
      toast({ title: "Control added" });
    }
    setOpen(false);
  };

  const remove = async (c: Control) => {
    const res = await apiFetch(`/settings/controls/${c.id}`, { method: "DELETE" });
    if (res.error) { toast({ title: "Error", description: res.error, variant: "destructive" }); return; }
    setControls((prev) => prev.filter((x) => x.id !== c.id));
    toast({ title: "Control deleted" });
  };

  const exportCSV = () => {
    const rows = filtered.map((c) => ({
      "Control ID": c.controlId, "Name": c.name, "Domain": c.domain,
      "Risk": c.risk, "Frequency": c.frequency, "Status": c.status,
      "Owner": c.owner?.email ?? "", "Tester": c.tester?.email ?? "",
    }));
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "controls.csv";
    a.click();
  };

  const filtered = controls.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.controlId.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domainFilter === "all" || c.domain.toLowerCase().includes(domainFilter.toLowerCase());
    return matchSearch && matchDomain;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Controls</h1>
        <p className="text-muted-foreground text-sm">Manage MCS Controls — Add, edit, or remove Minimum Control Standards</p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Input placeholder="Search controls..." className="max-w-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex items-center gap-3">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="governance">Governance & Compliance</SelectItem>
              <SelectItem value="finance">Finance & Reporting</SelectItem>
              <SelectItem value="procurement">Procurement & AP</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add New Control</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Control ID</TableHead>
              <TableHead>Control Name</TableHead>
              <TableHead>Key Areas</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Tester</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No controls found</TableCell></TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">{c.controlId}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{c.domain}</Badge></TableCell>
                <TableCell className="text-sm">{c.owner?.email ?? "—"}</TableCell>
                <TableCell className="text-sm">{c.tester?.email ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={c.status === "active" ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}>
                    {c.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm capitalize">{c.nature.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-sm capitalize">{c.type}</TableCell>
                <TableCell className="capitalize">{c.frequency}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(c)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => remove(c)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingControl ? "Edit Control" : "Add New Control"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Control ID</Label>
                <Input value={form.controlId} onChange={(e) => setForm({ ...form, controlId: e.target.value })} disabled={!!editingControl} />
              </div>
              
              <div className="grid gap-1.5">
                <Label>Key Areas</Label>
                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="e.g. Finance & Reporting" />
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Control Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Risk</Label><Input value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Owner</Label>
                <Select value={form.ownerId} onValueChange={(v) => setForm({ ...form, ownerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                  <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.fullName} — {m.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Tester</Label>
                <Select value={form.testerId || "unassigned"} onValueChange={(v) => setForm({ ...form, testerId: v === "unassigned" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select tester" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.fullName} — {m.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: "active" | "inactive") => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Nature</Label>
                <Select value={form.nature} onValueChange={(v) => setForm({ ...form, nature: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="it_dependent_manual">IT Dependent Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="detective">Detective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annually">Semi-annually</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="as_needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Country</Label>
                <Select value={form.countryId} onValueChange={(v) => setForm({ ...form, countryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editingControl ? "Update" : "Add"} Control</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Controls;