
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react"; // Close icon
import { Clock } from "lucide-react"; // Clock icon
import AlertBox from "@/components/ui/AlertBox";
import { ApproveFieldEditRequest, get_field_change_requests } from "../../utils/PM";



import { useTheme } from "@/themes/ThemeProvider";
import { format } from "date-fns";

interface ApproveFieldEditProp {
  field_id: string;
  project_id: number;
  default_text: string;
  is_edit: boolean;
  text_style?: string;
  isRequired: boolean;
  MasterUsers: any;
  onApprove: () => void;
}

export class Label {
  public field_id?: string;
  public new_field_value?: string;
  public label_desc?: string;
  public changeFound?: boolean;
}

type Sizes = {
  id: number;
  value: string;
};
type Priority = Sizes;
type BudgetSize = Sizes;
type ProjectSize = Sizes;

const ApproveFieldEdit: React.FC<ApproveFieldEditProp> = ({
  field_id,
  project_id,
  default_text,
  text_style,
  is_edit,
  isRequired,
  MasterUsers,onApprove
}) => {
    const {theme} =useTheme();
  const [popupVisible, setPopupVisible] = useState(false);
  const [send_to, setSend_to] = useState("");
  const [comment, setComment] = useState("");
  const [label, setLabel] = useState<Label>(new Label());
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [classifications, setClassifications] = useState<any[]>();
  const [goals, setGoals] = useState<any[]>();
  const [programs, setPrograms] = useState<any[]>();
  const [applications, setApplications] = useState<any[]>();
  const [departments, setDepartments] = useState<any[]>();
  const [users, setUsers] = useState<any[]>();
  const [projects, setProjects] = useState<any[]>();
  const [priority, setPriority] = useState<Priority[]>();
  const [budgetSize, setBudgetSize] = useState<BudgetSize[]>();
  const [projectSize, setProjectSize] = useState<ProjectSize[]>();

  // ---- Utility to set master data ----
  const setMasterData = (data: any) => {
    // setClassifications(data.classifications);
    // setGoals(data.goals);
    // setPrograms(data.programs);
    // setApplications(data.applications);
    // setDepartments(data.departments);
    // setUsers(data.resources);
    // setPriority(data.priority);
    // setBudgetSize(data.budget_size);
    // setProjectSize(data.project_size);
  };

  useEffect(() => {
    setMasterData(MasterUsers);

    if (label.field_id === "dependent_projects") {
      setProjects(MasterUsers);
    }
  }, [MasterUsers, label.field_id]);

  // ---- Fetch Change Request ----
  const getLabelInfo = async (id: string) => {
    try {
      const res = await get_field_change_requests(id, project_id);
      //debugger;
      const parsedRes = JSON.parse(res);
//debugger;
      if (parsedRes.status === "success" && parsedRes.data.length > 0) {
        setLabel({
          ...parsedRes.data[0],
          changeFound: parsedRes.data[0].status === 12 || parsedRes.data[0].status === 13,
        });
      } else {
        setLabel((prev) => ({ ...prev, changeFound: false }));
      }
    } catch (error) {
      console.error("Error fetching label info:", error);
    }
  };

  useEffect(() => {
    if (project_id) {
      getLabelInfo(field_id);
    }
  }, [field_id]);

  // ---- Approve / Reject ----
  const handleSave = async () => {
    const payload = { field_id, project_id, status: 13, comment };

    try {
       if (
             
              field_id === "business_stakeholder_user"
            ) {
              
      
              const deptPayload = { field_id:"business_stakeholder_dept", project_id, status: 13, comment };
              await ApproveFieldEditRequest(deptPayload);
            }
            if (
              field_id === "project_owner_user" 
              
            ) {
              
      
              const deptPayload = { field_id:"project_owner_dept", project_id, status: 13, comment };
              await ApproveFieldEditRequest(deptPayload);
            }
      const response = await ApproveFieldEditRequest(payload);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        setAlertMessage("Field Value change request Approved");
        setAlertVisible(true);
        setPopupVisible(false);
        
        setLabel((prev) => ({ ...prev, changeFound: false }));
        onApprove();
      }
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  const handleSaveReject = async () => {
    const payload = { field_id, project_id, status: 11, comment };

    try {
      const response = await ApproveFieldEditRequest(payload);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        setAlertMessage("Field Value change request Rejected");
        setAlertVisible(true);
        setPopupVisible(false);
        setLabel((prev) => ({ ...prev, changeFound: false }));
      }
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  // ---- Resolve new value names ----
  const getNewNames = (field_id?: string) => {
    debugger;
    switch (field_id) {
      case "classification":
        return MasterUsers?.find(
          (item) => item.classification_id?.toString() === label.new_field_value
        )?.classification_name;
      case "goal_id":
        return MasterUsers?.find(
          (item) => item.goal_id?.toString() === label.new_field_value
        )?.goal_name;
      case "program_id":
        return MasterUsers?.find(
          (item) => item.program_id?.toString() === label.new_field_value
        )?.program_name;
      case "business_stakeholder_dept":
      case "project_owner_dept":
        return MasterUsers?.find(
          (item) => item.department_id?.toString() === label.new_field_value
        )?.department_name;
      case "business_stakeholder_user":
      case "project_owner_user":
       
        const userw = MasterUsers?.find(
          (item) => item.user_id?.toString() === label.new_field_value
        );
        return `${userw?.first_name ?? ""} ${userw?.last_name ?? ""}`;
            
        case "priority":
           case "budget_impact":
        return MasterUsers?.find(
          (item) => item.id?.toString() === label.new_field_value
        )?.value;
      case "project_manager_id":
        const user = MasterUsers?.find(
          (item) => item.user_id?.toString() === label.new_field_value
        );
        return `${user?.first_name ?? ""} ${user?.last_name ?? ""}`;
        case "project_size":
       return MasterUsers?.find(
          (item) => item.id?.toString() === label.new_field_value
        )?.value;
        case "impacted_applications":
       return label.new_field_value
    ?.split(",") // split comma separated ids
    .map((id) =>
      MasterUsers?.find(
        (item) => item.application_id?.toString() === id.trim()
      )?.application_name
    )
    .filter(Boolean) // remove undefined if any id not found
    .join(", ");
        case "impacted_function":
      return label.new_field_value
  ?.split(",")                                   // split into array of ids
  .map(id =>
    MasterUsers?.find(item => item.department_id?.toString() === id.trim())?.department_name
  )
  .filter(Boolean)                               // remove undefined/null
  .join(", ");
  case "dependent_projects":
       return label.new_field_value
    ?.split(",") // split comma separated ids
    .map((id) =>
      MasterUsers?.find(
        (item) => item.project_id?.toString() === id.trim()
      )?.project_name
    )
    .filter(Boolean) // remove undefined if any id not found
    .join(", ");
     case "budget_size":
       return MasterUsers?.find(
          (item) => item.id?.toString() === label.new_field_value
        )?.value;
        case "start_date":
          case "end_date":
            case "golive_date":
       return  format(new Date(label.new_field_value), "MM/dd/yyyy")
        
       
      default:
        return label.new_field_value;
    }
  };

  return (
    <div>
      {/* Field Row */}
      <div
        className={`flex items-start ${
          label.changeFound ? "border-2 border-red-500" : ""
        }`}
      >
        <span className={`text-black ${text_style}`}>{default_text}</span>
        {isRequired && <span className="text-red-500 ml-1">*</span>}
        {is_edit && label.changeFound && (
          <button
          type="button"
            className="ml-2 flex items-center"
            onClick={() => setPopupVisible(true)}
          >
            <Clock className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Modal */}
      {popupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[350px] p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Change Request
              </h2>
              <button  type="button" onClick={() => setPopupVisible(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <label className="text-sm text-gray-600">New Value</label>
            <input
              type="text"
              className="w-full border-2 border-gray-300 rounded p-2 mb-2 font-bold text-black"
              value={getNewNames(label.field_id) || ""}
              readOnly
            />

            <textarea
              className="w-full border-2 border-gray-300 rounded p-2 text-black mb-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comment if any"
            />

            <div className="flex flex-col gap-2">
              <button
               type="button"
                onClick={handleSave}
                className="w-full text-white py-2 rounded" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
              >
                Approve change request
              </button>
              <button
               type="button"
                onClick={handleSaveReject}
                className="w-full bg-red-600 text-white py-2 rounded"
              >
                Reject change request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={() => setAlertVisible(false)}
        message={alertMessage}
      />
    </div>
  );
};

export default ApproveFieldEdit;
