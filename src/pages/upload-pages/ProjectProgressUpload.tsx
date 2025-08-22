import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { GetMasterData, GetPMProjects } from "../../utils/PM";
import { GetMilestones } from "../../utils/ApprovedProjects";
import { PostAsync_with_token } from "../../services/rest_api_service";
import { GetAllStatus } from "../../utils/Users";
import AlertBox from "../../components/ui/AlertBox";
import { Download_svg } from "../../assets/Icons";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/utils";

// Helper function to get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("Token");
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Define types
interface MilestoneStatusData {
  milestone_id?: string;
  project_id: string;
  milestone_name: string;
  estimated_end_date: string;
  status_id: number;
  recent_accomplishments: string;
  upcoming_tasks: string;
  original_milestone_name?: string;
  original_status_name?: string;
  original_project_id?: string;
}

interface RAIDData {
  raid_id?: string;
  title: string;
  type_id: number;
  priority_id: number;
  description: string;
  status_id: number;
  due_date: string;
  owner_id: string;
  original_type_name?: string;
  original_priority_name?: string;
  original_status_name?: string;
  original_owner_name?: string;
  project_id: string;
}

interface MasterData {
  projects: {
    project_id: string;
    customer_project_id: string;
    project_name: string;
  }[];
  milestones: {
    milestone_id: string;
    milestone_name: string;
    project_id: string;
  }[];
  milestone_statuses: { status_id: number; status_name: string }[];
  raid_types: { type_id: string; type_name: string }[];
  raid_drivers: { driver_id: string; driver_name: string }[];
  priorities: { priority_id: number; priority_name: string }[];
  resources: { resource_id: string; resource_name: string }[];
}

interface TabState {
  step: number;
  data: MilestoneStatusData[] | RAIDData[];
  headers: string[];
  mapping: Partial<Record<ReadableField, string>>;
  fileName: string;
  errors: { rowIndex: number; field: ReadableField; message: string }[];
}

type ReadableField =
  | "Project ID"
  | "Milestone Name"
  | "Estimated End Date"
  | "Current Status"
  | "Recent Accomplishments"
  | "Upcoming Tasks"
  | "Title"
  | "Type"
  | "Priority"
  | "Description"
  | "Status"
  | "Due Date"
  | "Owner";

const fieldMapping: Record<
  ReadableField,
  keyof MilestoneStatusData | keyof RAIDData
> = {
  "Project ID": "project_id",
  "Milestone Name": "milestone_name",
  "Estimated End Date": "estimated_end_date",
  "Current Status": "status_id",
  "Recent Accomplishments": "recent_accomplishments",
  "Upcoming Tasks": "upcoming_tasks",
  Title: "title",
  Type: "type_id",
  Priority: "priority_id",
  Description: "description",
  Status: "status_id",
  "Due Date": "due_date",
  Owner: "owner_id",
};

// Backend API call for bulk progress update
const InsertBulkProgressUpdate = async (data: {
  milestones: MilestoneStatusData[];
  raids: RAIDData[];
}): Promise<string> => {
  try {
    const token = getToken();

    const payload = {
      milestones: data.milestones.map((milestone) => ({
        milestone_id: milestone.milestone_id || undefined,
        project_id: milestone.project_id,
        milestone_name: milestone.milestone_name,
        estimated_end_date: milestone.estimated_end_date,
        status_id: milestone.status_id,
        recent_accomplishments: milestone.recent_accomplishments,
        upcoming_tasks: milestone.upcoming_tasks,
      })),
      raids: data.raids.map((raid) => ({
        raid_id: raid.raid_id || undefined,
        title: raid.title,
        type_id: raid.type_id,
        priority_id: raid.priority_id,
        description: raid.description,
        status_id: raid.status_id,
        due_date: raid.due_date,
        owner_id: raid.owner_id,
        project_id: raid.project_id,
      })),
    };

    const result = await PostAsync_with_token(
      `${BASE_URL}/approvedProjects/progress_update_bulk`,
      JSON.stringify(payload),
      token
    );
    //const result = response.json();
    console.log("Bulk progress update response:", result);

    const allSuccess = result.status === "success";
    const errors = result.errors
      ? result.errors.map((e: any) => e.message)
      : [];

    return JSON.stringify({
      status: allSuccess ? "success" : "partial_success",
      message: allSuccess
        ? "Bulk progress update processed successfully"
        : "Some records failed",
      errors: errors.length > 0 ? errors : undefined,
      data: result.data || { milestones: [], raids: [] },
    });
  } catch (error) {
    console.error("InsertBulkProgressUpdate error:", error);
    throw error;
  }
};

