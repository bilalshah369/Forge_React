import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import { getDesignation, GetUserDept } from "@/utils/Users";
import React, { useEffect, useState } from "react";
import { Header } from "../workspace/PMView";
import { GetProjectApproval, UpdateProjectApproval } from "@/utils/Intake";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApproveSVG, RejectSVG, ReviewSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { useTheme } from "@/themes/ThemeProvider";

const IntakeApprovalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
     const projectIdr = searchParams.get("projectId");
     const [projectId, setProjectId] = useState<number | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [headers, setHeaders] = useState<Header[]>([
    { label: "#", key: "sno", visible: true, type: "sno", column_width: "50", url: "", order_no: 0 },
    { label: "Project ID", key: "customer_project_id", visible: true, type: "project_id", column_width: "150", url: "", order_no: 0 },
    { label: "Project Name", key: "project_name", visible: true, type: "project_name", column_width: "100", url: "", order_no: 0 },
    { label: "Status", key: "status_name", visible: true, type: "", column_width: "200", url: "", order_no: 0 },
    { label: "Classification", key: "classification_name", visible: true, type: "", column_width: "200", url: "", order_no: 0 },
    { label: "Start Date", key: "start_date", visible: true, type: "date", column_width: "200", url: "", order_no: 0 },
    { label: "Action", key: "action", visible: true, type: "actions", column_width: "100", url: "", order_no: 0 },
  ]);
  const [approvalProjects, setApprovalProjects] = useState<any[]>([]);
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

  
  const [statusId, setStatusId] = useState<number | null>(null);
  const [approvalType, setApprovalType] = useState<string>("");
  const [sequenceId, setSequenceId] = useState<number | null>(null);
  const [projIntkAprvlId, setProjIntkAprvlId] = useState<number | null>(null);
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
      const response = await GetProjectApproval({ PageNo: 1, PageSize: 10 });
      const result = JSON.parse(response);
      if (result?.data && Array.isArray(result.data)) {
if(projectIdr)
{
const filtered = result.data.filter(item => item.project_id ===projectIdr);

        // Assign only filtered results
          setApprovalProjects(filtered);
}
else
{
  setApprovalProjects(result.data);
}
        
      } else {
        setApprovalProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleOkPress = async (
    projId: any,
    status: any,
    type: any,
    projIntkAprvlId: any,
    seqId: any,
    cm?: string,
  ) => {
    if (projId !== null && status !== null) {
      const payload = {
        proj_intk_aprvl_id: projIntkAprvlId,
        sequence_id: seqId,
        project_id: projId,
        status_id: status,
        approval_type: 2,
        comment: cm,
        type: type,
      };

      try {
        const response = await UpdateProjectApproval(payload);
        const parsedResponse = JSON.parse(response);

        if (parsedResponse.status === "success") {
          if (status === "5") showAlert("Intake approved successfully");
          else if (status === "4") showAlert("Intake reviewed successfully");
          else if (status === "10") showAlert("Intake rejected successfully");

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

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Intake Approval List</h1>
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
            {item.status === 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      handleApprovePress(item.proj_intk_aprvl_id, item.sequence_id, item.project_id, "2", "4", "review")
                    }
                  >
                    <ReviewSVG height={22} width={22} className="[&_path]:fill-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Review</TooltipContent>
              </Tooltip>
            )}

            {item.status === 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      handleApprovePress(item.proj_intk_aprvl_id, item.sequence_id, item.project_id, "2", "5", "approval")
                    }
                  >
                    <ApproveSVG height={22} width={22} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Approve</TooltipContent>
              </Tooltip>
            )}

            {(item.status === 1 || item.status === 3) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      handleApprovePress(item.proj_intk_aprvl_id, item.sequence_id, item.project_id, "2", "10", "reject")
                    }
                  >
                    <RejectSVG height={22} width={22} className="[&_path]:fill-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Reject</TooltipContent>
              </Tooltip>
            )}
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

      {/* Comment box (instead of modal) */}
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

export default IntakeApprovalPage;
