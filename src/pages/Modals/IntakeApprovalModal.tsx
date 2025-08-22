import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import { getDesignation, GetUserDept } from "@/utils/Users";
import React, { useEffect, useState } from "react";
import { Header } from "../workspace/PMView";
import { GetProjectApproval, UpdateProjectApproval } from "@/utils/Intake";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApproveSVG, RejectSVG, ReviewSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { useTheme } from "@/themes/ThemeProvider";
 interface UserRole {
  role_id: number;
  role_name: string;
  role_level: string | number; // Depending on how the role_level is represented
  is_active: boolean;
}
export interface User {
  resource_id?: number;
  customer_id?: number;
  department_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  designation?: string;
  user_id?: number | null;
  reporting_to?: number;
  start_date?: string | null;
  end_date?: string | null;
  availability_percentage?: number | null;
  average_cost?: number;
  approval_limit?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string | null;
  updated_at?: string;
  updated_by?: string | null;
  external_resource?: boolean;
  resource_type_id?: number | null;
  role_id?: number | null;
  phone?: string | null;
  manager_name?: string | null;
  department_name?: number;
  role_name?: string | null;
  is_user?: boolean;
  is_super_admin?: boolean;
  selectedRoleID?: number;
}
interface ResourceModalProps {
  isOpen: boolean;

  onClose: () => void;
}

