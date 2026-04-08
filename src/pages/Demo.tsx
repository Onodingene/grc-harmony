import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MUSTARD = "#F5C518";
const MUSTARD_DARK = "#D4A900";
const MUSTARD_LIGHT = "#FDF6D3";

const Demo = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.interest) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Demo request submitted!", description: "Our team will reach out within 24 hours." });
  };

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
          <Link to="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — Form */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Talk to our Sales team
            </h1>
            <p className="text-gray-400 text-sm mb-10 max-w-md leading-relaxed">
              Book a demo and set up a trial account to see how GRC Control Tool's scalable features can accelerate your compliance program.
            </p>

            {submitted ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: MUSTARD }} />
                <h2 className="text-xl font-bold mb-2">Thank you!</h2>
                <p className="text-gray-400 text-sm">We've received your request. Our sales team will contact you within 24 hours.</p>
                <Link to="/">
                  <Button className="mt-6 text-black font-semibold" style={{ background: MUSTARD }}>
                    Back to home
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">First Name</Label>
                    <Input
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-yellow-500"
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Last Name</Label>
                    <Input
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-yellow-500"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Company Email</Label>
                  <Input
                    type="email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-yellow-500"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">What are you interested in?</Label>
                  <Select value={form.interest} onValueChange={(v) => setForm({ ...form, interest: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Request a demo</SelectItem>
                      <SelectItem value="enterprise">Enterprise pricing</SelectItem>
                      <SelectItem value="migration">Migration support</SelectItem>
                      <SelectItem value="partnership">Partnership inquiry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full text-black font-bold text-sm h-11" style={{ background: MUSTARD }}>
                  Request a demo
                </Button>
                <p className="text-xs text-gray-500">
                  By submitting this form, I confirm that I have read and understood the{" "}
                  <a href="#" className="underline hover:text-gray-300">Privacy Policy</a>.
                </p>
              </form>
            )}

            <p className="text-xs text-gray-500 mt-6">
              <a href="#" className="underline hover:text-gray-300">Contact support</a> if you need technical help
            </p>
          </div>

          {/* Right — Testimonial & logos */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
              <p className="text-lg font-medium text-white leading-relaxed mb-6 italic">
                "Implementing GRC Control Tool eliminated our spreadsheet chaos and cut audit preparation time by 60%."
              </p>
              <div>
                <p className="font-semibold text-white text-sm">Adebayo Ogunlesi</p>
                <p className="text-gray-400 text-xs">Head of Internal Audit, FinServ Group</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">Trusted by leading organizations</p>
              <div className="flex flex-wrap gap-6 items-center">
                {["FinServ Group", "TechCorp", "AuditPro", "RiskNet"].map((name) => (
                  <div key={name} className="px-4 py-2 rounded-md bg-white/5 border border-white/10">
                    <span className="text-sm font-semibold text-gray-400">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
