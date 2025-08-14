/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetColumnVisibility,
  GetMasterDataPM,
  GetPMProjectsWithFilters,
  GetProjectAudit,
} from "@/utils/PM";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Back_svg, ProjectPhaseSVG } from "@/assets/Icons";
import { Project } from "../projects/ProjectProgress";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const ProjectAudit = () => {
  const [searchParams] = useSearchParams();
  const propProjectId = searchParams.get("projectId");

  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "40",
      url: "ProjectAudit",
      order_no: 1,
    },
    {
      label: "Field Name",
      key: "column_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "ProjectAudit",
      order_no: 2,
    },
    {
      label: "Old Value",
      key: "old_value",
      visible: true,
      type: "",
      column_width: "200",
      url: "ProjectAudit",
      order_no: 3,
    },
    {
      label: "New Value",
      key: "new_value",
      visible: true,
      type: "",
      column_width: "200",
      url: "ProjectAudit",
      order_no: 4,
    },
    {
      label: "Changed By",
      key: "changed_by_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "ProjectAudit",
      order_no: 5,
    },
    {
      label: "Changed On",
      key: "changed_at",
      visible: true,
      type: "",
      column_width: "200",
      url: "ProjectAudit",
      order_no: 6,
    },
  ]);
  const [last_update_date, setLastUpdateDate] = useState<string>(
    "2025-01-16T05:10:28.083Z"
  );
  const [project, setProject] = useState<Project>(new Project());
  const [projectAuditData, setProjectAuditData] = useState<any[]>([]);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);

  //const [propProjectId, setPropProjectId] = useState<number>(projectId);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const FetchInProgressProject = async (project_id = propProjectId) => {
    try {
      const page = 1;
      const pageSize = 100;
      const requestPayload = {
        PageNo: page,
        PageSize: pageSize,
        project_id: project_id.toString(),
      };
      //console.log('Fetching projects with filters:', requestPayload);

      const response = await GetPMProjectsWithFilters(requestPayload);
      //const response = await GetInprogressProject(project_query?.toString());
      //console.log(response);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        //////debugger
        setProject(parsedRes.data.projects[0]);
        setLastUpdateDate(parsedRes.data.projects[0].updated_at);
      } else {
        console.error(
          "Failed to fetch users:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
  // Fetch Project Audit
  const fetchProjectAudit = async (
    project_id = propProjectId,
    page = currentPage,
    pageSize = rowsPerPage
  ) => {
    try {
      setdataLoading(true);
      const response = await GetProjectAudit(
        parseInt(project_id),
        page,
        pageSize
      );
      console.log("Unparsed Response:", response);
      const result = JSON.parse(response);

      console.log("API Response:", result);
      if (result?.data?.changes && Array.isArray(result.data.changes)) {
        setProjectAuditData(result.data.changes);
        const calculatedTotalPages = Math.ceil(
          result.pagination.totalRecords / pageSize
        );
        setTotalPages(calculatedTotalPages);
        setdataLoading(false);
      } else {
        console.error("Invalid Project Audit data");
        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setdataLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjectAudit(propProjectId, page, rowsPerPage);
  };
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchProjectAudit(propProjectId, currentPage, newRowsPerPage);
  };

  const [dataLoading, setdataLoading] = useState<boolean>(true);

  const fetchColumnVisibility = async () => {
    try {
      //setdataLoading(true);
      const response = await GetColumnVisibility("ProjectAudit");
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      if (result.status === "error") {
        setIsColumnVisibility(false);
      }
      if (result.status === "success") {
        setHeaders(result.data);
        setIsColumnVisibility(true);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      await fetchColumnVisibility();
      await fetchProjectAudit(propProjectId, currentPage, rowsPerPage);
      await FetchInProgressProject(propProjectId);
      await localStorage.setItem("UserState", "ProjectAudit");
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="flex flex-row justify-between items-center h-[50px] mt-5 border-b-2">
          {/* Back button */}

          {/* Project name */}
          <div className="ml-5">
            <span className="text-black text-base font-bold">
              Project Name -{" "}
              <strong className="text-base">{project.project_name}</strong>
            </span>
          </div>

          {/* Last updated */}
          <div>
            <span className="text-black text-sm mr-2">
              Last Updated On :{" "}
              {new Date(last_update_date).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>
        <div className="min-w-[1000px]">
          <AdvancedDataTable
            data={projectAuditData}
            columns={headers}
            title="Project Audit"
            exportFileName="Project Audit"
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
            data_type={"Project"}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectAudit;
