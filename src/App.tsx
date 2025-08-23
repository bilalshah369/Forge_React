import React, { Suspense, lazy } from "react";
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
// import HomePage from "./pages/HomePage";
// import AboutPage from "./pages/AboutPage";
// import Dashboard1 from "./pages/reports/Dashboard1";
// import Dashboard2 from "./pages/reports/Dashboard2";
// import Dashboard3 from "./pages/reports/Dashboard3";
// import Dashboard4 from "./pages/reports/Dashboard4";
// import PMView from "./pages/workspace/PMView";
// import IntakeList from "./pages/workspace/IntakeList";
// import ApprovedProjectList from "./pages/workspace/ApprovedProjectList";
// import ClosedProjects from "./pages/workspace/ClosedProjects";
// import AdminPanel from "./pages/workspace/AdminPanel";
// import RaidTracker from "./pages/raid/RaidTracker";
// import RoadmapOverview from "./pages/roadmaps/RoadmapOverview";
// import ManageGoalsPrograms from "./pages/goals/ManageGoalsPrograms";
// import Timesheet from "./pages/Timesheet/Timesheet";
// import TimesheetReportPage from "./pages/Timesheet/TimesheetReportPage";
// import TitleWrapper from "@/layouts/TitleWrapper";
// import { TitleProvider } from "./layouts/PageTitleContext";
// import NewIntake from "./pages/projects/NewIntake";
// import ProjectAudit from "./pages/workspace/ProjectAudit";
// import { RegistrationWizard } from "./pages/project_plan/RegistrationWizard";
// import ProjectView from "./pages/projects/ProjectView";
// import ProjectDashboard from "./pages/projects/ProjectDashboard";
// import { ChangeRequestWizard } from "./pages/project_plan/ChangeRequestWizard";
// import BudgetPlannerNew from "./pages/budget/BudgetPlannerNew";
// import CompanyDetailPage from "./pages/profiles/CompanyDetailPage";
// import DepartmentList from "./pages/masters/DepartmentList";
// import DesignationChart from "./pages/TeamMap/DesignationChart";
// import { Classifications } from "./pages/classifications/Classifications";
// import { ImpactedApps } from "./pages/impacted-apps/ImpactedApps";
// import { Designations } from "./pages/designation/Designations";
// import { Roles } from "./pages/roles/Roles";
// import ADIntegrationList from "./pages/masters/ADIntegrationList";
// import SubscriptionModel from "./pages/Subscription/SubscriptionModel";
// import AlertsConfiguration from "./pages/masters/AlertsConfiguration";
// import BudgetCategories from "./pages/budget-categories/BudgetCategories";
// import Resources from "./pages/profiles/Resources";
// import IntakeUpload from "./pages/upload-pages/IntakeUpload";
// import { ThemeProvider } from "./themes/ThemeProvider";
// import ResourceUpload from "./pages/upload-pages/ResourceUpload";
// import ProjectProgressUpload from "./pages/upload-pages/ProjectProgressUpload";
// import ProjectPlanUpload from "./pages/upload-pages/ProjectPlanUpload";
// import EditFieldLabels from "./pages/edit-field-labels/EditFieldLabels";
// import { LabelProvider } from "./pages/edit-field-labels/LabelContext";



