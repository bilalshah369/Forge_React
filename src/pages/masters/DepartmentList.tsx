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
import { useLocation, useNavigate } from "react-router-dom";
import { ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { StartProject } from "@/utils/ApprovedProjects";
import HierarchicalTable from "./HierarchicalTable";
import TreeChartWeb from "../charts/Trees/TreeChartWeb";
import TreeMapView from "../TeamMap/TreeMapView";
// import {} from "../TeamMap/TreeMapView.js"
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
interface Department {
  department_id: number;
  department_name: string;
  department_description?: string;
  department_color?: string;
  children?: Department[];
}
const DepartmentList = () => {
  const [shouldFetch, setShouldFetch] = useState(false);
     const [selectedView, setSelectedView] = useState<
        "Tree View" | "Chart View"
      >("Tree View");
  const [departments, setDepartments] = useState<Department[]>([
    {
      department_id: 1,
      department_name: "Head Office",
      department_description: "Main corporate office",
      department_color: "#e0f7fa",
      children: [
        {
          department_id: 2,
          department_name: "HR Department",
          department_description: "Hiring & Employee Management",
          department_color: "#ffe0b2",
          children: [
            {
              department_id: 3,
              department_name: "Recruitment Team",
              department_description: "Handles job postings & interviews",
              department_color: "#f8bbd0",
            },
          ],
        },
        {
          department_id: 4,
          department_name: "IT Department",
          department_description: "Tech & Infrastructure",
          department_color: "#c8e6c9",
        },
      ],
    },
  ]);

  const handleAdd = (parentId: number | null, newDept: Department) => {
    if (parentId === null) {
      setDepartments((prev) => [...prev, newDept]);
    } else {
      const addRecursively = (items: Department[]): Department[] =>
        items.map((item) =>
          item.department_id === parentId
            ? {
                ...item,
                children: [...(item.children || []), newDept],
              }
            : { ...item, children: item.children ? addRecursively(item.children) : [] }
        );
      setDepartments((prev) => addRecursively(prev));
    }
  };

  const handleEdit = (updatedDept: Department) => {
    const editRecursively = (items: Department[]): Department[] =>
      items.map((item) =>
        item.department_id === updatedDept.department_id
          ? { ...updatedDept }
          : { ...item, children: item.children ? editRecursively(item.children) : [] }
      );
    setDepartments((prev) => editRecursively(prev));
  };

  const handleDelete = (id: number) => {
    const deleteRecursively = (items: Department[]): Department[] =>
      items
        .filter((item) => item.department_id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? deleteRecursively(item.children) : [],
        }));
    setDepartments((prev) => deleteRecursively(prev));
  };
  const [alertVisible, setAlertVisible] = useState(false);
  const [message, setMessage] = useState("");
  
  const showAlert = (message: string) => {
    setMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setMessage("");
    //navigation("/PMView");
  };

  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {  
     
    })();
  }, [location]); // Runs again on location change
  return (
    
      <div >
        <div>
          <div className="p-2 min-w-[320px] max-w-[400px] bg-white rounded-md justify-center">
            <div className="inline-flex border border-gray-300 rounded-full overflow-hidden text-sm font-medium shadow-sm">
              <button
                onClick={() => {
                  setSelectedView("Tree View");
                  //fetchProjectsWithFilters(undefined, undefined, {});
                  //setSearchQuery("");
                }}
                className={`px-4 py-2 transition-colors duration-200 ${
                  selectedView === "Tree View"
                    ? "bg-blue-800 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                Tree View
              </button>
              <button
                onClick={() => {
                  setSelectedView("Chart View");
                 
                }}
                className={`px-4 py-2 transition-colors duration-200 ${
                  selectedView === "Chart View"
                    ? "bg-blue-800 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                Chart View
              </button>
            </div>
          </div>
          <div>
{
            selectedView==="Tree View" ?<> <HierarchicalTable
     
       
      /></>:<>
      {/* */}
      <TreeMapView selectedView={selectedView}/><TreeChartWeb shouldFetch={shouldFetch} setShouldFetch={setShouldFetch}/> 
      </>
          }
          </div>
          
       
        </div>
        
        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={message}
        />
      </div>
   
  );
};

export default DepartmentList;
