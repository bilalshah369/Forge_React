import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { GetMasterData } from "../../utils/PM";
import { InsertBulkResources } from "../../utils/Intake";
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

// Define types for resource data
interface ResourceData {
  first_name: string;
  last_name: string;
  email: string;
  department_id?: number | null;
  reporting_manager_id?: number | null;
  cost_per_hour?: number | null;
  role_id?: number | null;
  approval_limit?: string;
  external_resource?: boolean | false;
}

interface MasterData {
  departments: { department_id: number; department_name: string }[];
  users: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  }[];
  roles: { role_id: number; role_name: string }[];
}

type ReadableField =
  | "First Name"
  | "Last Name"
  | "Email"
  | "Department"
  | "Reporting Manager"
  | "Cost per Hour"
  | "Role"
  | "Approval Limit"
  | "External Resource";

const fieldMapping: Record<ReadableField, keyof ResourceData> = {
  "First Name": "first_name",
  "Last Name": "last_name",
  Email: "email",
  Department: "department_id",
  "Reporting Manager": "reporting_manager_id",
  "Cost per Hour": "cost_per_hour",
  Role: "role_id",
  "Approval Limit": "approval_limit",
  "External Resource": "external_resource",
};

// Fetch master data
const fetchMasterData = async (): Promise<MasterData> => {
  const response = await GetMasterData();
  const result = JSON.parse(response);
  return {
    departments: result.data.departments,
    users: result.data.users,
    roles: result.data.roles,
  };
};

