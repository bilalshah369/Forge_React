/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import AlertBox from "@/components/ui/AlertBox";
import ConfirmationBox from "@/components/ui/ConfirmationBox";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import {
  GetBudgetCategories,
  GetBudgetDetails,
  GetBudgetSubCategories,
  InsertBudgetDetailsSingle,
} from "@/utils/Intake";
import { GetUserDept } from "@/utils/Users";
import { formatAmountWithDollarSign } from "@/utils/util";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export class BudgetData {
  id?: number;
  budget_detail_id?: number;
  project_id?: number;
  category_id?: number;
  sub_category_id?: number;
  category_name?: string;
  sub_category_name?: string;
  qty?: number;
  value?: number;
  unit?: number;
  total?: number;
  department_id?: number;
  department_name?: string;
  description?: string;
}

interface AddBudgetModelProps {
  prj_id: number;
  BudgetRow: BudgetData;
  onSubmit: (str:string) => void;
  visible: boolean;
}

const AddBudgetModel: React.FC<AddBudgetModelProps> = ({
  BudgetRow,
  onSubmit,
  prj_id,
  visible,
}) => {
  const [form, setForm] = useState({
    projectName: "",
    category: "",
    subCategory: "",
    function: "",
    quantity: "",
    costPerHour: "",
    total: "",
    description: "",
  });
  const [rows, setRows] = useState<BudgetData[]>([]);
const [budgetRow, setBudgetRow] = useState<BudgetData>(BudgetRow);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [subCategorySelected, setSubCategorySelected] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDeptID, setSelectedDeptID] = useState<string>("");
  const [units, setUnits] = useState<{ unit_name: string; unit_id: string }[]>(
    []
  );
  const [dropdownKey, setDropdownKey] = useState<number>(0); //rushil

  const [defaultRates, setDefaultRates] = useState<
    { unit: string; role: string; rate: string; type: string }[]
  >([]);
  const [defaultRate, setDefaultRate] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [qtyLabelToDisplay, setQtyLabelToDisplay] = useState<boolean>(false);
  const [disableEdit, setDisableEdit] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [dataLoading, setdataLoading] = useState<boolean>(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  // const { theme } = useTheme();
  // const styles = modalStyles(theme);
  const [headers, setHeaders] = useState<any[]>([
    { label: "#", key: "sno", visible: true, type: "sno", column_width: "50" },

    {
      label: "Category",
      key: "category_name",
      visible: true,
      type: "",
      column_width: "200",
    },
    {
      label: "Sub-Category",
      key: "sub_category_name",
      visible: true,
      type: "",
      column_width: "150",
    },

    {
      label: "Function",
      key: "department_name",
      visible: true,
      type: "",
      column_width: "200",
    },
    {
      label: "Quantity/Hours",
      key: "qty",
      visible: true,
      type: "hour",
      column_width: "200",
    },
    {
      label: "Cost/hour ($)",
      key: "value",
      visible: true,
      type: "cost",
      column_width: "200",
    },
    {
      label: "Total ($)",
      key: "total",
      visible: true,
      type: "cost",
      column_width: "200",
    },

    {
      label: "Action",
      key: "action",
      visible: true,
      type: "",
      column_width: "100",
    },
  ]);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [parentCategory, setParentCategory] = useState<number>();
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };
  const validateFields = () => {
    const validationErrors: { [key: string]: string } = {};
    ////////////debugger;
    if (!budgetRow.category_id)
      validationErrors.category = "Category is required.";
    if (!budgetRow.sub_category_id)
      validationErrors.categoryDetail = "Sub-Category is required.";
    // if (!newRow.department_id) validationErrors.department = 'Function is required.';
    // if (!newRow.qty || newRow.qty <= 0)
    //   validationErrors.quantity = 'Quantity must be a positive number.';
    // if (!newRow.value || newRow.value <= 0)
    //   validationErrors.value = 'Value must be a positive number.';
    if (!budgetRow.total) {
      validationErrors.total = "Total is required.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };
  // Auto-calculate total if quantity and cost/hour are both entered
  useEffect(() => {
    const qty = parseFloat(form.quantity);
    const cost = parseFloat(form.costPerHour);
    if (!isNaN(qty) && !isNaN(cost)) {
      setForm((prev) => ({ ...prev, total: (qty * cost).toFixed(2) }));
    }
  }, [form.quantity, form.costPerHour]);

  // const handleAddRow = async () => {
  //   if (!validateFields()) {
  //     //Alert.alert("Validation Error", "Please fix the errors before adding.");
  //     return;
  //   }
  //   const idToUpdate = newRow.id;
  //   if (editMode) {
  //     console.log("idToUpdate " + idToUpdate);
  //     const updatedRow = rows.map((row) =>
  //       row.id == idToUpdate ? { ...row, ...newRow } : row
  //     );
  //     setRows(updatedRow);
  //   } else {
  //     setRows([...rows, { ...newRow, id: rows.length + 1 }]);
  //   }

  //   //loadBudgetData(projectId);
  //   // setNewRow({
  //   //   id: 0,
  //   //   budget_detail_id: 0,
  //   //   project_id: projectId,
  //   //   category_id: 0,
  //   //   sub_category_id: 0,
  //   //   category_name: "",
  //   //   sub_category_name: "",
  //   //   qty: 0,
  //   //   value: 0,
  //   //   unit: 0,
  //   //   department_id: "",
  //   //   department_name: "",
  //   //   description: "",
  //   //   total: 0,
  //   // });
  //   setErrors({});
  //   setSelectedDeptID("");
  //   setDisableEdit(false);
  //   setEditMode(false);
  //   setDisableSubmit(false);
  //   setdataLoading(false);
  //   setDropdownKey((prevKey) => prevKey + 1); //rushil
  //   var dpd = departments;
  //   setDepartments(undefined);
  //   setDepartments(dpd);
  // };

  const handleDelete = async (recordId: number) => {
    //console.log(subCategoryId);
    ////////////debugger;
    const updatedRows = rows.filter((row) => row.id !== recordId);
    console.log(updatedRows.length);
    setRows(updatedRows);
    if (updatedRows.length === 0) setDisableSubmit(true);
  };
  const handleEdit = async (data: BudgetData) => {
    //console.log(data.department_id);
    setEditMode(true);
    //setNewRow(data);
  };

  function getDepartmentNames(departmentIds: string): string {
    // Split the comma-separated IDs and convert to numbers
    const ids = departmentIds
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    // Map IDs to department names
    const names = ids
      .map((id) => {
        const dept = departments.find((d) => d.department_id === id);
        return dept ? dept.department_name : null;
      })
      .filter((name) => name !== null) // Remove nulls if any ID wasn't found
      .join(",");

    return names;
  }
  const handleDeptSelect = (deptID: any) => {
    // setSelectedDeptID(deptID); // Update the parent state with the selected department ID
    //console.log(`Selected Department ID: ${deptID}`);
    console.log("handleDeptSelect" + deptID);
    // const selectedDept = departments.find(
    //   dept => dept.department_id === deptID,
    // );
    ////console.log(departments.length);

    if (deptID) {
      const departmentNames = getDepartmentNames(deptID);
      setBudgetRow({
        ...budgetRow,
        department_id: deptID,
        department_name: departmentNames,
      });
    }
    // setFieldValue("selectedDeptID", deptID);
  };
  const handleCategoryChange = async (categoryId: number) => {
    ////console.log(category)
    debugger;
    // const categorySelected = categories.find(
    //   (categ) => categ.category_id == categoryId
    // );
    //console.log(categorySelected)
    if (true) {
      setBudgetRow({
        ...budgetRow,
        category_id: categoryId,
       // category_name: categorySelected.category_name,
        sub_category_id: 0,
      });
      const response = await GetBudgetSubCategories(categoryId?.toString());
      const result = JSON.parse(response);
      //const fetchedSubCategories = JSON.parse(response1);
      if (result.data && Array.isArray(result.data.subcategory)) {
        setCategoryDetails(result.data?.subcategory);
      } else {
        setCategoryDetails([]);
      }
    } else {
      setBudgetRow({
        ...budgetRow,
        category_id: 0,
        category_name: "",
        sub_category_id: 0,
      });
    }
    if (categoryId == 2 || categoryId == 3) {
      setQtyLabelToDisplay(true);
    } else {
      setQtyLabelToDisplay(false);
    }
  };

  const handleSubCategoryChange = async (categoryId: number) => {
    ////console.log('subcategoryId' + categoryId);
    setSubCategorySelected(categoryId?.toString());
    const subCategorySelected = categoryDetails.find(
      (categ) => categ.sub_category_id == categoryId
    );
    //console.log(subCategorySelected);
    let value = budgetRow.value;
    let rate = 0;
    if (subCategorySelected) {
      //let filtered = categoryDetails.filter(item => item.sub_category_id === parseInt(categoryId));
      ////console.log('rate ' + filtered[0].cost_per_hour);

      if (
        subCategorySelected.cost_per_hour !== null &&
        subCategorySelected.cost_per_hour !== undefined
      ) {
        //   //console.log('hhhhhhh');
        setDefaultRate(subCategorySelected.cost_per_hour);
        //console.log('value' + defaultRate);
        rate = parseFloat(subCategorySelected.cost_per_hour);
        if (rate > 0) {
          //console.log('categid' + newRow.category_id);
          if (budgetRow.category_id == 2) {
            value = rate;
          } else {
            rate = 0;
            //   total = newRow.qty * defaultRate * 22;
          }
        } else {
          //rate = 0;
        }
      }
      setBudgetRow({
        ...budgetRow,
        sub_category_id: categoryId,
        sub_category_name: subCategorySelected.sub_category_name,
        //qty: '',
        value: value,
        // total: '',
        total: budgetRow.qty * value||0,
        unit: 0,
      });
    } else {
      setBudgetRow({
        ...budgetRow,
        sub_category_id: -1,
        sub_category_name: "",
        qty: 0,
        value: 0,
        total: 0,
        unit: 0,
      });
    }

    // else{

    setDisableEdit(false);

    // }
  };
  const calculateTotals = () => {
    return rows.reduce(
      (acc, row) => {
        acc.totalQuantity += row.qty;
        acc.totalValue += row.value;
        acc.totalBudget += row.total;
        return acc;
      },
      { totalQuantity: 0, totalValue: 0, totalBudget: 0 }
    );
  };

  const totals = calculateTotals();
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({
      projectName: "",
      category: "",
      subCategory: "",
      function: "",
      quantity: "",
      costPerHour: "",
      total: "",
      description: "",
    });
   
                      onSubmit("");
  };
const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!budgetRow?.category_id?.toString().trim()) {
      errors.category_id = 'category is required';
    }
    if (!budgetRow?.sub_category_id) {
      errors.sub_category_id = 'sub-category is required';
    }
    if (!budgetRow.total) {
      errors.total = 'budget is required';
    }

    // if (!customer?.contact_first_name?.trim()) {
    //   errors.contact_first_name = 'First Name is required';
    // }
    // if (!customer?.contact_last_name?.trim()) {
    //   errors.contact_last_name = 'Last Name is required';
    // }

    //setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // const handleSubmitRow = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (onSubmit) handleAddRow();
  // };
  // const handleSubmit = () => {
  //   debugger;
  //   if (newRow.total) {
  //     showAlert("Please add details by clicking on Add button.");
  //   } else if (rows.length == 0) {
  //     showAlert("Please add some details before submit.");
  //   } else if (totals.totalBudget !== budgetEstimate) {
  //     setDialogVisible(true);
  //     setConfirmationMessage(
  //       `The calculated total ${formatAmountWithDollarSign(
  //         totals.totalBudget
  //       )}, is not matched with the budget estimate ${formatAmountWithDollarSign(
  //         budgetEstimate
  //       )} provided on Intake Form. Do you want to update the estimate?`
  //     );
  //   } else {
  //     //onClose(totals.totalBudget.toString(), rows, "submit", false); bilal
  //   }
  // };
    const handleSubmit = async () => {
      debugger;

    if (!validateForm()) {
      /* showAlert('Please correct the highlighted errors.'); */
      return;
    }

    try {
      //////////debugger;
      budgetRow.project_id = prj_id;
      console.log(budgetRow);
      //debugger;

      const response = await InsertBudgetDetailsSingle(budgetRow);
      const result = JSON.parse(response);
      showAlert(result.message);
      if (result.status === 'error') {
      }
      console.log('New raid:', result);
      //setRaidSubmitModalVisible(true);
      onSubmit(result.message);
    } catch (error) {
      console.error('Error submitting RAID:', error);
      //alert('Error', 'Failed to submit RAID. Please try again.');
    }
  };
  const fetchCategoriesAndDetails = async () => {
    try {
      setLoading(true);
    
      const response = await GetBudgetCategories("");
      const result = JSON.parse(response);
   setCategories(result.data?.category);
      const fetchedUnits = await new Promise<
        { unit_name: string; unit_id: string }[]
      >((resolve) =>
        setTimeout(
          () =>
            resolve([
              { unit_name: "Hour", unit_id: "Hour" },
              // { unit_name: 'Month', unit_id: 'Month' },
              // { unit_name: 'Year', unit_id: 'Year' },
            ]),
          1000
        )
      );
      const fetchedDefaultRates = await new Promise<
        { unit: string; role: string; rate: string; type: string }[]
      >((resolve) =>
        setTimeout(
          () =>
            resolve([
              { unit: "Hour", role: "3", rate: "50", type: "2" },
              { unit: "Month", role: "4", rate: "0", type: "3" },
            ]),
          1000
        )
      );
      ////debugger;
      setUnits(fetchedUnits);
      setDefaultRates(fetchedDefaultRates);
      //setCategories(result.data?.category);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await GetUserDept(""); // Assuming this function fetches the department data
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        setDepartments(parsedRes.data.departments);
      } else {
        console.error(
          "Failed to fetch Departments",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };
  // const handleCloseDialog = () => {
  //   setDialogVisible(false);
  //   //setSelectedProjectId(null);
  //   onClose(totals.totalBudget, rows, "submit", false);
  // };
  // const handleConfirmDialog = () => {
  //   // if (selectedProjectId !== null) {
  //   //handleDelete(selectedProjectId);
  //   //}
  //   //handleCloseDialog();
  //   setDialogVisible(false);
  //   onClose(totals.totalBudget, rows, "submit", true);
  // };
  
  const loadBudgetData = async (project_id) => {
    try {
      setdataLoading(true);
      const resp = await GetBudgetDetails(project_id);

      const result = JSON.parse(resp);
      if (result?.data?.budget && Array.isArray(result.data.budget)) {
        const rowsWithId = result.data.budget.map(
          (row: any, index: number) => ({
            ...row,
            id: index + 1, // Starts from 1
          })
        );
        setRows(rowsWithId);
        setDisableSubmit(false);
        setdataLoading(false);
      } else {
        console.error("Invalid budget data");
        // Alert.alert("Error", "Invalid budget data received");
        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
      setdataLoading(false);
    }
  };
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      fetchCategoriesAndDetails();
    fetchDepartments();
      loadBudgetData(prj_id);
      debugger;
      if (BudgetRow.category_id) {
           handleCategoryChange(BudgetRow.category_id);
        }
        setSelectedDeptID(BudgetRow.department_id?.toString())
      setBudgetRow(BudgetRow);
    })();
  }, []);
  return (
    <>
      {visible ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-[700px]"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing on outside click
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Budget Calculation</h2>
              {/* <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-red-600 text-lg"
              >
                &times;
              </button> */}
            </div>

            <form
              //method="post"
              onSubmit={(e) => {
                //alert("dsvfdsf");
              e.preventDefault();
              setSubmitted(true);
              handleSubmit();

            }}
              
              className="space-y-4"
              id="budget-form-pm"
              
            >
              {/* <div>
                <label className="font-semibold">Project Name:</label>
                <input
                  required
                  type="text"
                  readOnly
                  name="projectName"
                  value={form.projectName}
                  onChange={handleChange}
                  className="border rounded w-full px-3 py-2 mt-1"
                />
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold">
                    Category <span className="text-red-500">*</span>{" "}
                    <a href="#" onClick={() => undefined}>
                      <span className="text-blue-600 cursor-pointer ml-1">
                        + Add
                      </span>
                    </a>
                  </label>
                  <select
                    required
                    name="category"
                    value={budgetRow.category_id}
                    //onChange={handleChange}
                    onChange={(e) => {
                      handleCategoryChange(parseInt(e.target.value));
                      setParentCategory(parseInt(e.target.value));
                      handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                      <option value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <label style={styles.errorText}>{errors.category}</label>
                  )}
                </div>

                <div>
                  <label className="font-semibold">
                    Sub-Category <span className="text-red-500">*</span>{" "}
                    <a href="#" onClick={() => undefined}>
                      <span className="text-blue-600 cursor-pointer ml-1">
                        + Add
                      </span>
                    </a>
                  </label>
                  <select
                    required
                    name="subCategory"
                    value={budgetRow.sub_category_id}
                    //onChange={handleChange}
                    onChange={(e) => {
                      handleSubCategoryChange(parseInt(e.target.value));
                      handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  >
                    <option value="">Select Sub-Category</option>
                    {categoryDetails.map((cat, index) => (
                      <option value={cat.sub_category_id}>
                        {cat.sub_category_name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryDetail && (
                    <label style={styles.errorText}>
                      {errors.categoryDetail}
                    </label>
                  )}
                </div>

                <div>
                  <label className="font-semibold">Function</label>
                  {/* <select
                    name="function"
                    value={form.function}
                    onChange={handleChange}
                    className="border rounded w-full px-3 py-2 mt-1"
                  >
                    <option value="">Select Function</option>
                  </select> */}
                  <MultiSelectDepartment
                    placeholder="Select Function"
                    departments={departments}
                    selected={
                      selectedDeptID?.toString()?.length > 0
                        ? selectedDeptID?.toString()?.split(",")
                        : []
                    }
                    onChange={async function (
                      selected: string[]
                    ): Promise<void> {
                      const worker = selected?.join(",");
                      handleDeptSelect(worker);
                      setSelectedDeptID(worker);
                    }}
                    multi={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold">Quantity/Hours</label>
                  <input
                    type="number"
                    name="quantity"
                    readOnly={disableEdit}
                    value={budgetRow.qty === 0 ? "" : budgetRow.qty}
                    //onChange={handleChange}
                    onChange={(e) => {
                      setBudgetRow({
                        ...budgetRow,
                        qty: parseFloat(e.target.value) || 0,
                        total: parseFloat(e.target.value) * budgetRow.value || 0,
                      });

                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold">Cost/hour ($)</label>
                  <input
                    type="number"
                    name="costPerHour"
                    value={budgetRow.value === 0 ? "" : budgetRow.value}
                    readOnly={disableEdit}
                    //onChange={handleChange}
                    onChange={(e) => {
                      setBudgetRow({
                        ...budgetRow,
                        value: parseFloat(e.target.value) || 0,
                        total: budgetRow.qty * parseFloat(e.target.value) || 0,
                      });

                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Total ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total"
                    //  value={budgetRow.total}
                    value={budgetRow.total === 0 ? "" : budgetRow.total}
                    //readOnly={disableEdit}
                    required
                    //onChange={handleChange}
                    onChange={(e) => {
                      //debugger;

                      setBudgetRow({
                        ...budgetRow,
                        total: parseFloat(e.target.value) || 0,
                        qty: 0,
                        value: 0,
                      });
                      if (parseFloat(e.target.value) > 0) {
                        setDisableEdit(true);
                      } else {
                        setDisableEdit(false);
                      }
                      setErrors({ ...errors, total: "" });

                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                  {errors.total && (
                    <label style={styles.errorText}>{errors.total}</label>
                  )}
                </div>
              </div>

              <p className="text-sm text-blue-700">
                Quantity and cost are non-mandatory. Total value can be entered
                directly.
              </p>

              <div>
                <label className="font-semibold">Description</label>
                <textarea
                  name="description"
                  value={budgetRow.description}
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    //setBenefitsROI(newTotal);
                    setBudgetRow({
                      ...budgetRow,
                      description: newTotal || "",
                    });
                  }}
                  className="border rounded w-full px-3 py-2 mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => {
                  setSubmitted(true);
                }}
                  // onClick={() => {
                  //   debugger;
                  //   const form = document.getElementById(
                  //     "budget-form-pm"
                  //   ) as HTMLFormElement;

                  //   if (form) //handleAddRow();
                  //   form.requestSubmit(); // ✅ triggers the form's submit handler
                  // }}
                  className="bg-blue-800 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
             
            </form>
          </div>
        </div>
      ) : (
        // <div className="bg-white p-6 rounded shadow-lg w-full max-w-[700px]">
        //   {/* Non-popup inline version */}
        //   <form onSubmit={handleSubmit} className="space-y-4" id="budget-form">
        //     <div>
        //       <label className="font-semibold">Project Name:</label>
        //       <input
        //         required
        //         type="text"
        //         name="projectName"
        //         value={form.projectName}
        //         onChange={handleChange}
        //         className="border rounded w-full px-3 py-2 mt-1"
        //       />
        //     </div>

        //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        //       <div>
        //         <label className="font-semibold">
        //           Category <span className="text-red-500">*</span>
        //         </label>
        //         <select
        //           required
        //           name="category"
        //           value={form.category}
        //           onChange={handleChange}
        //           className="border rounded w-full px-3 py-2 mt-1"
        //         >
        //           <option value="">Select Category</option>
        //         </select>
        //         <a href="#" className="text-sm text-blue-700 mt-1 inline-block">
        //           + Add
        //         </a>
        //       </div>

        //       <div>
        //         <label className="font-semibold">
        //           Sub-Category <span className="text-red-500">*</span>
        //         </label>
        //         <select
        //           required
        //           name="subCategory"
        //           value={form.subCategory}
        //           onChange={handleChange}
        //           className="border rounded w-full px-3 py-2 mt-1"
        //         >
        //           <option value="">Select Sub-Category</option>
        //         </select>
        //         <a href="#" className="text-sm text-blue-700 mt-1 inline-block">
        //           + Add
        //         </a>
        //       </div>

        //       <div>
        //         <label className="font-semibold">Function</label>
        //         <select
        //           name="function"
        //           value={form.function}
        //           onChange={handleChange}
        //           className="border rounded w-full px-3 py-2 mt-1"
        //         >
        //           <option value="">Select Function</option>
        //         </select>
        //       </div>
        //     </div>

        //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        //       <div>
        //         <label className="font-semibold">Quantity/Hours</label>
        //         <input
        //           type="number"
        //           name="quantity"
        //           value={form.quantity}
        //           onChange={handleChange}
        //           className="border rounded w-full px-3 py-2 mt-1"
        //         />
        //       </div>

        //       <div>
        //         <label className="font-semibold">Cost/hour ($)</label>
        //         <input
        //           type="number"
        //           name="costPerHour"
        //           value={form.costPerHour}
        //           onChange={handleChange}
        //           className="border rounded w-full px-3 py-2 mt-1"
        //         />
        //       </div>

        //       <div>
        //         <label className="font-semibold">
        //           Total ($) <span className="text-red-500">*</span>
        //         </label>
        //         <input
        //           type="number"
        //           name="total"
        //           value={form.total}
        //           onChange={handleChange}
        //           className="border rounded w-full px-3 py-2 mt-1"
        //         />
        //       </div>
        //     </div>

        //     <p className="text-sm text-blue-700">
        //       Quantity and cost are non-mandatory. Total value can be entered
        //       directly.
        //     </p>

        //     <div>
        //       <label className="font-semibold">Description</label>
        //       <textarea
        //         name="description"
        //         value={form.description}
        //         onChange={handleChange}
        //         className="border rounded w-full px-3 py-2 mt-1"
        //         rows={3}
        //       />
        //     </div>

        //     <div className="flex justify-end gap-2">
        //       <button
        //         type="button"
        //         onClick={handleReset}
        //         className="bg-gray-300 text-black px-4 py-2 rounded"
        //       >
        //         Reset
        //       </button>
        //       <button
        //         type="button"
        //         onClick={() => {
        //           const form = document.getElementById(
        //             "budget-form"
        //           ) as HTMLFormElement;

        //           if (form) form.requestSubmit(); // ✅ triggers the form's submit handler
        //         }}
        //         className="bg-blue-800 text-white px-4 py-2 rounded"
        //       >
        //         Add
        //       </button>
        //     </div>
        //   </form>
        // </div>
        <></>
      )}

      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
      {/* <ConfirmationBox
        visible={dialogVisible}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDialog}
        message={confirmationMessage}
        isDeleted={false}
        confirmButtonText="Update"
        cancelButtonText="Proceed Without Update"
      /> */}
    </>
  );
};

const styles = {
  errorText: {
    fontSize: 13,
    color: "red",
    marginTop: 4,
  },
};
export default AddBudgetModel;
