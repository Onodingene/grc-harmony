import { useState, useEffect } from "react";
import {
  getFYStartMonth,
  setFYStartMonth,
  MONTH_NAMES,
} from "@/lib/financial-year";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { getFYStartMonth, setFYStartMonth, MONTH_NAMES } from "@/lib/financial-Year";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Mail,
  Trash2,
  UserPlus,
  Shield,
  Eye,
  Edit,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";
import { Textarea } from "@/components/ui/textarea";
import MemberCombobox from "@/components/MemberCombobox";

type Role = "admin" | "control_owner" | "tester" | "viewer";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  joinedAt: string;
}

interface MCSControl {
  id: string;
  controlId: string;
  name: string;
  description: string;
  domain: string;
  risk: string;
  frequency: string;
  nature: string;
  type: string;
  status: "active" | "inactive";
  testDueDay: number;
  testDueDate?: string | null;
  countryId: string;
  ownerId: string | null;
  testerId: string | null;
  owner?: { id: string; fullName: string; email: string };
}

interface CompanyMember {
  id: string;
  fullName: string;
  email: string;
}

const roleConfig: Record<
  Role,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  admin: {
    label: "Admin",
    color: "bg-red-100 text-red-800",
    icon: <Crown className="w-3 h-3" />,
    description: "Full access to all features",
  },
  control_owner: {
    label: "Control Owner",
    color: "bg-blue-100 text-blue-800",
    icon: <Shield className="w-3 h-3" />,
    description: "Manage assigned controls",
  },
  tester: {
    label: "Tester",
    color: "bg-green-100 text-green-800",
    icon: <Edit className="w-3 h-3" />,
    description: "Execute tests and upload evidence",
  },
  viewer: {
    label: "Viewer",
    color: "bg-gray-100 text-gray-800",
    icon: <Eye className="w-3 h-3" />,
    description: "Read-only access",
  },
};

