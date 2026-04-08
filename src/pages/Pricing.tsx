import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, ArrowLeft } from "lucide-react";

const MUSTARD = "#F5C518";
const MUSTARD_DARK = "#D4A900";
const MUSTARD_LIGHT = "#FDF6D3";

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "14 days",
    description: "Perfect for evaluating the platform.",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlight: false,
    features: [
      "Up to 5 active users",
      "MCS Controls Management",
      "Basic Testing Module",
      "Issue Tracking",
      "CSV Export",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: "$49",
    period: "/ month",
    description: "For small teams getting started with GRC.",
    cta: "Get Started",
    ctaLink: "/signup",
    highlight: false,
    features: [
      "Up to 10 active users",
      "MCS Controls Management",
      "Basic Testing Module",
      "Issue Tracking",
      "CSV Export",
      "Email Support",
    ],
  },
  {
    name: "Growth",
    price: "$149",
    period: "/ month",
    description: "For production compliance programs with the power to scale.",
    cta: "Get Started",
    ctaLink: "/signup",
    highlight: true,
    features: [
      "Up to 50 active users",
      "Everything in Starter",
      "ICOFR Testing Workflows",
      "Monthly Reporting",
      "Audit Trail",
      "Priority Email Support & SLAs",
      "Daily Backups (7-day retention)",
    ],
  },
  {
    name: "Scale",
    price: "$399",
    period: "/ month",
    description: "For large-scale organizations running enterprise workloads.",
    cta: "Get Started",
    ctaLink: "/signup",
    highlight: false,
    features: [
      "Up to 200 active users",
      "Everything in Growth",
      "Multi-entity Support",
      "Risk Heat Maps & Analytics",
      "API Access",
      "Dedicated Account Manager",
      "SSO Integration",
      "Custom Security Questionnaires",
    ],
  },
];

const comparisonFeatures = [
  { name: "Active Users", free: "5", starter: "10", growth: "50", scale: "200" },
  { name: "Controls Management", free: true, starter: true, growth: true, scale: true },
  { name: "Testing Module", free: "Basic", starter: "Basic", growth: "Full", scale: "Full" },
  { name: "Issue Tracking", free: true, starter: true, growth: true, scale: true },
  { name: "CSV Export", free: true, starter: true, growth: true, scale: true },
  { name: "ICOFR Workflows", free: false, starter: false, growth: true, scale: true },
  { name: "Monthly Reporting", free: false, starter: false, growth: true, scale: true },
  { name: "Audit Trail", free: false, starter: false, growth: true, scale: true },
  { name: "Multi-entity Support", free: false, starter: false, growth: false, scale: true },
  { name: "Risk Heat Maps", free: false, starter: false, growth: false, scale: true },
  { name: "API Access", free: false, starter: false, growth: false, scale: true },
  { name: "SSO Integration", free: false, starter: false, growth: false, scale: true },
  { name: "Support", free: "Community", starter: "Email", growth: "Priority", scale: "Dedicated AM" },
  { name: "Backups", free: false, starter: false, growth: "Daily (7d)", scale: "Daily (14d)" },
];

const faqs = [
  { q: "How does the 14-day free trial work?", a: "Sign up and get full access to the platform for 14 days with up to 5 users. No credit card required. At the end of the trial, choose a paid plan to continue." },
  { q: "Can I upgrade or downgrade my plan?", a: "You can upgrade at any time. Your new plan will take effect immediately. Downgrades are not available mid-cycle — cancel your current subscription and resubscribe at the lower tier." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards through Paystack. Bank transfers are available for annual enterprise plans." },
  { q: "Is there a discount for annual billing?", a: "Yes — contact our sales team for annual pricing, which includes a discount of up to 20%." },
];

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0a0a0a", color: "#fff" }}>
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: MUSTARD }}>
              <span className="text-black text-xs font-black">G</span>
            </div>
            <span className="text-base font-bold text-white tracking-tight">GRC Control Tool</span>
          </Link>
          <div className="flex gap-3">
            <Link to="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button className="text-black font-semibold text-sm px-5" style={{ background: MUSTARD }}>Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="text-center pt-16 pb-12 px-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Predictable pricing,{" "}
          <span style={{ color: MUSTARD }}>designed to scale</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm">
          Start with a 14-day free trial, collaborate with your team, then scale to hundreds of users.
        </p>
      </section>

      {/* Plan Cards */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col transition-all ${
                plan.highlight
                  ? "border-yellow-500/50 bg-white/[0.04] shadow-lg shadow-yellow-500/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: MUSTARD }}>
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{plan.description}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-gray-400 ml-1">{plan.period}</span>
              </div>
              <Link to={plan.ctaLink} className="mb-5">
                <Button
                  className={`w-full font-semibold text-sm h-10 ${
                    plan.highlight ? "text-black" : "text-black"
                  }`}
                  style={{ background: plan.highlight ? MUSTARD : "#fff" }}
                >
                  {plan.cta}
                </Button>
              </Link>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: MUSTARD_DARK }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Compare Plans Table */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 text-gray-400 font-medium">Feature</th>
                <th className="text-center py-3 px-2 text-gray-400 font-medium">Free Trial</th>
                <th className="text-center py-3 px-2 text-gray-400 font-medium">Starter</th>
                <th className="text-center py-3 px-2 font-medium" style={{ color: MUSTARD }}>Growth</th>
                <th className="text-center py-3 px-2 text-gray-400 font-medium">Scale</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row) => (
                <tr key={row.name} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-gray-300 text-xs">{row.name}</td>
                  {(["free", "starter", "growth", "scale"] as const).map((tier) => {
                    const val = row[tier];
                    return (
                      <td key={tier} className="text-center py-3 px-2">
                        {val === true ? (
                          <CheckCircle className="w-4 h-4 mx-auto" style={{ color: MUSTARD_DARK }} />
                        ) : val === false ? (
                          <X className="w-4 h-4 mx-auto text-gray-600" />
                        ) : (
                          <span className="text-xs text-gray-300">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-8 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-5 py-4 text-sm font-medium text-left hover:bg-white/5 transition-colors"
              >
                {faq.q}
                <span className="text-gray-500 ml-2">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10" style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #1a1500 100%)` }}>
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to get started?</h3>
          <p className="text-gray-400 text-sm mb-6">Start your 14-day free trial. No credit card required.</p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button className="text-black font-bold px-8 text-sm" style={{ background: MUSTARD }}>Start free trial</Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-sm bg-transparent">
                Request a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
