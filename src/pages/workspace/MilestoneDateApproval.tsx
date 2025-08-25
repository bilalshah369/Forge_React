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
import { ApproveSVG, DeleteSVG, EditSVG, ProjectPhaseSVG, RejectSVG, ReviewSVG } from "@/assets/Icons";
import { GetPlanChangeProjects } from "@/utils/PM";
import { GetfetchMilestones } from "@/utils/ProjectMilestone";
import { GetChangeRequest, HandleChangeRequest } from "@/utils/ApprovedProjects";
import { format, isValid, parseISO } from "date-fns";
import AlertBox from "@/components/ui/AlertBox";

const MilestoneDateApproval = () => {
    const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
      const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
   const [milestones, setMilestones] = useState([]);
     const [milestoneHistory, setMilestoneHistory] = useState([]);
  const [changeRequestData, setChangeRequestData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
     const [selectedMilestone, setSelectedMilestone] = useState<string>('');
      const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  
  const closeAlert = async () => {
    setAlertVisible(false);
    setAlertMessage('');

  };
  const fetchProjects = async () => {
      try {
       

        const response = await GetPlanChangeProjects({
          PageNo: 1,
          PageSize: 5, // Ensure the API is fetching only 10 items
        });
        ////debugger;
        const result = JSON.parse(response);

        if (result.status === 'error') {
          setProjects([]);
          
          return;
        }

        // Extract the latest 10 records
        const latestProjects = result.data.slice(-5).reverse();

        setProjects(result.data);
        
        
      } catch (error) {
        console.error('Error fetching projects:', error);
       
      }
    };
const FetchMilestones = async (projectId: number) => {
    try {
      //setdataLoading(true);
      const response = await GetfetchMilestones(projectId?.toString()); // Fetch milestones using the API
      const parsedRes = JSON.parse(response);

      if (parsedRes?.status === 'success') {
        const milestoneData = parsedRes.data ?? [];
        setMilestones(milestoneData);

        var changeLog = milestoneData[0]?.end_date_change_log;
        setMilestoneHistory(changeLog);
        // setHistoryLoading(false);
        setHistoryLoading(false);
      } else {
        console.error('Invalid or empty data');
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      //setdataLoading(false);
    }
  };
  const FetchChangeRequest = async (projectId: number) => {
    try {
     
      const response = await GetChangeRequest(projectId);
      const parsedRes = JSON.parse(response);
      ////debugger;
      if (parsedRes?.status === 'success') {
        const allChangeRequests = parsedRes.data ?? {};

        // Extract only MILESTONE_END_DATE change requests
        const endDateChangeRequests = (
          allChangeRequests.other_change_requests ?? []
        )
          .filter((req: any) => req.change_type === 'MILESTONE_END_DATE')
          .map((req: any) => ({
            project_id: req.project_id,
            change_request_id: req.change_request_id,
            milestone_id: req.request_data?.milestone_id ?? null,
            milestone_name: req.request_data?.milestone_name ?? null,
            start_date: req.request_data?.start_date ?? null,
            end_date: req.request_data?.end_date ?? null,
            revised_end_date: req.request_data?.revisedEndDateParam ?? null,
            change_request: true,
            comment: req.request_data?.comment1 ?? '',
            created_at: req.created_at,
          }));
        //////debugger;
        setChangeRequestData(endDateChangeRequests);
      } else {
        console.error('Invalid or empty data');
      }
    } catch (error) {
      console.error('Error fetching change requests:', error);
    } finally {
      
    }
  };

  const approveChangeRequest = async (change: any) => {
    try {
      //setdataLoading(true);
      debugger;
      const payload = {
        change_request_id: change.change_request_id,
        status: 13,
        comment: 'Approved',
      };

      const response = await HandleChangeRequest(payload);
      const parsed = JSON.parse(response);
      //////debugger;
      if (parsed.status === 'success') {
        showAlert(parsed.message);
        await FetchMilestones(parseInt(projectId));
        await FetchChangeRequest(parseInt(projectId));
        //GetfetchMilestones(project_id.toString());
        //setdataLoading(false);
      } else {
        throw new Error(parsed.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error in approve/reject:', error);
    }
  };

  const rejectChangeRequest = async (change: any) => {
    try {
      //setdataLoading(true);
      const payload = {
        change_request_id: change.change_request_id,
        status: 11,
        comment: 'Rejected',
      };

      const response = await HandleChangeRequest(payload);
      const parsed = JSON.parse(response);

      if (parsed.status === 'success') {
        showAlert(parsed.message);
        await FetchMilestones(parseInt(projectId));
        await FetchChangeRequest(parseInt(projectId));
        //setdataLoading(false);
      } else {
        throw new Error(parsed.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error in approve/reject:', error);
    }
  };
    const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return ''; // handles '' or undefined
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, 'MM/dd/yyyy') : '';
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
     // fetchProjects();
      FetchMilestones(parseInt(projectId));
         FetchChangeRequest(parseInt(projectId));
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Project Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            Project Info
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Project ID</span>
              <span>FPX-{milestones[0]?.project_id}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Project Name</span>
              <span>{milestones[0]?.project_name}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Start Date</span>
              <span>{getFormattedDate(milestones[0]?.project_start_date)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">End Date</span>
              <span>{getFormattedDate(milestones[0]?.project_end_date)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Go-live Date</span>
              <span>{getFormattedDate(milestones[0]?.golive_date)}</span>
            </div>
          </div>
        </div>

        {/* Approve / Reject Section */}
        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            Approve / Reject end date change
          </h2>
         <AdvancedDataTable
           actions={(item) => (
                         <div className="flex space-x-2">
                           {item.change_request && <Tooltip>
                             <TooltipTrigger asChild>
                               <button
                                 onClick={() => {
                                     setHistoryLoading(true);
                                  setSelectedMilestone(item.milestone_id);

              
              var selectedMilestone = milestones.filter(
                m => m.milestone_id?.toString() === item.milestone_id?.toString(),
              );
              var changeLog = selectedMilestone[0]?.end_date_change_log;
              setMilestoneHistory(changeLog);
              // setHistoryLoading(false);
              setHistoryLoading(false);
                                 }}
                               >
                                 <ReviewSVG height={22} width={22} className="[&_path]:fill-white"/>
                               </button>
                             </TooltipTrigger>
                             <TooltipContent>{"View History"}</TooltipContent>
                           </Tooltip>}
                           {item.change_request && <Tooltip>
                             <TooltipTrigger asChild>
                               <button
                                 onClick={() => {
                                  approveChangeRequest(item);
                                  setSelectedMilestone('');
                                 }}
                               >
                                 <ApproveSVG
                                                         height={22}
                                                         width={22} 
                                                       />
                               </button>
                             </TooltipTrigger>
                             <TooltipContent>{"Approve"}</TooltipContent>
                           </Tooltip>}
           
                            {item.change_request   && <Tooltip>
                             <TooltipTrigger asChild>
                               <button
                                 onClick={() => {
                                   rejectChangeRequest(item);
              setSelectedMilestone('');
                                 }}
                               >
                                 <RejectSVG height={22} width={22} className="[&_path]:fill-white"/>
                               </button>
                             </TooltipTrigger>
                             <TooltipContent>{"Reject"}</TooltipContent>
                           </Tooltip>}
                             
                         </div>
                       )}
            data={changeRequestData}
            columns={[
              {
                  label: '#',
                  key: 'sno',
                  visible: true,
                  type: 'sno',
                  column_width: '40',
                  url: "",
                  order_no: 0
              },
              {
                label: 'Milestone Name',
                key: 'milestone_name',
                visible: true,
                column_width: '50',
                type: '',
                url: "",
                  order_no: 0
              },
              {
                label: 'Start Date',
                key: 'start_date',
                visible: true,
                column_width: '120',
                type: 'date',
                url: "",
                  order_no: 0
              },
              {
                label: 'End Date',
                key: 'end_date',
                visible: true,
                column_width: '120',
                type: 'date',
                url: "",
                  order_no: 0
              },
              {
                label: 'Estimated End Date',
                key: 'revised_end_date',
                visible: true,
                type: 'date',
                column_width: '150',
                url: "",
                  order_no: 0
              },
              // {
              //   label: 'History',
              //   key: 'view_history',
              //   visible: true,
              //   type: '',
              //   column_width: '50',
              // },
              {
                label: 'Action',
                key: 'action',
                visible: true,
                column_width: '50',
                type: 'actions',
                url: "",
                  order_no: 0
              },
            ]}
            PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            data_type={"Milestone"}
          
          />
        </div>
      </div>

      {/* Date Change History Section */}
      <h2 className="text-lg font-semibold text-blue-600 mb-4">
        Date Change History
      </h2>

      {/* Filter Dropdown */}
      <div className="flex justify-end mb-3 [&>*]:w-[208px]">
        <select
                  className="border rounded px-3 py-2"
                  required
                  onChange={(e) => {
                    setHistoryLoading(true);
                  setSelectedMilestone(e.target.value);
                  //setMilestoneHistory([]);
                  //approveChangeRequest(worker);
                  //////debugger;
                  var selectedMilestone = milestones.filter(
                    m => m.milestone_id?.toString() === e.target.value?.toString(),
                  );
                  var changeLog = selectedMilestone[0]?.end_date_change_log;
                  setMilestoneHistory(changeLog);
                  // setHistoryLoading(false);
                  setHistoryLoading(false);
                  }}
                  value={selectedMilestone}
                >
                  <option value="">Select Milestone</option>
                  {(milestones ?? []).map((item) => (
                    <option
                      key={item.milestone_id}
                      value={item.milestone_id?.toString()}
                    >
                      {item.milestone_name}
                    </option>
                  ))}
                </select>
      </div>

      <AdvancedDataTable
           
            data={milestoneHistory}
            columns={[
              {
                  label: '#',
                  key: 'sno',
                  visible: true,
                  type: 'sno',
                  column_width: '40',
                  url: "",
                  order_no: 0
              },
              {
                  label: 'Milestone Name',
                  key: 'milestone_name',
                  visible: true,
                  column_width: '120',
                  type: '',
                  url: "",
                  order_no: 0
              },
              {
                  label: 'Old End Date',
                  key: 'old_end_date',
                  visible: true,
                  column_width: '80',
                  type: 'date',
                  url: "",
                  order_no: 0
              },
              {
                  label: 'New End Date',
                  key: 'new_end_date',
                  column_width: '80',
                  visible: true,
                  type: 'date',
                  url: "",
                  order_no: 0
              },
              {
                  label: 'Change By',
                  key: 'changed_by',
                  column_width: '80',
                  visible: true,
                  type: '',
                  url: "",
                  order_no: 0
              },
              {
                  label: 'Change Date',
                  key: 'change_time',
                  column_width: '80',
                  visible: true,
                  type: 'date',
                  url: "",
                  order_no: 0
              },
            ]}
            PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            data_type={"Milestone"}
          
          />
          <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default MilestoneDateApproval;
