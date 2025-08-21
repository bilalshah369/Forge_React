/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteSVG, EditSVG } from "@/assets/Icons";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DeleteIntake,
  GetProjectApproval,
  GetProjects,
  GetProjectsWithFilters,
} from "@/utils/Intake";
import { GetMasterDataPM } from "@/utils/PM";
import { decodeBase64 } from "@/utils/securedata";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const IntakeList = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "IntakeList",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "project_id",
      column_width: "150",
      url: "IntakeList",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "project_name",
      column_width: "200",
      url: "IntakeList",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "75",
      url: "IntakeList",
      order_no: 4,
    },
    {
      label: "Decision",
      key: "status_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 5,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "IntakeList",
      order_no: 6,
    },
    {
      label: "Phase",
      key: "phase_status_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "ClosedProjects",
      order_no: 7,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 8,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 9,
    },
    {
      label: "Bus. Owner Dept.",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 10,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 11,
    },
    {
      label: "Proj. Owner Dept.",
      key: "project_owner_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 12,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 13,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "IntakeList",
      order_no: 14,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "200",
      url: "IntakeList",
      order_no: 15,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "IntakeList",
      order_no: 16,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "IntakeList",
      order_no: 17,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "200",
      url: "IntakeList",
      order_no: 18,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "IntakeList",
      order_no: 19,
    },
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [isAscending, setIsAscending] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedDecision, setSelectedDecision] = useState<string>("");
  const [selectedPhases, setSelectedPhases] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pendingApproval, setPendingApproval] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [visibleMenu, setVisibleMenu] = useState<string | null>(null); // Track which menu is visible
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [departments, setDepartments] = useState<any[]>([]); // State to hold departments

  // const [filter, setFilter] = useState<ForgeFilter>(new ForgeFilter());
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<number>(0);

  const [statuses, setStatuses] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);

  //#region
  const toggleFilter = () => setFilterVisible(!filterVisible);
  const [users, setUsers] = useState<any[]>([]); // State to hold departments
  const [roles, setRoles] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [impactedApps, setImpacktedApps] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]); // State to hold departments
  const [status, setStatus] = useState("");
  const [budget, setBudget] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [projectOwnerUser, setProjectOwnerUser] = useState("");
  const [projectOwnerDept, setProjectOwnerDept] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [rawGoLiveDate, setRawGoLiveDate] = useState(null);
  const [showGoLiveDatePicker, setShowGoLiveDatePicker] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [intakeApprovalModalVisible, setIntakeApprovalModalVisible] =
    useState(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [permissions, setPermissions] = useState<number[]>([]);
  const [isReviewButtonVisible, setReviewButtonVisible] =
    useState<boolean>(false);
  const [isApproveButtonVisible, setApproveButtonVisible] =
    useState<boolean>(false);
  const [isRejectButtonVisible, setRejectButtonVisible] =
    useState<boolean>(false);
  const fetchPendingProjects = async (
    page = currentPage,
    pageSize = rowsPerPage
  ) => {
    try {
      setdataLoading(true);
      const response = await GetProjectApproval({
        PageNo: page,
        PageSize: pageSize,
      });
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      //console.log('Get Projects Response:', result);

      if (result?.data && Array.isArray(result.data)) {
        //////////////////debugger;
        var dk = result.data.filter(
          (m) => m.status === 1 || m.status === 3
        ).length;
        setPendingApproval(
          //result.data.filter(m => m.status === 1 || m.status === 3).length,
          result.pagination.totalRecords
        );

        setdataLoading(false);

        // setCurrentPage(page);
      } else {
        console.error("Invalid Projects data");

        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);

      setdataLoading(false);
    }
  };
  const fetchProjectsWithFilters = async (
    filters: Record<string, any> = {}
  ) => {
    ////////////////debugger;
    // Extract pagination info from filters or set defaults
    const page = filters.PageNo || currentPage;
    const pageSize = filters.PageSize || rowsPerPage;

    try {
      //setdataLoading(true);

      // Combine pagination and filters into one request payload
      const requestPayload = { PageNo: page, PageSize: pageSize, ...filters };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetProjectsWithFilters(requestPayload);
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
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      //setdataLoading(false);
    }
  };
  const fetchProjects = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      //setdataLoading(true);
      const response = await GetProjects({ PageNo: page, PageSize: pageSize });
      const parsedResponse = await JSON.parse(response);
      if (parsedResponse.status === "success") {
        setProjects(parsedResponse.data.projects);
        const totalRecords = parsedResponse.pagination.totalRecords;
        setTotalRecords(totalRecords);
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages);
        //setdataLoading(false);
      } else {
        setProjects([]);
        console.error("Error fetching data:", parsedResponse.message);
        // setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const handlePageChange = (page: number) => {
    setdataLoading(true);
    setCurrentPage(page);
    fetchProjectsWithFilters({
      project_owner_dept: selectedDepartment,
      status: selectedStatus,
      PageNo: page,
      PageSize: rowsPerPage,
    });
    setdataLoading(false);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setdataLoading(true);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      project_owner_dept: selectedDepartment,
      status: selectedStatus,
      PageNo: 1,
      PageSize: newRowsPerPage,
    });
    setdataLoading(false);
  };
  const handleViewPress = (id: number, status: number) => {
    setTimeout(() => {
      // navigate("ProjectPreview", {
      //   projectId: id,
      //   isApproved: false,
      //   redirect: "IntakeList",
      //   filters: {
      //     departments: selectedDepartment,
      //     status: selectedStatus,
      //     keyword: searchQuery,
      //     project_id: selectedProjectId,
      //   },
      // });
    }, 100);
    //setVisibleMenu(null);
  };
  const handleEditPress = (id: number, status: number) => {
    //console.log('Navigating with Project ID:', id);
    // navigate('IntakeView', {
    //   project_id: id,
    //   isEditable: true,
    //   keyProp: Math.random(),
    // });
    // setVisibleMenu(null); // Close the menu before navigating
    // // Delay navigation to ensure state update happens first
    // navigation.dispatch(
    //   CommonActions.reset({
    //     index: 0,
    //     routes: [
    //       {
    //         name: "IntakeView",
    //         params: {
    //           project_id: id,
    //           isEditable: true,
    //           status: status,
    //           keyProp: Math.random(),
    //         },
    //       },
    //     ],
    //   })
    // );
    //setVisibleMenu(null);
  };
  const FetchMasterDataPM = async (url: string) => {
    try {
      //setdataLoading(true);
      const response = await GetMasterDataPM(url);
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);

      if (result.status === "success") {
        //permissions
        const permissionData = result.data.user_permissions || [];

        const permissionIds = permissionData.map(
          (perm: { permission_id: number }) => perm.permission_id
        );

        setPermissions(permissionIds);
        //Column Visibility
        if (result.data.column_visibility.length > 0) {
          setHeaders(result.data.column_visibility);
          setIsColumnVisibility(true);
        } else {
          setIsColumnVisibility(false);
        }
        setDepartments(result.data.departments);
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
  const handleDelete = async (project_id: number) => {
    if (!project_id) {
      console.error("Invalid Project ID");
      return;
    }

    try {
      const payload = {
        project_id: project_id,
      };

      //console.log('Deleting Project with Payload:', payload);

      const res = await DeleteIntake(payload);
      //console.log('Delete API Response:', res);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        //FetchMilestones(projectId);
        fetchProjects();
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      //setActiveMenu(null);
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      FetchMasterDataPM("IntakeList");
      //localStorage.setItem("UserState", "IntakeList");
      setLoading(false);
      fetchPendingProjects();
      const filters = location.state?.filters;
      if (filters) {
        setSelectedDepartment(filters.departments || "");
        setSelectedStatus(filters.status || "");
        setSearchQuery(filters.keyword || "");
        setSelectedProjectId(filters.project_id || "");
        fetchProjectsWithFilters({
          project_owner_dept: filters.departments || "",
          status: filters.status || "",
          keyword: filters.keyword || "",
          project_id: filters.project_id || "",
          PageNo: 1,
          PageSize: rowsPerPage,
        });
      } else {
        fetchProjects();
        setdataLoading(false);
      }
      const UserType = decodeBase64(localStorage.getItem("UserType") ?? "");
      if (UserType === "3") {
        setReviewButtonVisible(true);
        setApproveButtonVisible(true);
        setRejectButtonVisible(true);
      }
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
          <AdvancedDataTable
            isColumnVisibility={isColumnVisibility}
            actions={(item) => (
              <div className="flex space-x-2">
                {(!permissions ||
                  permissions.includes(22) ||
                  parseInt(item.status?.toString() ?? "") === 2 ||
                  parseInt(item.status?.toString() ?? "") === 4 ||
                  parseInt(item.status?.toString() ?? "") === 10 ||
                  parseInt(item.status?.toString() ?? "") === 15) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          console.log("View", item);
                          navigation(
                            `/IntakeList/NewIntake?projectId=${item.project_id}&status=${item.status}&isEditable=true`
                          );
                        }}
                      >
                        <EditSVG height={22} width={22} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Edit"}</TooltipContent>
                  </Tooltip>
                )}
                {(!permissions ||
                  (permissions.includes(22) &&
                    parseInt(item.status?.toString() ?? "") === 2)) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          console.log("View", item);
                          handleDelete(item.project_id);
                        }}
                      >
                        <DeleteSVG height={22} width={22} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Delete"}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
            isfilter1={true}
            data={projects}
            columns={headers}
            title="PMView"
            exportFileName="pm_view"
            isCreate={true}
            onCreate={() => navigation("/IntakeList/NewIntake")}
            isPagingEnable={true}
            PageNo={currentPage}
            TotalPageCount={totalPages}
            rowsOnPage={rowsPerPage}
            onrowsOnPage={handleRowsPerPageChange}
            onPageChange={function (worker: number): void {
              handlePageChange(worker);
            }}
            MasterDepartments={departments}
            MasterStatus={statuses}
            selectedDepartment={selectedDepartment}
            status={selectedStatus}
            isDepartmentFilter={true}
            onDepartmentFilterAction={async function (
              worker: string
            ): Promise<void> {
              setSearchQuery("");
              setSelectedDepartment(worker ?? "");

              await fetchProjectsWithFilters({
                project_owner_dept: worker,
                status: selectedStatus,
                PageNo: 1,
                PageSize: rowsPerPage,
              });
            }}
            isStatusFilter={true}
            onStatusFilterAction={async function (
              worker: string
            ): Promise<void> {
              setSearchQuery("");
              setSelectedStatus(worker ?? "");

              await fetchProjectsWithFilters({
                project_owner_dept: selectedDepartment,
                status: worker,
                PageNo: 1,
                PageSize: rowsPerPage,
              });
            }}
            isSearch={true}
            searchText={searchQuery}
            onSearch={async function (
              worker1: string,
              worker2: string
            ): Promise<void> {
              setSearchQuery(worker2);
              setSelectedProjectId(worker1);
              setdataLoading(true);
              await fetchProjectsWithFilters({
                page: 1,
                pageSize: rowsPerPage,
                project_id: worker1,
              });
              setdataLoading(false);
            }}
            query={"all"}
            onClearFilter={async () => {
              //setdataLoading(true);
              setdataLoading(true);
              setSelectedDepartment("");
              setSelectedStatus("");
              setSearchQuery("");
              setCurrentPage(1);
              await fetchProjectsWithFilters({
                project_owner_dept: "",
                status: "",
                PageNo: 1,
                PageSize: rowsPerPage,
              });
              setdataLoading(false);
            }}
            data_type={"Project"}
            assignedPermission={permissions}
          />
        </div>
      </div>
    </div>
  );
};

export default IntakeList;
