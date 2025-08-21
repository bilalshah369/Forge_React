/* eslint-disable no-empty */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import AlertBox from "@/components/ui/AlertBox";
import ConfirmationBox from "@/components/ui/ConfirmationBox";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import { GetROIDetails } from "@/utils/Intake";
import { formatAmountWithoutDollarSign } from "@/utils/util";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProjectROI {
  project_roi_id?: number;
  project_id?: number;
  total_capex: number;
  total_opex?: number;
  total_investment?: number;
  annual_benefits?: number;
  annual_cost?: number;
  net_annual_benefits?: number;
  roi_percent?: number;
  payback_period?: string;
  breakeven_point?: number;
  comment?: string;
  customer_id?: number;
}

interface ProjectROIFormModalProps {
  isPopup?: boolean;
  isVisible: boolean;
  onClose: (rOIData: ProjectROI, actionType: string) => void;
  projectId: number;
  projectName: string;
  data: ProjectROI;
}
// const validationSchema = Yup.object().shape({
//   total_capex: Yup.string().required("Total Capex is required"),
//   // .min(0, 'Value must be non-negative'),
//   total_opex: Yup.string().required("Total Opex is required"),
//   //.min(0, 'Value must be non-negative'),
//   annual_benefits: Yup.string().required("Annual Benefits are required"),
//   //.min(0, 'Value must be non-negative'),
//   annual_cost: Yup.string().required("Annual Cost is required"),
//   //.min(0, 'Value must be non-negative'),
//   net_annual_benefits: Yup.string().required(
//     "Net Annual Benefits are required"
//   ),
//   total_investment: Yup.string().required("Total investment is required"),
//   //.min(0, 'Value must be non-negative'),
//   roi_percent: Yup.string().required("ROI Percent is required"),
//   //.min(0, 'Value must be non-negative'),
//   payback_period: Yup.string().required("Payback Period is required"),
//   breakeven_point: Yup.string().required("Break-Even Period is required"),
//   comment: Yup.string(),
// });

