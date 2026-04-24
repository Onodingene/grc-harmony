import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreditCard, Users, Mail } from "lucide-react";

const Billing = () => {
  const [yearly, setYearly] = useState(false);
  const [currentPlan] = useState<string | null>(null);
  const [trialActive] = useState(true);
  const trialDaysLeft = 14;
  const activeSeats = 1;

  // Pricing tiers (monthly base price). Yearly = 20% off.
  const tiers = [
    { id: "starter", name: "Starter", users: 25, monthly: 1500 },
    { id: "growth", name: "Growth", users: 50, monthly: 2500 },
  ];

  const applyYearly = (m: number) => (yearly ? Math.round(m * 0.8) : m);

  // Determine which tier covers current usage
  const currentTier =
    activeSeats <= 25 ? tiers[0] : activeSeats <= 50 ? tiers[1] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the plan that matches your team size. For more than 50 users, contact support.
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
                      {currentPlan} plan
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
            <Progress
              value={(activeSeats / (currentTier?.users ?? 50)) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {activeSeats} active user{activeSeats !== 1 ? "s" : ""} —{" "}
              {currentTier
                ? `${currentTier.users - activeSeats} seats remaining on ${currentTier.name} plan`
                : "Enterprise — contact support"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Pricing</h2>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Monthly</Label>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <Label className="text-sm">
              Yearly <span className="text-primary font-medium">(Save 20%)</span>
            </Label>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Flat pricing per company based on team size.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Starter — 25 users */}
        <Card className="border-primary bg-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-primary">Starter</CardTitle>
            <p className="text-sm text-muted-foreground">Up to 25 users</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="text-3xl font-bold">
              ${applyYearly(tiers[0].monthly).toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Up to 25 active users</li>
              <li>✓ Full MCS Controls Management</li>
              <li>✓ Testing & Issue Tracking</li>
              <li>✓ Monthly Reporting</li>
              <li>✓ CSV Export</li>
              <li>✓ 14-day free trial</li>
            </ul>
            <Button className="w-full">
              {currentTier?.id === "starter" ? "Current plan" : "Choose Starter"}
            </Button>
          </CardContent>
        </Card>

        {/* Growth — 50 users */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Up to 50 users</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="text-3xl font-bold">
              ${applyYearly(tiers[1].monthly).toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Everything in Starter</li>
              <li>✓ Up to 50 active users</li>
              <li>✓ ICOFR Testing Workflows</li>
              <li>✓ Multi-entity Support</li>
              <li>✓ Audit Trail</li>
              <li>✓ Priority Support</li>
            </ul>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {currentTier?.id === "growth" ? "Current plan" : "Choose Growth"}
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise — 50+ */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Enterprise</CardTitle>
            <p className="text-sm text-muted-foreground">More than 50 users</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="text-3xl font-bold">
              Custom
              <span className="text-sm font-normal text-muted-foreground">/contact us</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Everything in Growth</li>
              <li>✓ Unlimited users</li>
              <li>✓ API Access</li>
              <li>✓ Dedicated Account Manager</li>
              <li>✓ Custom SLAs</li>
              <li>✓ SSO & Advanced Security</li>
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:sales@company.com">
                <Mail className="w-4 h-4 mr-1" /> Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
