/* eslint-disable no-var */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
// import {GetUserPermission} from '../../database/Users';
import { decodeBase64 } from "../../utils/securedata";
import { GetUserPermission } from "@/utils/Users";
declare global {
  interface Window {
    handleStatusClick: (projectId: string, status: string) => void;
    handleProjectClick: (projectId: string, type: string) => void;
  }
}
interface ChartProps {
  data: any;
  start_date: any;
  end_date: any;
  chat_view: string;
}
const ResourceRoadmapGantt: React.FC<ChartProps> = ({
  data,
  chat_view,
  end_date,
  start_date,
}) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState(chat_view);
  const [viewingProject, setViewingProject] = useState("");
  gantt.config.columns = [
    { name: "s_no", label: "S. No", align: "center", width: 70 },
    {
      name: "text",
      label: "Resource Name",
      width: 200,
      resize: true,
      template: (task) => {
        const projectName = task?.text?.toString().trim() || "";
        return `
          <div id="showingtool">
          ${projectName}
          </div>
        `;
      },
    },
  ];
  const [permissions, setPermissions] = useState<number[]>([]);
  const fetchUserPermission = async () => {
    try {
      const userID = localStorage.getItem("ID");

      const response = await GetUserPermission(decodeBase64(userID || ""));
      const parsedRes = JSON.parse(response);
      //////debugger;
      if (parsedRes.status === "success") {
        //console.log(`Permissions of ${userID} fetched successfully`, parsedRes);
        if (parsedRes.data.user_permissions.length > 0) {
          setPermissions(
            parsedRes.data.user_permissions.map((p) => p.permission_id)
          );
        }
      } else {
        console.error(
          "Failed to fetch user roles:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
    }
  };
  useEffect(() => {
    if (ganttContainer.current) {
      fetchUserPermission();
      gantt.clearAll();
      console.log(gantt.version);

      applyTaskColors();
      gantt.init(ganttContainer.current);
      applyCustomStyles(); // Apply custom styles
      console.log(data);
      loadTasks();
      updateScale(chat_view);
      let tasks = gantt.getTaskByTime();

      if (tasks.length > 0) {
        let startDates = tasks.map((task1) =>
          new Date(task1.start_date).getTime()
        );
        startDates = startDates.filter((task1) => task1 !== 0);
        let earliestStartDate = new Date(Math.min(...startDates));
        gantt.showDate(earliestStartDate);
      }
      const container = ganttContainer.current;
      if (container) {
        container.addEventListener("mouseleave", handleMouseLeave);
      }
    }

    // Function to check if the mouse exits the Gantt container
    function handleMouseLeave() {}
    return () => {
      gantt.detachEvent("onTaskClick");
      gantt.detachEvent("onTaskCreated");
      gantt.detachEvent("onMouseLeave");
      gantt.detachEvent("onDataRender");
      gantt.detachEvent("onGanttReady");
      gantt.detachEvent("onTaskDrag");
      gantt.detachEvent("onAfterTaskUpdate");
      gantt.detachEvent("onTaskSelected");
      gantt.detachEvent("onScroll");
      gantt.detachEvent("onGanttScroll");
      gantt.detachEvent("onBeforeTooltip");
      gantt.detachEvent(gantt._myClickHandler);
      // gantt.detachAllEvents() && gantt.detachAllEvents();
    };
  }, [chat_view, currentView, start_date, data]);

  gantt.config.readonly = true;
  const strToDate = gantt.date.str_to_date("%Y-%m-%d");
  gantt.config.start_date =
    start_date === "" ? new Date(2020, 1, 1) : strToDate(start_date); // March 1, 2025 (Months are 0-based)
  gantt.config.end_date =
    end_date === "" ? new Date(2026, 5, 30) : strToDate(end_date); // June 30, 2025

  gantt.config.min_column_width = 100; // Increase minimum width of timeline columns
  gantt.config.row_height = 40; // Increase row height for better readability

  //Dependencie
  gantt.config.show_links = false; // Hide links initially
  gantt.config.show_task_links = false; // Hide links inside tasks

  const fallbackStart = new Date(Date.now());
  const fallbackEnd = new Date(Date.now());

  if (gantt._myClickHandler) {
    gantt.detachEvent(gantt._myClickHandler);
  }

  gantt._myClickHandler = gantt.attachEvent("onTaskClick", function (id, e) {
    const scrollState = gantt.getScrollState();
    let task1 = gantt.getTask(id);
    console.log("Task Clicked:", task1);
    if (!task1) {
      return true;
    }

    if (task1.start_date.getTime() === fallbackStart.getTime()) {
      return false;
    }

    if (task1.type !== "project") {
      var task: any[] = [];
      var links: any[] = [];
      data.forEach((element: any, index: any) => {
        task.push({
          s_no: index + 1,
          id: element.resource_id,
          text: element.name,
          start_date: element.first_start_date
            ? new Date(element.first_start_date)
            : fallbackStart,
          end_date: element.last_end_date
            ? new Date(element.last_end_date)
            : fallbackEnd,
          department_id: element.department_id,
          department_name: element.department_name,
          department_color: element.department_color,

          // ✅ Milestones Mapping
          projects:
            element.projects && element.projects.project_id !== null
              ? element.projects.map((milestone: any) => ({
                  project_id: milestone.project_id,
                  project_name: milestone.project_name,
                  start_date: new Date(milestone.start_date),
                  end_date: new Date(milestone.end_date),
                  role_type: milestone.role_type,
                  util_percentage: milestone.utilization_percentage,
                  status: milestone.status,
                  status_name: milestone.status_name,
                  status_color: milestone.status_color,
                  department_id: milestone.department_id,
                  department_name: milestone.department_name,
                  department_color: milestone.department_color,
                }))
              : [],
        });
        if (element.resource_id?.toString() === id) {
          if (viewingProject !== id) {
            setViewingProject(id);
            element?.projects?.forEach((milestone) => {
              task.push({
                s_no: "",
                project_id: milestone.project_id,
                project_name: milestone.project_name,
                text: milestone.project_name,
                start_date: new Date(milestone.start_date),
                end_date: new Date(milestone.end_date),
                role_type: milestone.role_type,
                util_percentage: milestone.utilization_percentage,
                status: milestone.status,
                status_name: milestone.status_name,
                status_color: milestone.status_color,
                department_id: milestone.department_id,
                department_name: milestone.department_name,
                department_color: milestone.department_color,
                type: "project",
              });
              links.push({
                id: "link_" + milestone.project_id,
                source: element.resource_id,
                target: "mile_" + milestone.project_id,
                type: "0",
              });
            });
          } else {
            setViewingProject("");
          }
        }
      });
      console.log(task);
      gantt.clearAll();
      gantt.parse({
        data: task,
        links: links,
      });
      gantt.scrollTo(scrollState.x, scrollState.y);
    }

    return true;
  });

  gantt.attachEvent("onBeforeTooltip", function (taskId) {
    const activeElement = document.querySelector(".gantt_cell:hover");
    if (activeElement?.innerHTML?.includes("showingtool")) {
      return true;
    } else {
      return false;
    }
  });

  gantt.attachEvent("onTaskCreated", function (task) {
    return false; // Prevents new task creation
  });

  function applyTaskColors() {
    gantt.eachTask(function (task) {
      const taskElement = document.querySelector(
        `.gantt_task_line[task_id="${task.id}"]`
      );
      if (taskElement) {
        taskElement.style.backgroundColor = task.department_color || "#B5DC9D";
        const progressBar = taskElement.querySelector(".gantt_task_progress");
        if (progressBar) {
          progressBar.style.backgroundColor =
            task.department_color || "#6CBA3B";
        }
      }
    });
    gantt.ext.tooltips.tooltip.hide();
  }

  gantt.attachEvent("onDataRender", function () {
    applyTaskColors();
  });
  gantt.attachEvent("onGanttReady", function () {
    let tasks = gantt.getTaskByTime();

    if (tasks.length > 0) {
      let startDates = tasks.map((task) => new Date(task.start_date).getTime());
      let earliestStartDate = new Date(Math.min(...startDates));

      gantt.showDate(earliestStartDate);
    }

    // Collapse all tasks when the chart loads
    gantt.eachTask(function (task: { id: string }) {
      gantt.collapse(task.id);
    });
    applyTaskColors();
  });

  gantt.attachEvent("onTaskDrag", applyTaskColors);
  gantt.attachEvent("onAfterTaskUpdate", applyTaskColors);
  gantt.attachEvent("onTaskSelected", applyTaskColors);
  gantt.attachEvent("onScroll", applyTaskColors);
  gantt.attachEvent("onGanttScroll", applyTaskColors);
  const updateScale = (scale: string) => {
    if (scale === "day") {
      gantt.config.scale_unit = "day";
      gantt.config.date_scale = "Week %W";
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D, %d %M" }];
    } else if (scale === "week") {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%M - %Y";
      gantt.config.subscales = [
        {
          unit: "week",
          step: 1,
          date: function (date: Date) {
            const startDate = gantt.date.week_start(new Date(date));
            const month = startDate.getMonth() + 1; // JS months are 0-indexed
            const day = startDate.getDate();
            const weekNumber = gantt.date.getISOWeek(startDate); // Get ISO week number
            return `${month}/${day}, Wk-${weekNumber}`;
          },
        },
      ];
    } else if (scale === "month") {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.subscales = [
        {
          unit: "month",
          step: 1,
          date: "%M",
        },
      ];
    } else if (scale === "year") {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.smart_rendering = true;
      gantt.config.subscales = [];
    } else if (scale === "quarter") {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.subscales = [
        {
          unit: "month",
          step: 3,
          date: (date: Date) => {
            const month = date.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            return `Q${quarter}`;
          },
        },
      ];
    }

    gantt.render();
  };

  gantt.plugins({ tooltip: true }); // Enable tooltip plugin
  gantt.templates.tooltip_text = (start, end, task) => {
    if (task.type === "project") {
      return `
        <div class="gantt-tooltip">
          <div class="tooltip-header"><b>${task.text ?? ""}</b></div>
          <div class="tooltip-body">
            <div><b>Start Date:</b> ${gantt.date.date_to_str("%m/%d/%Y")(
              task.start_date
            )}</div>
            <div><b>End Date:</b> ${gantt.date.date_to_str("%m/%d/%Y")(
              task.end_date
            )}</div>
            <div><b>Role Type:</b> ${task.role_type || "N/A"}</div>
            <div><b>Utilization Percentage:</b> ${
              task.util_percentage + "%" || "N/A"
            }</div>
             <div><b>Function:</b> ${task.department_name || "N/A"}</div>
          <div class="tooltip-footer" style="background-color:${
            task.status_color || "#ccc"
          };">
            <b>Status:</b> ${task.status_name || "N/A"}
          </div>
        </div>
      `;
    }
    return `<div class="gantt-tooltip">
            <div class="tooltip-header">
              <b>${task.text}</b>
            </div>
            <div class="tooltip-body">
              <div><b>First Start Date:</b> ${gantt.date.date_to_str(
                "%m/%d/%Y"
              )(task.start_date)}</div>
              <div><b>Last End Date:</b> ${gantt.date.date_to_str("%m/%d/%Y")(
                task.end_date
              )}</div>
               <div><b>Function:</b> ${task.department_name || "N/A"}</div>
            </div>
          </div>`;
  };

  gantt.templates.task_row_class = function (start, end, task) {
    const hasLinks =
      (task.$source?.length || 0) > 0 || (task.$target?.length || 0) > 0;

    if (hasLinks) {
      return "link-connected-row";
    }
    return "";
  };
  gantt.templates.task_class = function (start, end, task) {
    let hasPredecessor = gantt
      .getLinks()
      .some((link) => link.target === task.id);
    return hasPredecessor ? "task-with-diamond" : "";
  };

  gantt.templates.task_text = function (start, end, task) {
    if (task.type === "project") {
      return `<div style="color: white; padding-left: 5px;">
                ${task.project_name}
            </div>`;
    }
    return ``;
  };

  gantt.templates.task_class = function (start, end, task) {
    if (
      task.type !== "project" &&
      task.start_date.getTime() === fallbackStart.getTime()
    ) {
      return "invisible-task";
    }
    return "";
  };

  // Load Sample Data
  const loadTasks = () => {
    var task: any[] = [];
    var links: any[] = [];

    data.forEach((element: any, index: any) => {
      task.push({
        s_no: index + 1,
        id: element.resource_id,
        text: element.name,
        start_date: element.first_start_date
          ? new Date(element.first_start_date)
          : fallbackStart,
        end_date: element.last_end_date
          ? new Date(element.last_end_date)
          : fallbackEnd,
        department_id: element.department_id,
        department_name: element.department_name,
        department_color: element.department_color,

        // ✅ Projects Mapping
        projects:
          element.projects && element.projects.project_id !== null
            ? element.projects.map((milestone: any) => ({
                project_id: milestone.project_id,
                text: milestone.project_name,
                project_name: milestone.project_name,
                start_date: new Date(milestone.start_date),
                end_date: new Date(milestone.end_date),
                role_type: milestone.role_type,
                util_percentage: milestone.utilization_percentage,
                status: milestone.status,
                status_name: milestone.status_name,
                status_color: milestone.status_color,
                department_id: milestone.department_id,
                department_name: milestone.department_name,
                department_color: milestone.department_color,
              }))
            : [],
      });
    });
    console.log(task);
    gantt.parse({
      data: task,
      links: links,
    });
  };

  const applyCustomStyles = () => {
    // ✅ Change Header Background & Text Color
    gantt.templates.scale_cell_class = () => "custom-header";
    applyTaskColors();
  };

  return (
    <div style={{ height: 450, overflow: "clip" }}>
      {/* Gantt Chart */}

      <div ref={ganttContainer} style={{ width: "100%", height: "100%" }} />

      {/* Custom CSS */}
      <style>
        {`
        .gantt-tooltip
        {
        width:300px  !important;
        overflow:hidden !important;
        }
         .tooltip-body{
        overflow:hidden !important;
        }
.link-connected-row {
  background-color: #fffbe6 !important;
}
.gantt_task_line {
    height: 25px !important; /* Set fixed height */
    margin-top: 3px !important; /* Center inside the row */
}
    .gantt_scale_cell {
    font-weight: bold !important;
    color: black !important;
}

/* Change tooltip background color */
.gantt_tooltip {
  background: #ffffff !important; /* White background */
  color: #333 !important; /* Dark text for readability */
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  min-width: 250px;
}
.milestone-circle {
    width: 10px;
    height: 10px;
    background-color: red;  /* Change to desired color */
    border-radius: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid white;
}
.tooltip-header {
  font-size: 16px;
  font-weight: bold;
  color: #004080;
  margin-bottom: 5px;
  white-space: normal !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}

.tooltip-body div {
  margin-bottom: 4px;
}

.tooltip-footer {
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  padding: 5px;
  border-radius: 5px;
  color: white;
}

        /* Status circle inside the Gantt grid */
.status-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%; /* Makes it a circle */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor:pointer
}

/* Change font for the entire Gantt chart */
.gantt_container {
    font-family: 'Roboto', sans-serif !important; 
    font-size: 14px !important;
    overflow: auto !important;
}

/* Ensure the Gantt grid is scrollable */
.gantt_grid {
    min-width: 500px !important;
    overflow-x: auto !important;
}

.gantt_task {
    min-width: 1000px !important;
}

.break-task .gantt_task_line {
  background-color: transparent !important;
  border: none !important;
}

/* Change font inside task bars */
.gantt_task_content {
    font-family: 'Roboto', sans-serif !important;
    font-size: 14px !important;
    color: white !important; /* Adjust text color for readability */

    display: flex;
    align-items: center;
    justify-content: left; /* Center-align text */
}

/* Change font for scale headers (timeline labels) */
.gantt_scale_row, .gantt_grid_head_cell {
    font-family: 'Roboto', sans-serif !important;
    font-size: 14px !important;
    font-weight: bold;
    text-align: center;
    color:black;
}

/* Ensure task progress bar has correct colors */


/* Header styling */
.custom-header {
    background-color: blue !important; /* Dark Blue */
    color: white !important;
    font-weight: bold;
}


/* Increase task row height */
.gantt_row {
    height: auto !important; /* Allows rows to expand dynamically */
    min-height: 40px !important; /* Set a minimum height */
    align-items:center;
}

/* Ensure task name wraps inside the left grid */
.gantt_cell_tree {color:blue!important;cursor:pointer!important;}
.gantt_tree_content,
.gantt_grid_data .gantt_cell {
    font-family: 'Roboto', sans-serif !important;
    font-size: 14px !important;
    line-height: 1.4 !important; /* Adjust for better spacing */
    display: flex !important;
    
    
    
}

        `}
      </style>
    </div>
  );
};

// white-space: normal !important;
// word-wrap: break-word !important;
// overflow-wrap: break-word !important;

export default ResourceRoadmapGantt;
