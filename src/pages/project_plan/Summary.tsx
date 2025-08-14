/* eslint-disable prefer-const */
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
  DeleteCustomField,
  DeleteMember,
  GetSummary,
  GetCustomFields,
  InsertCustomField,
  StartProject,
  UpdateChangeSendTo,
} from "@/utils/ApprovedProjects";
import AddTeamMemberModal from "../Modals/AddTeamMemberModal";
import ProjectView from "../projects/ProjectView";
import AlertBox from "@/components/ui/AlertBox";
import { GetApprovers } from "@/utils/PM";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
interface CustomProps {
  projectId: number;
  editFieldEnable: boolean;
}
interface FieldValues {
  fieldName: string;
  dataType: string;
  text: string;
}
interface SubmissionProps {
  changeRequest?: boolean;
  isApproval?: boolean;
}
const Summary: React.FC<SubmissionProps> = ({ changeRequest, isApproval }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [selectedDecision, setSelectedDecision] = useState("14");
  const [decisionModal, setDecisionModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertVisibleDone, setAlertVisibleDone] = useState(false);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [send_to, setSend_to] = useState("");
  const [changeRequestMode, setChangeRequestMode] = useState<string>("2");
  const showAlert = (message: string) => {
    setMessage(message);
    setAlertVisible(true);
  };
  const showAlertDone = (message: string) => {
    setAlertMessage(message);
    setAlertVisibleDone(true);
  };
  const closeAlert = () => {
    setAlertVisible(false);
    setMessage("");
    navigation("/PMView");
  };
  const closeAlertDone = () => {
    setAlertVisibleDone(false);
    setAlertMessage("");
    navigation("PMView" as never);
  };
  const location = useLocation();
  const [MasterData, setMasterData] = useState<any[]>();
  const options = {
    execute: true,
    cancel: true,
    onHold: true,
    completeAndClose: true,
    movetoapprove: false,
  };
  const handleSubmit = async () => {
    const payload = {
      project_id: projectId,
      status: Number(selectedDecision),
    };

    //console.log('Payload:', payload);

    try {
      // Await the result from InsertMember
      const response = await StartProject(payload);
      const parsedResponse = JSON.parse(response);
      // Handle the response (assuming it's a JSON object)
      if (parsedResponse && parsedResponse.status === "success") {
        //setMessage(parsedResponse.message);
        showAlert("Decision Updated successfully");
        setDecisionModalVisible(false);
      } else {
        showAlert(parsedResponse.message);
        /*  showAlert(
          'All mandatory fields are not entered.' +
            '\n' +
            'Please update all details and then continue.',
        ); */
        setDecisionModalVisible(false);
      }
    } catch (error: any) {
      console.error("Error submitting member:", error);
      showAlert("All details are not filled");
    }
  };
  const handleSubmitUser = async (
    user: any,
    project_id: number,
    changeRequestMode: string
  ) => {
    try {
      const payload = {
        project_id: project_id,
        sent_to: user,
        comment: "",
        in_person: changeRequestMode === "1" ? true : false,
      };

      const response = await UpdateChangeSendTo(payload);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        showAlert("Change Request Sent Successfully");
      } else {
        showAlert(`Error: ${parsedRes.message}`);
      }
    } catch (error) {
      console.error("Error submitting user:", error);
      //Alert.alert("Error", "Failed to submit user");
    }
  };
  const fetchApprovers = async (prj_id: string) => {
    try {
      const response = await GetApprovers(prj_id);
      const result = JSON.parse(response);

      ////debugger;
      if (result.data.users) {
        setMasterData(result.data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //setGoals([]);
    }
  };
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      fetchApprovers(projectId);
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        {changeRequest ? (
          <>
            <div className="space-y-4 p-6 bg-gray-50 rounded-md shadow-lg mt-5 mb-5">
              {/* Radio Options */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="1"
                    checked={changeRequestMode === "1"}
                    onChange={(e) => {
                      setChangeRequestMode(e.target.value);
                      setSend_to("");
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>In person meeting</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="2"
                    checked={changeRequestMode === "2"}
                    onChange={(e) => setChangeRequestMode(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Send to</span>
                </label>
              </div>

              {/* Dropdown when mode is "Send to" */}
              {changeRequestMode === "2" && (
                <>
                  <p className="text-sm text-gray-600">
                    Select the user responsible to approve the change requests.
                  </p>

                  {MasterData && (
                    <select
                      className="w-full border rounded p-2"
                      value={send_to}
                      onChange={(e) => setSend_to(e.target.value)}
                    >
                      <option value="">Select User</option>
                      {MasterData.map((item) => (
                        <option key={item.user_id} value={item.user_id}>
                          {`${item.first_name} ${item.last_name}`}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              {/* Submit Button */}
              <button
                type="button"
                className={`px-4 py-2 rounded text-white ${
                  MasterData
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={() => {
                  handleSubmitUser(
                    send_to,
                    parseInt(projectId),
                    changeRequestMode
                  );
                  showAlert("Change Request Sent Successfully");
                }}
                disabled={!MasterData}
              >
                {changeRequestMode === "2" ? "Send for approval" : "Approve"}
              </button>

              {/* Alert Box */}
              {/* {alertVisible && (
                <div className="p-3 bg-green-100 border border-green-400 rounded">
                  <div className="flex justify-between items-center">
                    <span>{alertMessage}</span>
                    <button
                      type="button"
                      className="text-green-700 font-bold"
                      onClick={closeAlert}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )} */}
            </div>
          </>
        ) : isApproval ? (
          <></>
        ) : (
          <div className="p-6 bg-gray-50 rounded-md shadow-lg mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              You are now at the final step of the Project Plan Update. Please
              make sure all required fields have been completed. You can proceed
              to submit the project by selecting "Update Project Decision. "The
              available options for the project decision are "Execution," "On
              Hold," or "Cancel."
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-3">
                <button
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-blue-400 rounded shadow"
                  type="button"
                  onClick={() => {
                    setDecisionModalVisible(true);
                  }}
                >
                  Update Project Decision
                </button>
              </div>
            </div>
          </div>
        )}
        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={message}
        />
        <ProjectView />
      </div>
      {decisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">Decision</h2>

            {/* {selectedProjectName && (
              <p className="mb-4 text-gray-700">
                Project Name -{" "}
                <span className="font-normal">{selectedProjectName}</span>
              </p>
            )} */}

            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            >
              {options.execute && <option value="14">Execute</option>}
              {options.cancel && <option value="25">Cancel</option>}
              {options.onHold && <option value="26">On Hold</option>}
              {options.completeAndClose && (
                <option value="32">Complete & Close</option>
              )}
              {options.movetoapprove && (
                <option value="5">Move to approved</option>
              )}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDecisionModalVisible(false);
                }}
                className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
