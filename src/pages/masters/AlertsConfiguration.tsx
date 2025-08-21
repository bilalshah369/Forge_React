/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetMasterDataPM,
} from "@/utils/PM";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EditSVG, ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { StartProject } from "@/utils/ApprovedProjects";
import { GetCustomerNotifications, UpadteCustomerNotification } from "@/utils/Notification";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
const options = {
  execute: false,
  cancel: false,
  onHold: false,
  completeAndClose: false,
  movetoapprove: true,
};
interface alertProps{
  id: number;
  notification_id: number;
  notification_title: string;
  is_active: boolean;
  schedule_type: string;
  recipient_role: string;
  recipient_names: string;
}
const AlertsConfiguration = () => {
    const [alerts, setAlerts] = useState<alertProps[]>([]);
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
      const [alertMessage, setAlertMessage] = useState<string>('');
      const [currentPage, setCurrentPage] = useState<number>(1);
      const [rowsPerPage, setRowsPerPage] = useState<number>(10);
      const [totalPages, setTotalPages] = useState<number>(1);
     const [headers, setHeaders] = useState<Header[]>([
      {
          label: '#', key: 'sno', visible: true, type: 'sno', column_width: '50',
          url: "",
          order_no: 0
      },
  
      {
        label: 'Alert Title',
        key: 'notification_title',
        visible: true,
        type: '',
        column_width: '200',  url: "",
          order_no: 0
      },
      {
        label: 'Status',
        key: 'is_active',
        visible: true,
        type: 'status',
        column_width: '200',  url: "",
          order_no: 0
      },
      {
        label: 'Schedule',
        key: 'schedule_type',
        visible: true,
        type: '',
        column_width: '200',  url: "",
          order_no: 0
      },
  
      {
        label: 'Recipients',
        key: 'recipient_names',
        visible: true,
        type: '',
        column_width: '200',  url: "",
          order_no: 0
      },
  
  
      {
        label: 'Action',
        key: 'action',
        visible: true,
        type: 'actions',
        column_width: '100',  url: "",
          order_no: 0
      },
    ]);
      const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const fetchAlerts = async () => {
    try {
     
      const response = await GetCustomerNotifications();
      const parsedRes = JSON.parse(response);
      if (parsedRes) {
        setAlerts(parsedRes);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
    
    }
  };
  const showAlert = (message: string) => {
        setAlertMessage(message);
        setAlertVisible(true);
      };
    
      const closeAlert = () => {
        setAlertVisible(false);
        setAlertMessage('');
      };
  const location = useLocation();
  const navigation = useNavigate();
  const handlePageChange = (page: number) => {
        setCurrentPage(page);
        //fetchClassification(page, rowsPerPage);
      };
    
      const handleRowsPerPageChange = (newRows: number) => {
        setRowsPerPage(newRows);
        setCurrentPage(1);
        //fetchClassification(1, newRows);
      };
      const [active, setActive] = useState(true);
  const [schedule, setSchedule] = useState("Daily");
  const [recipient, setRecipient] = useState("1 items selected");

  const [alert, setAlert] = useState<alertProps>({
  id: 0,
  notification_id: 0,
  notification_title:'',
  is_active: true,
  schedule_type: '',
  recipient_role: '',
  recipient_names: ''
  });
   const [roles, setRoles] = useState<{label: string; value: string}[]>(
      [],
    );
     const updateAlert = async (updatedData: alertProps) => {
    try {
      const response = await UpadteCustomerNotification(updatedData);
      const parsedRes = JSON.parse(response);
      // if (parsedRes.status === "success") {
      //   alert("Alert configuration updated!");
      // }
      setIsEditModalVisible(false);
      fetchAlerts();
      showAlert('Alert updated successfully');
    } catch (error) {
      console.error("Error updating alert:", error);
      //alert("Failed to update alert.");
    }
  };
  useEffect(() => {
    (async function () {
   fetchAlerts();
   setRoles([
      {label: 'PMO Admin', value:'PMO'},
      {label: 'Project Manager', value:'PM'},
      {label: 'Project Owner', value:'PO'},
      {label: 'Business Owner', value:'BO'},
      {label: 'Team Member', value:'TM'}
    ]);
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
                          setAlert(item);
                       setIsEditModalVisible(true);
                        }}
                      >
                        <EditSVG height={22} width={22} className="[&_path]:fill-white"/>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{"Edit"}</TooltipContent>
                  </Tooltip>
              </div>
            )}
           
            data={alerts}
            columns={headers}
            title="Alerts"
            exportFileName="Alerts"
        
            isPagingEnable={true}
            PageNo={currentPage}
            TotalPageCount={totalPages}
            rowsOnPage={rowsPerPage}
            onrowsOnPage={handleRowsPerPageChange}
            onPageChange={function (worker: number): void {
              handlePageChange(worker);
            }}
            
            data_type={"Alert"}
          />
        </div>
       {
        isEditModalVisible && <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <h2 className="text-xl font-semibold text-center text-[#044086] mb-6">
          Configure Alert
        </h2>

        {/* Alert Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alert Title
          </label>
          <input
            type="text"
            value={alert.notification_title}
            readOnly
            className="w-full border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#044086]"
          />
        </div>

        {/* Active / Inactive */}
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Active/Inactive
          </label>
          <button
            onClick={() => setAlert({...alert, is_active:!alert.is_active})}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              active ? "bg-teal-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                alert.is_active ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Schedule */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule:
          </label>
          <select
            value={alert.schedule_type}
            onChange={(e) => setAlert({...alert, schedule_type:e.target.value})}
            className="w-full border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#044086]"
          >
            <option value="">Select</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>

            <option value="Hourly">Hourly</option>
            <option value="Monthly">Monthly</option>
        
            
          </select>
        </div>

        {/* Recipient Role */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Recipient Role:
          </label>
          <MultiSelectDropdown
                            items={roles}
                            placeholder="Select Role"
                            selected={
                              alert.recipient_role?.length > 0
                                ? alert.recipient_role?.split(",")
                                : []
                            }
                            onChange={async function (selected: string[]): Promise<void> {
                              //
                              const worker: any = selected?.join(",");
                              //setSelectedRoles(worker);
                                    setAlert({...alert, recipient_role : worker})
                            }}
                          />
          
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={()=>{setIsEditModalVisible(false)}}
            className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button className="px-5 py-2 rounded-md bg-[#044086] text-white hover:bg-[#0550b8]" onClick={()=>{updateAlert(alert)}}>
            Save
          </button>
        </div>
      </div>
    </div>
        </>
       }
        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={alertMessage}
        />
      </div>
    </div>
  );
};

export default AlertsConfiguration;
