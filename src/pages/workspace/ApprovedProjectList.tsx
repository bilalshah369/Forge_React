/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProjectPhaseSVG } from "@/assets/Icons";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import AlertBox from "@/components/ui/AlertBox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GetApprovedProjects,
  GetApprovedProjectsWithFilters,
  StartProject,
} from "@/utils/ApprovedProjects";
import { GetMasterDataPM, GetPlanChangeProjects } from "@/utils/PM";
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
const options = {
  execute: true,
  cancel: true,
  onHold: true,
  completeAndClose: true,
  movetoapprove: false,
};
const ApprovedProjectList = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "ApprovedProjectList",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "project_id",
      column_width: "100",
      url: "ApprovedProjectList",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "project_name",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 3,
    },
    {
      label: "Status Name",
      key: "status_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 4,
    },
    // {
    //   label: 'Status',
    //   key: 'status_color',
    //   visible: true,
    //   type: 'change_status_project',
    //   column_width: '150',
    //   url: 'ApprovedProjectList',
    //   order_no: 5,
    // },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "150",
      url: "ApprovedProjectList",
      order_no: 5,
    },
    // {
    //   label: 'Phase',
    //   key: 'phase_status_name',
    //   visible: true,
    //   type: 'change_status_proj',
    //   column_width: '150',
    //   url: 'ApprovedProjectList',
    //   order_no: 6,
    // },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "ApprovedProjectList",
      order_no: 7,
    },
    {
      label: "%",
      key: "progress_percentage1",
      visible: false,
      type: "progresscount",
      column_width: "70",
      url: "ApprovedProjectList",
      order_no: 8,
    },

    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 9,
    },
    {
      label: "Proj. Owner Dept.",
      key: "project_owner_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 10,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 10,
    },
    {
      label: "Budget",
      key: "budget",
      visible: true,
      type: "",
      column_width: "100",
      url: "ApprovedProjectList",
      order_no: 11,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 12,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 13,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 14,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 15,
    },
    {
      label: "Bus. Owner Dept",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 16,
    },
    {
      label: "Requested By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 17,
    },
    {
      label: "Requested On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "200",
      url: "ApprovedProjectList",
      order_no: 18,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "ApprovedProjectList",
      order_no: 19,
    },
    // {
    //   label: 'Action',
    //   key: 'action_new',
    //   visible: true,
    //   type: '',
    //   column_width: '100',
    //   url: 'ApprovedProjectList',
    //   order_no: 20,
    // },
  ]);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [totalRecords, setTotalRecords] = useState(0); // Total records
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDecision, setSelectedDecision] = useState<string>("");
  const [selectedPhases, setSelectedPhases] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pendingApproval, setPendingApproval] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [project_id, setProject_id] = useState("");
  const fetchProjects = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      setdataLoading(true);
      const response = await GetApprovedProjects({
        PageNo: page,
        PageSize: pageSize,
      });
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      //console.log('Get Projects Response:', result);
      ////debugger;
      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        setProjects(result.data.projects);
        const totalRecords = result.pagination.totalRecords;

        setTotalRecords(totalRecords);
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages); //sadaseffectdasdasdsadas
        //console.log('hello');
        setdataLoading(false);
        localStorage.setItem("UserState", "ApprovedProjectList");
        // setCurrentPage(page);
      } else {
        console.error("Invalid Projects data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);

      setdataLoading(false);
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjectsWithFilters({
      project_owner_dept: selectedDepartment,
      status: selectedStatus,
      PageNo: page,
      PageSize: rowsPerPage,
    });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    ////////////debugger;
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      project_owner_dept: selectedDepartment,
      status: selectedStatus,
      PageNo: 1,
      PageSize: newRowsPerPage,
    });
  };
  const fetchProjectsWithFilters = async (
    filters: Record<string, any> = {}
  ) => {
    //////////////debugger;
    // Extract pagination info from filters or set defaults
    const page1 = filters.PageNo || currentPage;
    const pageSize = filters.PageSize || rowsPerPage;

    try {
      //setdataLoading(true);

      // Combine pagination and filters into one request payload
      const requestPayload = { PageNo: page1, PageSize: pageSize, ...filters };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetApprovedProjectsWithFilters(requestPayload);
      //console.log('Get Projects Response:', response);
      //////////////////debugger;
      const result = JSON.parse(response);
      //console.log('Parsed Get Projects Response:', result);

      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        setProjects(result.data.projects);

        const totalRecords1 = result.pagination.totalRecords;
        setTotalRecords(totalRecords1);

        const calculatedTotalPages = Math.ceil(totalRecords1 / pageSize);
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
  const handleViewPressVIEW = (id: number) => {
    // navigate("ProjectPreview", {
    //   projectId: id,
    //   isApproved: true,
    //   redirect: "ApprovedProjectList",
    //   filters: {
    //     departments: selectedDepartment,
    //     status: selectedStatus,
    //     keyword: searchQuery,
    //     project_id: project_id,
    //   },
    // });
  };
  const handleViewPress = (id: number) => {
    //console.log('Navigating with Project ID:', id);
    // navigate("ProjectDetails", {
    //   project_id: id,
    // });
    /* navigate('ProjectPreview', {
            projectId: id,
            isApproved: false,
            //redirect: 'IntakeList',
          }); */
    // navigate('ProjectPreview', {
    //   projectId: id,
    //   isApproved: true,
    //   redirect: 'ApprovedProjectList',
    // });
  };
  const fetchPendingProjects = async (
    page = currentPage,
    pageSize = rowsPerPage
  ) => {
    try {
      setdataLoading(true);
      const response = await GetPlanChangeProjects();
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      //console.log('Get Projects Response:', result);

      if (result?.data && Array.isArray(result.data)) {
        ////////////////debugger;
        var dk = result.data.filter(
          (m) => m.status === 1 || m.status === 3
        ).length;
        setPendingApproval(result.data.length);

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
  const FetchMasterDataPM = async (url: string) => {
    try {
      //setdataLoading(true);
      const response = await GetMasterDataPM(url);
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);

      if (result.status === "success") {
        //permissions

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
  const [decisionModalVisible, setDecisionModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [message, setMessage] = useState("");
  const openDecisionModal = (id: number) => {
    setSelectedProjectId(id);
    setDecisionModalVisible(true);
  };
  const closeDecisionModal = async () => {
    setDecisionModalVisible(false);
    await fetchProjects();
  };
  const showAlert = (message: string) => {
    setMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setMessage("");
    //navigation("/PMView");
  };
  const handleSubmit = async () => {
    const payload = {
      project_id: selectedProjectId,
      status: Number(selectedDecision) === 0 ? 14 : Number(selectedDecision),
    };
    //debugger;
    //console.log('Payload:', payload);

    try {
      // Await the result from InsertMember
      const response = await StartProject(payload);
      const parsedResponse = JSON.parse(response);
      // Handle the response (assuming it's a JSON object)
      if (parsedResponse && parsedResponse.status === "success") {
        //setMessage(parsedResponse.message);
        showAlert("Decision Updated successfully");
        closeDecisionModal();
      } else {
        showAlert(parsedResponse.message);
        /*  showAlert(
          'All mandatory fields are not entered.' +
            '\n' +
            'Please update all details and then continue.',
        ); */
        closeDecisionModal();
      }
    } catch (error: any) {
      console.error("Error submitting member:", error);
      showAlert("All details are not filled");
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      FetchMasterDataPM("ApprovedProjectList");
      //setLoading(false);
      const filters = location?.state?.filters || {};
      if (filters) {
        setSelectedDepartment(filters.departments || "");
        setSelectedStatus(filters.status || "");
        setSearchQuery(filters.keyword || "");
        setProject_id(filters.project_id || "");
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
      }
      fetchPendingProjects();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
          <AdvancedDataTable
            actions={(item) => (
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        openDecisionModal(item.project_id);
                        setSelectedProjectName(item.project_name);
                      }}
                    >
                      <ProjectPhaseSVG height={22} width={22} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Change Project Phase"}</TooltipContent>
                </Tooltip>
              </div>
            )}
            isfilter1={true}
            data={projects}
            columns={headers}
            title="PMView"
            exportFileName="approved projects"
            isCreate={false}
            onCreate={() => navigation("/NewIntake")}
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
              setdataLoading(true);
              setSearchQuery("");
              setSelectedStatus(worker ?? "");

              await fetchProjectsWithFilters({
                project_owner_dept: selectedDepartment,
                status: worker,
                PageNo: 1,
                PageSize: rowsPerPage,
              });
              setdataLoading(false);
            }}
            isSearch={true}
            searchText={searchQuery}
            onSearch={async function (
              worker1: string,
              worker2: string
            ): Promise<void> {
              setProject_id(worker1);
              setSearchQuery(worker2);
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
            assignedPermission={undefined}
          />
          {decisionModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-2">Decision</h2>

                {selectedProjectName && (
                  <p className="mb-4 text-gray-700">
                    Project Name -{" "}
                    <span className="font-normal">{selectedProjectName}</span>
                  </p>
                )}

                <select
                  value={selectedDecision}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                >
                  {options.execute && <option value="14">Execute</option>}
                  {options.cancel && <option value="25">Cancel</option>}
                  {options.onHold && <option value="26">On Hold</option>}
                  {options.completeAndClose && (
                    <option value="32">Complete & Close</option>
                  )}
                  {options.movetoapprove && (
                    <option value="5">Move to approved</option>
                  )}
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setDecisionModalVisible(false);
                    }}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          <AlertBox
            visible={alertVisible}
            onCloseAlert={closeAlert}
            message={message}
          />
        </div>
      </div>
    </div>
  );
};

export default ApprovedProjectList;
