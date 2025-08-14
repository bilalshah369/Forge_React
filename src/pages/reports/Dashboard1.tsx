/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar } from "@/components/ui/calendar";
import CustomTabs from "@/components/ui/custom-tabs";
import ProjectAutocomplete from "@/components/ui/ProjectAutocomplete";
import { RangeDatePicker } from "@/components/ui/RangeDatePicker";
import { AutoComplete, DateRangePicker, Panel } from "rsuite";
import { useLocation } from "react-router-dom";
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  subQuarters,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  StatusMultiSelect,
  StatusOption,
} from "@/components/ui/StatusMultiSelect";
import { useEffect, useRef, useState } from "react";
import "rsuite/dist/rsuite.min.css"; // Ensure RSuite styles are included
import UserTable from "@/components/ui/UserTable";
import { TableColumn } from "@/hooks/useDataTable";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  get_departments_projects,
  get_project_counts_by_status,
  get_projects_autocomplete,
  GetDashProjectsWithFilters,
  GetMasterDataPM,
  GetRAIDBubble,
} from "@/utils/PM";
import { getChartsData, GetutilizedResource } from "@/utils/AdminDboad";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import ThreeDPieChart from "../charts/ThreeDPieChart";
import RAID3DBarChartV4 from "../charts/RAID3DBarChartV4";
import DoughuntPieChart from "../charts/DoughuntPieChart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// src/pages/HomePage.tsx
const Dashboard1 = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchList, setSearchList] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalRecordsw, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const tabItems = [
    { label: "Status Dashboard", to: "/AdminDboard", active: true },
    { label: "Budget Dashboard", to: "/AdminDboard/AdminDboard2" },
    { label: "Resource Dashboard", to: "/AdminDboard/AdminDboard3" },
    { label: "Business Owner Dashboard", to: "/AdminDboard/AdminDboard4" },
  ];
  // const projects = [
  //   {
  //     id: "FPX-240",
  //     description: "Creation of Knowledge Base for Customer Support Portal",
  //   },
  //   {
  //     id: "FPX-254",
  //     description: "Development of New Budget Management System",
  //   },
  //   {
  //     id: "FPX-244",
  //     description: "Error Proofing Initiative for Electronics Manufacturer",
  //   },
  //   { id: "FPX-314", description: "New Intake 1704 @ls" },
  // ];
  const statusOptions: StatusOption[] = [
    { label: "On Hold", value: "on-hold", color: "bg-gray-400" },
    { label: "Delayed", value: "delayed", color: "bg-red-500" },
    { label: "On Track", value: "on-track", color: "bg-green-500" },
    { label: "Not Started", value: "not-started", color: "bg-black" },
    { label: "At Risk", value: "at-risk", color: "bg-yellow-400" },
    { label: "Completed", value: "completed", color: "bg-blue-400" },
  ];
  const handleSelect = (project: { id: string; description: string }) => {
    alert(`Selected: ${project.id}`);
  };
  const now = new Date();
  const location = useLocation();
  const customRanges = [
    {
      label: "Today",
      value: () => [startOfDay(now), endOfDay(now)] as [Date, Date],
    },
    {
      label: "Yesterday",
      value: () => {
        const yesterday = subDays(now, 1);
        return [startOfDay(yesterday), endOfDay(yesterday)] as [Date, Date];
      },
    },
    {
      label: "Last 1 Month",
      value: () => {
        const oneMonthAgo = subMonths(now, 1);
        return [startOfDay(oneMonthAgo), endOfDay(now)] as [Date, Date];
      },
    },
    {
      label: "Last Quarter",
      value: () => {
        const lastQuarter = subQuarters(now, 1);
        return [startOfQuarter(lastQuarter), endOfQuarter(lastQuarter)] as [
          Date,
          Date
        ];
      },
    },
    {
      label: "Last Year",
      value: () => {
        const lastYear = subYears(now, 1);
        return [startOfYear(lastYear), endOfYear(lastYear)] as [Date, Date];
      },
    },
    {
      label: "This Month",
      value: () => [startOfMonth(now), endOfMonth(now)] as [Date, Date],
    },
    {
      label: "This Quarter",
      value: () => [startOfQuarter(now), endOfQuarter(now)] as [Date, Date],
    },
    {
      label: "This Year",
      value: () => [startOfYear(now), endOfYear(now)] as [Date, Date],
    },
  ];
  const [projects, setProjects] = useState<any[]>([]);
  const [range, setRange] = useState<any>(null);
  const [start_date, setStartDate] = useState<string>("");
  const [end_date, setEndDate] = useState<string>("");
  const justSelected = useRef(false);
  const [selectedProject_id, setSelectedProject_id] = useState<string>("");
  const handleChange = async (value: any) => {
    //////////////debugger;
    setRange(value);
    let std = selectedStatus.replace("55", "1,2,3,4,10");
    if (value) {
      setStartDate(value[0]?.toLocaleDateString("en-CA"));
      setEndDate(value[1]?.toLocaleDateString("en-CA"));

      await fetch_departments_projects(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );
      await fetch_resource_utilized(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );
      await fetchNumberGame(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );

      await fetchProjectsWithFilters({
        project_id: selectedProject_id,
        raid_priority: selectedPriority,
        project_owner_dept: selectedDepartments,
        status: selectedStatus,
        project_start_date: value[0]?.toLocaleDateString("en-CA"),
        project_end_date: value[1]?.toLocaleDateString("en-CA"),
        page: 1,
        pageSize: rowsPerPage,
      });

      await fetchRAIDBubble(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );
    } else {
      setStartDate("");
      setEndDate("");
      await fetchProjectsWithFilters({
        project_id: selectedProject_id,
        raid_priority: selectedPriority,
        project_owner_dept: selectedDepartments,
        status: selectedStatus,
        project_start_date: "",
        project_end_date: "",
        page: 1,
        pageSize: rowsPerPage,
      });
      // ////////////////debugger;
      await fetch_departments_projects(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        "",
        ""
      );
      await fetch_resource_utilized(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        "",
        ""
      );
      await fetchNumberGame(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        "",
        ""
      );
      await fetchRAIDBubble(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        "",
        ""
      );
    }
  };
  interface Header extends TableColumn {}
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "40",
      url: "AdminDboard",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "project_id",
      column_width: "80",
      url: "AdminDboard",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "project_name",
      column_width: "200",
      url: "AdminDboard",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard",
      order_no: 4,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "100",
      url: "AdminDboard",
      order_no: 5,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "AdminDboard",
      order_no: 6,
    },
    {
      label: "%",
      key: "progress_percentage1",
      visible: false,
      type: "progresscount",
      column_width: "50",
      url: "AdminDboard",
      order_no: 7,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard",
      order_no: 8,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "AdminDboard",
      order_no: 9,
    },
    {
      label: "Proj. Owner Dept.",
      key: "project_owner_dept_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard",
      order_no: 10,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard",
      order_no: 11,
    },
    {
      label: "Bus. Own. Dept.",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard",
      order_no: 12,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard",
      order_no: 13,
    },
    {
      label: "Budget",
      key: "actual_budget",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "AdminDboard",
      order_no: 14,
    },

    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "140",
      url: "AdminDboard",
      order_no: 15,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "140",
      url: "AdminDboard",
      order_no: 16,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "140",
      url: "AdminDboard",
      order_no: 17,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "AdminDboard",
      order_no: 18,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "135",
      url: "AdminDboard",
      order_no: 19,
    },
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartments, setselectedDepartments] = useState<string>("");
  const [chartData3D, setChartData3D] = useState<any>();
  const [EChart3dData, setEChart3dData] = useState<any>();
  const [StatusDataCount, setStatusDataCount] = useState<any>();
  const [bubbleChartData, setBubbleChartData] = useState<any>();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    await fetchProjectsWithFilters({
      project_id: selectedProject_id,
      raid_priority: selectedPriority,
      project_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
      //phase_status: selectedPhase,
      page: page,
      pageSize: rowsPerPage,
    });
  };
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      project_id: selectedProject_id,
      raid_priority: selectedPriority,
      page: 1,
      pageSize: newRowsPerPage,
      project_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
    });
  };
  const fetchProjectsWithFilters = async (
    filters: Record<string, any> = {}
  ) => {
    // Extract pagination info from filters or set defaults
    const page = filters.page || currentPage;
    const pageSize = filters.pageSize || rowsPerPage;
    //////////////////debugger;
    try {
      //setdataLoading(true);

      // Combine pagination and filters into one request payload
      const requestPayload = { PageNo: page, PageSize: pageSize, ...filters };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetDashProjectsWithFilters(requestPayload);
      //console.log('Get Projects Response:', response);
      ////////////////////debugger;
      const result = JSON.parse(response);
      //console.log('Parsed Get Projects Response:', result);

      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        setProjects(result.data.projects);

        const totalRecords = result.pagination.totalRecords;
        setTotalRecords(totalRecords);

        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages);
      } else {
        setProjects([]);
        console.error("Invalid Projects data");
        //Alert.alert('Error', 'Invalid projects data received');
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      //Alert.alert('Error', 'Failed to fetch projects');
    } finally {
      //setdataLoading(false);
    }
  };
  const fetch_departments_projects = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_departments_projects(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );

      const result = JSON.parse(response);
      //var dk = transformToChartData(result);
      //////////////debugger;
      //console.log(dk);
      //setDepartmentChartData(transformToChartData(result));
      const isAllZero = result.data.every(
        (item) => item.total_projects === "0"
      );
      if (isAllZero) {
        setChartData3D([]);
      } else {
        setChartData3D(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      //Alert.alert('Error', 'Failed to fetch departments');
    }
  };
  const fetch_resource_utilized = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await GetutilizedResource(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );
      const result = JSON.parse(response);
      //////////////debugger;
      //setResourceUtilized(result.data);
      setEChart3dData(result);
      // const parsedRes =
      //   typeof response === 'string' ? JSON.parse(response) : response;

      // if (parsedRes.status === 'success' && parsedRes.data?.overall) {
      //   setResourceUtilized(parsedRes.data);
      // } else {
      //   console.error(
      //     'Failed to fetch resource utilization:',
      //     parsedRes.message || 'Unknown error',
      //   );
      // }
    } catch (err) {
      console.error("Error Fetching Resource Utilization:", err);
    }
  };
  const fetchNumberGame = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_project_counts_by_status(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      //////////////debugger;
      //setpieDataChart(result);
      if (result?.message === "No projects found for the specified statuses.") {
        setStatusDataCount([]);
      } else {
        setStatusDataCount(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      //Alert.alert('Error', 'Failed to fetch departments');
    }
  };
  const fetchRAIDBubble = async (
    project_id?: string,
    status?: string,
    dept?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const response = await GetRAIDBubble(
        project_id ?? "",
        "RaidTracker",
        startDate,
        endDate,
        status,
        dept
      );
      const result = JSON.parse(response);
      //////debugger;
      if (result.status === "success") {
        if (result?.data?.length > 0) {
          setBubbleChartData(result?.data);
        } else {
          //let obj = [];
          setBubbleChartData([]);
        }
      } else {
        //var obj = {data: []};
        setBubbleChartData([]);
      }
    } catch (error) {
      console.error("Error fetching bubble chart data:", error);
      setBubbleChartData([]);
    }
  };
  const handleSearch = async (value: any) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchList([]);
      return;
    }

    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const response = await get_projects_autocomplete(searchQuery, "project");
    const result = JSON.parse(response);
    const formatted = result.data.map(
      (item: { value: string; project_id: number }) => ({
        label: item.value,
        value: item.project_id,
      })
    );

    setSearchList(formatted);
  };
  // Sample data for demonstration
  const sampleData = [
    {
      sno: 1,
      customer_project_id: "PRJ001",
      project_name: "Customer Portal Redesign",
      status_name: "In Progress",
      status_color: "In Progress",
      progress_percentage: 75,
      progress_percentage1: 75,
      classification_name: "Digital Transformation",
      project_owner_user_name: "John Smith",
      project_owner_dept_name: "IT Department",
      business_stakeholder_user_name: "Jane Doe",
      business_stakeholder_dept_name: "Marketing",
      project_manager_name: "Mike Johnson",
      actual_budget: 150000,
      start_date: "2024-01-15",
      end_date: "2024-06-30",
      golive_date: "2024-06-15",
      created_by_name: "Admin",
      created_at: "2024-01-01",
    },
    {
      sno: 2,
      customer_project_id: "PRJ002",
      project_name: "Mobile App Development",
      status_name: "Planning",
      status_color: "Planning",
      progress_percentage: 25,
      progress_percentage1: 25,
      classification_name: "Mobile Development",
      project_owner_user_name: "Sarah Wilson",
      project_owner_dept_name: "Product Team",
      business_stakeholder_user_name: "Robert Brown",
      business_stakeholder_dept_name: "Sales",
      project_manager_name: "Lisa Chen",
      actual_budget: 200000,
      start_date: "2024-02-01",
      end_date: "2024-08-31",
      golive_date: "2024-08-15",
      created_by_name: "Admin",
      created_at: "2024-01-15",
    },
    {
      sno: 3,
      customer_project_id: "PRJ003",
      project_name: "Data Analytics Platform",
      status_name: "Completed",
      status_color: "Completed",
      progress_percentage: 100,
      progress_percentage1: 100,
      classification_name: "Analytics",
      project_owner_user_name: "David Chen",
      project_owner_dept_name: "Data Science",
      business_stakeholder_user_name: "Emma Wilson",
      business_stakeholder_dept_name: "Operations",
      project_manager_name: "Alex Rodriguez",
      actual_budget: 300000,
      start_date: "2023-09-01",
      end_date: "2024-03-31",
      golive_date: "2024-03-15",
      created_by_name: "Admin",
      created_at: "2023-08-15",
    },
    {
      sno: 4,
      customer_project_id: "PRJ004",
      project_name: "E-commerce Integration",
      status_name: "On Hold",
      status_color: "On Hold",
      progress_percentage: 40,
      progress_percentage1: 40,
      classification_name: "E-commerce",
      project_owner_user_name: "Maria Garcia",
      project_owner_dept_name: "Digital Commerce",
      business_stakeholder_user_name: "Tom Anderson",
      business_stakeholder_dept_name: "Retail",
      project_manager_name: "Jessica Kim",
      actual_budget: 120000,
      start_date: "2024-03-01",
      end_date: "2024-09-30",
      golive_date: "2024-09-15",
      created_by_name: "Admin",
      created_at: "2024-02-15",
    },
    {
      sno: 5,
      customer_project_id: "PRJ005",
      project_name: "Security Enhancement",
      status_name: "In Progress",
      status_color: "In Progress",
      progress_percentage: 60,
      progress_percentage1: 60,
      classification_name: "Security",
      project_owner_user_name: "Robert Taylor",
      project_owner_dept_name: "IT Security",
      business_stakeholder_user_name: "Linda Brown",
      business_stakeholder_dept_name: "Compliance",
      project_manager_name: "Carlos Martinez",
      actual_budget: 180000,
      start_date: "2024-01-20",
      end_date: "2024-07-30",
      golive_date: "2024-07-15",
      created_by_name: "Admin",
      created_at: "2024-01-10",
    },
    {
      sno: 6,
      customer_project_id: "PRJ006",
      project_name: "Cloud Migration",
      status_name: "Planning",
      status_color: "Planning",
      progress_percentage: 15,
      progress_percentage1: 15,
      classification_name: "Infrastructure",
      project_owner_user_name: "Kevin Wright",
      project_owner_dept_name: "Cloud Operations",
      business_stakeholder_user_name: "Nancy Davis",
      business_stakeholder_dept_name: "Finance",
      project_manager_name: "Andrew Wilson",
      actual_budget: 250000,
      start_date: "2024-04-01",
      end_date: "2024-12-31",
      golive_date: "2024-12-15",
      created_by_name: "Admin",
      created_at: "2024-03-15",
    },
    {
      sno: 7,
      customer_project_id: "PRJ007",
      project_name: "AI Chatbot Implementation",
      status_name: "In Progress",
      status_color: "In Progress",
      progress_percentage: 80,
      progress_percentage1: 80,
      classification_name: "AI/ML",
      project_owner_user_name: "Sophie Chen",
      project_owner_dept_name: "AI Research",
      business_stakeholder_user_name: "Mark Johnson",
      business_stakeholder_dept_name: "Customer Service",
      project_manager_name: "Rachel Green",
      actual_budget: 95000,
      start_date: "2024-02-15",
      end_date: "2024-06-30",
      golive_date: "2024-06-20",
      created_by_name: "Admin",
      created_at: "2024-02-01",
    },
    {
      sno: 8,
      customer_project_id: "PRJ008",
      project_name: "Inventory Management System",
      status_name: "Testing",
      status_color: "Testing",
      progress_percentage: 90,
      progress_percentage1: 90,
      classification_name: "ERP",
      project_owner_user_name: "Michael Brown",
      project_owner_dept_name: "Supply Chain",
      business_stakeholder_user_name: "Lisa Wang",
      business_stakeholder_dept_name: "Warehouse",
      project_manager_name: "Daniel Lee",
      actual_budget: 175000,
      start_date: "2023-11-01",
      end_date: "2024-05-31",
      golive_date: "2024-05-20",
      created_by_name: "Admin",
      created_at: "2023-10-15",
    },
  ];
  const FetchMasterDataPM = async (url: string) => {
    try {
      //setdataLoading(true);
      const response = await GetMasterDataPM(url);
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);

      if (result.status === "success") {
        //permissions
        //////////////debugger;
        setDepartments(result.data.departments);
        //Column Visibility
        if (result.data.column_visibility.length > 0) {
          setHeaders(result.data.column_visibility);
          setIsColumnVisibility(true);
        } else {
          setIsColumnVisibility(false);
        }

        //All Status
        statuses.splice(0, statuses.length);
        const std = result.data.status_all;
        std.forEach((element: any) => {
          statuses.push({
            label: element.status_name,
            value: element.status_id,
            group: element.description,
            color: element.status_color?.trim(),
          });
        });
        setStatuses(statuses);
      }
      setUserPermissions(result.data.user_permissions);

      // if (result.status === 'error') {
      //   setIsColumnVisibility(false);
      // }
      // if (result.status === 'success') {
      //   setHeaders(result.data);
      //   setIsColumnVisibility(true);
      // }
    } catch (error) {
      console.error("Error fetching projects:", error);
      //Alert.alert('Error', 'Failed to fetch projects');
      //setdataLoading(false);
    }
  };
  const fetchChartsData = async () => {
    try {
      const response = await getChartsData();
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      //////////////debugger;
      setStatusDataCount(result.data.project_counts_by_status);

      const isAllZero = result.data.department_projects.every(
        (item1) => item1.total_projects === "0"
      );
      if (isAllZero) {
        setChartData3D([]);
      } else {
        setChartData3D(result.data.department_projects);
      }
      //setChartData3D(result.data.department_projects);
      // setResourceUtilized(result.data.resource_utilization);
      setEChart3dData(result);
      console.log(
        "Passing departments to chart:",
        result.data.resource_utilization
      );
    } catch (error) {
      console.error("Error fetching departments:", error);
      //Alert.alert('Error', 'Failed to fetch departments');
    }
  };
  useEffect(() => {
    const filters = location.state?.filters;

    (async () => {
      // localStorage.setItem(
      //   "Token",
      //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJyb2xlX2lkIjozLCJjdXN0b21lcl9pZCI6MSwicGVybWlzc2lvbl9pZHMiOls2Miw2Myw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCwxNCwxNiwxOCwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMiwzMywzNCwzNSwzNiwzOCwzOSw0MCw0MSw1MSw1Miw1Myw1NCw1NSw1Niw1Nyw1OCw1OSw2MCw2MSw2NCw2NSw2Niw2Nyw2OCw2OSw3MCw3MV0sInVzZXJfbmFtZSI6IkpvbiBEb2UiLCJpYXQiOjE3NTM5MDc2MzUsImV4cCI6MTc1MzkwODgzNX0.GA1GTMelas7v55EBPlzE_aaBqXupVMNUa7EHpfxC5Z8"
      // );
      await FetchMasterDataPM("AdminDboard");

      if (filters) {
        setSearchQuery(filters.keyword || "");
        setselectedDepartments(filters.dept || "");
        setSelectedStatus(filters.status || "");

        const dept = Array.isArray(filters?.dept)
          ? filters.dept.join(",")
          : filters?.dept || "";
        const status = Array.isArray(filters?.status)
          ? filters.status.join(",")
          : filters?.status || "";

        await fetch_departments_projects(
          filters.project_id || "",
          status,
          dept,
          filters.start_date || start_date,
          filters.end_date || end_date
        );

        await fetchNumberGame(
          filters.project_id || "",
          status,
          dept,
          filters.start_date || start_date,
          filters.end_date || end_date
        );

        await fetchProjectsWithFilters({
          project_id: filters.project_id || "",
          raid_priority: selectedPriority,
          project_owner_dept: dept,
          status: status,
          project_start_date: filters.start_date || start_date,
          project_end_date: filters.end_date || end_date,
          page: 1,
          pageSize: rowsPerPage,
        });

        fetchRAIDBubble(
          filters.project_id || "",
          selectedStatus,
          selectedDepartments,
          filters.start_date || start_date,
          filters.end_date || end_date
        );
      } else {
        fetchProjectsWithFilters({
          project_id: selectedProject_id,
          raid_priority: selectedPriority,
          project_owner_dept: selectedDepartments,
          status: selectedStatus,
          project_start_date: start_date,
          project_end_date: end_date,
          page: 1,
          pageSize: rowsPerPage,
        });

        fetchRAIDBubble(
          selectedProject_id,
          selectedStatus,
          selectedDepartments,
          start_date,
          end_date
        );

        fetchChartsData();
      }

      //setLoading(false);
      // setDataLoading(false);
    })();
  }, [location]);
  return (
    <div className="">
      {/* Row 1 - Tabs aligned left */}
      <div className="flex justify-start">
        <CustomTabs tabs={tabItems} />
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Status: Active</TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>

      {/* Row 2 - Tabs aligned right */}
      <div className="flex justify-end mt-4 gap-2">
        <AutoComplete
          placeholder="&#x1F50D;Search Project..."
          data={searchList}
          // style={{
          //   width: 224,
          //   border: "1px solid black",
          //   borderRadius: 4,
          //   padding: 3, // optional: to avoid input hugging the border
          //   marginRight: 10,
          // }}
          value={searchQuery}
          // onChange={setSearchQuery}
          onChange={(val) => {
            if (justSelected.current) {
              // ignore this change caused by select
              justSelected.current = false;
              const selected = searchList.find((m) => m.value === val);
              if (selected) {
                setSearchQuery(selected.label);
              }
              return;
            }
            handleSearch(val);
          }}
          onSelect={async (item: any) => {
            justSelected.current = true;
            console.log("Selected project ID:", item);
            setSelectedProject_id(item);
            await fetchProjectsWithFilters({
              project_id: item,
              raid_priority: selectedPriority,
              project_owner_dept: selectedDepartments,
              status: selectedStatus,
              project_start_date: start_date,
              project_end_date: end_date,
              page: 1,
              pageSize: rowsPerPage,
            });
            // ////////////////debugger;
            await fetch_departments_projects(
              item,
              selectedStatus,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetch_resource_utilized(
              item,
              selectedStatus,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchNumberGame(
              item,
              selectedStatus,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchRAIDBubble(
              item,
              selectedStatus,
              selectedDepartments,
              start_date,
              end_date
            );
          }}
          className="custom-autocomplete"
          menuClassName="custom-autocomplete-menu"
        />
        {/* <ProjectAutocomplete projects={projects} onSelect={handleSelect} /> */}
        {/* <StatusMultiSelect
          statuses={statusOptions}
          selected={selectedStatus || ""}
          onChange={setSelectedStatus}
        /> */}

        {/* <RangeDatePicker onApply={(range) => console.log("Selected:", range)} /> */}
        {/* <div>
          <Calendar mode="range" selected={range} onSelect={setRange} />
          <p>
            {range.from?.toDateString()} - {range.to?.toDateString()}
          </p>
        </div> */}
        {/* <StatusMultiSelect
          statuses={statusOptions}
          selected={selectedStatus || ""}
          onChange={setSelectedStatus}
        />
        <StatusMultiSelect
          statuses={statusOptions}
          selected={selectedStatus || ""}
          onChange={setSelectedStatus}
        />
        <StatusMultiSelect
          statuses={statusOptions}
          selected={selectedStatus || ""}
          onChange={setSelectedStatus}
        /> */}
        <MultiSelectDropdown
          items={statuses}
          placeholder="Filter by Status"
          selected={
            selectedStatus?.length > 0 ? selectedStatus?.split(",") : []
          }
          onChange={async function (selected: string[]): Promise<void> {
            ////debugger;
            const worker: any = selected?.join(",");

            setSelectedStatus(worker ?? "");
            setSearchQuery("");

            await fetchProjectsWithFilters({
              project_id: selectedProject_id,
              raid_priority: selectedPriority,
              status: worker,
              project_owner_dept: selectedDepartments,

              project_start_date: start_date,
              project_end_date: end_date,
              page: 1,
              pageSize: rowsPerPage,
            });

            await fetch_departments_projects(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchNumberGame(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchRAIDBubble(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date
            );
          }}
        />
        <MultiSelectDepartment
          placeholder="Select Departments"
          departments={departments}
          selected={
            selectedDepartments?.length > 0
              ? selectedDepartments?.split(",")
              : []
          }
          onChange={async function (selected: string[]): Promise<void> {
            const worker = selected?.join(",");
            setselectedDepartments(worker ?? "");
            await fetchProjectsWithFilters({
              project_id: selectedProject_id,
              raid_priority: selectedPriority,
              project_owner_dept: worker,
              status: selectedStatus,
              project_start_date: start_date,
              project_end_date: end_date,
              page: 1,
              pageSize: rowsPerPage,
            });
            // ////////////////debugger;
            await fetch_departments_projects(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date
            );
            await fetch_resource_utilized(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date
            );
            await fetchNumberGame(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date
            );
            await fetchRAIDBubble(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date
            );
          }}
        />
        <DateRangePicker
          //placeholder="Select date range"
          ranges={customRanges}
          className="ml-2"
          value={range}
          // ranges={customRanges}
          format="MM/dd/yyyy"
          onChange={handleChange}
          // style={
          //   {
          //     color: "black",
          //     "--rs-picker-placeholder-color": "black",
          //   } as React.CSSProperties
          // }
          placement="bottomEnd"
          placeholder="mm/dd/yyyy - mm/dd/yyyy"
          editable={false}
          // shouldDisableDate={combine(allowedMaxDays(7), beforeToday())}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Box 1 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-800/40 p-4">
          {/* <h2 className="text-md font-semibold">Project Owner Departments</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[300px]">
            {/* <PieChart1 /> */}

            <div style={{ padding: 10, color: "black" }}>
              {selectedDepartments?.length > 0 ? (
                <>
                  <strong>Project Owner Departments:</strong>{" "}
                  {selectedDepartments
                    .split(",")
                    .map(
                      (val) =>
                        departments?.find(
                          (m) => m.department_id?.toString() === val?.toString()
                        )?.department_name || "N/A"
                    )
                    .join(", ")}
                </>
              ) : (
                <strong>Project Owner Departments</strong>
              )}
            </div>

            {chartData3D?.length > 0 ? (
              <ThreeDPieChart
                data={chartData3D}
                onClcked={async function (
                  worker1: string,
                  worker2: string
                ): Promise<void> {
                  setselectedDepartments(worker1 ?? "");

                  await fetch_departments_projects(
                    selectedProject_id,
                    selectedStatus,
                    worker1,
                    start_date,
                    end_date
                  );
                  await fetch_resource_utilized(
                    selectedProject_id,
                    selectedStatus,
                    worker1,
                    start_date,
                    end_date
                  );
                  await fetchNumberGame(
                    selectedProject_id,
                    selectedStatus,
                    worker1,
                    start_date,
                    end_date
                  );

                  await fetchProjectsWithFilters({
                    project_id: selectedProject_id,
                    raid_priority: selectedPriority,
                    project_owner_dept: worker1,
                    page: 1,
                    pageSize: rowsPerPage,

                    status: selectedStatus,
                    project_start_date: start_date,
                    project_end_date: end_date,
                  });
                  await fetchRAIDBubble(
                    selectedProject_id,
                    selectedStatus,
                    worker1,
                    start_date,
                    end_date
                  );
                }}
              />
            ) : (
              <>
                {(() => {
                  //////////////debugger;
                  if (chartData3D?.length === 0) {
                    //////////////debugger; // Breakpoint hits here
                    return (
                      <div style={styles.card}>
                        <label style={styles.message}>No records</label>
                      </div>
                    );
                  }

                  return null;
                })()}
              </>
            )}
          </div>
        </div>

        {/* Box 2 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-800/40 p-4">
          {/* <h2 className="text-md font-semibold ">RAID Status</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[300px]">
            <div style={{ padding: 10, color: "black" }}>
              {selectedDepartments?.length > 0 ? (
                <>
                  <strong>RAID Status:</strong>{" "}
                  {selectedDepartments
                    .split(",")
                    .map(
                      (val) =>
                        departments?.find(
                          (m) => m.department_id?.toString() === val?.toString()
                        )?.department_name || "N/A"
                    )
                    .join(", ")}
                </>
              ) : (
                <strong>RAID Status</strong>
              )}
            </div>

            {bubbleChartData?.length > 0 ? (
              <RAID3DBarChartV4
                data={bubbleChartData}
                onClcked={async function (
                  worker1?: string,
                  worker2?: string
                ): Promise<void> {
                  //setChartLoading1(true);
                  //setdataLoading(true);
                  // ////////////debugger;
                  console.log(statuses);
                  const str: any = bubbleChartData?.filter(
                    (m) => m.priority === worker1
                  )[0].priority_id;
                  setSelectedPriority(str?.toString());
                  setCurrentPage(1);
                  //////debugger;

                  await fetchProjectsWithFilters({
                    project_id: selectedProject_id,
                    status: selectedStatus,
                    project_start_date: start_date,
                    project_end_date: end_date,
                    page: 1,
                    pageSize: rowsPerPage,
                    project_owner_dept: selectedDepartments,
                    raid_priority: bubbleChartData?.filter(
                      (m) => m.priority === worker1
                    )[0].priority_id,
                  });
                  // await fetch_departments_projects(
                  //   selectedStatus ?? '',
                  //   selectedDepartments,
                  //   start_date,
                  //   end_date,
                  // );

                  // setdataLoading(false);
                  // setselectedDepartments('');
                  // setChartLoading1(false);
                  //fetch_departments_projects(selectedDepartments, worker1 ?? '');
                }}
                // height={200}
                // width={width * 0.3}
              />
            ) : (
              <>
                {(() => {
                  //////debugger;
                  if (bubbleChartData?.length === 0) {
                    ////////////debugger; // Breakpoint hits here
                    return (
                      <div style={styles.card}>
                        <label style={styles.message}>No records</label>
                      </div>
                    );
                  }

                  return null;
                })()}
              </>
            )}
          </div>
        </div>

        {/* Box 3 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-800/40 p-4">
          {/* <h2 className="text-md font-semibold ">Status Breakdown</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[300px]">
            <div style={{ padding: 10, color: "black" }}>
              {selectedDepartments?.length === 0 &&
              selectedStatus?.length === 0 ? (
                <>
                  <strong>Status Breakdown</strong>
                </>
              ) : (
                <div />
              )}
              {selectedDepartments?.length > 0 ? (
                <>
                  <strong>Projects Across:</strong>{" "}
                  {selectedDepartments
                    .split(",")
                    .map(
                      (val) =>
                        departments?.find(
                          (m) => m.department_id?.toString() === val?.toString()
                        )?.department_name || "N/A"
                    )
                    .join(", ")}
                </>
              ) : (
                <div />
              )}
              {selectedStatus?.length > 0 ? (
                <>
                  {selectedDepartments?.length > 0 && <br />}
                  <strong>Projects Across:</strong>{" "}
                  {selectedStatus
                    .split(",")
                    .map(
                      (val) =>
                        statuses?.find(
                          (m) => m.value?.toString() === val?.toString()
                        )?.label || "N/A"
                    )
                    .join(", ")}
                </>
              ) : (
                <div />
              )}
            </div>

            {StatusDataCount?.length > 0 ? (
              <DoughuntPieChart
                data={StatusDataCount}
                onClcked={async function (
                  worker1?: string,
                  worker2?: string
                ): Promise<void> {
                  //setChartLoading1(true);
                  //setdataLoading(true);
                  // ////////////debugger;
                  console.log(statuses);

                  setSelectedStatus(
                    worker1?.includes(",") ? "55" : worker1 ?? ""
                  );
                  setCurrentPage(1);
                  await fetchProjectsWithFilters({
                    project_id: selectedProject_id,
                    raid_priority: selectedPriority,
                    status: worker1,
                    project_start_date: start_date,
                    project_end_date: end_date,
                    page: 1,
                    pageSize: rowsPerPage,
                    project_owner_dept: selectedDepartments,
                  });
                  await fetch_departments_projects(
                    selectedProject_id,
                    worker1 ?? "",
                    selectedDepartments,
                    start_date,
                    end_date
                  );
                  await fetchRAIDBubble(
                    selectedProject_id,
                    worker1 ?? "",
                    selectedDepartments,
                    start_date,
                    end_date
                  );

                  //setdataLoading(false);
                }}
                height={250}
                width={400}
              />
            ) : (
              <>
                {(() => {
                  //////////////debugger;
                  if (StatusDataCount?.length === 0) {
                    ////////////debugger; // Breakpoint hits here
                    return (
                      <div style={styles.card}>
                        <label style={styles.message}>No records</label>
                      </div>
                    );
                  }

                  return null;
                })()}
              </>
            )}
          </div>
        </div>
      </div>
      <AdvancedDataTable
        data={projects}
        columns={headers}
        title="Project Dashboard"
        //pageSize={3}
        exportFileName="projects"
        isPagingEnable={true}
        PageNo={currentPage}
        TotalPageCount={totalPages}
        rowsOnPage={rowsPerPage}
        onrowsOnPage={handleRowsPerPageChange}
        onPageChange={function (worker: number): void {
          //handleViewPress(parseInt(worker ?? '', 10));
          //worker => handlePageChange(worker);
          //setdataLoading(true);
          handlePageChange(worker);
          //setdataLoading(false);
        }}
      />
      {/* Content Below */}
      <div>
        {/* <h2 className="text-2xl font-semibold mb-4">Home Page</h2>
        <p>Welcome to the Dashboard 1!</p> */}
        {/* <UserTable /> */}
      </div>
      {/* <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Project Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track your projects
          </p>
        </div>
        <AdvancedDataTable
          data={sampleData}
          columns={headers}
          title="Project Dashboard"
          pageSize={3}
          exportFileName="projects"
        />
      </div> */}
    </div>
  );
};
const styles = {
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5, // shadow for Android
    shadowColor: "#000", // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 20,
    marginHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
};

export default Dashboard1;
