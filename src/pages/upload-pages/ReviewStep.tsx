import React from "react";
import {
  MasterData,
  IntakeData,
  fieldMapping,
  ReadableField,
} from "./IntakeData";
import { useTheme } from "@/themes/ThemeProvider";

interface ReviewStepProps {
  mappedData: IntakeData[];
  excelData: string[][];
  headers: string[];
  mapping: Partial<Record<ReadableField, string>>;
  masterData: MasterData;
  onSubmit: (data: IntakeData[]) => void;
  onBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  mappedData,
  excelData,
  headers,
  mapping,
  masterData,
  onSubmit,
  onBack,
}) => {
  const {theme} =useTheme();
  const handleSubmit = () => {
    onSubmit(mappedData);
  };

  // Map headers to their corresponding readable fields
  const headerToField = headers.map((header) => {
    const field = Object.entries(mapping).find(
      ([_, mappedHeader]) => mappedHeader === header
    )?.[0] as ReadableField | undefined;
    return field;
  });

  // Function to get display value (original Excel value or MasterData lookup)
  const getDisplayValue = (
    field: ReadableField | undefined,
    excelValue: any, // Allow any type from excelData
    mappedValue: string | number | null
  ): string => {
    // Safely convert excelValue to string
    const safeExcelValue = excelValue == null ? "" : String(excelValue);

    // Return 'N/A' if field is undefined or excelValue is empty
    if (!field || safeExcelValue.trim() === "") return "N/A";

    // Use Excel value by default
    let displayValue = safeExcelValue;

    // Lookup canonical names from MasterData for specific fields
    switch (field) {
      case "Project Owner":
      case "Project Manager":
      case "Business Owner":
        const user = masterData.users.find(
          (u) => u.user_id.toString() === mappedValue?.toString()
        );
        return user
          ? `${user.first_name} ${user.last_name}`
          : safeExcelValue || "N/A";
      case "Priority":
        const priority = masterData.priorities.find(
          (p) => p.id.toString() === mappedValue?.toString()
        );
        return priority ? priority.value : safeExcelValue || "N/A";
      case "Project Size":
        const size = masterData.projectSizes.find(
          (s) => s.id.toString() === mappedValue?.toString()
        );
        return size ? size.value : safeExcelValue || "N/A";
      case "Budget Size":
        const budgetSize = masterData.budgetSizes.find(
          (s) => s.id.toString() === mappedValue?.toString()
        );
        return budgetSize ? budgetSize.value : safeExcelValue || "N/A";
      case "Classification":
        const classification = masterData.classifications.find(
          (c) => c.classification_id.toString() === mappedValue?.toString()
        );
        return classification
          ? classification.classification_name
          : safeExcelValue || "N/A";
      case "Project Owner Department":
      case "Business Owner Department":
      case "Impacted Function":
        if (mappedValue?.toString().includes(",")) {
          const deptIds = mappedValue
            .toString()
            .split(",")
            .map((id) => id.trim());
          const deptNames = deptIds
            .map((id) => {
              const dept = masterData.departments.find(
                (d) => d.department_id.toString() === id
              );
              return dept ? dept.department_name : null;
            })
            .filter((name) => name !== null);
          return deptNames.length > 0
            ? deptNames.join(", ")
            : safeExcelValue || "N/A";
        }
        const dept = masterData.departments.find(
          (d) => d.department_id.toString() === mappedValue?.toString()
        );
        return dept ? dept.department_name : safeExcelValue || "N/A";
      case "Goal":
        const goal = masterData.goals.find(
          (g) => g.goal_id.toString() === mappedValue?.toString()
        );
        return goal ? goal.goal_name : safeExcelValue || "N/A";
      case "Program":
        const program = masterData.programs.find(
          (p) => p.program_id.toString() === mappedValue?.toString()
        );
        return program ? program.program_name : safeExcelValue || "N/A";
      case "Impacted Applications":
        const app = masterData.imapctedApplications.find(
          (a) => a.application_id.toString() === mappedValue?.toString()
        );
        return app ? app.application_name : safeExcelValue || "N/A";
      default:
        return safeExcelValue || "N/A";
    }
  };

  const COLUMN_WIDTH = 120;

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Review & Submit
      </h1>
      <p className="text-base text-gray-600 text-center mb-3">
        Review the imported data below before submitting.
      </p>
      <div className="flex-grow mb-4 overflow-auto">
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded overflow-hidden">
            {/* Table Header */}
            <div className="flex bg-gray-100 border-b border-gray-300">
              {headers.map((header, index) => (
                <div
                  key={index}
                  className="py-3 px-2 text-sm font-bold text-gray-800 text-center bg-gray-100 border-r border-gray-300 min-w-[120px] truncate"
                >
                  {headerToField[index] || header}
                </div>
              ))}
            </div>
            {/* Table Rows */}
            {excelData.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex border-b border-gray-300 bg-white"
              >
                {headers.map((header, colIndex) => {
                  const field = headerToField[colIndex];
                  const excelValue = row[colIndex];
                  const dbField = field ? fieldMapping[field] : null;
                  const mappedValue =
                    dbField && mappedData[rowIndex]
                      ? mappedData[rowIndex][dbField]
                      : null;
                  const displayValue = getDisplayValue(
                    field,
                    excelValue,
                    mappedValue
                  );
                  return (
                    <div
                      key={colIndex}
                      className="py-3 px-2 text-sm text-gray-600 text-center border-r border-gray-300 min-w-[120px] truncate"
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
      <div className="flex justify-center mt-4 w-full max-w-xs gap-3 mx-auto">
        <button
          className="flex-1 py-3 rounded font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="flex-1 py-3 rounded font-bold  text-white transition-colors" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
