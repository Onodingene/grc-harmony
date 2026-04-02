import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const monthsData = [
  { name: "January", count: 44 },
  { name: "February", count: 29 },
  { name: "March", count: 29 },
  { name: "April", count: 37 },
  { name: "May", count: 29 },
  { name: "June", count: 29 },
  { name: "July", count: 44 },
  { name: "August", count: 29 },
  { name: "September", count: 29 },
  { name: "October", count: 37 },
  { name: "November", count: 29 },
  { name: "December", count: 45 },
];

const allControls = [
  "MCS01",
  "MCS03",
  "MCS04",
  "MCS11",
  "MCS14",
  "MCS02",
  "MCS05",
  "MCS06",
  "MCS07",
  "MCS08",
  "MCS09",
  "MCS10",
  "MCS12",
  "MCS13",
  "MCS15",
];

const getControlsForMonth = (count: number) => {
  const base = ["MCS01", "MCS03", "MCS04", "MCS11", "MCS14"];
  const extra = allControls.slice(5);
  const total = Math.min(count, allControls.length);
  return [...base, ...extra].slice(0, total);
};

const VISIBLE = 5;

const MonthCard = ({ month, count }: { month: string; count: number }) => {
  const controls = getControlsForMonth(count);
  const [scrollIndex, setScrollIndex] = useState(0);
  const maxScroll = Math.max(0, controls.length - VISIBLE);
  const visibleControls = controls.slice(scrollIndex, scrollIndex + VISIBLE);
  const thumbPercent = maxScroll > 0 ? scrollIndex / maxScroll : 0;
  const trackHeight = 56;
  const thumbHeight = 16;
  const thumbTop = thumbPercent * (trackHeight - thumbHeight);

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-3">
      <div className="text-[#4a9fd4] font-semibold text-sm mb-0.5">{month}</div>
      <div className="text-gray-500 text-xs mb-2">{count} controls due</div>
      <div className="flex gap-1.5">
        <div className="flex-1 flex flex-col gap-[3px]">
          {visibleControls.map((ctrl) => (
            <div
              key={ctrl}
              className={`text-xs px-2 py-[3px] rounded-[2px] ${
                ctrl === "MCS14" || ctrl === "MCS15"
                  ? "bg-[#fef9e0] text-gray-700"
                  : "bg-[#d6eaf8] text-gray-700"
              }`}
            >
              {ctrl}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center" style={{ width: 16 }}>
          <button
            onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
            disabled={scrollIndex === 0}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 flex-shrink-0"
          >
            <ChevronUp size={13} />
          </button>

          <div
            className="relative bg-gray-200 rounded-full my-0.5 flex-shrink-0"
            style={{ width: 8, height: trackHeight }}
          >
            <div
              className="absolute bg-gray-400 rounded-full transition-all duration-150"
              style={{
                width: 8,
                height: thumbHeight,
                top: thumbTop,
                left: 0,
              }}
            />
          </div>

          <button
            onClick={() => setScrollIndex((i) => Math.min(maxScroll, i + 1))}
            disabled={scrollIndex >= maxScroll}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 flex-shrink-0"
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarPage = () => (
  <div className="p-6 bg-white min-h-screen">
    <div className="border border-gray-200 rounded-sm bg-white p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Annual Audit Calendar
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        Visual calendar showing which controls are tested each month based on
        their frequency.
      </p>
      <div className="grid grid-cols-4 gap-3">
        {monthsData.map((m) => (
          <MonthCard key={m.name} month={m.name} count={m.count} />
        ))}
      </div>
    </div>
  </div>
);

export default CalendarPage;
