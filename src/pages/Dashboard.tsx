import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, Clock, Users, Settings, BarChart3, Lock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const adminStats = [
  { label: "Total Controls", value: "48", icon: Shield, trend: "+3 this month" },
  { label: "Open Issues", value: "12", icon: AlertTriangle, trend: "4 critical" },
  { label: "Tests Passed", value: "89%", icon: CheckCircle, trend: "↑ 5% from last month" },
  { label: "Pending Actions", value: "7", icon: Clock, trend: "3 overdue" },
  { label: "Active Users", value: "24", icon: Users, trend: "6 control owners" },
  { label: "System Health", value: "99.9%", icon: Settings, trend: "All services running" },
];

const ownerStats = [
  { label: "My Controls", value: "8", icon: Shield, trend: "2 due for testing" },
  { label: "My Open Issues", value: "3", icon: AlertTriangle, trend: "1 critical" },
  { label: "My Test Pass Rate", value: "92%", icon: CheckCircle, trend: "↑ 3% this quarter" },
  { label: "My Pending Actions", value: "2", icon: Clock, trend: "1 overdue" },
];

const recentActivity = [
  { action: "Test completed", detail: "MCS01 — Pass", user: "Omoyemi Tuga", time: "2 hours ago" },
  { action: "Issue raised", detail: "ISS-004 — High", user: "Mary Waititu", time: "5 hours ago" },
  { action: "Action closed", detail: "ACT-003 — Complete", user: "Victory Olumuyiwa", time: "1 day ago" },
];

const Dashboard = () => {
  const [role] = useState<"admin" | "owner">("admin");

  const stats = role === "admin" ? adminStats : ownerStats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Tabs defaultValue="admin" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="admin" className="text-xs">
              <Lock className="w-3 h-3 mr-1" /> Admin View
            </TabsTrigger>
            <TabsTrigger value="owner" className="text-xs">
              <Users className="w-3 h-3 mr-1" /> Control Owner View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="admin">
        <TabsContent value="admin">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminStats.map((s) => (
                <Card key={s.label} className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                    <s.icon className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Control Effectiveness</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Chart placeholder — connect data source</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base">Risk Heat Map</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Heat map placeholder — connect data source</div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">Recent Activity (All Users)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{a.action}</TableCell>
                        <TableCell>{a.detail}</TableCell>
                        <TableCell>{a.user}</TableCell>
                        <TableCell className="text-muted-foreground">{a.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="owner">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ownerStats.map((s) => (
                <Card key={s.label} className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                    <s.icon className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">My Assigned Controls</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Control ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Next Test</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">MCS01</TableCell>
                      <TableCell>Code of Business Conduct</TableCell>
                      <TableCell>2026-04-15</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">Effective</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">MCS05</TableCell>
                      <TableCell>Health, Safety & Environment</TableCell>
                      <TableCell>2026-04-01</TableCell>
                      <TableCell><Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
