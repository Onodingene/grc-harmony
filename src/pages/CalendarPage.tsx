import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCountryStore } from "@/lib/countryStore";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────

interface CalendarControl {
  controlId: string;
  name: string;
  frequency: string;
}

interface CalendarMonth {
  month: string;
  monthNum: number;
  year: number;
  period: string;
  totalControls: number;
  controls: CalendarControl[];
}

interface CalendarData {
  financialYearStart: string;
  year: number;
  calendar: CalendarMonth[];
}

// ── Helpers ───────────────────────────────────────────────────────────────

// API returns lowercase: "monthly", "quarterly", "semi_annually", "annual", "as_needed"
const frequencyColors: Record<string, string> = {
  monthly: "bg-blue-50 text-blue-700 border-blue-100",
  quarterly: "bg-violet-50 text-violet-700 border-violet-100",
  semi_annually: "bg-amber-50 text-amber-700 border-amber-100",
  annual: "bg-emerald-50 text-emerald-700 border-emerald-100",
  as_needed: "bg-gray-50 text-gray-600 border-gray-100",
};

const frequencyLabel: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annually: "Semi-Annually",
  annual: "Annual",
  as_needed: "As Needed",
};

const VISIBLE = 5;

// ── MonthCard ─────────────────────────────────────────────────────────────

const MonthCard = ({ data }: { data: CalendarMonth }) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const controls = data.controls;
  const maxScroll = Math.max(0, controls.length - VISIBLE);
  const visibleControls = controls.slice(scrollIndex, scrollIndex + VISIBLE);

  const thumbPercent = maxScroll > 0 ? scrollIndex / maxScroll : 0;
  const trackHeight = 56;
  const thumbHeight = 16;
  const thumbTop = thumbPercent * (trackHeight - thumbHeight);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-semibold text-lg text-gray-900">
            {data.month}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {controls.length} control{controls.length !== 1 ? "s" : ""}{" "}
            scheduled
          </div>
        </div>
        <div className="text-xs font-mono px-3 py-1 bg-gray-100 rounded-full text-gray-600">
          {data.period}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-2">
          {visibleControls.length > 0 ? (
            visibleControls.map((ctrl) => (
              <div
                key={ctrl.controlId}
                className={`text-sm px-4 py-3 rounded-xl border flex justify-between items-center ${
                  frequencyColors[ctrl.frequency] ??
                  "bg-gray-50 text-gray-600 border-gray-100"
                }`}
              >
                <span className="font-medium">{ctrl.controlId}</span>
                <span className="text-xs opacity-75 truncate max-w-[130px]">
                  {ctrl.name}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 py-12 text-center border border-dashed border-gray-200 rounded-xl">
              No controls scheduled this month
            </div>
          )}
        </div>

        {/* Scroll controls */}
        {controls.length > VISIBLE && (
          <div
            className="flex flex-col items-center pt-1"
            style={{ width: 20 }}
          >
            <button
              onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
              disabled={scrollIndex === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
            >
              <ChevronUp size={16} />
            </button>
            <div
              className="relative bg-gray-200 rounded-full my-2 flex-shrink-0"
              style={{ width: 6, height: trackHeight }}
            >
              <div
                className="absolute bg-gray-400 rounded-full transition-all"
                style={{ width: 6, height: thumbHeight, top: thumbTop }}
              />
            </div>
            <button
              onClick={() => setScrollIndex((i) => Math.min(maxScroll, i + 1))}
              disabled={scrollIndex >= maxScroll}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── CalendarPage ──────────────────────────────────────────────────────────

const CalendarPage = () => {
  const { toast } = useToast();
  const { selectedCountry } = useCountryStore();

  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    const countryId = selectedCountry?.id ?? "all";
    apiFetch<CalendarData>(`/calendar?country_id=${countryId}&year=${year}`)
      .then((res) => {
        if (res.data) setCalendarData(res.data);
        if (res.error)
          toast({
            title: "Error loading calendar",
            description: res.error,
            variant: "destructive",
          });
      })
      .finally(() => setLoading(false));
  }, [selectedCountry?.id, year]);
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Annual Audit Calendar
            </h1>
            <p className="text-gray-500 mt-1">
              Controls scheduled for testing based on their audit frequency
              {calendarData && (
                <span className="ml-2 text-xs text-gray-400">
                  — FY starts in {calendarData.financialYearStart}
                </span>
              )}
            </p>
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
            >
              ‹
            </button>
            <span className="text-sm font-medium w-12 text-center">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
            >
              ›
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 inline-flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-50 border border-blue-100" />
            <span className="font-medium text-gray-700">Monthly</span>
            <span className="text-gray-500">— Every month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-violet-50 border border-violet-100" />
            <span className="font-medium text-gray-700">Quarterly</span>
            <span className="text-gray-500">— Every 3 months</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-50 border border-amber-100" />
            <span className="font-medium text-gray-700">Semi-Annually</span>
            <span className="text-gray-500">— Every 6 months</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-100" />
            <span className="font-medium text-gray-700">Annual</span>
            <span className="text-gray-500">— FY start month only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 border border-gray-100" />
            <span className="font-medium text-gray-700">As Needed</span>
            <span className="text-gray-500">— Not auto-scheduled</span>
          </div>
        </div>
      </div>

      {!loading && !calendarData && (
        <div className="text-center py-24 text-gray-400">
          No controls scheduled for {year}.
        </div>
      )}

      {!loading && calendarData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {calendarData.calendar.map((m) => (
            <MonthCard key={m.period} data={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
