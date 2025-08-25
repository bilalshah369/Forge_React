/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Map,
  Briefcase,
  Archive,
  CheckSquare,
  FolderX,
  Target,
  Zap,
  Clock,
  FileText,
  Settings,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppImages } from "@/assets";
import { decodeBase64 } from "@/utils/securedata";
import { MainDrawerNav } from "@/utils/AdminDboad";
import { PostAsync } from "@/services/rest_api_service";
import { navigationRef } from "@/utils/navigationService";
import {
  Admin_svg,
  Approved_projects_svg,
  Closed_project,
  Dashboard_svg,
  Goal_svg,
  Intakebacklog_svg,
  Pm_view_svg,
  Program_svg,
  Raid_svg,
  Roadmap_svg,
  User_view_svg,
} from "@/assets/Icons";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const items = [
  { title: "Dashboard", url: "/AdminDboard", icon: LayoutDashboard },
  { title: "Roadmap", url: "/roadmap", icon: Map },
  { title: "PM Workspace", url: "/PMView", icon: Briefcase },
  { title: "Intake/Backlog", url: "/IntakeList", icon: Archive },
  {
    title: "Approved Projects",
    url: "/ApprovedProjectList",
    icon: CheckSquare,
  },
  { title: "Closed Projects", url: "/ClosedProjects", icon: FolderX },
  { title: "Goals Vs Programs", url: "/goals-programs", icon: Target },
  { title: "RAID Tracker", url: "/raid-tracker", icon: Zap },
  { title: "Timesheet", url: "/timesheet", icon: Clock },
  { title: "Timesheet Report", url: "/timesheet-report", icon: FileText },
  { title: "Admin Panel", url: "/Adminpanel", icon: Settings },
];
interface Submodule {
  module_id: string;
  module_name: string;
  is_active: boolean;
  url: string;
}

interface Module {
  module_id: string;
  module_name: string;
  is_active: boolean;
  sub_modules: Submodule[];
  url: string;
}
export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "");
  const collapsed = state === "collapsed";
  const [dynamicModules, setDynamicModules] = useState<any[]>([]);
  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + "/");
  };
  const handleLogout = async () => {
    // const token = await AsyncStorage.getItem('Token');
    //setModalVisibleAction(false);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const loginHistoryId = localStorage.getItem("login_history_id");
      if (refreshToken) {
        const payload = JSON.stringify({ refreshToken, loginHistoryId });
        // console.log(payload);
        const uri = `${BASE_URL}/auth/logout`;
        const jsonResult = await PostAsync(uri, payload);
        if (jsonResult.status === "success") {
          console.log("Logout request sent"); // Debug
        }
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
    try {
      localStorage.clear();
      console.log("AsyncStorage cleared"); // Debug
      navigationRef("/");
      console.log("Navigated to LoginScreen"); // Debug
    } catch (err) {
      console.error("Failed to clear AsyncStorage:", err);
    }
  };
  const fetchRoleModules = useCallback(async () => {
    const _authToken = localStorage.getItem("Token");
    if (!_authToken) {
      await handleLogout();
    }
    try {
      const encodedRoleId = localStorage.getItem("UserType");
      const decodedRoleId = decodeBase64(encodedRoleId ?? "");
      const response = await MainDrawerNav(decodedRoleId);
      const responseData: Module[] = JSON.parse(response);

      const filteredModules = responseData
        .filter(
          (module) =>
            module.is_active ||
            module.sub_modules.some((submodule) => submodule.is_active)
        )
        .map((module) => ({
          ...module,
          sub_modules: module.sub_modules.filter(
            (submodule) => submodule.is_active
          ),
        }));

      setDynamicModules(filteredModules);
      // setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
  }, []);
  useEffect(() => {
    fetchRoleModules();
  }, []);
  return (
    <Sidebar
      className={`${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 !bg-[#044086] [&>*]:!bg-[#044086] [&>*]:!bg-none`}
      collapsible="icon"
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-sidebar-border/20">
        <div className="flex items-center justify-center gap-3">
          {/* <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div> */}

          {!collapsed && (
            // <span className="text-sidebar-foreground font-bold text-lg">
            //   FORGE
            // </span>
            <img
              src={AppImages.ForgeHeader}
              alt="Forge Logo"
              className="h-12 mx-auto mb-6 object-contain"
            />
          )}
          {collapsed && (
            // <span className="text-sidebar-foreground font-bold text-lg">
            //   FORGE
            // </span>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {dynamicModules.map((item) => {
                //////debugger;
                console.log(dynamicModules);
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      {active ? (
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-br bg-white text-black hover:text-black"
                        >
                          {/* <item.icon className="h-5 w-5 flex-shrink-0" /> */}
                          {true ? (
                            <>
                              {item.module_name === "Admin Panel" && (
                                <Admin_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Roadmap" && (
                                <Roadmap_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Dashboard" && (
                                <Dashboard_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}

                              {item.module_name === "Dashboard 2" && (
                                <Dashboard_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}

                              {item.module_name === "Dashboard 3" && (
                                <Dashboard_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}

                              {item.module_name === "Intake/Backlog" && (
                                <Intakebacklog_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {/* {item.module_name === 'Active Projects' && (
                              <ActiveProjects_svg
                                height={20}
                                width={20}
                                fill={
                                  active 
                                    ? 'black'
                                    : 'white'
                                }
                              />
                            )} */}
                              {item.module_name === "RAID Tracker" && (
                                <Raid_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Closed Projects" && (
                                <Closed_project
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "PM Workspace" && (
                                <Pm_view_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Timesheet" && (
                                <User_view_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Timesheet Report" && (
                                <User_view_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Approved Projects" && (
                                <Approved_projects_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Goals Vs Programs" && (
                                <Goal_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Goals" && (
                                <Goal_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Programs" && (
                                <Program_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                            </>
                          ) : null}
                          {!collapsed && (
                            <span className="truncate text-black hover:text-black">
                              {item.module_name}
                            </span>
                          )}
                        </NavLink>
                      ) : (
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className={
                            "flex items-center gap-3 px-3 py-2.5 text-white hover:text-black"
                          }
                        >
                          {/* <item.icon className="h-5 w-5 flex-shrink-0" /> */}
                          {true ? (
                            <>
                              {item.module_name === "Admin Panel" && (
                                <Admin_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Roadmap" && (
                                <Roadmap_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Dashboard" && (
                                <Dashboard_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}

                              {item.module_name === "Dashboard 2" && (
                                <Dashboard_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}

                              {item.module_name === "Dashboard 3" && (
                                <Dashboard_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}

                              {item.module_name === "Intake/Backlog" && (
                                <Intakebacklog_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {/* {item.module_name === 'Active Projects' && (
                              <ActiveProjects_svg
                                height={20}
                                width={20}
                                fill={
                                  active 
                                    ? 'black'
                                    : 'white'
                                }
                              />
                            )} */}
                              {item.module_name === "RAID Tracker" && (
                                <Raid_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Closed Projects" && (
                                <Closed_project
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "PM Workspace" && (
                                <Pm_view_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Timesheet" && (
                                <User_view_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Timesheet Report" && (
                                <User_view_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Approved Projects" && (
                                <Approved_projects_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Goals Vs Programs" && (
                                <Goal_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Goals" && (
                                <Goal_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                              {item.module_name === "Programs" && (
                                <Program_svg
                                  height={20}
                                  width={20}
                                  fill="currentColor"
                                />
                              )}
                            </>
                          ) : null}
                          {!collapsed && (
                            <span className="">{item.module_name}</span>
                          )}
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
