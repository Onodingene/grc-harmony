import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Building, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@company.com",
    organization: "GRC Corp",
    role: "Admin",
  });

  const handleSave = () => {
    toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card className="border-sidebar-border bg-card">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-semibold text-lg">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
            <p className="text-xs text-muted-foreground mt-1">{profile.organization}</p>
          </CardContent>
        </Card>

        {/* Details Form */}
        <Card className="border-sidebar-border bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <User className="w-3.5 h-3.5" /> First Name
                </Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <User className="w-3.5 h-3.5" /> Last Name
                </Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Building className="w-3.5 h-3.5" /> Organization
              </Label>
              <Input
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Shield className="w-3.5 h-3.5" /> Role
              </Label>
              <Input value={profile.role} disabled className="bg-muted" />
            </div>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
