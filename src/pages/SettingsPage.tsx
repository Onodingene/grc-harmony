import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Role = "admin" | "control_owner" | "tester" | "viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "pending";
  joinedAt: string;
}
type ControlStatus = "active" | "inactive";

interface MCSControl {
  id: string;
  controlId: string;
  name: string;
  status: ControlStatus;
  activity: string;
  ownerEmail: string;
}

interface Country {
  id: string;
  name: string;
}

const initialControls: MCSControl[] = [
  {
    id: "1",
    controlId: "MCS-001",
    name: "Segregation of Duties",
    status: "active",
    activity:
      "Ensure no single individual handles authorization, recording, and custody of assets.",
    ownerEmail: "compliance@company.com",
  },
  {
    id: "2",
    controlId: "MCS-002",
    name: "Authorization Limits",
    status: "active",
    activity: "All transactions above $10,000 require managerial approval.",
    ownerEmail: "finance@company.com",
  },
];

const roleConfig: Record<
  Role,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  admin: {
    label: "Admin",
    color: "bg-red-100 text-red-800",
    icon: <Crown className="w-3 h-3" />,
    description: "Full access to all features, settings, and team management",
  },
  control_owner: {
    label: "Control Owner",
    color: "bg-blue-100 text-blue-800",
    icon: <Shield className="w-3 h-3" />,
    description:
      "Manage assigned controls, view dashboards, submit test results",
  },
  tester: {
    label: "Tester",
    color: "bg-green-100 text-green-800",
    icon: <Edit className="w-3 h-3" />,
    description: "Execute tests, upload evidence, log exceptions",
  },
  viewer: {
    label: "Viewer",
    color: "bg-gray-100 text-gray-800",
    icon: <Eye className="w-3 h-3" />,
    description: "Read-only access to dashboards and reports",
  },
};

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Admin",
    email: "john@company.com",
    role: "admin",
    status: "active",
    joinedAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Sarah Controls",
    email: "sarah@company.com",
    role: "control_owner",
    status: "active",
    joinedAt: "2025-02-01",
  },
  {
    id: "3",
    name: "Mike Tester",
    email: "mike@company.com",
    role: "tester",
    status: "active",
    joinedAt: "2025-03-10",
  },
  {
    id: "4",
    name: "Pending User",
    email: "pending@company.com",
    role: "viewer",
    status: "pending",
    joinedAt: "2025-04-01",
  },
];
const initialCountries: Country[] = [
  { id: "1", name: "Nigeria" },
  { id: "2", name: "Ghana" },
  { id: "3", name: "Kenya" },
  { id: "4", name: "South Africa" },
];
const SettingsPage = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");
  const [editRole, setEditRole] = useState<Role>("viewer");
  const [searchTeam, setSearchTeam] = useState("");

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTeam.toLowerCase())
  );

  // MCS Controls
  const [controls, setControls] = useState<MCSControl[]>(initialControls);
  const [controlsSearch, setControlsSearch] = useState("");
  const [addControlOpen, setAddControlOpen] = useState(false);
  const [editControlOpen, setEditControlOpen] = useState(false);
  const [deleteControlOpen, setDeleteControlOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<MCSControl | null>(
    null
  );

  const [newControl, setNewControl] = useState({
    controlId: "",
    name: "",
    status: "active" as ControlStatus,
    activity: "",
    ownerEmail: "",
  });

  const [editControlData, setEditControlData] = useState<MCSControl>({
    id: "",
    controlId: "",
    name: "",
    status: "active",
    activity: "",
    ownerEmail: "",
  });

  const filteredControls = controls.filter(
    (c) =>
      c.controlId.toLowerCase().includes(controlsSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(controlsSearch.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(controlsSearch.toLowerCase())
  );

  // Countries
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [newCountryName, setNewCountryName] = useState("");
  const [deleteCountryOpen, setDeleteCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Team Handlers (unchanged)
  const handleInvite = () => {
    if (!inviteEmail || !inviteName) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setMembers((prev) => [...prev, newMember]);
    toast({
      title: "Invitation Sent",
      description: `Invited ${inviteEmail} as ${roleConfig[inviteRole].label}`,
    });
    setInviteEmail("");
    setInviteName("");
    setInviteRole("viewer");
    setInviteOpen(false);
  };

  const handleRoleChange = () => {
    if (!selectedMember) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id ? { ...m, role: editRole } : m
      )
    );
    toast({
      title: "Role Updated",
      description: `${selectedMember.name} is now ${roleConfig[editRole].label}`,
    });
    setEditOpen(false);
    setSelectedMember(null);
  };

  const handleRemove = () => {
    if (!selectedMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
    toast({
      title: "Member Removed",
      description: `${selectedMember.name} has been removed from the team`,
    });
    setRemoveOpen(false);
    setSelectedMember(null);
  };

  // MCS Controls Handlers
  const handleAddControl = () => {
    if (!newControl.controlId || !newControl.name) return;
    const control: MCSControl = {
      id: Date.now().toString(),
      controlId: newControl.controlId,
      name: newControl.name,
      status: newControl.status,
      activity: newControl.activity,
      ownerEmail: newControl.ownerEmail,
    };
    setControls((prev) => [...prev, control]);
    toast({
      title: "Control Added",
      description: `${newControl.controlId} - ${newControl.name}`,
    });
    setNewControl({
      controlId: "",
      name: "",
      status: "active",
      activity: "",
      ownerEmail: "",
    });
    setAddControlOpen(false);
  };

  const openEditControl = (control: MCSControl) => {
    setEditControlData({ ...control });
    setEditControlOpen(true);
  };

  const handleEditControl = () => {
    if (!editControlData.controlId || !editControlData.name) return;
    setControls((prev) =>
      prev.map((c) =>
        c.id === editControlData.id ? { ...editControlData } : c
      )
    );
    toast({
      title: "Control Updated",
      description: `${editControlData.controlId} has been updated`,
    });
    setEditControlOpen(false);
  };

  const openDeleteControl = (control: MCSControl) => {
    setSelectedControl(control);
    setDeleteControlOpen(true);
  };

  const handleDeleteControl = () => {
    if (!selectedControl) return;
    setControls((prev) => prev.filter((c) => c.id !== selectedControl.id));
    toast({
      title: "Control Deleted",
      description: `${selectedControl.controlId} has been removed`,
    });
    setDeleteControlOpen(false);
    setSelectedControl(null);
  };

  // Countries Handlers
  const handleAddCountry = () => {
    if (!newCountryName.trim()) return;
    const newCountry: Country = {
      id: Date.now().toString(),
      name: newCountryName.trim(),
    };
    setCountries((prev) => [...prev, newCountry]);
    toast({
      title: "Country Added",
      description: `${newCountryName} has been added`,
    });
    setNewCountryName("");
  };

  const openDeleteCountry = (country: Country) => {
    setSelectedCountry(country);
    setDeleteCountryOpen(true);
  };

  const handleDeleteCountry = () => {
    if (!selectedCountry) return;
    setCountries((prev) => prev.filter((c) => c.id !== selectedCountry.id));
    toast({
      title: "Country Removed",
      description: `${selectedCountry.name} has been removed`,
    });
    setDeleteCountryOpen(false);
    setSelectedCountry(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings & Configuration</h1>
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="controls">MCS Controls</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
        </TabsList>

        {/* ── Team Members Tab (unchanged) ── */}
        <TabsContent value="team" className="space-y-6 mt-4">
          {/* Role Legend */}
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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Team Members ({members.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Invite members and assign roles to your team
              </p>
            </div>
            <Button
              onClick={() => setInviteOpen(true)}
              className="bg-primary text-primary-foreground"
            >
              <UserPlus className="w-4 h-4 mr-1" /> Invite Member
            </Button>
          </div>

          <Input
            placeholder="Search by name or email..."
            value={searchTeam}
            onChange={(e) => setSearchTeam(e.target.value)}
            className="max-w-md"
          />

          {/* Members Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
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
                      <Badge
                        variant={m.status === "active" ? "default" : "outline"}
                      >
                        {m.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.joinedAt}</TableCell>
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
                      {m.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Invitation Resent",
                              description: `Resent invite to ${m.email}`,
                            });
                          }}
                        >
                          <Mail className="w-3 h-3 mr-1" /> Resend
                        </Button>
                      )}
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
                      colSpan={6}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Control Activity</TableHead>
                  <TableHead>Owner Email</TableHead>
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
                    <TableCell>
                      <Badge
                        variant={
                          c.status === "active" ? "default" : "secondary"
                        }
                      >
                        {c.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {c.activity}
                    </TableCell>
                    <TableCell>{c.ownerEmail}</TableCell>
                    <TableCell className="text-right space-x-1 flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditControl(c)}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteControl(c)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredControls.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                placeholder="New country name"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={handleAddCountry}
                disabled={!newCountryName.trim()}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Country
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">
                      {country.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteCountry(country)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {countries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
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
      </Tabs>

      {/* ── Invite Dialog (unchanged) ── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team with a specific role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="e.g. Jane Doe"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                placeholder="e.g. jane@company.com"
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
                  {(
                    Object.entries(roleConfig) as [
                      Role,
                      (typeof roleConfig)[Role]
                    ][]
                  ).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {cfg.icon} {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
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
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || !inviteName}
              className="bg-primary text-primary-foreground"
            >
              <Mail className="w-4 h-4 mr-1" /> Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Dialog (unchanged) ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Role</label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as Role)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(roleConfig) as [
                      Role,
                      (typeof roleConfig)[Role]
                    ][]
                  ).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {cfg.icon} {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {roleConfig[editRole].description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              className="bg-primary text-primary-foreground"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Remove Member Dialog (unchanged) ── */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.name} (
              {selectedMember?.email}) from the team? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Control Dialog ── */}
      <Dialog open={addControlOpen} onOpenChange={setAddControlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New MCS Control</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Control ID</label>
              <Input
                placeholder="e.g. MCS-003"
                value={newControl.controlId}
                onChange={(e) =>
                  setNewControl({ ...newControl, controlId: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Control Name</label>
              <Input
                placeholder="Control name"
                value={newControl.name}
                onChange={(e) =>
                  setNewControl({ ...newControl, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newControl.status}
                onValueChange={(v) =>
                  setNewControl({ ...newControl, status: v as ControlStatus })
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
            <div>
              <label className="text-sm font-medium">Control Activity</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                placeholder="Describe the control activity..."
                value={newControl.activity}
                onChange={(e) =>
                  setNewControl({ ...newControl, activity: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Control Owner Email</label>
              <Input
                type="email"
                placeholder="owner@company.com"
                value={newControl.ownerEmail}
                onChange={(e) =>
                  setNewControl({ ...newControl, ownerEmail: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddControlOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddControl}
              className="bg-primary text-primary-foreground"
            >
              Add Control
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Control Dialog ── */}
      <Dialog open={editControlOpen} onOpenChange={setEditControlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit MCS Control</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Control ID</label>
              <Input
                value={editControlData.controlId}
                onChange={(e) =>
                  setEditControlData({
                    ...editControlData,
                    controlId: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Control Name</label>
              <Input
                value={editControlData.name}
                onChange={(e) =>
                  setEditControlData({
                    ...editControlData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editControlData.status}
                onValueChange={(v) =>
                  setEditControlData({
                    ...editControlData,
                    status: v as ControlStatus,
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
            <div>
              <label className="text-sm font-medium">Control Activity</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                value={editControlData.activity}
                onChange={(e) =>
                  setEditControlData({
                    ...editControlData,
                    activity: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Control Owner Email</label>
              <Input
                type="email"
                value={editControlData.ownerEmail}
                onChange={(e) =>
                  setEditControlData({
                    ...editControlData,
                    ownerEmail: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditControlOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditControl}
              className="bg-primary text-primary-foreground"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Control Confirmation ── */}
      <Dialog open={deleteControlOpen} onOpenChange={setDeleteControlOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Control</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete control{" "}
              {selectedControl?.controlId} - {selectedControl?.name}? This
              action cannot be undone.
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
              Delete Control
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Country Confirmation ── */}
      <Dialog open={deleteCountryOpen} onOpenChange={setDeleteCountryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Country</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedCountry?.name}? This
              action cannot be undone.
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
              Remove Country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
