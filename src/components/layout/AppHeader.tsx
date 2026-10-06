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
import { User, LogOut, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useCountryStore } from "@/lib/countryStore";

const ALL_COUNTRIES_VALUE = "all";

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { countries, selectedCountry, setCountries, setSelectedCountry } =
    useCountryStore();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load countries from the backend once on mount
  useEffect(() => {
    apiFetch<{ id: string; name: string; code: string }[]>(
      "/settings/countries"
    ).then((res) => {
      if (res.data) {
        setCountries(res.data);
        setSelectedCountry(null); // Default to "All Businesses"
      }
    });
  }, []);

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    clearAuth();
    navigate("/login");
  };

  const handleCountryChange = (value: string) => {
    if (value === ALL_COUNTRIES_VALUE) {
      setSelectedCountry(null);
    } else {
      const found = countries.find((c) => c.id === value);
      if (found) setSelectedCountry(found);
    }
  };

  // Get initials from user's name for avatar
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AU";

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border/80 flex items-center justify-between bg-white/90 backdrop-blur px-6">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full bg-primary" aria-hidden />
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Governance, Risk and Compliance
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Business
          </span>
          <Select
            value={selectedCountry?.id ?? ALL_COUNTRIES_VALUE}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger className="w-44 h-9 font-medium">
              <SelectValue placeholder="All Businesses" />
            </SelectTrigger>
            <SelectContent>
              {/* All Businesses option always first */}
              <SelectItem value={ALL_COUNTRIES_VALUE}>All Businesses</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="hidden lg:inline text-muted-foreground">{today}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="w-9 h-9 ring-2 ring-primary/60">
                <AvatarFallback className="bg-brand-navy text-white text-xs font-bold">
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
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
