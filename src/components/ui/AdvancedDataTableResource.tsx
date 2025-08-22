/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTable, TableColumn } from "@/hooks/useDataTable";
import { exportToExcel } from "@/utils/excelExport";
import { StatusMultiSelect, StatusOption } from "./StatusMultiSelect";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import {
  Checkbox_svg,
  Checkbox_unchecked_svg,
  Circle_svg,
  Clear_filter,
  List_filter,
  Plus_svg,
  Save_svg,
  Send_svg,
} from "@/assets/Icons";
import SVGProgressBar from "./SVGProgressBar";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { MultiSelectDepartment } from "./MultiSelectDepartment";
import { AutoComplete, DatePicker } from "rsuite";
import { get_projects_autocomplete } from "@/utils/PM";
import { useNavigate } from "react-router-dom";
import { convertUTCtoLocalDateOnly } from "@/utils/util";
import { cn } from "@/lib/utils";

interface AdvancedDataTableProps {
  data: any[];
  data_type: string;
  columns: TableColumn[];
  title?: string;
  exportFileName?: string;
  assignedPermission?: any;
  isCreate?: boolean;
  onCreate?: (worker?: string) => void;
  isPagingEnable?: boolean;
  PageNo?: number;
  TotalPageCount?: number;
  rowsOnPage?: number;
  onrowsOnPage?: (rows: number) => void;
  onPageChange?: (page: number) => void;
  onClearFilter?: (worker?: any) => void;

  isfilter1?: boolean;

  isStatusFilter?: boolean;
  status?: string;
  statustype?: string;
  onStatusFilterAction?: (worker: string) => void;

  isDepartmentFilter?: boolean;
  selectedDepartment?: string;
  onDepartmentFilterAction?: (worker: string) => void;
  MasterStatus?: any;
  MasterDepartments?: any;
  MasterMilestoneStatus?: any;

  isSearch?: boolean;
  query?: string;
  searchText?: string;
  onSearch?: (worker1: string, worker2: string) => void;

  isColumnVisibility?: boolean;
  isDownloadExcel?: boolean;
  actions?: React.ReactNode | ((item: any) => JSX.Element);

  checkEnable?: boolean;
  onCheckChange?: (worker: number) => void;

  handleInputChange?: (worker1: any, worker2: any) => void;
  handleSave?: (worker1: any) => void;

  onEstimatedChangeAction?: (
    worker1?: string,
    worker2?: string,
    worker3?: string,
    worker4?: string
  ) => void;
  MasterUsers?: any;
  onStatusChangeAction?: (worker1?: string, worker2?: string) => void;
}

