import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { GetMasterData, GetPMProjects } from "../../utils/PM";
import { GetMilestones } from "../../utils/ApprovedProjects";
import { PostAsync_with_token } from "../../services/rest_api_service";
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Define types
interface ProjectResourceData {
  user_id: string;
  email: string;
  project_id: string;
  average_cost: number;
  role_id: number;
  working_hours: number;
  proposed_start_date: string;
  proposed_end_date: string;
  original_full_name?: string;
  original_role_name?: string;
}

interface MilestoneData {
  milestone_id?: string;
  milestone_name: string;
  project_id: string;
  priority_id: number;
  description: string;
  proposed_start_date: string;
  proposed_end_date: string;
  resource_ids: string[];
  original_priority_name?: string;
}

interface BudgetData {
  project_id: string;
  category_id: string;
  sub_category_id: string;
  function_id: string;
  quantity_hours: number;
  cost: number;
  total: number;
  description: string;
  original_category_name?: string;
  original_sub_category_name?: string;
  original_function_name?: string;
}

interface MasterData {
  projects: {
    project_id: string;
    project_name: string;
    customer_project_id: string;
  }[];
  roles: { role_id: number; role_name: string }[];
  priorities: { priority_id: number; priority_name: string }[];
  users: { user_id: string; first_name: string; last_name: string }[];
  categories: { category_id: string; category_name: string }[];
  subCategories: {
    category_id: string;
    sub_category_id: string;
    sub_category_name: string;
  }[];
  functions: { function_id: string; function_name: string }[];
}

interface Milestone {
  milestone_id: string;
  milestone_name: string;
  project_id: string;
}

interface TabState {
  step: number;
  data: ProjectResourceData[] | MilestoneData[] | BudgetData[];
  headers: string[];
  mapping: Partial<Record<ReadableField, string>>;
  fileName: string;
  errors: { rowIndex: number; field: ReadableField; message: string }[];
}

type ReadableField =
  | "Project ID"
  | "Full Name"
  | "Email"
  | "Average Cost"
  | "Role"
  | "Working Hours"
  | "Proposed Start Date"
  | "Proposed End Date"
  | "Milestone Name"
  | "Priority"
  | "Description"
  | "Team Members"
  | "Category"
  | "Sub-Category"
  | "Function"
  | "Quantity/Hours"
  | "Cost ($)"
  | "Total ($)";

const fieldMapping: Record<
  ReadableField,
  keyof ProjectResourceData | keyof MilestoneData | keyof BudgetData
> = {
  "Project ID": "project_id",
  "Full Name": "user_id",
  Email: "email",
  "Average Cost": "average_cost",
  Role: "role_id",
  "Working Hours": "working_hours",
  "Proposed Start Date": "proposed_start_date",
  "Proposed End Date": "proposed_end_date",
  "Milestone Name": "milestone_name",
  Priority: "priority_id",
  Description: "description",
  "Team Members": "resource_ids",
  Category: "category_id",
  "Sub-Category": "sub_category_id",
  Function: "function_id",
  "Quantity/Hours": "quantity_hours",
  "Cost ($)": "cost",
  "Total ($)": "total",
};

