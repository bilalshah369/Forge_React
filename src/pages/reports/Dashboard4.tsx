/* eslint-disable no-var */
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
  get_project_Budget_Impact_BO,
  get_project_counts_by_status,
  get_projects_autocomplete,
  GetDashProjectsWithFilters,
  GetMasterDataPM,
  GetRAIDBubble,
} from "@/utils/PM";
import {
  get_departments_projects_BO,
  get_project_counts_by_status_BO,
  GetBOChartData,
  GetBOProjectsWithFilters,
  GetBORaidData,
  getChartsData,
  GetutilizedResource,
} from "@/utils/AdminDboad";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import ThreeDPieChart from "../charts/ThreeDPieChart";
import RAID3DBarChartV4 from "../charts/RAID3DBarChartV4";
import DoughuntPieChart from "../charts/DoughuntPieChart";
import DoughPieChart from "../charts/DoughPieChart";
// src/pages/HomePage.tsx
const Dashboard4 = () => {
  const [selectedBudgetImpact, setSelectedBudgetImpact] = useState<string>("");

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchList, setSearchList] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalRecordsw, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const tabItems = [
    { label: "Status Dashboard", to: "/AdminDboard" },
    { label: "Budget Dashboard", to: "/AdminDboard/AdminDboard2" },
    { label: "Resource Dashboard", to: "/AdminDboard/AdminDboard3" },
    {
      label: "Business Owner Dashboard",
      to: "/AdminDboard/AdminDboard4",
      active: true,
    },
  ];
  const { labels } = { labels: {} }; //useLabels();
  const labelDepartment = labels["department"] || {
    display: "Department",
    placeholder: "Enter Department",
    dropdown: "Select Department",
  };
  const labelProjectOwner = labels["project_owner_user_name"] || {
    display: "Project Owner",
    placeholder: "Enter Project Owner Name",
    dropdown: "Select Project Owner",
  };
  const labelBusinessOwner = labels["business_stakeholder_user_name"] || {
    display: "Business Owner",
    placeholder: "Enter Business Owner Name",
    dropdown: "Select Business Owner",
  };
  const labelBudgetImpact = labels["budget_impact"] || {
    display: "Budget Impact",
    placeholder: "Enter Budget Impact",
    dropdown: "Select Budget Impact",
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
  const handleSearch = async (value: any) => {
    ////debugger;
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchList([]);
      return;
    }

    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const response = await get_projects_autocomplete(searchQuery);
    //console.log('unparsed Department Response:', response);
    const result = JSON.parse(response);
    const formatted = result.data.map(
      (item: { value: string; project_id: number }) => ({
        label: item.value,
        value: item.project_id,
      })
    );

    setSearchList(formatted);
  };
  const handleChange = async (value: any) => {
    //////////////debugger;
    setRange(value);
    let std = selectedStatus.replace("55", "1,2,3,4,10");
    if (value) {
      setStartDate(value[0]?.toLocaleDateString("en-CA"));
      setEndDate(value[1]?.toLocaleDateString("en-CA"));
      console.log("Selected Range:", value); // Logs selected range

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
      await fetchBudgetImpact(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA"),
        selectedBudgetImpact
        //phase_status: selectedPhase,
        // page: 1,
        // pageSize: rowsPerPage,
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
        business_owner_dept: selectedDepartments,
        status: selectedStatus,
        project_start_date: value[0]?.toLocaleDateString("en-CA"),
        project_end_date: value[1]?.toLocaleDateString("en-CA"),
        page: 1,
        pageSize: rowsPerPage,
      });
    } else {
      setStartDate("");
      setEndDate("");
      await fetchProjectsWithFilters({
        project_id: selectedProject_id,
        raid_priority: selectedPriority,
        business_owner_dept: selectedDepartments,
        status: selectedStatus,
        project_start_date: "",
        project_end_date: "",
        page: 1,
        pageSize: rowsPerPage,
      });
      // //////////////debugger;
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
      await fetchBudgetImpact(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA"),
        selectedBudgetImpact
        //phase_status: selectedPhase,
        // page: 1,
        // pageSize: rowsPerPage,
      );
      await fetchNumberGame(
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
      type: "",
      column_width: "40",
      url: "AdminDboard4",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "",
      column_width: "80",
      url: "AdminDboard4",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 4,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "100",
      url: "AdminDboard4",
      order_no: 5,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "AdminDboard4",
      order_no: 6,
    },
    {
      label: "%",
      key: "progress_percentage1",
      visible: false,
      type: "progresscount",
      column_width: "50",
      url: "AdminDboard4",
      order_no: 7,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 8,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 13,
    },
    {
      label: "Bus. Own. Dept.",
      key: "business_stakeholder_dept_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 10,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 11,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "AdminDboard4",
      order_no: 9,
    },
    {
      label: "Proj. Owner Dept.",
      key: "business_owner_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 12,
    },
    {
      label: "Budget",
      key: "actual_budget",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "AdminDboard4",
      order_no: 14,
    },

    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "140",
      url: "AdminDboard4",
      order_no: 15,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "140",
      url: "AdminDboard4",
      order_no: 16,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "140",
      url: "AdminDboard4",
      order_no: 17,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "AdminDboard4",
      order_no: 18,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "135",
      url: "AdminDboard4",
      order_no: 19,
    },
  ]);
  const [headersRaid, setHeadersRaid] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "",
      column_width: "50",
      url: "RaidTracker",
      order_no: 1,
    },
    /*  {
        label: 'Title',
        key: 'title',
        visible: true,
        type: '',
        column_width: '200',
      }, */

    {
      label: "Project ID",
      key: "customer_project_id",
      visible: true,
      type: "",
      column_width: "200",
      url: "RaidTracker",
      order_no: 2,
    },

    {
      label: "Type",
      key: "type",
      visible: true,
      type: "raid",
      column_width: "200",
      url: "RaidTracker",
      order_no: 3,
    },

    {
      label: "Description",
      key: "description",
      visible: true,
      type: "desc",
      column_width: "200",
      url: "RaidTracker",
      order_no: 4,
    },
    {
      label: "Mitigation Plan",
      key: "next_status",
      visible: true,
      type: "desc",
      column_width: "200",
      url: "RaidTracker",
      order_no: 5,
    },
    {
      label: "Owner",
      key: "raid_owner_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "RaidTracker",
      order_no: 6,
    },
    {
      label: "Status",
      key: "status_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "RaidTracker",
      order_no: 7,
    },
    {
      label: "Due Date",
      key: "due_date",
      visible: false,
      type: "date",
      column_width: "200",
      url: "RaidTracker",
      order_no: 8,
    },
    {
      label: "Priority",
      key: "priority_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "RaidTracker",
      order_no: 9,
    },

    // {
    //   label: 'Action',
    //   key: 'action',
    //   visible: true,
    //   type: '',
    //   column_width: '100',
    //   url: 'RaidTracker',
    //   order_no: 10,
    // },
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
  const FetchMasterDataPM = async (url: string) => {
    try {
      //setdataLoading(true);
      const response = await GetMasterDataPM(url);
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);

      if (result.status === "success") {
        //permissions
        ////////////debugger;
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
        var std = result.data.status_all;
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
      const response = await GetBOChartData();
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      ////////////debugger;
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

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      project_id: selectedProject_id,
      raid_priority: selectedPriority,
      page: 1,
      pageSize: newRowsPerPage,
      business_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
      budget_impact: selectedBudgetImpact,
    });
  };
  const fetchProjectsWithFilters = async (
    filters: Record<string, any> = {}
  ) => {
    // Extract pagination info from filters or set defaults
    const page = filters.page || currentPage;
    const pageSize = filters.pageSize || rowsPerPage;
    ////////////////debugger;
    try {
      //setdataLoading(true);
      //filter.business;

      // Combine pagination and filters into one request payload
      const requestPayload = { PageNo: page, PageSize: pageSize, ...filters };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetBOProjectsWithFilters(requestPayload);
      //console.log('Get Projects Response:', response);
      //////////////////debugger;
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
  const handleViewPress = (id: number) => {
    //console.log('Navigating with Project ID:', id);
    // navigate("ProjectPreview", {
    //   projectId: id,
    //   isApproved: true,
    //   redirect: "AdminDboard4",
    //   filters: {
    //     keyword: searchQuery || "",
    //     dept: selectedDepartments || "",
    //     status: selectedStatus || "",
    //     project_id: selectedProject_id || "",
    //     start_date: start_date || "",
    //     end_date: end_date || "",
    //   },
    // });
  };
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    // if (isSearching) {
    //   fetchSearchedProjects(page, rowsPerPage, searchQuery);

    // } else {
    //   fetchProjects(page, rowsPerPage);
    // }
    await fetchProjectsWithFilters({
      project_id: selectedProject_id,
      raid_priority: selectedPriority,
      business_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
      //phase_status: selectedPhase,
      page: page,
      pageSize: rowsPerPage,
      budget_impact: selectedBudgetImpact,
    });
  };
  const fetchNumberGame = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_project_counts_by_status_BO(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      ////////////debugger;
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

  const fetch_departments_projects = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_departments_projects_BO(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );

      const result = JSON.parse(response);
      //var dk = transformToChartData(result);
      ////////////debugger;
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
      ////////////debugger;
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
  const fetchBudgetImpact = async (
    project_id: string,
    status?: string,
    dept?: string,
    startDate?: string,
    endDate?: string,
    budget_impact?: string
  ) => {
    try {
      const response = await get_project_Budget_Impact_BO(
        project_id,
        status ?? "",
        dept ?? "",
        startDate ?? "",
        endDate ?? "",
        budget_impact ?? ""
      );
      const result = JSON.parse(response);
      ////debugger;
      if (result.status === "success") {
        if (result?.data?.length > 0) {
          setBubbleChartData(result?.data);
        } else {
          var obj = [];
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
  const fetchRAIDBubble = async (
    status?: string,
    dept?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const response = await GetBORaidData(
        "RaidTracker",
        startDate,
        endDate,
        status,
        dept
      );
      const result = JSON.parse(response);
      ////debugger;
      if (result.status === "success") {
        if (result?.data?.length > 0) {
          setBubbleChartData(result?.data);
        } else {
          var obj = [];
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
  useEffect(() => {
    const filters = location.state?.filters;

    (async () => {
      // localStorage.setItem(
      //   "Token",
      //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJyb2xlX2lkIjozLCJjdXN0b21lcl9pZCI6MSwicGVybWlzc2lvbl9pZHMiOls2Miw2Myw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCwxNCwxNiwxOCwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMiwzMywzNCwzNSwzNiwzOCwzOSw0MCw0MSw1MSw1Miw1Myw1NCw1NSw1Niw1Nyw1OCw1OSw2MCw2MSw2NCw2NSw2Niw2Nyw2OCw2OSw3MCw3MV0sInVzZXJfbmFtZSI6IkpvbiBEb2UiLCJpYXQiOjE3NTM5MDc2MzUsImV4cCI6MTc1MzkwODgzNX0.GA1GTMelas7v55EBPlzE_aaBqXupVMNUa7EHpfxC5Z8"
      // );
      localStorage.setItem("UserState", "AdminDboard4");
      FetchMasterDataPM("AdminDboard4");

      //const filters = route?.params?.filters;
      if (filters) {
        setSearchQuery(filters.keyword || "");
        setselectedDepartments(filters.dept || "");
        setSelectedStatus(filters.status || "");
        setRange([new Date(filters.start_date), new Date(filters.end_date)]);
        const dept = Array.isArray(filters?.dept)
          ? filters.dept.join(",")
          : filters?.dept || "";
        const status = Array.isArray(filters?.status)
          ? filters.status.join(",")
          : filters?.status || "";

        await fetch_departments_projects(
          filters.project_id || "",
          status || "",
          dept || "",
          filters.start_date || start_date,
          filters.end_date || end_date
        );
        await fetchNumberGame(
          filters.project_id || "",
          status || "",
          dept || "",
          filters.start_date || start_date,
          filters.end_date || end_date
        );
        await fetchProjectsWithFilters({
          project_id: filters.project_id || "",
          raid_priority: selectedPriority,
          project_owner_dept: dept || "",
          status: status || "",
          project_start_date: filters.start_date || start_date,
          project_end_date: filters.end_date || end_date,
          page: 1,
          pageSize: rowsPerPage,
          budget_impact: selectedBudgetImpact,
        });
        await fetchBudgetImpact(
          filters.project_id || "",
          status || "",
          dept || "",
          filters.start_date || start_date,
          filters.end_date || end_date,
          selectedBudgetImpact
        );
      } else {
        fetchProjectsWithFilters({
          project_id: selectedProject_id,
          raid_priority: selectedPriority,
          business_owner_dept: selectedDepartments,
          status: selectedStatus,
          project_start_date: start_date,
          project_end_date: end_date,
          page: 1,
          pageSize: rowsPerPage,
          budget_impact: selectedBudgetImpact,
        });
        fetchBudgetImpact(
          selectedProject_id,
          selectedStatus,
          selectedDepartments,
          start_date,
          end_date,
          selectedBudgetImpact
        );
        fetchChartsData();
      }
    })();
  }, [location]);
  return (
    <div className="">
      {/* Row 1 - Tabs aligned left */}
      <div className="flex justify-start">
        <CustomTabs tabs={tabItems} />
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
              status: selectedStatus,
              business_owner_dept: selectedDepartments,

              project_start_date: start_date,
              project_end_date: end_date,
              page: 1,
              pageSize: rowsPerPage,
              budget_impact: selectedBudgetImpact,
            });
            await fetch_departments_projects(
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
            await fetchBudgetImpact(
              item,
              selectedStatus,
              selectedDepartments,

              start_date,
              end_date,
              selectedBudgetImpact
              //phase_status: selectedPhase,
              // page: 1,
              // pageSize: rowsPerPage,
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
              business_owner_dept: selectedDepartments,

              project_start_date: start_date,
              project_end_date: end_date,
              page: 1,
              pageSize: rowsPerPage,
              budget_impact: selectedBudgetImpact,
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
            await fetchBudgetImpact(
              selectedProject_id,
              worker,
              selectedDepartments,

              start_date,
              end_date,
              selectedBudgetImpact
              //phase_status: selectedPhase,
              // page: 1,
              // pageSize: rowsPerPage,
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
              business_owner_dept: worker,
              status: selectedStatus,
              project_start_date: start_date,
              project_end_date: end_date,
              page: 1,
              pageSize: rowsPerPage,
              budget_impact: selectedBudgetImpact,
            });
            // //////////////debugger;
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
            await fetchBudgetImpact(
              selectedProject_id,
              selectedStatus,
              worker,

              start_date,
              end_date,
              selectedBudgetImpact
              //phase_status: selectedPhase,
              // page: 1,
              // pageSize: rowsPerPage,
            );
            await fetchNumberGame(
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
        <div className="bg-white rounded-xl shadow-lg shadow-blue-500/50 p-4">
          {/* <h2 className="text-md font-semibold">Project Owner Departments</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[300px]">
            {/* <PieChart1 /> */}

            <div style={{ padding: 10, color: "black" }}>
              {selectedDepartments?.length > 0 ? (
                <>
                  <strong>
                    {labelBusinessOwner.display} {labelDepartment.plural}:
                  </strong>{" "}
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
                <strong>
                  {labelBusinessOwner.display} {labelDepartment.plural}
                </strong>
              )}
            </div>

            {chartData3D?.length > 0 ? (
              <ThreeDPieChart
                data={chartData3D}
                onClcked={async function (
                  worker1: string,
                  worker2: string
                ): Promise<void> {
                  //setChartLoading1(true);
                  //setdataLoading(true);
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
                  await fetchBudgetImpact(
                    selectedProject_id,
                    selectedStatus,
                    worker1,
                    start_date,
                    end_date,
                    selectedBudgetImpact
                    //phase_status: selectedPhase,
                    // page: 1,
                    // pageSize: rowsPerPage,
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
                    business_owner_dept: worker1,
                    page: 1,
                    pageSize: rowsPerPage,

                    status: selectedStatus,
                    project_start_date: start_date,
                    project_end_date: end_date,
                    budget_impact: selectedBudgetImpact,
                  });

                  //////debugger;
                  console.log(selectedStatus);
                }}
                // height={200}
                // width={'100%'}
                //width={width * 0.3}
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
        <div className="bg-white rounded-xl shadow-lg shadow-blue-500/50 p-4">
          {/* <h2 className="text-md font-semibold ">RAID Status</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[300px]">
            <div style={{ padding: 10, color: "black" }}>
              {selectedDepartments?.length > 0 ? (
                <>
                  <strong>{labelBudgetImpact.display}:</strong>{" "}
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
                <strong>{labelBudgetImpact.display}</strong>
              )}
            </div>
            <div>
              {bubbleChartData?.length > 0 ? (
                <DoughPieChart
                  data={bubbleChartData}
                  onClcked={async function (
                    worker1?: string,
                    worker2?: string
                  ): Promise<void> {
                    //setChartLoading1(true);
                    //setdataLoading(true);
                    // //////////debugger;
                    console.log(statuses);

                    setSelectedBudgetImpact(worker1 ?? "");
                    setCurrentPage(1);
                    await fetchProjectsWithFilters({
                      project_id: selectedProject_id,
                      budget_impact: worker1,
                      status: selectedStatus,
                      project_start_date: start_date,
                      project_end_date: end_date,
                      page: 1,
                      pageSize: rowsPerPage,
                      project_owner_dept: selectedDepartments,
                    });
                    // await fetch_departments_projects(
                    //   selectedStatus ?? '',
                    //   selectedDepartments,
                    //   start_date,
                    //   end_date,
                    //   worker1 ?? '',
                    // );
                    // await fetchBudgetDataCount(
                    //   selectedStatus,
                    //   selectedDepartments,
                    //   start_date,
                    //   end_date,
                    //   worker1 ?? '',
                    // );
                    //setdataLoading(false);
                    // setselectedDepartments('');
                    // setChartLoading1(false);
                    //fetch_departments_projects(selectedDepartments, worker1 ?? '');
                  }}
                  height={250}
                  width={400}
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
        </div>

        {/* Box 3 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-500/50 p-4">
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
                  // //////////debugger;
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
                    business_owner_dept: selectedDepartments,
                    budget_impact: selectedBudgetImpact,
                  });
                  await fetch_departments_projects(
                    selectedProject_id,
                    worker1 ?? "",
                    selectedDepartments,
                    start_date,
                    end_date
                  );

                  await fetchBudgetImpact(
                    selectedProject_id,
                    worker1,
                    selectedDepartments,
                    start_date,
                    end_date,
                    selectedBudgetImpact
                    //phase_status: selectedPhase,
                    // page: 1,
                    // pageSize: rowsPerPage,
                  );
                  //setdataLoading(false);
                  // setselectedDepartments('');
                  // setChartLoading1(false);
                  //fetch_departments_projects(selectedDepartments, worker1 ?? '');
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
        pageSize={10}
        exportFileName="projects"
      />
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

export default Dashboard4;