const AdvancedDataTableResource: React.FC<AdvancedDataTableProps> = ({
  data_type,
  data,
  columns: initialColumns,
  title = "Data Table",
  rowsOnPage = 10,
  exportFileName = "export",
  TotalPageCount = 1,
  PageNo = 1,
  onrowsOnPage,
  onPageChange,
  isDepartmentFilter,
  isStatusFilter,
  MasterStatus,
  MasterDepartments,
  onStatusFilterAction,
  selectedDepartment,
  status,
  onDepartmentFilterAction,
  isSearch,
  searchText,
  query,
  onSearch,
  onClearFilter,
  isCreate,
  onCreate,
  assignedPermission,
  isfilter1,
  isColumnVisibility,
  isDownloadExcel,
  actions,
  checkEnable,
  onCheckChange,
  handleInputChange,
  handleSave,
  onEstimatedChangeAction,
  MasterUsers,
  onStatusChangeAction,
  MasterMilestoneStatus,
}) => {
  const [milestone_id, setMilestone_id] = useState("");
  const [isSentToModalVisible, setIsSentToModalVisible] = useState(false);
  const [dateApprovalMode, setDateApprovalMode] = useState<string>("2");
  const [allSelectedIDs, setAllSelectedIDs] = useState<number[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false); // State for Select All checkbox
  const [toggleFilter, onToggleFilter] = useState<boolean>(false);
  const [columns, setColumns] = useState(initialColumns);
  const [pageSizeState, setPageSizeState] = useState(rowsOnPage);
  const [statuses, setStatuses] = useState<any[]>(MasterStatus);
  const [departments, setDepartments] = useState<any[]>(MasterDepartments);
  const [selectedDepartments, setSelectedDepartments] =
    useState<string>(selectedDepartment);
  const [permissions, setPermissions] = useState<number[]>(assignedPermission);
  const {
    paginatedData,
    visibleColumns,
    totalPages,
    currentPage,
    searchTerm,
    sortConfig,
    handleSort,
    //handleSearch,
    handlePageChange,
    totalItems,
    setPageSize, // make sure useDataTable exposes this
  } = useDataTable({ data, columns, pageSize: pageSizeState });
  const [searchList, setSearchList] = useState([]);
  const justSelected = useRef(false);
  const [searchQuery, setSearchQuery] = useState(searchText || "");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const navigation = useNavigate();
  const typeMapping: { [key: string]: string } = {
    "1": "Risk",
    "2": "Issue",
    "3": "Assumption",
    "4": "Dependency",
    "5": "Decision",
  };
  function toBoolean(value: string): boolean {
    return value?.trim().toLowerCase() === "true";
  }
  const [sentTo, setSentTo] = useState("");
  const handleSearch = async (value: any) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchList([]);
      return;
    }
    const handleSelectAll = () => {
      if (selectAllChecked) {
        setAllSelectedIDs([]); // Deselect all users
      } else {
        const selectedUserIds: number[] = data.map((item) => {
          if (data_type === "Resource") {
            return Number(item.resource_id);
          } else if (data_type === "Milestone") {
            return Number(item.milestone_id);
          } else {
            return Number(item.user_id);
          }
        });

        //console.log('Selected Users ID:', selectedUserIds);
        setAllSelectedIDs(selectedUserIds);
      }

      setSelectAllChecked(!selectAllChecked); // Toggle "Select All" checkbox state
    };
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    const response = await get_projects_autocomplete(value, query);
    const result = JSON.parse(response);

    const formatted = result.data.map(
      (item: { value: string; project_id: number }) => ({
        label: item.value,
        value: item.project_id,
      })
    );
    setSearchList(formatted);
  };
  const handlePageSizeChange = (newSize: number) => {
    setPageSizeState(newSize);
    setPageSize(newSize);
    onrowsOnPage(newSize); // reset to page 1
  };

  const renderCellContent = (item: any, column: TableColumn, index: any) => {
    const value = item?.[column.key];
    //debugger;
    switch (column.type) {
      // case "status_click":
      //   return (
      //     <Badge variant="secondary" className="text-xs">
      //       {value || "Active"}
      //     </Badge>
      //   );

      case "progress":
        return (
          <div className="w-full max-w-[200px]">
            {/* <Progress value={value || 0} className="h-2" /> */}
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                <div className="cursor-pointer inline-flex">
                  <SVGProgressBar
                    percent={parseInt(
                      item["progress_percentage"]?.toString().trim()
                    )}
                    fillColor={item["progress_status_color"]?.toString().trim()}
                    bgColor={item["progress_back_color"]?.toString().trim()}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {item["progress_percentage"]?.toString().trim() + "%" ||
                  "Unknown Status"}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      case "progresscount":
        return <span className="text-sm font-medium">{value || 0}%</span>;
      case "cost":
        return (
          <span className="font-medium">
            ${value ? Number(value).toLocaleString() : "0"}
          </span>
        );
      case "estimated_date":
        return (
          <div className="flex gap-4 items-center justify-center">
            <div>
              <DatePicker
                //portalId="root-portal"
                //size="lg"

                oneTap
                value={
                  //new Date(item['revised_end_date']?.toString())
                  convertUTCtoLocalDateOnly(
                    item["revised_end_date"]?.toString()
                  )
                }
                onChange={(date) => {
                  // const iso = date?.toLocaleDateString('en-CA');
                  let iso = "";
                  if (date) {
                    const safeDate = new Date(date);
                    safeDate.setHours(12, 0, 0, 0); // avoids UTC shift issues
                    iso = safeDate.toISOString(); // "2025-04-08T12:00:00.000Z"
                  }

                  // setEstimatedDate(iso ?? "");
                  // ////////debugger;
                  onEstimatedChangeAction?.(
                    item["milestone_id"]?.toString(),
                    iso,
                    ""
                  );
                  //setIsSentToModalVisible(true);
                }}
                format="MM/dd/yyyy"
                // style={
                //   {
                //     height: 40,
                //     color: "black",
                //     "--rs-picker-placeholder-color": "black",
                //   } as React.CSSProperties
                // }
                placement="bottomEnd"
                placeholder="mm/dd/yyyy"
                editable={false}
              />
            </div>
            <div>
              {toBoolean(item["is_estimated"]?.toString()) && (
                <button
                  type="button"
                  onClick={() => {
                    setMilestone_id(item?.["milestone_id"]);
                    setIsSentToModalVisible(true);
                  }}
                >
                  <Send_svg
                    name="circle" // Use the 'circle' icon from MaterialCommunityIcons
                    height={20} // Size of the circle
                    width={20}
                    fill={"black"?.toString().trim() ?? ""} // Use status_color or a default
                  />
                </button>
              )}
            </div>
          </div>
        );
      case "date":
        return (
          <span className="text-sm">
            {value ? new Date(value).toLocaleDateString() : "-"}
          </span>
        );
      case "status":
        return (
          <span
            className={cn(
              item["is_active"] ? "bg-green-500" : "bg-red-500",
              "h-4 w-10 p-1 rounded-md text-white hover:bg-opacity-80"
            )}
          >
            {item["is_active"] ? "Active" : "Inactive"}
          </span>
        );
      case "sno":
        return (
          <div className="w-full max-w-[150px]">
            {(PageNo - 1) * pageSizeState + index + 1}
          </div>
        );
      case "textinput":
        return (
          <div className="grid grid-cols-2 gap-4 items-center justify-center">
            <div>
              <input
                value={value}
                required
                type="text"
                placeholder="Enter additional information"
                className="w-full mt-1 p-2 border rounded"
                onChange={(e) => {
                  // const newTotal = e.target.value;
                  const newTotal = e.target.value;
                  handleInputChange(
                    item?.["project_vs_custom_field_id"],
                    newTotal
                  );
                }}
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  handleSave(item?.["project_vs_custom_field_id"]);
                }}
              >
                {" "}
                <Save_svg height={22} width={22} />
              </button>
            </div>
          </div>
        );
      case "check":
        return (
          <div className="">
            <div>
              <a
                
                onClick={() => {
                  //debugger;
                  const isSelected = allSelectedIDs.includes(parseInt(value));

                  if (isSelected) {
                    setAllSelectedIDs(
                      allSelectedIDs.filter((id) => id !== parseInt(value))
                    );
                  } else {
                    setAllSelectedIDs([
                      ...new Set([...allSelectedIDs, parseInt(value)]),
                    ]);
                  }
                  onCheckChange(value);
                }}
              >
                {allSelectedIDs.includes(parseInt(value)) ? (
                  <Checkbox_svg
                    height={20}
                    width={20}
                    color="black"
                    //fill="#044086"
                  />
                ) : (
                  <Checkbox_unchecked_svg
                    height={20}
                    width={20}
                    //fill="#044086"
                    color="black"
                  />
                )}
              </a>
            </div>
          </div>
        );
      case "project_id":
        return (
          <div className="max-w-[100px]">
            <span className="text-md">{value || "-"}</span>
          </div>
        );
      case "raid":
        return (
          <div className="max-w-[100px]">
            <span className="text-md">
              {typeMapping[value?.toString()] || "Unknown"}
            </span>
          </div>
        );
      case "user_name":
        return (
          <div className="w-full min-w-[220px]">
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                <div className="cursor-pointer inline-flex gap-3">
                  <a
                    href="#"
                    onClick={() => {
                      //generateOtp(customer.tech_admin_email ?? "");
                      navigation(
                        `/Adminpanel/ProjectView?projectId=${item.resource_id}&status=${item.is_user}&isEditable=true`
                      );
                    }}
                    className="font-medium text-blue-800   hover:text-blue-1000 "
                  >
                    <span className="text-sm">
                      {item["first_name"]?.toString().trim() +" "+item["last_name"]?.toString().trim()}
                    </span>
                    
                  </a>
                  {item['is_user'] ? 
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-900 text-white">User</span>:<></>}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {item["project_name"]?.toString().trim() || "Unknown Status"}
              </TooltipContent>
            </Tooltip>
          </div>
        );
        case "project_name":
        return (
          <div className="w-full min-w-[200px]">
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                <div className="cursor-pointer inline-flex">
                  <a
                    href="#"
                    onClick={() => {
                      //generateOtp(customer.tech_admin_email ?? "");
                      navigation(
                        `/PMView/ProjectView?projectId=${item.project_id}&status=${item.status}&isEditable=true`
                      );
                    }}
                    className="font-medium text-blue-800   hover:text-blue-1000 "
                  >
                    <span className="text-sm">
                      {value?.toString().substring(0, 35) || "-"}
                    </span>
                  </a>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {item["project_name"]?.toString().trim() || "Unknown Status"}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      case "status_click":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
              <div className="cursor-pointer inline-flex">
                <a
                  href="#"
                  onClick={() => {
                    navigation(
                      `/PMView/ProjectProgressOverview?projectId=${item.project_id}`
                    );
                  }}
                >
                  <Circle_svg
                    name="circle"
                    height={20}
                    width={20}
                    fill={item["status_color"]?.toString().trim() ?? ""}
                  />
                </a>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {item["status_name"]?.toString().trim() || "Unknown Status"}
            </TooltipContent>
          </Tooltip>
        );
      case "change_status":
        return editingIndex === index ? (
          <>
            <div className="w-full min-w-[150px]">
              <Select
                onValueChange={(value) => {
                  onStatusChangeAction(item["milestone_id"], value);
                  setEditingIndex(null);
                }}
                defaultValue={item["status"] || ""}
              >
                <SelectTrigger className="w-full mt-1 p-2 border rounded">
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  {(MasterMilestoneStatus ?? []).map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value?.toString()}
                      // Hides the default checkmark
                      className="[&>span[data-state=checked]]:hidden [&_[data-slot=indicator]]:hidden"
                    >
                      <div className="flex items-center gap-2">
                        <Circle_svg
                          name="circle"
                          height={16}
                          width={16}
                          fill={status.color?.toString().trim() ?? ""}
                        />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <MultiSelectDropdown
                items={MasterMilestoneStatus}
                placeholder="Select a Status"
                selected={
                  item["status"]?.length > 0 ? item["status"]?.split(",") : []
                }
                onChange={async function (selected: string[]): Promise<void> {
                  ////debugger;
                  const worker: any = selected?.join(",");

                  onStatusChangeAction(item["milestone_id"], worker);
                  setEditingIndex(null);
                }}
              /> */}
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            //className="gap-2"
            onClick={() => {
              setEditingIndex(index);
            }}
            className="flex items-center text-black gap-1"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                <div className="cursor-pointer inline-flex">
                  <Circle_svg
                    name="circle"
                    height={20}
                    width={20}
                    fill={item["status_color"]?.toString().trim() ?? ""}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {item["status_name"]?.toString().trim() || "Unknown Status"}
              </TooltipContent>
            </Tooltip>
          </Button>
        );
      case "change_request":
        return (
          <div className="flex flex-row items-center">
            <span className="text-sm">
              {data_type === "Milestone"
                ? item["milestone_name"]
                : item["resource_name"]}
            </span>

            {/* Badge */}
            <div className="ml-2 self-center">
              {item["action"] ? (
                <span className="px-2 py-0.5 rounded-full text-white bg-red-500 text-xs z-50">
                  Deleted
                </span>
              ) : item["change_request"] ? (
                <span className="px-2 py-0.5 rounded-full text-white bg-green-500 text-xs z-50">
                  Updated
                </span>
              ) : null}
            </div>
          </div>
        );
      case "actions":
        return <>{typeof actions === "function" ? actions(item) : actions}</>;
      default:
        return  (<div className="w-full min-w-[150px]">
        <span className="text-sm">{value || "-"}</span></div>)
    }
  };

  const handleColumnVisibilityChange = (
    columnKey: string,
    visible: boolean
  ) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === columnKey ? { ...col, visible } : col))
    );
  };
  const HandleSentTo = () => {
    ////debugger;
    if (milestone_id === "") {
      onEstimatedChangeAction?.(
        allSelectedIDs?.join(","),
        "sent",
        sentTo,
        dateApprovalMode
      );
    } else {
      onEstimatedChangeAction?.(milestone_id, "sent", sentTo, dateApprovalMode);
    }
    //setEditingIndexDate(null);
    setIsSentToModalVisible(false);
  };
  const getColumnWidth = (headerText: string) => {
    const baseWidth = 60;
    const charWidth = 8;
    return Math.max(baseWidth, headerText.length * charWidth);
  };

  const handleExport = () => {
    exportToExcel(data, columns, exportFileName);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };
  const [selectedStatus, setSelectedStatus] = useState<string>(status);
  const statusOptions: StatusOption[] = [
    { label: "On Hold", value: "on-hold", color: "bg-gray-400" },
    { label: "Delayed", value: "delayed", color: "bg-red-500" },
    { label: "On Track", value: "on-track", color: "bg-green-500" },
    { label: "Not Started", value: "not-started", color: "bg-black" },
    { label: "At Risk", value: "at-risk", color: "bg-yellow-400" },
    { label: "Completed", value: "completed", color: "bg-blue-400" },
  ];
  return (
    <div className="p-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex gap-4">
          {/* <StatusMultiSelect
            statuses={statusOptions}
            selected={selectedStatus || ""}
            onChange={setSelectedStatus}
          />
          <StatusMultiSelect
            statuses={statusOptions}
            selected={selectedStatus || ""}
            onChange={setSelectedStatus}
          /> */}
          {isCreate &&
            (!assignedPermission ||
              (data_type === "Project" && assignedPermission.includes(22)) ||
              !["Project"].includes(data_type)) && (
              <button
                type="button"
                onClick={() => onCreate()}
                className="flex items-center p-2 gap-2 text-sm text-blue-800 rounded hover:bg-blue-100 font-medium mr-2 mb-2"
              >
                <Plus className="w-5 h-5 fill-[#044086]" />
                {`Add ${data_type === "Category" ? "Budget" : ""} ${data_type}`}
              </button>
            )}

          {toggleFilter && (
            <>
              {isStatusFilter && (
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
              )}
              {isDepartmentFilter && (
                <MultiSelectDepartment
                  placeholder="Select Departments"
                  departments={MasterDepartments}
                  selected={
                    selectedDepartments?.length > 0
                      ? selectedDepartments?.split(",")
                      : []
                  }
                  onChange={async function (selected: string[]): Promise<void> {
                    const worker = selected?.join(",");
                    setSelectedDepartments(worker ?? "");
                    onDepartmentFilterAction(worker);
                  }}
                />
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          {(selectedDepartments?.length > 0 ||
            selectedStatus?.length > 0 ||
            searchQuery?.length > 0) && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedDepartments("");
                    //setSelectedDecision("");
                    setSearchQuery("");
                    setSelectedStatus("");
                    if (onClearFilter) {
                      onClearFilter();
                    }
                  }}
                >
                  <Clear_filter height={30} width={30} />
                </div>
              </TooltipTrigger>
              <TooltipContent>Clear Filter</TooltipContent>
            </Tooltip>
            // <Tooltip title={"Clear Filter"}>
            //   <TouchableOpacity
            //     onPress={() => {
            //       setSelectedDepartments("");
            //       setSelectedDecision("");
            //       setSelectedStatus_d("");
            //       if (onClearFilter) {
            //         onClearFilter();
            //       }
            //     }}
            //   >
            //     <Clear_filter height={30} width={30} />
            //   </TouchableOpacity>
            // </Tooltip>
          )}
          {isfilter1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    onToggleFilter(!toggleFilter);
                  }}
                >
                  <List_filter height={20} width={20} fill={"white"} />
                </div>
              </TooltipTrigger>
              <TooltipContent>Toggle Filters</TooltipContent>
            </Tooltip>
            // <View>
            //   <Button
            //     icon={() => (
            //       <List_filter height={20} width={20} fill={"white"} />
            //     )}
            //     mode="text"
            //     textColor="black"
            //     onPress={() => onToggleFilter(!toggleFilter)}
            //   >
            //     Filter
            //   </Button>
            // </View>
          )}
          <div className="relative">
            {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            /> */}

            {isSearch && onSearch && (
              <AutoComplete
                placeholder="&#x1F50D; Search Project..."
                data={searchList}
                // style={{
                //   border: "1px solid black",
                //   borderRadius: 4,
                //   padding: 2,
                //   marginBottom: 10,
                //   width: 224,
                // }}
                value={searchQuery}
                onChange={(val) => {
                  if (justSelected.current) {
                    justSelected.current = false;
                    const selected = searchList?.find((m) => m.value === val);
                    if (selected) {
                      setSearchQuery(selected.label);
                      console.log("Selected from search:", searchQuery);
                    }
                    return;
                  }
                  handleSearch(val);
                }}
                onSelect={async (worker: string) => {
                  justSelected.current = true;
                  const selected = searchList.find((m) => m.value === worker);
                  onSearch(worker, selected?.label);
                }}
                className="custom-autocomplete"
                menuClassName="custom-autocomplete-menu"
              />
            )}
          </div>
          {/* Export Button */}
          {isDownloadExcel && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          )}
          {/* Column Visibility */}
          {isColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Columns Visibility
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* Optional: Select All / Clear All */}
                <DropdownMenuItem
                  onSelect={() =>
                    setColumns((prev) =>
                      prev.map((col) => ({ ...col, visible: true }))
                    )
                  }
                >
                  Select All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    setColumns((prev) =>
                      prev.map((col) => ({ ...col, visible: false }))
                    )
                  }
                >
                  Clear All
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Multi-selection toggles */}
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={column.visible}
                    onCheckedChange={(checked) =>
                      handleColumnVisibilityChange(column.key, !!checked)
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto w-full  ">
        {/* You can adjust width as needed */}
        <Table className="table-auto w-full">
          <TableHeader className="h-auto">
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key}
                                  className={`!h-auto font-semibold cursor-pointer bg-[#044086] whitespace-nowrap px-4 py-2 ${column.type==='actions'? "sticky-col":""}`}

                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-between gap-2 text-white">
                    {column.label}
                    {!checkEnable ? getSortIcon(column.key) : undefined}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="text-center py-8"
                >
                  {/* <div className="text-muted-foreground">
                    {searchTerm ? "No results found" : "No data available"}
                  </div> */}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {visibleColumns.map((column) => (
                     <TableCell key={column.key} className={`py-3 ${column.type==='actions'? "sticky-col":""}`}>
                      {renderCellContent(item, column, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {TotalPageCount > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Page {PageNo} of {TotalPageCount} • Showing {data?.length} of{" "}
            {data?.length} entries
          </div>

          <div className="flex items-center space-x-2">
            {/* Page Size Dropdown */}
            <Select
              value={pageSizeState.toString()}
              onValueChange={(value) =>
                handlePageSizeChange(Number(value === "All" ? 1000000 : value))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100, "All"].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size === "All" ? "All" : size + "/page"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(PageNo - 1)}
              disabled={PageNo === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, TotalPageCount) }, (_, i) => {
                let pageNumber;
                if (TotalPageCount <= 5) {
                  pageNumber = i + 1;
                } else if (PageNo <= 3) {
                  pageNumber = i + 1;
                } else if (PageNo >= TotalPageCount - 2) {
                  pageNumber = TotalPageCount - 4 + i;
                } else {
                  pageNumber = PageNo - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={PageNo === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(PageNo + 1)}
              disabled={PageNo === TotalPageCount}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isSentToModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Send for Approval
            </h2>

            {/* Radio Options */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="1"
                  checked={dateApprovalMode === "1"}
                  onChange={(e) => {
                    setDateApprovalMode(e.target.value);
                    e.target.value === "1" && setSentTo("");
                  }}
                  className="text-blue-600"
                />
                <span className="text-gray-800">In person meeting</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="2"
                  checked={dateApprovalMode === "2"}
                  onChange={(e) => setDateApprovalMode(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-800">Send to</span>
              </label>
            </div>

            {/* Dropdown */}
            {MasterUsers && dateApprovalMode === "2" && (
              <>
                <p className="text-sm text-gray-700 text-center mb-3">
                  Please select a user to approve the change(s) to the
                  "Estimated End Date".
                </p>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
                  value={sentTo}
                  onChange={(e) => setSentTo(e.target.value)}
                >
                  <option value="">Select User for Approval</option>
                  {MasterUsers.map((item) => (
                    <option key={item.user_id} value={item.user_id}>
                      {item.first_name} {item.last_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                onClick={() => {
                  setMilestone_id("");
                  setSentTo("");
                  //setEstimatedDate("");
                  setIsSentToModalVisible(false);
                  setDateApprovalMode("2");
                }}
              >
                Cancel
              </button>
              <Button
                className="px-4 py-2 rounded-lg text-white"
                variant="default"
                onClick={HandleSentTo}
              >
                {false
                  ? "Updating..."
                  : dateApprovalMode === "2"
                  ? "Send approval request"
                  : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDataTableResource;
