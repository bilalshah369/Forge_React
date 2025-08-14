import React, { useState } from "react";
import { Gantt, ViewMode, Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

import { Circle_svg } from "../../assets/Icons";

// Define interfaces for data and props
interface Project {
  project_id: string;
  project_name: string;
  start_date?: string;
  end_date?: string;
  status_name: string;
  status_color: string;
}

interface Program {
  program_id: string;
  program_name: string;
  start_date?: string;
  end_date?: string;
  program_status_name: string;
  program_status_color: string;
  projects?: Project[];
}

interface Goal {
  goal_id: string;
  goal_name: string;
  start_date?: string;
  end_date?: string;
  goal_status_name: string;
  goal_status_color: string;
  programs?: Program[];
  projects?: Project[];
}

interface Theme {
  colors: {
    drawerBackgroundColor: string;
  };
}

interface GanttProps {
  data: Goal[];
  chat_view: "day" | "week" | "month" | "quarter" | "year";
  start_date?: string;
  end_date?: string;
}

// Extend Task interface from gantt-task-react
interface CustomTask extends Task {
  serial_no?: number;
  task_type: "goal" | "program" | "project";
  hasChildren: boolean;
  status_name: string;
  status_color: string;
}

// Helper to calculate duration between two dates
const calculateDuration = (start: Date, end: Date): number => {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const GanttGoalsProgramsProjects: React.FC<GanttProps> = ({
  data,
  chat_view,
  start_date,
  end_date,
}) => {
  //const { theme } = useTheme() as { theme: Theme };
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedPrograms, setExpandedPrograms] = useState<
    Record<string, boolean>
  >({});

  // Map DHTMLX view scales to gantt-task-react ViewMode
  const getViewMode = (scale: GanttProps["chat_view"]): ViewMode => {
    switch (scale) {
      case "day":
        return ViewMode.Day;
      case "week":
        return ViewMode.Week;
      case "month":
        return ViewMode.Month;
      case "year":
        return ViewMode.Year;
      default:
        return ViewMode.Month;
    }
  };

  // Prepare all tasks
  const allTasks: CustomTask[] = [];
  const taskMap: Record<string, CustomTask> = {};
  let idCounter = 1;

  data.forEach((goal, index) => {
    const goalId = `goal-${goal.goal_id}`;
    const start = new Date(goal.start_date?.split("T")[0] ?? "2020-01-01");
    const end = new Date(goal.end_date?.split("T")[0] ?? "2026-12-31");

    const hasPrograms = goal.programs?.length > 0;
    const hasProjects = goal.projects?.length > 0;

    const task: CustomTask = {
      id: goalId,
      name: goal.goal_name,
      start,
      end,
      status_name: goal.goal_status_name,
      status_color: goal.goal_status_color,
      type: "task",
      progress: 0,
      styles: {
        backgroundColor: "#2C6E49",
        backgroundSelectedColor: "#2C6E49",
        progressColor: "#2C6E49",
      },
      serial_no: index + 1,
      task_type: "goal",
      hasChildren: hasPrograms || hasProjects,
    };
    allTasks.push(task);
    taskMap[goalId] = task;

    // Programs
    goal.programs?.forEach((program) => {
      const programId = `program-${program.program_id}`;
      const hasProjects = program.projects?.length > 0;

      const programTask: CustomTask = {
        id: programId,
        name: program.program_name,
        start: new Date(
          program.start_date?.split("T")[0] ??
            goal.start_date?.split("T")[0] ??
            "2020-01-01"
        ),
        end: new Date(
          program.end_date?.split("T")[0] ??
            goal.end_date?.split("T")[0] ??
            "2026-12-31"
        ),
        status_name: program.program_status_name,
        status_color: program.program_status_color,
        type: "task",
        progress: 0,
        dependencies: [],
        project: goalId,
        styles: {
          backgroundColor: "#E59500",
          backgroundSelectedColor: "#E59500",
          progressColor: "#E59500",
          progressSelectedColor: "#E59500",
        },
        task_type: "program",
        hasChildren: hasProjects,
      };
      allTasks.push(programTask);
      taskMap[programId] = programTask;

      // Projects under programs
      program.projects?.forEach((project) => {
        const projectId = `project-${project.project_id}`;
        const projectTask: CustomTask = {
          id: projectId,
          name: project.project_name,
          start: new Date(
            project.start_date?.split("T")[0] ??
              program.start_date?.split("T")[0] ??
              goal.start_date?.split("T")[0] ??
              "2020-01-01"
          ),
          end: new Date(
            project.end_date?.split("T")[0] ??
              program.end_date?.split("T")[0] ??
              goal.end_date?.split("T")[0] ??
              "2026-12-31"
          ),
          status_name: project.status_name,
          status_color: project.status_color,
          type: "task",
          progress: 0,
          dependencies: [],
          project: programId,
          styles: {
            backgroundColor: "#0E79B2",
            backgroundSelectedColor: "#0E79B2",
            progressColor: "#0E79B2",
            progressSelectedColor: "#0E79B2",
          },
          task_type: "project",
          hasChildren: false,
        };
        allTasks.push(projectTask);
        taskMap[projectId] = projectTask;
      });
    });

    // Projects directly under goal
    goal.projects?.forEach((project) => {
      const projectId = `project-${project.project_id}`;
      if (!taskMap[projectId]) {
        const projectTask: CustomTask = {
          id: projectId,
          name: project.project_name,
          start: new Date(
            project.start_date?.split("T")[0] ??
              goal.start_date?.split("T")[0] ??
              "2020-01-01"
          ),
          end: new Date(
            project.end_date?.split("T")[0] ??
              goal.end_date?.split("T")[0] ??
              "2026-12-31"
          ),
          status_color: project.status_color,
          status_name: project.status_name,
          type: "task",
          progress: 0,
          dependencies: [],
          project: goalId,
          styles: {
            backgroundColor: "#6f42c1",
            backgroundSelectedColor: "#6f42c1",
            progressColor: "#6f42c1",
            progressSelectedColor: "#6f42c1",
          },
          task_type: "project",
          hasChildren: false,
        };
        allTasks.push(projectTask);
        taskMap[projectId] = projectTask;
      }
    });
  });

  // Filter tasks to show only expanded ones
  const getVisibleTasks = (): CustomTask[] => {
    return allTasks.filter((task) => {
      if (task.task_type === "goal") return true;
      if (task.task_type === "program") {
        return expandedGoals[task.project];
      }
      if (task.task_type === "project") {
        const parentProgram = taskMap[task.project];
        return (
          parentProgram &&
          expandedGoals[parentProgram.project] &&
          expandedPrograms[task.project]
        );
      }
      return false;
    });
  };

  // Toggle expand/collapse for goals
  const toggleGoal = (goalId: string): void => {
    setExpandedGoals((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  // Toggle expand/collapse for programs
  const toggleProgram = (programId: string): void => {
    setExpandedPrograms((prev) => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  return (
    <div
      className="gantt-container"
      style={{
        width: "100%",
        minWidth: "800px",
        minHeight: `${data?.length * 35}px`,
        maxHeight: "700px",
        fontFamily: "Roboto",
      }}
    >
      <Gantt
        tasks={getVisibleTasks()}
        viewMode={getViewMode(chat_view)}
        viewDate={start_date ? new Date(start_date) : new Date(2020, 1, 1)}
        columnWidth={100}
        rowHeight={30}
        listCellWidth="360px"
        TooltipContent={({ task }: { task: CustomTask }) => {
          const startDate = task.start.toLocaleDateString();
          const endDate = task.end.toLocaleDateString();
          if (task.task_type === "goal") {
            return (
              <div className="tooltip">
                <div className="tooltip-body">
                  <div className="tooltip-text">
                    <b>Goal:</b> {task.name}
                  </div>
                  <div>
                    <b>Start Date:</b> {startDate}
                  </div>
                  <div>
                    <b>End Date:</b> {endDate}
                  </div>
                  <div>
                    <b>Status:</b> {task.status_name}
                  </div>
                </div>
              </div>
            );
          } else if (task.task_type === "program") {
            return (
              <div className="tooltip">
                <div className="tooltip-body">
                  <div className="tooltip-text">
                    <b>Program:</b> {task.name}
                  </div>
                  <div>
                    <b>Start Date:</b> {startDate}
                  </div>
                  <div>
                    <b>End Date:</b> {endDate}
                  </div>
                  <div>
                    <b>Status:</b> {task.status_name}
                  </div>
                </div>
              </div>
            );
          } else if (task.task_type === "project") {
            return (
              <div className="tooltip">
                <div className="tooltip-body">
                  <div className="tooltip-text">
                    <b>Project:</b> {task.name}
                  </div>
                  <div>
                    <b>Start Date:</b> {startDate}
                  </div>
                  <div>
                    <b>End Date:</b> {endDate}
                  </div>
                  <div>
                    <b>Duration:</b> {calculateDuration(task.start, task.end)}{" "}
                    Days
                  </div>
                  <div>
                    <b>Status:</b> {task.status_name}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        }}
        TaskListHeader={() => (
          <div
            className="custom-header"
            style={{
              display: "flex",
              height: "50px",
              alignItems: "center",
              borderBottom: "2px solid #e0e0e0",
            }}
          >
            <div
              style={{ width: "60px", textAlign: "center", fontWeight: "bold" }}
            >
              S.No.
            </div>
            <div style={{ width: "310px", fontWeight: "bold" }}>Goals</div>
            <div style={{ width: "80px" }}>Status</div>
          </div>
        )}
        TaskListTable={({ tasks }: { tasks: CustomTask[] }) => (
          <div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`custom-row ${
                  task.task_type === "goal"
                    ? "gantt_grid_goal"
                    : task.task_type === "program"
                    ? "gantt_grid_program"
                    : "gantt_grid_project"
                }`}
                style={{
                  display: "flex",
                  height: "30px",
                  alignItems: "center",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {task.task_type === "goal" ? task.serial_no : ""}
                </div>
                <div
                  style={{
                    width: "300px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {task.hasChildren && (
                    <span
                      onClick={() =>
                        task.task_type === "goal"
                          ? toggleGoal(task.id)
                          : toggleProgram(task.id)
                      }
                      style={{
                        cursor: "pointer",
                        marginRight: "8px",
                        fontSize: "14px",
                        transition: "transform 0.2s",
                        transform:
                          (task.task_type === "goal" &&
                            expandedGoals[task.id]) ||
                          (task.task_type === "program" &&
                            expandedPrograms[task.id])
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                      }}
                    >
                      ▶
                    </span>
                  )}
                  <span style={{ paddingLeft: task.project ? "20px" : "0" }}>
                    {task.name}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "80px",
                    justifyContent: "center",
                  }}
                >
                  <Circle_svg fill={task.status_color} height={20} width={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      />
      <style>
        {`
          .gantt-container {
            border: 1px solid #d0d0d0;
            border-radius: 4px;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .custom-header {
            background-color: blue !important;
            color: white !important;
            font-weight: 600;
            align-items: center;
            padding: 0 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .gantt_grid_goal {
            color: black  !important;
            font-weight: 600;
          }
          .gantt_grid_program {
            color: black  !important;
            font-weight: 500;
          }
          .gantt_grid_project {
            color: black  !important;
            font-weight: 400;
          }
          .tooltip {
            width: 220px !important;
            background: #2c2c2c !important;
            border-radius: 6px !important;
            padding: 10px !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            transition: opacity 0.3s ease !important;
            opacity: 0.95 !important;
          }
          .tooltip-body {
            font-size: 14px;
            color: #fff;
            text-align: left;
            line-height: 1.5;
          }
          .tooltip-text {
            white-space: normal;
            word-break: break-word;
            max-width: 200px;
            font-weight: 500;
          }
          .bar-background {
            fill: none !important;
            background: none !important;
            background-image: none !important;
          }
          .bar-background rect {
            fill: inherit !important;
            stroke: none !important;
          }
          .gantt-task-list {
            background: #fafafa;
          }
          .gantt-task-list-cell {
            border-right: 1px solid #e0e0e0 !important;
            padding: 0 5px;
          }
          .custom-row:hover {
            background: #f5f5f5;
          }
          .grid-header {
            font-weight: 600 !important;
            fill: #333 !important;
            text-transform: uppercase;
          }
          .grid-row {
            stroke: #e0e0e0 !important;
          }
          .lower-text, .upper-text {
            font-size: 12px !important;
            fill: #555 !important;
          }
          .lower-text tspan, .upper-text tspan {
            text-anchor: middle !important;
          }
          /* Override full month names */
          .lower-text tspan:contains("January") { content: "Jan"; }
          .lower-text tspan:contains("February") { content: "Feb"; }
          .lower-text tspan:contains("March") { content: "Mar"; }
          .lower-text tspan:contains("April") { content: "Apr"; }
          .lower-text tspan:contains("May") { content: "May"; }
          .lower-text tspan:contains("June") { content: "Jun"; }
          .lower-text tspan:contains("July") { content: "Jul"; }
          .lower-text tspan:contains("August") { content: "Aug"; }
          .lower-text tspan:contains("September") { content: "Sep"; }
          .lower-text tspan:contains("October") { content: "Oct"; }
          .lower-text tspan:contains("November") { content: "Nov"; }
          .lower-text tspan:contains("December") { content: "Dec"; }
        `}
      </style>
    </div>
  );
};

export default GanttGoalsProgramsProjects;
