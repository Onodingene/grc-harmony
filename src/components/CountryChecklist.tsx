import { Checkbox } from "@/components/ui/checkbox";

interface CountryOption {
  id: string;
  name: string;
  code: string;
}

interface CountryChecklistProps {
  countries: CountryOption[];
  value: string[];
  onChange: (ids: string[]) => void;
}

// Picks the countries a member works in. None ticked means every country.
const CountryChecklist = ({ countries, value, onChange }: CountryChecklistProps) => {
  const toggle = (id: string, on: boolean) =>
    onChange(on ? [...value, id] : value.filter((v) => v !== id));

  if (countries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No countries yet. Add one under the Countries tab.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {countries.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
              value.includes(c.id)
                ? "border-primary bg-primary/10"
                : "hover:bg-muted"
            }`}
          >
            <Checkbox
              checked={value.includes(c.id)}
              onCheckedChange={(v) => toggle(c.id, v === true)}
            />
            <span className="font-medium">{c.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length === 0
          ? "No country selected — this person will see every country."
          : "They'll only see these countries' controls, results and people."}
      </p>
    </div>
  );
};

export default CountryChecklist;
