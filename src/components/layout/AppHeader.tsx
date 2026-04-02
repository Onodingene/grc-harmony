import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AppHeader = () => {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-16 border-b border-border flex items-center justify-between  bg-white">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-gray-300" />
        <h2 className="text-xl font-semibold text-black">GRC Control Tool</h2>

        {/* SHORT VERTICAL DIVIDER */}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Country:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-8">
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