// Step 2: Mapping Form Component
const ResourceMappingForm: React.FC<{
  headers: string[];
  excelData: string[][];
  masterData: MasterData;
  initialMapping: Partial<Record<ReadableField, string>>;
  onComplete: (
    data: ResourceData[],
    mapping: Partial<Record<ReadableField, string>>,
    filteredExcelData: string[][],
    masterData: MasterData
  ) => void;
  onCancel: () => void;
}> = ({
  headers,
  excelData,
  masterData,
  initialMapping,
  onComplete,
  onCancel,
}) => {
  const appFields = Object.keys(fieldMapping) as ReadableField[];
  const [mapping, setMapping] =
    useState<Partial<Record<ReadableField, string>>>(initialMapping);
  const [unmappedFields, setUnmappedFields] = useState<ReadableField[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    { row: number; field: string; message: string }[]
  >([]);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const mandatoryFields: ReadableField[] = ["First Name", "Last Name", "Email"];

  const normalizeString = (str: any): string =>
    String(str ?? "")
      .replace(/[\s-_]/g, "")
      .toLowerCase();

  // Filter blank rows
  const filteredExcelData = excelData.filter((row) =>
    row.some((cell) => cell != null && String(cell).trim().length > 0)
  );

  useEffect(() => {
    const autoMatchFields = () => {
      const newMapping: Partial<Record<ReadableField, string>> = { ...mapping };
      const normalizedHeaders = headers.map((header) => ({
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

      setMapping(newMapping);
      setUnmappedFields(appFields.filter((field) => !newMapping[field]));
    };
    autoMatchFields();
  }, [headers]);

  const handleMappingChange = (
    appField: ReadableField,
    excelHeader: string
  ) => {
    setMapping((prev) => {
      const newMapping = { ...prev, [appField]: excelHeader || undefined };
      setUnmappedFields(appFields.filter((field) => !newMapping[field]));
      return newMapping;
    });
  };

  const convertToIds = (
    value: string,
    field: ReadableField
  ): string | number | boolean | null => {
    if (!value) return null;
    const normalizedValue = normalizeString(value);
    switch (field) {
      case "Department":
        const dept = masterData.departments.find(
          (d) => normalizeString(d.department_name) === normalizedValue
        );
        return dept ? dept.department_id : null;
      case "Reporting Manager":
        const manager = masterData.users.find(
          (u) => normalizeString(u.email) === normalizedValue
        );
        return manager ? manager.user_id : null;
      case "Cost per Hour":
        return parseFloat(value) || null;
      case "Role":
        const role = masterData.roles.find(
          (r) => normalizeString(r.role_name) === normalizedValue
        );
        return role ? role.role_id : null;
      case "External Resource":
        return ["true", "yes", "1"].includes(normalizedValue);
      default:
        return value;
    }
  };

  const validateData = () => {
    const errors: { row: number; field: string; message: string }[] = [];
    const data: ResourceData[] = [];

    filteredExcelData.forEach((row, rowIndex) => {
      const rowData: Partial<ResourceData> = {};
      let rowHasErrors = false;

      appFields.forEach((field) => {
        const mappedHeader = mapping[field];
        const dbField = fieldMapping[field];
        let rawValue = "";

        if (mappedHeader) {
          const columnIndex = headers.indexOf(mappedHeader);
          rawValue = columnIndex !== -1 ? String(row[columnIndex] || "") : "";
          const convertedValue = convertToIds(rawValue, field);

          if (mandatoryFields.includes(field) && !rawValue.trim()) {
            errors.push({
              row: rowIndex + 2,
              field,
              message: `Missing mandatory field "${field}"`,
            });
            rowHasErrors = true;
          }

          if (field === "Email" && rawValue) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(rawValue)) {
              errors.push({
                row: rowIndex + 2,
                field,
                message: `Invalid email "${rawValue}"`,
              });
              rowHasErrors = true;
            }
          }

          if (
            ["Department", "Reporting Manager", "Role"].includes(field) &&
            rawValue &&
            convertedValue === null
          ) {
            errors.push({
              row: rowIndex + 2,
              field,
              message: `Invalid ${field} "${rawValue}"`,
            });
            rowHasErrors = true;
          }

          (rowData as any)[dbField] = convertedValue;
        }
      });

      if (!rowHasErrors) {
        data.push(rowData as ResourceData);
      }
    });

    return { data, errors };
  };

  const handleNext = () => {
    const missingMandatory = mandatoryFields.filter((field) => !mapping[field]);
    if (missingMandatory.length > 0) {
      alert(`Please map mandatory fields: ${missingMandatory.join(", ")}`);
      return;
    }

    if (filteredExcelData.length === 0) {
      alert("The Excel file contains no valid data rows.");
      return;
    }

    const { data, errors } = validateData();
    setValidationErrors(errors);
    setShowErrors(true);

    if (errors.length > 0) {
      const proceed = window.confirm(
        `Found ${errors.length} data validation errors. Review them below. Proceed anyway?`
      );
      if (proceed) {
        onComplete(data, mapping, filteredExcelData, masterData);
      }
    } else {
      onComplete(data, mapping, filteredExcelData, masterData);
    }
  };

  const handleBackToMapping = () => {
    setShowErrors(false);
  };

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        {showErrors ? "Validation Errors" : "Field Mapping"}
      </h2>
      {showErrors ? (
        <>
          <p className="text-base text-gray-600 text-center mb-5">
            The following errors were found in the uploaded data:
          </p>
          <div className="flex-1 mb-4 overflow-auto">
            <div className="border border-gray-300 rounded overflow-hidden">
              <div className="flex bg-gray-100 border-b border-gray-300">
                <div className="w-16 py-2 px-2 text-sm font-bold text-gray-800 text-center border-r border-gray-300">
                  Row
                </div>
                <div className="w-32 py-2 px-2 text-sm font-bold text-gray-800 text-center border-r border-gray-300">
                  Field
                </div>
                <div className="w-60 py-2 px-2 text-sm font-bold text-gray-800 text-center">
                  Error
                </div>
              </div>
              {validationErrors.map((error, index) => (
                <div
                  key={index}
                  className="flex bg-white border-b border-gray-300"
                >
                  <div className="w-16 py-2 px-2 text-sm text-red-600 text-center border-r border-gray-300">
                    {error.row}
                  </div>
                  <div className="w-32 py-2 px-2 text-sm text-red-600 text-center border-r border-gray-300">
                    {error.field}
                  </div>
                  <div className="w-60 py-2 px-2 text-sm text-red-600 text-center">
                    {error.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4 max-w-xs mx-auto gap-2">
            <Button
              variant="secondary"
              onClick={handleBackToMapping}
              className="flex-1 max-w-32"
            >
              Back to Mapping
            </Button>
          </div>
        </>
      ) : (
        <>
          {unmappedFields.length > 0 && (
            <div className="bg-red-50 p-2 rounded mb-3">
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
                      mapping[field] ? "text-gray-800" : "text-red-700"
                    )}
                  >
                    {field}
                    {mandatoryFields.includes(field) && (
                      <span className="text-red-700 font-bold">*</span>
                    )}
                  </label>
                  <div className="w-64">
                    <Select
                      value={mapping[field] || ""}
                      onValueChange={(value) =>
                        handleMappingChange(field, value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header, index) => (
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
              onClick={onCancel}
              className="flex-1 max-w-32"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 max-w-32 bg-blue-900 hover:bg-blue-800"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Step 3: Review Step Component
const ResourceReviewStep: React.FC<{
  mappedData: ResourceData[];
  excelData: string[][];
  headers: string[];
  mapping: Partial<Record<ReadableField, string>>;
  masterData: MasterData;
  onSubmit: (data: ResourceData[]) => void;
  onBack: () => void;
}> = ({
  mappedData,
  excelData,
  headers,
  mapping,
  masterData,
  onSubmit,
  onBack,
}) => {
  const handleSubmit = () => {
    onSubmit(mappedData);
  };

  const headerToField = headers.map((header) => {
    const field = Object.entries(mapping).find(
      ([_, mappedHeader]) => mappedHeader === header
    )?.[0] as ReadableField | undefined;
    return field;
  });

  const getDisplayValue = (
    field: ReadableField | undefined,
    excelValue: any,
    mappedValue: string | number | boolean | null
  ): string => {
    const safeExcelValue = excelValue == null ? "" : String(excelValue);
    if (!field || safeExcelValue.trim() === "") return "N/A";

    let displayValue = safeExcelValue;

    switch (field) {
      case "Department":
        const dept = masterData.departments.find(
          (d) => d.department_id === mappedValue
        );
        return dept ? dept.department_name : safeExcelValue || "N/A";
      case "Reporting Manager":
        const user = masterData.users.find((u) => u.user_id === mappedValue);
        return user
          ? `${user.first_name} ${user.last_name}`
          : safeExcelValue || "N/A";
      case "Role":
        const role = masterData.roles.find((r) => r.role_id === mappedValue);
        return role ? role.role_name : safeExcelValue || "N/A";
      case "External Resource":
        return mappedValue ? "Yes" : "No";
      default:
        return safeExcelValue || "N/A";
    }
  };

  const COLUMN_WIDTH = 120;

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Review & Submit
      </h2>
      <p className="text-base text-gray-600 text-center mb-5">
        Review the imported resources before submitting.
      </p>
      <div className="flex-1 mb-4 overflow-auto">
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="flex bg-gray-100 border-b border-gray-300">
              {headers.map((header, index) => (
                <div
                  key={index}
                  className="py-2 px-2 text-sm font-bold text-gray-800 text-center border-r border-gray-300 truncate"
                  style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}
                >
                  {headerToField[index] || header}
                </div>
              ))}
            </div>
            {excelData.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex bg-white border-b border-gray-300"
              >
                {headers.map((header, colIndex) => {
                  const field = headerToField[colIndex];
                  const excelValue = row[colIndex];
                  const dbField = field ? fieldMapping[field] : null;
                  const mappedValue =
                    dbField && mappedData[rowIndex]
                      ? (mappedData[rowIndex] as any)[dbField]
                      : null;
                  const displayValue = getDisplayValue(
                    field,
                    excelValue,
                    mappedValue
                  );
                  return (
                    <div
                      key={colIndex}
                      className="py-2 px-2 text-sm text-gray-600 text-center border-r border-gray-300 truncate"
                      style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}
                    >
                      {displayValue}
                    </div>
                  );
                })}
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
          onClick={handleSubmit}
          className="flex-1 max-w-32 bg-blue-900 hover:bg-blue-800"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

// Main ResourceUpload Component
const ResourceUpload: React.FC = () => {
  const [excelData, setExcelData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappedData, setMappedData] = useState<ResourceData[]>([]);
  const [mapping, setMapping] = useState<
    Partial<Record<ReadableField, string>>
  >({});
  const [filteredExcelData, setFilteredExcelData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [masterData, setMasterData] = useState<MasterData>({
    departments: [],
    users: [],
    roles: [],
  });
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const data = await fetchMasterData();
        setMasterData(data);
      } catch (error) {
        console.error("Error fetching master data:", error);
        showAlert("Failed to fetch master data.");
      }
    };
    loadMasterData();
  }, []);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      setHeaders(jsonData[0]);
      setExcelData(jsonData.slice(1));
      setStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleMappingComplete = (
    data: ResourceData[],
    newMapping: Partial<Record<ReadableField, string>>,
    filteredExcelData: string[][],
    masterData: MasterData
  ) => {
    setMappedData(data);
    setMapping(newMapping);
    setFilteredExcelData(filteredExcelData);
    setStep(3);
  };

  const handleSubmit = async (data: ResourceData[]) => {
    try {
      const response = await InsertBulkResources(data);
      const parsedResponse = JSON.parse(response);
      if (parsedResponse.success) {
        showAlert("Resources imported successfully.");
        resetState();
      } else {
        alert("Error importing resources.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting.");
    }
  };

  const resetState = () => {
    setStep(1);
    setHeaders([]);
    setExcelData([]);
    setMappedData([]);
    setMapping({});
    setFilteredExcelData([]);
    setFileName("");
  };

  const handleCancel = () => {
    resetState();
  };

  const handleBackToMapping = () => {
    setStep(2);
  };

  const handleNextFromUpload = () => {
    if (fileName && excelData.length > 0) {
      setStep(2);
    } else {
      showAlert("Please upload a valid Excel file.");
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  const downloadFile = async () => {
    const url = `/images/Resource_Upload.xlsx`;
    const fileName = "Resource_Upload.xlsx";

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file.");
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-4">
      <button
        className={cn(
          "flex-1 py-2 px-2 rounded text-sm font-medium text-center",
          step === 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800"
        )}
        onClick={() => setStep(1)}
        disabled={step === 1}
      >
        1. File Upload
      </button>
      <button
        className={cn(
          "flex-1 py-2 px-2 rounded text-sm font-medium text-center ml-1",
          step === 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800"
        )}
        onClick={() => headers.length > 0 && setStep(2)}
        disabled={step === 1 || step === 2}
      >
        2. Field Mapping
      </button>
      <button
        className={cn(
          "flex-1 py-2 px-2 rounded text-sm font-medium text-center ml-1",
          step === 3 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800"
        )}
        onClick={() => mappedData.length > 0 && setStep(3)}
        disabled={step < 3}
      >
        3. Review & Submit
      </button>
    </div>
  );

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      {renderStepIndicator()}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Upload Resource File
          </h2>
          <p className="text-base text-gray-600 text-center mb-5">
            Please upload an Excel file (.xlsx or .xls) to import resources.
          </p>
          <div className="relative">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              Choose File
            </Button>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {fileName ? (
            <p className="mt-2 text-base text-gray-800">
              Selected file: {fileName}
            </p>
          ) : (
            <p className="mt-2 text-base text-gray-800">No file selected</p>
          )}
          <Button
            variant="outline"
            onClick={downloadFile}
            className="mt-5 flex items-center gap-2"
          >
            <Download_svg height={20} width={20} />
            Download Template
          </Button>
          {fileName && (
            <div className="flex justify-end mt-4 w-full">
              <Button
                onClick={handleNextFromUpload}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
      {step === 2 && (
        <ResourceMappingForm
          headers={headers}
          excelData={excelData}
          masterData={masterData}
          initialMapping={mapping}
          onComplete={handleMappingComplete}
          onCancel={handleCancel}
        />
      )}
      {step === 3 && (
        <ResourceReviewStep
          mappedData={mappedData}
          excelData={filteredExcelData}
          headers={headers}
          mapping={mapping}
          masterData={masterData}
          onSubmit={handleSubmit}
          onBack={handleBackToMapping}
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

export default ResourceUpload;