// Helper to convert Excel serial number or mm/dd/yyyy to YYYY-MM-DD
const convertExcelDate = (
  value: any,
  field: ReadableField,
  rowIndex: number
): string => {
  if (!value) throw new Error(`Missing ${field} in row ${rowIndex + 2}`);
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + value * msPerDay);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Invalid ${field} in row ${
          rowIndex + 2
        }: ${value} (not a valid Excel date)`
      );
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "string") {
    const mmddyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = value.match(mmddyyyyRegex);
    if (match) {
      const [, month, day, year] = match;
      const date = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
      if (isNaN(date.getTime())) {
        throw new Error(
          `Invalid ${field} in row ${
            rowIndex + 2
          }: ${value} (invalid date format)`
        );
      }
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(
          `Invalid ${field} in row ${rowIndex + 2}: ${value} (invalid ISO date)`
        );
      }
      return value;
    }
  }
  throw new Error(
    `Invalid ${field} in row ${
      rowIndex + 2
    }: ${value} (expected mm/dd/yyyy or Excel date)`
  );
};

// Error Display Component
const ErrorDisplay: React.FC<{
  section: "Milestone Status" | "RAID";
  tabState: TabState;
  setTabState: (state: TabState) => void;
  onBack: () => void;
  onCancel: () => void;
}> = ({ section, tabState, setTabState, onBack, onCancel }) => {
  const COLUMN_WIDTH = 120;

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        {section} - Validation Errors
      </h2>
      <p className="text-base text-gray-600 text-center mb-5">
        The following errors were found in your Excel file. Please correct them
        and upload again.
      </p>
      <div className="flex-1 mb-4 overflow-auto">
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="flex bg-gray-100 border-b border-gray-300">
              <div
                className="py-2 px-2 text-sm font-bold text-gray-800 text-center border-r border-gray-300"
                style={{ width: COLUMN_WIDTH }}
              >
                Row
              </div>
              <div
                className="py-2 px-2 text-sm font-bold text-gray-800 text-center border-r border-gray-300"
                style={{ width: COLUMN_WIDTH }}
              >
                Field
              </div>
              <div
                className="py-2 px-2 text-sm font-bold text-gray-800 text-center"
                style={{ width: COLUMN_WIDTH * 2 }}
              >
                Error
              </div>
            </div>
            {tabState.errors.map((error, index) => (
              <div
                key={index}
                className="flex bg-white border-b border-gray-300"
              >
                <div
                  className="py-2 px-2 text-sm text-red-600 text-center border-r border-gray-300"
                  style={{ width: COLUMN_WIDTH }}
                >
                  {error.rowIndex === -1 ? "General" : error.rowIndex + 2}
                </div>
                <div
                  className="py-2 px-2 text-sm text-red-600 text-center border-r border-gray-300"
                  style={{ width: COLUMN_WIDTH }}
                >
                  {error.field}
                </div>
                <div
                  className="py-2 px-2 text-sm text-red-600 text-center"
                  style={{ width: COLUMN_WIDTH * 2 }}
                >
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4 max-w-xs mx-auto gap-2">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex-1 max-w-32"
        >
          Back
        </Button>
        <Button
          variant="destructive"
          onClick={onCancel}
          className="flex-1 max-w-32"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Combined Upload and Mapping Component
const UploadAndMap: React.FC<{
  section: "Milestone Status" | "RAID";
  masterData: MasterData;
  tabState: TabState;
  setTabState: (state: TabState) => void;
  onComplete: (
    data: MilestoneStatusData[] | RAIDData[],
    mapping: Partial<Record<ReadableField, string>>
  ) => void;
  onCancel: () => void;
  onBack: () => void;
}> = ({
  section,
  masterData,
  tabState,
  setTabState,
  onComplete,
  onCancel,
  onBack,
}) => {
  const [unmappedFields, setUnmappedFields] = useState<ReadableField[]>([]);
  const [existingMilestones, setExistingMilestones] = useState<
    Record<string, MasterData["milestones"]>
  >({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const appFields: ReadableField[] =
    section === "Milestone Status"
      ? [
          "Project ID",
          "Milestone Name",
          "Current Status",
          "Estimated End Date",
          "Recent Accomplishments",
          "Upcoming Tasks",
        ]
      : [
          "Project ID",
          "Title",
          "Type",
          "Priority",
          "Description",
          "Status",
          "Due Date",
          "Owner",
        ];

  const mandatoryFields: ReadableField[] =
    section === "Milestone Status"
      ? ["Project ID", "Milestone Name", "Current Status"]
      : [
          "Project ID",
          "Title",
          "Type",
          "Priority",
          "Description",
          "Status",
          "Due Date",
        ];

  const normalizeString = (str: any): string =>
    String(str ?? "")
      .replace(/[\s-_]/g, "")
      .toLowerCase();

  const fetchMilestones = async (
    project_id: string
  ): Promise<MasterData["milestones"]> => {
    if (existingMilestones[project_id]) {
      return existingMilestones[project_id];
    }
    try {
      const response = await GetMilestones(project_id);
      const result = JSON.parse(response);
      const milestones = result.data || [];
      setExistingMilestones((prev) => ({ ...prev, [project_id]: milestones }));
      return milestones;
    } catch (error) {
      console.error(
        `Error fetching milestones for project ${project_id}:`,
        error
      );
      return [];
    }
  };

  const fetchRAIDStatus = async (
    typeLabel: string
  ): Promise<{ status_id: number; status_name: string }[]> => {
    try {
      const response = await GetAllStatus(typeLabel);
      const parsedRes =
        typeof response === "string" ? JSON.parse(response) : response;
      if (parsedRes.status === "success") {
        return parsedRes.data.statuses || [];
      } else {
        console.error(
          "Failed to fetch RAID statuses:",
          parsedRes.message || "Unknown error"
        );
        return [];
      }
    } catch (err) {
      console.error("Error fetching RAID statuses:", err);
      return [];
    }
  };

  useEffect(() => {
    const autoMatchFields = () => {
      const newMapping: Partial<Record<ReadableField, string>> = {
        ...tabState.mapping,
      };
      const normalizedHeaders = tabState.headers.map((header) => ({
        original: header,
        normalized: normalizeString(header),
      }));

      appFields.forEach((field) => {
        if (!newMapping[field]) {
          const normalizedField = normalizeString(field);
          const bestMatch = normalizedHeaders.find(
            (header) =>
              header.normalized === normalizedField ||
              header.normalized.includes(normalizedField) ||
              normalizedField.includes(header.normalized)
          );
          if (bestMatch) newMapping[field] = bestMatch.original;
        }
      });

      setTabState({ ...tabState, mapping: newMapping });
      setUnmappedFields(appFields.filter((field) => !newMapping[field]));
    };
    if (tabState.headers.length > 0) autoMatchFields();
  }, [tabState.headers]);

  const handleFileUploadWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleFileUploadMobile = async () => {
    alert("Mobile file picking not implemented yet.");
  };

  const processFile = (file: File) => {
    console.log("Processing file:", file.name);
    setTabState({
      ...tabState,
      fileName: file.name,
      headers: [],
      data: [],
      mapping: {},
      errors: [],
    });
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, {
        type: "array",
        dateNF: "mm/dd/yyyy",
        raw: false,
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      const headers = jsonData[0].map(String);
      const dataRows = jsonData
        .slice(1)
        .filter((row) =>
          row.some((cell) => cell !== "" && cell !== null && cell !== undefined)
        );
      console.log("Parsed Excel:", {
        headers,
        dataRows: dataRows.length,
        rawData: dataRows,
      });

      setTabState({
        ...tabState,
        fileName: file.name,
        headers,
        data: dataRows as any,
        mapping: {},
        errors: [],
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (
    appField: ReadableField,
    excelHeader: string
  ) => {
    console.log("Mapping changed:", { appField, excelHeader });
    const newMapping = {
      ...tabState.mapping,
      [appField]: excelHeader || undefined,
    };
    setTabState({ ...tabState, mapping: newMapping });
    setUnmappedFields(appFields.filter((field) => !newMapping[field]));
  };

  const convertToIds = async (
    value: string,
    field: ReadableField,
    rowIndex: number,
    raidTypeName?: string
  ): Promise<{ id: string | number; original?: string }> => {
    const normalizedValue = normalizeString(value);
    console.log(`Converting field ${field} in row ${rowIndex + 2}: ${value}`);

    switch (field) {
      case "Project ID":
        const project = masterData.projects.find(
          (p) =>
            normalizeString(p.customer_project_id) === normalizeString(value)
        );
        if (!project) {
          const validProjects = masterData.projects
            .map((p) => p.customer_project_id)
            .join(", ");
          throw new Error(
            `Invalid Project ID in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validProjects || "None"}`
          );
        }
        return { id: project.project_id, original: value };
      case "Milestone Name":
        if (!value)
          throw new Error(`Missing Milestone Name in row ${rowIndex + 2}`);
        return { id: value, original: value };
      case "Current Status":
        const milestoneStatus = masterData.milestone_statuses.find(
          (s) => normalizeString(s.status_name) === normalizedValue
        );
        if (!milestoneStatus) {
          const validStatuses = masterData.milestone_statuses
            .map((s) => s.status_name)
            .join(", ");
          throw new Error(
            `Invalid Status in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validStatuses || "None"}`
          );
        }
        return { id: milestoneStatus.status_id, original: value };
      case "Type":
        const type = masterData.raid_types.find(
          (t) => normalizeString(t.type_name) === normalizedValue
        );
        if (!type) {
          const validTypes = masterData.raid_types
            .map((t) => t.type_name)
            .join(", ");
          throw new Error(
            `Invalid Type in row ${rowIndex + 2}: ${value}. Expected one of: ${
              validTypes || "None"
            }`
          );
        }
        return { id: parseInt(type.type_id), original: value };
      case "Status":
        if (!raidTypeName)
          throw new Error(
            `RAID Type must be processed before Status in row ${rowIndex + 2}`
          );
        const raidStatuses = await fetchRAIDStatus(raidTypeName);
        const raidStatus = raidStatuses.find(
          (s) => normalizeString(s.status_name) === normalizedValue
        );
        if (!raidStatus) {
          const validStatuses = raidStatuses
            .map((s) => s.status_name)
            .join(", ");
          throw new Error(
            `Invalid RAID Status for type ${raidTypeName} in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validStatuses || "None"}`
          );
        }
        return { id: raidStatus.status_id, original: value };
      case "Priority":
        const priority = masterData.priorities.find(
          (p) => normalizeString(p.priority_name) === normalizedValue
        );
        if (!priority) {
          const validPriorities = masterData.priorities
            .map((p) => p.priority_name)
            .join(", ");
          throw new Error(
            `Invalid Priority in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validPriorities || "None"}`
          );
        }
        return { id: priority.priority_id, original: value };
      case "Owner":
        if (!value) return { id: "" }; // Allow empty Owner
        const resource = masterData.resources.find(
          (r) => normalizeString(r.resource_name) === normalizedValue
        );
        if (!resource) {
          const validResources = masterData.resources
            .map((r) => r.resource_name)
            .join(", ");
          throw new Error(
            `Invalid Owner in row ${rowIndex + 2}: ${value}. Expected one of: ${
              validResources || "None"
            }`
          );
        }
        return { id: resource.resource_id, original: value };
      case "Estimated End Date":
        if (!value) return { id: "" }; // Allow empty Estimated End Date
        return { id: convertExcelDate(value, field, rowIndex) };
      case "Due Date":
        return { id: convertExcelDate(value, field, rowIndex) };
      case "Recent Accomplishments":
        if (!value) return { id: "" }; // Allow empty Recent Accomplishments
        return { id: value };
      case "Upcoming Tasks":
        if (!value) return { id: "" }; // Allow empty Upcoming Tasks
        return { id: value };
      case "Title":
        if (!value) throw new Error(`Missing ${field} in row ${rowIndex + 2}`);
        return { id: value };
      case "Description":
        if (!value) throw new Error(`Missing ${field} in row ${rowIndex + 2}`);
        return { id: value };
      default:
        throw new Error(`Unknown field ${field} in row ${rowIndex + 2}`);
    }
  };

  const handleNext = async () => {
    console.log("handleNext called", {
      section,
      mapping: tabState.mapping,
      excelData: tabState.data.length,
      rawExcelData: tabState.data,
    });

    const missingMandatory = mandatoryFields.filter(
      (field) => !tabState.mapping[field]
    );
    if (missingMandatory.length > 0) {
      console.log("Missing mandatory fields:", missingMandatory);
      alert(`Please map all mandatory fields: ${missingMandatory.join(", ")}`);
      return;
    }

    const errors: {
      rowIndex: number;
      field: ReadableField;
      message: string;
    }[] = [];
    const mappedData: (MilestoneStatusData | RAIDData)[] = [];

    try {
      await Promise.all(
        tabState.data.map(async (row, index) => {
          console.log(`Processing row ${index + 2}:`, row);
          const rowData: Partial<MilestoneStatusData | RAIDData> = {};
          let customerProjectId: string | undefined;
          let milestoneName: string | undefined;
          let raidTypeName: string | undefined;

          // First pass: Collect customer_project_id, milestone_name, and raid_type_name
          appFields.forEach((field) => {
            const mappedHeader = tabState.mapping[field];
            if (mappedHeader) {
              const columnIndex = tabState.headers.indexOf(mappedHeader);
              const rawValue = columnIndex !== -1 ? row[columnIndex] || "" : "";
              if (field === "Project ID") customerProjectId = rawValue;
              if (field === "Milestone Name") milestoneName = rawValue;
              if (field === "Type") raidTypeName = rawValue;
            }
          });

          // Resolve milestone_id for Milestone Status
          if (
            section === "Milestone Status" &&
            customerProjectId &&
            milestoneName
          ) {
            try {
              const project = masterData.projects.find(
                (p) =>
                  normalizeString(p.customer_project_id) ===
                  normalizeString(customerProjectId)
              );
              if (!project) {
                errors.push({
                  rowIndex: index,
                  field: "Project ID",
                  message: `Project not found for customer_project_id in row ${
                    index + 2
                  }: ${customerProjectId}`,
                });
                return;
              }
              const milestones = await fetchMilestones(project.project_id);
              const normalizedMilestoneName = normalizeString(milestoneName);
              const existingMilestone = milestones.find(
                (m) =>
                  normalizeString(m.milestone_name) === normalizedMilestoneName
              );
              if (existingMilestone) {
                (rowData as any).milestone_id = existingMilestone.milestone_id;
              } else {
                errors.push({
                  rowIndex: index,
                  field: "Milestone Name",
                  message: `Milestone not found in row ${
                    index + 2
                  }: ${milestoneName}`,
                });
                return;
              }
            } catch (error) {
              errors.push({
                rowIndex: index,
                field: "Milestone Name",
                message: `Error resolving milestone in row ${index + 2}: ${
                  error.message
                }`,
              });
              return;
            }
          }

          // Second pass: Map all fields
          for (const field of appFields) {
            const mappedHeader = tabState.mapping[field];
            if (mappedHeader) {
              const columnIndex = tabState.headers.indexOf(mappedHeader);
              const rawValue = columnIndex !== -1 ? row[columnIndex] || "" : "";
              const dbField = fieldMapping[field];
              try {
                const converted = await convertToIds(
                  rawValue,
                  field,
                  index,
                  raidTypeName
                );
                (rowData as any)[dbField] = converted.id;
                if (converted.original) {
                  if (field === "Project ID")
                    (rowData as any).original_project_id = converted.original;
                  if (field === "Milestone Name")
                    (rowData as any).original_milestone_name =
                      converted.original;
                  if (field === "Current Status" || field === "Status")
                    (rowData as any).original_status_name = converted.original;
                  if (field === "Type")
                    (rowData as any).original_type_name = converted.original;
                  if (field === "Priority")
                    (rowData as any).original_priority_name =
                      converted.original;
                  if (field === "Owner")
                    (rowData as any).original_owner_name = converted.original;
                }
              } catch (error) {
                errors.push({
                  rowIndex: index,
                  field,
                  message: error.message,
                });
              }
            }
          }

          // Only add row to mappedData if no errors for mandatory fields
          const rowErrors = errors.filter(
            (e) => e.rowIndex === index && mandatoryFields.includes(e.field)
          );
          if (rowErrors.length === 0) {
            console.log(`Row ${index + 2} mapped:`, rowData);
            mappedData.push(rowData as MilestoneStatusData | RAIDData);
          }
        })
      );

      if (errors.length > 0) {
        console.log("Validation errors found:", errors);
        setTabState({ ...tabState, step: 3, errors }); // Go to error display step
      } else {
        console.log("Mapped data valid, proceeding:", mappedData);
        setTabState({
          ...tabState,
          step: 2,
          data: mappedData as any,
          errors: [],
        });
        onComplete(mappedData as any, tabState.mapping);
      }
    } catch (error) {
      console.error("handleNext error:", error);
      errors.push({
        rowIndex: -1,
        field: "General" as ReadableField,
        message: `Unexpected error processing data: ${error.message}`,
      });
      setTabState({ ...tabState, step: 3, errors });
    }
  };

  // Reset file input
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      console.log("File input reset");
    }
  };

  // Override onCancel to include file input reset
  const handleCancelWithReset = () => {
    resetFileInput();
    onCancel();
  };

  // Override onBack to include file input reset
  const handleBackWithReset = () => {
    resetFileInput();
    onBack();
  };

  const downloadFile = async (url: string, fileName: string) => {
    // const url = `${BASE_URL}/images/Resource_Upload.xlsx`; // Replace with your API URL
    // const fileName = 'Resource_Upload.xlsx'; // Replace with the desired file name

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file.");
    }
  };

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        {section} - Upload and Map Fields
      </h2>
      <div className="flex flex-col items-center mb-4">
        <p className="text-base text-gray-600 text-center mb-5">
          Upload an Excel file (.xlsx or .xls) for {section}.
        </p>
        <div className="relative">
          <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3">
            Choose File
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUploadWeb}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            ref={fileInputRef}
          />
        </div>
        {tabState.fileName ? (
          <p className="mt-2 text-base text-gray-800">
            Selected file: {tabState.fileName}
          </p>
        ) : (
          <p className="mt-2 text-base text-gray-800">No file selected</p>
        )}
        <Button
          variant="outline"
          onClick={() => {
            if (section === "Milestone Status") {
              downloadFile(
                `${BASE_URL}/images/Milestone_Progress_Template.xls`,
                "Milestone_Progress_Template.xls"
              );
            } else if (section === "RAID") {
              downloadFile(
                `${BASE_URL}/images/RAID_Template.xls`,
                "RAID_Template.xls"
              );
            }
          }}
          className="mt-5 flex items-center gap-2"
        >
          <Download_svg height={20} width={20} />
          Download Template
        </Button>
      </div>
      {tabState.headers.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-gray-800 text-center my-3">
            Field Mapping
          </h3>
          {unmappedFields.length > 0 && (
            <div className="bg-red-50 p-2 rounded mb-3 text-center max-w-2xl mx-auto">
              <p className="text-red-700 text-sm">
                Unmapped fields: {unmappedFields.join(", ")}
              </p>
            </div>
          )}
          <div className="flex-1 overflow-auto pb-5">
            <div className="flex flex-col items-center">
              {appFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-center mb-3 w-full max-w-2xl"
                >
                  <label
                    className={cn(
                      "w-64 text-base font-medium text-right pr-2",
                      tabState.mapping[field] ? "text-gray-800" : "text-red-700"
                    )}
                  >
                    {field}{" "}
                    {mandatoryFields.includes(field) && (
                      <span className="text-red-700 font-bold">*</span>
                    )}
                  </label>
                  <div className="w-64">
                    <Select
                      value={tabState.mapping[field] || ""}
                      onValueChange={(value) =>
                        handleMappingChange(field, value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Column" />
                      </SelectTrigger>
                      <SelectContent>
                        {tabState.headers.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4 max-w-xs mx-auto gap-2">
            <Button
              variant="secondary"
              onClick={handleBackWithReset}
              className="flex-1 max-w-32"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 max-w-32 bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Review Step Component
const ReviewStep: React.FC<{
  section: "Milestone Status" | "RAID";
  tabState: TabState;
  setTabState: (state: TabState) => void;
  onSubmit: (data: MilestoneStatusData[] | RAIDData[]) => void;
  onBack: () => void;
  masterData: MasterData;
}> = ({ section, tabState, setTabState, onSubmit, onBack, masterData }) => {
  const handleSubmit = () => {
    console.log("handleSubmit called", { section, data: tabState.data });
    const cleanedData = tabState.data.map((row) => {
      const {
        original_milestone_name,
        original_status_name,
        original_type_name,
        original_priority_name,
        original_project_id,
        original_owner_name,
        ...cleaned
      } = row as any;
      return cleaned;
    });
    onSubmit(cleanedData);
  };

  const headerToField = tabState.headers.map((header) => {
    const field = Object.entries(tabState.mapping).find(
      ([_, mappedHeader]) => mappedHeader === header
    )?.[0] as ReadableField | undefined;
    return field ? fieldMapping[field] : null;
  });

  const getDisplayValue = (
    row: MilestoneStatusData | RAIDData,
    dbField: keyof MilestoneStatusData | keyof RAIDData
  ) => {
    if (
      dbField === "project_id" &&
      (row as MilestoneStatusData).original_project_id
    ) {
      return (row as MilestoneStatusData).original_project_id;
    }
    if (
      dbField === "milestone_name" &&
      (row as MilestoneStatusData).original_milestone_name
    ) {
      return (row as MilestoneStatusData).original_milestone_name;
    }
    if (
      dbField === "status_id" &&
      (row as MilestoneStatusData | RAIDData).original_status_name
    ) {
      return (row as MilestoneStatusData | RAIDData).original_status_name;
    }
    if (dbField === "type_id" && (row as RAIDData).original_type_name) {
      return (row as RAIDData).original_type_name;
    }
    if (dbField === "priority_id" && (row as RAIDData).original_priority_name) {
      return (row as RAIDData).original_priority_name;
    }
    if (dbField === "owner_id" && (row as RAIDData).original_owner_name) {
      return (row as RAIDData).original_owner_name;
    }
    const value = row[dbField];
    return String(value);
  };

  const COLUMN_WIDTH = 120;

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        {section} - Review and Submit
      </h2>
      <p className="text-base text-gray-600 text-center mb-5">
        Review the imported {section.toLowerCase()} before submitting.
      </p>
      <div className="flex-1 mb-4 overflow-auto">
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="flex bg-gray-100 border-b border-gray-300">
              {tabState.headers.map((header, index) => (
                <div
                  key={index}
                  className="py-2 px-2 text-sm font-bold text-gray-800 text-center border-r border-gray-300 truncate"
                  style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}
                >
                  {Object.keys(fieldMapping).find(
                    (field) =>
                      tabState.mapping[field as ReadableField] === header
                  ) || header}
                </div>
              ))}
            </div>
            {tabState.data.map(
              (row: MilestoneStatusData | RAIDData, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex bg-white border-b border-gray-300"
                >
                  {tabState.headers.map((header, colIndex) => {
                    const dbField = headerToField[colIndex];
                    const value = dbField
                      ? getDisplayValue(row, dbField)
                      : "N/A";
                    return (
                      <div
                        key={colIndex}
                        className="py-2 px-2 text-sm text-gray-600 text-center border-r border-gray-300 truncate"
                        style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4 max-w-xs mx-auto gap-2">
        <Button
          variant="secondary"
          onClick={onBack}
          className="flex-1 max-w-32"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 max-w-32 bg-blue-900 hover:bg-blue-800"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

// Main Component
const ProjectProgressUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Milestone Status" | "RAID">(
    "Milestone Status"
  );
  const [tabStates, setTabStates] = useState<{
    "Milestone Status": TabState;
    RAID: TabState;
  }>({
    "Milestone Status": {
      step: 1,
      data: [],
      headers: [],
      mapping: {},
      fileName: "",
      errors: [],
    },
    RAID: {
      step: 1,
      data: [],
      headers: [],
      mapping: {},
      fileName: "",
      errors: [],
    },
  });
  const [masterData, setMasterData] = useState<MasterData>({
    projects: [],
    milestones: [],
    milestone_statuses: [],
    raid_types: [],
    raid_drivers: [],
    priorities: [],
    resources: [],
  });
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await GetMasterData();
        const result = JSON.parse(response);
        const milestone_statuses = [
          { status_id: 15, status_name: "On Track" },
          { status_id: 16, status_name: "Completed" },
          { status_id: 17, status_name: "At Risk" },
          { status_id: 18, status_name: "On Hold" },
          { status_id: 19, status_name: "Cencelled" },
          { status_id: 20, status_name: "Not Started" },
        ];
        const raid_types = [
          { type_name: "Risk", type_id: "1" },
          { type_name: "Issue", type_id: "2" },
          { type_name: "Assumption", type_id: "3" },
          { type_name: "Dependency", type_id: "4" },
          { type_name: "Decision", type_id: "5" },
        ];
        const raid_drivers = [
          { driver_id: "Scope", driver_name: "Scope" },
          { driver_id: "Schedule", driver_name: "Schedule" },
          { driver_id: "Budget", driver_name: "Budget" },
        ];
        const priorities =
          result.data.priority?.map((priority: any) => ({
            priority_id: priority.id,
            priority_name: priority.value,
          })) || [];
        const resp = await GetPMProjects({
          PageNo: undefined,
          PageSize: undefined,
        });
        const result1 = JSON.parse(resp);
        const projects = result1.data.projects.map((project: any) => ({
          project_id: project.project_id,
          customer_project_id: project.customer_project_id,
          project_name: project.project_name,
        }));
        const resources =
          result.data.resources?.map((resource: any) => ({
            resource_id: resource.resource_id,
            resource_name: `${resource.first_name} ${resource.last_name}`,
          })) || [];
        setMasterData({
          projects,
          milestones: [],
          milestone_statuses,
          raid_types,
          raid_drivers,
          priorities,
          resources,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load master data.");
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    if (alertVisible) {
      const timer = setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertVisible]);

  const handleTabChange = (tab: "Milestone Status" | "RAID") => {
    console.log("Switching tab to:", tab, {
      currentTabState: tabStates[activeTab],
      newTabState: tabStates[tab],
    });
    setActiveTab(tab);
  };

  const handleUploadComplete = (
    data: MilestoneStatusData[] | RAIDData[],
    mapping: Partial<Record<ReadableField, string>>
  ) => {
    console.log("handleUploadComplete called", {
      section: activeTab,
      data: data.length,
      mapping,
    });
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        step: 2,
        data,
        headers: Object.values(mapping).filter(Boolean) as string[],
        mapping,
        errors: [],
      },
    }));
  };

  const handleSubmit = async (data: MilestoneStatusData[] | RAIDData[]) => {
    console.log("handleSubmit called", {
      section: activeTab,
      data: data.length,
    });
    try {
      const payload =
        activeTab === "Milestone Status"
          ? { milestones: data as MilestoneStatusData[], raids: [] }
          : { milestones: [], raids: data as RAIDData[] };
      const response = await InsertBulkProgressUpdate(payload);
      const parsedResponse = JSON.parse(response);
      console.log("Backend response:", parsedResponse);

      if (parsedResponse.status === "success") {
        setAlertMessage(`${activeTab} updated successfully.`);
        setAlertVisible(true);
        setTabStates((prev) => ({
          ...prev,
          [activeTab]: {
            step: 1,
            data: [],
            headers: [],
            mapping: {},
            fileName: "",
            errors: [],
          },
        }));
        showAlert(`${activeTab} updated successfully.`);
      } else if (parsedResponse.status === "partial_success") {
        const errorDetails = parsedResponse.errors
          ? parsedResponse.errors.join("; ")
          : "Some records failed to process";
        alert(
          `Some ${activeTab.toLowerCase()} were updated, but errors occurred: ${errorDetails}`
        );
        setTabStates((prev) => ({
          ...prev,
          [activeTab]: {
            step: 1,
            data: [],
            headers: [],
            mapping: {},
            fileName: "",
            errors: [],
          },
        }));
      } else {
        const errorMessage =
          parsedResponse.message || `Error updating ${activeTab.toLowerCase()}`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred while submitting. Please try again.");
    }
  };

  const handleBack = () => {
    console.log("Back to step 1 from", activeTab, {
      currentState: tabStates[activeTab],
    });
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        step: 1,
        errors: [],
      },
    }));
  };

  const handleCancel = () => {
    console.log("Cancel upload for", activeTab);
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        step: 1,
        data: [],
        headers: [],
        mapping: {},
        fileName: "",
        errors: [],
      },
    }));
  };
  // Show the alert dialog
  const showAlert = (message: string) => {
    setAlertMessage(message); // Set the alert message dynamically
    setAlertVisible(true); // Show the alert dialog
  };

  // Close the alert dialog
  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };
  const renderTabs = () => (
    <div className="flex mb-4">
      <button
        className={cn(
          "flex-1 py-3 px-4 text-base font-bold text-center rounded mr-1",
          activeTab === "Milestone Status"
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-gray-800"
        )}
        onClick={() => handleTabChange("Milestone Status")}
      >
        Milestone Status
      </button>
      <button
        className={cn(
          "flex-1 py-3 px-4 text-base font-bold text-center rounded ml-1",
          activeTab === "RAID"
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-gray-800"
        )}
        onClick={() => handleTabChange("RAID")}
      >
        RAID
      </button>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4 max-w-sm mx-auto">
      <div className="flex flex-col items-center w-32">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            tabStates[activeTab].step <= 2 ? "bg-blue-600" : "bg-gray-300"
          )}
        >
          <span
            className={cn(
              "text-base font-bold",
              tabStates[activeTab].step <= 2 ? "text-white" : "text-gray-800"
            )}
          >
            1
          </span>
        </div>
        <p
          className={cn(
            "text-xs text-center mt-1 max-w-24",
            tabStates[activeTab].step <= 2
              ? "text-blue-600 font-bold"
              : "text-gray-600"
          )}
        >
          Upload and Map
        </p>
      </div>
      <div className="w-16 h-0.5 bg-gray-300">
        <div
          className={cn(
            "h-0.5",
            tabStates[activeTab].step === 2 ? "bg-blue-600" : "bg-gray-300"
          )}
        />
      </div>
      <div className="flex flex-col items-center w-32">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            tabStates[activeTab].step === 2 ? "bg-blue-600" : "bg-gray-300"
          )}
        >
          <span
            className={cn(
              "text-base font-bold",
              tabStates[activeTab].step === 2 ? "text-white" : "text-gray-800"
            )}
          >
            2
          </span>
        </div>
        <p
          className={cn(
            "text-xs text-center mt-1 max-w-24",
            tabStates[activeTab].step === 2
              ? "text-blue-600 font-bold"
              : "text-gray-600"
          )}
        >
          Review and Submit
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      {renderTabs()}
      {renderStepIndicator()}
      {tabStates[activeTab].step === 1 && (
        <UploadAndMap
          section={activeTab}
          masterData={masterData}
          tabState={tabStates[activeTab]}
          setTabState={(state) =>
            setTabStates((prev) => ({ ...prev, [activeTab]: state }))
          }
          onComplete={handleUploadComplete}
          onCancel={handleCancel}
          onBack={handleCancel}
        />
      )}
      {tabStates[activeTab].step === 2 && (
        <ReviewStep
          section={activeTab}
          tabState={tabStates[activeTab]}
          setTabState={(state) =>
            setTabStates((prev) => ({ ...prev, [activeTab]: state }))
          }
          onSubmit={handleSubmit}
          onBack={handleBack}
          masterData={masterData}
        />
      )}
      {tabStates[activeTab].step === 3 && (
        <ErrorDisplay
          section={activeTab}
          tabState={tabStates[activeTab]}
          setTabState={(state) =>
            setTabStates((prev) => ({ ...prev, [activeTab]: state }))
          }
          onBack={handleBack}
          onCancel={handleCancel}
        />
      )}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default ProjectProgressUpload;
