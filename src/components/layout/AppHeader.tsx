import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AppHeader = () => {
  const navigate = useNavigate();
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
              <SelectItem value="ug">Ghana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-muted-foreground">{today}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  AU
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/login")}
              className="cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