import TitleWrapper from "@/layouts/TitleWrapper";
import { TitleProvider } from "./layouts/PageTitleContext";
import { ThemeProvider } from "./themes/ThemeProvider";
import { LabelProvider } from "./pages/edit-field-labels/LabelContext";
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Dashboard1 = lazy(() => import("./pages/reports/Dashboard1"));
const Dashboard2 = lazy(() => import("./pages/reports/Dashboard2"));
const Dashboard3 = lazy(() => import("./pages/reports/Dashboard3"));
const Dashboard4 = lazy(() => import("./pages/reports/Dashboard4"));
const PMView = lazy(() => import("./pages/workspace/PMView"));
const IntakeList = lazy(() => import("./pages/workspace/IntakeList"));
const ApprovedProjectList = lazy(() => import("./pages/workspace/ApprovedProjectList"));
const ClosedProjects = lazy(() => import("./pages/workspace/ClosedProjects"));
const AdminPanel = lazy(() => import("./pages/workspace/AdminPanel"));
const RaidTracker = lazy(() => import("./pages/raid/RaidTracker"));
const RoadmapOverview = lazy(() => import("./pages/roadmaps/RoadmapOverview"));
const ManageGoalsPrograms = lazy(() => import("./pages/goals/ManageGoalsPrograms"));
const Timesheet = lazy(() => import("./pages/Timesheet/Timesheet"));
const TimesheetReportPage = lazy(() => import("./pages/Timesheet/TimesheetReportPage"));
const NewIntake = lazy(() => import("./pages/projects/NewIntake"));
const ProjectAudit = lazy(() => import("./pages/workspace/ProjectAudit"));
const RegistrationWizard = lazy(() => import("./pages/project_plan/RegistrationWizard"));
const ProjectView = lazy(() => import("./pages/projects/ProjectView"));
const ProjectDashboard = lazy(() => import("./pages/projects/ProjectDashboard"));
const ChangeRequestWizard = lazy(() => import("./pages/project_plan/ChangeRequestWizard"));
const BudgetPlannerNew = lazy(() => import("./pages/budget/BudgetPlannerNew"));
const CompanyDetailPage = lazy(() => import("./pages/profiles/CompanyDetailPage"));
const DepartmentList = lazy(() => import("./pages/masters/DepartmentList"));
const DesignationChart = lazy(() => import("./pages/TeamMap/DesignationChart"));
const Classifications = lazy(() => import("./pages/classifications/Classifications"));
const ImpactedApps = lazy(() => import("./pages/impacted-apps/ImpactedApps"));
const Designations = lazy(() => import("./pages/designation/Designations"));
const Roles = lazy(() => import("./pages/roles/Roles"));
const ADIntegrationList = lazy(() => import("./pages/masters/ADIntegrationList"));
const SubscriptionModel = lazy(() => import("./pages/Subscription/SubscriptionModel"));
const AlertsConfiguration = lazy(() => import("./pages/masters/AlertsConfiguration"));
const BudgetCategories = lazy(() => import("./pages/budget-categories/BudgetCategories"));
const Resources = lazy(() => import("./pages/profiles/Resources"));
const IntakeUpload = lazy(() => import("./pages/upload-pages/IntakeUpload"));
const ResourceUpload = lazy(() => import("./pages/upload-pages/ResourceUpload"));
const ProjectProgressUpload = lazy(() => import("./pages/upload-pages/ProjectProgressUpload"));
const ProjectPlanUpload = lazy(() => import("./pages/upload-pages/ProjectPlanUpload"));
const EditFieldLabels = lazy(() => import("./pages/edit-field-labels/EditFieldLabels"));

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
  {
    path: "/Adminpanel/Organization",
    title: "Organization chart",
    element: <DesignationChart />,
  },
  {
    path: "DepartmentList",
    title: "Departments",
    element: <DepartmentList />,
  },
   {
    path: "/Adminpanel/DepartmentList",
    title: "Departments",
    element: <DepartmentList />,
  },
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
  {
    path: "/Adminpanel/ADIntegrationList",
    title: "Active Directory (AD) Integrations",
    element: <ADIntegrationList />,
  },
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
  { path: "/Adminpanel/Resources", title: "Resources", element: <Resources /> },
    { path: "Resources", title: "Resources", element: <Resources /> },
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
    { path: "RoleMaster", title: "Roles", element: <Roles /> },
  { path: "/Adminpanel/roles", title: "Roles", element: <Roles /> },
  {
    path: "/Adminpanel/impacted-applications",
    title: "Impacted Applications",
    element: <ImpactedApps />,
  },
  {
    path: "ImpactedApps",
    title: "Impacted Applications",
    element: <ImpactedApps />,
  },
  {
    path: "/Adminpanel/Classifications",
    title: "Classifications",
    element: <Classifications />,
  },
   {
    path: "/Classification",
    title: "Classifications",
    element: <Classifications />,
  },

  {
    path: "Designation",
    title: "Designations",
    element: <Designations />,
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
  {
    path: "/Adminpanel/CompanyDetailPage",
    title: "Company Details",
    element: <CompanyDetailPage />,
  },
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
  {
    path: "/PMView/BudgetPlanner",
    title: "Budget Forecast",
    element: <BudgetPlannerNew />,
  },
  {
    path: "/Adminpanel/IntakeUpload",
    title: "Create Intake from File Upload",
    element: <IntakeUpload />,
  },
  {
    path: "/Adminpanel/ResourceUpload",
    title: "Upload Resources",
    element: <ResourceUpload />,
  },
  {
    path: "/Adminpanel/ProjectPlanUpload",
    title: "Project Plan Upload",
    element: <ProjectPlanUpload />,
  },
  {
    path: "/Adminpanel/ProjectProgressUpload",
    title: "Project Progress Upload",
    element: <ProjectProgressUpload />,
  },
  {
    path: "/Adminpanel/edit-field-labels",
    title: "Edit Labels",
    element: <EditFieldLabels />,
  },
  {
    path: "CustomLabels",
    title: "Edit Labels",
    element: <EditFieldLabels />,
  },
  {
    path: "/ApprovedProjectList/ApproveChangeRequest",
    title: "Approve Project Change",
    element: <ChangeRequestWizard _isApproval={true}/>,
  },
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
  //   path: "/IntegrationLinkForm",
  //   title: "IntegrationLinkForm",
  //   element: <IntegrationLinkForm />,
  // },
  // {
  //   path: "/BudgetCategories",
  //   title: "Budget Categories",
  //   element: <BudgetCategory />,
  // },
  {
    path: "/Adminpanel/AlertsConfiguration",
    title: "Configure Alerts",
    element: <AlertsConfiguration />,
  },
  // { path: "/AuditLog", title: "Audit Log", element: <AuditLog /> },
  // {
  //   path: "/IdleTimeoutProvider",
  //   title: "IdleTimeoutProvider",
  //   element: <IdleTimeoutProvider />,
  // },
  // {
  //   path: "/MonthWiseBudgetUpload",
  //   title: "Month-wise Budget Upload ",
  //   element: <MonthWiseBudgetUpload />,
  // },
  {
    path: "/Adminpanel/SubscriptionModel",

    title: "Subscription Plans",
    element: <SubscriptionModel />,
  },
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
            <ThemeProvider>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 w-52 bg-gray-200 rounded animate-pulse"></div>
    </div>}>
  <Routes>
              <Route
                element={
                  <LabelProvider customerId="">
                    <MasterLayout />
                  </LabelProvider>
                }
              >
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
            </Suspense>
            </ThemeProvider>
          
          </TitleProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
