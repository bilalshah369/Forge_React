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
  get_departments_projects_Resource,
  get_project_counts_by_status,
  get_project_ResurceAvailability,
  get_project_ResurceAvailability_MonthWise,
  get_projects_autocomplete,
  GetDashProjectsWithFilters,
  GetDashResourceWithFilters,
  GetMasterDataPM,
  GetRAIDBubble,
} from "@/utils/PM";
import { getChartsData, GetutilizedResource } from "@/utils/AdminDboad";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import ThreeDPieChart from "../charts/ThreeDPieChart";
import RAID3DBarChartV4 from "../charts/RAID3DBarChartV4";
import DoughuntPieChart from "../charts/DoughuntPieChart";
import ResourceUtilizationChart from "../charts/ResourceUtilizationChart";
import Grouped3DBarChartV4 from "../charts/Grouped3DBarChartV4";
import ResourceRoadmapGantt from "../charts/ResourceRoadmapGantt";
// src/pages/HomePage.tsx
const Dashboard3 = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchList, setSearchList] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalRecordsw, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const tabItems = [
    { label: "Status Dashboard", to: "/AdminDboard" },
    { label: "Budget Dashboard", to: "/AdminDboard/AdminDboard2" },
    {
      label: "Resource Dashboard",
      to: "/AdminDboard/AdminDboard3",
      active: true,
    },
    { label: "Business Owner Dashboard", to: "/AdminDboard/AdminDboard4" },
  ];

  const currentYear = new Date().getFullYear();
  const startOfYearInput = new Date(`${currentYear}-01-01`);
  const endOfYearInput = new Date(`${currentYear}-12-31`);
  const now = new Date();

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
    ////////////////debugger;
    setRange(value);
    const std = selectedStatus.replace("55", "1,2,3,4,10");
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
      await fetchResurceAvailability(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );
      await fetchResourceAvailabilityMonthWise(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );

      await fetchProjectsWithFilters({
        project_id: selectedProject_id,
        availability_range: availability_range,
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
        availability_range: availability_range,
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
      await fetchResurceAvailability(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        "",
        ""
      );
      await fetchResourceAvailabilityMonthWise(
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
      url: "AdminDboard3",
      order_no: 1,
    },
    {
      label: "Name",
      key: "name",
      visible: true,
      type: "",
      column_width: "80",
      url: "AdminDboard3",
      order_no: 2,
    },
    {
      label: "Utilized Range",
      key: "availability_range",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard3",
      order_no: 3,
    },
    {
      label: "Availability Percentage",
      key: "available_percentage",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard3",
      order_no: 3,
    },
    {
      label: "Utilized Percentage",
      key: "utilization_percentage",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard3",
      order_no: 3,
    },
    {
      label: "Department",
      key: "department_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "AdminDboard3",
      order_no: 4,
    },
  ]);

  const [resourceCount, setResourceCount] = useState<any>();
  const [BudgetDataCount, setBudgetDataCount] = useState<any>();
  const [resourceAvailability, setResourceAvailability] = useState<any>();
  const [chartKey, setChartKey] = useState<number>(Date.now());
  const [availability_range, setAvailability_range] = useState<string>("");
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

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      page: 1,
      pageSize: newRowsPerPage,
      project_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
      availability_range: availability_range,
      project_id: selectedProject_id,
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

      const response = await GetDashResourceWithFilters(requestPayload);
      //console.log('Get Projects Response:', response);
      ////////////////////debugger;
      const result = JSON.parse(response);
      //console.log('Parsed Get Projects Response:', result);

      if (result?.data && Array.isArray(result.data)) {
        setProjects(result.data);

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
    //   redirect: "AdminDboard3",
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
      availability_range: availability_range,
      project_owner_dept: selectedDepartments,
      status: selectedStatus === "55" ? "1,2,3,4,10" : selectedStatus,
      project_start_date: start_date,
      project_end_date: end_date,
      //phase_status: selectedPhase,
      page: page,
      pageSize: rowsPerPage,
    });
  };

  const fetch_departments_projects = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_departments_projects_Resource(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );
      //////debugger;
      console.log(response);
      const result = JSON.parse(response);

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
  const fetchResurceAvailability = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_project_ResurceAvailability(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
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

  const fetchResourceAvailabilityMonthWise = async (
    project_id: string,
    str: string,
    depat: string,
    project_start_date: string,
    project_end_date: string
  ) => {
    try {
      const response = await get_project_ResurceAvailability_MonthWise(
        project_id,
        str,
        depat,
        project_start_date,
        project_end_date
      );
      //console.log('unparsed Department Response:', response);
      const result = JSON.parse(response);
      // //////debugger;
      //setpieDataChart(result);
      setResourceAvailability(result.data);
      setResourceCount(result.total_resources || 0);
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
      //////debugger;
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
  const location = useLocation();
  useEffect(() => {
    const filters = location.state?.filters;

    (async () => {
      // localStorage.setItem(
      //   "Token",
      //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJyb2xlX2lkIjozLCJjdXN0b21lcl9pZCI6MSwicGVybWlzc2lvbl9pZHMiOls2Miw2Myw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCwxNCwxNiwxOCwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMiwzMywzNCwzNSwzNiwzOCwzOSw0MCw0MSw1MSw1Miw1Myw1NCw1NSw1Niw1Nyw1OCw1OSw2MCw2MSw2NCw2NSw2Niw2Nyw2OCw2OSw3MCw3MV0sInVzZXJfbmFtZSI6IkpvbiBEb2UiLCJpYXQiOjE3NTM5MDc2MzUsImV4cCI6MTc1MzkwODgzNX0.GA1GTMelas7v55EBPlzE_aaBqXupVMNUa7EHpfxC5Z8"
      // );
      setStartDate(startOfYearInput.toLocaleDateString("en-CA")); // 'YYYY-MM-DD'
      setEndDate(endOfYearInput.toLocaleDateString("en-CA")); // 'YYYY-MM-DD'

      //localStorage.setItem("UserState", "AdminDboard3");
      FetchMasterDataPM("AdminDboard3");

      fetch_departments_projects(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        startOfYearInput.toLocaleDateString("en-CA"),
        endOfYearInput.toLocaleDateString("en-CA")
      );
      fetchResurceAvailability(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        startOfYearInput.toLocaleDateString("en-CA"),
        endOfYearInput.toLocaleDateString("en-CA")
      );
      fetchResourceAvailabilityMonthWise(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        startOfYearInput.toLocaleDateString("en-CA"),
        endOfYearInput.toLocaleDateString("en-CA")
      );
      fetch_resource_utilized(
        selectedProject_id,
        selectedStatus,
        selectedDepartments,
        "",
        ""
      );
      //setLoading(false);
      fetchProjectsWithFilters({
        project_id: selectedProject_id,
        availability_range: availability_range,
        project_owner_dept: selectedDepartments,
        status: selectedStatus,
        project_start_date: startOfYearInput.toLocaleDateString("en-CA"),
        project_end_date: endOfYearInput.toLocaleDateString("en-CA"),
        //phase_status: selectedPhase,
        page: 1,
        pageSize: rowsPerPage,
      });
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
            await fetchProjectsWithFilters({
              project_id: item,
              availability_range: availability_range,
              project_owner_dept: selectedDepartments,
              status: selectedStatus,
              project_start_date: start_date,
              project_end_date: end_date,
              //phase_status: selectedPhase,
              page: 1,
              pageSize: rowsPerPage,
            });
            //  await fetchChartsData();
            await fetch_departments_projects(
              item,
              selectedStatus,
              selectedDepartments,
              start_date,
              end_date
            );
            // await fetchNumberGameStatus(
            //   selectedStatus,
            //   selectedDepartments,
            //   start_date,
            //   end_date,
            // );
            await fetchResurceAvailability(
              item,
              selectedStatus,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchResourceAvailabilityMonthWise(
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
              "",
              ""
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
            //////debugger;
            const worker: any = selected?.join(",");
            setSelectedStatus(worker ?? "");
            setSearchQuery("");
            await fetchProjectsWithFilters({
              project_id: selectedProject_id,
              availability_range: availability_range,
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
            await fetch_resource_utilized(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchResurceAvailability(
              selectedProject_id,
              worker,
              selectedDepartments,
              start_date,
              end_date
            );
            await fetchResourceAvailabilityMonthWise(
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
              availability_range: availability_range,
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
            await fetchResurceAvailability(
              selectedProject_id,
              selectedStatus,
              worker,
              start_date,
              end_date
            );
            await fetchResourceAvailabilityMonthWise(
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Box 1 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-500/50 p-4">
          {/* <h2 className="text-md font-semibold">Project Owner Departments</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[500px]">
            {/* <PieChart1 /> */}

            <div className="flex justify-between items-center flex-row w-full">
              <div className="p-2">
                <strong className="text-black">
                  Resource Availability Across Months
                </strong>
              </div>
              <div className="p-2 flex flex-row space-x-1">
                <span className="text-black font-bold">Total Resources:</span>
                <span className="text-black">{resourceCount}</span>
              </div>
            </div>

            <div>
              {BudgetDataCount?.length > 0 ? (
                <ResourceUtilizationChart data={resourceAvailability} />
              ) : (
                <>
                  {(() => {
                    //////////////debugger;
                    if (BudgetDataCount?.length === 0) {
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

        {/* Box 2 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-500/50 p-4">
          {/* <h2 className="text-md font-semibold ">RAID Status</h2> */}
          {/* Chart Component goes here */}
          <div className="w-full h-[500px]">
            <div className="flex justify-between flex-row pb-2">
              <div className="p-2 text-black">
                <strong>Available vs Utilized Resources</strong>
              </div>
            </div>
            <div>
              {EChart3dData ? (
                <Grouped3DBarChartV4
                  key={chartKey}
                  data={EChart3dData}
                  onClcked={async function (
                    worker1?: string,
                    worker2?: string
                  ): Promise<void> {
                    setselectedDepartments(worker1 ?? "");
                    setEChart3dData(undefined);
                    await fetch_resource_utilized(
                      selectedProject_id,
                      selectedStatus,
                      worker1 ?? "",
                      start_date,
                      end_date
                    );
                    await fetch_departments_projects(
                      selectedProject_id,
                      selectedStatus,
                      worker1 ?? "",
                      start_date,
                      end_date
                    );
                    await fetchResourceAvailabilityMonthWise(
                      selectedProject_id,
                      selectedStatus,
                      worker1 ?? "",
                      start_date,
                      end_date
                    );
                    await fetchProjectsWithFilters({
                      page: 1,
                      pageSize: rowsPerPage,
                      project_owner_dept: worker1,
                      start_date: start_date,
                      end_date: end_date,
                    });
                  }}
                />
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4">
        {/* Box 1 */}
        <div className="bg-white rounded-xl shadow-lg shadow-blue-500/50 p-4 ">
          <div style={{ padding: 10, color: "black" }}>
            <strong>Resource Roadmap</strong>
          </div>
          <div className="h-[500px]">
            {chartData3D?.length > 0 ? (
              <ResourceRoadmapGantt
                data={chartData3D}
                start_date={start_date}
                end_date={end_date}
                chat_view={"month"}
              />
            ) : (
              <div />
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

export default Dashboard3;
