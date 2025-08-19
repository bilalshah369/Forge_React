import { useState, useEffect } from "react";
//import { TeamItem } from "./TeamItem";
// import { searchTreeNodePath } from "./utils";
// import { cloneDeep } from "lodash";
import TreeModel from "tree-model";
import { TeamItem } from "./TeamItem";
import "./TeamTreeMapStyle.css"
import { GetDept } from "../charts/Trees/Tree";

const config = {
  id: "root",
  name: "root",
  children: [
    {
      id: 4929,
      dashboard_name: "Home",
      dashboard_link: "/master",
      children: [
        {
          id: 4930,
          dashboard_name: "Account Summary",
          dashboard_link: "/master",
          children: []
        },
        {
          id: 4931,
          dashboard_name: "Journey Heatmap",
          dashboard_link: "/master/JourneyCountHeatmap",
          children: []
        },
        {
          id: 4932,
          dashboard_name: "Calendar",
          dashboard_link: "/master/StatsCalendar",
          children: []
        },
        {
          id: 4933,
          dashboard_name: "Covid Sense",
          dashboard_link: "/master/CovidSense",
          children: []
        }
      ]
    },
    {
      id: 4934,
      dashboard_name: "Lane Performance",
      dashboard_link: "/master/Performance/Snapshot",
      children: [
        {
          id: 4935,
          dashboard_name: "Snapshot",
          dashboard_link: "/master/Performance/Snapshot",
          children: []
        },
        {
          id: 4936,
          dashboard_name: "Distribution",
          dashboard_link: "/master/Performance/Distribution",
          children: []
        },
        {
          id: 4937,
          dashboard_name: "Location",
          dashboard_link: "/master/Performance/Locations",
          children: []
        },
        {
          id: 4938,
          dashboard_name: "Punctuality",
          dashboard_link: "/master/Performance/Punctuality",
          children: []
        },
        {
          id: 4939,
          dashboard_name: "Stoppage",
          dashboard_link: "/master/Performance/Stoppage",
          children: []
        },
        {
          id: 4940,
          dashboard_name: "Transport Modes",
          dashboard_link: "/master/Performance/TransportModes",
          children: []
        }
      ]
    },
    {
      id: 4941,
      dashboard_name: "Lane Visibility",
      dashboard_link: "/master/Visibility/LaneSight",
      children: [
        {
          id: 4942,
          dashboard_name: "Lane Sight",
          dashboard_link: "/master/Visibility/LaneSight",
          children: []
        },
        {
          id: 4943,
          dashboard_name: "Lane Comparison",
          dashboard_link: "/master/visibility/LaneComparison",
          children: []
        },
        {
          id: 4944,
          dashboard_name: "Lane Score",
          dashboard_link: "/master/visibility/LaneScore",
          children: []
        },
        {
          id: 4945,
          dashboard_name: "Stoppage Visibility",
          dashboard_link: "/master/visibility/StoppageVisibility",
          children: []
        },
        {
          id: 4946,
          dashboard_name: "Speed Vs Stoppage",
          dashboard_link: "/master/visibility/SpeedStoppage",
          children: []
        }
      ]
    },
    {
      id: 4947,
      dashboard_name: "Multi-Modal Logistics",
      dashboard_link: "/master/MultiModalAnalysis/SpeedLandAirOcean",
      children: [
        {
          id: 4948,
          dashboard_name: "Speed (Land, Air & Ocean)",
          dashboard_link: "/master/MultiModalAnalysis/SpeedLandAirOcean",
          children: []
        },
        {
          id: 4949,
          dashboard_name: "Transit & Dwell Time",
          dashboard_link: "/master/MultiModalAnalysis/TransitDwellTime",
          children: []
        },
        {
          id: 4950,
          dashboard_name: "Distance & Time",
          dashboard_link: "/master/MultiModalAnalysis/DistanceTime",
          children: []
        },
        {
          id: 4951,
          dashboard_name: "Distribution",
          dashboard_link: "/master/MultiModalAnalysis/Distribution",
          children: []
        }
      ]
    },
    {
      id: 4952,
      dashboard_name: "Cold Chain",
      dashboard_link: "/master/ColdChain/Tracking",
      children: [
        {
          id: 4953,
          dashboard_link: "None",
          dashboard_name: "Visibility",
          children: [
            {
              id: 4954,
              dashboard_name: "Temperature Tracking",
              dashboard_link: "/master/ColdChain/Tracking",
              children: []
            },
            {
              id: 4955,
              dashboard_name: "MKT Analysis",
              dashboard_link: "/master/ColdChain/MKTAnalysis",
              children: []
            },
            {
              id: 4956,
              dashboard_name: "Lane Comparison",
              dashboard_link: "/master/ColdChain/Comparison",
              children: []
            },
            {
              id: 4957,
              dashboard_name: "Lane Score",
              dashboard_link: "/master/ColdChain/Score",
              children: []
            },
            {
              id: 4958,
              dashboard_name: "Transporter Performance",
              dashboard_link: "/master/ColdChain/Performance",
              children: []
            }
          ]
        },
        {
          id: 4959,
          dashboard_link: "None",
          dashboard_name: "Analysis",
          children: [
            {
              id: 4960,
              dashboard_name: "Shipments",
              dashboard_link: "/master/ColdChain/Analytics/Shipments",
              children: []
            },
            {
              id: 4961,
              dashboard_name: "Transitions",
              dashboard_link: "/master/ColdChain/Analytics/Transitions",
              children: []
            },
            {
              id: 4962,
              dashboard_name: "Range",
              dashboard_link: "/master/ColdChain/Analytics/Range",
              children: []
            },
            {
              id: 4963,
              dashboard_name: "Transporter Violations",
              dashboard_link: "/master/ColdChain/Analytics/Violations",
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 4964,
      dashboard_name: "Transporters",
      dashboard_link: "/master/Transporters/Summary",
      children: [
        {
          id: 4965,
          dashboard_name: "Summary",
          dashboard_link: "/master/Transporters/Summary",
          children: []
        },
        {
          id: 4966,
          dashboard_name: "Analysis",
          dashboard_link: "/master/Transporters/Analysis",
          children: []
        },
        {
          id: 4967,
          dashboard_name: "Comparision",
          dashboard_link: "/master/Transporters/TransportersComparison",
          children: []
        },
        {
          id: 4968,
          dashboard_name: "JourneyMap",
          dashboard_link: "/master/Transporters/TransportersJourneyMap",
          children: []
        }
      ]
    },
    {
      id: 4969,
      dashboard_name: "Drivers",
      dashboard_link: "/master/Drivers/Summary",
      children: [
        {
          id: 4970,
          dashboard_name: "Summary",
          dashboard_link: "/master/Drivers/Summary",
          children: []
        },
        {
          id: 4971,
          dashboard_name: "Analysis",
          dashboard_link: "/master/Drivers/Analysis",
          children: []
        },
        {
          id: 4972,
          dashboard_name: "Comparision",
          dashboard_link: "/master/Drivers/DriversComparison",
          children: []
        },
        {
          id: 4973,
          dashboard_name: "JourneyMap",
          dashboard_link: "/master/Drivers/DriversJourneyMap",
          children: []
        }
      ]
    },
    {
      id: 4974,
      dashboard_name: "Partners",
      dashboard_link: "/master/Partners/Summary",
      children: [
        {
          id: 4975,
          dashboard_name: "Summary",
          dashboard_link: "/master/Partners/Summary",
          children: []
        },
        {
          id: 4976,
          dashboard_name: "Analysis",
          dashboard_link: "/master/Partners/Analysis",
          children: []
        },
        {
          id: 4977,
          dashboard_name: "Comparision",
          dashboard_link: "/master/Partners/PartnersComparison",
          children: []
        },
        {
          id: 4978,
          dashboard_name: "JourneyMap",
          dashboard_link: "/master/Partners/PartnersJourneyMap",
          children: []
        }
      ]
    },
    {
      id: 4979,
      dashboard_name: "Asset Management",
      dashboard_link: "/master/asset/visibility/AssetSummary",
      children: [
        {
          id: 4980,
          dashboard_name: "Asset Summary",
          dashboard_link: "/master/asset/visibility/AssetSummary",
          children: []
        },
        {
          id: 4981,
          dashboard_name: "Dwell Time Visibility",
          dashboard_link: "/master/asset/visibility/DwellTimeVisibility",
          children: []
        },
        {
          id: 4982,
          dashboard_name: "Asset Cycles",
          dashboard_link: "/master/asset/visibility/AssetCycles",
          children: []
        }
      ]
    },
    {
      id: 4983,
      dashboard_name: "Security & Compliance",
      dashboard_link: "/master/Compliance/Journey",
      children: [
        {
          id: 4984,
          dashboard_name: "Journey Compliance",
          dashboard_link: "/master/Compliance/Journey",
          children: []
        }
      ]
    }
  ]
};

const tree = new TreeModel();
const root = tree.parse(config);
var data = root.all((node) => node.model.dashboard_name);
console.log(data);

const Parent = ({ item, onDragStart, onDragEnd, draggable }) => (
  <div
    className="test"
    // onDragStart={onDragStart}
    // onDragEnd={onDragEnd}
    // draggable={draggable}
  >
    {item.department_id}. {item.department_name}
  </div>
);

export default function TreeMapView() {
  const [path, setPath] = useState([]);
  const [draggableId, setDraggableId] = useState(null);
  const [draggedOverId, setDraggedOverId] = useState(null);
    const [treeData, setTreeData] = useState(null);
  const tree = new TreeModel();
  const root = tree.parse(config);
   const [companyName, setCompanyName] = useState("");
  
    const getCustName = async () => {
      try {
        const res = localStorage.getItem("company_name");
        setCompanyName(res || "Company");
      } catch (err) {
        console.error("Problem finding customer name:", err);
      }
    };

  useEffect(() => {
    document.body.className = "currentapp_hr teams";
  }, []);

  const searchItemPath = (id) =>
    root
      .first((node) => node.model.id === id)
      .getPath()
      .filter((node) => "id" in node.model)
      .map((node) => ({
        id: node.model.id,
        index: node.getIndex()
      }));

  const onItemClick = (item) => {
    const path = searchItemPath(item.id);
    alert(path);
    setPath(path);
  };

  const onItemDragStart = (id) => {
    console.log("drag started");
  };

  const onItemDragEnd = (id) => {
    console.log("drag ended");
  };

  const onItemDrop = (id) => {
    console.log(`draggable item ${draggableId} was dropped into zone ${id}`);
    const dropTarget = root.first((node) => node.model.id === id);
    const droppable = root.first((node) => node.model.id === draggableId);
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
        department_name: companyName || "Company",
        department_color: "black",
        children: rootDepartments.length ? rootDepartments : [],
      };

      setTreeData(forgeTree);
      console.log("forgeTree");
      console.log(forgeTree);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
   useEffect(() => {
      getCustName();
      fetchDepartments();
    }, []);
  return (
    <div className="hr-teams m-5">
      <TeamItem
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
