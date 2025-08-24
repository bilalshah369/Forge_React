/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { GetAllProjectsTimesheets } from "./TImeSheets";
import { useTheme } from "@/themes/ThemeProvider";
interface Timesheet {
  timesheet_id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  total_hours: string;
  description: string;
}

interface Resource {
  resource_id: number;
  full_name: string;
  manager_name: string;
  resource_department_name: string;
  timesheets: Timesheet[];
}

interface Project {
  project_id: number;
  customer_project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  status: number;
  status_name: string;
  status_color: string;
  progress_status_color: string;
  progress_back_color: string;
  project_owner_dept_name: string;
  progress_percentage: string;
  resources: Resource[];
}

interface Props {
  projectId?: string;
  selectedDepartments?: string;
}

const ProjectTimesheetReport: React.FC<Props> = ({
  projectId,
  selectedDepartments,
}) => {
  //const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [expandedProjects, setExpandedProjects] = useState<
    Record<number, boolean>
  >({});
  // New state: expanded timesheet rows per resource (project_id -> resource_id -> bool)
  const [expandedResourceTimesheets, setExpandedResourceTimesheets] = useState<
    Record<number, Record<number, boolean>>
  >({});
  // Excel data state
  const [excelData, setExcelData] = useState<any>();

  const fetchProjectData = async (query: {}) => {
    try {
      setLoading(true);
      const res = await GetAllProjectsTimesheets(query);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        setProjectData(parsedRes.data);
        setTotalRecords(parsedRes.pagination.totalRecords);
        // Excel rows logic: flatten all timesheets for all resources in all projects
        const excelRows = parsedRes.data
          .filter(
            (project: any) =>
              Array.isArray(project.resources) &&
              project.resources.some(
                (resource: any) =>
                  Array.isArray(resource.timesheets) &&
                  resource.timesheets.length > 0
              )
          )
          .flatMap((project: any) =>
            project.resources
              .filter(
                (resource: any) =>
                  Array.isArray(resource.timesheets) &&
                  resource.timesheets.length > 0
              )
              .flatMap((resource: any) =>
                resource.timesheets.map((ts: any) => ({
                  Resource: resource.full_name,
                  Project: project.project_name,
                  "Project Owner Department": project.project_owner_dept_name,
                  "Reporting Manager": resource.manager_name,
                  Date: ts.date
                    ? format(new Date(ts.date), "MM/dd/yyyy")
                    : "N/A",
                  "Start Time": ts.start_time || "N/A",
                  "End Time": ts.end_time || "N/A",
                  "Total Hours": ts.total_hours || "N/A",
                }))
              )
          );
        setExcelData(excelRows);
      } else {
        console.error("Error fetching project data:", parsedRes.message);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePageChange = async (newPage: number) => {
    setPageNo(newPage);
    setLoading(true);
    fetchProjectData({
      PageNo: newPage,
      PageSize: pageSize,
      project_id: projectId && projectId,
      parent_department_id: selectedDepartments && selectedDepartments,
    }).then(() => {
      setLoading(false);
    });
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNo(1);
    setLoading(true);
    fetchProjectData({
      PageNo: 1,
      PageSize: newPageSize,
      project_id: projectId && projectId,
      parent_department_id: selectedDepartments && selectedDepartments,
    }).then(() => setLoading(false));
  };
const {theme} =useTheme();
  useEffect(() => {
    setLoading(true);
    fetchProjectData({
      PageNo: pageNo,
      PageSize: pageSize,
      project_id: projectId && projectId,
      parent_department_id: selectedDepartments && selectedDepartments,
    }).then(() => setLoading(false));
  }, [projectId, selectedDepartments]);

  const toggleProjectExpand = (projectId: number) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // New handler for expanding/collapsing timesheet rows for a resource
  const handleResourceTimesheetExpand = (
    projectId: number,
    resourceId: number
  ) => {
    setExpandedResourceTimesheets((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [resourceId]: !(prev[projectId] || {})[resourceId],
      },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <span className="loader" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="flex justify-end mb-4">
            {/* <ExportExcel Data={excelData} /> */}
          </div>

          <table className="min-w-full bg-white shadow rounded-md">
            <thead className=" text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}>
              <tr>
                <th className="w-12 px-2 py-2">#</th>
                <th className="w-40 px-2 py-2">Proj. ID</th>
                <th className="w-52 px-2 py-2 text-left">Project Name</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-left">Department</th>
                <th className="px-2 py-2 text-left">Start Date</th>
                <th className="px-2 py-2 text-left">End Date</th>
                <th className="px-2 py-2 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {projectData.map((project, index) => (
                <React.Fragment key={project.customer_project_id}>
                  <tr className="border-b border-gray-200">
                    <td className="px-2 py-2 text-center font-bold">
                      {(pageNo - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {project.customer_project_id}
                    </td>
                    <td className="px-2 py-2">
                      <div title={project.project_name}>
                        {project.project_name.length < 20
                          ? project.project_name
                          : `${project.project_name.slice(0, 20)}...`}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center space-x-2">
                        <svg width={20} height={20}>
                          <circle
                            cx={10}
                            cy={10}
                            r={10}
                            fill={project.status_color}
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      {project.project_owner_dept_name}
                    </td>
                    <td className="px-2 py-2">
                      {format(new Date(project.start_date), "MM/dd/yyyy")}
                    </td>
                    <td className="px-2 py-2">
                      {format(new Date(project.end_date), "MM/dd/yyyy")}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => toggleProjectExpand(project.project_id)}
                      >
                        {expandedProjects[project.project_id] ? (
                          <span>▲</span>
                        ) : (
                          <span>▼</span>
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedProjects[project.project_id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-2">
                        {project.resources.length > 0 ? (
                          <table className="w-full border mt-2 text-sm">
                            <thead className=" text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}>
                              <tr>
                                <th className="px-2 py-1 text-left">S.No.</th>
                                <th className="px-2 py-1 text-left">Resource Name</th>
                                <th className="px-2 py-1 text-left">Department</th>
                                <th className="px-2 py-1 text-left">Manager</th>
                                <th className="px-2 py-1 text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {project.resources.map((resource, rIndex) => (
                                <React.Fragment key={resource.resource_id}>
                                  <tr className="bg-white border-b">
                                    <td className="px-2 py-1 text-center">
                                      {rIndex + 1}
                                    </td>
                                    <td className="px-2 py-1">
                                      {resource.full_name}
                                    </td>
                                    <td className="px-2 py-1">
                                      {resource.resource_department_name}
                                    </td>
                                    <td className="px-2 py-1">
                                      {resource.manager_name}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {resource.timesheets.length > 0 && (
                                        <button
                                          onClick={() =>
                                            handleResourceTimesheetExpand(
                                              project.project_id,
                                              resource.resource_id
                                            )
                                          }
                                        >
                                          {expandedResourceTimesheets[
                                            project.project_id
                                          ]?.[resource.resource_id] ? (
                                            <span>▲</span>
                                          ) : (
                                            <span>▼</span>
                                          )}
                                        </button>
                                      )}
                                    </td>
                                  </tr>

                                  {expandedResourceTimesheets[
                                    project.project_id
                                  ]?.[resource.resource_id] && (
                                    <tr className="bg-gray-100">
                                      <td colSpan={5}>
                                        {resource.timesheets.length > 0 ? (
                                          <table className="w-full mt-2 border text-xs">
                                            <thead className="text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}>
                                              <tr>
                                                <th className="px-2 py-1 text-left">
                                                  S.No.
                                                </th>
                                                <th className="px-2 py-1 text-left">
                                                  Date
                                                </th>
                                                <th className="px-2 py-1 text-left">
                                                  Start Time
                                                </th>
                                                <th className="px-2 py-1 text-left">
                                                  End Time
                                                </th>
                                                <th className="px-2 py-1 text-left">
                                                  Total Hours
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {resource.timesheets.map(
                                                (ts, tsIndex) => (
                                                  <tr
                                                    key={tsIndex}
                                                    className="bg-white border-b"
                                                  >
                                                    <td className="px-2 py-1 text-center">
                                                      {tsIndex + 1}
                                                    </td>
                                                    <td className="px-2 py-1">
                                                      {format(
                                                        new Date(ts.date),
                                                        "MM/dd/yyyy"
                                                      )}
                                                    </td>
                                                    <td className="px-2 py-1">
                                                      {ts.start_time || "N/A"}
                                                    </td>
                                                    <td className="px-2 py-1">
                                                      {ts.end_time || "N/A"}
                                                    </td>
                                                    <td className="px-2 py-1">
                                                      {ts.total_hours || "N/A"}
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </tbody>
                                          </table>
                                        ) : (
                                          <div className="italic text-center text-gray-500 p-2">
                                            No timesheet data available
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="italic text-gray-500 text-center">
                            No resources available
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center gap-4 mt-6 mb-2">
            <button
              onClick={() => handlePageChange(pageNo - 1)}
              disabled={pageNo === 1}
              className="px-3 py-1 rounded bg-blue-700 text-white disabled:bg-gray-300"
            >
              Prev
            </button>
            <span className="text-sm font-medium">
              Page {pageNo} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pageNo + 1)}
              disabled={pageNo === totalPages}
              className="px-3 py-1 rounded bg-blue-700 text-white disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectTimesheetReport;