const ROICalculationForm: React.FC<ProjectROIFormModalProps> = ({
  isVisible,
  onClose,
  projectId,
  projectName,
  data,
  isPopup,
}) => {
  const [projectROIData, setProjectROIData] = useState<ProjectROI>({
    project_roi_id: 0,
    project_id: projectId,
    total_capex: 0,
    total_opex: 0,
    total_investment: 0,
    annual_benefits: 0,
    annual_cost: 0,
    net_annual_benefits: 0,
    roi_percent: 0,
    payback_period: "",
    breakeven_point: 0,
    comment: "",
    customer_id: 0,
  });
  const calculateDerivedFields = (
    field: "total_capex" | "total_opex" | "annual_benefits" | "annual_cost",
    value: number
  ) => {
    const updatedValues = { ...projectROIData, [field]: value };
    //console.log(updatedValues.total_capex);
    //console.log(updatedValues.total_opex);
    ////debugger;
    const totalInvestment =
      parseFloat(updatedValues.total_capex?.toString()) +
      parseFloat(updatedValues.total_opex?.toString());
    //console.log(totalInvestment);
    const netAnnualBenefits =
      parseFloat(String(updatedValues.annual_benefits)) -
      parseFloat(String(updatedValues.annual_cost));

    // ROI (Return on Investment) in percentage
    const roiPercent =
      totalInvestment > 0
        ? ((netAnnualBenefits / totalInvestment) * 100).toFixed(2)
        : 0;

    // Break Even Point (in years)
    const breakevenPoint =
      netAnnualBenefits > 0
        ? (totalInvestment / netAnnualBenefits).toFixed(2)
        : 0;

    // Payback Period (in years and months)
    const paybackYears = Math.floor(
      parseFloat(breakevenPoint?.toString()) || 0
    );
    const paybackMonths = Math.round(
      ((parseFloat(breakevenPoint?.toString()) || 0) - paybackYears) * 12
    );
    const paybackPeriod =
      paybackYears > 0 || paybackMonths > 0
        ? `${paybackYears} Years, ${paybackMonths} Months`
        : "";
    setProjectROIData({
      ...updatedValues,
      total_investment: totalInvestment,
      net_annual_benefits: netAnnualBenefits,
      roi_percent: parseFloat(roiPercent?.toString()),
      breakeven_point: parseFloat(breakevenPoint?.toString()),
      payback_period: paybackPeriod?.toString(),
    });
  };
  const loadROIData = async (project_id: any) => {
    try {
      const resp = await GetROIDetails(project_id);
      const result = JSON.parse(resp);
      if (
        result?.data?.project_rois &&
        Array.isArray(result.data.project_rois)
      ) {
        setProjectROIData(result.data.project_rois[0]);
        //console.log(result.data.project_rois[0]);
      } else {
        console.error("Invalid budget data");
        // alert('Invalid budget data received');
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    ////debugger;
    e.preventDefault(); // ✅ critical to prevent reload
    e.stopPropagation();
    try {
      ////debugger;

      onClose(projectROIData, "submit");

      ////console.log('roi_values' + values.total_capex);
    } catch (error) {}
  };
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      ////debugger;
      if (
        data.roi_percent !== 0 &&
        data.roi_percent !== 0 &&
        data.roi_percent !== null &&
        data.roi_percent !== undefined
      ) {
        //console.log(data.total_capex);
        setProjectROIData(data);
      } else {
        (async function () {
          //console.log('porjId' + projectId)
          await loadROIData(projectId);
        })();
        return () => {};
      }
    })();
  }, []);
  return (
    <>
      {" "}
      {isPopup ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-[800px]"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing on outside click
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Calculate the Return on Investment (ROI)
              </h2>
              {/* <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-red-600 text-lg"
              >
                &times;
              </button> */}
            </div>

            <form
              method="post"
              onSubmit={handleSubmit}
              //onSubmit={handleSubmit}
              className="space-y-4"
              id="roi-form"
            >
              <div>
                <label className="font-semibold">Project Name:</label>
                <input
                  required
                  type="text"
                  readOnly
                  name="projectName"
                  value={projectName}
                  //onChange={handleChange}
                  className="border rounded w-full px-3 py-2 mt-1"
                />
              </div>
              <h2 className="text-lg font-semibold text-blue-600 mb-4">
                Initial Investment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold">
                    CapEx ($) <span className="text-red-500">*</span>{" "}
                  </label>
                  <input
                    type="number"
                    required
                    name="total_capex"
                    // value={projectROIData.total_capex}
                    value={
                      projectROIData.total_capex === 0
                        ? ""
                        : projectROIData.total_capex
                    }
                    //onChange={handleChange}
                    onChange={(e) => {
                      ////debugger;
                      const value = e.target.value.replace(/[^0-9]/g, "") || "";
                      setProjectROIData({
                        ...projectROIData,
                        total_capex: parseFloat(value),
                      });

                      calculateDerivedFields("total_capex", parseFloat(value));
                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold">OpEx ($)</label>
                  <input
                    required
                    type="number"
                    name="total_opex"
                    value={
                      projectROIData.total_opex === 0
                        ? ""
                        : projectROIData.total_opex
                    }
                    //onChange={handleChange}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "") || "";
                      setProjectROIData({
                        ...projectROIData,
                        total_opex: parseFloat(value),
                      });

                      calculateDerivedFields("total_opex", parseFloat(value));
                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Total Initial Investment ($)
                  </label>
                  <input
                    required
                    type="number"
                    readOnly
                    name="total_investment"
                    value={
                      projectROIData.total_investment === 0
                        ? ""
                        : projectROIData.total_investment
                    }
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-blue-600 mb-4">
                Net Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold">
                    Gross Annual Benefits ($)
                  </label>
                  <input
                    required
                    type="number"
                    name="annual_benefits"
                    value={
                      projectROIData.annual_benefits === 0
                        ? ""
                        : projectROIData.annual_benefits
                    }
                    //onChange={handleChange}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "") || "";
                      setProjectROIData({
                        ...projectROIData,
                        annual_benefits: parseFloat(value),
                      });

                      calculateDerivedFields(
                        "annual_benefits",
                        parseFloat(value)
                      );
                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Annual Operating Cost ($)
                  </label>
                  <input
                    required
                    type="number"
                    name="annual_cost"
                    value={
                      projectROIData.annual_cost === 0
                        ? ""
                        : projectROIData.annual_cost
                    }
                    //onChange={handleChange}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "") || "";
                      setProjectROIData({
                        ...projectROIData,
                        annual_cost: parseFloat(value),
                      });

                      calculateDerivedFields("annual_cost", parseFloat(value));
                      //handleChange(e);
                    }}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Net Annual Benefits ($){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    readOnly
                    name="net_annual_benefits"
                    value={formatAmountWithoutDollarSign(
                      projectROIData.net_annual_benefits
                    )}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-blue-600 mb-4">ROI</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold">ROI (%)</label>
                  <input
                    required
                    type="number"
                    readOnly
                    name="roi_percent"
                    value={
                      projectROIData.roi_percent === 0
                        ? ""
                        : projectROIData.roi_percent
                    }
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">
                    Break-Even Period (Years)
                  </label>
                  <input
                    required
                    type="number"
                    readOnly
                    name="breakeven_point"
                    value={
                      projectROIData.breakeven_point === 0
                        ? ""
                        : projectROIData.breakeven_point
                    }
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">
                    Payback Period (Years, Months)
                  </label>
                  <input
                    disabled
                    type="text"
                    readOnly
                    name="payback_period"
                    value={projectROIData.payback_period}
                    className="border rounded w-full px-3 py-2 mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold">Remarks</label>
                  <input
                    type="text"
                    name="comment"
                    value={projectROIData.comment}
                    className="border rounded w-full px-3 py-2 mt-1"
                    onChange={(e) => {
                      const value = e.target.value;
                      setProjectROIData({
                        ...projectROIData,
                        comment: value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose(projectROIData, "");
                  }}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ////debugger;
                    const form = document.getElementById(
                      "roi-form"
                    ) as HTMLFormElement;

                    if (form) form.requestSubmit(); // ✅ triggers the form's submit handler
                  }}
                  className="bg-blue-800 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // <div className="bg-white p-6 rounded shadow-lg w-full max-w-[700px]">
        //   {/* Non-popup inline version */}
        //   <form onSubmit={handleSubmit} className="space-y-4" id="roi-form">
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
        //             "roi-form"
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
export default ROICalculationForm;
