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
  GetMilestoneNew,
  GetMilestones,
} from "@/utils/ApprovedProjects";
import AddTeamMemberModal from "../Modals/AddTeamMemberModal";
import { AddMilestoneModal } from "../Modals/AddMilestoneModal";
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
const MilestoneNew = () => {
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
      label: "Milestone Name",
      key: "milestone_name",
      visible: true,
      type: "",
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
  const FetchMilestones = async (prjId) => {
    try {
      setdataLoading(true);
      const response = await GetMilestones(prjId); // Pass projectId here
      const parsedRes = JSON.parse(response);
      //console.log('Get Projects Response:', response);

      if (parsedRes?.status === "success" && Array.isArray(parsedRes.data)) {
        // Filter out milestones where is_active is true
        const activeMilestones = parsedRes.data.filter(
          (milestone) => milestone.is_active === true
        );

        // Update the state with only active milestones
        setMilestones(activeMilestones);
        setdataLoading(false);
      } else {
        console.error("Invalid or empty data");

        setdataLoading(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);

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
        FetchMilestones(projectId);
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      setActiveMenu(null);
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      FetchMilestones(projectId);
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
                          handleDelete(parseInt(item.milestone_id ?? "", 10));
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
              FetchMilestones(projectId);
              setIsMilestoneModalVisible(false);
            }}
            projectId={projectId}
            milestone={selectedMilestone}
            isEditable={isEditing}
            isProgress={false}
            changeRequest={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MilestoneNew;
