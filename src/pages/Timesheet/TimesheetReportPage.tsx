/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomTabs from "@/components/ui/custom-tabs";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import {
  get_projects_autocomplete,
  get_resources_autocomplete,
  GetMasterDataPM,
} from "@/utils/PM";
import { useEffect, useRef, useState } from "react";
import { AutoComplete } from "rsuite";
import ProjectTimesheetReport from "./ProjectTimesheetReport";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clear_filter } from "@/assets/Icons";
import ResourceTimesheetReport from "./ResourceTimesheetReport";
// import ExportExcel from "@/services/ExportExcel";
import {
  GetAllProjectsTimesheets,
  GetAllResourcesTimesheets,
} from "./TImeSheets";
import { format } from "date-fns";
import { exportToExcel } from "@/utils/excelExport";
import { ExportExcel } from "@/services/ExportExcel";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const TimesheetReportPage = () => {
  const [projectView, setProjectView] = useState(false);
  const [tabItems, setTabItems] = useState([
    { label: "Resource View", to: "resource", active: true },
    { label: "Project View", to: "project", active: false },
  ]);
  //search
  const [searchList, setSearchList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const justSelected = useRef(false);
  const [selectedItem, setSelectedItem] = useState("");

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setselectedDept] = useState("");

  const FetchMasterDataPM = async (url: string) => {
    try {
      const response = await GetMasterDataPM(url);

      const result = JSON.parse(response);

      if (result.status === "success") {
        setDepartments(result.data.departments);
      } else {
        console.error("Failed to fetch master data:", result.message);
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };
  const handleTabClick = (clickedTo: string) => {
    const updatedTabs = tabItems.map((tab) => ({
      ...tab,
      active: tab.to === clickedTo,
    }));
    setTabItems(updatedTabs);
  };
  const handleProjectSearch = async (value: any) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchList([]);
      return;
    }

    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const response = await get_projects_autocomplete(searchQuery, "project");
    const result = JSON.parse(response);
    const formatted = result.data.map(
      (item: { value: string; project_id: number }) => ({
        label: item.value,
        value: item.project_id,
      })
    );

    setSearchList(formatted);
  };

  const handleResourceSearch = async (value: any) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchList([]);
      return;
    }

    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const response = await get_resources_autocomplete(searchQuery, "project");
    const result = JSON.parse(response);
    const formatted = result.data.map(
      (item: { value: string; resource_id: number }) => ({
        label: item.value,
        value: item.resource_id,
      })
    );

    setSearchList(formatted);
  };
  const [excelData, setExcelData] = useState<any>();

  const fetchAllResourcesTimesheet = async (query: {}) => {
    try {
      const res = await GetAllResourcesTimesheets(query);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        //setTimesheetData(parsedRes.data);
        //setTotalRecords(parsedRes.pagination.totalRecords);
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
        //////debugger;
        ExportExcel(excelRows);
      } else {
        console.log("error fetching timesheet data", parsedRes.message);
      }
    } catch (error) {
      console.log("error fetching resources timesheet:", error);
    }
  };
  const fetchProjectData = async (query: {}) => {
    try {
      //setLoading(true);
      const res = await GetAllProjectsTimesheets(query);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        // setProjectData(parsedRes.data);
        //setTotalRecords(parsedRes.pagination.totalRecords);
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
        ////debugger;
        setExcelData(excelRows);
        ExportExcel(excelRows);
      } else {
        console.error("Error fetching project data:", parsedRes.message);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      //setLoading(false);
    }
  };
  useEffect(() => {
    FetchMasterDataPM("");
  }, []);

  return (
    <>
      <div className="w-full h-full">
        <div className="w-full h-full overflow-auto">
          <div className="flex justify-start">
            <CustomTabs
              tabs={tabItems}
              onClick={(worker: string) => {
                if (worker === "resource") {
                  handleTabClick(worker);
                  setProjectView(false);
                } else {
                  handleTabClick(worker);
                  setProjectView(true);
                }
              }}
            />
          </div>
          <div className="flex justify-end mt-4 gap-2">
            {(selectedDept.length > 0 || searchQuery.length > 0) && (
              // <Tooltip title="Clear Filter">
              //   <button
              //     className="mr-2 mb-2"
              //     onClick={async () => {
              //       setselectedDept("");
              //       setSelectedItem("");
              //       setSearchQuery("");
              //       justSelected.current = false;
              //     }}
              //   >
              //     <Clear_filter height={30} width={30} className="mb-2" />
              //   </button>
              // </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setselectedDept("");
                      setSelectedItem("");
                      setSearchQuery("");
                      justSelected.current = false;
                    }}
                  >
                    <Clear_filter height={30} width={30} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Clear Filter</TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={async () => {
                const selectedTab = tabItems.find((tab) => tab.active);
                const selectedTo = selectedTab?.to;
                if (selectedTo === "resource") {
                  await fetchAllResourcesTimesheet({
                    PageNo: 1,
                    PageSize: 10000,
                    resource_id: selectedItem,
                    parent_department_id: selectedDept,
                  });
                } else {
                  await fetchProjectData({
                    PageNo: 1,
                    PageSize: 10000,
                    project_id: "",
                    parent_department_id: selectedDept,
                  });
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>

            <AutoComplete
              placeholder="&#x1F50D;Search Project..."
              data={searchList}
              value={searchQuery}
              onChange={(val) => {
                if (justSelected.current) {
                  justSelected.current = false;
                  const selected = searchList.find((m) => m.value === val);
                  if (selected) {
                    setSearchQuery(selected?.label);
                  }
                  return;
                }
                projectView
                  ? handleProjectSearch(val)
                  : handleResourceSearch(val);
              }}
              onSelect={async (item: any) => {
                justSelected.current = true;
                setSelectedItem(item);
                setSearchQuery(item.label);
                if (projectView) {
                  console.log("Selected Project:", item);
                } else {
                  console.log("Selected Resource:", item);
                }
              }}
              className="custom-autocomplete"
              menuClassName="custom-autocomplete-menu"
            />

            <MultiSelectDepartment
              placeholder="Select Departments"
              departments={departments}
              selected={
                selectedDept?.length > 0 ? selectedDept?.split(",") : []
              }
              onChange={async function (selected: string[]): Promise<void> {
                const worker = selected?.join(",");
                setselectedDept(worker);
              }}
            />
          </div>
          <div className="flex justify-end mt-4 gap-2">
            {projectView ? (
              <ProjectTimesheetReport
                projectId={selectedItem}
                selectedDepartments={selectedDept}
              />
            ) : (
              <ResourceTimesheetReport
                resourceId={selectedItem}
                selectedDepartments={selectedDept}
                // onDataChange={async (data) => {
                //   //setExcelData(data);
                // }}
              />
            )}
          </div>
        </div>
      </div>
      {/* <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "column" }}>
          <View style={styles.tabsContainer}>
            <button
              className={`tab ${!projectView ? "active" : ""}`}
              onClick={() => {
                setProjectView(false);
                setselectedDept("");
                setSelectedItem("");
                setSearchQuery("");
                justSelected.current = false;
              }}
            >
              Resource View
            </button>

            <button
              className={`tab ${projectView ? "active" : ""}`}
              onClick={() => {
                setProjectView(true);
                setselectedDept("");
                setSelectedItem("");
                setSearchQuery("");
                justSelected.current = false;
              }}
            >
              Project View
            </button>
          </View>
          <View style={styles.filterContainer}>
            {(selectedDept.length > 0 || searchQuery.length > 0) && (
              <TouchableOpacity
                onPress={() => {
                  setselectedDept("");
                  setSelectedItem("");
                  setSearchQuery("");
                  justSelected.current = false;
                }}
                style={{ padding: 5 }}
              >
                <Clear_filter height={30} width={30} />
              </TouchableOpacity>
            )}
            <AutoComplete
              placeholder={
                projectView ? "🔍 Search Project..." : "🔍 Search Resource..."
              }
              data={searchList}
              value={searchQuery}
              onChange={(val) => {
                if (justSelected.current) {
                  justSelected.current = false;
                  const selected = searchList.find((m) => m.value === val);
                  if (selected) {
                    setSearchQuery(selected?.label);
                  }
                  return;
                }
                projectView
                  ? handleProjectSearch(val)
                  : handleResourceSearch(val);
              }}
              onSelect={async (item: any) => {
                justSelected.current = true;
                setSelectedItem(item);
                setSearchQuery(item.label);
                if (projectView) {
                  console.log("Selected Project:", item);
                } else {
                  console.log("Selected Resource:", item);
                }
              }}
              style={{ width: 250, alignSelf: "center" }}
              menuClassName="custom-autocomplete-menu"
            />
            {departments.length > 0 && (
              <MultiLavelDropdown
                dropdown_id={"timesheetDrop"}
                placeholder={"Select Project Owner Department"}
                dropdown_type={"multi"}
                selected_value={selectedDept}
                onSingleSelect={function (worker: string): void {
                  setselectedDept(worker);
                }}
                onMultiSelect={function (worker: string): void {
                  setselectedDept(worker);
                }}
                MasterData={departments}
                dropdown_styles={{ width: 250 }}
                options_styles={{ width: 250 }}
              />
            )}
          </View>
        </View>
        {projectView ? (
          <ProjectTimesheetReport
            projectId={selectedItem}
            selectedDepartments={selectedDept}
          />
        ) : (
          <ResourceTimesheetReport
            resourceId={selectedItem}
            selectedDepartments={selectedDept}
            onDataChange={async (data) => {
              setExcelData(data);
            }}
          />
        )}
      </View> */}
    </>
  );
};
export default TimesheetReportPage;
const styles = {
  tabsContainer: {
    borderRadius: 8,
    paddingTop: 10,
    paddingVertical: 16,
    flexDirection: "row",
  },
  filterContainer: {
    flex: 1,
    alignSelf: "flex-end",
    paddingBottom: 10,
    flexDirection: "row",
    paddingRight: 10,
    gap: 5,
  },
};