// Backend API call for bulk project plan
const InsertBulkProjectPlan = async (data: {
  resources: ProjectResourceData[];
  milestones: MilestoneData[];
  budgets: BudgetData[];
}): Promise<string> => {
  try {
    const token = localStorage.getItem("Token");
    const payload = {
      resources: data.resources.map((resource) => ({
        project_id: resource.project_id,
        user_id: resource.user_id,
        average_cost: resource.average_cost,
        role_id: resource.role_id,
        working_hours: resource.working_hours,
        proposed_start_date: resource.proposed_start_date,
        proposed_end_date: resource.proposed_end_date,
      })),
      milestones: data.milestones.map((milestone) => ({
        milestone_id: milestone.milestone_id || undefined,
        project_id: milestone.project_id,
        milestone_name: milestone.milestone_name,
        priority_id: milestone.priority_id,
        description: milestone.description,
        proposed_start_date: milestone.proposed_start_date,
        proposed_end_date: milestone.proposed_end_date,
        resource_ids: milestone.resource_ids,
      })),
      budgets: data.budgets.map((budget) => ({
        project_id: budget.project_id,
        category_id: budget.category_id,
        sub_category_id: budget.sub_category_id,
        function_id: budget.function_id,
        quantity_hours: budget.quantity_hours,
        cost: budget.cost,
        total: budget.total,
        description: budget.description,
      })),
    };

    const result = await PostAsync_with_token(
      `${BASE_URL}/approvedProjects/project_plan_bulk`,
      JSON.stringify(payload),
      token
    );
    console.log("Bulk project plan response:", result);

    const allSuccess = result.status === "success";
    const errors = result.errors
      ? result.errors.map((e: any) => e.message)
      : [];

    return JSON.stringify({
      status: allSuccess ? "success" : "partial_success",
      message: allSuccess
        ? "Bulk project plan processed successfully"
        : "Some records failed",
      errors: errors.length > 0 ? errors : undefined,
      data: result.data || { resources: [], milestones: [], budgets: [] },
    });
  } catch (error) {
    console.error("InsertBulkProjectPlan error:", error);
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
  section: "Team Members" | "Milestones" | "Budget";
  tabState: TabState;
  setTabState: (state: TabState) => void;
  onBack: () => void;
  onCancel: () => void;
}> = ({ section, tabState, setTabState, onBack, onCancel }) => {
  const COLUMN_WIDTH = 120;

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        {section} - Validation Errors
      </h2>
      <p className="text-base text-gray-600 text-center mb-6">
        The following errors were found in your Excel file. Please correct them
        and upload again.
      </p>
      <div className="flex-1 mb-4 max-h-96 overflow-auto">
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="flex border-b border-gray-300 bg-white">
              <div
                className="py-2.5 px-2 text-sm font-bold text-gray-800 text-center bg-gray-100 border-r border-gray-300"
                style={{ width: COLUMN_WIDTH }}
              >
                Row
              </div>
              <div
                className="py-2.5 px-2 text-sm font-bold text-gray-800 text-center bg-gray-100 border-r border-gray-300"
                style={{ width: COLUMN_WIDTH }}
              >
                Field
              </div>
              <div
                className="py-2.5 px-2 text-sm font-bold text-gray-800 text-center bg-gray-100 border-r border-gray-300"
                style={{ width: COLUMN_WIDTH * 2 }}
              >
                Error
              </div>
            </div>
            {tabState.errors.map((error, index) => (
              <div
                key={index}
                className="flex border-b border-gray-300 bg-white"
              >
                <div
                  className="py-2.5 px-2 text-sm text-gray-600 text-center border-r border-gray-300"
                  style={{ width: COLUMN_WIDTH }}
                >
                  {error.rowIndex === -1 ? "General" : error.rowIndex + 2}
                </div>
                <div
                  className="py-2.5 px-2 text-sm text-gray-600 text-center border-r border-gray-300"
                  style={{ width: COLUMN_WIDTH }}
                >
                  {error.field}
                </div>
                <div
                  className="py-2.5 px-2 text-sm text-gray-600 text-center border-r border-gray-300"
                  style={{ width: COLUMN_WIDTH * 2 }}
                >
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6 gap-4">
        <button
          className="px-6 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors min-w-24"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-6 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-colors min-w-24"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Combined Upload and Mapping Component
const UploadAndMap: React.FC<{
  section: "Team Members" | "Milestones" | "Budget";
  masterData: MasterData;
  tabState: TabState;
  setTabState: (state: TabState) => void;
  onComplete: (
    data: ProjectResourceData[] | MilestoneData[] | BudgetData[],
    mapping: Partial<Record<ReadableField, string>>
  ) => void;
  onCancel: () => void;
  onMonthWiseBudgetClick?: () => void; // New prop for month-wise budget link
}> = ({
  section,
  masterData,
  tabState,
  setTabState,
  onComplete,
  onCancel,
  onMonthWiseBudgetClick,
}) => {
  const [unmappedFields, setUnmappedFields] = useState<ReadableField[]>([]);
  const [existingMilestones, setExistingMilestones] = useState<
    Record<string, Milestone[]>
  >({});

  const appFields: ReadableField[] =
    section === "Team Members"
      ? [
          "Project ID",
          "Full Name",
          "Email",
          "Average Cost",
          "Role",
          "Working Hours",
          "Proposed Start Date",
          "Proposed End Date",
        ]
      : section === "Milestones"
      ? [
          "Project ID",
          "Milestone Name",
          "Priority",
          "Description",
          "Proposed Start Date",
          "Proposed End Date",
          "Team Members",
        ]
      : [
          "Project ID",
          "Category",
          "Sub-Category",
          "Function",
          "Quantity/Hours",
          "Cost ($)",
          "Total ($)",
          "Description",
        ];

  const mandatoryFields: ReadableField[] =
    section === "Team Members"
      ? [
          "Project ID",
          "Full Name",
          "Email",
          "Average Cost",
          "Role",
          "Working Hours",
          "Proposed Start Date",
          "Proposed End Date",
        ]
      : section === "Milestones"
      ? [
          "Project ID",
          "Milestone Name",
          "Priority",
          "Proposed Start Date",
          "Proposed End Date",
        ]
      : ["Project ID", "Category", "Sub-Category", "Function", "Total ($)"];

  const normalizeString = (str: any): string =>
    String(str ?? "")
      .replace(/[\s-_]/g, "")
      .toLowerCase();

  const fetchMilestones = async (project_id: string): Promise<Milestone[]> => {
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

  const convertToIds = (
    value: string,
    field: ReadableField,
    rowIndex: number,
    rowData?: Partial<BudgetData>
  ): { id: string | number | string[]; original?: string } => {
    const normalizedValue = normalizeString(value);
    console.log(`Converting field ${field} in row ${rowIndex + 2}: ${value}`);
    switch (field) {
      case "Project ID":
        if (!value)
          throw new Error(`Missing Project ID in row ${rowIndex + 2}`);
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
      case "Full Name":
        if (!value) throw new Error(`Missing Full Name in row ${rowIndex + 2}`);
        const user = masterData.users.find(
          (u) =>
            normalizeString(`${u.first_name} ${u.last_name}`) ===
            normalizedValue
        );
        if (!user) {
          const validUsers = masterData.users
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", ");
          throw new Error(
            `Invalid Full Name in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validUsers || "None"}`
          );
        }
        return { id: user.user_id, original: value };
      case "Role":
        if (!value) throw new Error(`Missing Role in row ${rowIndex + 2}`);
        const role = masterData.roles.find(
          (r) => normalizeString(r.role_name) === normalizedValue
        );
        if (!role) {
          const validRoles = masterData.roles
            .map((r) => r.role_name)
            .join(", ");
          throw new Error(
            `Invalid Role in row ${rowIndex + 2}: ${value}. Expected one of: ${
              validRoles || "None"
            }`
          );
        }
        return { id: role.role_id, original: value };
      case "Priority":
        if (!value) throw new Error(`Missing Priority in row ${rowIndex + 2}`);
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
      case "Team Members":
        if (!value)
          throw new Error(`Missing Team Members in row ${rowIndex + 2}`);
        const names = value
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name);
        const userIds = names.map((name) => {
          const normalizedName = normalizeString(name);
          const user = masterData.users.find(
            (u) =>
              normalizeString(`${u.first_name} ${u.last_name}`) ===
              normalizedName
          );
          if (!user) {
            const validUsers = masterData.users
              .map((u) => `${u.first_name} ${u.last_name}`)
              .join(", ");
            throw new Error(
              `Invalid Team Member in row ${
                rowIndex + 2
              }: ${name}. Expected one of: ${validUsers || "None"}`
            );
          }
          return user.user_id;
        });
        return { id: userIds };
      case "Category":
        if (!value) throw new Error(`Missing Category in row ${rowIndex + 2}`);
        const category = masterData.categories.find(
          (c) => normalizeString(c.category_name) === normalizedValue
        );
        if (!category) {
          const validCategories = masterData.categories
            .map((c) => c.category_name)
            .join(", ");
          throw new Error(
            `Invalid Category in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validCategories || "None"}`
          );
        }
        return { id: category.category_id, original: value };
      case "Sub-Category":
        if (!value)
          throw new Error(`Missing Sub-Category in row ${rowIndex + 2}`);
        if (!rowData?.category_id) {
          throw new Error(
            `Cannot validate Sub-Category in row ${
              rowIndex + 2
            }: Category must be specified first`
          );
        }
        const subCategory = masterData.subCategories.find(
          (sc) =>
            normalizeString(sc.sub_category_name) === normalizedValue &&
            sc.category_id === rowData.category_id
        );
        if (!subCategory) {
          const validSubCategories = masterData.subCategories
            .filter((sc) => sc.category_id === rowData.category_id)
            .map((sc) => sc.sub_category_name)
            .join(", ");
          throw new Error(
            `Invalid Sub-Category in row ${
              rowIndex + 2
            }: ${value} for Category ID ${
              rowData.category_id
            }. Expected one of: ${validSubCategories || "None"}`
          );
        }
        return { id: subCategory.sub_category_id, original: value };
      case "Function":
        if (!value) throw new Error(`Missing Function in row ${rowIndex + 2}`);
        const func = masterData.functions.find(
          (f) => normalizeString(f.function_name) === normalizedValue
        );
        if (!func) {
          const validFunctions = masterData.functions
            .map((f) => f.function_name)
            .join(", ");
          throw new Error(
            `Invalid Function in row ${
              rowIndex + 2
            }: ${value}. Expected one of: ${validFunctions || "None"}`
          );
        }
        return { id: func.function_id, original: value };
      case "Quantity/Hours":
        if (value === "") return { id: 0 }; // Optional field
        const qty = parseFloat(value);
        if (isNaN(qty) || qty < 0)
          throw new Error(
            `Invalid Quantity/Hours in row ${rowIndex + 2}: ${value}`
          );
        return { id: qty };
      case "Cost ($)":
        if (value === "") return { id: 0 }; // Optional field
        const cost = parseFloat(value);
        if (isNaN(cost) || cost < 0)
          throw new Error(`Invalid Cost ($) in row ${rowIndex + 2}: ${value}`);
        return { id: cost };
      case "Total ($)":
        if (!value) throw new Error(`Missing Total ($) in row ${rowIndex + 2}`);
        const total = parseFloat(value);
        if (isNaN(total) || total < 0)
          throw new Error(`Invalid Total ($) in row ${rowIndex + 2}: ${value}`);
        return { id: total };
      case "Average Cost":
      case "Working Hours":
        if (!value) throw new Error(`Missing ${field} in row ${rowIndex + 2}`);
        const num = parseFloat(value);
        if (isNaN(num) || num < 0)
          throw new Error(`Invalid ${field} in row ${rowIndex + 2}: ${value}`);
        return { id: num };
      case "Proposed Start Date":
      case "Proposed End Date":
        return { id: convertExcelDate(value, field, rowIndex) };
      case "Description":
        return { id: value || "" }; // Optional for Budget
      case "Milestone Name":
      case "Email":
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
    const mappedData: (ProjectResourceData | MilestoneData | BudgetData)[] = [];

    try {
      await Promise.all(
        tabState.data.map(async (row, index) => {
          console.log(`Processing row ${index + 2}:`, row);
          const rowData: Partial<
            ProjectResourceData | MilestoneData | BudgetData
          > = {};
          let milestoneName: string | undefined;
          let projectId: string | undefined;

          // First pass: Collect project_id and milestone_name
          appFields.forEach((field) => {
            const mappedHeader = tabState.mapping[field];
            if (mappedHeader) {
              const columnIndex = tabState.headers.indexOf(mappedHeader);
              const rawValue = columnIndex !== -1 ? row[columnIndex] || "" : "";
              if (field === "Project ID") projectId = rawValue;
              if (field === "Milestone Name") milestoneName = rawValue;
            }
          });

          // For Milestones, check for existing milestone_id
          if (section === "Milestones" && projectId && milestoneName) {
            try {
              const milestones = await fetchMilestones(projectId);
              const normalizedMilestoneName = normalizeString(milestoneName);
              const existingMilestone = milestones.find(
                (m) =>
                  normalizeString(m.milestone_name) === normalizedMilestoneName
              );
              if (existingMilestone) {
                (rowData as any).milestone_id = existingMilestone.milestone_id;
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
                const converted = convertToIds(rawValue, field, index, rowData);
                rowData[dbField] = converted.id;
                if (converted.original) {
                  if (field === "Project ID")
                    (rowData as any).original_project_id = converted.original;
                  if (field === "Full Name")
                    (rowData as any).original_full_name = converted.original;
                  if (field === "Role")
                    (rowData as any).original_role_name = converted.original;
                  if (field === "Priority")
                    (rowData as any).original_priority_name =
                      converted.original;
                  if (field === "Category")
                    (rowData as any).original_category_name =
                      converted.original;
                  if (field === "Sub-Category")
                    (rowData as any).original_sub_category_name =
                      converted.original;
                  if (field === "Function")
                    (rowData as any).original_function_name =
                      converted.original;
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
            mappedData.push(
              rowData as ProjectResourceData | MilestoneData | BudgetData
            );
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
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        {/* <h2 className="text-2xl font-bold text-gray-800">{section} - Upload and Map Fields</h2> */}
        {/* {section === 'Budget' && (
          <button className="p-2 bg-blue-900 rounded" onClick={onMonthWiseBudgetClick}>
            <span className="text-white text-sm font-bold">Add Month-Wise Budget</span>
          </button>
        )} */}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        {section} - Upload and Map Fields
      </h2>
      <div className="flex flex-col items-center mb-4">
        <p className="text-base text-gray-600 text-center mb-5">
          Upload an Excel file (.xlsx or .xls) for {section}.
        </p>
        <div className="relative inline-block">
          <button className="bg-blue-900 py-3 px-6 rounded text-white text-base font-bold hover:bg-blue-800 transition-colors">
            Choose File
          </button>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUploadWeb}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        {tabState.fileName ? (
          <p className="mt-2.5 text-base text-gray-800 text-center">
            Selected file: {tabState.fileName}
          </p>
        ) : (
          <p className="mt-2.5 text-base text-gray-800 text-center">
            No file selected
          </p>
        )}
        <button
          className="flex items-center justify-center gap-2 mt-5 py-3 px-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          onClick={() => {
            if (section === "Milestones") {
              downloadFile(
                `${BASE_URL}/images/Milestone_Upload_Template.xls`,
                "Milestone_Upload_Template.xls"
              );
            } else if (section === "Team Members") {
              downloadFile(
                `${BASE_URL}/images/Team_Member_Upload_Template.xls`,
                "Team_Member_Upload_Template.xls"
              );
            } else if (section === "Budget") {
              downloadFile(
                `${BASE_URL}/images/Budget_Upload_ Template.xls`,
                "Budget_Upload_ Template.xls"
              );
            }
          }}
        >
          <Download_svg height={20} width={20} />
          <span className="text-gray-800 font-semibold">Download Template</span>
        </button>
      </div>

      {tabState.headers.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
            Field Mapping
          </h3>
          {unmappedFields.length > 0 && (
            <div className="bg-red-50 p-3 rounded mb-6 max-w-2xl mx-auto border border-red-200">
              <p className="text-red-600 text-sm text-center">
                Unmapped fields: {unmappedFields.join(", ")}
              </p>
            </div>
          )}
          <div className="flex-1 pb-5 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {appFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-center gap-4 w-full max-w-2xl mx-auto"
                >
                  <label
                    className={`w-60 text-base font-medium text-right ${
                      tabState.mapping[field] ? "text-gray-800" : "text-red-600"
                    }`}
                  >
                    {field}{" "}
                    {mandatoryFields.includes(field) && (
                      <span className="text-red-600 text-base font-bold">
                        *
                      </span>
                    )}
                  </label>
                  <div className="w-60">
                    <Select
                      value={tabState.mapping[field] || ""}
                      onValueChange={(value) =>
                        handleMappingChange(field, value)
                      }
                    >
                      <SelectTrigger className="w-full h-10 text-gray-800 border-gray-300">
                        <SelectValue placeholder="Select Column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select Column</SelectItem>
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
          <div className="flex justify-center mt-6 gap-4">
            <button
              className="px-6 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors min-w-24"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors min-w-24"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Review Step Component
const ReviewStep: React.FC<{
  section: "Team Members" | "Milestones" | "Budget";
  tabState: TabState;
  setTabState: (state: TabState) => void;
  onSubmit: (
    data: ProjectResourceData[] | MilestoneData[] | BudgetData[]
  ) => void;
  onBack: () => void;
  masterData: MasterData;
}> = ({ section, tabState, setTabState, onSubmit, onBack, masterData }) => {
  const handleSubmit = () => {
    console.log("handleSubmit called", { section, data: tabState.data });
    const cleanedData = tabState.data.map((row) => {
      const {
        original_full_name,
        original_role_name,
        original_priority_name,
        original_project_id,
        original_category_name,
        original_sub_category_name,
        original_function_name,
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
    row: ProjectResourceData | MilestoneData | BudgetData,
    dbField: keyof ProjectResourceData | keyof MilestoneData | keyof BudgetData
  ) => {
    if (dbField === "project_id" && (row as any).original_project_id) {
      return (row as any).original_project_id;
    }
    if (
      dbField === "user_id" &&
      (row as ProjectResourceData).original_full_name
    ) {
      return (row as ProjectResourceData).original_full_name;
    }
    if (
      dbField === "role_id" &&
      (row as ProjectResourceData).original_role_name
    ) {
      return (row as ProjectResourceData).original_role_name;
    }
    if (
      dbField === "priority_id" &&
      (row as MilestoneData).original_priority_name
    ) {
      return (row as MilestoneData).original_priority_name;
    }
    if (
      dbField === "category_id" &&
      (row as BudgetData).original_category_name
    ) {
      return (row as BudgetData).original_category_name;
    }
    if (
      dbField === "sub_category_id" &&
      (row as BudgetData).original_sub_category_name
    ) {
      return (row as BudgetData).original_sub_category_name;
    }
    if (
      dbField === "function_id" &&
      (row as BudgetData).original_function_name
    ) {
      return (row as BudgetData).original_function_name;
    }
    if (dbField === "resource_ids") {
      const userIds = (row as MilestoneData).resource_ids as string[];
      return userIds
        .map((userId) => {
          const user = masterData.users.find((u) => u.user_id === userId);
          return user ? `${user.first_name} ${user.last_name}` : userId;
        })
        .join(", ");
    }
    const value = row[dbField];
    return Array.isArray(value) ? value.join(", ") : String(value);
  };

  const COLUMN_WIDTH = 120;

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        {section} - Review and Submit
      </h2>
      <p className="text-base text-gray-600 text-center mb-6">
        Review the imported {section.toLowerCase()} before submitting.
      </p>
      <div className="flex-1 mb-4 max-h-96 overflow-auto">
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="flex border-b border-gray-300 bg-white">
              {tabState.headers.map((header, index) => (
                <div
                  key={index}
                  className="py-2.5 px-2 text-sm font-bold text-gray-800 text-center bg-gray-100 border-r border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ width: COLUMN_WIDTH }}
                >
                  {Object.keys(fieldMapping).find(
                    (field) =>
                      tabState.mapping[field as ReadableField] === header
                  ) || header}
                </div>
              ))}
            </div>
            {tabState.data.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex border-b border-gray-300 bg-white"
              >
                {tabState.headers.map((header, colIndex) => {
                  const dbField = headerToField[colIndex];
                  const value = dbField ? getDisplayValue(row, dbField) : "N/A";
                  return (
                    <div
                      key={colIndex}
                      className="py-2.5 px-2 text-sm text-gray-600 text-center border-r border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width: COLUMN_WIDTH }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6 gap-4">
        <button
          className="px-6 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors min-w-24"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-6 py-2 rounded bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors min-w-24"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

// Main ProjectPlanUpload Component
const ProjectPlanUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "Team Members" | "Milestones" | "Budget"
  >("Team Members");
  const [tabStates, setTabStates] = useState<{
    "Team Members": TabState;
    Milestones: TabState;
    Budget: TabState;
  }>({
    "Team Members": {
      step: 1,
      data: [],
      headers: [],
      mapping: {},
      fileName: "",
      errors: [],
    },
    Milestones: {
      step: 1,
      data: [],
      headers: [],
      mapping: {},
      fileName: "",
      errors: [],
    },
    Budget: {
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
    roles: [],
    priorities: [],
    users: [],
    categories: [],
    subCategories: [],
    functions: [],
  });
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showMonthWiseBudget, setShowMonthWiseBudget] =
    useState<boolean>(false); // New state for month-wise budget

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await GetMasterData();
        const result = JSON.parse(response);
        const users = result.data.resources.map((user: any) => ({
          user_id: user.resource_id,
          first_name: user.first_name,
          last_name: user.last_name,
        }));
        const roles = result.data.roles;
        const priorities = result.data.priority.map((priority: any) => ({
          priority_id: priority.id,
          priority_name: priority.value,
        }));
        const categories = result.data.categories || [
          { category_id: "1", category_name: "Procurement" },
          { category_id: "2", category_name: "Internal Resource" },
        ];
        const subCategories = result.data.subCategories || [
          {
            category_id: "1",
            sub_category_id: "1",
            sub_category_name: "Server",
          },
          {
            category_id: "2",
            sub_category_id: "2",
            sub_category_name: "Project Manager",
          },
        ];
        const functions = result.data.departments.map((dept: any) => ({
          function_id: dept.department_id,
          function_name: dept.department_name,
        }));
        // || [
        //   { function_id: '1', function_name: 'IT' },
        //   { function_id: '2', function_name: 'Finance' },
        // ];
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
        setMasterData({
          projects,
          roles,
          priorities,
          users,
          categories,
          subCategories,
          functions,
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

  const handleTabChange = (tab: "Team Members" | "Milestones" | "Budget") => {
    console.log("Switching tab to:", tab, {
      currentTabState: tabStates[activeTab],
      newTabState: tabStates[tab],
    });
    setActiveTab(tab);
    setShowMonthWiseBudget(false);
  };

  const handleUploadComplete = (
    data: ProjectResourceData[] | MilestoneData[] | BudgetData[],
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

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  const handleSubmit = async (
    data: ProjectResourceData[] | MilestoneData[] | BudgetData[]
  ) => {
    console.log("handleSubmit called", {
      section: activeTab,
      data: data.length,
    });
    try {
      const payload =
        activeTab === "Team Members"
          ? { resources: data, milestones: [], budgets: [] }
          : activeTab === "Milestones"
          ? { resources: [], milestones: data, budgets: [] }
          : { resources: [], milestones: [], budgets: data };
      const response = await InsertBulkProjectPlan(payload as any);
      const parsedResponse = JSON.parse(response);
      console.log("Backend response:", parsedResponse);

      if (parsedResponse.status === "success") {
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
        showAlert(`${activeTab} imported successfully.`);
      } else if (parsedResponse.status === "partial_success") {
        const errorDetails = parsedResponse.errors
          ? parsedResponse.errors.join("; ")
          : "Some records failed to process";
        alert(
          `Some ${activeTab.toLowerCase()} were imported, but errors occurred: ${errorDetails}`
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
          parsedResponse.message ||
          `Error importing ${activeTab.toLowerCase()}`;
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

  const handleMonthWiseBudgetClick = () => {
    console.log("Month-wise budget link clicked");
    setShowMonthWiseBudget(true);
  };

  const handleMonthWiseBudgetBack = () => {
    console.log("Back to Budget tab from Month-Wise Budget");
    setShowMonthWiseBudget(false);
  };

  const renderTabs = () => (
    <div className="flex mb-6 border-b border-gray-200">
      <button
        className={`flex-1 py-3 px-4 text-base font-bold transition-colors border-b-2 ${
          activeTab === "Team Members"
            ? "text-blue-600 border-blue-600"
            : "text-gray-600 border-transparent hover:text-gray-800"
        }`}
        onClick={() => handleTabChange("Team Members")}
      >
        Team Members
      </button>
      <button
        className={`flex-1 py-3 px-4 text-base font-bold transition-colors border-b-2 ${
          activeTab === "Milestones"
            ? "text-blue-600 border-blue-600"
            : "text-gray-600 border-transparent hover:text-gray-800"
        }`}
        onClick={() => handleTabChange("Milestones")}
      >
        Milestones
      </button>
      <button
        className={`flex-1 py-3 px-4 text-base font-bold transition-colors border-b-2 ${
          activeTab === "Budget"
            ? "text-blue-600 border-blue-600"
            : "text-gray-600 border-transparent hover:text-gray-800"
        }`}
        onClick={() => handleTabChange("Budget")}
      >
        Budget
      </button>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 max-w-lg mx-auto">
      <div className="flex items-center text-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            tabStates[activeTab].step <= 2 ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`text-base font-bold ${
              tabStates[activeTab].step <= 2 ? "text-white" : "text-gray-800"
            }`}
          >
            1
          </span>
        </div>
        <p
          className={`text-xs mt-1 text-center w-24 ${
            tabStates[activeTab].step <= 2
              ? "text-blue-600 font-bold"
              : "text-gray-600"
          }`}
        >
          Upload and Map
        </p>
      </div>
      <div className="flex items-center mx-4">
        <div className="w-16 h-0.5 bg-gray-200">
          <div
            className={`h-0.5 transition-colors ${
              tabStates[activeTab].step >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        </div>
      </div>
      <div className="flex items-center text-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            tabStates[activeTab].step === 2 ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`text-base font-bold ${
              tabStates[activeTab].step === 2 ? "text-white" : "text-gray-800"
            }`}
          >
            2
          </span>
        </div>
        <p
          className={`text-xs mt-1 text-center w-24 ${
            tabStates[activeTab].step === 2
              ? "text-blue-600 font-bold"
              : "text-gray-600"
          }`}
        >
          Review and Submit
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {renderTabs()}
      {activeTab === "Budget" && showMonthWiseBudget ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">
            Month-wise budget upload component not yet implemented
          </p>
          <button
            onClick={handleMonthWiseBudgetBack}
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors"
          >
            Back to Budget
          </button>
        </div>
      ) : (
        <>
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
              onMonthWiseBudgetClick={
                activeTab === "Budget" ? handleMonthWiseBudgetClick : undefined
              }
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
        </>
      )}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default ProjectPlanUpload;
