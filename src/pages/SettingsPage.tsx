import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  Upload,
  Download,
  RefreshCw,
  Globe,
  User,
  Shield,
} from "lucide-react";

const initialControls = [
  {
    id: "MCS01",
    domain: "Governance & Compliance",
    name: "Code of Business Conduct & Speak-up Culture",
    risk: "Corruption and Bribery, Money Laundering",
    frequency: "Monthly",
    owner: "Omoyemi Tuga",
  },
  {
    id: "MCS02",
    domain: "Governance & Compliance",
    name: "Fair Competition Compliance",
    risk: "Infringement of Fair Competition regulations",
    frequency: "Annual",
    owner: "Mary Waititu",
  },
  {
    id: "MCS03",
    domain: "Governance & Compliance",
    name: "Related Party Transactions & COI",
    risk: "Poor tone at the top",
    frequency: "Monthly",
    owner: "Mary Waititu",
  },
  {
    id: "MCS04",
    domain: "Governance & Compliance",
    name: "Board of Directors Secretarial Requirements",
    risk: "Lack of Board oversight",
    frequency: "Monthly",
    owner: "Mary Waititu",
  },
  {
    id: "MCS05",
    domain: "Governance & Compliance",
    name: "Health, Safety & Environment",
    risk: "Health & Safety incidents",
    frequency: "Annual",
    owner: "Omoyemi Tuga",
  },
  {
    id: "MCS06",
    domain: "Governance & Compliance",
    name: "Risk Assessment",
    risk: "Poor tone at the top",
    frequency: "Annual",
    owner: "Oluwaseun Oyedepo",
  },
  {
    id: "MCS07",
    domain: "Governance & Compliance",
    name: "Security Risk Mitigation",
    risk: "Assault on person, theft",
    frequency: "Annual",
    owner: "Olamide Ayo-Ogunlade",
  },
  {
    id: "MCS08",
    domain: "Governance & Compliance",
    name: "Group Insurance Management",
    risk: "Lack of insurance coverage",
    frequency: "Annual",
    owner: "Victory Olumuyiwa",
  },
  {
    id: "MCS09",
    domain: "Governance & Compliance",
    name: "Business Resilience System",
    risk: "Business disruption",
    frequency: "Annual",
    owner: "Oluwaseun Oyedepo",
  },
  {
    id: "MCS10",
    domain: "Governance & Compliance",
    name: "Remediation of MCS Deficiencies",
    risk: "Poor tone at the top",
    frequency: "Annual",
    owner: "Oluwaseun Oyedepo",
  },
  {
    id: "MCS11",
    domain: "Governance & Compliance",
    name: "Personal Data Protection (GDPR)",
    risk: "Data leakage, GDPR non-compliance",
    frequency: "Monthly",
    owner: "Olamide Ayo-Ogunlade",
  },
  {
    id: "MCS12",
    domain: "Governance & Compliance",
    name: "Segregation of Duties & User Access Review",
    risk: "Unauthorized access",
    frequency: "Annual",
    owner: "Theophilus Okolie",
  },
  {
    id: "MCS13",
    domain: "Governance & Compliance",
    name: "Delegation of Authorities & Approval Workflows",
    risk: "Unauthorised transactions",
    frequency: "Annual",
    owner: "Ramakant Patil",
  },
  {
    id: "MCS14",
    domain: "Legal",
    name: "Litigation Disputes",
    risk: "Unmanaged legal exposure",
    frequency: "Monthly",
    owner: "Mary Waititu",
  },
  {
    id: "MCS15",
    domain: "Finance",
    name: "Review of Contracts by Finance",
    risk: "Unfavorable contract terms",
    frequency: "As-needed",
    owner: "Finance Controller",
  },
  {
    id: "MCS16",
    domain: "Operations",
    name: "Management of Titles & Permits",
    risk: "Operating without valid permits",
    frequency: "As-needed",
    owner: "Legal Officer",
  },
];

