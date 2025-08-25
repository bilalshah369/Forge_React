/* eslint-disable no-empty */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetMasterDataPM,
} from "@/utils/PM";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GetTimesheet } from "./TImeSheets";
import { UpdateProjectApproval } from "@/utils/Intake";
import { decrypt, encrypt } from "@/core/AESEncryption";
import { TimesheetModal } from "./TimeSheetModal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Preview_svg } from "@/assets/Icons";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const Timesheet = () => {
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 1,
    },
    {
      label: "Proj. ID",
      key: "customer_project_id",
      visible: true,
      type: "project_id",
      column_width: "75",
      url: "",
      order_no: 2,
    },
    {
      label: "Project Name",
      key: "project_name",
      visible: true,
      type: "project_name",
      column_width: "200",
      url: "",
      order_no: 3,
    },
    {
      label: "Status",
      key: "status_color",
      visible: true,
      type: "status_click",
      column_width: "75",
      url: "",
      order_no: 4,
    },
    {
      label: "Progress",
      key: "progress_percentage",
      visible: true,
      type: "progress",
      column_width: "150",
      url: "",
      order_no: 5,
    },

    {
      label: "Status",
      key: "status_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "",
      order_no: 6,
    },

    {
      label: "%",
      key: "progress_percentage1",
      visible: false,
      type: "progresscount",
      column_width: "70",
      url: "",
      order_no: 7,
    },

    {
      label: "Phase",
      key: "phase_status_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "",
      order_no: 8,
    },
    {
      label: "Classification",
      key: "classification_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "",
      order_no: 9,
    },
    {
      label: "Business Owner",
      key: "business_stakeholder_user_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "",
      order_no: 10,
    },
    {
      label: "Business Owner Department",
      key: "business_stakeholder_dept_name",
      visible: false,
      type: "",
      column_width: "150",
      url: "",
      order_no: 11,
    },
    {
      label: "Project Owner",
      key: "project_owner_user_name",
      visible: true,
      type: "",
      column_width: "135",
      url: "",
      order_no: 12,
    },
    {
      label: "Project Manager",
      key: "project_manager_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "",
      order_no: 13,
    },
    {
      label: "Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "135",
      url: "",
      order_no: 14,
    },
    {
      label: "End Date",
      key: "end_date",
      visible: false,
      type: "date",
      column_width: "135",
      url: "",
      order_no: 15,
    },
    {
      label: "Go-live Date",
      key: "golive_date",
      visible: true,
      type: "date",
      column_width: "135",
      url: "",
      order_no: 16,
    },
    {
      label: "Created By",
      key: "created_by_name",
      visible: false,
      type: "",
      column_width: "135",
      url: "",
      order_no: 17,
    },
    {
      label: "Created On",
      key: "created_at",
      visible: false,
      type: "date",
      column_width: "135",
      url: "",
      order_no: 18,
    },

    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "",
      order_no: 19,
    },
  ]);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [numberOfItemsPerPageList] = useState([2, 3, 4]);
  const [selectedrojectId, setSelectedrojectId] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null); // Store the project ID
  const [sequenceId, setSequenceId] = useState<number | null>(null); // Track sequence_id
  const [statusId, setStatusId] = useState<number | null>(null); // Track status_id
  const [approvalType, setApprovalType] = useState<string>(""); // Track approval_type
  const [type, setType] = useState<string>("");
  const [projIntkAprvlId, setprojIntkAprvlId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [isTimesheetModalVisible, setIsTimesheetModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [projectList, setProjectList] = useState<
    { project_id: number; project_name: string }[]
  >([]);
  const fetchTimesheet = async () => {
    try {
      setdataLoading(true);
      const response = await GetTimesheet("");
      const result = JSON.parse(response);

      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        const list = result.data.projects;
        setProjectList(list);
        console.log("Fetched Timesheet Projects:", result.data.projects);
        setdataLoading(false);
      } else {
        setdataLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setdataLoading(false);
    }
  };
  //const scrollRef = useRef<ScrollView>(null);
  const openTimesheetModal = (row: any) => {
    // setSelectedTeamMember({
    //   name: row.resource_name,
    //   role: row.role_name,
    //   resource_id: row.project_resources_id,
    // });
    setIsTimesheetModalVisible(true);
  };
  const handleOkPress = async (
    projectId: any,
    statusId: any,
    type: any,
    projIntkAprvlId: any,
    sequenceId: any,
    cm?: string
  ) => {
    // Debug the state values
    //console.log('Project ID:', projectId);
    //console.log('Status ID:', statusId);
    ////console.log('Approval Type:', approvalType);
    //console.log('Sequence ID:', sequenceId);
    //console.log('Type:', type);
    //console.log('Comment:', cm);

    if (projectId !== null && statusId !== null) {
      // Construct the payload with the required values
      const payload = {
        proj_intk_aprvl_id: projIntkAprvlId, // Assuming a static approval ID for now
        sequence_id: sequenceId, // Use the state value for sequence ID
        project_id: projectId, // Use the state value for project ID
        status_id: statusId, // Use the state value for status ID
        approval_type: 2, // Use the state value for approval type
        comment: cm, // Use the comment entered by the user
        type: type, // Use the state value for type
      };

      //console.log('Payload:', payload);

      try {
        const response = await UpdateProjectApproval(payload);
        const parsedResponse = JSON.parse(response);
        ////////////debugger;
        if (parsedResponse.status === "success") {
          if (statusId === "5") showAlert("Intake approved successfully");
          else if (statusId === "4") showAlert("Intake reviewed successfully");
          else if (statusId === "10") showAlert("Intake rejected successfully");

          setIsModalVisible(false);
          fetchTimesheet();
        } else {
        }
      } catch (error) {
        console.error("Error creating goal:", error);
      }
    } else {
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };
  const handleApprovePress = async (
    projIntkAprvlId: any,
    seqId: any,
    projId: any,
    approvalType: any,
    status: any,
    type: any
  ) => {
    // Update state with the correct values
    setProjectId(projId);
    setSequenceId(seqId);
    setStatusId(status); // Assuming 4 is the status ID to set here
    setApprovalType(approvalType);
    setprojIntkAprvlId(projIntkAprvlId);
    setType(type); // Assuming a default type, you can change it if needed
    if (type === "review") {
      setIsModalVisible(true); // Open the modal
    } else if (type === "approval") {
      await handleOkPress(projId, status, type, projIntkAprvlId, seqId);
    } else if (type === "reject") {
      setIsModalVisible(true);
    }
    // fetchProjects();
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      const password = "secret-pass";
      const message = "Hello, world!";

      const encrypted = encrypt(message);
      console.log("Encrypted:", encrypted);

      const decrypted = decrypt(encrypted);
      console.log("Decrypted:", decrypted);
      fetchTimesheet();
      localStorage.setItem("UserState", "TimeSheet");
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
                        openTimesheetModal(item);
                        setSelectedrojectId(item.project_id ?? "");
                        const div = document.getElementById("timesheetModal");
                        if (div) {
                          div.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                      }}
                    >
                      <Preview_svg
                        name="alpha-a-box-outline"
                        height={22}
                        width={22}
                        className="[&_path]:fill-white"

                        // Show select for this index
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Change Project Phase"}</TooltipContent>
                </Tooltip>
              </div>
            )}
            isfilter1={false}
            data={projectList}
            columns={headers}
            title="Closed Project"
            exportFileName="closed projects"
            isCreate={false}
            onCreate={() => navigation("/NewIntake")}
            isPagingEnable={true}
            data_type={"Project"}
          />
        </div>
        <div >
          <TimesheetModal
            visible={isTimesheetModalVisible}
            onClose={() => setIsTimesheetModalVisible(false)}
            prefilledData={{ project_id: Number(selectedrojectId) }}
            onReady={(position) => {
              //scrollRef.current?.scrollTo({ y: position, animated: true });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timesheet;
