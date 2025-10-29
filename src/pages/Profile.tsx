import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Profile = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setInstitution(user.institution_name || "");
    }
  }, []);

  const handleSaveChanges = () => {
    // Update localStorage with new values
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        full_name: fullName,
        email: email,
        institution_name: institution,
      };
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Smith" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@university.edu" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input 
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University Name" 
              />
            </div>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
