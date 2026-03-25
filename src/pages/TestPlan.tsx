import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TestPlan = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Test Plan</h1>
    <p className="text-muted-foreground text-sm">Annual testing schedule generated from the control library.</p>
    <div className="rounded-lg border bg-card overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10">
            <TableHead>Control ID</TableHead>
            <TableHead>Control Name</TableHead>
            {months.map((m) => <TableHead key={m} className="text-center w-12">{m}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {["MCS01", "MCS02", "MCS03"].map((id) => (
            <TableRow key={id}>
              <TableCell className="font-semibold">{id}</TableCell>
              <TableCell>Sample Control</TableCell>
              {months.map((m) => (
                <TableCell key={m} className="text-center">
                  <Badge variant="secondary" className="text-xs w-5 h-5 p-0 flex items-center justify-center">●</Badge>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default TestPlan;
