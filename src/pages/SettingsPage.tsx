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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings & Configuration</h1>
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="controls">MCS Controls</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="owners">Process Owners</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        {/* ── Team Members Tab ── */}
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

        {/* ── Existing tabs ── */}
        <TabsContent value="controls" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Manage MCS Controls</h2>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove Minimum Control Standards
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-1" /> Add New Control
            </Button>
          </div>
          <Input placeholder="Search controls..." className="max-w-md" />
        </TabsContent>

        <TabsContent value="countries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Country Configuration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage countries and regional entities.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Process Owners</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Assign and manage control owners.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Import/export data and manage backups.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Invite Dialog ── */}
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

      {/* ── Edit Role Dialog ── */}
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

      {/* ── Remove Confirmation ── */}
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
    </div>
  );
};

export default SettingsPage;
