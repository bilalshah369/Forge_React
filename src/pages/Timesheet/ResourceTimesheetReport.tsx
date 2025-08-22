/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { GetAllResourcesTimesheets } from "./TImeSheets";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import ExportExcel from "@/services/ExportExcel";
import { useTheme } from "@/themes/ThemeProvider";

interface Props {
  resourceId?: string;
  selectedDepartments?: string;
}
const ResourceTimesheetReport: React.FC<Props> = ({
  resourceId,
  selectedDepartments,
}) => {
  //const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [timesheetData, setTimesheetData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [expandedResource, setExpandedResource] = useState<
    Record<number, boolean>
  >({});
  // New state: expanded timesheet rows per project (resource_id -> project_id -> bool)
  const [expandedProjectTimesheets, setExpandedProjectTimesheets] = useState<
    Record<number, Record<number, boolean>>
  >({});
  const [excelData, setExcelData] = useState<any>();

  const fetchAllResourcesTimesheet = async (query: {}) => {
    try {
      const res = await GetAllResourcesTimesheets(query);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        setTimesheetData(parsedRes.data);
        setTotalRecords(parsedRes.pagination.totalRecords);
        const excelRows = parsedRes.data
          .filter(
            (item) =>
              Array.isArray(item.projects) &&
              item.projects.some(
                (project: any) =>
                  Array.isArray(project.timesheets) &&
                  project.timesheets.length > 0
              )
          )
          .flatMap((item) =>
            item.projects
              .filter(
                (project: any) =>
                  Array.isArray(project.timesheets) &&
                  project.timesheets.length > 0
              )
              .flatMap((project: any) =>
                project.timesheets.map((ts: any) => ({
                  Resource: item.full_name,
                  Project: project.project_name,
                  "Resource Department": item.resource_department_name,
                  "Reporting Manager": item.manager_name,
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
        console.log("error fetching timesheet data", parsedRes.message);
      }
    } catch (error) {
      console.log("error fetching resources timesheet:", error);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePageChange = async (newPage: number) => {
    setPageNo(newPage);
    setTableLoading(true);
    fetchAllResourcesTimesheet({
      PageNo: newPage,
      PageSize: pageSize,
      resource_id: resourceId && resourceId,
      parent_department_id: selectedDepartments && selectedDepartments,
    }).then(() => {
      setTableLoading(false);
    });
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNo(1);
    setTableLoading(true);
    fetchAllResourcesTimesheet({
      PageNo: 1,
      PageSize: newPageSize,
      resource_id: resourceId && resourceId,
      parent_department_id: selectedDepartments && selectedDepartments,
    }).then(() => setTableLoading(false));
  };
const {theme} =useTheme();
  useEffect(() => {
    setLoading(true);
    setTableLoading(true);
    fetchAllResourcesTimesheet({
      PageNo: pageNo,
      PageSize: pageSize,
      resource_id: resourceId && resourceId,
      parent_department_id: selectedDepartments && selectedDepartments,
    }).then(() => {
      setLoading(false);
      setTableLoading(false);
    });
  }, [resourceId, selectedDepartments]);

  // Ensure hooks are always rendered
  // const loadingContent = (
  //   <View style={styles.loaderContainer}>
  //     <ActivityIndicator size="large" color="#044086" />
  //   </View>
  // );

  const handleProjectExpand = async (dataString: string) => {
    try {
      const { resource_id } = JSON.parse(dataString);

      const isExpanded = expandedResource[resource_id];
      if (isExpanded) {
        setExpandedResource((prev) => ({ ...prev, [resource_id]: false }));
      } else {
        setExpandedResource((prev) => ({ ...prev, [resource_id]: true }));
      }
    } catch (error) {
      console.error("Invalid format:", dataString);
    }
  };

  // New handler for expanding/collapsing timesheet rows for a project
  const handleProjectTimesheetExpand = (
    resourceId: number,
    projectId: number
  ) => {
    setExpandedProjectTimesheets((prev) => ({
      ...prev,
      [resourceId]: {
        ...(prev[resourceId] || {}),
        [projectId]: !(prev[resourceId] || {})[projectId],
      },
    }));
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {loading ? (
        //loadingContent
        <></>
      ) : (
        <div className="">
          {tableLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-700"></div>
            </div>
          ) : (
            <div className="w-full bg-white rounded">
              <table className="w-full table-auto border-collapse">
                <thead className=" text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}>
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Resource</th>
                    <th className="p-2 text-left">Projects</th>
                    <th className="p-2 text-left">Department</th>
                    <th className="p-2 text-left">Reporting Manager</th>
                    <th className="p-2 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetData.map((item, index) => (
                    <React.Fragment key={item.resource_id}>
                      <tr className="bg-white border-b">
                        <td className="p-2 font-bold">
                          {(pageNo - 1) * pageSize + index + 1}
                        </td>
                        <td className="p-2">{item.full_name}</td>
                        <td className="p-2">{item.projects.length}</td>
                        <td className="p-2">{item.resource_department_name}</td>
                        <td className="p-2">{item.manager_name}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() =>
                              handleProjectExpand(
                                JSON.stringify({
                                  resource_id: String(item.resource_id),
                                })
                              )
                            }
                          >
                            {expandedResource[item.resource_id] ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={24} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {expandedResource[item.resource_id] && (
                        <tr>
                          <td colSpan={6} className="p-2">
                            <div className="border rounded p-2 shadow-sm bg-white">
                              {item.projects.length > 0 ? (
                                <table className="w-full table-auto mt-2">
                                  <thead className="text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}>
                                    <tr>
                                      <th className="p-2">S.No.</th>
                                      <th className="p-2">Project Name</th>
                                      <th className="p-2">Status</th>
                                      <th className="p-2">Department</th>
                                      <th className="p-2">Start Date</th>
                                      <th className="p-2">End Date</th>
                                      <th className="p-2 text-right"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.projects.map(
                                      (project, projectIndex) => (
                                        <React.Fragment
                                          key={project.project_id}
                                        >
                                          <tr className="border-b">
                                            <td className="p-2">
                                              {projectIndex + 1}
                                            </td>
                                            <td className="p-2">
                                              {project.project_name.length < 20
                                                ? project.project_name
                                                : `${project.project_name.slice(
                                                    0,
                                                    20
                                                  )}...`}
                                            </td>
                                            <td className="p-2">
                                              <div
                                                className="w-6 h-6 rounded-full"
                                                style={{
                                                  backgroundColor:
                                                    project.status_color,
                                                }}
                                              ></div>
                                            </td>
                                            <td className="p-2">
                                              {project.project_owner_dept_name}
                                            </td>
                                            <td className="p-2">
                                              {format(
                                                project.start_date,
                                                "MM/dd/yyyy"
                                              )}
                                            </td>
                                            <td className="p-2">
                                              {format(
                                                project.end_date,
                                                "MM/dd/yyyy"
                                              )}
                                            </td>
                                            <td className="p-2 text-right">
                                              {project.timesheets.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    handleProjectTimesheetExpand(
                                                      item.resource_id,
                                                      project.project_id
                                                    )
                                                  }
                                                >
                                                  {expandedProjectTimesheets?.[
                                                    item.resource_id
                                                  ]?.[project.project_id] ? (
                                                    <ChevronUp size={20} />
                                                  ) : (
                                                    <ChevronDown size={24} />
                                                  )}
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                          {expandedProjectTimesheets?.[
                                            item.resource_id
                                          ]?.[project.project_id] && (
                                            <tr>
                                              <td colSpan={7} className="p-2">
                                                <div className="border rounded p-2 shadow-sm bg-gray-50">
                                                  <table className="w-full table-auto">
                                                    <thead className="text-white" style={{backgroundColor:theme.colors.drawerBackgroundColor}}>
                                                      <tr>
                                                        <th className="p-2">
                                                          S.No.
                                                        </th>
                                                        <th className="p-2">
                                                          Date
                                                        </th>
                                                        <th className="p-2">
                                                          Start Time
                                                        </th>
                                                        <th className="p-2">
                                                          End Time
                                                        </th>
                                                        <th className="p-2">
                                                          Total Hours
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {project.timesheets.map(
                                                        (ts, tsIndex) => (
                                                          <tr
                                                            key={tsIndex}
                                                            className="border-b"
                                                          >
                                                            <td className="p-2">
                                                              {tsIndex + 1}
                                                            </td>
                                                            <td className="p-2">
                                                              {format(
                                                                ts.date,
                                                                "MM/dd/yyyy"
                                                              ) || "N/A"}
                                                            </td>
                                                            <td className="p-2">
                                                              {ts.start_time ||
                                                                "N/A"}
                                                            </td>
                                                            <td className="p-2">
                                                              {ts.end_time ||
                                                                "N/A"}
                                                            </td>
                                                            <td className="p-2">
                                                              {ts.total_hours ||
                                                                "N/A"}
                                                            </td>
                                                          </tr>
                                                        )
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="p-4 text-center text-gray-500 italic">
                                  No projects found
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Custom Pagination */}
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
      )}
    </div>
  );
};

const styles = {
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  modalContentContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    maxHeight: "90%",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "90%",
    maxHeight: "90%",
    elevation: 5,
  },

  expandedRow: {
    backgroundColor: "#f1f9ff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  expandedText: {
    color: "#333",
    fontSize: 13,
  },
  noDataText: {
    marginTop: 24,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#044086",
    backgroundColor: "#eaf1fa",
  },
  dynamicHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#044086",
    marginTop: 24,
    marginBottom: 6,
    alignSelf: "center",
  },
  container: {
    padding: 10,
    backgroundColor: "#f4f6f8",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 12,
  },
  miniCard: {
    width: "15.5%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  disabledText: {
    color: "black",
  },
  miniLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
    color: "#444",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#044086",
    marginBottom: 20,
    textAlign: "center",
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 16,
  },
  pageButton: {
    backgroundColor: "#044086",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerStyle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "white",
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  cardContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "48%",
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cellStyle: {
    fontSize: 14,
    color: "#000",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  cardLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    textAlign: "left",
  },
  tableContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
  },
  tableHeader: {
    height: 40,
    alignItems: "center",
    borderBottomWidth: 0,
  },
};

export default ResourceTimesheetReport;
