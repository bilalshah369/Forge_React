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
const options = {
  execute: false,
  cancel: false,
  onHold: false,
  completeAndClose: false,
  movetoapprove: true,
};
const CustomerList = () => {
    const [headers, setHeaders] = useState<Header[]>([
    {
      label: '#',
      key: 'sno',
      visible: true,
      type: 'sno',
      column_width: '50',
      url: 'CustomerList',
      order_no: 1,
    },
    {
      label: 'Customer ID',
      key: 'customer_id',
      visible: false,
      type: '',
      column_width: '150',
      url: 'CustomerList',
      order_no: 2,
    },
    {
      label: 'Company Name',
      key: 'company_name',
      visible: true,
      type: 'company_name',
      column_width: '200',
      url: 'CustomerList',
      order_no: 3,
    },
    {
      label: 'Full Name',
      key: 'contact_first_name',
      visible: true,
      type: 'admin_user_name',
      column_width: '200',
      url: 'CustomerList',
      order_no: 4,
    },
    {
      label: 'Company Email',
      key: 'contact_email',
      visible: true,
      type: '',
      column_width: '200',
      url: 'CustomerList',
      order_no: 5,
    },
    {
      label: 'Admin Email',
      key: 'tech_admin_email',
      visible: true,
      type: 'email',
      column_width: '200',
      url: 'CustomerList',
      order_no: 6,
    },
    {
      label: 'Company Contact Number',
      key: 'contact_phone',
      visible: true,
      type: '',
      column_width: '200',
      url: 'CustomerList',
      order_no: 7,
    },

    {
      label: 'Created On',
      key: 'created_at',
      visible: true,
      type: 'date',
      column_width: '200',
      url: 'CustomerList',
      order_no: 8,
    },
    {
      label: 'Current Status',
      key: 'is_active',
      visible: true,
      type: 'status',
      column_width: '200',
      url: 'CustomerList',
      order_no: 9,
    },
    {
      label: 'Action',
      key: 'action',
      visible: true,
      type: 'actions',
      column_width: '100',
      url: 'CustomerList',
      order_no: 10,
    },
  ]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
      const [searchQuery, setSearchQuery] = useState<string>('');
        const [isAddModelVisible, setIsAddModelVisible] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(0);
  const fetchCustomers = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      
      const response = await GetCustomers({PageNo: page, PageSize: pageSize});
      const parsedResponse = await JSON.parse(response);
      if (parsedResponse.status === 'success') {
        setCustomers(parsedResponse.data.customers);
        const totalRecords = parsedResponse.pagination.totalRecords;
        // setTotalRecords(totalRecords);
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages);
       
      } else {
        setCustomers([]);
        console.error('Error fetching data:', parsedResponse.message);
        
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
     
    }
  };
  const fetchSearchedCustomers = async (
    page = currentPage,
    pageSize = rowsPerPage,
    query: string,
  ) => {
    //setLoading(true);
    //setIsSearching(true);
    try {
      
      const response = await GetCustomers({
        PageNo: page,
        PageSize: pageSize,
        customerID: undefined,
        name: query,
      });
      const parsedResponse = await JSON.parse(response);
      if (parsedResponse.status === 'success') {
        setCustomers(parsedResponse.data.customers);
        const totalRecords = parsedResponse.pagination.totalRecords;
        // setTotalRecords(totalRecords);
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages);
      
      } else {
        setCustomers([]);
        console.error('Error fetching data:', parsedResponse.message);
        
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
     
    }
  };

  const handleDelete = async (project_id: number) => {
    if (!project_id) {
      console.error('Invalid Project ID');
      return;
    }

    try {
      const payload = {
        customer_id: project_id,
      };

      //console.log('Deleting Project with Payload:', payload);

      const res = await DeleteCustomer(payload);
      //console.log('Delete API Response:', res);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === 'success') {
        //FetchMilestones(projectId);
        fetchCustomers();
        showAlert('customer deleted successfully');
      } else {
        throw new Error(parsedRes.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      
    } finally {
      //setActiveMenu(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (isSearching) {
      fetchSearchedCustomers(currentPage, rowsPerPage, searchQuery);
    } else {
      fetchCustomers(page, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchCustomers(1, newRowsPerPage);
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
   const handleProcessLogin = async (email: any) => {
    const uri = `${BASE_URL}/auth/login_oauth`;
    const payload = JSON.stringify({
      email: email,
    });

    try {
      const jsonResult = await PostAsync(uri, payload);
      //console.log('login resposne', jsonResult.data);

      if (jsonResult.status === 'success') {
        const {accessToken, user} = jsonResult.data;
        const {
          userId,
          userrole,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,landing_url
        } = user;

        //setIsLoggedIn(true);
        localStorage.setItem(
          'UserEmail',
          encodeBase64(email?.toLowerCase() || ''),
        );
        localStorage.setItem(
          'ID',
          encodeBase64(userId?.toString() || ''),
        );
        localStorage.setItem('Token', 'Bearer ' + accessToken);
        localStorage.setItem(
          'Customer_ID',
          encodeBase64(customer_id?.toString() || ''),
        );
        localStorage.setItem(
          'company_name',
          company_name?.toString() || '',
        );
        localStorage.setItem('firstName', firstName?.toString() || '');
        localStorage.setItem('lastName', lastName?.toString() || '');
        localStorage.setItem('source', source?.toString() || '');

        localStorage.setItem(
          'UserType',
          encodeBase64(userrole.toString()),
        );

        const UserType = decodeBase64(
          (localStorage.getItem('UserType')) ?? '',
        );

        //console.log('Decoded UserType:', UserType);
        ////////////debugger;
        if (UserType === '3' || userrole === 3) {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          /* navigation.replace('Main'); */
          //localStorage.setItem('UserState', 'CustomerList');
          localStorage.setItem('isAdmin', 'yes');
          localStorage.setItem('UserState', 'AdminDboard');
          navigation("/"+landing_url);
          //navigate('Main', {screen: 'AdminDboard'});
        } else if (UserType === '1' || userrole === 1) {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          //navigate('Main', {screen: 'SignupScreen'});
        } else if (UserType === '103' || userrole === 103) {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          navigation("/"+landing_url);
        } else {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          navigation("/"+landing_url);
        }
      } else {
       
      }
    } catch (error) {
      console.error('Error logging in:', error);
     
    }
  };

  const location = useLocation();
  const navigation = useNavigate();
  const {theme} =useTheme();

  useEffect(() => {
    (async function () {
       fetchCustomers();
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
                        setSelectedCustomer(item.customer_id);
    setIsAddModelVisible(true);
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
                       if (item.customer_id) {
              const project_id = parseInt(item.customer_id, 10);
              if (!isNaN(project_id)) {
                handleDelete(project_id);
              } else {
                console.error('Invalid project ID:', item.customer_id);
              }
            }
                      }}
                    >
                      <DeleteSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Delete"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                       handleProcessLogin(item.tech_admin_email);
                      }}
                    >
                      <Login_svg height={22} width={22} fill="white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{`Login as ${item.contact_first_name}`}</TooltipContent>
                </Tooltip>
              </div>
            )}
           
            data={customers}
            columns={headers}
            title="Customers"
            exportFileName="Customers"
            isCreate={true}
            isSearch={true}
            isDownloadExcel={true}
            isColumnVisibility={true}
            onCreate={() => {setSelectedCustomer(0);
            setIsAddModelVisible(true);}}
            isPagingEnable={true}
            PageNo={currentPage}
            TotalPageCount={totalPages}
            rowsOnPage={rowsPerPage}
            onrowsOnPage={handleRowsPerPageChange}
            onPageChange={function (worker: number): void {
              handlePageChange(worker);
            }}
            
            data_type={"Customers"}
          />
        </div>
         <AddCustomer
          custID={selectedCustomer}
          visible={isAddModelVisible}
          onClose={(result:string) => {
            setIsAddModelVisible(false);
            setSelectedCustomer(0);
            if(result)
            showAlert(result);
            fetchCustomers();
          }}
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

export default CustomerList;
