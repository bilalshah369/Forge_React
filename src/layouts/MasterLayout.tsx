import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/AppSidebar";
import { Menu } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import { setNavigator } from "../utils/navigationService";
import { useEffect } from "react";

export default function MasterLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />

      <main
        className="flex-1 flex flex-col overflow-hidden bg-white"
        style={{ borderRadius: 10 }}
      >
        {" "}
        {/* Prevent scroll leak */}
        {/* Header with trigger */}
        {/* <header className="h-14 flex items-center border-b bg-background px-4">
            <SidebarTrigger className="p-2">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
          </header> */}
        <Header />
        {/* Main content */}
        <div
          className="flex-1 overflow-auto"
          style={{ borderRadius: 10, padding: 20 }}
        >
          {/* bg-gradient-to-br from-green-50 to-indigo-100 */}
          <Outlet /> {/* children of the route will render here */}
        </div>
      </main>
    </SidebarProvider>
  );
}