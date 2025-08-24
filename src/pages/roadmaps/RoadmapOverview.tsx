/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GetProjectsWithDependenciesFilters,
  GetProjectsWithFilters,
} from "./RoadMapOver";
import { get_projects_autocomplete, GetMasterDataPM } from "@/utils/PM";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
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
import { AutoComplete, DateRangePicker, Tooltip } from "rsuite";
import { Clear_filter } from "@/assets/Icons";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import MultifeatureGanttMilestone from "./MultifeatureGanttMilestone";
import MultifeatureGanttProjectDependencies from "./MultifeatureGanttProjectDependencies";
import { useTheme } from "@/themes/ThemeProvider";
import "rsuite/dist/rsuite.min.css"; 
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
const RoadmapOverview = () => {
  const [selectedRoadmapView, setSelectedRoadmapView] = useState<
    "Milestone" | "Project Dependencies"
  >("Milestone");
  const {theme}=useTheme();
  const [currentView, setCurrentView] = useState<string>("month");
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<any>([]);
  const [projectsWithDependencies, setProjectsWithDependencies] = useState<any>(
    []
  );
  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<string>("Progress");
  const [range, setRange] = useState<any>(null);
  //   const { theme } = useTheme();
  const [start_date, setStartDate] = useState<string>("2025-01-01");
  const [end_date, setEndDate] = useState<string>("2025-12-31");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string>("");
  const [phases, setPhases] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [searchList, setSearchList] = useState([]);
  const justSelected = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjectsWithFilters = async (
    page: number | undefined,
    rowsPerPage: number | undefined,
    filters: Record<string, any> = {}
  ) => {
    const page_ = page;
    const pageSize = rowsPerPage;

    try {
      const requestPayload = { ...filters };
      const response = await GetProjectsWithFilters(
        page_,
        pageSize,
        requestPayload
      );
      const result = JSON.parse(response);
      ////////////debugger;
      setProjects(result.data.projects);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      //setIsLoading(false); // Stop loader
    }
  };
  const fetchProjectsWithDependenciesFilters = async (
    page: number | undefined,
    rowsPerPage: number | undefined,
    filters: Record<string, any> = {}
  ) => {
    const page_ = page;
    const pageSize = rowsPerPage;

    try {
      const requestPayload = { ...filters };
      const response = await GetProjectsWithDependenciesFilters(
        page_,
        pageSize,
        requestPayload
      );
      const result = JSON.parse(response);
      ////////////debugger;
      setProjectsWithDependencies(result.data.projects);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      //setIsLoading(false); // Stop loader
    }
  };
  const handleChange = (value: any) => {
    setRange(value);
    if (value) {
      setStartDate(value[0]?.toLocaleDateString("en-CA"));
      setEndDate(value[1]?.toLocaleDateString("en-CA"));
      console.log("Selected Range:", value); // Logs selected range
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  function onStatusFilterAction(worker: string) {
    setSelectedStatus(worker ?? "");
    //setCurrentPage(1);
    //setSearchQuery('');
    //setSelectedPhase('');
    //setSelectedDepartments('');
    ////////debugger;
    selectedRoadmapView === "Milestone"
      ? fetchProjectsWithFilters(undefined, undefined, {
          status: worker,
          project_owner_dept: selectedDepartments,
        })
      : fetchProjectsWithDependenciesFilters(undefined, undefined, {
          status: worker,
          project_owner_dept: selectedDepartments,
        });

    //setIsProjectTable(true);
  }

  function onDeptFilterAction(worker: string) {
    setSelectedDepartments(worker ?? "");
    //setCurrentPage(1);
    //setSearchQuery('');
    //setSelectedPhase('');
    //setSelectedStatus('');
    selectedRoadmapView === "Milestone"
      ? fetchProjectsWithFilters(undefined, undefined, {
          project_owner_dept: worker,
          status: selectedStatus,
        })
      : fetchProjectsWithDependenciesFilters(undefined, undefined, {
          project_owner_dept: worker,
          status: selectedStatus,
        });
    //fetchDepartments({department_id: worker});
    //setIsProjectTable(false);
  }
  const FetchMasterDataPM = async (url: string) => {
    try {
      //setdataLoading(true);
      const response = await GetMasterDataPM(url);
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);

      if (result.status === "success") {
        //permissions

        //Column Visibility
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
            //mapped_status: element.mapped_status?.trim(),
          });
        });
        setStatuses(statuses);

        //Decisions

        //Phase
        phases.splice(0, phases.length);
        var std = result.data.status_phase;
        std.forEach((element: any) => {
          phases.push({
            label: element.status_name,
            value: element.status_id,
            group: element.description,
            color: element.status_color?.trim(),
          });
        });
        setPhases(phases);
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

  const handleSearch = async (value: any) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchList([]);
      return;
    }

    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const response = await get_projects_autocomplete(searchQuery, "all");
    //console.log('unparsed Department Response:', response);
    const result = JSON.parse(response);

    const formatted = result.data.map(
      (item: { value: string; project_id: number }) => ({
        label: item.value,
        value: item.project_id,
      })
    );

    // Filter search results to only include projects present in the current view's data
    let allowedIds: number[] = [];
    if (selectedRoadmapView === "Milestone") {
      allowedIds = projects.map((p: any) => p.project_id);
    } else {
      allowedIds = projectsWithDependencies.map((p: any) => p.project_id);
    }
    const filtered = formatted.filter((item) =>
      allowedIds.includes(item.value)
    );

    setSearchList(filtered);
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      setLoading(false);
      ////console.log('Current Route:', currentRoute);
      (async function () {
        await FetchMasterDataPM("AdminDboard");
        await fetchProjectsWithFilters(undefined, undefined, {});
        await fetchProjectsWithDependenciesFilters(undefined, undefined, {});
        localStorage.setItem("UserState", "RoadmapOverview");
      })();
      return () => {};
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="flex justify-between items-center w-full">
  <div className="w-auto  px-2 py-1">
    <div className="inline-flex border border-gray-300 rounded-full overflow-hidden text-sm font-medium shadow-sm [&>*]:w-[180px]">
              <button
                onClick={() => {
                  setSelectedRoadmapView("Milestone");
                  fetchProjectsWithFilters(undefined, undefined, {});
                  setSearchQuery("");
                }}
                className={`px-4 py-2 transition-colors duration-200 ${
                  selectedRoadmapView === "Milestone"
                    ? "bg-blue-800 text-white"
                    : "bg-white text-gray-800"
                }`}
                style={selectedRoadmapView==="Milestone" ?{backgroundColor:theme.colors.drawerBackgroundColor}:{backgroundColor:'white'}}
              >
                Milestone View
              </button>
              <button
                onClick={() => {
                  setSelectedRoadmapView("Project Dependencies");
                  fetchProjectsWithDependenciesFilters(
                    undefined,
                    undefined,
                    {}
                  );
                  setSearchQuery("");
                }}
                className={`px-4 py-2 transition-colors duration-200 ${
                  selectedRoadmapView === "Project Dependencies"
                    ? "bg-blue-800 text-white"
                    : "bg-white text-gray-800"
                }`}
                                style={selectedRoadmapView==="Project Dependencies" ?{backgroundColor:theme.colors.drawerBackgroundColor}:{backgroundColor:'white'}}

              >
                Dependency View
              </button>
            </div>
  </div>
  <div className="w-auto  px-2 py-1">
    <div className="flex flex-wrap gap-2 justify-end [&>*]:w-[208px]">
    {(selectedStatus ||
              selectedDepartments ||
              searchQuery ||
              range) && (
              <Tooltip title="Clear Filter">
                <button
                  className="mr-2 mb-2"
                  onClick={async () => {
                    setSelectedStatus("");
                    setSelectedDepartments("");
                    setStartDate("2025-01-01");
                    setEndDate("2025-12-31");
                    setRange(null);
                    setSearchQuery("");
                    selectedRoadmapView === "Milestone"
                      ? fetchProjectsWithFilters(undefined, undefined, {})
                      : fetchProjectsWithDependenciesFilters(
                          undefined,
                          undefined,
                          {}
                        );
                  }}
                >
                  <Clear_filter height={30} width={30} className="mb-2" />
                </button>
              </Tooltip>
            )}

            <AutoComplete
              placeholder="🔍 Search Project..."
              data={searchList}
              value={searchQuery}
              className="custom-autocomplete"
              menuClassName="custom-autocomplete-menu"
              onChange={async (val) => {
                if (justSelected.current) {
                  justSelected.current = false;
                  const selected = searchList.find((m) => m.value === val);
                  if (selected) setSearchQuery(selected.label);
                  return;
                }
                await handleSearch(val);
              }}
              onSelect={async (val) => {
                justSelected.current = true;
                selectedRoadmapView === "Milestone"
                  ? await fetchProjectsWithFilters(undefined, undefined, {
                      project_id: val,
                    })
                  : await fetchProjectsWithDependenciesFilters(
                      undefined,
                      undefined,
                      { project_id: val }
                    );
              }}
            />

            <MultiSelectDropdown
              items={statuses}
              placeholder="Filter by Status"
              selected={
                selectedStatus?.length > 0 ? selectedStatus?.split(",") : []
              }
              onChange={async function (selected: string[]): Promise<void> {
                ////debugger;
                const worker: any = selected?.join(",");
                setSelectedStatus(worker);
                onStatusFilterAction(worker);
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
                setSelectedDepartments(worker ?? "");
                onDeptFilterAction(worker);
              }}
            />

            {/* <MultiFeatureDropdown
                  dropdown_id="zoom_to"
                  placeholder="Zoom To"
                  dropdown_type="single"
                  selected_value={currentView}
                  onSingleSelect={(worker) => {
                    setCurrentView(worker);
                    if (worker === "year") {
                      setStartDate("2023-01-01");
                      setEndDate("2027-12-31");
                    } else {
                      setStartDate("2020-01-01");
                      setEndDate("2030-12-31");
                    }
                  }}
                  MasterData={[
                    { label: "Weekly", value: "week", group: "" },
                    { label: "Monthly", value: "month", group: "" },
                    { label: "Quarterly", value: "quarter", group: "" },
                    { label: "Yearly", value: "year", group: "" },
                  ]}
                  dropdown_styles={{ width: 208 }}
                  options_styles={{ width: 208 }}
                /> */}

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
                      { label: "Quarterly", value: "quarter", group: "" },
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
                        setCurrentView(opt.value);
                        if (opt.value === "year") {
                          setStartDate("2023-01-01");
                          setEndDate("2027-12-31");
                        } else {
                          setStartDate("2020-01-01");
                          setEndDate("2030-12-31");
                        }
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
              style={{width:250}}
              // shouldDisableDate={combine(allowedMaxDays(7), beforeToday())}
            /></div>
  </div>
</div>
      
        {selectedRoadmapView === "Milestone" && !loading && (
          <MultifeatureGanttMilestone
            data={projects}
            chat_view={currentView}
            start_date={start_date}
            end_date={end_date}
          />
        )}
        {selectedRoadmapView === "Project Dependencies" && !loading && (
          <MultifeatureGanttProjectDependencies
            data={projectsWithDependencies}
            chat_view={currentView}
            start_date={start_date}
            end_date={end_date}
          />
        )}
        <div>
          <div className="p-2">
            <div className="flex flex-wrap gap-2 py-2 mb-4"></div>

            <div className="bg-white rounded-md p-4"></div>
          </div>
        </div>
        <div className="min-w-[1000px]"></div>
      </div>
    </div>
  );
};

export default RoadmapOverview;
