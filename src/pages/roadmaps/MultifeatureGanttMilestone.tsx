/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
import { GetUserPermission } from "@/utils/Users";
import { decodeBase64 } from "@/utils/securedata";

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

const MultifeatureGanttMilestone: React.FC<ChartProps> = ({
  data,
  chat_view,
  end_date,
  start_date,
}) => {
  const ganttContainer = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef<boolean>(false);
  const taskClickEventId = useRef<string | null>(null);
  const [currentView, setCurrentView] = useState(chat_view);
  const [viewingProject, setViewingProject] = useState("");
  const [permissions, setPermissions] = useState<number[]>([]);
  //const { theme } = useTheme();

  const fetchUserPermission = async () => {
    try {
      const userID = localStorage.getItem("ID");
      const response = await GetUserPermission(decodeBase64(userID || ""));
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        if (parsedRes.data.user_permissions.length > 0) {
          setPermissions(
            parsedRes.data.user_permissions.map((p: any) => p.permission_id)
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

  const applyTaskColors = () => {
    gantt.eachTask((task: any) => {
      const taskElement = document.querySelector(
        `.gantt_task_line[task_id="${task.id}"]`
      );
      if (taskElement) {
        taskElement.style.backgroundColor =
          task.progress_back_color || "#B5DC9D";
        const progressBar = taskElement.querySelector(".gantt_task_progress");
        if (progressBar) {
          progressBar.style.backgroundColor =
            task.progress_status_color || "#6CBA3B";
        }
      }
    });
    if (gantt.ext?.tooltips?.tooltip) {
      gantt.ext.tooltips.tooltip.hide();
    }
  };

  const applyCustomStyles = () => {
    gantt.templates.scale_cell_class = () => "custom-header";
    applyTaskColors();
  };

  if (gantt._myClickHandler) {
    gantt.detachEvent(gantt._myClickHandler);
  }
  gantt._myClickHandler = gantt.attachEvent("onTaskClick", function (id, e) {
    const scrollState = gantt.getScrollState();
    let task1 = gantt.getTask(id);
    console.log("Task Clicked:", task1);
    if (task1.type !== "milestone") {
      //gantt.clearAll(); // Clears all tasks in Gantt    --------
      var task: any[] = [];
      var links: any[] = [];
      data.forEach((element: any, index: any) => {
        ////////////debugger;
        task.push({
          s_no: element.customer_project_id,
          id: element.project_id,
          text: element.project_name,
          start_date: new Date(element.start_date),
          duration: Math.ceil(
            (new Date(element.end_date).getTime() -
              new Date(element.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          progress: parseFloat(element.progress_percentage) / 100,
          parent: 0,
          status: element.status,
          status_color: element.status_color?.trim(),
          status_name: element.status_name?.trim(),
          department_color: element.department_color?.trim(),
          progress_back_color: element.progress_back_color?.trim(),
          progress_status_color: element.progress_status_color?.trim(),
          // ✅ Colors & Status

          current_week_status: element.current_week_status?.trim(),
          current_week_status_color: element.current_week_status_color?.trim(),

          // ✅ Project Details
          project_manager_name: element.project_manager_name?.trim(),
          business_stakeholder_dept_name:
            element.business_stakeholder_dept_name?.trim(),
          impacted_function_name: element.impacted_function_name?.trim(),
          classification_name: element.classification_name?.trim(),
          budget: element.budget?.trim(),
          priority: element.priority || "N/A",
          phase_status_name: element.phase_status_name?.trim(),
          business_stakeholder_user: element.business_stakeholder_user || "N/A",
          project_owner_user: element.project_owner_user || "N/A",

          // ✅ Financial Details
          initial_budget: element.initial_budget || "N/A",
          actual_budget: element.actual_budget || "N/A",
          benefit_roi: element.benefit_roi || "N/A",

          // ✅ Additional Metadata
          description: element.description || "No Description",
          project_short_name: element.project_short_name || "N/A",
          goal_id: element.goal_id || "N/A",
          customer_id: element.customer_id || "N/A",

          // ✅ Milestones Mapping
          milestones: element.milestones
            ? element.milestones.map((milestone: any) => ({
                milestone_id: milestone.milestone_id,
                milestone_name: milestone.milestone_name,
                milestone_description: milestone.milestone_description,
                start_date: new Date(milestone.start_date),
                end_date: new Date(milestone.end_date),
                actual_start_date: milestone.actual_start_date
                  ? new Date(milestone.actual_start_date)
                  : null,
                actual_end_date: milestone.actual_end_date
                  ? new Date(milestone.actual_end_date)
                  : null,
                status: milestone.status,
                status_name: milestone.status_name,
                status_color: milestone.status_color,
                priority: milestone.priority,
                short_name: milestone.short_name,
                last_status: milestone.last_status,
                detail_description: milestone.detail_description,
                progress_days: milestone.progress_days,
                total_days: milestone.total_days,
                resource_deployment_type: milestone.resource_deployment_type,
                resource_deployment_value: milestone.resource_deployment_value,
                scope_type: milestone.scope_type,
                scope_value: milestone.scope_value,
                budget_utilization_type: milestone.budget_utilization_type,
                budget_utilization_value: milestone.budget_utilization_value,
                weak: milestone.weak,
                percent_change: milestone.percent_change,
                task: milestone.task,
                upcomming_task: milestone.upcomming_task,
                accomplishments: milestone.accomplishments,
              }))
            : [], // Default to an empty array if `element.milestones` is null/undefined

          created_by: element.created_by || "N/A",
          updated_by: element.updated_by || "N/A",
          is_active: element.is_active || false,
          created_at: new Date(element.created_at),
          updated_at: new Date(element.updated_at),
        });
        if (element.project_id?.toString() === id) {
          if (viewingProject !== id) {
            setViewingProject(id);
            element?.milestones?.forEach((mile) => {
              task.push({
                s_no: "",
                id: "mile_" + mile.milestone_id,
                text: mile.milestone_name,
                milestone_name: mile.milestone_name,
                start_date: new Date(mile.start_date),
                duration: Math.ceil(
                  (new Date(mile.end_date).getTime() -
                    new Date(mile.start_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                progress: parseFloat(mile.progress_days) / 100,
                parent: 0,
                status_color: mile.status_color?.trim(),
                department_color: "red".trim(),
                progress_back_color: "gray",
                progress_status_color: "blue"?.trim(),
                is_active: mile.is_active || false,
                type: "milestone",
              });
              links.push({
                id: "link_" + mile.milestone_id,
                source: element.project_id,
                target: "mile_" + mile.milestone_id,
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

    return true; // Continue default task click behavior
  });

  gantt.attachEvent("onBeforeTooltip", (taskId: string) => {
    const activeElement = document.querySelector(".gantt_cell:hover");
    return activeElement?.innerHTML?.includes("showingtool") || false;
  });

  const loadTasks = () => {
    const tasks: any[] = [];
    const links: any[] = [];
    data.forEach((element: any) => {
      tasks.push({
        s_no: element.customer_project_id,
        id: element.project_id,
        text: element.project_name,
        start_date: new Date(element.start_date),
        duration: Math.ceil(
          (new Date(element.end_date).getTime() -
            new Date(element.start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        progress: parseFloat(element.progress_percentage) / 100,
        parent: 0,
        status: element.status,
        status_color: element.status_color?.trim(),
        status_name: element.status_name?.trim(),
        department_color: element.department_color?.trim(),
        progress_back_color: element.progress_back_color?.trim(),
        progress_status_color: element.progress_status_color?.trim(),
        current_week_status: element.current_week_status?.trim(),
        current_week_status_color: element.current_week_status_color?.trim(),
        project_manager_name: element.project_manager_name?.trim(),
        business_stakeholder_dept_name:
          element.business_stakeholder_dept_name?.trim(),
        impacted_function_name: element.impacted_function_name?.trim(),
        classification_name: element.classification_name?.trim(),
        budget: element.budget?.trim(),
        priority: element.priority || "N/A",
        phase_status_name: element.phase_status_name?.trim(),
        business_stakeholder_user: element.business_stakeholder_user || "N/A",
        project_owner_user: element.project_owner_user || "N/A",
        initial_budget: element.initial_budget || "N/A",
        actual_budget: element.actual_budget || "N/A",
        benefit_roi: element.benefit_roi || "N/A",
        description: element.description || "No Description",
        project_short_name: element.project_short_name || "N/A",
        goal_id: element.goal_id || "N/A",
        customer_id: element.customer_id || "N/A",
        milestones: element.milestones
          ? element.milestones.map((milestone: any) => ({
              milestone_id: milestone.milestone_id,
              milestone_name: milestone.milestone_name,
              milestone_description: milestone.milestone_description,
              start_date: new Date(milestone.start_date),
              end_date: new Date(milestone.end_date),
              actual_start_date: milestone.actual_start_date
                ? new Date(milestone.actual_start_date)
                : null,
              actual_end_date: milestone.actual_end_date
                ? new Date(milestone.actual_end_date)
                : null,
              status: milestone.status,
              status_name: milestone.status_name,
              status_color: milestone.status_color,
              priority: milestone.priority,
              short_name: milestone.short_name,
              last_status: milestone.last_status,
              detail_description: milestone.detail_description,
              progress_days: milestone.progress_days,
              total_days: milestone.total_days,
              resource_deployment_type: milestone.resource_deployment_type,
              resource_deployment_value: milestone.resource_deployment_value,
              scope_type: milestone.scope_type,
              scope_value: milestone.scope_value,
              budget_utilization_type: milestone.budget_utilization_type,
              budget_utilization_value: milestone.budget_utilization_value,
              weak: milestone.weak,
              percent_change: milestone.percent_change,
              task: milestone.task,
              upcomming_task: milestone.upcomming_task,
              accomplishments: milestone.accomplishments,
            }))
          : [],
        created_by: element.created_by || "N/A",
        updated_by: element.updated_by || "N/A",
        is_active: element.is_active || false,
        created_at: new Date(element.created_at),
        updated_at: new Date(element.updated_at),
      });
    });
    gantt.parse({ data: tasks, links });
  };

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
          date: (date: Date) => {
            const startDate = gantt.date.week_start(new Date(date));
            const month = startDate.getMonth() + 1;
            const day = startDate.getDate();
            const weekNumber = gantt.date.getISOWeek(startDate);
            return `${month}/${day}, Wk-${weekNumber}`;
          },
        },
      ];
    } else if (scale === "month") {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.subscales = [{ unit: "month", step: 1, date: "%M" }];
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

  useEffect(() => {
    console.log("ganttContainer.current at mount:", ganttContainer.current);
    if (!ganttContainer.current) {
      console.error("MultifeatureGanttMilestone container is null at mount");
      return;
    }

    // Configure Gantt settings
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.readonly = true;
    gantt.config.min_column_width = 100;
    gantt.config.row_height = 40;
    gantt.config.show_links = false;
    gantt.config.show_task_links = false;
    gantt.plugins({ tooltip: true });

    const strToDate = gantt.date.str_to_date("%Y-%m-%d");
    gantt.config.start_date =
      start_date === "" ? new Date(2020, 1, 1) : strToDate(start_date);
    gantt.config.end_date =
      end_date === "" ? new Date(2026, 5, 30) : strToDate(end_date);

    gantt.config.columns = [
      { name: "s_no", label: "Proj. ID", align: "left", width: 70 },
      {
        name: "text",
        label: "Project Name",
        width: 125,
        resize: true,
        template: (task: any) => {
          const projectName = task?.text?.toString().trim() || "";
          const shortName =
            projectName.length > 15
              ? projectName.substring(0, 15) + "..."
              : projectName;
          return `
            <div id="showingtool" style="color:${
              task.type === "milestone" ? "black" : "blue"
            };cursor:pointer" onclick="handleProjectClick('${task.id}', '${
            task.type || ""
          }')">
              ${
                task.type === "milestone"
                  ? `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${shortName}`
                  : shortName
              }
            </div>
          `;
        },
      },
      {
        name: "start_date",
        label: "Start Date",
        align: "center",
        width: 95,
        resize: true,
        template: (task: any) =>
          gantt.date.date_to_str("%m/%d/%Y")(task.start_date),
      },
      {
        name: "custom_html",
        label: "Status",
        align: "center",
        width: 50,
        template: (task: any) => `
          <div class="status-circle" 
               onclick="handleStatusClick('${task.id}', '${task.status}')" 
               style="background-color: ${
                 task?.status_color?.toString().trim() || "#000"
               };">
          </div>
        `,
      },
    ];

    gantt.templates.tooltip_text = (start: Date, end: Date, task: any) => {
      if (task.type === "milestone") {
        return `
          <div class="gantt-tooltip">
            <div class="tooltip-header"><b>${task.text}</b></div>
            <div class="tooltip-body">
              <div><b>Start Date:</b> ${gantt.date.date_to_str("%m/%d/%Y")(
                task.start_date
              )}</div>
              <div><b>End Date:</b> ${gantt.date.date_to_str("%m/%d/%Y")(
                task.end_date
              )}</div>
            </div>
          </div>`;
      }
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
            <div><b>Progress:</b> ${Math.round(task.progress * 100)}%</div>
            <div><b>Status:</b> <span style="color:${
              task.status_color || "#000"
            }">${task.status_name || "N/A"}</span></div>
            <div><b>Department:</b> ${
              task.business_stakeholder_dept_name || "N/A"
            }</div>
            <div><b>Manager:</b> ${task.project_manager_name || "N/A"}</div>
            <div><b>Classification:</b> ${
              task.classification_name || "N/A"
            }</div>
            <div><b>Impacted Function:</b> ${
              task.impacted_function_name || "N/A"
            }</div>
            <div><b>Project Manager:</b> ${
              task.project_manager_name || "N/A"
            }</div>
            ${
              permissions.includes(41)
                ? `<div><b>Budget:</b> ${task.budget || "N/A"}</div>`
                : ""
            }
            <div style="word-break: break-all; white-space: normal;">
              <b>ROI:</b> ${
                task?.benefit_roi?.length > 35
                  ? task.benefit_roi.substring(0, 35) + "..."
                  : task.benefit_roi || "N/A"
              }
            </div>
          </div>
          <div class="tooltip-footer" style="background-color:${
            task.status_color || "#ccc"
          };">
            <b>Weekly Status:</b> ${task.status_name || "N/A"}
          </div>
        </div>
      `;
    };

    gantt.templates.task_row_class = (start: Date, end: Date, task: any) => {
      const hasLinks =
        (task.$source?.length || 0) > 0 || (task.$target?.length || 0) > 0;
      return hasLinks ? "link-connected-row" : "";
    };

    gantt.templates.task_class = (start: Date, end: Date, task: any) => {
      const hasPredecessor = gantt
        .getLinks()
        .some((link: any) => link.target === task.id);
      return hasPredecessor ? "task-with-diamond" : "";
    };

    gantt.templates.task_text = (start: Date, end: Date, task: any) => {
      if (task.type === "milestone") {
        return `<div style="color: white; padding-left: 5px;">${task.milestone_name}</div>`;
      }
      return `<div style="color: white; padding-left: 5px;"><span style="font-size: 20px;">◈</span> ${Math.round(
        task.progress * 100
      )}%</div>`;
    };

    gantt.attachEvent("onTaskCreated", () => false);
    gantt.attachEvent(gantt._myClickHandler);
    gantt.attachEvent("onDataRender", applyTaskColors);
    gantt.attachEvent("onTaskDrag", applyTaskColors);
    gantt.attachEvent("onAfterTaskUpdate", applyTaskColors);
    gantt.attachEvent("onTaskSelected", applyTaskColors);
    gantt.attachEvent("onScroll", applyTaskColors);
    gantt.attachEvent("onGanttScroll", applyTaskColors);
    gantt.attachEvent("onGanttReady", () => {
      const tasks = gantt.getTaskByTime();
      if (tasks.length > 0) {
        const startDates = tasks
          .map((task: any) => new Date(task.start_date).getTime())
          .filter((t) => t !== 0);
        if (startDates.length > 0) {
          const earliestStartDate = new Date(Math.min(...startDates));
          gantt.showDate(earliestStartDate);
        }
      }
      applyTaskColors();
    });

    const initializeGantt = () => {
      if (!ganttContainer.current) {
        console.error(
          "MultifeatureGanttMilestone container is null during initialization"
        );
        return;
      }
      if (!(ganttContainer.current instanceof HTMLElement)) {
        console.error(
          "ganttContainer.current is not an HTMLElement:",
          ganttContainer.current
        );
        return;
      }
      console.log(
        "ganttContainer.current before init:",
        ganttContainer.current
      );
      console.log(
        "ganttContainer.current.classList:",
        ganttContainer.current.classList
      );

      try {
        if (!isInitialized.current) {
          ganttContainer.current.id = "multifeature-gantt-milestone-container";
          gantt.init(ganttContainer.current);
          isInitialized.current = true;
          console.log("Gantt initialized successfully");
        }

        gantt.clearAll();
        fetchUserPermission();
        applyCustomStyles();
        loadTasks();
        updateScale(chat_view);
        const tasks = gantt.getTaskByTime();
        if (tasks.length > 0) {
          const startDates = tasks
            .map((task: any) => new Date(task.start_date).getTime())
            .filter((t) => t !== 0);
          if (startDates.length > 0) {
            const earliestStartDate = new Date(Math.min(...startDates));
            gantt.showDate(earliestStartDate);
          }
        }
      } catch (error) {
        console.error("Error initializing MultifeatureGanttMilestone:", error);
      }
    };

    const handleMouseLeave = () => {
      if (gantt.ext?.tooltips?.tooltip) {
        gantt.ext.tooltips.tooltip.hide();
      }
    };

    const raf = requestAnimationFrame(() => {
      console.log("Attempting to initialize Gantt in requestAnimationFrame");
      initializeGantt();
    });

    if (ganttContainer.current) {
      ganttContainer.current.addEventListener("mouseleave", handleMouseLeave);
    }

    window.handleStatusClick = (projectId: string, status: string) => {
      if (status !== "5") {
        navigate("ProjectProgressOverview", { projectId });
      }
    };

    window.handleProjectClick = (projectId: string, type: string) => {
      if (type !== "milestone") {
        navigate("ProjectPreview", {
          projectId,
          isApproved: true,
          redirect: "MilestoneViewGantt",
        });
      }
    };

    return () => {
      console.log("Cleaning up MultifeatureGanttMilestone");
      try {
        gantt.clearAll();
        if (ganttContainer.current) {
          ganttContainer.current.innerHTML = "";
          ganttContainer.current.removeEventListener(
            "mouseleave",
            handleMouseLeave
          );
        }
        gantt.detachEvent(gantt._myClickHandler);
        gantt.detachEvent("onTaskCreated");
        gantt.detachEvent("onDataRender");
        gantt.detachEvent("onTaskDrag");
        gantt.detachEvent("onAfterTaskUpdate");
        gantt.detachEvent("onTaskSelected");
        gantt.detachEvent("onScroll");
        gantt.detachEvent("onGanttScroll");
        gantt.detachEvent("onGanttReady");
        gantt.detachEvent("onBeforeTooltip");
        isInitialized.current = false;
      } catch (error) {
        console.error("Error cleaning up MultifeatureGanttMilestone:", error);
      }
      cancelAnimationFrame(raf);
    };
  }, [data, chat_view, start_date, end_date]);

  return (
    <div className="flex-1 h-[1000px]">
      <div ref={ganttContainer} style={{ width: "100%", height: "100%" }} />
      <style>
        {`
          .gantt-tooltip {
            width: 300px !important;
            overflow: hidden !important;
          }
          .tooltip-body {
            overflow: hidden !important;
          }
          .link-connected-row {
            background-color: #fffbe6 !important;
          }
          .gantt_task_line {
            height: 25px !important;
            margin-top: 3px !important;
          }
          .gantt_scale_cell {
            font-weight: bold !important;
            color: black !important;
          }
          .gantt_tooltip {
            background: #ffffff !important;
            color: #333 !important;
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
            background-color: red;
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
          .status-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .gantt_container {
            font-family: 'Roboto', sans-serif !important;
            font-size: 14px !important;
            overflow: auto !important;
          }
          .gantt_grid {
            min-width: 500px !important;
            overflow-x: auto !important;
          }
          .gantt_task {
            min-width: 1000px !important;
          }
          .gantt_task_content {
            font-family: 'Roboto', sans-serif !important;
            font-size: 14px !important;
            color: white !important;
            display: flex;
            align-items: center;
            justify-content: left;
          }
          .gantt_scale_row, .gantt_grid_head_cell {
            font-family: 'Roboto', sans-serif !important;
            font-size: 14px !important;
            font-weight: bold;
            text-align: center;
            color: black;
          }
          .custom-header {
            background-color: blue !important;
            color: white !important;
            font-weight: bold;
          }
          .gantt_row {
            height: auto !important;
            min-height: 40px !important;
            align-items: center;
          }
          .gantt_cell_tree {
            color: blue !important;
            cursor: pointer !important;
          }
          .gantt_tree_content,
          .gantt_grid_data .gantt_cell {
            font-family: 'Roboto', sans-serif !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
            display: flex !important;
          }
        `}
      </style>
    </div>
  );
};

export default MultifeatureGanttMilestone;
