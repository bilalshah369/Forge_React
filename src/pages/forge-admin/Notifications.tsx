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
import { DeleteSVG, EditSVG, Login_svg, ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { StartProject } from "@/utils/ApprovedProjects";
import { useTheme } from "@/themes/ThemeProvider";
import { DeleteCustomer, GetCustomers } from "@/utils/Customer";
import { PostAsync } from "@/services/rest_api_service";
import { decodeBase64, encodeBase64 } from "@/utils/securedata";
import AddCustomer from "./AddCustomer";
import { GetNotifications } from "@/utils/Notification";
import AddNotificationModal from "./AddNotificationModal";
const BASE_URL = import.meta.env.VITE_BASE_URL;
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
interface NotificationData {
    notification_id: string;
  notification_type: string;
  notification_title: string;
  notification_desc: string;
  recipients: string;
  module?: string;
  notification_action?: string;
  start_date?: string;
  end_date?: string;
  url: string;
  }
const Notifications = () => {
     const [headers, setHeaders] = useState<Header[]>([
    {
        label: '#', key: 'sno', visible: true, type: 'sno', column_width: '50',
        url: "",
        order_no: 0
    },

    {
        label: 'Notification',
        key: 'notification_title',
        visible: true,
        type: '',
        column_width: '200',
        url: "",
        order_no: 0
    },
    {
        label: 'Notification Type',
        key: 'notification_type',
        visible: true,
        type: '',
        column_width: '200',
        url: "",
        order_no: 0
    },
    {
        label: 'Recipient Group',
        key: 'recipient_type',
        visible: true,
        type: '',
        column_width: '200',
        url: "",
        order_no: 0
    },
    {
        label: 'Module',
        key: 'module',
        visible: true,
        type: '',
        column_width: '200',
        url: "",
        order_no: 0
    },
    {
        label: 'Trigger',
        key: 'notification_action',
        visible: true,
        type: '',
        column_width: '200',
        url: "",
        order_no: 0
    },
    {
        label: 'Active',
        key: 'is_active',
        visible: true,
        type: 'status',
        column_width: '200',
        url: "",
        order_no: 0
    },

    {
        label: 'Action',
        key: 'action',
        visible: true,
        type: 'actions',
        column_width: '100',
        url: "",
        order_no: 0
    },
  ]);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
     const [customerId, setCustomerId] = useState('1');
  //const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
     const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAddNotificationModalVisible, setAddNotificationModalVisible] =
    useState(false);
  const [editNotification, setEditNotification] = useState<
    NotificationData | undefined
  >(undefined);
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await GetNotifications({});
      const parsedRes = JSON.parse(response);
      //////////debugger;
      if (parsedRes.status === 'success') {
        setNotifications(parsedRes.data);
        setLoading(false);
      }
      // else
      // console.error(
      //   'Failed to fetch AD:',
      //   parsedRes.message || 'Unknown error',
      // );
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
    const showAlert = (message: string) => {
    console.log(message);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
  };
   

  const location = useLocation();
  const navigation = useNavigate();
  const {theme} =useTheme();

  useEffect(() => {
    (async function () {
       fetchNotifications();
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
                        setEditNotification(item);
                        setAddNotificationModalVisible(true);
              
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
                       //handleDelete(parseInt(worker ?? '', 10));
                      }}
                    >
                      <DeleteSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Delete"}</TooltipContent>
                </Tooltip>
                
              </div>
            )}
           
            data={notifications}
            columns={headers}
            title="Customers"
            exportFileName="Customers"
            isCreate={true}
            isSearch={true}
            isDownloadExcel={true}
            isColumnVisibility={true}
            onCreate={() => {
              debugger;
              setEditNotification(undefined);
            setAddNotificationModalVisible(true);
            
        }}
            isPagingEnable={true}
             PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            onrowsOnPage={() => {}}
            
            data_type={"Notification"}
          />
        </div>
         <AddNotificationModal
        visible={isAddNotificationModalVisible}
        //onClose={() => setAddNotificationModalVisible(false)}
         onClose={(result:string) => {
            setAddNotificationModalVisible(false);
            setEditNotification(undefined);
            if(result)
            showAlert(result);
            fetchNotifications();
          }}
        onSave={() => {}}
        mode={editNotification ? 'edit' : 'add'}
        notificationToEdit={editNotification}
      />
        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={alertMessage}
        />
      </div>
    </div>
  );
};

export default Notifications;
