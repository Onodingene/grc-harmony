import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const sampleControls = [
  { id: "MCS01", domain: "Governance & Compliance", name: "Code of Business Conduct & Speak-up Culture", risk: "Corruption and Bribery, Money Laundering", frequency: "Monthly", owner: "Omoyemi Tuga" },
  { id: "MCS02", domain: "Governance & Compliance", name: "Fair Competition Compliance", risk: "Infringement of Fair Competition regulations", frequency: "Annual", owner: "Mary Waititu" },
  { id: "MCS03", domain: "Governance & Compliance", name: "Related Party Transactions & COI", risk: "Poor tone at the top", frequency: "Monthly", owner: "Mary Waititu" },
  { id: "MCS04", domain: "Governance & Compliance", name: "Board of Directors Secretarial Requirements", risk: "Lack of Board oversight", frequency: "Monthly", owner: "Mary Waititu" },
  { id: "MCS05", domain: "Governance & Compliance", name: "Health, Safety & Environment", risk: "Health & Safety incidents", frequency: "Annual", owner: "Omoyemi Tuga" },
];

const Controls = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Controls</h1>
        <p className="text-muted-foreground text-sm">Manage MCS Controls — Add, edit, or remove Minimum Control Standards</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search controls..." className="max-w-lg" />
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="governance">Governance & Compliance</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
          <Button><Plus className="w-4 h-4 mr-1" /> Add New Control</Button>
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
            {sampleControls.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold">{c.id}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{c.domain}</Badge>
                </TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-sm">{c.risk}</TableCell>
                <TableCell>{c.frequency}</TableCell>
                <TableCell>{c.owner}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs"><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs"><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Controls;
