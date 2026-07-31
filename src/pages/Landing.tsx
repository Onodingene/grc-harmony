import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Lock, Globe, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const features = [
  { icon: Shield, title: "Risk & Control Matrix", desc: "Comprehensive control library with MCS and ICOFR frameworks built for enterprise scale." },
  { icon: BarChart3, title: "Real-time Dashboards", desc: "CFO-level visibility into control effectiveness, risk exposure, and compliance status." },
  { icon: Lock, title: "Audit & Compliance", desc: "End-to-end audit workflows with evidence management and automated reporting." },
  { icon: Globe, title: "Multi-tenant & Scalable", desc: "Built for regional expansion with multi-organization support and role-based access." },
];

const useCases = [
  { title: "Internal Controls (ICOFR)", desc: "Design, test, and certify financial reporting controls with full traceability." },
  { title: "Enterprise Risk Management", desc: "Identify, assess, and monitor risks across business units in real time." },
  { title: "Regulatory Compliance", desc: "Map controls to frameworks like ISO 27001, SOX, NDPR, and COSO." },
  { title: "Third-Party Risk", desc: "Assess vendor risk exposure with questionnaires and scoring workflows." },
  { title: "Policy Management", desc: "Maintain a living policy library linked directly to controls and evidence." },
  { title: "Incident Management", desc: "Log, investigate, and resolve control failures with audit-ready records." },
];

const stats = [
  { value: "99.95%", label: "Uptime SLA" },
  { value: "500+", label: "Controls in Library" },
  { value: "12+", label: "Compliance Frameworks" },
  { value: "3x", label: "Faster Audit Cycles" },
];

const MUSTARD = "#F5C518";
const MUSTARD_DARK = "#D4A900";
const MUSTARD_LIGHT = "#FDF6D3";
const MUSTARD_MID = "#FEF0A0";

