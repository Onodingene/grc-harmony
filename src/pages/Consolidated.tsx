import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Consolidated = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Consolidated View</h1>
    <p className="text-muted-foreground text-sm">Entity-level compliance overview across all countries and regions.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {["Nigeria", "Kenya", "Uganda"].map((country) => (
        <Card key={country} className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{country}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Controls</span><span className="font-semibold">16</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Compliance</span><span className="font-semibold text-green-600">87%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open Issues</span><span className="font-semibold text-destructive">3</span></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Consolidated;
