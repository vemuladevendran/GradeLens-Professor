import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Professor");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.full_name || "Professor");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