const Landing = () => {
  return (
    <div className="min-h-screen font-sans" style={{ background: "#ffffff", color: "#1a1a1a" }}>
      {/* Top utility bar — mustard */}
<div
  style={{ background: MUSTARD }}
  className="text-black text-xs py-4 px-4 hidden md:flex justify-end gap-6"
>
  <a href="#" className="hover:underline font-semibold">Documentation</a>
  {/* <Link to="/pricing" className="hover:underline font-semibold">Pricing</Link> */}
  <a href="#" className="hover:underline font-semibold">Support</a>
</div>

{/* Nav — white with logo */}
<nav className=" z-50 bg-white border-b border-gray-200 shadow-sm">
  <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-10">

      {/* Logo */}
    <div className="flex items-center">
  <img 
    src={logo}
    alt="GRC Control Tool Logo"
    className="h-16 w-auto object-contain"
  />
</div>

      {/* Nav Links */}
      <div className="hidden md:flex gap-6 text-sm text-gray-500">
        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
        <a href="#solutions" className="hover:text-gray-900 transition-colors">Solutions</a>
        {/* <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link> */}
        <a href="#" className="hover:text-gray-900 transition-colors">Resources</a>
      </div>

    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-3">
      <Link to="/login">
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          Sign in
        </Button>
      </Link>

      <Link to="/signup">
        <Button
          className="text-black font-semibold text-sm px-5 border-0"
          style={{ background: MUSTARD }}
        >
          Get started free
        </Button>
      </Link>
    </div>

  </div>
</nav>
      {/* Hero — white with very light mustard tint */}
      <section className="relative overflow-hidden border-b border-gray-100" style={{ background: `linear-gradient(135deg, #ffffff 60%, ${MUSTARD_LIGHT} 100%)` }}>
        <div className="relative max-w-7xl mx-auto px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="max-w-2xl flex-1">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-gray-900">
              Governance, Risk &{" "}
              <span style={{ color: MUSTARD_DARK }}>Compliance</span>
              <br />at enterprise scale
            </h2>
            <p className="text-base text-gray-500 mb-8 max-w-xl leading-relaxed">
              A unified platform for managing internal controls, audit workflows, regulatory compliance, and risk — built for CFOs, audit teams, and compliance officers.
            </p>
            {/* <div className="flex flex-wrap gap-4 mb-8">
              <Link to="/signup">
                <Button size="lg" className="text-black font-bold px-8 text-sm border-0 shadow-md" style={{ background: MUSTARD }}>
                  Start free trial
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:border-gray-400 px-8 text-sm bg-white">
                  Request a demo
                </Button>
              </Link>
            </div> */}
            <div className="flex flex-wrap gap-5 text-sm text-gray-400">
              {[ "NDPR & GDPR compliant"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: MUSTARD_DARK }} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Mini app preview mockup */}
          <div className="flex-1 hidden md:block">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Mockup header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2" style={{ background: MUSTARD }}>
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <span className="ml-2 text-xs font-semibold text-black">Monthly Test Plan </span>
              </div>
              {/* Mockup progress */}
              <div className="px-4 py-3 border-b border-gray-100 bg-white">
                <p className="text-xs font-semibold text-gray-600 mb-1">Monthly Progress</p>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: "17%", background: MUSTARD }} />
                </div>
              </div>
              {/* Mockup table rows */}
              <div className="divide-y divide-gray-50">
                {[
                  { id: "MCS01", name: "Code of Business Conduct", status: "Pending" },
                  { id: "MCS03", name: "Related Party Transactions", status: "Pass" },
                  { id: "MCS32", name: "Payment Processing", status: "Fail" },
                  { id: "MCS34", name: "Physical Stock Count", status: "Fail" },
                ].map((row) => (
                  <div key={row.id} className="flex items-center justify-between px-4 py-2.5 text-xs bg-white hover:bg-gray-50 transition-colors">
                    <span className="font-mono font-semibold text-gray-400 w-14">{row.id}</span>
                    <span className="flex-1 text-gray-700">{row.name}</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background:
                          row.status === "Pass" ? "#d1fae5" :
                          row.status === "Fail" ? "#fee2e2" :
                          row.status === "Fail" ? MUSTARD_MID :
                          "#f3f4f6",
                        color:
                          row.status === "Pass" ? "#065f46" :
                          row.status === "Fail" ? "#991b1b" :
                          row.status === "Fail" ? "#7a5f00" :
                          "#6b7280",
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar — mustard */}
      <section style={{ background: MUSTARD }}>
        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-black mb-1">{stat.value}</div>
              <div className="text-sm text-black/60 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features — white */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-20">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUSTARD_DARK }}>Platform Features</p>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything your GRC team needs</h3>
          <p className="text-gray-400 max-w-xl text-sm">Built on industry frameworks, designed for the realities of African and global regulatory environments.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 group cursor-pointer"
              style={{ borderTop: `3px solid ${MUSTARD}` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 24px 0 ${MUSTARD}44`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: MUSTARD_LIGHT }}>
                <f.icon className="w-5 h-5" style={{ color: MUSTARD_DARK }} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: MUSTARD_DARK }}>
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases — light mustard bg */}
      <section id="solutions" style={{ background: MUSTARD_LIGHT }} className="border-y border-yellow-100">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUSTARD_DARK }}>Solutions</p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for every compliance use case</h3>
            <p className="text-gray-400 max-w-xl text-sm">From ICOFR testing to vendor risk, GRC Control Tool covers the full spectrum of governance needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((u) => (
              <div
                key={u.title}
                className="flex gap-4 p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
                onMouseEnter={e => (e.currentTarget.style.borderColor = MUSTARD)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: MUSTARD_DARK }} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">{u.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — mustard */}
      <section style={{ background: MUSTARD }}>
        <div className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">Ready to modernize your GRC program?</h3>
          <p className="text-black/60 mb-8 max-w-xl mx-auto text-sm">Join compliance teams across Africa and beyond who have replaced spreadsheets with a platform built for scale.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              {/* <Button size="lg" className="bg-black hover:bg-gray-900 text-white font-bold px-10 text-sm border-0">
                Start free trial
              </Button> */}
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-black/30 text-black hover:bg-black/10 px-10 text-sm bg-transparent">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — white */}
      <footer className="bg-white border-t border-gray-200 py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {[
            { heading: "Product", links: ["Features", "Changelog", "Roadmap"] },
            { heading: "Solutions", links: ["ICOFR", "Risk Management", "Compliance", "Audit"] },
            { heading: "Resources", links: ["Documentation", "Blog", "Case Studies", "Webinars"] },
            { heading: "Company", links: ["About", "Careers", "Contact", "Privacy Policy"] },
          ].map((col) => (
            <div key={col.heading}>
              <h5 className="text-gray-900 font-semibold text-sm mb-4">{col.heading}</h5>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 text-sm hover:text-gray-900 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: MUSTARD }}>
              <span className="text-black text-xs font-black">G</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">GRC Control Tool</span>
          </div>
          <span className="text-gray-400 text-xs">© {new Date().getFullYear()} GRC control Sunking Limited. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;