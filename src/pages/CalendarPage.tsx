import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CalendarPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Calendar</h1>
    <p className="text-muted-foreground text-sm">Audit and testing schedule overview.</p>
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Upcoming Schedule</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { date: "2026-03-28", event: "MCS01 Monthly Test Due", type: "Testing" },
            { date: "2026-04-01", event: "Q1 Audit Report Due", type: "Audit" },
            { date: "2026-04-15", event: "SOD Review Deadline", type: "Action" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
              <div className="text-sm font-mono text-muted-foreground w-24">{item.date}</div>
              <div className="flex-1 text-sm font-medium">{item.event}</div>
              <span className="text-xs text-muted-foreground">{item.type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default CalendarPage;
