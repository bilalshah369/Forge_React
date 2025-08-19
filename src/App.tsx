import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import MasterLayout from "./layouts/MasterLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { SidebarProvider } from "./components/ui/sidebar";
import Dashboard1 from "./pages/reports/Dashboard1";
import Dashboard2 from "./pages/reports/Dashboard2";
import Dashboard3 from "./pages/reports/Dashboard3";
import Dashboard4 from "./pages/reports/Dashboard4";
import PMView from "./pages/workspace/PMView";
import IntakeList from "./pages/workspace/IntakeList";
import ApprovedProjectList from "./pages/workspace/ApprovedProjectList";
import ClosedProjects from "./pages/workspace/ClosedProjects";
import AdminPanel from "./pages/workspace/AdminPanel";
import RaidTracker from "./pages/raid/RaidTracker";
import RoadmapOverview from "./pages/roadmaps/RoadmapOverview";
import ManageGoalsPrograms from "./pages/goals/ManageGoalsPrograms";
import Timesheet from "./pages/Timesheet/Timesheet";
import TimesheetReportPage from "./pages/Timesheet/TimesheetReportPage";
import TitleWrapper from "@/layouts/TitleWrapper";
import { TitleProvider } from "./layouts/PageTitleContext";
import NewIntake from "./pages/projects/NewIntake";
import ProjectAudit from "./pages/workspace/ProjectAudit";
import { RegistrationWizard } from "./pages/project_plan/RegistrationWizard";
import ProjectView from "./pages/projects/ProjectView";
import ProjectDashboard from "./pages/projects/ProjectDashboard";
import { ChangeRequestWizard } from "./pages/project_plan/ChangeRequestWizard";
import { Classifications } from "./pages/classifications/Classifications";
import { ImpactedApps } from "./pages/impacted-apps/ImpactedApps";
import { Designations } from "./pages/designation/Designations";
import { Roles } from "./pages/roles/Roles";
const queryClient = new QueryClient();
const routesWithTitles = [
  // { path: "/ManageList", title: "Managge List", element: <ManageList /> },
  // { path: "/FieldLabels", title: "Edit Labels", element: <FieldLabels /> },
  // {
  //   path: "/TableWithFeatures",
  //   title: "Table View",
  //   element: <TableWithFeatures />,
  // },
  { path: "/TimeSheet", title: "Timesheet", element: <Timesheet /> },
  {
    path: "/TimesheetReport",
    title: "Timesheet Report",
    element: <TimesheetReportPage />,
  },
  // { path: "/ManageAss", title: "Assignment", element: <ManageAss /> },
  // { path: "/Goals", title: "Goals", element: <Goals /> },
  // { path: "/SignupScreen", title: "Sign Up", element: <SignupScreen /> },
  // { path: "/ManageUsers", title: "Users", element: <ManageUsers /> },
  {
    path: "/PMView/ProjectAudit",
    title: "Project Change Log",
    element: <ProjectAudit />,
  },
  // { path: "/Org", title: "Organization chart", element: <Org /> },
  // {
  //   path: "/DepartmentList",
  //   title: labelDepartment.display,
  //   element: <DepartmentList />,
  // },
  // { path: "/Excel", title: "", element: <Excel /> },
  // {
  //   path: "/WelcomeScreen",
  //   title: "Welcome Screen",
  //   element: <WelcomeScreen />,
  // },
  {
    path: "/ClosedProjects",
    title: "Closed Projects",
    element: <ClosedProjects />,
  },
  // {
  //   path: "/ADIntegration",
  //   title: "Active Directory (AD) Integrations",
  //   element: <ADIntegration />,
  // },
  // {
  //   path: "/ADIntegrationList",
  //   title: "Active Directory (AD) Integrations",
  //   element: <ADIntegrationList />,
  // },
  { path: "/Adminpanel", title: "Admin Panel", element: <AdminPanel /> },
  // {
  //   path: "/DualSectionList",
  //   title: "Edit Labels",
  //   element: <DualSectionList />,
  // },
  // { path: "/Adcomponent", title: "Add Component", element: <Adcomponent /> },
  { path: "/AdminDboard", title: "Dashboard", element: <Dashboard1 /> },
  {
    path: "/AdminDboard/AdminDboard2",
    title: "Dashboard",
    element: <Dashboard2 />,
  },
  {
    path: "/AdminDboard/AdminDboard3",
    title: "Dashboard",
    element: <Dashboard3 />,
  },
  {
    path: "/AdminDboard/AdminDboard4",
    title: "Dashboard",
    element: <Dashboard4 />,
  },

  // <Route path="/dashboard-2" element={<Dashboard2 />} />
  //             <Route path="/dashboard-3" element={<Dashboard3 />} />
  //             <Route path="/dashboard-4" element={<Dashboard4 />} />
  // {
  //   path: "/AdminDboard2",
  //   title: "Budget Dashboard",
  //   element: <DashboardView2 />,
  // },
  // {
  //   path: "/AdminDboard3",
  //   title: "Resource Dashboard",
  //   element: <DashboardView3 />,
  // },
  // {
  //   path: "/AdminDboard4",
  //   title: labelBusinessOwner.display + " Dashboard",
  //   element: <DashboardView4 />,
  // },
  // { path: "/Roadmap", title: "", element: <Roadmap /> },
  {
    path: "/RoadmapOverview",
    title: "Overview",
    element: <RoadmapOverview />,
  },
  // {
  //   path: "/MilestoneViewGantt",
  //   title: "Milestone Details",
  //   element: <MilestoneViewGantt />,
  // },
  // { path: "/Resources", title: "Resources", element: <Resources /> },
  {
    path: "/IntakeList",
    title: "Intake/Backlog List",
    element: <IntakeList />,
  },
  // {
  //   path: "/CustomerList",
  //   title: "Customer List",
  //   element: <CustomerList />,
  // },
  // {
  //   path: "/PendingCustomers",
  //   title: "Pending Customers",
  //   element: <PendingCustomers />,
  // },
  { path: "/PMView", title: "PM Workspace", element: <PMView /> },
  // { path: "/ManageGoals", title: "Goals", element: <ManageGoals /> },
  {
    path: "/ManageGoalsPrograms",
    title: "Goals Vs Programs",
    element: <ManageGoalsPrograms />,
  },
  // { path: "/ManagePrograms", title: "Programs", element: <ManagePrograms /> },
  // {
  //   path: "/BinaryTree",
  //   title: "Department Tree View",
  //   element: <BinaryTree />,
  // },
  {
    path: "/IntakeList/NewIntake",
    title: "New Intake",
    element: <NewIntake />,
  },
  {
    path: "/PMView/ProjectView",
    title: "Project Details",
    element: <ProjectView />,
  },
  // {
  //   path: "/IntakeApproval",
  //   title: "Intake Review/Approval",
  //   element: <IntakeApproval />,
  // },
  // { path: "/IntakeView", title: "Intake View", element: <IntakeView /> },
  { path: "/Adminpanel/roles", title: "Roles", element: <Roles /> },
  {
    path: "/Adminpanel/impacted-applications",
    title: "Impacted Applications",
    element: <ImpactedApps />,
  },
  {
    path: "/Adminpanel/Classifications",
    title: "Classifications",
    element: <Classifications />,
  },
  {
    path: "/Adminpanel/designations",
    title: "Designations",
    element: <Designations />,
  },
  {
    path: "/Adminpanel/budget-categories",
    title: "Budget Categories",
    element: <BudgetCategories />,
  },
  // {
  //   path: "/IntakeApprovalView",
  //   title: "Intake Approval View",
  //   element: <IntakeApprovalView />,
  // },
  // {
  //   path: "/ProjectDetailedView",
  //   title: "",
  //   element: <ProjectDetailedView />,
  // },
  {
    path: "/ApprovedProjectList",
    title: "Approved Project List",
    element: <ApprovedProjectList />,
  },
  // { path: "/Stakeholderform", title: "", element: <Stakeholderform /> },
  {
    path: "PMView/ProjectDetails",
    title: "Project Details",
    element: <RegistrationWizard />,
  },
  // {
  //   path: "/BudgetForecast",
  //   title: "Budget Forecast",
  //   element: <BudgetForecast />,
  // },
  // { path: "/ResetPass", title: "", element: <ResetPass /> },
  // {
  //   path: "/PlanApproval",
  //   title: "Pending Approvals - Project Plan",
  //   element: <PlanApproval />,
  // },
  // { path: "/ResetPassword", title: "", element: <ResetPassword /> },
  // {
  //   path: "/CompanyDetailPage",
  //   title: "Company Details",
  //   element: <CompanyDetailPage />,
  // },
  // { path: "/MiddlePage", title: "", element: <MiddlePage /> },
  // { path: "/InProgress", title: "WIP", element: <InProgress /> },
  // {
  //   path: "/ProjectForProgressUpdate",
  //   title: "In-Progress Projects",
  //   element: <ProjectProgress />,
  // },
  // {
  //   path: "/ProjectProgress",
  //   title: "In-Progress Projects",
  //   element: <ProjectForProgressUpdate />,
  // },
  // {
  //   path: "/ProjectMilestoneList",
  //   title: "Project Milestones",
  //   element: <ProjectMilestoneList />,
  // },
  // {
  //   path: "/ProjectDetailsOverview",
  //   title: "Project Details Overview",
  //   element: <ProjectDetailsOverview />,
  // },
  // {
  //   path: "/MilestoneDetailsOverview",
  //   title: "Milestone Details Overview",
  //   element: <MilestoneDetailsOverview />,
  // },
  {
    path: "/PMView/ProjectProgressOverview",
    title: "Project Status",
    element: <ProjectDashboard />,
  },
  {
    path: "/PMView/ChangeRequest",
    title: "Change Request",
    element: <ChangeRequestWizard />,
  },
  // {
  //   path: "/ApproveChangeRequest",
  //   title: "Approve Project Change",
  //   element: <ChangeRequestUpdated />,
  // },
  // {
  //   path: "/MilestoneDateApproval",
  //   title: "Milestone Date Change",
  //   element: <MilestoneDateApproval />,
  // },
  // { path: "/ROIDetails", title: "ROI Details", element: <ROIDetails /> },
  // { path: "/Summary", title: "Project Details", element: <Summary /> },
  // { path: "/UserProfile", title: "User Profile", element: <UserProfile /> },
  { path: "/RaidTracker", title: "RAID Tracker", element: <RaidTracker /> },
  // {
  //   path: "/ProjectPreview",
  //   title: "Project Preview",
  //   element: <ProjectPreview />,
  // },
  // {
  //   path: "/LabelUpdateCategories",
  //   title: "Field Label Categories",
  //   element: <LabelUpdateCategories />,
  // },
  // {
  //   path: "/IntakeLabels",
  //   title: "Intake Labels",
  //   element: <IntakeLabels />,
  // },
  // {
  //   path: "/Notifications",
  //   title: "Notifications",
  //   element: <Notifications />,
  // },
  // {
  //   path: "/IntakeUpload",
  //   title: "Create Intake from File Upload",
  //   element: <IntakeUpload />,
  // },
  // {
  //   path: "/IntegrationLinkForm",
  //   title: "IntegrationLinkForm",
  //   element: <IntegrationLinkForm />,
  // },
  // {
  //   path: "/BudgetCategories",
  //   title: "Budget Categories",
  //   element: <BudgetCategory />,
  // },
  // {
  //   path: "/AlertsConfiguration",
  //   title: "Configure Alerts",
  //   element: <AlertsConfiguration />,
  // },
  // { path: "/AuditLog", title: "Audit Log", element: <AuditLog /> },
  // {
  //   path: "/ResourceUpload",
  //   title: "Upload Resources",
  //   element: <ResourceUpload />,
  // },
  // {
  //   path: "/IdleTimeoutProvider",
  //   title: "IdleTimeoutProvider",
  //   element: <IdleTimeoutProvider />,
  // },
  // {
  //   path: "/ProjectPlanUpload",
  //   title: "Project Plan Upload",
  //   element: <ProjectPlanUpload />,
  // },
  // {
  //   path: "/ProjectProgressUpdate",
  //   title: "Project Progress Upload",
  //   element: <ProjectProgressUpdate />,
  // },
  // {
  //   path: "/MonthWiseBudgetUpload",
  //   title: "Month-wise Budget Upload ",
  //   element: <MonthWiseBudgetUpload />,
  // },
  // {
  //   path: "/SubscriptionModel",
  //   title: "Subscription Plans",
  //   element: <SubscriptionModel />,
  //},
  //{ path: "/CustomLabels", title: "Edit Labels", element: <CustomLabels /> },
];
const App = () => {
  // routesWithTitles.ts

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TitleProvider>
            <Routes>
              <Route element={<MasterLayout />}>
                <Route
                  path="/home"
                  //element={<HomePage />}
                  element={
                    <TitleWrapper title={"Home Page"}>
                      {<HomePage />}
                    </TitleWrapper>
                  }
                />
                <Route path="/about" element={<AboutPage />} />
                {routesWithTitles.map(({ path, title, element }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <TitleWrapper title={title}>{element}</TitleWrapper>
                    }
                  />
                ))}

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/" element={<Index />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* <Route path="/" element={<Index />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        
          <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </TitleProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
