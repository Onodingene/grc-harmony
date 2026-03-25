import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MonthlyReport = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Monthly Report</h1>
    <p className="text-muted-foreground text-sm">MCS compliance tracking and monthly control status summary.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Controls Tested</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">24 / 48</div></CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Pass Rate</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-green-600">91%</div></CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">New Issues</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-destructive">3</div></CardContent>
      </Card>
    </div>
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Report Details</CardTitle></CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Detailed report will be generated from live data
        </div>
      </CardContent>
    </Card>
  </div>
);

export default MonthlyReport;
