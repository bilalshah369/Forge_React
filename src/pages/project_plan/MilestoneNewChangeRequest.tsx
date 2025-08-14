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
  DeleteMilestone,
  DeleteNewRequest,
  GetChangeRequest,
  GetMilestoneNew,
  GetMilestones,
  MilestoneChangeRequest,
} from "@/utils/ApprovedProjects";
import AddTeamMemberModal from "../Modals/AddTeamMemberModal";
import { AddMilestoneModal } from "../Modals/AddMilestoneModal";
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
type Milestone = {
  milestone_id?: number;
  change_request_id?: number;
  milestone_name: string;
  priority: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  change_request: boolean;
};
const MilestoneNewChangeRequest = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
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
      label: "Milestone Name",
      key: "milestone_name",
      visible: true,
      type: "change_request",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Priority",
      key: "priority",
      visible: true,
      type: "priority",
      column_width: "150",
      url: "",
      order_no: 0,
    },

    {
      label: "Description",
      key: "description",
      visible: true,
      type: "desc",
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
      url: "actions",
      order_no: 0,
    },
  ]);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  //console.log(projectId);
  const [loading, setLoading] = useState<boolean>(true);
  const FetchMilestones = async (projectId: number) => {
    try {
      setdataLoading(true);

      const response = await GetMilestones(projectId);
      const parsedRes = JSON.parse(response);

      const responseChangeReq = await GetChangeRequest(projectId);
      const parsedResChangeReq = JSON.parse(responseChangeReq);

      if (parsedResChangeReq.status === "success") {
        const milestoneChangeRequests =
          parsedResChangeReq?.data?.milestone_change_requests ?? [];

        // IDs of all change requests
        const changeRequestMilestoneIds = milestoneChangeRequests.map(
          (change: any) => change.request_data.milestone_id
        );

        // IDs and map of DELETE actions
        const deleteActionMap: Record<number, boolean> = {};
        milestoneChangeRequests.forEach((change: any) => {
          if (change.request_data.action === "DELETE") {
            deleteActionMap[change.request_data.milestone_id] =
              change.change_request_id;
          }
        });

        // Only include change requests that are NOT for DELETE
        const validChangeRequests = milestoneChangeRequests.filter(
          (change: any) => change.request_data.action !== "DELETE"
        );

        // Create change request entries (new milestones)
        const newMilestones: Milestone[] = validChangeRequests.map(
          (change: any): Milestone => ({
            milestone_name: change.request_data.milestone_name,
            milestone_id: change.request_data.milestone_id,
            change_request_id: change.change_request_id,
            priority: change.request_data.priority,
            description: change.request_data.description,
            start_date: change.request_data.start_date,
            end_date: change.request_data.end_date,
            is_active: false,
            change_request: true,
          })
        );

        // Filter original active milestones
        const filteredActiveMilestones = parsedRes.data
          .filter((milestone: Milestone) => {
            if (!milestone.is_active) return false;

            const hasChange = changeRequestMilestoneIds.includes(
              milestone.milestone_id
            );
            const isMarkedForDelete = deleteActionMap[milestone.milestone_id];

            // Keep only if no change OR it's a DELETE action
            return !hasChange || isMarkedForDelete;
          })
          .map((milestone: Milestone) => ({
            ...milestone,
            change_request: false,
            ...(deleteActionMap[milestone.milestone_id] && {
              action: "DELETE",
            }),
            change_request_id: deleteActionMap[milestone.milestone_id],
          }));

        const combinedMilestones = [
          ...filteredActiveMilestones,
          ...newMilestones,
        ];
        setMilestones(combinedMilestones);
      } else {
        // Fallback: just use active milestones
        const activeMilestones = parsedRes.data
          .filter((milestone: Milestone) => milestone.is_active)
          .map((milestone: Milestone) => ({
            ...milestone,
            change_request: false,
          }));

        setMilestones(activeMilestones);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
      //Alert.alert("Error", "Failed to fetch milestones");
    } finally {
      setdataLoading(false);
    }
  };
  const handleEdit = (milestonerow: any) => {
    setIsEditing(true);
    setSelectedMilestone(milestonerow);

    setIsMilestoneModalVisible(true);
    setActiveMenu(null); // Close the menu
    //console.log('Selected Milestone for edit:', selectedMilestone);
  };
  const handleDelete = async (milestoneId: number) => {
    if (!milestoneId) {
      console.error("Invalid Milestone ID");
      return;
    }

    try {
      const payload = {
        milestone_id: milestoneId,
      };

      //console.log('Deleting Milestone with Payload:', payload);

      const res = await DeleteMilestone(payload);
      //console.log('Delete API Response:', res);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        FetchMilestones(parseInt(projectId));
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      setActiveMenu(null);
    }
  };
  const handleDeleteRequest = async (milestoneData: any) => {
    try {
      // Always ensure milestone_id is present and valid
      const milestone_id =
        milestoneData.milestone_id ||
        (milestoneData.request_data &&
          milestoneData.request_data.milestone_id) ||
        "";
      if (!milestone_id) {
        //Alert.alert("Error", "Milestone ID is required for delete request");
        return;
      }
      const payload = {
        project_id: projectId,
        milestone_id,
        sent_to: "",
        action: "DELETE",
        comment: "",
      };
      const response = await MilestoneChangeRequest(payload);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        showAlert("Milestone delete request sent successfully");
        await FetchMilestones(parseInt(projectId));
      } else {
        //Alert.alert("Error", "Failed to send change request");
      }
    } catch (error) {
      console.error("Error in handleDeleteRequest:", error);
      //Alert.alert("Error", "Failed to send change request");
    }
  };

  const handleDeleteNewRequest = async (member: any) => {
    // For change requests, ensure we have a valid change_request_id
    const changeId =
      member?.change_request_id ||
      (member.request_data && member.request_data.change_request_id);
    if (!changeId) {
      //Alert.alert("Error", "Change Request ID is required for delete.");
      return;
    }
    try {
      const res = await DeleteNewRequest(changeId);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        // Refresh the milestone list after deletion
        showAlert("Milestone change deleted successfully");
        await FetchMilestones(parseInt(projectId));
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      //Alert.alert("Error", "Failed to delete milestone. Please try again.");
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      FetchMilestones(parseInt(projectId));
      setLoading(false);
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
                      <EditSVG height={22} width={22} />
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
                          // handleDelete(parseInt(item.milestone_id ?? "", 10));
                          if (item?.change_request && !item?.milestone_id) {
                            console.log("Delete request data", item);
                            handleDeleteNewRequest(item);
                          } else {
                            console.log("Delete request api", item);
                            handleDeleteRequest(item);
                            console.log("Delete request data", item);
                          }
                        }
                      }}
                    >
                      <DeleteSVG height={22} width={22} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Delete"}</TooltipContent>
                </Tooltip>
              </div>
            )}
            data={milestones}
            columns={headers}
            PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            data_type={"Milestone"}
            isCreate={true}
            onCreate={() => {
              setIsEditing(false);
              setSelectedMilestone(null);
              setIsMilestoneModalVisible(true);
            }}
          />
          <AddMilestoneModal
            visible={isMilestoneModalVisible}
            onClose={() => {
              FetchMilestones(parseInt(projectId));
              setIsMilestoneModalVisible(false);
            }}
            projectId={projectId}
            milestone={selectedMilestone}
            isEditable={isEditing}
            isProgress={false}
            changeRequest={true}
          />
          <AlertBox
            visible={alertVisible}
            onCloseAlert={() => setAlertVisible(false)}
            message={alertMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default MilestoneNewChangeRequest;
