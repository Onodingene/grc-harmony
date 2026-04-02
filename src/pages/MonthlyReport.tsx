import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ title, value, borderColor, textColor }) => (
  <div
    className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderColor}`}
  >
    <p className="text-xs text-muted-foreground">{title}</p>
    <h2 className={`text-2xl font-bold ${textColor}`}>{value}</h2>
  </div>
);

const MonthlyReport = () => {
  const domains = [
    { name: "Inventory", total: 1, pass: 0, exceptions: 1, fail: 0 },
    { name: "Procurement & AP", total: 1, pass: 0, exceptions: 1, fail: 0 },
    { name: "Finance & Reporting", total: 1, pass: 0, exceptions: 1, fail: 0 },
    {
      name: "Governance & Compliance",
      total: 1,
      pass: 1,
      exceptions: 0,
      fail: 0,
    },
  ];
  return (
    <Card className="shadow-md">
      <CardContent className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Monthly Test Report</h1>

          <div className="flex gap-2">
            <button className="bg-[#f9d75c] px-3 py-2 rounded-md text-sm font-medium">
              Generate Report
            </button>
            <button className="bg-gray-100 px-3 py-2 rounded-md text-sm">
              Export PDF
            </button>
            <button className="bg-gray-100 px-3 py-2 rounded-md text-sm">
              Export CSV
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value="March 2026"
            className="border rounded-md px-3 py-2 text-sm"
            readOnly
          />
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Current Month</option>
          </select>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            title="TOTAL TESTS"
            value="4"
            borderColor="border-yellow-400"
            textColor="text-black"
          />
          <StatCard
            title="PASS"
            value="1"
            borderColor="border-green-500"
            textColor="text-green-600"
          />
          <StatCard
            title="EXCEPTIONS"
            value="3"
            borderColor="border-yellow-500"
            textColor="text-yellow-600"
          />
          <StatCard
            title="FAIL"
            value="0"
            borderColor="border-red-500"
            textColor="text-red-600"
          />
          <StatCard
            title="PASS RATE"
            value="25%"
            borderColor="border-yellow-400"
            textColor="text-yellow-600"
          />
        </div>

        {/* DOMAIN */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Test Results by Domain</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {domains.map((d) => {
              const passRate = d.total ? (d.pass / d.total) * 100 : 0;

              return (
                <div
                  key={d.name}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <h3 className="font-semibold text-sm mb-2">{d.name}</h3>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tests</span>
                      <span>{d.total}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pass</span>
                      <span className="text-green-600 font-medium">
                        {d.pass}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exceptions</span>
                      <span className="text-yellow-600 font-medium">
                        {d.exceptions}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fail</span>
                      <span className="text-red-600 font-medium">{d.fail}</span>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>Progress</span>
                      <span>{Math.round(passRate)}%</span>
                    </div>

                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          passRate === 100
                            ? "bg-green-500"
                            : passRate > 0
                            ? "bg-yellow-400"
                            : "bg-gray-300"
                        }`}
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED TABLE */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Detailed Test Results</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#f9d75c] text-left">
                <tr>
                  <th className="p-2">Test Date</th>
                  <th>Control ID</th>
                  <th>Control Name</th>
                  <th>Domain</th>
                  <th>Tester</th>
                  <th>Sample Size</th>
                  <th>Exceptions</th>
                  <th>Result</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">21/03/2026</td>
                  <td>MCS34</td>
                  <td>Physical Stock Count</td>
                  <td>Inventory</td>
                  <td>@farouk</td>
                  <td>10</td>
                  <td>3</td>
                  <td className="text-yellow-600">Exception</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ISSUES */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Issues Identified</h2>

          <table className="w-full text-xs">
            <thead className="bg-[#f9d75c] text-left">
              <tr>
                <th className="p-2">Issue ID</th>
                <th>Control ID</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">ISS-1774018274767</td>
                <td>MCS43</td>
                <td>Exception on test</td>
                <td className="text-yellow-600">Medium</td>
                <td className="text-red-600">Open</td>
                <td>Finance Controller</td>
                <td>19/04/2026</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold mb-2">Recommendations</h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs">
            ⚠ Pass rate of 25% is below acceptable threshold.
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs">
            💡 Exceptions noted. Review and document rationale.
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs">
            💡 Open issues require attention.
          </div>
          <div className="bg-green-50 border-l-4 border-green-600 p-3 text-xs">
            ✅ Control coverage needs improvement.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyReport;
