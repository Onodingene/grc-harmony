import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const issues = [
  {
    id: "ISS-1774018274767",
    control: "MCS43",
    description: "Exception on test",
    severity: "Medium",
    date: "20/03/2026",
    owner: "Finance Controller",
    due: "19/04/2026",
    age: 4,
    status: "Open",
  },
  {
    id: "ISS-1774107285530",
    control: "MCS34",
    description:
      "Stock count not performed for 2 locations. 500 missing items identified in warehouse. Valuation inaccurate.",
    severity: "Medium",
    date: "21/03/2026",
    owner: "Operations",
    due: "20/04/2026",
    age: 3,
    status: "Open",
  },
  {
    id: "ISS-1774122616450",
    control: "MCS29",
    description:
      "4 vendors registered without Bank letter, TIN, and CAC documentation.",
    severity: "Medium",
    date: "21/03/2026",
    owner: "Finance Controller",
    due: "20/04/2026",
    age: 3,
    status: "Open",
  },
  {
    id: "ISS-1774193914248",
    control: "MCS32",
    description: "Invoice processed without PO attached.",
    severity: "High",
    date: "22/03/2026",
    owner: "Finance Controller",
    due: "21/04/2026",
    age: 2,
    status: "Open",
  },
  {
    id: "ISS-1774194112542",
    control: "MCS32",
    description:
      "Invoices paid were not submitted via IMS and missing PO attachments.",
    severity: "High",
    date: "22/03/2026",
    owner: "@fongu",
    due: "31/03/2026",
    age: 2,
    status: "Open",
  },
  {
    id: "ISS-1774301123456",
    control: "MCS08",
    description: "Insurance policy expired without renewal.",
    severity: "Critical",
    date: "23/03/2026",
    owner: "Admin",
    due: "25/03/2026",
    age: 1,
    status: "Open",
  },
  {
    id: "ISS-1774309987123",
    control: "MCS12",
    description:
      "Segregation of duties conflict detected in finance approvals.",
    severity: "High",
    date: "24/03/2026",
    owner: "Internal Audit",
    due: "30/04/2026",
    age: 1,
    status: "Open",
  },
];

const getSeverity = (s) => {
  if (s === "High") return "bg-red-100 text-red-700";
  if (s === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const Issues = () => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Issues Log</h1>

        <div className="flex gap-2">
          <Button className="bg-[#f9d75c] text-black">
            <Plus className="w-4 h-4 mr-1" />
            Add Issue
          </Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        {/* SEARCH + FILTER */}
        <div className="flex gap-2">
          <input
            placeholder="Search issues..."
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <select className="border px-3 py-2 rounded-md text-sm bg-white">
            <option>All Status</option>
          </select>
          <select className="border px-3 py-2 rounded-md text-sm bg-white">
            <option>All Severity</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#f9d75c] text-left">
              <tr>
                <th className="p-2">Issue ID</th>
                <th>Control ID</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Date Raised</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Age (Days)</th>
                <th>Status</th>
                <th>RAG</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((i) => (
                <tr key={i.id} className="border-b hover:bg-gray-50 h-14">
                  <td className="p-2 font-medium">{i.id}</td>
                  <td>{i.control}</td>
                  <td className="max-w-[250px]">{i.description}</td>

                  {/* SEVERITY */}
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] ${getSeverity(
                        i.severity
                      )}`}
                    >
                      {i.severity}
                    </span>
                  </td>

                  <td>{i.date}</td>
                  <td>{i.owner}</td>
                  <td>{i.due}</td>
                  <td>{i.age}</td>

                  {/* STATUS */}
                  <td>
                    <span className="px-2 py-1 rounded-full text-[10px] bg-red-100 text-red-700">
                      {i.status}
                    </span>
                  </td>

                  {/* RAG DOT */}
                  <td>
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto" />
                  </td>

                  {/* ACTION */}
                  <td>
                    <button className="text-xs px-2 py-1 border rounded-md hover:bg-gray-100">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Issues;