const initialCountries = [
  {
    id: 1,
    code: "NG",
    name: "Nigeria",
    region: "West Africa",
    entities: 3,
    status: "Active",
  },
  {
    id: 2,
    code: "KE",
    name: "Kenya",
    region: "East Africa",
    entities: 2,
    status: "Active",
  },
  {
    id: 3,
    code: "GH",
    name: "Ghana",
    region: "West Africa",
    entities: 1,
    status: "Active",
  },
  {
    id: 4,
    code: "UG",
    name: "Uganda",
    region: "East Africa",
    entities: 1,
    status: "Active",
  },
  {
    id: 5,
    code: "TZ",
    name: "Tanzania",
    region: "East Africa",
    entities: 1,
    status: "Active",
  },
  {
    id: 6,
    code: "ZM",
    name: "Zambia",
    region: "Southern Africa",
    entities: 1,
    status: "Inactive",
  },
  {
    id: 7,
    code: "RW",
    name: "Rwanda",
    region: "East Africa",
    entities: 1,
    status: "Active",
  },
  {
    id: 8,
    code: "ET",
    name: "Ethiopia",
    region: "East Africa",
    entities: 1,
    status: "Active",
  },
];

const initialOwners = [
  {
    id: 1,
    name: "Mary Waititu",
    email: "mary.waititu@sunking.com",
    role: "Compliance Manager",
    controls: 5,
    country: "Kenya",
  },
  {
    id: 2,
    name: "Omoyemi Tuga",
    email: "omoyemi.tuga@sunking.com",
    role: "Risk Officer",
    controls: 2,
    country: "Nigeria",
  },
  {
    id: 3,
    name: "Oluwaseun Oyedepo",
    email: "oluwaseun.oyedepo@sunking.com",
    role: "Internal Auditor",
    controls: 3,
    country: "Nigeria",
  },
  {
    id: 4,
    name: "Olamide Ayo-Ogunlade",
    email: "olamide.ayo@sunking.com",
    role: "Data Protection Officer",
    controls: 2,
    country: "Nigeria",
  },
  {
    id: 5,
    name: "Victory Olumuyiwa",
    email: "victory.olumuyiwa@sunking.com",
    role: "Insurance Manager",
    controls: 1,
    country: "Nigeria",
  },
  {
    id: 6,
    name: "Theophilus Okolie",
    email: "theo.okolie@sunking.com",
    role: "IT Security Lead",
    controls: 1,
    country: "Nigeria",
  },
  {
    id: 7,
    name: "Ramakant Patil",
    email: "ramakant.patil@sunking.com",
    role: "Finance Controller",
    controls: 1,
    country: "India",
  },
  {
    id: 8,
    name: "Finance Controller",
    email: "finance@sunking.com",
    role: "Finance",
    controls: 1,
    country: "Nigeria",
  },
];

const domainColors: Record<string, string> = {
  "Governance & Compliance": "bg-[#d6eaf8] text-[#2980b9]",
  Legal: "bg-[#fef9e0] text-[#b7950b]",
  Finance: "bg-[#d5f5e3] text-[#1e8449]",
  Operations: "bg-[#fde8d8] text-[#ca6f1e]",
};

const frequencyColors: Record<string, string> = {
  Monthly: "text-gray-700",
  Annual: "text-gray-700",
  "As-needed": "text-gray-500 italic",
};

type Tab = "controls" | "countries" | "owners" | "data";

