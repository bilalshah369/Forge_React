/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DeleteSVG, EditSVG, ProjectPhaseSVG } from "@/assets/Icons";
import { FetchPermission } from "@/utils/Permission";
import { GetRoles } from "@/utils/RoleMaster";
import { GetResources } from "@/utils/Resource";
import {
  DeleteMember,
  DeleteNewRequest,
  GetChangeRequest,
  GetTeamMembers,
  MemberChangeRequest,
} from "@/utils/ApprovedProjects";
import AddTeamMemberModal from "../Modals/AddTeamMemberModal";
import AlertBox from "@/components/ui/AlertBox";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
export class Team {
  public projectResourcesId?: number;
  public projectId?: number;
  public resourceId?: number;
  public roleId?: number;
  public actualCost?: string;
  public startDate?: Date;
  public endDate?: Date;
  public availabilityPercentage?: number;
  public isActive?: boolean;
}
type TeamMember = {
  project_resources_id?: number;
  change_request_id?: number;
  resource_name: string;
  role_name: string;
  average_cost: number;
  actual_cost: string;
  working_hours: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  change_request: boolean;
};
const TeamMembersChangeRequest = () => {
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
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [headers, setHeaders] = useState<Header[]>([
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
      label: "Name",
      key: "resource_name",
      visible: true,
      type: "change_request",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Role",
      key: "role_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },

    {
      label: "Cost/hr ($)",
      key: "actual_cost",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "",
      order_no: 0,
    },

    {
      label: "Allocation (%)",
      key: "availability_percentage",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
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
  ]);
  const [isTeamMembersModalVisible, setIsTeamMemberModalVisible] =
    useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [teamMember, setTeamMember] = useState<Team>(new Team());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState(null);

  const [permissions, setPermissions] = useState<number[]>([]);
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

  // Move all fetch functions outside of useEffect
  const fetchTeam = async (pid: number | undefined) => {
    try {
      setdataLoading(true);
      if (!pid) {
        setTeamMembers([]);
        setdataLoading(false);
        return;
      }

      const response = await GetTeamMembers(pid);
      const parsedRes = JSON.parse(response);

      const responseChangeReq = await GetChangeRequest(pid);
      const parsedResChangeReq = JSON.parse(responseChangeReq);

      let finalTeamMembers: TeamMember[] = [];
      if (parsedResChangeReq.status === "success") {
        const teamChangeRequests =
          parsedResChangeReq.data?.team_change_requests ?? [];

        // IDs of all change requests
        const changeRequestResourceIds = teamChangeRequests.map(
          (change: any) => change.request_data?.project_resources_id
        );

        // IDs and a quick map of DELETE actions
        const deleteActionMap: Record<number, boolean> = {};
        teamChangeRequests.forEach((change: any) => {
          if (change.request_data.action === "DELETE") {
            deleteActionMap[change.request_data.project_resources_id] =
              change.change_request_id;
          }
        });
        // Only include change requests that are NOT for DELETE
        const validChangeRequests = teamChangeRequests.filter(
          (change: any) => change.request_data?.action !== "DELETE"
        );

        // Create change request entries (new members)
        const newMembers: TeamMember[] = validChangeRequests.map(
          (change: any): TeamMember => ({
            project_resources_id: change.request_data.project_resources_id,
            resource_name: change.resource_name,
            change_request_id: change.change_request_id,
            role_name: change.role_name,
            average_cost: change.average_cost,
            actual_cost: change.request_data.actual_cost,
            working_hours: change.request_data.working_hours,
            start_date: change.request_data.start_date,
            end_date: change.request_data.end_date,
            is_active: false,
            change_request: true,
          })
        );

        // Filter original active members
        const filteredActiveMembers = parsedRes.data
          ?.filter((member: TeamMember) => {
            if (!member.is_active) return false;

            const hasChange = changeRequestResourceIds.includes(
              member.project_resources_id
            );
            const isMarkedForDelete =
              deleteActionMap[member?.project_resources_id];

            // Keep only if no change OR it's a DELETE action
            return !hasChange || isMarkedForDelete;
          })
          ?.map((member: TeamMember) => ({
            ...member,
            change_request: false,
            ...(deleteActionMap[member?.project_resources_id] && {
              action: "DELETE",
              change_request_id: deleteActionMap[member?.project_resources_id],
            }),
          }));
        const combinedMembers = [
          ...(filteredActiveMembers ?? []),
          ...newMembers,
        ];
        finalTeamMembers = combinedMembers;
      } else {
        finalTeamMembers = parsedRes.data
          ?.filter((member: TeamMember) => member.is_active)
          ?.map((member: TeamMember) => ({
            ...member,
            change_request: false,
          }));
      }
      setTeamMembers(finalTeamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setdataLoading(false);
    }
  };
  const GetRole = async () => {
    try {
      const response = await GetRoles("");
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        setRoles(parsedRes.data.roles);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await GetResources("");
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        setResources(parsedRes.data.resources);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
    }
  };

  const handleEdit = (member) => {
    //console.log('Edit member:', member);
    ////////debugger;
    setSelectedMember(member);
    setIsEditing(true);
    setIsTeamMemberModalVisible(true);
    // Implement edit functionality here
  };

  const handleDelete = async (projectTeamId: number) => {
    if (!projectTeamId) {
      console.error("Invalid Milestone ID");
      return;
    }

    try {
      // Create the payload
      const payload = {
        project_resources_id: projectTeamId,
      };

      //console.log('Deleting Milestone with Payload:', payload);

      // Call the API function to delete the milestone
      const res = await DeleteMember(payload); // Pass the payload to the API

      //console.log('Delete API Response:', res);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        // Refresh the milestone list after deletion
        fetchTeam(parseInt(projectId));
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      setActiveMenu(null); // Close the menu after the operation
    }
  };
  const handleDeleteNewRequest = async (member: any) => {
    const changeId = member?.change_request_id;
    try {
      const res = await DeleteNewRequest(changeId);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        // Refresh the milestone list after deletion
        showAlert("Team Member change deleted successfully.");
        fetchTeam(parseInt(projectId));
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };
  const handleDeleteRequest = async (member: any) => {
    ////////debugger;
    try {
      const payload = {
        project_id: projectId,
        project_resources_id: member?.project_resources_id,
        action: "DELETE",
      };

      const response = await MemberChangeRequest(payload);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        showAlert("Team Member delete request sent successfully.");
        fetchTeam(parseInt(projectId));
        setIsTeamMemberModalVisible(false);
      } else {
        // Alert.alert("Error", parsedRes.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      // Alert.alert("Error", "Failed to submit request. Please try again.");
    }
  };

  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      const initializeData = async () => {
        await Promise.all([fetchResources(), GetRole()]);
        setLoading(false);
      };
      initializeData();
      fetchTeam(parseInt(projectId));
      GetRole();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
          <AdvancedDataTable
            actions={(item) => (
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        handleEdit(item);
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
                        // handleDelete(
                        //   parseInt(item.project_resources_id ?? "", 10)
                        // );

                        if (item?.project_resources_id < 1) {
                          console.log("Delete new request", item);
                          handleDeleteNewRequest(item);
                        } else {
                          console.log("Delete request api", item);
                          handleDeleteRequest(item);
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
            data={teamMembers}
            columns={headers}
            PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            data_type={"Team Member"}
            isCreate={true}
            onCreate={() => {
              setSelectedMember(null);
              setIsTeamMemberModalVisible(true);
            }}
          />
          <AddTeamMemberModal
            isOpen={isTeamMembersModalVisible}
            onClose={() => setIsTeamMemberModalVisible(false)}
            onSubmit={() => {
              fetchTeam(parseInt(projectId));
            }}
            member={selectedMember}
            changeRequest={true}
            isEditing={true}
          />
          <AlertBox
            visible={alertVisible}
            onCloseAlert={closeAlert}
            message={alertMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamMembersChangeRequest;
