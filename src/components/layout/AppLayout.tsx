
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="border-r border-gray-200 w-64">
        <SidebarHeader className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-messaging-primary">MessageMe</h1>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <div className="py-2 px-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">PROFILE</h2>
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-100 rounded-md">
              <div className="h-10 w-10 rounded-full bg-messaging-primary flex items-center justify-center text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="py-2 px-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">CONTACTS</h2>
            <div className="space-y-1">
              <ContactItem name="Alex Johnson" status="online" />
              <ContactItem name="Emma Smith" status="away" />
              <ContactItem name="Michael Brown" status="offline" />
              <ContactItem name="Sophia Davis" status="online" />
              <ContactItem name="James Wilson" status="offline" />
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full text-messaging-dark"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

interface ContactItemProps {
  name: string;
  status: "online" | "offline" | "away";
}

const ContactItem = ({ name, status }: ContactItemProps) => {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-400",
  };

  return (
    <div className="p-2 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-messaging-secondary/80 flex items-center justify-center text-white font-medium">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{name}</p>
      </div>
      <div className={`h-2 w-2 rounded-full ${statusColors[status]} ${status === "online" ? "animate-ping-slow" : ""}`}></div>
    </div>
  );
};

export default AppLayout;
