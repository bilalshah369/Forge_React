/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GetRaidTable } from "./Raid";
import { GetMasterDataPM, GetRAIDBubble } from "@/utils/PM";
import { GetAllStatus } from "@/utils/Users";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import { DateRangePicker } from "rsuite";
import BubbleChartCustom from "../charts/BubbleChartCustom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clear_filter } from "@/assets/Icons";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const RaidTracker = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "RaidTracker",
      order_no: 1,
    },
    /*  {
      label: 'Title',
      key: 'title',
      visible: true,
      type: '',
      column_width: '200',
    }, */

    {
      label: "Project ID",
      key: "customer_project_id",
      visible: true,
      type: "",
      column_width: "200",
      url: "RaidTracker",
      order_no: 2,
    },

    {
      label: "Type",
      key: "type",
      visible: true,
      type: "raid",
      column_width: "200",
      url: "RaidTracker",
      order_no: 3,
    },

    {
      label: "Description",
      key: "description",
      visible: true,
      type: "desc",
      column_width: "200",
      url: "RaidTracker",
      order_no: 4,
    },
    {
      label: "Mitigation Plan",
      key: "next_status",
      visible: true,
      type: "desc",
      column_width: "200",
      url: "RaidTracker",
      order_no: 5,
    },
    {
      label: "Owner",
      key: "raid_owner_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "RaidTracker",
      order_no: 6,
    },
    {
      label: "Status",
      key: "status_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "RaidTracker",
      order_no: 7,
    },
    {
      label: "Due Date",
      key: "due_date",
      visible: false,
      type: "date",
      column_width: "200",
      url: "RaidTracker",
      order_no: 8,
    },
    {
      label: "Priority",
      key: "priority_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "RaidTracker",
      order_no: 9,
    },

    // {
    //   label: 'Action',
    //   key: 'action',
    //   visible: true,
    //   type: '',
    //   column_width: '100',
    //   url: 'RaidTracker',
    //   order_no: 10,
    // },
  ]);
  const [raids, setRaids] = useState([]);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
  const [bubbleChartData, setBubbleChartData] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [isChartFiltered, setIsChartFiltered] = useState(false);
  const [range, setRange] = useState<any>(null);
  const [start_date, setStartDate] = useState<string>("2025-01-01");
  const [end_date, setEndDate] = useState<string>("2025-12-31");
  const [statuses, setStatuses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string>("");
  const handleChange = (value: any) => {
    setRange(value);

    if (value?.[0] && value?.[1]) {
      const formattedStart = value[0].toLocaleDateString("en-CA");
      const formattedEnd = value[1].toLocaleDateString("en-CA");

      setStartDate(formattedStart);
      setEndDate(formattedEnd);
      setCurrentPage(1);

      // Fetch filtered data
      FetchRaid(0, 1, rowsPerPage, formattedStart, formattedEnd);
      fetchRAIDBubble(formattedStart, formattedEnd);
    } else {
      // Clear filter
      setStartDate("2025-01-01");
      setEndDate("2025-12-31");
      setCurrentPage(1);

      FetchRaid(1, rowsPerPage);
      fetchRAIDBubble();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    FetchRaid(0, page, rowsPerPage);
  };

  const handleRowsPerPageChange = (newRows: number) => {
    setRowsPerPage(newRows);
    setCurrentPage(1);
    FetchRaid(0, 1, newRows);
  };
  const FetchRaid = async (
    prj_id = 0,
    page = currentPage,
    pageSize = rowsPerPage,
    startDate?: string,
    endDate?: string,
    priority?: string,
    status?: string,
    dept?: string
  ) => {
    try {
      setdataLoading(true);

      // Pass dates to GetRaids if supported
      const response = await GetRaidTable(
        prj_id,
        0,
        page,
        pageSize,
        startDate,
        endDate,
        priority,
        status,
        dept
      );

      const parsedRes = JSON.parse(response);

      if (parsedRes?.status === "success" && Array.isArray(parsedRes.data)) {
        const activeRaids = parsedRes.data.filter(
          (raid) => raid.is_active === true
        );

        setRaids(activeRaids);

        const calculatedTotalPages = Math.ceil(
          parsedRes.pagination.totalRecords / pageSize
        );
        setTotalPages(calculatedTotalPages);
        setdataLoading(false);
      } else {
        console.error("Invalid or empty data");

        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching RAID:", error);

      setdataLoading(false);
    }
  };
  const fetchRAIDBubble = async (
    startDate?: string,
    endDate?: string,
    status?: string,
    dept?: string
  ) => {
    try {
      const response = await GetRAIDBubble(
        "",
        "RaidTracker",
        startDate,
        endDate,
        status,
        dept
      );
      const result = JSON.parse(response);
      //////debugger;
      if (result.status === "success") {
        if (result?.data?.length > 0) {
          setBubbleChartData(result);
        } else {
          var obj = { data: [] };
          setBubbleChartData(obj);
        }
      } else {
        var obj = { data: [] };
        setBubbleChartData(obj);
      }
    } catch (error) {
      console.error("Error fetching bubble chart data:", error);
      setBubbleChartData({});
    }
  };
  function onStatusFilterAction(worker: string) {
    setSelectedStatus(worker ?? "");
    //setCurrentPage(1);
    //setSearchQuery('');
    //setSelectedPhase('');
    //setSelectedDepartments('');
    FetchRaid(
      0,
      1,
      rowsPerPage,
      start_date,
      end_date,
      "",
      worker,
      selectedDepartments
    );
    fetchRAIDBubble(start_date, end_date, worker, selectedDepartments);
  }

  function onDeptFilterAction(worker: string) {
    setSelectedDepartments(worker ?? "");
    FetchRaid(
      0,
      1,
      rowsPerPage,
      start_date,
      end_date,
      "",
      selectedStatus,
      worker
    );
    fetchRAIDBubble(start_date, end_date, selectedStatus, worker);
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
        // statuses.splice(0, statuses.length);
        // var std = result.data.status_all;
        // std.forEach((element: any) => {
        //   statuses.push({
        //     label: element.status_name,
        //     value: element.mapped_status,
        //     group: element.description,
        //     color: element.status_color?.trim(),
        //     //mapped_status: element.mapped_status?.trim(),
        //   });
        // });
        // setStatuses(statuses);
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
  const fetchAllStatus = async (typeLabel: string) => {
    try {
      const response = await GetAllStatus(typeLabel);
      const parsedRes =
        typeof response === "string" ? JSON.parse(response) : response;
      ////console.log(parsedRes.data.resource_types);
      if (parsedRes.status === "success") {
        ////////debugger;
        statuses.splice(0, statuses.length);
        const std = parsedRes.data.statuses;
        std.forEach((element: any) => {
          statuses.push({
            label: element.status_name,
            value: element.status_id,
            group: element.description,
            color: element.status_color?.trim(),
          });
        });
        setStatuses(statuses);
        //setStatuses(parsedRes.data.statuses);
      } else {
        console.error(
          "Failed to fetch user roles:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Error Fetching User Roles:", err);
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async function () {
      fetchRAIDBubble();
      FetchMasterDataPM("RaidTracker");
      fetchAllStatus("Risk");
      //await fetchColumnVisibility();
      FetchRaid();
      //await fetchPrioritiesData();

      localStorage.setItem("UserState", "RaidTracker");

      setLoading(false);
      setdataLoading(false);
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex justify-end mt-4 gap-2">
        {selectedStatus?.length > 0 ||
        selectedDepartments?.length > 0 ||
        isChartFiltered ? (
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
                  setSelectedDepartments("");
                  setIsChartFiltered(false);
                  setSelectedStatus("");
                  setCurrentPage(1);
                  FetchRaid(0, 1, rowsPerPage);
                  fetchRAIDBubble();
                }}
              >
                <Clear_filter height={30} width={30} />
              </div>
            </TooltipTrigger>
            <TooltipContent>Clear Filter</TooltipContent>
          </Tooltip>
        ) : null}
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
            setSelectedDepartments(worker);
            onDeptFilterAction(worker);
          }}
        />
        <DateRangePicker
          //placeholder="Select date range"
          //ranges={customRanges}
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
      <div className="flex flex-row p-2.5">
        <h2 className="text-lg font-bold ml-[90px]">Projects Risk Analysis</h2>
      </div>

      <div className="flex flex-row p-2">
        {/* Left Section - Labels */}
        <div className="w-20">
          <div className="text-center py-5 font-bold text-black rounded my-10 bg-red-600">
            Critical
          </div>
          <div className="text-center py-5 font-bold text-black rounded my-10 bg-orange-500">
            High
          </div>
          <div className="text-center py-5 font-bold text-black rounded my-10 bg-[#FFF056]">
            Medium
          </div>
          <div className="text-center py-5 font-bold text-black rounded my-10 bg-green-600">
            Low
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex-1 h-[500px]">
          <BubbleChartCustom
            data={bubbleChartData}
            onClcked={(worker1?: string, worker2?: string) => {
              setIsChartFiltered(true);
              FetchRaid(
                parseInt(worker1 ?? ""),
                1,
                rowsPerPage,
                start_date,
                end_date,
                worker2
              );
            }}
            height={500}
            width={600}
            startDate={start_date}
            endDate={end_date}
          />
        </div>
      </div>
      <div className="min-w-[1000px]">
        <AdvancedDataTable
          isfilter1={false}
          data={raids}
          columns={headers}
          title="Raid"
          exportFileName="raids"
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
          data_type={"Raid"}
        />
      </div>
    </div>
  );
};

export default RaidTracker;
