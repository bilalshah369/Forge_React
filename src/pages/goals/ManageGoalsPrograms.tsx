/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { Header } from "../workspace/PMView";
import { DeleteGoal, GetGoals, GetSearchedGoals } from "@/utils/Goals";
import { GetDept } from "@/utils/Departments";
import { FetchPermission } from "@/utils/Permission";
import { GetColumnVisibility } from "@/utils/PM";
import { GetPrograms } from "@/utils/ManageProgram";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clear_filter } from "@/assets/Icons";
import { AutoComplete, DateRangePicker } from "rsuite";
import GanttGoalsProgramsProjects from "./GanttGoalProgramProject";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import AlertBox from "@/components/ui/AlertBox";
import { GoalsModal } from "./GoalsModal";
import { Edit, Trash2 } from "lucide-react";
const now = new Date();
const currentYear = now.getFullYear();

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
const ManageGoalsPrograms: React.FC = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "40",
      url: "ManageGoalsPrograms",
      order_no: 1,
    },

    {
      label: "Goal",
      key: "goal_name",
      visible: true,
      type: "any_name",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 2,
    },
    {
      label: "Description",
      key: "description",
      visible: false,
      type: "desc",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 3,
    },
    {
      label: "Impacted Stakeholders",
      key: "stakeholder_names",
      visible: false,
      type: "",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 4,
    },
    {
      label: "Goal Owner",
      key: "goal_owner_name",
      visible: true,
      type: "department",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 5,
    },
    {
      label: "Target Year",
      key: "target_year",
      visible: true,
      type: "",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 6,
    },
    {
      label: "No. of Projects",
      key: "project_count",
      visible: true,
      type: "project_count",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 7,
    },
    {
      label: "Created on",
      key: "created_at",
      visible: true,
      type: "date",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 8,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 9,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 10,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 11,
    },
  ]);
  const [headersPrograms, setHeadersPrograms] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "ManageGoalsPrograms",
      order_no: 1,
    },

    {
      label: "Program Name",
      key: "program_name",
      visible: true,
      type: "any_name",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 2,
    },
    {
      label: "Goal",
      key: "goal_name",
      visible: true,
      type: "any_name",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 3,
    },
    {
      label: "Description",
      key: "description",
      visible: true,
      type: "desc",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 4,
    },
    {
      label: "Program Owner",
      key: "program_owner_name",
      visible: false,
      type: "user",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 5,
    },

    {
      label: "Target Year",
      key: "target_year",
      visible: true,
      type: "",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 6,
    },
    {
      label: "No. of Projects",
      key: "project_count",
      visible: true,
      type: "project_count",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 7,
    },
    {
      label: "Created on",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "200",
      url: "ManageGoalsPrograms",
      order_no: 8,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 9,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: true,
      type: "date",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 10,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "",
      column_width: "100",
      url: "ManageGoalsPrograms",
      order_no: 11,
    },
  ]);
  const [modalPosition, setModalPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [sortColumn, setSortColumn] = useState("");
  // Store refs for multiple buttons
  const [permissions, setPermissions] = useState<number[]>([]);

  //const ActionRefs = useRef<ButtonRefs>({});

  const [goal_id, setGoal_id] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [goalData, setGoalData] = useState<any[]>([]);
  const [goalDataForTable, setGoalDataForTable] = useState<any[]>([]);
  const [ProgramData, setProgramData] = useState<any[]>([]);
  const [editGoal, setEditGoal] = useState<any | null>(null);
  const [headerChecked, setHeaderChecked] = useState(false);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisibleAction, setModalVisibleAction] = useState<boolean>(false);
  const [start_date, setStartDate] = useState<string>("2025-01-01");
  const [end_date, setEndDate] = useState<string>("2025-12-31");
  const [currentView, setCurrentView] = useState<
    "month" | "day" | "week" | "quarter" | "year"
  >("month");
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalPagesProgram, setTotalPagesProgram] = useState<number>(0);
  const [range, setRange] = useState<any>(null);
  // const [start_date, setStartDate] = useState<string>('');
  // const [end_date, setEndDate] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [messageModalVisible, setMessageModalVisible] =
    useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string>("Message");
  const handleChange = async (value: any) => {
    setRange(value);
    if (value) {
      setGoalData([]);
      setStartDate(value[0]?.toLocaleDateString("en-CA"));
      setEndDate(value[1]?.toLocaleDateString("en-CA"));
      await fetchGoals(
        undefined,
        undefined,
        selectedProgram,
        value[0]?.toLocaleDateString("en-CA"),
        value[1]?.toLocaleDateString("en-CA")
      );
      console.log("Selected Range:", value);
    } else {
      setStartDate("");
      setEndDate("");
      fetchGoals();
    }
  };
  // Fetch goals
  const fetchGoals = async (
    page = undefined,
    pageSize = undefined,
    program?: string,
    goal_start_date?: string,
    goal_end_date?: string
  ) => {
    try {
      setdataLoading(true);
      const response = await GetGoals(
        page,
        pageSize,
        program,
        true,
        goal_start_date,
        goal_end_date
      );
      console.log("Unparsed Response:", response);
      const result = JSON.parse(response);

      console.log("API Response:", result);
      if (result?.data?.goals && Array.isArray(result.data.goals)) {
        setGoalData(
          result.data.goals.filter(
            (goal) => goal.is_active === true || goal.is_active == null
          )
        );
        const calculatedTotalPages = Math.ceil(
          result.pagination.totalRecords / pageSize
        );
        setTotalPages(calculatedTotalPages);
        setdataLoading(false);
      } else {
        console.error("Invalid goals data");
        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setdataLoading(false);
    }
  };

  const fetchGoalsForTable = async (
    page = currentPage,
    pageSize = rowsPerPage,
    program?: string,
    goal_start_date?: string,
    goal_end_date?: string
  ) => {
    try {
      setdataLoading(true);
      const response = await GetGoals(
        page,
        pageSize,
        program,
        true,
        goal_start_date,
        goal_end_date
      );
      console.log("Unparsed Response:", response);
      const result = JSON.parse(response);

      console.log("API Response:", result);
      if (result?.data?.goals && Array.isArray(result.data.goals)) {
        setGoalDataForTable(
          result.data.goals.filter(
            (goal) => goal.is_active === true || goal.is_active == null
          )
        );
        const calculatedTotalPages = Math.ceil(
          result.pagination.totalRecords / pageSize
        );
        setTotalPages(calculatedTotalPages);
        setdataLoading(false);
      } else {
        console.error("Invalid goals data");
        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setdataLoading(false);
    }
  };
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchGoals();
  //   }, []),
  // );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (isSearching) {
      fetchSearchedProjects(page, rowsPerPage, searchQuery);
    } else {
      fetchGoalsForTable(page, rowsPerPage);
    }
  };
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    isSearching
      ? fetchSearchedProjects(1, newRowsPerPage, searchQuery)
      : fetchGoalsForTable(1, newRowsPerPage);
  };

  const handlePageChangeProgram = (page: number) => {
    setCurrentPage(page);
    fetchPrograms(page, rowsPerPage);
  };
  const handleRowsPerPageChangeProgram = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchPrograms(1, newRowsPerPage);
  };
  const startYears = goalData
    .map((goal) => new Date(goal.start_date))
    .filter((date) => !isNaN(date.getTime()))
    .map((date) => date.getFullYear());
  const endYears = goalData
    .map((goal) => new Date(goal.end_date))
    .filter((date) => !isNaN(date.getTime()))
    .map((date) => date.getFullYear());

  const earliestYear =
    startYears.length > 0 ? Math.min(...startYears) - 1 : currentYear - 1;
  const latestYear =
    endYears.length > 0 ? Math.max(...endYears) : currentYear + 1;

  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };
  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     console.log('hiiii');
  //     setCurrentPage(1);
  //     fetchSearchedProjects(1, rowsPerPage, searchQuery);
  //   }, 500);

  //   return () => clearTimeout(delayDebounceFn); // Cleanup
  // }, [searchQuery]);

  const fetchSearchedProjects = async (
    page = currentPage,
    pageSize = rowsPerPage,
    query = searchQuery
  ) => {
    setdataLoading(true);
    setIsSearching(true);
    try {
      const response = await GetSearchedGoals(page, pageSize, query);
      const parsedResponse = await JSON.parse(response);
      if (parsedResponse.status === "success") {
        setGoalDataForTable(
          parsedResponse.data.goals.filter(
            (goal) => goal.is_active === true || goal.is_active == null
          )
        );
        const totalRecords = parsedResponse.pagination.totalRecords;
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages);
      } else {
        console.error("Error fetching data:", parsedResponse.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setdataLoading(false);
    }
  };
  // const handleButtonPress = (buttonKey: string) => {
  //   const buttonRef = ActionRefs.current[buttonKey];

  //   if (buttonRef?.current) {
  //     const nodeHandle = findNodeHandle(buttonRef.current);
  //     if (nodeHandle) {
  //       UIManager.measure(
  //         nodeHandle,
  //         (_x, _y, _width, _height, pageX, pageY) => {
  //           setModalPosition({ top: pageY + _height, left: pageX });
  //           setModalVisibleAction(true);
  //         }
  //       );
  //     }
  //   }
  // };
  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setdataLoading(true);
      const response = await GetDept("");
      console.log("unparsed Department Response:", response);
      const result = JSON.parse(response);

      console.log("API Response:", result);
      if (result?.data?.departments && Array.isArray(result.data.departments)) {
        setDepartments(result.data.departments);
        setdataLoading(false);
      } else {
        console.error("Invalid departments data");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);

      setdataLoading(false);
    }
  };
  const checkPermission = async () => {
    try {
      const permissionResponse = await FetchPermission(""); // Fetching permission data
      const parsedResponse =
        typeof permissionResponse === "string"
          ? JSON.parse(permissionResponse)
          : permissionResponse;

      if (
        !parsedResponse ||
        !parsedResponse.data ||
        !parsedResponse.data.user_permissions
      ) {
        throw new Error("Invalid response format");
      }

      const permissionData = parsedResponse.data.user_permissions || [];

      const permissionIds = permissionData.map(
        (perm: { permission_id: number }) => perm.permission_id
      );

      setPermissions(permissionIds);
      console.log("Permission for user is", permissionIds);
    } catch (error) {
      console.error("Error retrieving permissions:", error);
    }
  };
  const fetchColumnVisibility = async () => {
    try {
      //setdataLoading(true);
      const response = await GetColumnVisibility("ManageGoalsPrograms");
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      if (result.status === "error") {
        setIsColumnVisibility(false);
      }
      if (result.status === "success") {
        //setHeaders(result.data);
        setIsColumnVisibility(true);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      //Alert.alert('Error', 'Failed to fetch projects');
      //setdataLoading(false);
    }
  };
  const fetchPrograms = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      setdataLoading(true);
      const response = await GetPrograms(page, pageSize);
      //console.log('Unparsed Response (Programs):', response);
      const result = JSON.parse(response);
      if (result?.data?.programs && Array.isArray(result.data.programs)) {
        setProgramData(
          result.data.programs.filter(
            (goal) => goal.is_active === true || goal.is_active == null
          )
        );
        setdataLoading(false);
        const calculatedTotalPages = Math.ceil(
          result.pagination.totalRecords / pageSize
        );
        setTotalPagesProgram(calculatedTotalPages);
      }
    } catch (error) {
      setdataLoading(false);
      console.error("Error fetching programs:", error);
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      checkPermission();
      fetchColumnVisibility();
      fetchPrograms();
      fetchGoals();
      fetchGoalsForTable();

      fetchDepartments();
      localStorage.setItem("UserState", "ManageGoalsPrograms");
    })();
  }, [location]); // Runs again on location change

  const mapDepartmentIdToName = (id: number) => {
    const department = departments.find((dept) => dept.department_id === id);
    return department ? department.department_name : " ";
  };

  const HandleDeleteGoal = async (goal_id_ref) => {
    ////////debugger
    const GoalDel = {
      goal_id: goal_id_ref,
      //is_active: false,
    };
    try {
      const response = await DeleteGoal(GoalDel);
      //const response = await InsertGoal(GoalDel);

      const parsedResponse = await JSON.parse(response);
      if (parsedResponse.message === "success") {
        /*  setApiMessage(parsedResponse.message);
        setMessageModalVisible(true); */
        showAlert("Goal deleted successfully");
      } else {
        /* setApiMessage(parsedResponse.message);
        setMessageModalVisible(true); */
        showAlert("Goal deleted");
      }
      fetchGoals();
      fetchGoalsForTable();
    } catch (error) {
      console.error("Error Deleting Goals:", error);
      setApiMessage(error.message);
      setMessageModalVisible(true);
    }
  };

  const handleDeletePress = (goal_id_ref) => {
    console.log(goal_id_ref);
    setGoal_id(goal_id_ref);
    setDialogVisible(true);
    //HandleDeleteGoal(goal_id_ref);
  };

  const openModal = (goal = null) => {
    setModalVisible(true);
    setEditGoal(goal);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditGoal(null);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setIsAscending(!isAscending);
    } else {
      setSortColumn(column);
      setIsAscending(true);
    }

    setGoalDataForTable((prevData) =>
      [...prevData].sort((a, b) => {
        if (a[column] < b[column]) return isAscending ? -1 : 1;
        if (a[column] > b[column]) return isAscending ? 1 : -1;
        return 0;
      })
    );
  };
  const [programModalVisible, setProgramModalVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState({ id: "", name: "" });
  const openCreateProgramModal = () => {
    setProgramModalVisible(true);
  };

  const closeCreateProgramModal = () => {
    setProgramModalVisible(false);
  };
  const handleCloseDialog = () => {
    setDialogVisible(false);
  };
  const handleConfirmDelete = () => {
    HandleDeleteGoal(goal_id);

    handleCloseDialog();
  };

  const [showPrograms, setShowPrograms] = useState<boolean>(false);

  //const { width: screenWidth } = useWindowDimensions();
  // if (isLoading) {
  //   return <ActivityIndicator size={"small"} />;
  // }
  return (
    <>
      <div className="w-full h-full">
        <div className="w-full h-full overflow-auto">
          <div className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-md shadow-sm">
            <div></div>
            <div className="flex flex-wrap gap-2">
              {selectedProgram?.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setRange(null);
                        // setStartDate('');
                        // setEndDate('');
                        // setIsChartFiltered(false); // Reset chart filter flag
                        setSelectedProgram("");
                        fetchGoals(1, rowsPerPage, "", start_date, end_date);
                      }}
                    >
                      <Clear_filter height={30} width={30} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Clear Filter</TooltipContent>
                </Tooltip>
              )}

              <div className="relative w-[208px] text-sm font-medium">
                <button
                  onClick={() => setOpen(!open)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm flex justify-between items-center hover:border-gray-400"
                >
                  <span>
                    {
                      [
                        { label: "Weekly", value: "week", group: "" },
                        { label: "Monthly", value: "month", group: "" },

                        { label: "Yearly", value: "year", group: "" },
                      ].find((o) => o.value === currentView)?.label
                    }
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {open && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                    {[
                      { label: "Weekly", value: "week", group: "" },
                      { label: "Monthly", value: "month", group: "" },
                      { label: "Quarterly", value: "quarter", group: "" },
                      { label: "Yearly", value: "year", group: "" },
                    ].map((opt) => (
                      <li
                        key={opt.value}
                        onClick={() => {
                          setIsLoading(true);
                          setCurrentView(
                            opt.value as
                              | "month"
                              | "day"
                              | "week"
                              | "quarter"
                              | "year"
                          );
                          if (opt.value === "year") {
                            setStartDate(`${earliestYear}-01-01`);
                            setEndDate(`${latestYear}-12-31`);
                          } else {
                            setStartDate(`${earliestYear}-01-01`);
                            setEndDate(`${latestYear}-12-31`);
                          }
                          setIsLoading(false);
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          currentView === opt.value
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }`}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

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
          </div>
          {goalData?.length > 0 ? (
            <GanttGoalsProgramsProjects
              data={goalData}
              chat_view={currentView}
              start_date={start_date}
              end_date={end_date}
            />
          ) : (
            <div style={styles.card}>
              <label className="text-[16px] text-[#333] text-center">
                No records
              </label>
            </div>
          )}
          <div className="p-2 min-w-[320px] max-w-[400px] bg-white rounded-md justify-center mt-5 mb-5">
            <div className="inline-flex border border-gray-300 rounded-full overflow-hidden text-sm font-medium shadow-sm">
              <button
                onClick={(e) => {
                  setHeaders(headers);
                  fetchGoals(currentPage, rowsPerPage);
                  e.preventDefault();
                  setShowPrograms(false);
                }}
                className={`px-4 py-2 transition-colors duration-200 ${
                  !showPrograms
                    ? "bg-blue-800 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                Goals
              </button>
              <button
                onClick={(e) => {
                  setHeadersPrograms(headersPrograms);
                  fetchPrograms(currentPage, rowsPerPage);

                  e.preventDefault();
                  setShowPrograms(true);
                }}
                className={`px-4 py-2 transition-colors duration-200 ${
                  showPrograms
                    ? "bg-blue-800 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                Programs
              </button>
            </div>
          </div>

          {showPrograms ? (
            <AdvancedDataTable
              isfilter1={false}
              data={ProgramData}
              columns={headersPrograms}
              title="Programs"
              exportFileName="programs"
              isCreate={true}
              onCreate={openCreateProgramModal}
              isPagingEnable={true}
              PageNo={currentPage}
              TotalPageCount={totalPagesProgram}
              rowsOnPage={rowsPerPage}
              onrowsOnPage={handleRowsPerPageChangeProgram}
              onPageChange={function (worker: number): void {
                handlePageChangeProgram(worker);
              }}
              data_type={"Program"}
            />
          ) : (
            <>
              <AdvancedDataTable
                isfilter1={false}
                data={goalDataForTable}
                columns={headers}
                actions={(item) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditGoal(item);
                        setModalVisible(true);
                      }}
                    >
                      <Edit className="w-4 h-4 text-black" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this goal?")
                        )
                          HandleDeleteGoal(item.goal_id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
                title="Goals"
                exportFileName="goals"
                isCreate={true}
                onCreate={openModal}
                isPagingEnable={true}
                PageNo={currentPage}
                TotalPageCount={totalPages}
                rowsOnPage={rowsPerPage}
                onrowsOnPage={handleRowsPerPageChange}
                onPageChange={function (worker: number): void {
                  handlePageChange(worker);
                }}
                data_type={"Goal"}
              />
            </>
          )}
        </div>
      </div>

      {/* goals modal */}
      <GoalsModal
        isOpen={modalVisible}
        onClose={closeModal}
        onCreate={() => {
          fetchGoals();
          fetchGoalsForTable();
        }}
        editGoal={editGoal}
      />

      {/* programs modal */}

      {/* alert box */}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </>
  );
};
const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
};
const styles = {
  //
  box1: {
    flex: 2, // Takes more space
    backgroundColor: "white",
    //margin: 10,
    ...shadowStyle,
  },
  boxFilter: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "flex-end", // Align children to the right
    justifyContent: "center", // Optional: vertically center
    padding: 10, // Optional: add some internal spacing
  },
  column: {
    flex: 1, // Takes less space
    justifyContent: "space-between",
  },
  box2: {
    flex: 1, // Expands to take available space
    backgroundColor: "white",
    margin: 10,
    ...shadowStyle,
  },
  box3: {
    flex: 1, // Expands to take available space
    backgroundColor: "white",
    margin: 10,
    ...shadowStyle,
  },

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
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },

  menuButton: {
    fontSize: 18,
    color: "#007BFF",
  },
  container: {
    flex: 1,
    padding: 10,
    width: "100%",
    // overflow: 'scroll',
  },
  contentWrapper: {
    width: "100%",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
    fontFamily: "Roboto",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  leftButtons: {
    flexDirection: "row",
  },
  centerButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  rightButtons: {
    flexDirection: "row",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  buttonText: {
    color: "#044086",
    fontSize: 14,
    fontFamily: "Roboto",
  },
  buttonText6: {
    color: "#C4C4C4",
  },
  buttonIcon: {
    padding: 5,
    //justifyContent: 'center',
  },
  tableContainer: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    //overflow: 'hidden',
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    color: "#757575",
    textAlign: "center",
    fontFamily: "Roboto",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: 22,
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
    paddingVertical: 6,
  },
  cell: {
    fontSize: 12,
    paddingHorizontal: 2,
    textAlign: "left",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  actionCell: {
    justifyContent: "center",
    padding: 0,
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexGrow: 1,
    paddingLeft: 20,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxWidth: 500,
    borderWidth: 3,
    borderColor: "#c4c4c4",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    //backgroundColor:'white',
    //height:40,
    color: "#044086",
  },
  // modalContent: {
  //   marginBottom: 20,
  // },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputRowDES: {
    flexDirection: "row",
    flex: 1,
    marginBottom: 10,
  },
  input: {
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
    color: "#000",
    //borderBottomWidth: 1.5,
    borderBottomColor: "#044086",
    borderWidth: 1,
    //outlineStyle: 'none',
    width: "100%",
  },
  inputT: {
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
    color: "#000",
    //borderBottomWidth: 1.5,
    borderBottomColor: "#044086",
    borderWidth: 1,
    //outlineStyle: 'none',
    width: "155%",
  },
  inputDesc: {
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
    color: "#000",
    //borderBottomWidth: 1.5,
    borderBottomColor: "#044086",
    borderWidth: 1,
    //outlineStyle: 'none',
    width: "200%",
  },
  fullWidthInput: {
    marginVertical: 10,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#044086",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  buttonText1: {
    color: "white",
  },
  buttonText2: {
    color: "black",
  },
  inputContainer: {
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#044086",
  },
  asterisk: {
    color: "red",
  },
  picker: {
    height: 40,
    borderBottomColor: "#044086",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  pickerItem: {
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: "top",
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  sortIcon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    maxWidth: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "flex-start",
  },
  modalOption: {
    padding: 5,
    fontSize: 16,
    color: "#007BFF",
    textDecorationLine: "underline",
    textAlign: "left",
  },
  paginationContainer: {
    flexDirection: "row", // Align items horizontally
    justifyContent: "flex-end", // Space out components
    alignItems: "center", // Center align vertically
    padding: 10, // Add some padding for spacing
  },
  searchInput: {
    flex: 1,
    height: 40, // Height of the input box
    borderColor: "#ccc", // Light gray border
    borderWidth: 1, // Thin border width
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 10, // Padding inside the input
    marginRight: 10, // Space between the input and filter button
    backgroundColor: "#f9f9f9", // Subtle background color
    fontSize: 16, // Text size
    color: "#333", // Text color
  },
};

export default ManageGoalsPrograms;
