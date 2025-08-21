/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeRequestSVG,
  Details_line_svg,
  DollarSign,
  ProjectPlanSVG,
  Update_project_statusSVG,
} from "@/assets/Icons";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GetProjectApproval } from "@/utils/Intake";
import {
  GetDashProjectsWithFilters,
  GetMasterDataPM,
  GetPMProjects,
} from "@/utils/PM";
import { DollarSignIcon } from "lucide-react";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const PMView = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "40",
      url: "PMView",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "project_id",
      column_width: "75",
      url: "PMView",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "project_name",
      column_width: "200",
      url: "PMView",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "75",
      url: "PMView",
      order_no: 4,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "PMView",
      order_no: 5,
    },

    {
      label: "Status",
      key: "status_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "PMView",
      order_no: 6,
    },

    {
      label: "%",
      key: "progress_percentage1",
      visible: false,
      type: "progresscount",
      column_width: "70",
      url: "PMView",
      order_no: 7,
    },

    {
      label: "Phase",
      key: "phase_status_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "PMView",
      order_no: 8,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "PMView",
      order_no: 9,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "PMView",
      order_no: 10,
    },
    {
      label: "Bus. Owner Dept.",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "PMView",
      order_no: 11,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: true,
      type: "",
      column_width: "135",
      url: "PMView",
      order_no: 12,
    },
    {
      label: "Proj. Owner Dept.",
      key: "project_owner_dept_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "PMView",
      order_no: 13,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "PMView",
      order_no: 14,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "135",
      url: "PMView",
      order_no: 15,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "135",
      url: "PMView",
      order_no: 16,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "135",
      url: "PMView",
      order_no: 17,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "PMView",
      order_no: 18,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "135",
      url: "PMView",
      order_no: 19,
    },
    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "80",
      url: "PMView",
      order_no: 20,
    },
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [pendingApproval, setPendingApproval] = useState<number>(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [departments, setDepartments] = useState<any[]>([]); // State to hold departments
  const [statuses, setStatuses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [project_id, setProject_id] = useState("");
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
  const fetchPendingProjects = async (
    page = currentPage,
    pageSize = rowsPerPage
  ) => {
    try {
      const response = await GetProjectApproval({
        PageNo: page,
        PageSize: pageSize,
      });
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      //console.log('Get Projects Response:', result);

      if (result?.data && Array.isArray(result.data)) {
        setPendingApproval(
          result.data.filter((m) => m.status === 1 || m.status === 3).length
        );
      } else {
        console.error("Invalid Projects data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const fetchProjects = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      ////////////debugger;
      const response = await GetPMProjects({
        PageNo: page,
        PageSize: parseInt(pageSize.toString(), 10),
      });
      //console.log('Get Projects Response:', response);
      const result = JSON.parse(response);

      //console.log('Parsed Get Projects Response:', result);
      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        setProjects(result.data.projects);
        const firstProject = result.data.projects[0];
        //const headersColumns = Object.keys(firstProject).map(key => ({
        //  label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), // Generate readable labels
        //   key: key,
        //   visible: true,
        // }));
        //headersColumns.push({label: 'Action', key: 'action', visible: true});
        //setHeaders(headersColumns);
        const totalRecords = result.pagination.totalRecords;
        setTotalRecords(totalRecords);
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages);
        localStorage.setItem("UserState", "PMView");
        //setdataLoading(false);
      } else {
        console.error("Invalid Projects data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
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

      // Combine pagination and filters into one request payload
      const requestPayload = { PageNo: page, PageSize: pageSize, ...filters };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetDashProjectsWithFilters(requestPayload);
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
  const handleViewPress = (id: number) => {
    //console.log('Navigating with Project ID:', id); Bilal
    // navigate("ProjectPreview", {
    //   projectId: id,
    //   isApproved: true,
    //   filters: {
    //     departments: selectedDepartment,
    //     status: selectedStatus,
    //     keyword: searchQuery,
    //     project_id: project_id,
    //   },
    // });
  };
  // const handleUpdateProjectPlan = (id: number) => {
  //   //console.log('Navigating with Project ID:', id);
  //   navigate("ProjectDetails", {
  //     project_id: id,
  //   });
  //   /* navigate('ProjectPreview', {
  //             projectId: id,
  //             isApproved: false,
  //             //redirect: 'IntakeList',
  //           }); */
  //   // navigate('ProjectPreview', {
  //   //   projectId: id,
  //   //   isApproved: true,
  //   //   redirect: 'ApprovedProjectList',
  //   // });
  // };
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

  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      //await fetchColumnVisibility();
      FetchMasterDataPM("PMView");
      //setLoading(false);
      fetchPendingProjects();
      // const filters = route.params?.filters || {};
      // if (filters) {
      //   setSelectedDepartment(filters.departments || "");
      //   setSelectedStatus(filters.status || "");
      //   setSearchQuery(filters.keyword || "");
      //   setProject_id(filters.project_id || "");

      //   await fetchProjectsWithFilters({
      //     project_owner_dept: filters.departments || "",
      //     status: filters.status || "",
      //     keyword: filters.keyword || "",
      //     project_id: filters.project_id || "",
      //     PageNo: 1,
      //     PageSize: rowsPerPage,
      //   });
      // } else {
      //   await fetchProjectsWithFilters({
      //     PageNo: 1,
      //     PageSize: rowsPerPage,
      //   });
      // }
      fetchProjectsWithFilters({
        PageNo: 1,
        PageSize: rowsPerPage,
      });
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        navigation(
                          `/PMView/ProjectAudit?projectId=${item.project_id}`
                        );
                      }}
                    >
                      <Details_line_svg fill="white" height={20} width={20}/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Audit Log"}</TooltipContent>
                </Tooltip>
                {parseInt(item.status?.toString() ?? "") === 3 ||
                  (parseInt(item.status?.toString() ?? "") === 5 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            console.log("View", item);
                            navigation(
                              `ProjectDetails?projectId=${item.project_id}`
                            );
                          }}
                        >
                          <ProjectPlanSVG height={22} width={22} className="[&_path]:fill-white"/>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{"Update Project Plan"}</TooltipContent>
                    </Tooltip>
                  ))}

                {(parseInt(item.status?.toString() ?? "") === 26 ||
                  parseInt(item.status?.toString() ?? "") === 14 ||
                  parseInt(item.status?.toString() ?? "") === 22 ||
                  parseInt(item.status?.toString() ?? "") === 23 ||
                  parseInt(item.status?.toString() ?? "") === 24 ||
                  parseInt(item.status?.toString() ?? "") === 1) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          console.log("View", item);
                          navigation(
                            `/PMView/ProjectProgressOverview?projectId=${item.project_id}`
                          );
                        }}
                      >
                        <Update_project_statusSVG height={22} width={22} className="[&_path]:fill-white"/>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Update Status"}</TooltipContent>
                  </Tooltip>
                )}

                {(parseInt(item.status?.toString() ?? "") === 14 ||
                  parseInt(item.status?.toString() ?? "") === 5 ||
                  parseInt(item.status?.toString() ?? "") === 22 ||
                  parseInt(item.status?.toString() ?? "") === 23 ||
                  parseInt(item.status?.toString() ?? "") === 24 ||
                  parseInt(item.status?.toString() ?? "") === 26 ||
                  parseInt(item.status?.toString() ?? "") === undefined ||
                  isNaN(parseInt(item.status?.toString() ?? ""))) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          console.log("View", item);
                          navigation(
                            `/PMView/ChangeRequest?projectId=${item.project_id}`
                          );
                        }}
                      >
                        <ChangeRequestSVG height={22} width={22} className="[&_path]:fill-white"/>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Change Request"}</TooltipContent>
                  </Tooltip>
                )}

                {(parseInt(item.status?.toString() ?? "") === 14 ||
                  parseInt(item.status?.toString() ?? "") === 5 ||
                  parseInt(item.status?.toString() ?? "") === 22 ||
                  parseInt(item.status?.toString() ?? "") === 23 ||
                  parseInt(item.status?.toString() ?? "") === 26 ||
                  parseInt(item.status?.toString() ?? "") === undefined ||
                  isNaN(parseInt(item.status?.toString() ?? ""))) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => {
                          console.log("View", item);
                          navigation(
                            `/PMView/BudgetPlanner?projectId=${item.project_id}`
                          );
                        }}>
                        <DollarSignIcon height={22} width={22}  />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Update Budget"}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
             isfilter1={true}
            data={projects}
            columns={headers}
            title="PMView"
            exportFileName="pm_view"
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
              setProject_id(worker1);

              await fetchProjectsWithFilters({
                page: 1,
                pageSize: rowsPerPage,
                project_id: worker1,
              });
            }}
            query={"all"}
            onClearFilter={async () => {
              //setdataLoading(true);
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
              //setdataLoading(false);
            }}
            data_type={""}
          />
        </div>
      </div>
    </div>
  );
};

export default PMView;
