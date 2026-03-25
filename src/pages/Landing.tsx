import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Lock, Globe } from "lucide-react";

const features = [
  { icon: Shield, title: "Risk & Control Matrix", desc: "Comprehensive control library with MCS and ICOFR frameworks" },
  { icon: BarChart3, title: "Real-time Dashboards", desc: "CFO-level visibility into control effectiveness and risk exposure" },
  { icon: Lock, title: "Audit & Compliance", desc: "End-to-end audit workflows with evidence management" },
  { icon: Globe, title: "Multi-tenant & Scalable", desc: "Built for regional expansion with multi-organization support" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-foreground text-card">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-primary">GRC Control Tool</h1>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center py-24 px-4">
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          Governance, Risk &<br />
          <span className="text-primary">Compliance</span> Made Simple
        </h2>
        <p className="text-lg text-card/70 mb-10 max-w-2xl mx-auto">
          A scalable SaaS platform for managing controls, testing, audits, and compliance across your organization.
        </p>
        <Link to="/signup">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
            Start Free Trial
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 pb-24">
        {features.map((f) => (
          <div key={f.title} className="bg-card/5 border border-card/10 rounded-lg p-6">
            <f.icon className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-base mb-2">{f.title}</h3>
            <p className="text-sm text-card/60">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Landing;
