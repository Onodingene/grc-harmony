import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getFYStartMonth, MONTH_NAMES } from "@/lib/financial-year";

interface MCSControl {
  controlId: string;
  name: string;
  frequency: "Monthly" | "Quarterly" | "Semi-Annually" | "Annually";
}

// Controls with frequencies
const allControls: MCSControl[] = [
  { controlId: "MCS01", name: "Segregation of Duties", frequency: "Monthly" },
  { controlId: "MCS02", name: "Authorization Limits", frequency: "Monthly" },
  { controlId: "MCS03", name: "Access Rights Review", frequency: "Quarterly" },
  { controlId: "MCS04", name: "Backup Verification", frequency: "Monthly" },
  {
    controlId: "MCS05",
    name: "Vendor Due Diligence",
    frequency: "Semi-Annually",
  },
  {
    controlId: "MCS06",
    name: "Incident Response Test",
    frequency: "Quarterly",
  },
  { controlId: "MCS07", name: "Policy Acknowledgement", frequency: "Annually" },
  { controlId: "MCS08", name: "Insurance Review", frequency: "Annually" },
  { controlId: "MCS09", name: "Physical Security Check", frequency: "Monthly" },
  { controlId: "MCS10", name: "Change Management", frequency: "Quarterly" },
  {
    controlId: "MCS11",
    name: "User Access Provisioning",
    frequency: "Monthly",
  },
  { controlId: "MCS12", name: "SOD Review", frequency: "Quarterly" },
  { controlId: "MCS13", name: "Data Classification", frequency: "Annually" },
  {
    controlId: "MCS14",
    name: "Third Party Risk Assessment",
    frequency: "Semi-Annually",
  },
  {
    controlId: "MCS15",
    name: "Business Continuity Test",
    frequency: "Annually",
  },
];

// Build the 12-month sequence starting from the company's financial year start month.
const buildMonths = (fyStart: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const idx = (fyStart + i) % 12;
    return { name: MONTH_NAMES[idx], index: idx };
  });

// Frequency logic
const shouldAuditInMonth = (
  control: MCSControl,
  monthIndex: number
): boolean => {
  const freq = control.frequency;
  if (freq === "Monthly") return true;
  if (freq === "Quarterly") return monthIndex % 3 === 0;
  if (freq === "Semi-Annually") return monthIndex % 6 === 0;
  if (freq === "Annually") return monthIndex === 0;
  return false;
};

// Softer, calmer colors
const frequencyColors: Record<string, string> = {
  Monthly: "bg-blue-50 text-blue-700 border-blue-100",
  Quarterly: "bg-violet-50 text-violet-700 border-violet-100",
  "Semi-Annually": "bg-amber-50 text-amber-700 border-amber-100",
  Annually: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const VISIBLE = 5;

const MonthCard = ({ month, index }: { month: string; index: number }) => {
  const controlsThisMonth = allControls.filter((c) =>
    shouldAuditInMonth(c, index)
  );

  const [scrollIndex, setScrollIndex] = useState(0);
  const maxScroll = Math.max(0, controlsThisMonth.length - VISIBLE);
  const visibleControls = controlsThisMonth.slice(
    scrollIndex,
    scrollIndex + VISIBLE
  );

  const thumbPercent = maxScroll > 0 ? scrollIndex / maxScroll : 0;
  const trackHeight = 56;
  const thumbHeight = 16;
  const thumbTop = thumbPercent * (trackHeight - thumbHeight);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-semibold text-lg text-gray-900">{month}</div>
          <div className="text-sm text-gray-500 mt-1">
            {controlsThisMonth.length} controls scheduled
          </div>
        </div>
        <div className="text-xs font-mono px-3 py-1 bg-gray-100 rounded-full text-gray-600">
          {month.slice(0, 3)}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-2">
          {visibleControls.length > 0 ? (
            visibleControls.map((ctrl) => (
              <div
                key={ctrl.controlId}
                className={`text-sm px-4 py-3 rounded-xl border flex justify-between items-center ${
                  frequencyColors[ctrl.frequency]
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

        {/* Scroll Controls */}
        {controlsThisMonth.length > VISIBLE && (
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

const CalendarPage = () => {
  const [fyStart, setFyStart] = useState<number>(getFYStartMonth());

  useEffect(() => {
    const handler = () => setFyStart(getFYStartMonth());
    window.addEventListener("fy-start-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("fy-start-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const monthsData = buildMonths(fyStart);

  return (
    <div className="p-6 space-y-8">
      {/* Header + Legend */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Annual Audit Calendar
        </h1>
        <p className="text-gray-500 mt-1">
          Controls scheduled for testing based on their audit frequency.
          Financial year starts in <span className="font-medium text-gray-900">{MONTH_NAMES[fyStart]}</span>.
        </p>

        {/* Soft Legend */}
        <div className="mt-6 inline-flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-50 border border-blue-100"></div>
            <span className="font-medium text-gray-700">Monthly</span>
            <span className="text-gray-500">— Every month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-violet-50 border border-violet-100"></div>
            <span className="font-medium text-gray-700">Quarterly</span>
            <span className="text-gray-500">— Jan, Apr, Jul, Oct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-50 border border-amber-100"></div>
            <span className="font-medium text-gray-700">Semi-Annually</span>
            <span className="text-gray-500">— Jan & Jul</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-100"></div>
            <span className="font-medium text-gray-700">Annually</span>
            <span className="text-gray-500">— January only</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monthsData.map((m) => (
          <MonthCard key={m.name} month={m.name} index={m.index} />
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