const SettingsPage = () => {
  const { toast } = useToast();
  const { countries, selectedCountry, setCountries } = useCountryStore();

  // ── Team state ──
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTeam, setSearchTeam] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");
  const [editRole, setEditRole] = useState<Role>("viewer");

  // ── Controls state ──
  const [controls, setControls] = useState<MCSControl[]>([]);
  const [controlsSearch, setControlsSearch] = useState("");
  const [addControlOpen, setAddControlOpen] = useState(false);
  const [editControlOpen, setEditControlOpen] = useState(false);
  const [deleteControlOpen, setDeleteControlOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<MCSControl | null>(
    null,
  );
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);

  const [newControl, setNewControl] = useState({
    controlId: "",
    name: "",
    description: "",
    domain: "",
    risk: "",
    frequency: "monthly",
    nature: "manual",
    type: "preventive",
    status: "active" as "active" | "inactive",
    testDueDay: 15,
    testDueDate: "",
    countryId: "",
    ownerId: "",
    testerId: "",
  });

  // ── Countries state ──
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [deleteCountryOpen, setDeleteCountryOpen] = useState(false);
  const [selectedCountryToDelete, setSelectedCountryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ── Load data on mount ──
  useEffect(() => {
    // Load team members
    apiFetch<TeamMember[]>("/settings/members").then((res) => {
      if (res.data) setMembers(res.data);
    });

    // Load controls
    apiFetch<MCSControl[]>("/settings/controls").then((res) => {
      if (res.data) setControls(res.data);
    });

    // Load company members for owner/tester dropdowns
    apiFetch<CompanyMember[]>("/company/members").then((res) => {
      if (res.data) setCompanyMembers(res.data);
    });

    apiFetch<{ financialYearStart: number }>("/settings/company").then(
      (res) => {
        if (
          res.data?.financialYearStart &&
          res.data?.financialYearStart != null
        ) {
          setFyMonth(res.data.financialYearStart);
          setFYStartMonth(res.data.financialYearStart);
        }
      },
    );
  }, []);

  const [fyMonth, setFyMonth] = useState<number>(getFYStartMonth());

  const handleFYChange = async (m: string) => {
    const n = parseInt(m, 10);

    try {
      const res = await apiFetch("/settings/company", {
        method: "PUT",
        body: JSON.stringify({ financialYearStart: n }),
      });

      if (res.error) {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
        return;
      }

      setFyMonth(n);
      setFYStartMonth(n);

      toast({
        title: "Financial Year Updated",
        description: `Audit calendar now starts in ${MONTH_NAMES[n - 1]}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update financial year",
        variant: "destructive",
      });
    }
  };

  // ── Team handlers ──
  const handleInvite = async () => {
    if (!inviteEmail) return;
    const res = await apiFetch("/invites", {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    toast({
      title: "Invitation Sent",
      description: `Invited ${inviteEmail} as ${roleConfig[inviteRole].label}`,
    });
    setInviteEmail("");
    setInviteRole("viewer");
    setInviteOpen(false);
    // Refresh members list
    apiFetch<TeamMember[]>("/settings/members").then((r) => {
      if (r.data) setMembers(r.data);
    });
  };

  const handleRoleChange = async () => {
    if (!selectedMember) return;
    const res = await apiFetch(`/settings/members/${selectedMember.id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: editRole }),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id ? { ...m, role: editRole } : m,
      ),
    );
    toast({
      title: "Role Updated",
      description: `${selectedMember.fullName} is now ${roleConfig[editRole].label}`,
    });
    setEditOpen(false);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    const res = await apiFetch(`/settings/members/${selectedMember.id}`, {
      method: "DELETE",
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
    toast({
      title: "Member Removed",
      description: `${selectedMember.fullName} removed`,
    });
    setRemoveOpen(false);
  };

  // ── Controls handlers ──
  const handleAddControl = async () => {
    if (!newControl.controlId || !newControl.name || !newControl.countryId)
      return;
    const res = await apiFetch<MCSControl>("/settings/controls", {
      method: "POST",
      body: JSON.stringify({
        ...newControl,
        testDueDate: newControl.testDueDate || null,
        ownerId: newControl.ownerId || undefined,
        testerId: newControl.testerId || undefined,
      }),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    if (res.data) setControls((prev) => [...prev, res.data!]);
    toast({
      title: "Control Added",
      description: `${newControl.controlId} — ${newControl.name}`,
    });
    setNewControl({
      controlId: "",
      name: "",
      description: "",
      domain: "",
      risk: "",
      frequency: "monthly",
      nature: "manual",
      type: "preventive",
      status: "active",
      testDueDay: 15,
      testDueDate: "",
      countryId: "",
      ownerId: "",
      testerId: "",
    });
    setAddControlOpen(false);
  };

  
  const handleEditControl = async () => {
    if (!selectedControl) return;
    const res = await apiFetch<MCSControl>(
      `/settings/controls/${selectedControl.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          controlId: selectedControl.controlId,
          name: selectedControl.name,
          domain: selectedControl.domain,
          description: selectedControl.description,
          testDueDay: selectedControl.testDueDay ?? 15,
          testDueDate: selectedControl.testDueDate || null,
          risk: selectedControl.risk,
          nature: selectedControl.nature,        
          type: selectedControl.type,          
          frequency: selectedControl.frequency,
          status: selectedControl.status,
          ownerId: selectedControl.ownerId || undefined,
          testerId: selectedControl.testerId || undefined,
        }),
      },
    );
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }

    setControls((prev) =>
      prev.map((c) =>
        c.id === selectedControl.id
          ? { ...selectedControl, ...(res.data ?? {}) }
          : c,
      ),
    );
    // if (res.data)
    //   setControls((prev) =>
    //     prev.map((c) => (c.id === selectedControl.id ? res.data! : c)),
    //   );
    toast({ title: "Control Updated" });
    setEditControlOpen(false);
  };

  const handleDeleteControl = async () => {
    if (!selectedControl) return;
    const res = await apiFetch(`/settings/controls/${selectedControl.id}`, {
      method: "DELETE",
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    setControls((prev) => prev.filter((c) => c.id !== selectedControl.id));
    toast({ title: "Control Deleted" });
    setDeleteControlOpen(false);
  };

  // ── Countries handlers ──
  const handleAddCountry = async () => {
    if (!newCountryName.trim() || !newCountryCode.trim()) return;
    const res = await apiFetch("/settings/countries", {
      method: "POST",
      body: JSON.stringify({
        name: newCountryName.trim(),
        code: newCountryCode.trim().toUpperCase(),
      }),
    });
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    if (res.data)
      setCountries([
        ...countries,
        res.data as { id: string; name: string; code: string },
      ]);
    toast({ title: "Country Added", description: newCountryName });
    setNewCountryName("");
    setNewCountryCode("");
  };

  const handleDeleteCountry = async () => {
    if (!selectedCountryToDelete) return;
    const res = await apiFetch(
      `/settings/countries/${selectedCountryToDelete.id}`,
      { method: "DELETE" },
    );
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
      return;
    }
    setCountries(countries.filter((c) => c.id !== selectedCountryToDelete.id));
    toast({ title: "Country Removed" });
    setDeleteCountryOpen(false);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTeam.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTeam.toLowerCase()),
  );

  const filteredControls = controls.filter(
    (c) =>
      c.controlId.toLowerCase().includes(controlsSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(controlsSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings & Configuration</h1>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="controls">MCS Controls</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="financial-year">Financial Year</TabsTrigger>
        </TabsList>

        {/* ── Team Members Tab ── */}
        <TabsContent value="team" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              Object.entries(roleConfig) as [Role, (typeof roleConfig)[Role]][]
            ).map(([key, cfg]) => (
              <Card key={key} className="border">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-md ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cfg.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Team Members ({members.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Invite members and assign roles
              </p>
            </div>
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1" /> Invite Member
            </Button>
          </div>

          <Input
            placeholder="Search by name or email..."
            value={searchTeam}
            onChange={(e) => setSearchTeam(e.target.value)}
            className="max-w-md"
          />

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.fullName}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={roleConfig[m.role].color}
                      >
                        <span className="mr-1">{roleConfig[m.role].icon}</span>
                        {roleConfig[m.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(m);
                          setEditRole(m.role);
                          setEditOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Role
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedMember(m);
                          setRemoveOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── MCS Controls Tab ── */}
        <TabsContent value="controls" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">MCS Controls</h2>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove Minimum Control Standards
              </p>
            </div>
            <Button onClick={() => setAddControlOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add New Control
            </Button>
          </div>

          <Input
            placeholder="Search controls..."
            value={controlsSearch}
            onChange={(e) => setControlsSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead>Control ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Areas</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">
                      {c.controlId}
                    </TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.domain}</TableCell>
                    <TableCell className="capitalize">{c.frequency}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.status === "active" ? "default" : "secondary"
                        }
                      >
                        {c.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.owner?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedControl(c);
                          setEditControlOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedControl(c);
                          setDeleteControlOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredControls.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No controls found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Countries Tab ── */}
        <TabsContent value="countries" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Countries</h2>
              <p className="text-sm text-muted-foreground">
                Manage countries for this company
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Country name"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                className="w-36"
              />
              <Input
                placeholder="Code e.g. NG"
                value={newCountryCode}
                onChange={(e) => setNewCountryCode(e.target.value)}
                className="w-24"
              />
              <Button
                onClick={handleAddCountry}
                disabled={!newCountryName.trim() || !newCountryCode.trim()}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead>Country</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.code}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedCountryToDelete(c);
                          setDeleteCountryOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {countries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No countries added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Financial Year Tab ── */}
        <TabsContent value="financial-year" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Year Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <p className="text-sm text-muted-foreground">
                Set the month your financial year begins. The annual audit
                calendar will follow this order.
              </p>
              <div>
                <label className="text-sm font-medium">Start Month</label>
                <Select value={String(fyMonth)} onValueChange={handleFYChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="font-medium">Current FY:</span>
                {MONTH_NAMES[fyMonth - 1]} → {MONTH_NAMES[(fyMonth + 10) % 12]}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* this closes the Tabs block */}
      </Tabs>

      {/* ── Invite Dialog ── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                placeholder="jane@company.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as Role)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["control_owner", "tester", "viewer"] as Role[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {roleConfig[key].label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {roleConfig[inviteRole].description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              <Mail className="w-4 h-4 mr-1" /> Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedMember?.fullName}
            </DialogDescription>
          </DialogHeader>
          <Select
            value={editRole}
            onValueChange={(v) => setEditRole(v as Role)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(roleConfig) as Role[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {roleConfig[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Remove Member Dialog ── */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Remove {selectedMember?.fullName} from the team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Control Dialog ── */}
      <Dialog open={addControlOpen} onOpenChange={setAddControlOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New MCS Control</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="text-sm font-medium">Control ID</label>
              <Input
                placeholder="e.g. MCS01"
                value={newControl.controlId}
                onChange={(e) =>
                  setNewControl({ ...newControl, controlId: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Control Name</label>
              <Input
                placeholder="e.g. Bank Reconciliation"
                value={newControl.name}
                onChange={(e) =>
                  setNewControl({ ...newControl, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Control Description</label>
              <Textarea
                placeholder=""
                value={newControl.description}
                onChange={(e) =>
                  setNewControl({ ...newControl, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Domain</label>
              <Select
                value={newControl.domain}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, domain: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select key area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed Asset">Fixed Asset</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Governance & Compliance">
                    Governance & Compliance
                  </SelectItem>
                  <SelectItem value="Inventory">Inventory</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Accounting & Reporting">
                    Accounting & Reporting
                  </SelectItem>
                  <SelectItem value="Taxation">Taxation</SelectItem>
                  <SelectItem value="Treasury">Treasury</SelectItem>
                  <SelectItem value="Sustainability">Sustainability</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Expenditure">Expenditure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Risk</label>
              <Input
                placeholder="Risk description"
                value={newControl.risk}
                onChange={(e) =>
                  setNewControl({ ...newControl, risk: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Select
                value={newControl.countryId}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, countryId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={newControl.frequency}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, frequency: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi_annually">Semi-annually</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                Test Due Date{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                type="date"
                value={newControl.testDueDate || ""}
                onChange={(e) =>
                  setNewControl({ ...newControl, testDueDate: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Date this control's test is due.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Nature</label>
              <Select
                value={newControl.nature}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, nature: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={newControl.type}
                onValueChange={(v) => setNewControl({ ...newControl, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="detective">Detective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Owner</label>
              <MemberCombobox
                members={companyMembers}
                value={newControl.ownerId}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, ownerId: v })
                }
                placeholder="Select owner"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tester</label>
              <MemberCombobox
                members={companyMembers}
                value={newControl.testerId}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, testerId: v })
                }
                placeholder="Select tester"
                includeUnassigned
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newControl.status}
                onValueChange={(v) =>
                  setNewControl({
                    ...newControl,
                    status: v as "active" | "inactive",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddControlOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddControl}>Add Control</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Control Dialog ── */}
      <Dialog open={editControlOpen} onOpenChange={setEditControlOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit MCS Control</DialogTitle>
          </DialogHeader>
          {selectedControl && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                 <label className="text-sm font-medium">Control ID</label>
                 <Input value={selectedControl.controlId}
                     onChange={(e) =>
                      setSelectedControl({ ...selectedControl, controlId: e.target.value })
                      }/>
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedControl.name}
                  onChange={(e) =>
                    setSelectedControl({
                      ...selectedControl,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
  <label className="text-sm font-medium">Nature</label>
  <Select
    value={selectedControl.nature}
    onValueChange={(v) =>
      setSelectedControl({ ...selectedControl, nature: v })
    }
  >
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="manual">Manual</SelectItem>
      <SelectItem value="automated">Automated</SelectItem>
    </SelectContent>
  </Select>
</div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedControl.description}
                  onChange={(e) =>
                    setSelectedControl({
                      ...selectedControl,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Domain</label>
                <Select
                  value={selectedControl.domain}
                  onValueChange={(v) =>
                    setSelectedControl({ ...selectedControl, domain: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed Asset">Fixed Asset</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Governance & Compliance">
                      Governance & Compliance
                    </SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Accounting & Reporting">
                      Accounting & Reporting
                    </SelectItem>
                    <SelectItem value="Taxation">Taxation</SelectItem>
                    <SelectItem value="Treasury">Treasury</SelectItem>
                    <SelectItem value="Sustainability">
                      Sustainability
                    </SelectItem>
                    <SelectItem value="Expenditure">
                      Expenditure
                    </SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Risk</label>
                <Input
                  value={selectedControl.risk}
                  onChange={(e) =>
                    setSelectedControl({
                      ...selectedControl,
                      risk: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select
                  value={selectedControl.frequency}
                  onValueChange={(v) =>
                    setSelectedControl({ ...selectedControl, frequency: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annually">Semi-annually</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="as_needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Test Due Date{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  type="date"
                  value={
                    selectedControl.testDueDate
                      ? selectedControl.testDueDate.slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedControl({
                      ...selectedControl,
                      testDueDate: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Date this control's test is due.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Owner</label>
                <MemberCombobox
                  members={companyMembers}
                  value={selectedControl.ownerId ?? ""}
                  onValueChange={(v) =>
                    setSelectedControl({ ...selectedControl, ownerId: v })
                  }
                  placeholder="Select owner"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tester</label>
                <MemberCombobox
                  members={companyMembers}
                  value={selectedControl.testerId ?? ""}
                  onValueChange={(v) =>
                    setSelectedControl({ ...selectedControl, testerId: v })
                  }
                  placeholder="Select tester"
                  includeUnassigned
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedControl.status}
                  onValueChange={(v) =>
                    setSelectedControl({
                      ...selectedControl,
                      status: v as "active" | "inactive",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditControlOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditControl}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Control Dialog ── */}
      <Dialog open={deleteControlOpen} onOpenChange={setDeleteControlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Control</DialogTitle>
            <DialogDescription>
              Delete {selectedControl?.controlId} — {selectedControl?.name}?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteControlOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteControl}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Country Dialog ── */}
      <Dialog open={deleteCountryOpen} onOpenChange={setDeleteCountryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Country</DialogTitle>
            <DialogDescription>
              Remove {selectedCountryToDelete?.name}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCountryOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCountry}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
