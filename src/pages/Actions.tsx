import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const actions = [
  {
    id: "ACT-1774107567141",
    issue: "ISS-1774107285530",
    description:
      "Ensure inventory in locations 2 and 3 is carried properly. Revaluation to be done using FIFO.",
    owner: "@yomi",
    due: "31/03/2026",
    progress: 70,
    status: "In Progress",
    update: "21/03/2026",
  },
  {
    id: "ACT-1774194199463",
    issue: "ISS-1774193914248",
    description: "Action closed",
    owner: "@fongu",
    due: "31/03/2026",
    progress: 100,
    status: "Completed",
    update: "22/03/2026",
  },
];

const getStatus = (s) => {
  if (s === "Completed") return "bg-green-100 text-green-700";
  if (s === "In Progress") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
};

const getRAG = (progress) => {
  if (progress === 100) return "bg-green-500";
  if (progress >= 50) return "bg-yellow-400";
  return "bg-red-500";
};

const Actions = () => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Action Tracker</h1>

        <div className="flex gap-2">
          <Button className="bg-[#f9d75c] text-black">
            <Plus className="w-4 h-4 mr-1" />
            Add Action
          </Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        {/* SEARCH */}
        <input
          placeholder="Search actions..."
          className="w-full border rounded-md px-3 py-2 text-sm bg-white"
        />

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#f9d75c] text-left">
              <tr>
                <th className="p-2">Action ID</th>
                <th>Issue ID</th>
                <th className="min-w-[300px]">Action Description</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Status</th>
                <th>RAG</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50 h-12">
                  <td className="px-2 py-2 font-medium w-[140px]">{a.id}</td>
                  <td className="px-2 py-2 w-[140px]">{a.issue}</td>

                  <td className="px-2 py-2 min-w-[320px] text-xs leading-snug">
                    {a.description}
                  </td>

                  <td className="px-2 py-2 w-[100px]">{a.owner}</td>
                  <td className="px-2 py-2 w-[110px]">{a.due}</td>

                  {/* PROGRESS BAR */}
                  <td className="px-2 py-2 w-[140px]">
                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          a.progress === 100 ? "bg-green-500" : "bg-[#f9d75c]"
                        }`}
                        style={{ width: `${a.progress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium">
                        {a.progress}%
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-2 py-2 w-[120px]">
                    <span
                      className={`px-2 py-[2px] rounded-full text-[10px] font-medium ${
                        a.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>

                  {/* RAG */}
                  <td className="px-2 py-2 w-[60px] text-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mx-auto ${
                        a.progress === 100 ? "bg-green-500" : "bg-yellow-400"
                      }`}
                    />
                  </td>

                  <td className="px-2 py-2 w-[110px]">{a.update}</td>

                  {/* ACTION */}
                  <td className="px-2 py-2 w-[80px]">
                    <button className="text-[10px] px-2 py-[2px] border rounded hover:bg-gray-100">
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

export default Actions;
