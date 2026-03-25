import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const sampleAudits = [
  { id: "AUD-001", title: "Q1 MCS Compliance Audit", scope: "All Controls", status: "Fieldwork", lead: "Oluwaseun Oyedepo", startDate: "2026-03-01" },
  { id: "AUD-002", title: "Annual ICOFR Review", scope: "Financial Controls", status: "Planned", lead: "Ramakant Patil", startDate: "2026-06-01" },
];

const statusColors: Record<string, string> = {
  Planned: "bg-secondary text-muted-foreground",
  Fieldwork: "bg-blue-100 text-blue-800",
  Reporting: "bg-yellow-100 text-yellow-800",
  Issued: "bg-green-100 text-green-800",
};

const Audit = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Audit</h1>
        <p className="text-muted-foreground text-sm">Plan and execute internal audits with evidence tracking.</p>
      </div>
      <Button><Plus className="w-4 h-4 mr-1" /> New Audit</Button>
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
          {sampleAudits.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-semibold">{a.id}</TableCell>
              <TableCell>{a.title}</TableCell>
              <TableCell>{a.scope}</TableCell>
              <TableCell><Badge className={statusColors[a.status]}>{a.status}</Badge></TableCell>
              <TableCell>{a.lead}</TableCell>
              <TableCell>{a.startDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default Audit;
