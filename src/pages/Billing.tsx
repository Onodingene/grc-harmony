import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreditCard, Users } from "lucide-react";

const Billing = () => {
  const [yearly, setYearly] = useState(false);
  const [currentPlan] = useState<string | null>(null);
  const [trialActive] = useState(true);
  const trialDaysLeft = 14;
  const activeSeats = 1;
  const freeSeats = 25;
  const pricePerSeat = yearly ? 8 : 10;

  const extraSeats = Math.max(0, activeSeats - freeSeats);
  const monthlyCost = extraSeats * pricePerSeat;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          First 25 users are free. Additional users are billed per head.
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
            <Progress value={(activeSeats / Math.max(freeSeats, activeSeats)) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {activeSeats} active user{activeSeats !== 1 ? "s" : ""} — {activeSeats <= freeSeats
                ? `${freeSeats - activeSeats} free seats remaining`
                : `${extraSeats} extra seat${extraSeats !== 1 ? "s" : ""} billed`}
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
            <Label className="text-sm">Yearly <span className="text-primary font-medium">(Save 20%)</span></Label>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Every company gets 25 free users. After that, pay per additional user per month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Tier */}
        <Card className="border-primary bg-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-primary">Free Tier</CardTitle>
            <p className="text-sm text-muted-foreground">Up to 25 active users</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ 25 active users included</li>
              <li>✓ Full MCS Controls Management</li>
              <li>✓ Testing & Issue Tracking</li>
              <li>✓ Monthly Reporting</li>
              <li>✓ CSV Export</li>
              <li>✓ 14-day free trial for extra seats</li>
            </ul>
            <Button className="w-full" disabled={activeSeats <= freeSeats}>
              {activeSeats <= freeSeats ? "Current plan" : "Downgrade"}
            </Button>
          </CardContent>
        </Card>

        {/* Per-Seat Tier */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Per-Seat Plan</CardTitle>
            <p className="text-sm text-muted-foreground">For teams larger than 25 users</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="text-3xl font-bold">
              ${pricePerSeat}<span className="text-sm font-normal text-muted-foreground">/user/month (beyond 25)</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Everything in Free Tier</li>
              <li>✓ Unlimited users</li>
              <li>✓ ICOFR Testing Workflows</li>
              <li>✓ Multi-entity Support</li>
              <li>✓ Audit Trail</li>
              <li>✓ API Access</li>
              <li>✓ Priority Support</li>
              <li>✓ Dedicated Account Manager</li>
            </ul>
            {activeSeats > freeSeats ? (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Current bill: ${monthlyCost}/month</p>
                <p className="text-muted-foreground text-xs">{extraSeats} extra seat{extraSeats !== 1 ? "s" : ""} × ${pricePerSeat}/seat</p>
              </div>
            ) : (
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {trialActive ? "Start 14-day trial" : "Subscribe"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
