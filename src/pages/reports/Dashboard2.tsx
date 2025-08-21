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
import { formatAmountWithoutDollarSign, hasPermission } from "../../utils/util";

import "rsuite/dist/rsuite.min.css"; // Ensure RSuite styles are included
import UserTable from "@/components/ui/UserTable";
import { TableColumn } from "@/hooks/useDataTable";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  get_departments_projects,
  get_departments_projects_Budget,
  get_project_Budget,
  get_project_Budget_Impact,
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
import BurndownChart from "../charts/BurndownChart";
import PieChartBudget from "../charts/PieChartBudget";
import DoughPieChart from "../charts/DoughPieChart";
// src/pages/HomePage.tsx
const Dashboard2 = () => {
  interface Header extends TableColumn {}
  const now = new Date();
  const currentYear = new Date().getFullYear();
  const startOfYearInput = new Date(`${currentYear}-01-01`);
  const endOfYearInput = new Date(`${currentYear}-12-31`);
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
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "",
      column_width: "40",
      url: "AdminDboard2",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "",
      column_width: "80",
      url: "AdminDboard2",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 4,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "100",
      url: "AdminDboard2",
      order_no: 5,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "AdminDboard2",
      order_no: 6,
    },
    {
      label: "%",
      key: "progress_percentage1",
      visible: false,
      type: "progresscount",
      column_width: "50",
      url: "AdminDboard2",
      order_no: 7,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 8,
    },
    {
      label: "Budget",
      key: "actual_budget",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 9,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "AdminDboard2",
      order_no: 10,
    },
    {
      label: "Proj. Owner Dept.",
      key: "project_owner_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 11,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 12,
    },
    {
      label: "Bus. Own. Dept.",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 13,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "AdminDboard2",
      order_no: 14,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "140",
      url: "AdminDboard2",
      order_no: 15,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "140",
      url: "AdminDboard2",
      order_no: 16,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "140",
      url: "AdminDboard2",
      order_no: 17,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "AdminDboard2",
      order_no: 18,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "135",
      url: "AdminDboard2",
      order_no: 19,
    },
  ]);
  const [selectedBudgetImpact, setSelectedBudgetImpact] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchList, setSearchList] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalRecordsw, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const tabItems = [
    { label: "Status Dashboard", to: "/AdminDboard" },
    {
      label: "Budget Dashboard",
      to: "/AdminDboard/AdminDboard2",
      active: true,
    },
    { label: "Resource Dashboard", to: "/AdminDboard/AdminDboard3" },
    { label: "Business Owner Dashboard", to: "/AdminDboard/AdminDboard4" },
  ];

  const location = useLocation();

  const [projects, setProjects] = useState<any[]>([]);
  const [range, setRange] = useState<any>(null);
  const [start_date, setStartDate] = useState<string>("");
  const [end_date, setEndDate] = useState<string>("");
  const justSelected = useRef(false);
  const [selectedProject_id, setSelectedProject_id] = useState<string>("");
  const handleChange = async (value: any) => {
    ////////////////debugger;
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
        value[1]?.toLocaleDateString("en-CA"),
        selectedBudgetImpact
      );
      await fetchNumberGameStatus(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA"),
        selectedBudgetImpact
      );
      await fetchBudgetDataCount(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA"),
        selectedBudgetImpact
      );

      await fetchProjectsWithFilters({
        project_id: selectedProject_id,
        budget_impact: selectedBudgetImpact,
        project_owner_dept: selectedDepartments,
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
        budget_impact: selectedBudgetImpact,
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
        "",
        ""
      );
      await fetch_resource_utilized(
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
        "",
        selectedBudgetImpact
      );
    }
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartments, setselectedDepartments] = useState<string>("");
  const [BudgetDataCount, setBudgetDataCount] = useState<any>();

  const [chartData3D, setChartData3D] = useState<any>();
  const [EChart3dData, setEChart3dData] = useState<any>();
  const [StatusDataCount, setStatusDataCount] = useState<any>();
  const [bubbleChartData, setBubbleChartData] = useState<any>();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [userPermissions, setUserPermissions] = useState<any[]>([]);

  //2

  const fetchNumberGameStatus = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string,
    budget_impact: string
  ) => {
    try {
      const response = await get_project_Budget_Impact(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date,
        budget_impact
      );
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      ////////debugger;
      //setpieDataChart(result);
      setStatusDataCount(result.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      //Alert.alert('Error', 'Failed to fetch departments');
    }
  };
  const fetchBudgetDataCount = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string,
    budget_impact: string
  ) => {
    try {
      const response = await get_project_Budget(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date,
        budget_impact
      );
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      // //////debugger;
      //setpieDataChart(result);
      setBudgetDataCount(result.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      //Alert.alert('Error', 'Failed to fetch departments');
    }
  };

  const handleSearch = async (value: any) => {
    //////debugger;
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

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      budget_impact: selectedBudgetImpact,
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
  const handleViewPress = (id: number) => {
    //console.log('Navigating with Project ID:', id);
    // navigate("ProjectPreview", {
    //   projectId: id,
    //   isApproved: true,
    //   redirect: "AdminDboard2",
    //   filters: {
    //     keyword: searchQuery,
    //     dept: selectedDepartments,
    //     status: selectedStatus,
    //     project_id: selectedProject_id,
    //     start_date: start_date,
    //     end_date: end_date,
    //   },
    // });
  };
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchProjectsWithFilters({
      budget_impact: selectedBudgetImpact,
      project_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
      page: page,
      pageSize: rowsPerPage,
      search_common: searchQuery,
    });
  };

  const fetchNumberGame = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string,
    BudgetImpact: string
  ) => {
    try {
      const response = await get_project_Budget_Impact(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date,
        BudgetImpact
      );
      const result = JSON.parse(response);
      if (result?.message === "No projects found for the specified statuses.") {
        setStatusDataCount([]);
      } else {
        setStatusDataCount(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetch_departments_projects = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string,
    budget_impact: string
  ) => {
    try {
      const response = await get_departments_projects_Budget(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date,
        budget_impact
      );
      //////debugger;
      console.log(response);
      const result = JSON.parse(response);
      //var dk = transformToChartData(result);
      //////////////debugger;
      //console.log(dk);
      //setDepartmentChartData(transformToChartData(result));
      //////debugger;
      //const isAllZero = result.data.every(item => item.total_projects === '0');
      if (false) {
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
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await GetutilizedResource(
        selectedProject_id,
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

  const totalBudgetCount = (BudgetDataCount ?? []).reduce(
    (acc, item) => acc + (parseFloat(item.projected_budget) || 0),
    0
  );

  const totalForecastedBudget = (chartData3D ?? []).reduce(
    (acc, item) => acc + (parseFloat(item.forecasted_budget) || 0),
    0
  );
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
  useEffect(() => {
    const filters = location.state?.filters;

    (async () => {
      //localStorage.setItem("UserState", "AdminDboard2");
      setStartDate(startOfYearInput.toLocaleDateString("en-CA")); // 'YYYY-MM-DD'
      setEndDate(endOfYearInput.toLocaleDateString("en-CA")); // 'YYYY-MM-DD'
      FetchMasterDataPM("AdminDboard2");

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
        setStartDate(
          filters.start_date || startOfYearInput.toLocaleDateString("en-CA")
        );
        setEndDate(
          filters.end_date || endOfYearInput.toLocaleDateString("en-CA")
        );

        await fetch_departments_projects(
          filters.project_id || "",
          status || "",
          dept || "",
          start_date || startOfYearInput.toLocaleDateString("en-CA"),
          end_date || endOfYearInput.toLocaleDateString("en-CA"),
          selectedBudgetImpact
        );
        await fetchNumberGameStatus(
          filters.project_id || "",
          status || "",
          dept || "",
          start_date || startOfYearInput.toLocaleDateString("en-CA"),
          end_date || endOfYearInput.toLocaleDateString("en-CA"),
          selectedBudgetImpact
        );
        await fetchBudgetDataCount(
          filters.project_id || "",
          status || "",
          dept || "",
          start_date || startOfYearInput.toLocaleDateString("en-CA"),
          end_date || endOfYearInput.toLocaleDateString("en-CA"),
          selectedBudgetImpact
        );
        //setLoading(false);
        await fetchProjectsWithFilters({
          project_id: selectedProject_id,
          budget_impact: selectedBudgetImpact,
          project_owner_dept: selectedDepartments,
          status: selectedStatus,
          project_start_date:
            start_date || startOfYearInput.toLocaleDateString("en-CA"),
          project_end_date:
            end_date || endOfYearInput.toLocaleDateString("en-CA"),
          page: 1,
          pageSize: rowsPerPage,
        });
      } else {
        fetch_departments_projects(
          selectedProject_id,
          selectedStatus,
          selectedDepartments,
          startOfYearInput.toLocaleDateString("en-CA"),
          endOfYearInput.toLocaleDateString("en-CA"),
          selectedBudgetImpact
        );
        fetchNumberGameStatus(
          selectedProject_id,
          selectedStatus,
          selectedDepartments,
          startOfYearInput.toLocaleDateString("en-CA"),
          endOfYearInput.toLocaleDateString("en-CA"),
          selectedBudgetImpact
        );
        fetchBudgetDataCount(
          selectedProject_id,
          selectedStatus,
          selectedDepartments,
          startOfYearInput.toLocaleDateString("en-CA"),
          endOfYearInput.toLocaleDateString("en-CA"),
          selectedBudgetImpact
        );
        //setLoading(false);
        fetchProjectsWithFilters({
          project_id: selectedProject_id,
          budget_impact: selectedBudgetImpact,
          project_owner_dept: selectedDepartments,
          status: selectedStatus,
          project_start_date: startOfYearInput.toLocaleDateString("en-CA"),
          project_end_date: endOfYearInput.toLocaleDateString("en-CA"),
          page: 1,
          pageSize: rowsPerPage,
        });
      }
      //setdataLoading(false);
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
            setSelectedStatus("");
            setselectedDepartments("");

            setSelectedBudgetImpact("");

            setStartDate("");
            setEndDate("");
            setRange(null);
            setCurrentPage(1);

            await fetchProjectsWithFilters({
              project_id: item,
              budget_impact: "",
              status: selectedStatus,
              project_owner_dept: "",

              project_start_date: "",
              project_end_date: "",
              page: 1,
              pageSize: rowsPerPage,
            });
            await fetch_departments_projects(item, "", "", "", "", "");
            await fetchNumberGame(item, "", "", "", "", "");
            await fetchBudgetDataCount(item, "", "", "", "", "");
          }}
          className="custom-autocomplete"
          menuClassName="custom-autocomplete-menu"
        />
        <MultiSelectDropdown
          items={statuses}
          placeholder="Filter by Status"
          selected={
            selectedStatus?.length > 0 ? selectedStatus?.split(",") : []
          }
          onChange={async function (selected: string[]): Promise<void> {
            //////debugger;
            const worker: any = selected?.join(",");

            setSelectedStatus(worker ?? "");
            setSearchQuery("");

            await fetchProjectsWithFilters({
              project_id: selectedProject_id,
              budget_impact: selectedBudgetImpact,
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
              end_date,
              selectedBudgetImpact
            );
            await fetchNumberGame(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date,
              selectedBudgetImpact
            );
            await fetchBudgetDataCount(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date,
              selectedBudgetImpact
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
              budget_impact: selectedBudgetImpact,
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
              end_date,
              selectedBudgetImpact
            );
            await fetchNumberGameStatus(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date,
              selectedBudgetImpact
            );
            await fetchBudgetDataCount(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date,
              selectedBudgetImpact
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

      <div className="flex  p-4 gap-4">
        {/* Left Box - 70% */}
        <div className="w-[70%]  rounded-xl shadow-lg shadow-blue-500/50 p-4 text-white">
          {selectedDepartments?.length > 0 ? (
            <div className="flex flex-wrap justify-between">
              <div className="flex flex-wrap items-center flex-1">
                <span className="font-bold text-black">
                  Budget across Departments:
                </span>
                <span className="text-black ml-2 max-w-[50%] truncate">
                  {selectedDepartments
                    .split(",")
                    .map(
                      (val) =>
                        departments?.find(
                          (m) => m.department_id?.toString() === val?.toString()
                        )?.department_name || "N/A"
                    )
                    .join(", ")}
                </span>
              </div>
              <div className="pr-2 text-black text-right">
                <div>
                  <strong>Projected Budget: </strong>$
                  {formatAmountWithoutDollarSign(totalBudgetCount)}
                </div>
                <div>
                  <strong>Forecasted Budget: </strong>$
                  {formatAmountWithoutDollarSign(totalForecastedBudget)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="font-bold text-black">
                Projected vs Forecasted Budget
              </span>
              <div className="pr-2 text-black text-right">
                <div>
                  <strong>Projected Budget: </strong>$
                  {formatAmountWithoutDollarSign(totalBudgetCount)}
                </div>
                <div>
                  <strong>Forecasted Budget: </strong>$
                  {formatAmountWithoutDollarSign(totalForecastedBudget)}
                </div>
              </div>
            </div>
          )}

          {chartData3D?.length > 0 ? (
            <BurndownChart
              elementId="burndown43"
              burndownData={[200, 160, 160, 140, 90, 90, 80, 50, 30, 8]}
              scopeChange={[0, 0, 0, 0, 0, 32, 0, 0, 0, 0]}
              width={800}
              dataBudget={chartData3D}
            />
          ) : (
            chartData3D?.length === 0 && (
              <div className="p-4 border rounded shadow bg-white mt-4">
                <span className="text-gray-500">No records</span>
              </div>
            )
          )}
        </div>

        {/* Right Side - 30% split vertically */}
        <div className="w-[30%] flex flex-col gap-4">
          <div className="flex-1  rounded-xl shadow-lg shadow-blue-500/50 p-4 text-white">
            <div>
              {selectedDepartments?.length > 0 ? (
                <div className="flex flex-wrap justify-between">
                  <div className="flex flex-wrap items-center flex-1">
                    <span className="font-bold text-black">
                      Budget across {labelDepartment.plural}:
                    </span>
                    <span className="text-black ml-2 max-w-[25%] truncate">
                      {selectedDepartments
                        .split(",")
                        .map(
                          (val) =>
                            departments?.find(
                              (m) =>
                                m.department_id?.toString() === val?.toString()
                            )?.department_name || "N/A"
                        )
                        .join(", ")}
                    </span>
                  </div>
                  <span className="text-black">
                    <strong>Total Budget:</strong> $
                    {formatAmountWithoutDollarSign(totalBudgetCount)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="font-bold text-black">
                    Budget across {labelDepartment.plural}
                  </span>
                  <span className="text-black">
                    <strong>Total Budget:</strong> $
                    {formatAmountWithoutDollarSign(totalBudgetCount)}
                  </span>
                </div>
              )}
            </div>
            <div>
              {BudgetDataCount?.length > 0 ? (
                <PieChartBudget
                  data={BudgetDataCount}
                  onClcked={async function (
                    worker1?: string,
                    worker2?: string
                  ): Promise<void> {
                    console.log(statuses);

                    setselectedDepartments(worker1 ?? "");
                    setCurrentPage(1);

                    await fetchProjectsWithFilters({
                      project_id: selectedProject_id,
                      budget_impact: selectedBudgetImpact,
                      status: "",
                      project_start_date: start_date,
                      project_end_date: end_date,
                      page: 1,
                      pageSize: rowsPerPage,
                      project_owner_dept: worker1,
                    });

                    await fetch_departments_projects(
                      selectedProject_id,
                      selectedStatus ?? "",
                      worker1 ?? "",
                      start_date,
                      end_date,
                      selectedBudgetImpact
                    );

                    await fetchBudgetDataCount(
                      selectedProject_id,
                      selectedStatus,
                      worker1 ?? "",
                      start_date,
                      end_date,
                      selectedBudgetImpact
                    );

                    await fetchNumberGameStatus(
                      selectedProject_id,
                      selectedStatus,
                      worker1 ?? "",
                      start_date,
                      end_date,
                      selectedBudgetImpact
                    );

                    //setdataLoading(false);
                  }}
                  height={250}
                  width={400}
                />
              ) : (
                BudgetDataCount?.length === 0 && (
                  <div className="p-4 border rounded shadow-lg shadow-blue-500/50 bg-white mt-4">
                    <span className="text-gray-500">No records</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex-1  rounded-xl shadow-lg shadow-blue-500/50 p-4 text-white">
            <div style={{ padding: 10, color: "black" }}>
              {selectedBudgetImpact?.length === 0 &&
              selectedDepartments?.length === 0 &&
              selectedStatus?.length === 0 ? (
                <>
                  <strong>{labelBudgetImpact.display}</strong>
                </>
              ) : (
                <div />
              )}
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
                <div />
              )}
              {selectedStatus?.length > 0 ? (
                <>
                  {selectedDepartments?.length > 0 && <br />}
                  <strong>{labelBudgetImpact.display}:</strong>{" "}
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
              {selectedBudgetImpact?.length > 0 ? (
                <>
                  {selectedBudgetImpact?.length > 0 && <br />}
                  <strong>{labelBudgetImpact.display}:</strong>{" "}
                  {selectedBudgetImpact
                    .split(",")
                    .map(
                      (val) =>
                        StatusDataCount?.find(
                          (m) => m.budget_impact?.toString() === val?.toString()
                        )?.budget_impact_name || "N/A"
                    )
                    .join(", ")}
                </>
              ) : (
                <div />
              )}
            </div>
            <div>
              {StatusDataCount?.length > 0 ? (
                <DoughPieChart
                  data={StatusDataCount}
                  onClcked={async function (
                    worker1?: string,
                    worker2?: string
                  ): Promise<void> {
                    //setChartLoading1(true);
                    //setdataLoading(true);
                    // ////////////debugger;
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
                    await fetch_departments_projects(
                      selectedProject_id,
                      selectedStatus ?? "",
                      selectedDepartments,
                      start_date,
                      end_date,
                      worker1 ?? ""
                    );
                    await fetchBudgetDataCount(
                      selectedProject_id,
                      selectedStatus,
                      selectedDepartments,
                      start_date,
                      end_date,
                      worker1 ?? ""
                    );
                    //setdataLoading(false);
                  }}
                  height={200}
                  width={400}
                />
              ) : (
                <>
                  {(() => {
                    //////////////debugger;
                    if (StatusDataCount?.length === 0) {
                      ////////////debugger; // Breakpoint hits here
                      return (
                        <div className="p-4 border rounded shadow bg-white mt-4">
                          <span className="text-gray-500">No records</span>
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
      </div>

      <AdvancedDataTable
        data={projects}
        columns={headers}
        title="Project Dashboard"
        pageSize={10}
        exportFileName="projects"
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

export default Dashboard2;
