/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetMasterDataPM,
} from "@/utils/PM";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { StartProject } from "@/utils/ApprovedProjects";
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
  execute: false,
  cancel: false,
  onHold: false,
  completeAndClose: false,
  movetoapprove: true,
};
const ClosedProjects = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "ClosedProjects",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "project_id",
      column_width: "150",
      url: "ClosedProjects",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "project_name",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "150",
      url: "ClosedProjects",
      order_no: 4,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "ClosedProjects",
      order_no: 5,
    },
    {
      label: "Decision",
      key: "status_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "ClosedProjects",
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
      url: "ClosedProjects",
      order_no: 8,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 9,
    },
    {
      label: "Bus. Owner Dept",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 10,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 11,
    },
    {
      label: "Proj. Owner Dept.",
      key: "project_owner_dept_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 12,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 13,
    },
    {
      label: "Project Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 14,
    },
    {
      label: "Project End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 15,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 16,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 17,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "200",
      url: "ClosedProjects",
      order_no: 18,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "ClosedProjects",
      order_no: 19,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [decisionModalVisible, setDecisionModalVisible] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string>("");
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
  const fetchProjectsWithFilters = async (
    filters: Record<string, any> = {}
  ) => {
    // Extract pagination info from filters or set defaults
    const page = filters.page || currentPage;
    const pageSize = filters.pageSize || rowsPerPage;
    //////////////////debugger;
    try {
      setdataLoading(true);

      // Combine pagination and filters into one request payload
      const requestPayload = { PageNo: page, PageSize: pageSize, ...filters };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetClosedProjectsWithFilters(requestPayload);
      //console.log('Get Projects Response:', response);
      ////////////////////debugger;
      const result = JSON.parse(response);
      //console.log('Parsed Get Projects Response:', result);

      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        setProjects(result.data.projects);

        const totalRecords1 = result.pagination.totalRecords;
        //setTotalRecords(totalRecords1);

        const calculatedTotalPages = Math.ceil(totalRecords1 / pageSize);
        setTotalPages(calculatedTotalPages);
      } else {
        setProjects([]);
        console.error("Invalid Projects data");

        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setdataLoading(false);
    }
  };
  const fetchProjects = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      setdataLoading(true);
      const response = await GetClosedProjects({
        PageNo: page,
        PageSize: pageSize,
      });
      //console.log('Get Projects Response:', response);
      const result = JSON.parse(response);
      setProjects(result.data.projects);
      setdataLoading(false);
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
    //////////////debugger;
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectsWithFilters({
      project_owner_dept: selectedDepartment,
      status: selectedStatus,
      PageNo: 1,
      PageSize: newRowsPerPage,
    });
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

        //Decisions
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
  const handleSubmit = async () => {
    const payload = {
      project_id: selectedProjectId,
      status: Number(selectedDecision) === 0 ? 5 : Number(selectedDecision),
    };
    ////debugger;
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
      FetchMasterDataPM("ClosedProjects");

      fetchProjects();
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
            title="Closed Project"
            exportFileName="closed projects"
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
              setdataLoading(true);
              setSearchQuery("");
              setSelectedDepartment(worker ?? "");

              await fetchProjectsWithFilters({
                project_owner_dept: worker,
                status: selectedStatus,
                PageNo: 1,
                PageSize: rowsPerPage,
              });
              setdataLoading(false);
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
              setSearchQuery(worker2);
              fetchProjectsWithFilters({
                page: 1,
                pageSize: rowsPerPage,
                project_id: worker1,
              });
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
          />
        </div>
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
  );
};

export default ClosedProjects;
