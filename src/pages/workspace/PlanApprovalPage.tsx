import { getDesignation, GetUserDept } from "@/utils/Users";
import React, { useEffect, useState } from "react";
import { Header } from "../workspace/PMView";
import { GetProjectApproval, UpdateProjectApproval } from "@/utils/Intake";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApproveSVG, Preview_svg, RejectSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { useTheme } from "@/themes/ThemeProvider";
import { GetPlanChangeProjects } from "@/utils/PM";
import { Clock } from "lucide-react";

const PlanApprovalPage: React.FC = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [headers, setHeaders] = useState<Header[]>([
    { label: "#", key: "sno", visible: true, type: "sno", column_width: "50", url: "PlanApproval", order_no: 1 },
    { label: "Proj. ID", key: "customer_project_id", visible: true, type: "project_id", column_width: "100", url: "PlanApproval", order_no: 2 },
    { label: "Project Name", key: "project_name", visible: true, type: "project_name", column_width: "200", url: "PlanApproval", order_no: 3 },
    { label: "Project Owner", key: "project_owner_user_name", visible: true, type: "", column_width: "200", url: "PlanApproval", order_no: 8 },
    { label: "Classification", key: "classification_name", visible: true, type: "", column_width: "200", url: "PlanApproval", order_no: 5 },
    { label: "Go-live Date", key: "golive_date", visible: true, type: "date", column_width: "200", url: "PlanApproval", order_no: 12 },
    { label: "Action", key: "action", visible: true, type: "actions", column_width: "100", url: "PlanApproval", order_no: 15 },
  ]);

  const [approvalProjects, setApprovalProjects] = useState<any[]>([]);
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

  const [projectId, setProjectId] = useState<number | null>(null);
  const [statusId, setStatusId] = useState<number | null>(null);
  const [approvalType, setApprovalType] = useState<string>("");
  const [sequenceId, setSequenceId] = useState<number | null>(null);
  const [projIntkAprvlId, setProjIntkAprvlId] = useState<any>(null);
  const [type, setType] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const navigate = useNavigate();
  const { theme } = useTheme();

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  const fetchProjects = async () => {
    try {
      const response = await GetPlanChangeProjects({ PageNo: 1, PageSize: 10 });
      const result = JSON.parse(response);

      if (result?.data && Array.isArray(result.data)) {
        setApprovalProjects(result.data.slice(0, 10));
      } else {
        setApprovalProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleOkPress = async (
    projectId: any,
    statusId: any,
    type: any,
    projIntkAprvlId: any,
    sequenceId: any,
    cm?: string,
  ) => {
    if (projectId !== null && statusId !== null) {
      const payload = {
        proj_intk_aprvl_id: projIntkAprvlId,
        sequence_id: sequenceId,
        project_id: projectId,
        status_id: statusId,
        approval_type: 2,
        comment: cm,
        type: type,
      };

      try {
        const response = await UpdateProjectApproval(payload);
        const parsedResponse = JSON.parse(response);

        if (parsedResponse.status === "success") {
          if (statusId === "5") showAlert("Intake approved successfully");
          else if (statusId === "4") showAlert("Intake reviewed successfully");
          else if (statusId === "10") showAlert("Intake rejected successfully");

          setIsCommentBoxOpen(false);
          fetchProjects();
        }
      } catch (error) {
        console.error("Error updating approval:", error);
      }
    }
  };

  const handleApprovePress = async (
    projIntkAprvlId: any,
    seqId: any,
    projId: any,
    approvalType: any,
    status: any,
    type: any,
  ) => {
    setProjectId(projId);
    setSequenceId(seqId);
    setStatusId(status);
    setApprovalType(approvalType);
    setProjIntkAprvlId(projIntkAprvlId);
    setType(type);

    if (type === "review" || type === "reject") {
      setIsCommentBoxOpen(true);
    } else if (type === "approval") {
      await handleOkPress(projId, status, type, projIntkAprvlId, seqId);
    }
  };
   const navigation = useNavigate();
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Plan Approval List</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* Table */}
      <AdvancedDataTable
        actions={(item) => (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    navigate(`/ApprovedProjectList/ApproveChangeRequest?projectId=${item.project_id}`)
                  }
                >
                  <Preview_svg height={22} width={22} className="[&_path]:fill-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent>View Change request</TooltipContent>
            </Tooltip>

             {item?.change_requests?.some(
  (cr) => cr.change_type === "MILESTONE_END_DATE"
) && <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log(item);
                        navigation(
                            `/ApprovedProjectList/MilestoneDateApproval?projectId=${item.project_id}`
                          );
                      //   , {
                      // projectId: worker,
                      // _isEdit: false,
                      // _isApproval: true,
                      // redirect: 'PlanApproval',
                   // });
                      }}
                    >
                      <Clock height={22} width={22} strokeWidth={2} 
                      className="text-white"
                       />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Date Change Approval"}</TooltipContent>
                </Tooltip>}
          </div>
        )}
        data={approvalProjects}
        columns={headers}
        title="Approval Project"
        exportFileName="Approval projects"
        isCreate={false}
        onCreate={() => navigate("/NewIntake")}
        isPagingEnable={true}
        PageNo={1}
        TotalPageCount={1}
        data_type={"Project"}
      />

      {/* Comment box */}
      {isCommentBoxOpen && (
        <div className="mt-8 bg-white border rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comment here"
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setIsCommentBoxOpen(false);
                setComment("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleOkPress(projectId, statusId, type, projIntkAprvlId, sequenceId, comment)
              }
              className="px-4 py-2 text-white rounded"
              style={{ backgroundColor: theme.colors.drawerBackgroundColor }}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Alert */}
      <AlertBox visible={alertVisible} onCloseAlert={closeAlert} message={alertMessage} />
    </div>
  );
};

export default PlanApprovalPage;
