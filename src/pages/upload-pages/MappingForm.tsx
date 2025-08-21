import React, { useState, useEffect } from "react";
import {
  MasterData,
  IntakeData,
  fieldMapping,
  ReadableField,
} from "./IntakeData";

interface MappingFormProps {
  headers: string[];
  excelData: string[][];
  masterData: MasterData;
  initialMapping: Partial<Record<ReadableField, string>>;
  onComplete: (
    data: IntakeData[],
    mapping: Partial<Record<ReadableField, string>>,
    filteredExcelData: string[][],
    masterData: MasterData // Add masterData
  ) => void;
  onCancel: () => void;
}

interface ValidationResult {
  value: string | number | null;
  isValid: boolean;
  errorMessage: string;
}

interface ValidationError {
  row: number;
  field: ReadableField;
  value: string;
  errorMessage: string;
}

const MappingForm: React.FC<MappingFormProps> = ({
  headers,
  excelData,
  masterData,
  initialMapping,
  onComplete,
  onCancel,
}) => {
  const appFields = Object.keys(fieldMapping) as ReadableField[];
  const [mapping, setMapping] = useState<
    Partial<Record<ReadableField, string>>
  >(() => {
    const validMapping: Partial<Record<ReadableField, string>> = {};
    Object.entries(initialMapping).forEach(([field, header]) => {
      if (headers.includes(header as string)) {
        validMapping[field as ReadableField] = header;
      }
    });
    return validMapping;
  });
  const [unmappedFields, setUnmappedFields] = useState<ReadableField[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [showErrors, setShowErrors] = useState(false);

  const normalizeString = (str: string): string => {
    return str.replace(/[\s-_]/g, "").toLowerCase();
  };

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
          if (bestMatch) {
            newMapping[field] = bestMatch.original;
          }
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
    setValidationErrors([]);
    setShowErrors(false);
  };

  const excelSerialToDate = (serial: number): string => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 31));
    const utcDays = Math.floor(serial - 1);
    const date = new Date(excelEpoch.getTime() + utcDays * 86400000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const validateDateFormat = (value: string): boolean => {
    const dateRegex = /^(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
    if (dateRegex.test(value)) return true;
    const numericValue = Number(value);
    return !isNaN(numericValue) && numericValue > 0;
  };

  const convertToIds = (
    value: string,
    field: ReadableField
  ): ValidationResult => {
    const normalizedValue =
      typeof value === "string" ? normalizeString(value) : value;

    const validateNotEmpty = (val: string) => val.trim().length > 0;

    switch (field) {
      case "Start Date":
      case "End Date":
      case "Go-live Date":
        const goliveDate = Number(value);
        if (!isNaN(goliveDate) && goliveDate > 0) {
          return {
            value: excelSerialToDate(goliveDate),
            isValid: true,
            errorMessage: "",
          };
        }
        if (validateDateFormat(value)) {
          return { value, isValid: true, errorMessage: "" };
        }
        return {
          value,
          isValid: false,
          errorMessage: "Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD",
        };
      case "Project Owner":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Project Owner is required.",
          };
        }
        const ownerUser = masterData.users.find(
          (u) => normalizeString(u.first_name + u.last_name) === normalizedValue
        );
        if (!ownerUser) {
          return {
            value: null,
            isValid: false,
            errorMessage: `User '${value}' not found in master data.`,
          };
        }
        return { value: ownerUser.user_id, isValid: true, errorMessage: "" };
      case "Project Manager":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Project Manager is required.",
          };
        }
        const manager = masterData.users.find(
          (u) => normalizeString(u.first_name + u.last_name) === normalizedValue
        );
        if (!manager) {
          return {
            value: null,
            isValid: false,
            errorMessage: `User '${value}' not found in master data.`,
          };
        }
        return { value: manager.user_id, isValid: true, errorMessage: "" };
      case "Business Owner":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Business Owner is required.",
          };
        }
        const stakeholderUser = masterData.users.find(
          (u) => normalizeString(u.first_name + u.last_name) === normalizedValue
        );
        if (!stakeholderUser) {
          return {
            value: null,
            isValid: false,
            errorMessage: `User '${value}' not found in master data.`,
          };
        }
        return {
          value: stakeholderUser.user_id,
          isValid: true,
          errorMessage: "",
        };
      case "Priority":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Priority is required.",
          };
        }
        const priority = masterData.priorities.find(
          (p) => normalizeString(p.value) === normalizedValue
        );
        if (!priority) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Priority '${value}' not found in master data.`,
          };
        }
        return { value: priority.id, isValid: true, errorMessage: "" };
      case "Project Size":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Project Size is required.",
          };
        }
        const size = masterData.projectSizes.find(
          (s) => normalizeString(s.value) === normalizedValue
        );
        if (!size) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Project Size '${value}' not found in master data.`,
          };
        }
        return { value: size.id, isValid: true, errorMessage: "" };
      case "Budget Size":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Budget Size is required.",
          };
        }
        const budgetSize = masterData.budgetSizes.find(
          (s) => normalizeString(s.value) === normalizedValue
        );
        if (!budgetSize) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Budget Size '${value}' not found in master data.`,
          };
        }
        return { value: budgetSize.id, isValid: true, errorMessage: "" };
      case "Classification":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Classification is required.",
          };
        }
        const classification = masterData.classifications.find(
          (c) => normalizeString(c.classification_name) === normalizedValue
        );
        if (!classification) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Classification '${value}' not found in master data.`,
          };
        }
        return {
          value: classification.classification_id,
          isValid: true,
          errorMessage: "",
        };
      case "Project Owner Department":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Project Owner Department is required.",
          };
        }
        const dept = masterData.departments.find(
          (d) => normalizeString(d.department_name) === normalizedValue
        );
        if (!dept) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Department '${value}' not found in master data.`,
          };
        }
        return { value: dept.department_id, isValid: true, errorMessage: "" };
      case "Business Owner Department":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Business Owner Department is required.",
          };
        }
        const dept1 = masterData.departments.find(
          (d) => normalizeString(d.department_name) === normalizedValue
        );
        if (!dept1) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Department '${value}' not found in master data.`,
          };
        }
        return { value: dept1.department_id, isValid: true, errorMessage: "" };
      case "Impacted Function":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Impacted Function is required.",
          };
        }
        if (value.includes(",")) {
          const deptNames = value
            .split(",")
            .map((name) => normalizeString(name.trim()));
          const deptIds = deptNames.map((name) => {
            const dept = masterData.departments.find(
              (d) => normalizeString(d.department_name) === name
            );
            return dept ? dept.department_id : null;
          });
          const invalidNames = deptNames.filter((_, i) => deptIds[i] === null);
          if (invalidNames.length > 0) {
            return {
              value: null,
              isValid: false,
              errorMessage: `Departments '${invalidNames.join(
                ", "
              )}' not found in master data.`,
            };
          }
          return { value: deptIds.join(", "), isValid: true, errorMessage: "" };
        }
        const functions = masterData.departments.find(
          (i) => normalizeString(i.department_name) === normalizedValue
        );
        if (!functions) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Department '${value}' not found in master data.`,
          };
        }
        return {
          value: functions.department_id,
          isValid: true,
          errorMessage: "",
        };
      case "Goal":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Goal is required.",
          };
        }
        const goal = masterData.goals.find(
          (g) => normalizeString(g.goal_name) === normalizedValue
        );
        if (!goal) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Goal '${value}' not found in master data.`,
          };
        }
        return { value: goal.goal_id, isValid: true, errorMessage: "" };
      case "Program":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Program is required.",
          };
        }
        const program = masterData.programs.find(
          (p) => normalizeString(p.program_name) === normalizedValue
        );
        if (!program) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Program '${value}' not found in master data.`,
          };
        }
        return { value: program.program_id, isValid: true, errorMessage: "" };
      case "Impacted Applications":
        if (!validateNotEmpty(value)) {
          return {
            value: null,
            isValid: false,
            errorMessage: "Impacted Applications is required.",
          };
        }
        const application = masterData.imapctedApplications.find(
          (p) => normalizeString(p.application_name) === normalizedValue
        );
        if (!application) {
          return {
            value: null,
            isValid: false,
            errorMessage: `Application '${value}' not found in master data.`,
          };
        }
        return {
          value: application.application_id,
          isValid: true,
          errorMessage: "",
        };
      default:
        if (!validateNotEmpty(value)) {
          return {
            value: "",
            isValid: false,
            errorMessage: `${field} is required.`,
          };
        }
        return { value, isValid: true, errorMessage: "" };
    }
  };

  // Filter out blank rows
  const filteredExcelData = excelData.filter((row) =>
    row.some((cell) => cell && cell.toString().trim().length > 0)
  );

  const validateData = (): {
    data: IntakeData[];
    errors: ValidationError[];
  } => {
    const errors: ValidationError[] = [];
    const mappedData: IntakeData[] = filteredExcelData.map((row, rowIndex) => {
      const rowData: Partial<IntakeData> = {};
      appFields.forEach((field) => {
        const mappedHeader = mapping[field];
        if (mappedHeader) {
          const columnIndex = headers.indexOf(mappedHeader);
          const rawValue =
            columnIndex !== -1 ? (row[columnIndex] || "").toString() : "";
          const dbField = fieldMapping[field];
          const result = convertToIds(rawValue, field);
          (rowData as any)[dbField] = result.value;
          if (!result.isValid) {
            errors.push({
              row: rowIndex + 2, // +2 for header row and 1-based indexing
              field,
              value: rawValue,
              errorMessage: result.errorMessage,
            });
          }
        }
      });
      return rowData as IntakeData;
    });
    return { data: mappedData, errors };
  };

  const handleNext = () => {
    if (unmappedFields.length > 0) {
      alert(`Please map the following fields: ${unmappedFields.join(", ")}`);
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
      const proceed = confirm(
        `Found ${errors.length} data validation errors. Review them below. Proceed anyway?`
      );
      if (proceed) {
        onComplete(data, mapping, filteredExcelData, masterData);
      }
    } else {
      onComplete(data, mapping, filteredExcelData, masterData);
    }
  };

  const handleBackFromErrors = () => {
    setShowErrors(false);
    setValidationErrors([]);
  };

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      {!showErrors ? (
        <>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Field Mapping
          </h1>
          {unmappedFields.length > 0 && (
            <div className="bg-red-50 p-3 rounded mb-3">
              <p className="text-red-800 text-sm">
                Unmapped fields: {unmappedFields.join(", ")}
              </p>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <div className="pb-5">
              {appFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center mb-3 gap-2 max-w-lg"
                >
                  <label
                    className={`w-64 text-base font-medium ${
                      mapping[field] ? "text-gray-800" : "text-red-800"
                    }`}
                  >
                    {field}
                  </label>
                  <div className="w-64 border border-gray-300 rounded bg-white overflow-hidden">
                    <select
                      className="w-full h-10 px-2 text-gray-800 border-0 rounded"
                      value={mapping[field] || ""}
                      onChange={(e) =>
                        handleMappingChange(field, e.target.value)
                      }
                    >
                      <option value="">Select Column</option>
                      {headers.map((header, index) => (
                        <option key={index} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4 w-full max-w-xs gap-3 mx-auto pb-4">
            <button
              className="flex-1 py-3 rounded font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`flex-1 py-3 rounded font-bold text-white ${
                unmappedFields.length > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-800 hover:bg-blue-900"
              } transition-colors`}
              onClick={handleNext}
              disabled={unmappedFields.length > 0}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Validation Errors
          </h1>
          <div className="flex-1 border border-red-800 rounded mb-4 overflow-auto">
            <div className="p-3">
              <div className="flex-grow overflow-auto">
                <div className="overflow-x-auto">
                  <div className="bg-red-50 border-b border-red-800">
                    <div className="flex">
                      <div className="w-40 p-2 text-sm font-bold text-red-800 border-r border-gray-300">
                        Row
                      </div>
                      <div className="w-40 p-2 text-sm font-bold text-red-800 border-r border-gray-300">
                        Field
                      </div>
                      <div className="w-40 p-2 text-sm font-bold text-red-800 border-r border-gray-300">
                        Value
                      </div>
                      <div className="w-40 p-2 text-sm font-bold text-red-800">
                        Error
                      </div>
                    </div>
                  </div>
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex border-b border-gray-300">
                      <div className="w-40 p-2 text-sm text-gray-800 border-r border-gray-300">
                        {error.row}
                      </div>
                      <div className="w-40 p-2 text-sm text-gray-800 border-r border-gray-300">
                        {error.field}
                      </div>
                      <div className="w-40 p-2 text-sm text-gray-800 border-r border-gray-300">
                        {error.value}
                      </div>
                      <div className="w-40 p-2 text-sm text-gray-800">
                        {error.errorMessage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4 w-full max-w-xs gap-3 mx-auto pb-4">
            <button
              className="flex-1 py-3 rounded font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3 rounded font-bold bg-blue-800 text-white hover:bg-blue-900 transition-colors"
              onClick={handleBackFromErrors}
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MappingForm;
