import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  fullName: string;
  email: string;
}

interface MemberComboboxProps {
  members: Member[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeUnassigned?: boolean;
}

const MemberCombobox = ({
  members,
  value,
  onValueChange,
  placeholder = "Select member",
  includeUnassigned = false,
}: MemberComboboxProps) => {
  const [open, setOpen] = useState(false);

  const selected = members.find((m) => m.id === value);
  const displayValue =
    value === "unassigned"
      ? "Unassigned"
      : selected
        ? `${selected.fullName} — ${selected.email}`
        : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal truncate"
        >
          <span className="truncate text-left">
            {value ? displayValue : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or email..." />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              {includeUnassigned && (
                <CommandItem
                  value="unassigned"
                  onSelect={() => {
                    onValueChange("unassigned");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "unassigned" ? "opacity-100" : "opacity-0",
                    )}
                  />
                  Unassigned
                </CommandItem>
              )}
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.fullName} ${m.email}`}
                  onSelect={() => {
                    onValueChange(m.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === m.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MemberCombobox;
