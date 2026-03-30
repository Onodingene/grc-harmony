import { useState } from "react";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MUSTARD = "#F5C518";
const MUSTARD_LIGHT = "#FDF6D3";

const countries = [
  {
    name: "Nigeria",
    flag: "🇳🇬",
    totalControls: 60,
    tested: 5,
    passRate: 20,
    openIssues: 5,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Omoyemi Tuga", dueDate: "2026-03-15", tester: "@farouk", status: "Pending" },
      { id: "MCS03", name: "Related Party Transactions & COI", owner: "Mary Waititu", dueDate: "2026-03-15", tester: "@farouk", status: "Pass" },
      { id: "MCS04", name: "Board of Directors Secretarial Requirements", owner: "Mary Waititu", dueDate: "2026-03-15", tester: "-", status: "Pending" },
      { id: "MCS11", name: "Personal Data Protection (GDPR)", owner: "Olamide Ayo-Ogunlade", dueDate: "2026-03-15", tester: "-", status: "Pending" },
      { id: "MCS32", name: "Payment Processing", owner: "Finance Controller", dueDate: "2026-03-15", tester: "@farouk", status: "Fail" },
      { id: "MCS34", name: "Physical Stock Count, Reconciliation & Valuation", owner: "Operations", dueDate: "2026-03-15", tester: "@farouk", status: "Exception" },
    ],
  },
  {
    name: "Kenya",
    flag: "🇰🇪",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
      { id: "MCS03", name: "Related Party Transactions & COI", owner: "Finance Controller", dueDate: "2026-03-15", tester: "-", status: "Pending" },
      { id: "MCS11", name: "Personal Data Protection (GDPR)", owner: "Compliance Officer", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Tanzania",
    flag: "🇹🇿",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
      { id: "MCS20", name: "Customer & Inventory Master Data Management", owner: "Finance Controller", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Uganda",
    flag: "🇺🇬",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
      { id: "MCS26", name: "Payroll Processing", owner: "HR Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Ghana",
    flag: "🇬🇭",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Senegal",
    flag: "🇸🇳",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Benin",
    flag: "🇧🇯",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Togo",
    flag: "🇹🇬",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
  {
    name: "Zambia",
    flag: "🇿🇲",
    totalControls: 60,
    tested: 0,
    passRate: 0,
    openIssues: 0,
    overdueActions: 0,
    rag: "red",
    controls: [
      { id: "MCS01", name: "Code of Business Conduct & Speak-up Culture", owner: "Country Manager", dueDate: "2026-03-15", tester: "-", status: "Pending" },
    ],
  },
];

const statusStyle = (status: string) => {
  switch (status) {
    case "Pass": return { background: "#d1fae5", color: "#065f46" };
    case "Fail": return { background: "#fee2e2", color: "#991b1b" };
    case "Exception": return { background: "#fef9c3", color: "#7a5f00" };
    default: return { background: "#f3f4f6", color: "#6b7280" };
  }
};

const RAGDot = ({ rag }: { rag: string }) => (
  <span
    className="w-3 h-3 rounded-full inline-block"
    style={{ background: rag === "green" ? "#22c55e" : rag === "amber" ? MUSTARD : "#ef4444" }}
  />
);

type Country = typeof countries[0];

const CountryDetail = ({ country, onBack }: { country: Country; onBack: () => void }) => {
  const progress = Math.round((country.tested / country.totalControls) * 100);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Consolidated View
      </button>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {country.flag} {country.name} — Test Plan
          </h1>
          <p className="text-sm text-gray-400 mt-1">Monthly Test Plan — March 2026</p>
        </div>
        <button
          className="text-black text-sm font-semibold px-4 py-2 rounded flex items-center gap-2"
          style={{ background: MUSTARD }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Controls", value: country.totalControls, icon: <CheckCircle className="w-4 h-4" style={{ color: MUSTARD }} /> },
          { label: "Tested (MTD)", value: country.tested, icon: <Clock className="w-4 h-4 text-blue-400" /> },
          { label: "Open Issues", value: country.openIssues, icon: <AlertCircle className="w-4 h-4 text-red-400" /> },
          { label: "Overdue Actions", value: country.overdueActions, icon: <AlertCircle className="w-4 h-4 text-orange-400" /> },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm border border-gray-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pass rate */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Monthly Progress</span>
            <span className="text-sm font-bold" style={{ color: MUSTARD }}>{country.passRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${progress}%`, background: MUSTARD }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Controls table */}
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: MUSTARD }}>
                {["Control ID", "Control Name", "Owner", "Due Date", "Assigned Tester", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-black font-semibold text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {country.controls.map((ctrl, i) => (
                <tr key={ctrl.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 font-semibold whitespace-nowrap">{ctrl.id}</td>
                  <td className="px-4 py-3 text-gray-800 max-w-xs">{ctrl.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{ctrl.owner}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{ctrl.dueDate}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{ctrl.tester}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={statusStyle(ctrl.status)}
                    >
                      {ctrl.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-black text-xs font-semibold px-3 py-1 rounded"
                      style={{ background: MUSTARD }}
                    >
                      Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Consolidated = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  if (selectedCountry) {
    return <CountryDetail country={selectedCountry} onBack={() => setSelectedCountry(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌍 Consolidated View — All Sun King Countries</h1>
        <p className="text-sm text-gray-400 mt-1">Click a country to view its detailed test plan and control status.</p>
      </div>

      {/* Country Comparison Matrix */}
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-800">Country Comparison Matrix</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: MUSTARD }}>
                {["Country", "Total Controls", "Tested (MTD)", "Pass Rate", "Open Issues", "Overdue Actions", "Overall RAG", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-black font-semibold text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {countries.map((country, i) => (
                <tr
                  key={country.name}
                  className={`cursor-pointer transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50`}
                  onClick={() => setSelectedCountry(country)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {country.flag} {country.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{country.totalControls}</td>
                  <td className="px-4 py-3 text-gray-600">{country.tested}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={country.passRate > 0
                        ? { background: "#fef9c3", color: "#7a5f00" }
                        : { background: "#fee2e2", color: "#991b1b" }
                      }
                    >
                      {country.passRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{country.openIssues}</td>
                  <td className="px-4 py-3 text-gray-600">{country.overdueActions}</td>
                  <td className="px-4 py-3"><RAGDot rag={country.rag} /></td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: MUSTARD }}>
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Consolidated;