// Modal component
const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded shadow-xl w-full max-w-lg mx-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("controls");
  const [controls, setControls] = useState(initialControls);
  const [countries, setCountries] = useState(initialCountries);
  const [owners, setOwners] = useState(initialOwners);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);

  // Control modal state
  const [showControlModal, setShowControlModal] = useState(false);
  const [editingControl, setEditingControl] = useState<
    (typeof initialControls)[0] | null
  >(null);
  const [controlForm, setControlForm] = useState({
    id: "",
    domain: "Governance & Compliance",
    name: "",
    risk: "",
    frequency: "Monthly",
    owner: "",
  });

  // Country modal state
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<
    (typeof initialCountries)[0] | null
  >(null);
  const [countryForm, setCountryForm] = useState({
    code: "",
    name: "",
    region: "",
    entities: 1,
    status: "Active",
  });

  // Owner modal state
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<
    (typeof initialOwners)[0] | null
  >(null);
  const [ownerForm, setOwnerForm] = useState({
    name: "",
    email: "",
    role: "",
    controls: 0,
    country: "",
  });

  const domains = [
    "All Domains",
    ...Array.from(new Set(controls.map((c) => c.domain))),
  ];

  const filteredControls = controls.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase());
    const matchDomain =
      domainFilter === "All Domains" || c.domain === domainFilter;
    return matchSearch && matchDomain;
  });

  // Control actions
  const openAddControl = () => {
    setEditingControl(null);
    setControlForm({
      id: "",
      domain: "Governance & Compliance",
      name: "",
      risk: "",
      frequency: "Monthly",
      owner: "",
    });
    setShowControlModal(true);
  };
  const openEditControl = (c: (typeof initialControls)[0]) => {
    setEditingControl(c);
    setControlForm({ ...c });
    setShowControlModal(true);
  };
  const saveControl = () => {
    if (!controlForm.name || !controlForm.id) return;
    if (editingControl) {
      setControls((cs) =>
        cs.map((c) => (c.id === editingControl.id ? { ...controlForm } : c))
      );
    } else {
      setControls((cs) => [...cs, { ...controlForm }]);
    }
    setShowControlModal(false);
  };
  const deleteControl = (id: string) =>
    setControls((cs) => cs.filter((c) => c.id !== id));

  // Country actions
  const openAddCountry = () => {
    setEditingCountry(null);
    setCountryForm({
      code: "",
      name: "",
      region: "",
      entities: 1,
      status: "Active",
    });
    setShowCountryModal(true);
  };
  const openEditCountry = (c: (typeof initialCountries)[0]) => {
    setEditingCountry(c);
    setCountryForm({
      code: c.code,
      name: c.name,
      region: c.region,
      entities: c.entities,
      status: c.status,
    });
    setShowCountryModal(true);
  };
  const saveCountry = () => {
    if (!countryForm.name) return;
    if (editingCountry) {
      setCountries((cs) =>
        cs.map((c) =>
          c.id === editingCountry.id ? { ...c, ...countryForm } : c
        )
      );
    } else {
      setCountries((cs) => [...cs, { id: Date.now(), ...countryForm }]);
    }
    setShowCountryModal(false);
  };
  const deleteCountry = (id: number) =>
    setCountries((cs) => cs.filter((c) => c.id !== id));

  // Owner actions
  const openAddOwner = () => {
    setEditingOwner(null);
    setOwnerForm({ name: "", email: "", role: "", controls: 0, country: "" });
    setShowOwnerModal(true);
  };
  const openEditOwner = (o: (typeof initialOwners)[0]) => {
    setEditingOwner(o);
    setOwnerForm({
      name: o.name,
      email: o.email,
      role: o.role,
      controls: o.controls,
      country: o.country,
    });
    setShowOwnerModal(true);
  };
  const saveOwner = () => {
    if (!ownerForm.name) return;
    if (editingOwner) {
      setOwners((os) =>
        os.map((o) => (o.id === editingOwner.id ? { ...o, ...ownerForm } : o))
      );
    } else {
      setOwners((os) => [...os, { id: Date.now(), ...ownerForm }]);
    }
    setShowOwnerModal(false);
  };
  const deleteOwner = (id: number) =>
    setOwners((os) => os.filter((o) => o.id !== id));

  const tabs: { key: Tab; label: string }[] = [
    { key: "controls", label: "MCS Controls" },
    { key: "countries", label: "Countries" },
    { key: "owners", label: "Process Owners" },
    { key: "data", label: "Data Management" },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Modals */}
      {showControlModal && (
        <Modal
          title={editingControl ? "Edit Control" : "Add New Control"}
          onClose={() => setShowControlModal(false)}
        >
          <div className="space-y-3">
            {[
              { label: "Control ID", key: "id" },
              { label: "Control Name", key: "name" },
              { label: "Risk", key: "risk" },
              { label: "Owner", key: "owner" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {label}
                </label>
                <input
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-[#4a9fd4]"
                  value={(controlForm as any)[key]}
                  onChange={(e) =>
                    setControlForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Domain</label>
              <select
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-[#4a9fd4]"
                value={controlForm.domain}
                onChange={(e) =>
                  setControlForm((f) => ({ ...f, domain: e.target.value }))
                }
              >
                {[
                  "Governance & Compliance",
                  "Legal",
                  "Finance",
                  "Operations",
                ].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Frequency
              </label>
              <select
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-[#4a9fd4]"
                value={controlForm.frequency}
                onChange={(e) =>
                  setControlForm((f) => ({ ...f, frequency: e.target.value }))
                }
              >
                {["Monthly", "Annual", "As-needed"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowControlModal(false)}
                className="px-4 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveControl}
                className="px-4 py-1.5 text-sm bg-[#4a9fd4] text-white rounded hover:bg-[#3a8fc4]"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showCountryModal && (
        <Modal
          title={editingCountry ? "Edit Country" : "Add Country"}
          onClose={() => setShowCountryModal(false)}
        >
          <div className="space-y-3">
            {[
              { label: "Country Code", key: "code" },
              { label: "Country Name", key: "name" },
              { label: "Region", key: "region" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {label}
                </label>
                <input
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-[#4a9fd4]"
                  value={(countryForm as any)[key]}
                  onChange={(e) =>
                    setCountryForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm outline-none"
                value={countryForm.status}
                onChange={(e) =>
                  setCountryForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCountryModal(false)}
                className="px-4 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCountry}
                className="px-4 py-1.5 text-sm bg-[#4a9fd4] text-white rounded hover:bg-[#3a8fc4]"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showOwnerModal && (
        <Modal
          title={editingOwner ? "Edit Owner" : "Add Process Owner"}
          onClose={() => setShowOwnerModal(false)}
        >
          <div className="space-y-3">
            {[
              { label: "Full Name", key: "name" },
              { label: "Email", key: "email" },
              { label: "Role", key: "role" },
              { label: "Country", key: "country" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {label}
                </label>
                <input
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-[#4a9fd4]"
                  value={(ownerForm as any)[key]}
                  onChange={(e) =>
                    setOwnerForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOwnerModal(false)}
                className="px-4 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveOwner}
                className="px-4 py-1.5 text-sm bg-[#4a9fd4] text-white rounded hover:bg-[#3a8fc4]"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      <h1 className="text-xl font-bold text-gray-800 mb-4">
        System Settings & Configuration
      </h1>

      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "bg-[#f5c800] text-gray-900 border-[#f5c800]"
                : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MCS Controls Tab */}
      {activeTab === "controls" && (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Manage MCS Controls
              </h2>
              <p className="text-xs text-gray-500">
                Add, edit, or remove Minimum Control Standards
              </p>
            </div>
            <button
              onClick={openAddControl}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4a9fd4] border border-[#4a9fd4] rounded hover:bg-[#eaf4fb] transition-colors"
            >
              <Plus size={12} /> Add New Control
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search controls..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:border-[#4a9fd4]"
              />
            </div>
            <div className="relative ml-auto">
              <button
                onClick={() => setShowDomainDropdown((d) => !d)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded bg-white min-w-[140px] justify-between"
              >
                <span>{domainFilter}</span>
                <ChevronDown size={12} />
              </button>
              {showDomainDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[180px]">
                  {domains.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDomainFilter(d);
                        setShowDomainDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
                        domainFilter === d
                          ? "font-semibold text-[#4a9fd4]"
                          : "text-gray-700"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#fef9e0]">
                  {[
                    "Control ID",
                    "Domain",
                    "Control Name",
                    "Risk",
                    "Frequency",
                    "Owner",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredControls.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    } hover:bg-blue-50/20`}
                  >
                    <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          domainColors[c.domain] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.domain}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-800 max-w-[200px]">
                      {c.name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 max-w-[160px]">
                      {c.risk}
                    </td>
                    <td
                      className={`px-3 py-2.5 ${
                        frequencyColors[c.frequency] || "text-gray-700"
                      }`}
                    >
                      {c.frequency}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                      {c.owner}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openEditControl(c)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#4a9fd4] text-white rounded text-[10px] hover:bg-[#3a8fc4] w-fit"
                        >
                          <Pencil size={9} /> Edit
                        </button>
                        <button
                          onClick={() => deleteControl(c.id)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#e74c3c] text-white rounded text-[10px] hover:bg-[#c0392b] w-fit"
                        >
                          <Trash2 size={9} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Countries Tab */}
      {activeTab === "countries" && (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Manage Countries
              </h2>
              <p className="text-xs text-gray-500">
                Configure countries and regional entities
              </p>
            </div>
            <button
              onClick={openAddCountry}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4a9fd4] border border-[#4a9fd4] rounded hover:bg-[#eaf4fb]"
            >
              <Plus size={12} /> Add Country
            </button>
          </div>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#fef9e0]">
                  {[
                    "Code",
                    "Country",
                    "Region",
                    "Entities",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countries.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    } hover:bg-blue-50/20`}
                  >
                    <td className="px-3 py-2.5 font-bold text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Globe size={12} className="text-[#4a9fd4]" />
                        {c.code}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{c.region}</td>
                    <td className="px-3 py-2.5 text-gray-700">{c.entities}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          c.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCountry(c)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#4a9fd4] text-white rounded text-[10px] hover:bg-[#3a8fc4]"
                        >
                          <Pencil size={9} /> Edit
                        </button>
                        <button
                          onClick={() => deleteCountry(c.id)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#e74c3c] text-white rounded text-[10px] hover:bg-[#c0392b]"
                        >
                          <Trash2 size={9} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Process Owners Tab */}
      {activeTab === "owners" && (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Process Owners
              </h2>
              <p className="text-xs text-gray-500">
                Assign and manage control owners across the organisation
              </p>
            </div>
            <button
              onClick={openAddOwner}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4a9fd4] border border-[#4a9fd4] rounded hover:bg-[#eaf4fb]"
            >
              <Plus size={12} /> Add Owner
            </button>
          </div>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#fef9e0]">
                  {[
                    "Owner",
                    "Email",
                    "Role",
                    "Controls Assigned",
                    "Country",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {owners.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    } hover:bg-blue-50/20`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#d6eaf8] flex items-center justify-center flex-shrink-0">
                          <User size={11} className="text-[#4a9fd4]" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {o.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{o.email}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 bg-[#d6eaf8] text-[#2980b9] rounded text-[10px] font-medium">
                        {o.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">{o.controls}</td>
                    <td className="px-3 py-2.5 text-gray-500">{o.country}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditOwner(o)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#4a9fd4] text-white rounded text-[10px] hover:bg-[#3a8fc4]"
                        >
                          <Pencil size={9} /> Edit
                        </button>
                        <button
                          onClick={() => deleteOwner(o.id)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#e74c3c] text-white rounded text-[10px] hover:bg-[#c0392b]"
                        >
                          <Trash2 size={9} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === "data" && (
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-800">
              Data Management
            </h2>
            <p className="text-xs text-gray-500">
              Import, export, and manage system data
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: <Upload size={20} className="text-[#4a9fd4]" />,
                title: "Import Controls",
                desc: "Upload a CSV or Excel file to bulk import MCS controls into the system.",
                action: "Import File",
                color: "border-[#d6eaf8]",
              },
              {
                icon: <Download size={20} className="text-green-600" />,
                title: "Export Data",
                desc: "Download all controls, test results, and audit logs as a spreadsheet.",
                action: "Export All",
                color: "border-green-100",
              },
              {
                icon: <RefreshCw size={20} className="text-orange-500" />,
                title: "Reset to Defaults",
                desc: "Clear all custom configurations and restore factory default settings.",
                action: "Reset",
                color: "border-orange-100",
              },
              {
                icon: <Shield size={20} className="text-purple-500" />,
                title: "Backup Data",
                desc: "Create a full backup snapshot of all system data and configurations.",
                action: "Create Backup",
                color: "border-purple-100",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`border ${item.color} rounded p-4 bg-white`}
              >
                <div className="mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-800 text-sm mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 mb-3">{item.desc}</div>
                <button className="px-3 py-1.5 text-xs font-medium text-[#4a9fd4] border border-[#4a9fd4] rounded hover:bg-[#eaf4fb]">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 border border-gray-200 rounded p-4">
            <div className="font-semibold text-sm text-gray-800 mb-1">
              System Information
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-gray-600 mt-2">
              {[
                ["Total Controls", controls.length],
                [
                  "Active Countries",
                  countries.filter((c) => c.status === "Active").length,
                ],
                ["Process Owners", owners.length],
                ["Last Backup", "Never"],
                ["Database Version", "1.0.0"],
                ["Schema Updated", "2026-01-15"],
              ].map(([label, val]) => (
                <div
                  key={label as string}
                  className="flex justify-between border-b border-gray-100 pb-1"
                >
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
