import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AppHeader = () => {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
      <div />
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Country:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="ng">Nigeria</SelectItem>
              <SelectItem value="ke">Kenya</SelectItem>
              <SelectItem value="ug">Uganda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground">{today}</span>
      </div>
    </header>
  );
};

export default AppHeader;
