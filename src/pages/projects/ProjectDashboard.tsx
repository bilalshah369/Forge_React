/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye, Plus, CalendarDays, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FetchPermission } from "@/utils/Permission";
import { FetchallProj, GetApprovers, GetMasterData } from "@/utils/PM";
import {
  AddExternalLinks,
  AddTaskData,
  DeleteExternalLink,
  GetExternalLinks,
  Project,
  Task,
} from "./ProjectProgress";
import { PostAsync_with_token } from "@/services/rest_api_service";
import { AddHistory, GetMilestoneStatus } from "@/utils/ProjectMilestone";
import {
  Circle_svg,
  Delete_svg,
  DeleteSVG,
  Edit_svg,
  EditSVG,
  Monthly_breakdown,
  Plus_svg,
  Send_svg,
} from "@/assets/Icons";
import { format } from "date-fns";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import AlertBox from "@/components/ui/AlertBox";
import { GetAllStatus } from "@/utils/Users";
import { DatePicker } from "rsuite";
import { DeleteRaid, fetchPriorities, InsertRaid } from "../raid/Raid";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BASE_URL = import.meta.env.VITE_BASE_URL;
interface ProjectHistoryItem {
  project_history_id: number;
  created_at: string;
  comment: string;
  status_name: string;
  sent_from_name: string;
  sent_to_name?: string | null;
}
interface HistoryItem {
  weak: string;
  percent_change: number;
  task: string;
  upcomming_task: string;
  accomplishments: string;
  status: number;
  comment: string;
  date_of_update: string;
}
export class Raid {
  raid_id?: number;
  project_id?: number;
  type?: string;
  title?: string;
  driver?: string;
  description?: string;
  impact?: string;
  status?: string;
  next_status?: string;
  priority?: number;
  due_date?: string;
  raid_owner?: number;
  is_active?: boolean;
}
const labelMap = {
  "1": "Risk",
  "2": "Issue",
  "3": "Assumption",
  "4": "Dependency",
  "5": "Decision",
};
const ProjectDashboard = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [project, setProject] = useState<Project>(new Project());
  const [projectCurrentStatus, setProjectCurrentStatus] = useState<string>("");
  const [projectPreviousStatus, setProjectPreviousStatus] =
    useState<string>("");
  const [project_task, setProject_task] = useState<Task>(new Task());
  const [milestones, setMilestones] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projectHistory, setProjectHistory] = useState<ProjectHistoryItem[]>(
    []
  );
  const [decisions, setDecisions] = useState([]);
  const [raids, setRaids] = useState([]);
  const [raid, setRaid] = useState<Raid>(new Raid());
  const [isRaidstoneModalVisible, setIsRaidtoneModalVisible] = useState(false);
  const [last_update_date, setLastUpdateDate] = useState<string>(
    "2025-01-16T05:10:28.083Z"
  );
  const [milestone_statusses, setMilestone_statusses] = useState<any[]>([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState<any>([]);
  const [linkData, setLinkData] = useState<any>({
    project_link_id: 0,
    project_id: projectId,
    link_url: "",
    link_description: "",
  });
  const [statuses, setStatuses] = useState<any[]>();
  const [externalLinkModal, setExternalLinkModal] = useState(false);
  const handleDeleteLink = async (link_id: number) => {
    const payload = link_id;
    try {
      const res = await DeleteExternalLink(payload);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        setDeleteLinkModal(false);
        fetchExternalLinks();
        showAlert("Link deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting external link:", error);
    }
  };
  const [linkTooltipId, setLinkTooltipId] = useState<number | null>(null);
  const [deleteLinkModal, setDeleteLinkModal] = useState(false);
  const [allSelectedMilestone, setAllSelectedMilestone] = useState<number[]>(
    []
  ); // Store selected user IDs
  const [accomplishment, setAccomplishment] = useState(
    project_task.accomplishment || ""
  );
  const [upcomingTask, setUpcomingTask] = useState(
    project_task.upcoming_task || ""
  );
  const [isSentToModalVisible, setIsSentToModalVisible] = useState(false);
  const [dateApprovalMode, setDateApprovalMode] = useState<string>("2");
  const [sentTo, setSentTo] = useState("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [priorities, setPriorities] = useState<any[]>();
  const handleSaveExternalLink = async () => {
    try {
      // if (!validation()) {
      //   return;
      // }
      //linkData.
      //debugger;
      const payload = linkData;
      const response = await AddExternalLinks(payload);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        showAlert("External link saved successfully!");
        // await fetchExternalLinks();
        setExternalLinkModal(false);
        fetchExternalLinks();
      }
    } catch (error) {
      console.error("Error saving external link:", error);
    }
  };
  const HandleSentTo = () => {
    ////debugger;
    if (allSelectedMilestone?.length > 0) {
      handleEstimatedDateChangeAction?.(
        allSelectedMilestone?.join(","),
        "sent",
        sentTo,
        dateApprovalMode
      );
      setAllSelectedMilestone([]);
      FetchallProjectData();
    }
    // else {
    //   handleEstimatedDateChangeAction?.(
    //     milestone_id,
    //     "sent",
    //     sentTo,
    //     dateApprovalMode
    //   );
    // }
    //setEditingIndexDate(null);
    setIsSentToModalVisible(false);
  };
  const handleDelete = async (projectTeamId: number) => {
    if (!projectTeamId) {
      console.error("Invalid Milestone ID");
      return;
    }

    try {
      // Create the payload
      /*  const payload = {
        raid_id: projectTeamId,
      }; */

      //console.log('Deleting Milestone with Payload:', payload);

      // Call the API function to delete the milestone
      const res = await DeleteRaid(projectTeamId);

      //console.log('Delete API Response:', res);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        // Refresh the milestone list after deletion
        setLoading(true);
        await FetchallProjectData();
        setLoading(false);
        showAlert("RAID item deleted successfully");
        //Alert.alert('Success', 'Milestone deleted successfully');
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      //Alert.alert('Error', 'Failed to delete milestone. Please try again.');
    } finally {
      //setActiveMenu(null); // Close the menu after the operation
    }
  };
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const padZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

    const month = padZero(date.getMonth() + 1); // Months are 0-indexed
    const day = padZero(date.getDate());
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    const amPm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    return `${month}/${day}/${year} ${padZero(
      hours
    )}:${minutes}:${seconds} ${amPm}`;
  };
  const checkPermission = async () => {
    try {
      const permissionResponse = await FetchPermission(""); // Fetching permission data
      const parsedResponse =
        typeof permissionResponse === "string"
          ? JSON.parse(permissionResponse)
          : permissionResponse;

      if (
        !parsedResponse ||
        !parsedResponse.data ||
        !parsedResponse.data.user_permissions
      ) {
        throw new Error("Invalid response format");
      }

      const permissionData = parsedResponse.data.user_permissions || [];

      const permissionIds = permissionData.map(
        (perm: { permission_id: number }) => perm.permission_id
      );

      setPermissions(permissionIds);
      console.log("Permission for user is", permissionIds);
    } catch (error) {
      console.error("Error retrieving permissions:", error);
    }
  };

  const FetchallProjectData = async () => {
    setLoading(true);
    try {
      const response = await FetchallProj(projectId);
      //console.log(response);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        setProject(parsedRes.data.project[0]);
        setProjectCurrentStatus(parsedRes.data.project[0]?.status_color);
        console.log("project detils", parsedRes.data.project);
        setMilestones(parsedRes.data.milestones);
        ////////debugger;
        console.log("setMilestones", parsedRes.data.milestones);
        setTeamMembers(parsedRes.data.project_team);
        console.log("setTeamMembers", parsedRes.data.project_team);
        setProjectHistory(parsedRes.data.project_history);
        console.log("setProjectHistory", parsedRes.data.project_history);
        setRaids(parsedRes?.data.raid);
        console.log("setRaids", parsedRes.data.raid);
        setDecisions(parsedRes.data.milestones_issue);
        setLastUpdateDate(parsedRes.data.project[0]?.updated_at);
        //////debugger;
        if (parsedRes?.data.project_task?.length > 0) {
          // Find the maximum `created_at` date
          const mostRecentDate = parsedRes.data.project_task.reduce(
            (max: any, task1: any) => {
              const taskDate = new Date(task1.created_at).getTime();
              return taskDate > max ? taskDate : max;
            },
            0
          );

          // Filter tasks that match the most recent `created_at`
          const mostRecentTasks = parsedRes.data.project_task.filter(
            (task1: any) =>
              new Date(task1.created_at).getTime() === mostRecentDate
          );
          const mostRecentTask =
            mostRecentTasks.length > 0 ? mostRecentTasks[0] : null;
          setProject_task(mostRecentTask);
          setAccomplishment(mostRecentTask.accomplishment);
          setUpcomingTask(mostRecentTask.upcoming_task);
          //debugger;
        } else {
          setProject_task(new Task());
        }

        if (projectPreviousStatus !== parsedRes.data.project[0].status_name) {
          if (
            parsedRes.data.project[0]?.dependent_projects !== "" &&
            parsedRes.data.project[0]?.dependent_projects != null
          ) {
            //let customerId = await getCustomerId();
            if (projectPreviousStatus !== "") {
              var uri = `${BASE_URL}/chartsApis/send_dependent_project_alert`;
              const token = localStorage.getItem("Token");
              console.log("payload started");
              const payload = {
                project_id: parsedRes.data.project[0].project_id,
                dependent_project_id:
                  parsedRes.data.project[0].dependent_projects,
                previous_status: projectPreviousStatus,
                current_status: parsedRes.data.project[0]?.status_name,
              };
              console.log("uri" + uri);
              console.log("payload" + payload);
              const jsonResult = await PostAsync_with_token(
                uri,
                JSON.stringify(payload),
                token
              );
              console.log(jsonResult);
            }

            ////////debugger
            setProjectPreviousStatus(parsedRes.data.project[0]?.status_name);
            //return JSON.stringify(jsonResult ?? '');
          }
        }
      } else {
        console.error(
          "Failed to fetch users:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
    //setLoading(false);
  };
  const fetchMilestoneStatus = async (mile_id: string) => {
    try {
      const response = await GetMilestoneStatus(mile_id);
      //console.log(response);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        //////////debugger;
        milestone_statusses.splice(0, milestone_statusses.length);
        var std = parsedRes.data.statuses;
        std.forEach((element: any) => {
          milestone_statusses.push({
            label: element.status_name,
            value: element.status_id,
            group: element.description,
            color: element.status_color?.trim(),
          });
        });
        //setDecisions(decisions);
        setMilestone_statusses(milestone_statusses);
      } else {
        console.error(
          "Failed to fetch users:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
  const fetchMasters = async () => {
    try {
      const response = await GetMasterData();
      const result = JSON.parse(response);

      if (result.data.departments) {
        setDepartments(result.data.departments);
      }
      if (result.data.users) {
        //setUsers(result.data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //setGoals([]);
    }
  };
  const fetchApprovers = async (prj_id: string) => {
    try {
      const response = await GetApprovers(prj_id);
      const result = JSON.parse(response);

      ////debugger;
      if (result.data.users) {
        setUsers(result.data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //setGoals([]);
    }
  };
  const fetchExternalLinks = async () => {
    try {
      // //debugger;
      const res = await GetExternalLinks(parseInt(projectId), 1, 10);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        //debugger;
        setLinkData(parsedRes.data.project_links[0]);
      } else if (parsedRes.status === "Not Found") {
        setLinkData({
          project_link_id: 0,
          project_id: projectId,
          link_url: "",
          link_description: "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleUserSelection = (mile_id: number) => {
    const isSelected = allSelectedMilestone.includes(mile_id);

    if (isSelected) {
      setAllSelectedMilestone(
        allSelectedMilestone.filter((id) => id !== mile_id)
      );
    } else {
      ////debugger
      setAllSelectedMilestone([...allSelectedMilestone, mile_id]);
    }
    //console.log('Selected User IDs:', allSelectedUsersID);
  };
  const handleEstimatedDateChangeAction = async (
    milestone_id: any,
    val: any,
    sent_to: any,
    in_person?: string
  ) => {
    ////debugger;
    setLoading(true);

    var payload = {};
    //console.log(`Selected value for item ${milestone_id}:`, val);
    if (val === "sent") {
      //setLoading(true);
      milestone_id
        ?.toString()
        .split(",")
        .forEach(async (element) => {
          payload = {
            milestone_id: element,
            project_id: projectId,
            sent_to: sent_to ?? "",
            in_person: in_person === "1" ? true : false,
          };
          const response = await AddHistory(payload);
          const parsedRes = JSON.parse(response);
          if (parsedRes.status === "message") {
            //console.log(' History Added succesfully');
            //await fetchMilestonesList(projectId?.toString());
            showAlert(parsedRes.message);
            await FetchallProjectData();
            //alert(val);
            //await FetchallProjectData();

            setLoading(false);
          } else if (parsedRes.status === "error") {
            //console.log(' History Added succesfully');
            //await fetchMilestonesList(projectId?.toString());
            showAlert(parsedRes.message);
            //await FetchallProjectData();

            setLoading(false);
          } else {
            showAlert(parsedRes.message);
            // alert(val);
            await FetchallProjectData();
            setLoading(false);
          }
        });
    } else {
      payload = {
        milestone_id: milestone_id,
        project_id: projectId,
        revised_end_date: val ?? "",
        sent_to: sent_to ?? "",
      };
      const response = await AddHistory(payload);
      //////debugger;
      const parsedRes = JSON.parse(response);
      //////////////debugger;
      if (parsedRes.status === "message") {
        //////////////debugger;
        //console.log(' History Added succesfully');
        //await fetchMilestonesList(projectId?.toString());
        showAlert(parsedRes.message);

        await FetchallProjectData();
        //alert(val);
        setLoading(false);
      } else if (parsedRes.status === "error") {
        //////////////debugger;
        //console.log(' History Added succesfully');
        //await fetchMilestonesList(projectId?.toString());
        showAlert(parsedRes.message);
        //await FetchallProjectData();

        setLoading(false);
      } else {
        await FetchallProjectData();
        setLoading(false);
      }
      //setEditingIndex(null); // Reset editing state
      setLoading(false);
    }
    //setLoading(false);
  };
  const handleSelectChange = async (milestone_id: any, val: any) => {
    //////////////debugger;
    setLoading(true);
    //console.log(`Selected value for item ${milestone_id}:`, val);

    const payload = {
      milestone_id: milestone_id,
      project_id: projectId,
      status: val,
    };
    const response = await AddHistory(payload);
    const parsedRes = JSON.parse(response);
    //////////////debugger;
    if (parsedRes.status === "message") {
      //////////////debugger;
      //console.log(' History Added succesfully');
      //await fetchMilestonesList(projectId?.toString());
      showAlert(parsedRes.message);
      await FetchallProjectData();

      setLoading(false);
    } else if (parsedRes.status === "error") {
      //////////////debugger;
      //console.log(' History Added succesfully');
      //await fetchMilestonesList(projectId?.toString());
      showAlert(parsedRes.message);
      //await FetchallProjectData();

      setLoading(false);
    } else {
      await FetchallProjectData();
      setLoading(false);
    }
    setEditingIndex(null); // Reset editing state
    setLoading(false);
  };
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const closeAlert = async () => {
    setAlertVisible(false);
    setAlertMessage("");
    //setdataLoading(true);
    //await FetchallProjectData();
    //setdataLoading(false);
    //FetchallProjectData();
    // setIsRaidtoneModalVisible(false);
    // setIsDecisionModal(false);
  };

  const AddTask = async (val: any) => {
    ////console.log(`Selected value for item ${milestone_id}:`, val);

    const payload = {
      project_id: projectId,
      upcoming_task: val.upcoming_task ?? "",
      accomplishment: val.accomplishment ?? "",
      is_active: true,
    };
    //////debugger;
    const response = await AddTaskData(payload);
    const parsedRes = JSON.parse(response);
    if (parsedRes.status === "success") {
      //await FetchallProjectData();
      //navigation(`ProjectProgressOverview?ProjectId=${projectId}`);
    } else {
      console.error(
        "Failed to fetch task:",
        parsedRes.message || "Unknown error"
      );
    }
    setEditingIndex(null); // Reset editing state
  };
  const fetchAllStatus = async (typeLabel: string) => {
    try {
      const response = await GetAllStatus(typeLabel);
      const parsedRes =
        typeof response === "string" ? JSON.parse(response) : response;
      ////console.log(parsedRes.data.resource_types);
      if (parsedRes.status === "success") {
        setStatuses(parsedRes.data.statuses);
      } else {
        console.error(
          "Failed to fetch user roles:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Error Fetching User Roles:", err);
    }
  };
  const fetchPrioritiesData = async () => {
    try {
      setLoading(true);
      const response = await fetchPriorities();

      // If the response is a string (e.g., JSON string), parse it
      const parsed =
        typeof response === "string" ? JSON.parse(response) : response;

      console.log("Parsed Response:", parsed);

      const result = parsed.data;

      if (Array.isArray(result)) {
        setPriorities(result.filter((p) => p.is_active));
      } else {
        console.error("Expected array, got:", result);
        setPriorities([]);
      }
    } catch (error) {
      console.error("Error fetching priorities:", error);
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };
  const handleRaidSubmit = async () => {
    // if (!validateForm()) {
    //   return;
    // }
    try {
      //debugger;
      console.log(raid);
      const response = await InsertRaid(raid);
      const result = JSON.parse(response);
      setIsRaidtoneModalVisible(false);
      showAlert(result.message);

      //////////debugger;
      console.log("New raid:", result);
      await FetchallProjectData();
    } catch (error) {
      console.error("Error submitting RAID:", error);
      //alert('Error', 'Failed to submit RAID. Please try again.');
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      const reloadData = async () => {
        setLoading(true);
        //setProject_task(new Task());
        await checkPermission();
        await FetchallProjectData();
        await fetchMilestoneStatus("");
        await fetchApprovers(projectId?.toString());
        await fetchExternalLinks();
        await fetchMasters();
        setdataLoading(false);
        setLoading(false);
      };

      reloadData();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <h1 className="text-lg font-semibold text-foreground">
            Project ID : {project?.customer_project_id}
          </h1>
          <div className="flex items-center gap-4">
            {/* <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Links
            </Button> */}
            <div>
              {linkData.link_url !== "" ? (
                <div className="flex items-center mr-2.5">
                  {/* Link display */}
                  <button
                    className="p-2"
                    onClick={() => window.open(linkData?.link_url, "_blank")}
                  >
                    <div
                      onMouseEnter={() =>
                        setLinkTooltipId(linkData?.project_link_id)
                      }
                      onMouseLeave={() => setLinkTooltipId(null)}
                      className="relative"
                    >
                      <span className="text-blue-600 underline cursor-pointer">
                        {linkData?.link_url?.length > 20
                          ? linkData?.link_url?.slice(0, 20) + "..."
                          : linkData?.link_url}
                      </span>

                      {/* Tooltip */}
                      {linkTooltipId === linkData?.project_link_id && (
                        <div
                          className="absolute top-full mt-1 rounded bg-black px-2 py-1 text-white text-sm whitespace-nowrap z-50"
                          style={{
                            width: linkData.link_description.length * 6 + 14,
                          }}
                        >
                          {linkData.link_description}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Edit Button */}
                  <button
                    className="p-1"
                    onClick={() => setExternalLinkModal(true)}
                  >
                    <Edit_svg height={20} width={20} />
                  </button>

                  {/* Delete Button */}
                  <button
                    className="p-1"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete?"))
                        handleDeleteLink(linkData?.project_link_id);
                    }}
                  >
                    <Delete_svg height={20} width={20} />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  //className="gap-2"
                  onClick={() => setExternalLinkModal(true)}
                  className="flex items-center text-black gap-1"
                >
                  <Plus_svg height={20} width={20} />
                  Links
                </Button>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Last Updated On :{formatDate(last_update_date)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Details */}
          <div className="space-y-6">
            <Card className="p-6 shadow-lg shadow-blue-500/40">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <a
                    href="#"
                    onClick={() => {
                      navigation(`/PMView/ProjectView?projectId=${projectId}`);
                    }}
                    className="text-sm font-medium cursor-pointer hover:underline text-blue-600"
                  >
                    View More Details
                  </a>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Start Date
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {project?.start_date
                        ? format(new Date(project.start_date), "MM/dd/yyyy")
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Project Name
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {(project?.project_name?.length ?? 0) > 20
                        ? project?.project_name?.slice(0, 20) + "..."
                        : project?.project_name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Project Manager
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {project?.project_manager_name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Department
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {project?.project_owner_dept_name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Go-live Date
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {project?.golive_date
                        ? format(new Date(project.golive_date), "MM/dd/yyyy")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Columns - Status and Milestones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Budget Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground mt-1">
                    Current Week Status
                  </span>
                  <div className="w-3 h-3 bg-status-success rounded-full">
                    {" "}
                    <Circle_svg
                      height={18}
                      width={18}
                      fill={projectCurrentStatus?.toString().trim() || "#000"}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <Button
                  variant="outline"
                  size="sm"
                  //className="gap-2"
                  onClick={() => {
                    navigation("/PMView/BudgetForecast");
                  }}
                  className="flex items-center text-black gap-1 w-full"
                >
                  <Monthly_breakdown height={18} width={18} fill="#000" />
                  Budget Forecast
                </Button>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    //className="gap-2"
                    onClick={() => {
                      if (allSelectedMilestone.length > 0) {
                        setIsSentToModalVisible(true);
                      }
                    }}
                    className="flex items-center text-black gap-1"
                  >
                    <Send_svg height={20} width={20} fill="black" />
                    Send date change for approval
                  </Button>
                </div>
              </Card>
            </div>

            {/* Milestones Table */}
            <h2 className="text-lg font-semibold text-blue-600">
              Project Milestones
            </h2>
            <AdvancedDataTable
              data={milestones}
              MasterMilestoneStatus={milestone_statusses}
              checkEnable={true}
              onCheckChange={function (worker: number): void {
                handleUserSelection(worker);
              }}
              columns={[
                {
                  label: "#",
                  key: "sno",
                  visible: true,
                  type: "sno",
                  column_width: "50",
                  url: "",
                  order_no: 0,
                },
                {
                  label: "[]",
                  key: "milestone_id",
                  visible: true,
                  type: "check",
                  column_width: "50",
                  url: "",
                  order_no: 0,
                },
                {
                  label: "Milestone Name",
                  key: "milestone_name",
                  visible: true,
                  column_width: "120",
                  type: "",
                  url: "",
                  order_no: 0,
                },
                {
                  label: "Start Date",
                  key: "start_date",
                  visible: true,
                  column_width: "80",
                  type: "date",
                  url: "",
                  order_no: 0,
                },
                {
                  label: "End Date",
                  key: "end_date",
                  column_width: "80",
                  visible: true,
                  type: "date",
                  url: "",
                  order_no: 0,
                },
                {
                  label: "Estimated End Date",
                  key: "revised_end_date",
                  visible: true,
                  type: "estimated_date",
                  column_width: "150",
                  url: "",
                  order_no: 0,
                },
                {
                  label: "Current Status",
                  key: "status",
                  visible: true,
                  type: "change_status",
                  column_width: "100",
                  url: "",
                  order_no: 0,
                },
              ]}
              PageNo={1}
              TotalPageCount={1}
              rowsOnPage={100}
              data_type={"Milestone"}
              onEstimatedChangeAction={async function (
                worker1?: string,
                worker2?: string,
                worker3?: string,
                worker4?: string
              ): Promise<void> {
                ////debugger;
                await handleEstimatedDateChangeAction(
                  worker1,
                  worker2,
                  worker3,
                  worker4
                );
              }}
              MasterUsers={users}
              onStatusChangeAction={function (
                worker1?: string,
                worker2?: string
              ): void {
                handleSelectChange(worker1, worker2);
              }}
            />
          </div>
        </div>

        {/* Bottom Section - Description and Tasks */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Project Description
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {project?.business_desc}
            </p>
          </Card>

          <div className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row gap-6">
            {/* Recent Accomplishments */}
            <div className="flex flex-col w-full md:w-1/2">
              <label className="font-medium text-gray-700 mb-1">
                Recent Accomplishments
              </label>
              <textarea
                className="border rounded p-2 min-h-[120px] resize-none"
                placeholder="Enter accomplishments"
                value={accomplishment}
                onChange={(e) => {
                  const text = e.target.value;
                  setAccomplishment(text);

                  AddTask?.({
                    ...project_task,
                    accomplishment: text,
                    upcoming_task: upcomingTask,
                  });
                }}
              />
            </div>

            {/* Upcoming Tasks */}
            <div className="flex flex-col w-full md:w-1/2">
              <label className="font-medium text-gray-700 mb-1">
                Upcoming Tasks
              </label>
              <textarea
                className="border rounded p-2 min-h-[120px] resize-none"
                placeholder="Enter upcoming task"
                value={upcomingTask}
                onChange={(e) => {
                  const text = e.target.value;
                  setUpcomingTask(text);

                  AddTask?.({
                    ...project_task,
                    accomplishment,
                    upcoming_task: text,
                  });
                }}
              />
            </div>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-blue-600 mb-4">
          RAID & Decisions
        </h2>
        <AdvancedDataTable
          actions={(item) => (
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      console.log("View", item);
                      setRaid(item);
                      setIsRaidtoneModalVisible(true);
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
                          "Are you sure you want to delete this Milestone ?"
                        )
                      ) {
                        handleDelete(parseInt(item.raid_id ?? "", 10));
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
          data={raids}
          columns={[
            {
              label: "#",
              key: "sno",
              visible: true,
              type: "sno",
              column_width: "",
              url: "",
              order_no: 0,
            },
            {
              label: "Title",
              key: "title",
              visible: true,
              type: "",
              url: "",
              order_no: 0,
              column_width: "",
            },
            {
              label: "Type",
              key: "type",
              visible: true,
              type: "raid",
              url: "",
              order_no: 0,
              column_width: "",
            },
            {
              label: "Priority",
              key: "priority_name",
              visible: true,
              type: "",
              url: "",
              order_no: 0,

              column_width: "",
            },
            {
              label: "Description",
              key: "description",
              visible: true,
              type: "desc",
              url: "",
              order_no: 0,

              column_width: "",
            },
            {
              label: "Status",
              key: "status_name",
              visible: true,
              type: "",
              url: "",
              order_no: 0,

              column_width: "",
            },
            {
              label: "Mitigation Plan",
              key: "next_status",
              visible: true,
              type: "",
              url: "",
              order_no: 0,

              column_width: "",
            },
            {
              label: "Driver",
              key: "driver",
              visible: true,
              type: "",
              url: "",
              order_no: 0,

              column_width: "",
            },
            {
              label: "Due Date",
              key: "due_date",
              visible: true,
              type: "date",
              url: "",
              order_no: 0,

              column_width: "",
            },
            {
              label: "Action",
              key: "action",
              visible: true,
              type: "actions",
              column_width: "100",
              url: "",
              order_no: 0,
            },
          ]}
          title="Project Dashboard"
          //pageSize={3}
          exportFileName="projects"
          isPagingEnable={true}
          PageNo={1}
          TotalPageCount={1}
          rowsOnPage={100}
          data_type="Item"
          isCreate={true}
          onCreate={() => {
            setRaid({});
            setIsRaidtoneModalVisible(true);
          }}
        />
      </div>
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
      {isSentToModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Send for Approval
            </h2>

            {/* Radio Options */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="1"
                  checked={dateApprovalMode === "1"}
                  onChange={(e) => {
                    setDateApprovalMode(e.target.value);
                    e.target.value === "1" && setSentTo("");
                  }}
                  className="text-blue-600"
                />
                <span className="text-gray-800">In person meeting</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="2"
                  checked={dateApprovalMode === "2"}
                  onChange={(e) => setDateApprovalMode(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-800">Send to</span>
              </label>
            </div>

            {/* Dropdown */}
            {users && dateApprovalMode === "2" && (
              <>
                <p className="text-sm text-gray-700 text-center mb-3">
                  Please select a user to approve the change(s) to the
                  "Estimated End Date".
                </p>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
                  value={sentTo}
                  onChange={(e) => setSentTo(e.target.value)}
                >
                  <option value="">Select User for Approval</option>
                  {users.map((item) => (
                    <option key={item.user_id} value={item.user_id}>
                      {item.first_name} {item.last_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                onClick={() => {
                  //setMilestone_id("");
                  setSentTo("");
                  //setEstimatedDate("");
                  setIsSentToModalVisible(false);
                  setDateApprovalMode("2");
                }}
              >
                Cancel
              </button>
              <Button
                className="px-4 py-2 rounded-lg text-white"
                variant="default"
                onClick={HandleSentTo}
              >
                {false
                  ? "Updating..."
                  : dateApprovalMode === "2"
                  ? "Send approval request"
                  : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {externalLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-center text-blue-800 mb-4">
              External Links
            </h2>
            <form
              onSubmit={() => {
                handleSaveExternalLink();
                setExternalLinkModal(false);
              }}
            >
              {/* Form Fields */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Link URL
                  </label>
                  <input
                    required
                    type="text"
                    className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={linkData.link_url}
                    onChange={(e) =>
                      setLinkData({ ...linkData, link_url: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <input
                    required
                    type="text"
                    className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={linkData.link_description}
                    onChange={(e) =>
                      setLinkData({
                        ...linkData,
                        link_description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setExternalLinkModal(false)}
                  className="bg-gray-200 text-black font-semibold px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 text-white font-semibold px-4 py-2 rounded hover:bg-blue-900"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRaidstoneModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
            {/* Title */}
            <h2 className="text-xl font-bold text-center text-blue-900 mb-6">
              RAID Details
            </h2>

            {/* Form */}
            <form
              className="space-y-4"
              id="raidForm"
              onSubmit={(e) => {
                //debugger;
                e.preventDefault();
                raid.project_id = parseInt(projectId);
                // console.log(raid);
                handleRaidSubmit();
              }}
            >
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    required
                    value={raid.title}
                    onChange={(e) => {
                      setRaid({ ...raid, title: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    required
                    value={raid.type}
                    onChange={async (e) => {
                      setRaid({ ...raid, type: e.target.value });
                      await fetchAllStatus(labelMap[e.target.value]);
                      await fetchPrioritiesData();
                    }}
                  >
                    <option value="">Select Type</option>
                    {[
                      {
                        label: "Risk",
                        value: "1",
                      },
                      {
                        label: "Issue",
                        value: "2",
                      },
                      {
                        label: "Assumption",
                        value: "3",
                      },
                      {
                        label: "Dependency",
                        value: "4",
                      },
                      {
                        label: "Decision",
                        value: "5",
                      },
                    ].map((item) => (
                      <option key={item.value} value={item.value?.toString()}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Driver</label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    value={raid.driver}
                    onChange={(e) => {
                      setRaid({ ...raid, driver: e.target.value });
                    }}
                  >
                    <option>Select Driver</option>
                    {[
                      {
                        label: "Scope",
                        value: "Scope",
                      },
                      {
                        label: "Schedule",
                        value: "Schedule",
                      },
                      {
                        label: "Budget",
                        value: "Budget",
                      },
                    ].map((item) => (
                      <option key={item.value} value={item.value?.toString()}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-bold mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={raid.description}
                  required
                  rows={4}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setRaid({ ...raid, description: newTotal });
                  }}
                ></textarea>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    RAID Status <span className="text-red-500">*</span>
                  </label>
                  {/* <input
                    type="text"
                    placeholder='Please select "Type" first'
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  /> */}
                  <select
                    //disabled={raid.type ? false : true}
                    required
                    disabled={!raid.type}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    value={raid.status}
                    onChange={(e) => {
                      setRaid({ ...raid, status: e.target.value });
                    }}
                  >
                    <option value="">Select Status</option>
                    {statuses?.map((item) => (
                      <option
                        key={item.status_id}
                        value={item.status_id?.toString()}
                      >
                        {item.status_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    {raid.type === "5" ||
                    raid.type?.toLowerCase() === "decision"
                      ? "Date"
                      : "Due Date"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    oneTap
                    value={new Date(raid.due_date)}
                    onChange={(date) => {
                      setRaid({
                        ...raid,
                        due_date: date?.toLocaleDateString("en-CA"),
                      });
                    }}
                    format="MM/dd/yyyy"
                    placement="bottomEnd"
                    placeholder="mm/dd/yyyy"
                    editable={false}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Owner <span className="text-red-500">*</span>
                  </label>

                  <select
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    value={raid.raid_owner}
                    onChange={(e) => {
                      setRaid({
                        ...raid,
                        raid_owner: parseInt(e.target.value),
                      });
                    }}
                  >
                    <option value="">Select RAID Owner</option>
                    {users?.map((item) => (
                      <option
                        key={item.user_id}
                        value={item.user_id?.toString()}
                      >
                        {item.first_name + " " + item.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Mitigation Plan
                  </label>
                  <input
                    value={raid.next_status}
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    onChange={(e) => {
                      // const newTotal = e.target.value;
                      const newTotal = e.target.value;
                      setRaid({ ...raid, next_status: newTotal });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    value={raid.priority}
                    onChange={(e) => {
                      setRaid({
                        ...raid,
                        priority: parseInt(e.target.value),
                      });
                    }}
                  >
                    <option value="">Select Priority</option>
                    {priorities?.map((item) => (
                      <option key={item.id} value={item.id?.toString()}>
                        {item.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  className="bg-gray-200 text-black px-4 py-2 rounded font-bold"
                  onClick={() => setIsRaidtoneModalVisible(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("raidForm").requestSubmit()
                  }
                  className="bg-blue-900 text-white px-4 py-2 rounded font-bold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
