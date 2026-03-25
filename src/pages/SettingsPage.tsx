import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const SettingsPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">System Settings & Configuration</h1>
    <Tabs defaultValue="controls">
      <TabsList>
        <TabsTrigger value="controls">MCS Controls</TabsTrigger>
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="owners">Process Owners</TabsTrigger>
        <TabsTrigger value="data">Data Management</TabsTrigger>
      </TabsList>

      <TabsContent value="controls" className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Manage MCS Controls</h2>
            <p className="text-sm text-muted-foreground">Add, edit, or remove Minimum Control Standards</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-1" /> Add New Control</Button>
        </div>
        <Input placeholder="Search controls..." className="max-w-md" />
      </TabsContent>

      <TabsContent value="countries" className="mt-4">
        <Card><CardHeader><CardTitle className="text-base">Country Configuration</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Manage countries and regional entities.</CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="owners" className="mt-4">
        <Card><CardHeader><CardTitle className="text-base">Process Owners</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Assign and manage control owners.</CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="data" className="mt-4">
        <Card><CardHeader><CardTitle className="text-base">Data Management</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Import/export data and manage backups.</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default SettingsPage;
