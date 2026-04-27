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
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useCountryStore } from "@/lib/countryStore";

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { countries, selectedCountry, setCountries, setSelectedCountry } = useCountryStore();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load countries from the backend once on mount
  useEffect(() => {
    apiFetch<{ id: string; name: string; code: string }[]>("/settings/countries")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCountries(res.data);
          setSelectedCountry(res.data[0]); // default to first country
        }
      });
  }, []);

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    clearAuth();
    navigate("/login");
  };

  // Get initials from user's name for avatar
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  return (
    <header className="h-16 border-b border-border flex items-center justify-between bg-white px-4">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-gray-300" />
        <h2 className="text-xl font-semibold text-black">GRC Control Tool</h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Country:</span>
          <Select
            value={selectedCountry?.id ?? ""}
            onValueChange={(id) => {
              const found = countries.find((c) => c.id === id);
              if (found) setSelectedCountry(found);
            }}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-muted-foreground">{today}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
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
              onClick={handleLogout}
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