const IntakeApprovalModal: React.FC<ResourceModalProps> = ({
isOpen,onClose
}) => {
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: '#',
      key: 'sno',
      visible: true,
      type: 'sno',
      column_width: '50',
      url: '',
      order_no: 0,
    },

    {
      label: 'Project ID',
      key: 'customer_project_id',
      visible: true,
      type: '',
      column_width: '150',
      url: '',
      order_no: 0,
    },
    {
      label: 'Project Name',
      key: 'project_name',
      visible: true,
      type: 'project_name',
      column_width: '100',
      url: '',
      order_no: 0,
    },

    {
      label: 'Status',
      key: 'status_name',
      visible: true,
      type: '',
      column_width: '200',
      url: '',
      order_no: 0,
    },

    {
      label: 'Classification',
      key: 'classification_name',
      visible: true,
      type: '',
      column_width: '200',
      url: '',
      order_no: 0,
    },
    // {
    //   label: 'Business Owner',
    //   key: 'business_stakeholder_user_name',
    //   visible: false,
    //   type: '',
    //   column_width: '200',
    //   url: '',
    //   order_no: 0,
    // },
    // {
    //   label: 'Business Owner Department',
    //   key: 'business_stakeholder_dept_name',
    //   visible: false,
    //   type: '',
    //   column_width: '200',
    //   url: '',
    //   order_no: 0,
    // },
    {
      label: 'Start Date',
      key: 'start_date',
      visible: true,
      type: 'date',
      column_width: '200',
      url: '',
      order_no: 0,
    },
    /* {
      label: 'Go-Live Date',
      key: 'golive_date',
      visible: true,
      type: 'date',
      column_width: '200',
      url: '',
      order_no: 0,
    }, */
    // {
    //   label: 'Requested By',
    //   key: 'created_by_name',
    //   visible: false,
    //   type: '',
    //   column_width: '200',
    //   url: '',
    //   order_no: 0,
    // },
    // {
    //   label: 'Requested On',
    //   key: 'created_at',
    //   visible: false,
    //   type: 'date',
    //   column_width: '200',
    //   url: '',
    //   order_no: 0,
    // },

    {
      label: 'Action',
      key: 'action',
      visible: true,
      type: 'actions',
      column_width: '100',
      url: '',
      order_no: 0,
    },
  ]);
  const [approvalprojects, setapprovalProjects] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);


  const [projectId, setProjectId] = useState<number | null>(null); // Store the project ID
  const [statusId, setStatusId] = useState<number | null>(null); // Track status_id
  const [approvalType, setApprovalType] = useState<string>(''); // Track approval_type
  const [sequenceId, setSequenceId] = useState<number | null>(null); // Track sequence_id
  const [projectintake, setProjectintake] = useState<number | null>(null);
  const [projIntkAprvlId, setprojIntkAprvlId] = useState(null);
  const [type, setType] = useState<string>('');
  const [comment, setComment] = useState<string>('');
   const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
  };
  const fetchProjects = async () => {
    try {
      
      const response = await GetProjectApproval({
        PageNo: 1,
        PageSize: 10,
      });

      const result = JSON.parse(response);

      if (result?.data && Array.isArray(result.data)) {
        const latestProjects = result.data.slice(0, 5); // Ensure only latest 10 records
        setapprovalProjects(latestProjects);

        
      } else {
        console.error('Invalid Projects data');
        setapprovalProjects([]);
        
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
     
      
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

        if (parsedResponse.status === 'success') {
          if (statusId === '5') showAlert('Intake approved successfully');
          else if (statusId === '4') showAlert('Intake reviewed successfully');
          else if (statusId === '10') showAlert('Intake rejected successfully');

          setIsModalVisible(false);
          fetchProjects();
        } else {
        
        }
      } catch (error) {
        console.error('Error creating goal:', error);
       
      }
    } else {
      
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
    // Update state with the correct values
    setProjectId(projId);
    setSequenceId(seqId);
    setStatusId(status); // Assuming 4 is the status ID to set here
    setApprovalType(approvalType);
    setprojIntkAprvlId(projIntkAprvlId);
    setType(type); // Assuming a default type, you can change it if needed
    if (type === 'review') {
      setIsModalVisible(true); // Open the modal
    } else if (type === 'approval') {
      await handleOkPress(projId, status, type, projIntkAprvlId, seqId);
    } else if (type === 'reject') {
      setType('approval');
      setIsModalVisible(true);
    }
    // fetchProjects();
  };
   const location = useLocation();
    const navigation = useNavigate();
    const {theme} =useTheme();
 useEffect(() => {
     fetchProjects();
    // fetchDepartments();
  }, []);
  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <h2 className="text-lg font-bold text-center">Intake Approval List</h2>
<AdvancedDataTable
            actions={(item) => (
              <div className="flex space-x-2">
                {item.status===3 && <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        handleApprovePress(
                      item.proj_intk_aprvl_id,
                      item.sequence_id,
                      item.project_id,
                      '2',
                      '4',
                      'review',
                    );
                      }}
                    >
                      <ReviewSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Review"}</TooltipContent>
                </Tooltip>}
                {item.status===1 && <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        handleApprovePress(
                      item.proj_intk_aprvl_id,
                      item.sequence_id,
                      item.project_id,
                      '2',
                      '5',
                      'approval',
                    );
                      }}
                    >
                      <ApproveSVG
                                              height={22}
                                              width={22} className="[&_path]:fill-white"
                                            />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Approve"}</TooltipContent>
                </Tooltip>}

                 {(item.status===1  || item.status===3) && <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        handleApprovePress(
                      item.proj_intk_aprvl_id,
                      item.sequence_id,
                      item.project_id,
                      '2',
                      '10',
                      'reject',
                    );
                      }}
                    >
                      <RejectSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Reject"}</TooltipContent>
                </Tooltip>}
                  
              </div>
            )}
           
            data={approvalprojects}
            columns={headers}
            title="Approval Project"
            exportFileName="Approval projects"
            isCreate={false}
            onCreate={() => navigation("/NewIntake")}
            isPagingEnable={true}
            PageNo={1}
            TotalPageCount={1}
           
            data_type={"Project"}
          />
       {/* Footer */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
            
          </div>
      </div>
    </div>
    {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comment here"
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
            />

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setIsModalVisible(false);
                  setComment('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={()=>{handleOkPress(
                    projectId,
                    statusId,
                    type,
                    projIntkAprvlId,
                    sequenceId,
                    comment,
                  )}}
                className="px-4 py-2  text-white rounded"  style={{backgroundColor:theme.colors.drawerBackgroundColor}}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
     <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={alertMessage}
        />

    </>

    
    
  );
};

export default IntakeApprovalModal;
