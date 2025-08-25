/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
import { GetUserPermission } from "@/utils/Users";
import { decodeBase64 } from "@/utils/securedata";
import { useTheme } from "@/themes/ThemeProvider";
import { navigationRef } from "@/utils/navigationService";

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

const MultifeatureGanttProjectDependencies: React.FC<ChartProps> = ({
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
  const {theme} = useTheme();

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
        created_by: element.created_by || "N/A",
        updated_by: element.updated_by || "N/A",
        is_active: element.is_active || false,
        created_at: new Date(element.created_at),
        updated_at: new Date(element.updated_at),
      });
    });
    gantt.parse({ data: tasks, links });
  };

  if (gantt._myClickHandler) {
    gantt.detachEvent(gantt._myClickHandler);
  }
  gantt._myClickHandler = gantt.attachEvent("onTaskClick", function (id, e) {
    let task1 = gantt.getTask(id);
    console.log("Task Clicked:", task1);
    const scrollState = gantt.getScrollState();
    if (task1.type !== "dependendPrj") {
      var task: any[] = [];
      var links: any[] = [];
      data.forEach((element: any, index: any) => {
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
          dependencies:
            element.dependent_projects_details?.length > 0
              ? element.dependent_projects_details.map((prj: any) => ({
                  s_no: prj.customer_project_id,
                  id: prj.project_id,
                  text: prj.project_name,
                  start_date: new Date(prj.start_date),
                  duration: Math.ceil(
                    (new Date(prj.end_date).getTime() -
                      new Date(prj.start_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ),
                  progress: parseFloat(prj.progress_percentage) / 100,
                  parent: 0,
                  status_color: prj.status_color?.trim(),
                  status_name: prj.status_name?.trim(),
                  department_color: prj.department_color?.trim(),
                  progress_back_color: prj.progress_back_color?.trim(),
                  progress_status_color: prj.progress_status_color?.trim(),
                  // ✅ Colors & Status
                  status: prj.status,
                  current_week_status: prj.current_week_status?.trim(),
                  current_week_status_color:
                    prj.current_week_status_color?.trim(),

                  // ✅ Project Details
                  project_manager_name: prj.project_manager_name?.trim(),
                  business_stakeholder_dept_name:
                    prj.business_stakeholder_dept_name?.trim(),
                  impacted_function_name: prj.impacted_function_name?.trim(),
                  classification_name: prj.classification_name?.trim(),
                  budget: prj.budget?.trim(),
                  priority: prj.priority || "N/A",
                  phase_status_name: prj.phase_status_name?.trim(),
                  business_stakeholder_user:
                    prj.business_stakeholder_user || "N/A",
                  project_owner_user: prj.project_owner_user || "N/A",

                  // ✅ Financial Details
                  initial_budget: prj.initial_budget || "N/A",
                  actual_budget: prj.actual_budget || "N/A",
                  benefit_roi: prj.benefit_roi || "N/A",

                  // ✅ Additional Metadata
                  description: prj.description || "No Description",
                  project_short_name: prj.project_short_name || "N/A",
                  goal_id: prj.goal_id || "N/A",
                  customer_id: prj.customer_id || "N/A",
                  created_by: prj.created_by || "N/A",
                  updated_by: prj.updated_by || "N/A",
                  is_active: prj.is_active || false,
                  created_at: new Date(prj.created_at),
                  updated_at: new Date(prj.updated_at),
                }))
              : [],
          created_by: element.created_by || "N/A",
          updated_by: element.updated_by || "N/A",
          is_active: element.is_active || false,
          created_at: new Date(element.created_at),
          updated_at: new Date(element.updated_at),
        });
        ////////////debugger;
        if (element.project_id?.toString() === id) {
          if (viewingProject !== id) {
            setViewingProject(id);
            element?.dependent_projects_details?.forEach((prj) => {
              task.push({
                s_no: prj.customer_project_id,
                id: "mile_" + prj.project_id,
                text: prj.project_name,
                start_date: new Date(prj.start_date),
                duration: Math.ceil(
                  (new Date(prj.end_date).getTime() -
                    new Date(prj.start_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                progress: parseFloat(prj.progress_percentage) / 100,
                parent: 0,
                status_color: prj.status_color?.trim(),
                status_name: prj.status_name?.trim(),
                department_color: prj.department_color?.trim(),
                progress_back_color: prj.progress_back_color?.trim(),
                progress_status_color: prj.progress_status_color?.trim(),
                // ✅ Colors & Status
                status: prj.status,
                current_week_status: prj.current_week_status?.trim(),
                current_week_status_color:
                  prj.current_week_status_color?.trim(),

                // ✅ Project Details
                project_manager_name: prj.project_manager_name?.trim(),
                business_stakeholder_dept_name:
                  prj.business_stakeholder_dept_name?.trim(),
                impacted_function_name: prj.impacted_function_name?.trim(),
                classification_name: prj.classification_name?.trim(),
                budget: prj.budget?.trim(),
                priority: prj.priority || "N/A",
                phase_status_name: prj.phase_status_name?.trim(),
                business_stakeholder_user:
                  prj.business_stakeholder_user || "N/A",
                project_owner_user: prj.project_owner_user || "N/A",

                // ✅ Financial Details
                initial_budget: prj.initial_budget || "N/A",
                actual_budget: prj.actual_budget || "N/A",
                benefit_roi: prj.benefit_roi || "N/A",

                // ✅ Additional Metadata
                description: prj.description || "No Description",
                project_short_name: prj.project_short_name || "N/A",
                goal_id: prj.goal_id || "N/A",
                customer_id: prj.customer_id || "N/A",
                created_by: prj.created_by || "N/A",
                updated_by: prj.updated_by || "N/A",
                is_active: prj.is_active || false,
                created_at: new Date(prj.created_at),
                updated_at: new Date(prj.updated_at),
                type: "dependendPrj",
              });
              //////////////debugger;
              links.push({
                id: "link_" + prj.project_id,
                source: element.project_id,
                target: "mile_" + prj.project_id,
                type: "1",
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

  gantt.attachEvent("onBeforeTooltipD", (taskId: string) => {
    const activeElement = document.querySelector(".gantt_cell:hover");
    return activeElement?.innerHTML?.includes("showingtool") || false;
  });

  useEffect(() => {
    console.log("ganttContainer.current at mount:", ganttContainer.current);
    if (!ganttContainer.current) {
      console.error(
        "MultifeatureGanttProjectDependencies container is null at mount"
      );
      return;
    }

    // Configure Gantt settings
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.readonly = true;
    gantt.config.min_column_width = chat_view === "week" ? 150 : 100;
    gantt.config.row_height = 40;
    gantt.config.show_links = true;
    gantt.config.show_task_links = true;
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
              task.type === "dependendPrj" ? "black" : "blue"
            };cursor:pointer" onclick="handleProjectClick('${task.id}', '${
            task.type || ""
          }')">
              ${
                task.type === "dependendPrj"
                  ? `\u00A0\u00A0\u00A0\u00A0${shortName}`
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
                task.benefit_roi?.length > 15
                  ? task.benefit_roi.substring(0, 15) + "..."
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
      if (task.type === "dependendPrj") {
        return `<div style="color: white; padding-left: 5px;">${
          task.progress * 100
        }%</div>`;
      }
      return `<div style="color: white; padding-left: 5px;"><span style="font-size: 20px;">◈</span> ${
        task.progress * 100
      }%</div>`;
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
          "MultifeatureGanttProjectDependencies container is null during initialization"
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
          ganttContainer.current.id =
            "multifeature-gantt-dependencies-container";
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
        console.error(
          "Error initializing MultifeatureGanttProjectDependencies:",
          error
        );
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
      if (status !== '5') {
       
        navigationRef(
                      `/PMView/ProjectProgressOverview?projectId=${projectId}`
                    );
      }
    };

    window.handleProjectClick = (projectId: string, type: string) => {
      if (type !== "dependendPrj") {
        // navigate('ProjectPreview', {
        //   projectId,
        //   isApproved: true,
        //   redirect: 'MilestoneViewGantt',
        // });
        navigationRef(
                        `/PMView/ProjectView?projectId=${projectId}`
                      );
      }
    };

    return () => {
      console.log("Cleaning up MultifeatureGanttProjectDependencies");
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
        gantt.detachEvent("onBeforeTooltipD");
        isInitialized.current = false;
      } catch (error) {
        console.error(
          "Error cleaning up MultifeatureGanttProjectDependencies:",
          error
        );
      }
      cancelAnimationFrame(raf);
    };
  }, [data, chat_view, start_date, end_date]);

  return (
    <div className="flex-1 h-[700px]">
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
            background-color: ${theme.colors.drawerBackgroundColor} !important;
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

export default MultifeatureGanttProjectDependencies;
