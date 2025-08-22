import React, { useEffect, useState } from "react";
import { format, addMonths, parseISO, startOfMonth, isValid } from "date-fns";
import { InsertActualBudgetMultiple } from "@/utils/BudgetPlan";
import AlertBox from "@/components/ui/AlertBox";
import { useTheme } from "@/themes/ThemeProvider";

interface BudgetPlannerResourceProps {
  rate: any;
  sub_category_id: any;
  totalBudget: number;
  projectId: string;
  budget_detail_id: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  budgetType: string;
  monthlyData: { [key: string]: { value: number; id: string } };
  monthwise_budget: any[];
  resetBudget: (budget_detail_id: string) => void;
  categoryName: string;
  subCategoryName: string;
  onClose: () => void;
}

export default function BudgetPlannerResource({
  totalBudget,sub_category_id,
  budget_detail_id,
  startDate,
  endDate,
  monthlyData,
  monthwise_budget,
  resetBudget,
  categoryName,
  subCategoryName,
  onClose,
}: BudgetPlannerResourceProps) {
  let start: Date | null = null;
let end: Date | null = null;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const hideAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
    resetBudget(budget_detail_id);
  };
if (startDate) {
  const parsed = parseISO(startDate);
  if (isValid(parsed)) {
    start = startOfMonth(parsed);
  }
}

if (endDate) {
  const parsed = parseISO(endDate);
  if (isValid(parsed)) {
    end = startOfMonth(parsed);
  }
}

// Example: fallback if invalid or missing
if (!start || !end) {
  console.warn("Invalid startDate or endDate");
  // fallback: assign today so the component doesn't break
  start = startOfMonth(new Date());
  end = startOfMonth(new Date());
}

  monthwise_budget.forEach((obj: any) => {
    if (obj.resource_id?.toString() === sub_category_id?.toString()) {
      monthlyData[obj.yearmonth] = {
        value: parseFloat(obj.budget),
        id: obj.budget_detail_monthwise_id ?? 0,
      };
    }
  });

  // build month rows
  const initialMonths: {
    id?: string;
    label: string;
    key: string;
    value: string;
  }[] = [];


  let currentMonth = start;
  while (currentMonth <= end) {
    const key = format(currentMonth, "yyyy-MM");
    const label = format(currentMonth, "MMM - yyyy");
    initialMonths.push({
      id: monthlyData[key]?.id ?? "",
      label,
      key,
      value: monthlyData[key]?.value?.toString() ?? "",
    });
    currentMonth = addMonths(currentMonth, 1);
  }

  const [months, setMonths] = useState(initialMonths);

  const total = months.reduce((sum, m) => {
    const num = parseFloat(m.value);
    return sum + (!isNaN(num) ? num : 0);
  }, 0);
const handleSubmit = async (values: any) => {
    const payload = {
      resource_id: sub_category_id,
      budgetDetails: values.map((obj, index) => {
        if (monthlyData[obj.key]?.id) {
          return {
            budget_detail_id: Number(budget_detail_id),
            budget_detail_monthwise_id: Number(monthlyData[obj.key]?.id),
            yearmonth: obj.key,
            budget: obj.value,
          };
        } else {
          return {
            budget_detail_id: Number(budget_detail_id),
            yearmonth: obj.key,
            budget: obj.value,
          };
        }
      }),
    };
    const response = await InsertActualBudgetMultiple(payload);
    const parsedRes = JSON.parse(response);
    if (parsedRes?.status === 'success') {
      showAlert('Budget saved successfully!');
    } else {
      showAlert('Failed to save budget. Please try again.');
    }
    console.log('Saving budget resource:', payload);
  };
  const handleChange = (index: number, text: string) => {
    const updated = [...months];
    updated[index].value = text.replace(/[^0-9.]/g, "");
    setMonths(updated);
  };

  const isMonthsChanged = () =>
    months.some((m, i) => m.value !== initialMonths[i].value);
  const {theme} =useTheme();
useEffect(() => {
  const updatedMonths: {
    id?: string;
    label: string;
    key: string;
    value: string;
  }[] = [];

  let currentMonth = start;
  while (currentMonth <= end) {
    const key = format(currentMonth, "yyyy-MM");
    const label = format(currentMonth, "MMM - yyyy");
    updatedMonths.push({
      id: monthlyData[key]?.id ?? "",
      label,
      key,
      value: monthlyData[key]?.value?.toString() ?? "",
    });
    currentMonth = addMonths(currentMonth, 1);
  }

  setMonths(updatedMonths);
}, [startDate, endDate, monthlyData, monthwise_budget, sub_category_id]);
  return (
    <div className="flex justify-center items-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-4/5">
        {/* Header row */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            ✕ Close Breakdown
          </button>
        </div>

        {/* Project Dates */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <span className="font-semibold">Project Start Date:</span>
          <span>
            {startDate ? new Date(startDate).toLocaleDateString("en-US") : "N/A"}
          </span>
          <span className="font-semibold">Project End Date:</span>
          <span>
            {endDate ? new Date(endDate).toLocaleDateString("en-US") : "N/A"}
          </span>
        </div>

        {/* Category, Subcategory, Allocated Budget */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <span className="font-semibold">Category:</span>
          <span>{categoryName}</span>
          <span className="font-semibold">Sub-Category:</span>
          <span>{subCategoryName}</span>
          <span className="font-semibold">Allocated Budget:</span>
          <span>${totalBudget?.toLocaleString()}</span>

          <div className="ml-auto flex gap-2">
            <span
              className={`font-semibold ${
                total > totalBudget ? "text-red-600" : "text-blue-600"
              }`}
            >
              Budget Forecast:
            </span>
            <span
              className={`${
                total > totalBudget ? "text-red-600" : "text-blue-600"
              }`}
            >
              ${total?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="w-3/4 mx-auto">
          <div className="grid grid-cols-3 bg-blue-900 text-white font-semibold rounded-md px-4 py-2">
            <span>#</span>
            <span>Month - Year</span>
            <span>Total Amount ($)</span>
          </div>

          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-b-md">
            {months.map(({ label, value }, index) => (
              <div
                key={index}
                className="grid grid-cols-3 px-4 py-2 border-b border-gray-200 items-center text-sm"
              >
                <span className="font-semibold">{index + 1}</span>
                <span>{label}</span>
                <input
                  className="border rounded-md px-2 py-1 w-32"
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="Enter Amount"
                />
              </div>
            ))}

            <div className="grid grid-cols-3 px-4 py-2 font-semibold">
              <span></span>
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          {isMonthsChanged() && (
            <button
              onClick={() => setMonths([...initialMonths])}
              className="px-4 py-2 rounded-md border border-gray-400 text-gray-600 hover:bg-gray-100"
            >
              Revert
            </button>
          )}
          <button
            onClick={() => {console.log("Save budgets:", months);handleSubmit(months);}}
            className="px-4 py-2 rounded-md text-white hover:bg-blue-700" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          >
            Save
          </button>
        </div>
        <AlertBox
        visible={alertVisible}
        message={alertMessage}
        onCloseAlert={hideAlert}
      />
      </div>
    </div>
  );
}
