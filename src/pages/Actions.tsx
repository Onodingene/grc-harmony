import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const sampleActions = [
  { id: "ACT-001", description: "Complete SOD review for finance team", issue: "ISS-001", dueDate: "2026-04-15", status: "In Progress", owner: "Theophilus Okolie" },
  { id: "ACT-002", description: "Renew group insurance policy", issue: "ISS-002", dueDate: "2026-03-30", status: "Open", owner: "Victory Olumuyiwa" },
  { id: "ACT-003", description: "Distribute CoBC to new hires", issue: "ISS-003", dueDate: "2026-04-01", status: "Complete", owner: "Omoyemi Tuga" },
];

const statusColors: Record<string, string> = {
  Open: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Complete: "bg-green-100 text-green-800",
};

const Actions = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Actions</h1>
        <p className="text-muted-foreground text-sm">Track remediation actions to closure.</p>
      </div>
      <Button><Plus className="w-4 h-4 mr-1" /> Add Action</Button>
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
          {sampleActions.map((a) => (
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
  </div>
);

export default Actions;
