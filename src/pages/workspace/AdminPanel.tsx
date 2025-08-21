import {
  Building2,
  Network,
  Share2,
  Layers,
  Dot,
  FileText,
  User,
  LayoutGrid,
  Tag,
  BadgeCheck,
  Bell,
  Spline,
  FileSpreadsheet,
  UploadCloud,
  Badge,
  Flower2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  const items = [
    {
      icon: <Building2 size={36} />,
      label: "Company Details",

      url: "/Adminpanel/CompanyDetailPage",
    },
    {
      icon: <Network size={36} />,
      label: "Departments",
      url: "/Adminpanel/DepartmentList",
    },
    {
      icon: <Share2 size={36} />,
      label: "AD Integration",
      url: "/Adminpanel/ADIntegrationList",
    },
    {
      icon: <Layers size={36} />,
      label: "Resources",
      url: "/Adminpanel/resources",
    },
    { icon: <Badge size={36} />, label: "Roles", url: "/Adminpanel/roles" },
    {
      icon: <Dot size={36} />,
      label: "Impacted Application",
      url: "/Adminpanel/impacted-applications",
    },
    {
      icon: <FileText size={36} />,
      label: "Classifications",
      url: "/Adminpanel/Classifications",
    },
    {
      icon: <User size={36} />,
      label: "Designations",
      url: "/Adminpanel/designations",
    },
    {
      icon: <LayoutGrid size={36} />,
      label: "Budget Categories",
      url: "/Adminpanel/budget-categories",
    },
    {
      icon: <Tag size={36} />,
      label: "Edit Field Labels",
      url: "/Adminpanel/edit-field-labels",
    },
    {
      icon: <Flower2 size={36} />,
      label: "PPM Integration",
      url: "/Adminpanel/ppm-integration",
    },
    {
      icon: <BadgeCheck size={36} />,
      label: "License details",
      url: "/Adminpanel/SubscriptionModel",
    },
    {
      icon: <Bell size={36} />,
      label: "Configure Alerts",
      url: "/Adminpanel/AlertsConfiguration",
    },
    {
      icon: <Spline size={36} />,
      label: "Org Chart",
      url: "/Adminpanel/Organization",
    },
    {
      icon: <FileSpreadsheet size={36} />,
      label: "Import Projects from Excel",
      url: "/Adminpanel/IntakeUpload",
    },
    { icon: <UploadCloud size={36} />, label: "Import Resources from Excel" },
    {
      icon: <UploadCloud size={36} />,
      label: "Project Plan Upload from Excel",
    },
    {
      icon: <UploadCloud size={36} />,
      label: "Project Progress Upload from Excel",
    },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#f5f6f7" }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-screen-xl mx-auto">
        {items.map((item, index) => (
          <Link
            to={item.url}
            key={index}
            className="flex flex-col items-center justify-center p-5 bg-white rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition duration-200 min-w-[140px] min-h-[110px] text-center"
          >
            <div className="text-black mb-2">{item.icon}</div>
            <div className="text-sm font-semibold text-blue-800">
              {item.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
