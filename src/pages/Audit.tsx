const auditDomains = [
  {
    name: "Governance & Compliance",
    items: [
      {
        id: "MCS01",
        title: "Code of Business Conduct & Speak-up Culture",
        owner: "Omoyemi Tuga",
        risk: "Corruption, bribery, unethical conduct",
      },
      {
        id: "MCS03",
        title: "Related Party Transactions & COI",
        owner: "Mary Waititu",
        risk: "Conflict of interest, weak governance",
      },
      {
        id: "MCS04",
        title: "Board Secretarial Requirements",
        owner: "Mary Waititu",
        risk: "Lack of board oversight",
      },
    ],
  },
  {
    name: "Finance & Reporting",
    items: [
      {
        id: "MCS43",
        title: "Bank Account Reconciliations",
        owner: "Finance Controller",
        risk: "Financial misstatement",
      },
      {
        id: "MCS29",
        title: "Vendor Onboarding Compliance",
        owner: "Finance Controller",
        risk: "Fraud, invalid vendors",
      },
      {
        id: "MCS12",
        title: "Segregation of Duties",
        owner: "Internal Audit",
        risk: "Unauthorized transactions",
      },
    ],
  },
  {
    name: "Procurement & AP",
    items: [
      {
        id: "MCS32",
        title: "Invoice Processing & PO Matching",
        owner: "Procurement",
        risk: "Payments without approval",
      },
      {
        id: "MCS34",
        title: "Supplier Master Data Management",
        owner: "Procurement",
        risk: "Duplicate or fake suppliers",
      },
    ],
  },
  {
    name: "Inventory & Operations",
    items: [
      {
        id: "MCS08",
        title: "Insurance Coverage Monitoring",
        owner: "Admin",
        risk: "Uninsured operational risks",
      },
      {
        id: "MCS34",
        title: "Stock Count & Valuation",
        owner: "Operations",
        risk: "Inventory misstatement",
      },
    ],
  },
];

const Audit = () => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h1 className="text-lg font-semibold">
        Monthly Audit Program & Checklist
      </h1>

      {/* MAIN CARD */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
        <h2 className="text-sm font-semibold">
          Monthly Audit Procedures by Domain
        </h2>

        {/* DOMAINS */}
        {auditDomains.map((domain) => (
          <div key={domain.name} className="space-y-4">
            {/* DOMAIN TITLE */}
            <h3 className="text-sm font-semibold text-blue-600">
              {domain.name}
            </h3>

            {/* ITEMS */}
            {domain.items.map((a) => (
              <div
                key={a.id}
                className="bg-gray-50 border rounded-md p-4 space-y-2"
              >
                {/* TITLE */}
                <h4 className="text-sm font-semibold">
                  {a.id}: {a.title}
                </h4>

                {/* META */}
                <p className="text-xs text-muted-foreground">
                  Owner: {a.owner} | Frequency: Monthly
                </p>

                {/* RISK */}
                <p className="text-xs">
                  <span className="font-medium">Risk:</span> {a.risk}
                </p>

                {/* STEPS */}
                <div className="text-xs space-y-1">
                  <p className="font-medium">Audit Steps:</p>

                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Verify control design and documentation</li>
                    <li>Test a sample of transactions/items</li>
                    <li>Review and validate supporting evidence</li>
                    <li>Confirm compliance with policy requirements</li>
                    <li>Document findings and exceptions</li>
                  </ol>
                </div>

                {/* OPTIONAL FOOT NOTE */}
                <div className="text-[10px] text-gray-400 pt-1">
                  Last Reviewed: March 2026
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Audit;
