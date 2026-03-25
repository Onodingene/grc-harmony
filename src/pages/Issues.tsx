import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ratingColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const sampleIssues = [
  { id: "ISS-001", title: "Missing SOD review for finance", control: "MCS12", rating: "High", status: "Open", owner: "Theophilus Okolie" },
  { id: "ISS-002", title: "Expired insurance policy", control: "MCS08", rating: "Critical", status: "In Progress", owner: "Victory Olumuyiwa" },
  { id: "ISS-003", title: "Late CoBC distribution", control: "MCS01", rating: "Medium", status: "Open", owner: "Omoyemi Tuga" },
];

const Issues = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Issues</h1>
        <p className="text-muted-foreground text-sm">Track and remediate control deficiencies.</p>
      </div>
      <Button><Plus className="w-4 h-4 mr-1" /> Log Issue</Button>
    </div>
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10">
            <TableHead>Issue ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Control</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleIssues.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-semibold">{i.id}</TableCell>
              <TableCell>{i.title}</TableCell>
              <TableCell>{i.control}</TableCell>
              <TableCell><Badge className={ratingColors[i.rating]}>{i.rating}</Badge></TableCell>
              <TableCell><Badge variant="outline">{i.status}</Badge></TableCell>
              <TableCell>{i.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default Issues;
