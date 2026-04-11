import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: 49,
    period: "month",
    seats: 10,
    description: "Up to 10 active users",
    downgradeNote: "Downgrades are not available here. Cancel your subscription if you need a smaller tier.",
    features: ["MCS Controls Management", "Basic Testing Module", "Issue Tracking", "CSV Export", "Email Support"],
  },
  {
    name: "Growth",
    price: 149,
    period: "month",
    seats: 50,
    description: "Up to 50 active users",
    downgradeNote: "Downgrades are not available here. Cancel your subscription if you need a smaller tier.",
    features: ["Everything in Starter", "ICOFR Testing Workflows", "Monthly Reporting", "Audit Trail", "Priority Support"],
  },
  {
    name: "Scale",
    price: 399,
    period: "month",
    seats: 200,
    description: "Up to 200 active users",
    downgradeNote: "",
    features: ["Everything in Growth", "Multi-entity Support", "API Access", "Dedicated Account Manager"],
  },
];

const Billing = () => {
  const navigate = useNavigate();
  const [currentPlan] = useState<string | null>(null);
  const [trialActive] = useState(true);
  const trialDaysLeft = 14;
  const activeSeats = 1;
  const totalSeats = 200;

  const planIndex = (name: string) => plans.findIndex((p) => p.name === name);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paystack-powered plans by user seats. To cancel a paid plan, open the <span className="font-semibold text-foreground">Current status</span> section below and use <span className="font-semibold text-foreground">Cancel subscription</span>.
        </p>
      </div>

      {/* Current Status */}
      <Card className="border-sidebar-border bg-card">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-muted">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Current status</h2>
                {trialActive ? (
                  <>
                    <Badge variant="outline" className="mt-1 border-primary text-primary">
                      FREE TRIAL
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trialDaysLeft} days remaining in your free trial
                    </p>
                  </>
                ) : (
                  <>
                    <Badge className="mt-1 bg-primary text-primary-foreground">ACTIVE</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Plan: <span className="font-medium text-foreground">{currentPlan} (up to {plans.find(p => p.name === currentPlan)?.seats} active users)</span>
                    </p>
                  </>
                )}
              </div>
            </div>
            {!trialActive && currentPlan && (
              <Button variant="destructive" size="sm">Cancel subscription</Button>
            )}
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Active users</span>
            </div>
            <Progress value={(activeSeats / totalSeats) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {activeSeats} / {totalSeats} active seats
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Choose a plan */}
      <div>
        <h2 className="text-xl font-bold">Choose a plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a tier based on how many active users you need. Checkout opens in a secure Paystack window; your plan renews each billing period until you cancel it.
        </p>
        <p className="text-sm text-destructive mt-1">
          Upgrading ends your current Paystack subscription first, then opens checkout. If you leave Paystack without paying, you will need to subscribe again.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name;
          const isLowerTier = currentPlan ? planIndex(plan.name) < planIndex(currentPlan) : false;

          return (
            <Card
              key={plan.name}
              className={`relative border transition-colors ${
                isCurrent
                  ? "border-primary bg-accent/20"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isCurrent ? "text-primary" : ""}`}>
                  {plan.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                {isCurrent ? (
                  <p className="text-xs text-muted-foreground italic">
                    Current plan — subscription is already active for this tier.
                  </p>
                ) : isLowerTier ? (
                  <p className="text-xs text-muted-foreground italic">
                    {plan.downgradeNote}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="pt-0">
                {isCurrent ? (
                  <Button className="w-full bg-primary text-primary-foreground" disabled>
                    Current plan
                  </Button>
                ) : isLowerTier ? (
                  <Button className="w-full bg-primary/60 text-primary-foreground" disabled>
                    Not available
                  </Button>
                ) : trialActive ? (
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Start 14-day trial
                  </Button>
                ) : (
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Billing;
