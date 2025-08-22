/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetMasterDataPM,
} from "@/utils/PM";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DeleteSVG, EditSVG, Monthly_breakdown, ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { GetApprovedProjects, StartProject } from "@/utils/ApprovedProjects";
import { deleteBudgetDetails } from "@/utils/Masters";
import { GetUserDept } from "@/utils/Users";
import { GetBudgetArray } from "@/utils/BudgetPlan";
import { formatAmountWithDollarSign } from "@/utils/util";
import BudgetCalculationForm from "./BudgetCalculationForm";
import AddBudgetModel from "./AddBudgetModel";
import BudgetPlannerResource from "./BudgetPlannerResource";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const options = {
  execute: false,
  cancel: false,
  onHold: false,
  completeAndClose: false,
  movetoapprove: true,
};
interface BudgetPlannerProps {
  projectId: any;
}
interface BudgetRow {
  budget_detail_id: number;
  project_id: number;
  category_id: number;
  sub_category_id: number;
  category_name: string;
  sub_category_name: string;
  qty: number;
  value: number;
  unit: number;
  total: number;
  department_id: number;
  department_name: string;
  description: string;
}
export class BudgetData {
  id?: number;
  budget_detail_id?: number;
  project_id?: number;
  category_id?: number;
  sub_category_id?: number;
  category_name?: string;
  sub_category_name?: string;
  qty?: string;
  value?: string;
  unit?: string;
  total?: string;
  department_id?: string;
  department_name?: string;
  description?: string;
}
const BudgetPlannerNew : React.FC = ({}) => {
     const [searchParams] = useSearchParams();
      const projectId = searchParams.get("projectId");
      const isEditable = searchParams.get("isEditable") === "true";
      const status = parseInt(searchParams.get("status") ?? "");
    const [projectBudgets, setProjectBudgets] = useState<any>([]);
  const [projectsMonthlyBudgets, setProjectMonthlyBudgets] = useState([]);
  const [BudgetmodalVisible, setBudgetModalVisible] = useState(false);
  const [projectObj, setprojectObj] = useState<any>();
  const [rate, setRate] = useState<any>();
  const [totalBudget, setTotalBudget] = useState<any>();
  const [totalBudgetUtilized, setTotalBudgetUtilized] = useState<any>();
  const [budget_detail_id, setBudget_detail_id] = useState<any>();
  const [selectedBudget, setSelectedBudget] = useState<any>(new BudgetData());
  const [totalAllocatedBudget, setTotalAllocatedBudget] = useState<any>();
  const [totalForecastedBudget, setTotalForecastedBudget] = useState<any>();
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: '#',
      key: 'sno',
      visible: true,
      type: 'sno',
      column_width: '40',
      url: 'BudgetPlanner',
      order_no: 1,
    },
    {
      label: 'Proj. ID',
      key: 'customer_project_id',
      visible: true,
      type: '',
      column_width: '75',
      url: 'BudgetPlanner',
      order_no: 2,
    },
    // {
    //   label: 'Project Name',
    //   key: 'project_name',
    //   visible: true,
    //   type: '',
    //   column_width: '200',
    //   url: 'BudgetPlanner',
    //   order_no: 3,
    // },
    // {
    //   label: 'Status',
    //   key: 'status_color',
    //   visible: false,
    //   type: 'status_click',
    //   column_width: '75',
    //   url: 'BudgetPlanner',
    //   order_no: 4,
    // },
    // {
    //   label: 'Progress',
    //   key: 'progress_percentage',
    //   visible: true,
    //   type: 'progress',
    //   column_width: '150',
    //   url: 'BudgetPlanner',
    //   order_no: 5,
    // },

    {
      label: 'Category',
      key: 'category_name',
      visible: true,
      type: '',
      column_width: '150',
      url: 'BudgetPlanner',
      order_no: 6,
    },

    {
      label: 'Sub-Category',
      key: 'sub_category_name',
      visible: true,
      type: '',
      column_width: '150',
      url: 'BudgetPlanner',
      order_no: 7,
    },

    {
      label: 'Function',
      key: 'department_name',
      visible: true,
      type: '',
      column_width: '100',
      url: 'BudgetPlanner',
      order_no: 8,
    },
    {
      label: 'Hours',
      key: 'qty',
      visible: true,
      type: '',
      column_width: '70',
      url: 'PMViBudgetPlannerew',
      order_no: 9,
    },
    {
      label: 'Allocated Budget',
      key: 'total',
      visible: true,
      type: 'cost',
      column_width: '70',
      url: 'BudgetPlanner',
      order_no: 10,
    },
    {
      label: 'Budget Forecast',
      key: 'forcasted_budget',
      visible: true,
      type: 'cost',
      column_width: '70',
      url: 'BudgetPlanner',
      order_no: 11,
    },

    {
      label: 'Action',
      key: 'action',
      visible: true,
      type: 'actions',
      column_width: '70',
      url: 'PMView',
      order_no: 19,
    },
  ]);

  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [subCategoryName, setSub_category_name] = useState('');
  const [sub_category_id, setSub_category_id] = useState('');
  const [activeTabBudget, setActiveTabBudget] = useState(0);
  const [departments, setDepartments] = useState<any>();
      const fetchProjects = async () => {
    const payload = {projectId};
    //console.log('Payload for project API:', payload);
    const response = await GetApprovedProjects(payload);
    const parsedRes = JSON.parse(response);
    //console.log('Get Projects Response:', parsedRes);

    const project = parsedRes.data.projects[0]; // Assuming the first project in the list
    //debugger;
    setprojectObj(project);
    ////debugger;
  };
  const DeleteBudget = async (budgetId: string) => {
    setLoading(true);
    ////debugger;
    const response = await deleteBudgetDetails(parseInt(budgetId));
    //const parsedResponse = JSON.parse(response);
    //console.log(parsedResponse);

    if (response.status === 'success') {
      await fetcharraybudgets();
      setLoading(false);
      showAlert(response.message);
      
    }
  };
  const fetchDepartments = async () => {
    try {
      const response = await GetUserDept(''); // Assuming this function fetches the department data
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') {
        setDepartments(parsedRes.data.departments);
      } else {
        console.error(
          'Failed to fetch Departments',
          parsedRes.message || 'Unknown error',
        );
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };
 const fetcharraybudgets = async () => {
    try {
      debugger;
      const response = await GetBudgetArray(projectId);
      
      const result = JSON.parse(response);
      setProjectBudgets(result?.data ?? []);

      setdataLoading(false);
      setLoading(false);
      
      setTotalAllocatedBudget(formatAmountWithDollarSign(result?.data.reduce((sum, item) => sum + Number(item.total), 0)));
      setTotalForecastedBudget(formatAmountWithDollarSign(result?.data.reduce((sum, item) => sum + Number(item.forcasted_budget), 0)));
      return result?.data;
    
    } catch (error) {
      console.error('Error fetching budgets:', error);
      //Alert.alert('Error', 'Failed to fetch budgets');
    }
  };
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
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
       fetcharraybudgets();
         fetchProjects();
         fetchDepartments();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
          <div className="flex justify-between">
<div className="max-w-md  p-6 bg-white rounded-2xl shadow-lg shadow-blue-500/40 border border-gray-200 m-4">
      
     <div className=" justify-end text-md text-gray-800">
      {/* <h2 className="text-lg font-semibold text-blue-600 space-y-5  ">
               Budget Info.
            </h2> */}
  <p>
    <span className="font-semibold">Project Start Date:</span> {new Date(projectObj?.start_date).toLocaleDateString('en-US')}
  
  
    <span className="font-semibold ml-2">Project End Date:</span> {new Date(projectObj?.end_date).toLocaleDateString('en-US')}
  </p>
  <p>
          <span className="font-semibold">Approved Budget:</span> 
            {projectObj?.actual_budget
                  ? `$${Number(projectObj?.actual_budget).toLocaleString()}`
                  : '$0'}
        </p>
         <p>
          <span className="font-semibold">Total Allocated Budget:</span> {totalAllocatedBudget ? totalAllocatedBudget : '$0'}
        </p>
        <p>
          <span className="font-semibold">Total Budget Forecast:</span> {totalForecastedBudget ? totalForecastedBudget : '$0'}
        </p>
</div>

  
      
    </div> 
     {/* <div className="max-w-md p-6 bg-white rounded-2xl shadow-lg shadow-blue-500/40 border border-gray-200 m-4">
      <h2 className="text-blue-700 font-semibold mb-2">How to Enter Data</h2>
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        <li>Click <span className="font-semibold">+ Add Budget</span> to create a new entry.</li>
        <li>Fill in <span className="font-semibold">Category, Sub-Category, Function, Hours</span> as required.</li>
        <li>Enter the <span className="font-semibold">Allocated Budget</span> and <span className="font-semibold">Forecast</span> values.</li>
        <li>Use the <span className="text-blue-600">📅</span> icon to set the timeline.</li>
        <li>Click <span className="text-green-600">✏️</span> to edit or <span className="text-red-600">🗑️</span> to delete an entry.</li>
        <li>For monthly breakdown, click a row to expand details and update values.</li>
      </ul>
    </div> */}
          </div>
          
   
    {/* <div className="w-full text-right p-4">

      <div className="text-sm text-gray-600">
        <span className="font-semibold">Project Start Date:</span> 12/31/2024 &nbsp;&nbsp;
        <span className="font-semibold">Project End Date:</span> 12/30/2025
      </div>

      <div className="text-gray-800 space-x-4">
        <span className="font-semibold">Approved Budget:</span> $21,675 &nbsp;&nbsp;
        <span className="font-semibold">Total Allocated Budget:</span> $87,062 &nbsp;&nbsp;
        <span className="font-semibold">Total Budget Forecast:</span> $0
      </div>
    </div> */}
          <AdvancedDataTable
           actions={(item) => (
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        debugger;
                        console.log("View", item);
                       setTotalBudget(item.total);
          setRate(item.value);
          setTotalBudgetUtilized(item.budget_utilized);
          setProjectMonthlyBudgets(item.monthwise_budget);
          setBudget_detail_id(item.budget_detail_id);
          setActiveTabBudget(parseInt(item.category_id));
          setSub_category_name(item.sub_category_name);
          setSub_category_id(item.sub_category_id);
                      }}
                    >
                      <Monthly_breakdown
                                      name="alpha-a-box-outline"
                                      height={22}
                                      width={22}
                                     className="[&_path]:fill-white"
                                      //style={styles.IconAction}
                                      // Show select for this index
                                    />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Update Monthly Forecast"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        const iddd = departments?.find(
            m => m.department_name === item?.department_name,
          )?.department_id;
          item.department_id = iddd;
          setSelectedBudget(item);
          //setClassificationName(classification.classification_name);
          setBudgetModalVisible(true);
                      }}
                    >
                      <EditSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Edit"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        if (
                          confirm(
                            "Are you sure you want to delete this Budget details ?"
                          )
                        ) {
                          //handleDelete(parseInt(item.milestone_id ?? "", 10));
                            DeleteBudget(item.budget_detail_id ?? '');
                        }
                      }}
                    >
                      <DeleteSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Delete"}</TooltipContent>
                </Tooltip>
              </div>
            )}
            
            data={projectBudgets}
            columns={headers}
            title="ProjectS Budget"
            exportFileName="Budget projects"
            isCreate={true}
            onCreate={() => {
              setSelectedBudget(new BudgetData())
              setBudgetModalVisible(true)}}
            isPagingEnable={true}
            PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            
            MasterDepartments={departments}
            
            data_type={"Budget"}
          />
          
        </div>
        {activeTabBudget!=0 &&
          <BudgetPlannerResource
              rate={rate}
              sub_category_id={sub_category_id}
              totalBudget={totalBudget}
              projectId={projectId}
              budget_detail_id={budget_detail_id}
              startDate={projectObj?.start_date}
              endDate={projectObj?.end_date}
              budgetType={'Internal'}
              monthlyData={{}}
              resetBudget={async (budget_detail_id: string) => {
                setLoading(true);
                //await insertBudgetDetails1k(projectId, newBudgetRow);

                const newBudget = await fetcharraybudgets();
                const bdgObj: any = newBudget.find(
                  m => m.budget_detail_id === budget_detail_id,
                );
                ////debugger;
                setBudget_detail_id(bdgObj?.budget_detail_id);
                setActiveTabBudget(parseInt(bdgObj?.category_id));
                setProjectMonthlyBudgets(bdgObj?.monthwise_budget);
              }}
              monthwise_budget={projectsMonthlyBudgets}
              categoryName={
                projectBudgets?.find(m => m.category_id === activeTabBudget)
                  ?.category_name
              }
              subCategoryName={subCategoryName}
              onClose={() => {
                debugger;
                setActiveTabBudget(0);
              }}
            />}
        {BudgetmodalVisible && (
                          <AddBudgetModel
                            prj_id={parseInt(projectId)}
          visible={BudgetmodalVisible}
          onSubmit={async (res:string) => {
            setLoading(true);
            //await insertBudgetDetails1k(projectId, newBudgetRow);
            fetcharraybudgets();
            setBudgetModalVisible(false);
            if(res)
            showAlert(res);
          }}
          BudgetRow={selectedBudget}
                          />
                        )}
        {/* {decisionModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-2">Decision</h2>

              {selectedProjectName && (
                <p className="mb-4 text-gray-700">
                  Project Name -{" "}
                  <span className="font-normal">{selectedProjectName}</span>
                </p>
              )}

              <select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              >
                {options.execute && <option value="14">Execute</option>}
                {options.cancel && <option value="25">Cancel</option>}
                {options.onHold && <option value="26">On Hold</option>}
                {options.completeAndClose && (
                  <option value="32">Complete & Close</option>
                )}
                {options.movetoapprove && (
                  <option value="5">Move to approved</option>
                )}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDecisionModalVisible(false);
                  }}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )} */}
         <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={alertMessage}
        /> 
      </div>
    </div>
  );
};

export default BudgetPlannerNew;
