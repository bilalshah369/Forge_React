import { useState, useEffect } from "react";
//import { TeamItem } from "./TeamItem";
// import { searchTreeNodePath } from "./utils";
// import { cloneDeep } from "lodash";
import TreeModel from "tree-model";
import { DepartmentItem } from "./DepartmentItem";
import "./TeamTreeMapStyle.css"
import { GetDept } from "../charts/Trees/Tree";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// const tree = new TreeModel();
// const root = tree.parse(config);
// var data = root.all((node) => node.model.dashboard_name);
// console.log(data);

const Parent = ({ item, onDragStart, onDragEnd, draggable }) => {
  debugger;
  
 return (
  // <div style={{backgroundColor:item.department_color,color:'white',}}
  //   className="test shadow-lg shadow-blue-500/40 rounded"
  //   // onDragStart={onDragStart}
  //   // onDragEnd={onDragEnd}
  //   // draggable={draggable}
  // >
  //   {item.department_id}. {item.department_name}
  // </div>
  
  <div 
  style={{ backgroundColor: item.department_color, color: "white" ,minWidth:300,height:item.department_id ===undefined ?60:160}}
  className="test shadow-lg shadow-blue-500/40 rounded p-4 flex flex-col 
             transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl"
>
  {item.department_id ===undefined ?<><div className="font-bold text-lg">{item.department_name}</div></>:<><div className="font-bold text-lg">Department Name : {item.department_name}</div>
  {/* <div className="text-sm opacity-90">ID: {item.department_id}</div> */}
  
  <div className="mt-2 text-sm">
    <p>Manager: {item.manager_name || "N/A"}</p>
    <p>Projects: {item.active_projects || 0}</p>
    <p>Employees: {item.employee_count || 0}</p>
  </div></>}
  

  {/* Budget Progress Example */}
  {/* <div className="mt-2">
    <p className="text-xs">Budget Utilization</p>
    <div className="w-full bg-gray-200 h-2 rounded">
      <div
        className="bg-green-500 h-2 rounded"
        style={{ width: `${item.budget_utilization || 0}%` }}
      ></div>
    </div>
  </div> */}
</div>
)};

export default function TreeMapView({selectedView}) {
  const [path, setPath] = useState([]);
  const [draggableId, setDraggableId] = useState(null);
  const [draggedOverId, setDraggedOverId] = useState(null);
    const [treeData, setTreeData] = useState(null);
   const config = {
  id: "root",
  name: "root",
  children: treeData ? [treeData] : []
};
  const tree = new TreeModel();
  const root = tree.parse(config);
   const [companyName, setCompanyName] = useState("");
  
    const getCustName = async () => {
      try {
        //debugger;
        const res = localStorage.getItem("company_name");
        setCompanyName(res?.toString());
      } catch (err) {
        console.error("Problem finding customer name:", err);
      }
    };

  useEffect(() => {
    document.body.className = "currentapp_hr teams";
  }, []);

  const searchItemPath = (department_id) =>
    root
      .first((node) => node.model.department_id === department_id)
      .getPath()
      .filter((node) => "department_id" in node.model)
      .map((node) => ({
        department_id: node.model.department_id,
        index: node.getIndex()
      }));

  const onItemClick = (item) => {
    const path = searchItemPath(item.department_id);
    alert(path);
    setPath(path);
  };

  const onItemDragStart = (department_id) => {
    console.log("drag started");
  };

  const onItemDragEnd = (department_id) => {
    console.log("drag ended");
  };

  const onItemDrop = (department_id) => {
    console.log(`draggable item ${draggableId} was dropped into zone ${department_id}`);
    const dropTarget = root.first((node) => node.model.department_id === department_id);
    const droppable = root.first((node) => node.model.department_id === draggableId);
    const node = tree.parse(droppable.model);
    dropTarget.addChild(node);
    droppable.drop();
  };
 const fetchDepartments = async () => {
    try {
      const response = await GetDept("");
      const result = await JSON.parse(response);

      if (!result?.data?.departments) return;

      const activeDepartments = result.data.departments.filter(
        (dept) => dept.is_active === true
      );

      const departmentMap = new Map(
        activeDepartments.map((dept) => [
          dept.department_id,
          {
            ...dept,
            children: [],
            department_color: dept.department_color || "lightgray",
          },
        ])
      );

      activeDepartments.forEach((dept) => {
        if (dept.parent_department_id) {
          const parent = departmentMap.get(dept.parent_department_id);
          if (parent) {
            parent.children.push(departmentMap.get(dept.department_id));
          }
        }
      });

      const rootDepartments = activeDepartments
        .filter((dept) => dept.parent_department_id === null)
        .map((dept) => departmentMap.get(dept.department_id));

      const forgeTree = {
        department_name: companyName || localStorage.getItem("company_name"),
        department_color: "gray",
        children: rootDepartments.length ? rootDepartments : [],
      };

      setTreeData(forgeTree);
      console.log("forgeTree");
      console.log(forgeTree);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
   
    const location = useLocation();
      const navigation = useNavigate();
      useEffect(() => {
        (async function () {
          await getCustName();
      fetchDepartments();
        })();
      }, [selectedView]); // Runs again on location change
  return (
    <div className="hr-teams m-5">
      <DepartmentItem
        items={root.model.children}
        onItemClick={onItemClick}
        selectedPath={path}
        onItemDragStart={onItemDragStart}
        onItemDragEnd={onItemDragEnd}
        onItemDrop={onItemDrop}
        itemNode={Parent}
        searchItemPath={searchItemPath}
        draggableId={draggableId}
        setDraggableId={setDraggableId}
        draggedOverId={draggedOverId}
        setDraggedOverId={setDraggedOverId} allItemsDraggable={undefined}      />
      {/* <div
        className="dropzone"
        onDrop={onDropZoneDrop}
        onDragOver={onDropZoneDraggedOver}
      /> */}
    </div>
  );
}
