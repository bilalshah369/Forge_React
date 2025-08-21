/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetColumnVisibility,
  GetMasterData,
  GetMasterDataPM,
} from "@/utils/PM";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Briefcase_outline_svg, DeleteSVG, EditSVG, Plus_svg, ProjectPhaseSVG } from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { StartProject } from "@/utils/ApprovedProjects";
import { GetAllResourcesALL, GetResources } from "@/utils/Resource";
import { GetAllRoles, getDesignation } from "@/utils/Users";
import { FetchPermission } from "@/utils/Permission";
import { decodeBase64 } from "@/utils/securedata";
import AdvancedDataTableResource from "@/components/ui/AdvancedDataTableResource";
import AddResourceModal from "../Modals/AddResourceModal";
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
export interface UserRole {
  role_id: number;
  role_name: string;
  role_level: string | number; // Depending on how the role_level is represented
  is_active: boolean;
}
const Resources = () => {
    const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
      const [currentPage, setCurrentPage] = useState(1); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [totalRecords, setTotalRecords] = useState(0); // Total records
  const [roles, setRoles] = useState<any[]>([]);
const [users, setUsers] = useState<any[]>([]);
 const [Repusers, setRepUsers] = useState<any[]>([]);
   const [designationList, setDesignationList] = useState<any[]>();
   const [permissionss, setPermissionss] = useState<number[]>([]);
     const [customerID, setCustomerID] = useState('');
     const [userRole, setUserRole] = useState<UserRole[]>([]);
      const [departments, setDepartments] = useState<any[]>([]);
       const [departmentsHk, setDepartmentsHk] = useState<any>([]);
        const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [allSelectedUsersID, setAllSelectedUsersID] = useState<number[]>([]); // Store selected user IDs
 const [headers, setHeaders] = useState<Header[]>([
    {
      label: '#',
      key: 'sno',
      visible: true,
      type: 'sno',
      column_width: '50',
      url: 'Resources',
      order_no: 1,
    },
    // {
    //   label: '[]',
    //   key: 'is_user',
    //   visible: true,
    //   type: 'check',
    //   column_width: '50',
    //   url: 'Resources',
    //   order_no: 2,
    // },
     {
                  label: "[]",
                  key: "resource_id",
                  visible: true,
                  type: "check",
                  column_width: "50",
                  url: "",
                  order_no: 2,
                },
    {
      label: 'Name',
      key: 'resource_id',
      visible: true,
      type: 'user_name',
      column_width: '200',
      url: 'Resources',
      order_no: 3,
    },
    {
      label: 'Email',
      key: 'email',
      visible: true,
      type: '',
      column_width: '200',
      url: 'Resources',
      order_no: 4,
    },

    {
      label: 'Role',
      key: 'role_name',
      visible: true,
      type: '',
      column_width: '150',
      url: 'Resources',
      order_no: 5,
    },

    {
      label: 'Department',
      key: 'department_name',
      visible: false,
      type: 'department',
      column_width: '150',
      url: 'Resources',
      order_no: 6,
    },
    {
      label: 'Designation',
      key: 'designation_name',
      visible: false,
      type: 'department',
      column_width: '150',
      url: 'Resources',
      order_no: 7,
    },
    {
      label: 'Reporting Manager',
      key: 'manager_name',
      visible: false,
      type: '',
      column_width: '200',
      url: 'Resources',
      order_no: 8,
    },
    {
      label: 'Average Cost ($)',
      key: 'average_cost',
      visible: true,
      type: 'cost',
      column_width: '200',
      url: 'Resources',
      order_no: 9,
    },
    {
      label: 'Approval Limit',
      key: 'approval_limit',
      visible: false,
      type: 'cost',
      column_width: '200',
      url: 'Resources',
      order_no: 10,
    },
    {
      label: 'Is a user',
      key: 'is_user',
      visible: false,
      type: 'boolean',
      column_width: '200',
      url: 'Resources',
      order_no: 11,
    },
    {
      label: 'Status',
      key: 'is_active',
      visible: true,
      type: '',
      column_width: '150',
      url: 'Resources',
      order_no: 12,
    },

    {
      label: 'Action',
      key: 'action',
      visible: true,
      type: 'actions',
      column_width: '100',
      url: 'Resources',
      order_no: 13,
    },
  ]);
  const fetchUser = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      
      const response = await GetResources({
        PageNo: page,
        PageSize: pageSize,
      });
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') {
        setUsers(parsedRes.data.resources);
        setTotalRecords(parsedRes.pagination.totalRecords);
        const calculatedTotalPages = Math.ceil(
          parsedRes.pagination.totalRecords / pageSize,
        );
        //console.log('totoal records', parsedRes.pagination.totalRecords);
        //console.log('totoal calculatedTotalPages', calculatedTotalPages);
        setTotalPages(calculatedTotalPages);
        
        
      } else {
        console.error(
          'Failed to fetch users:',
          parsedRes.message || 'Unknown error',
        );
        
      }
      //
    } catch (err) {
      //
      console.error('Error Fetching Users', err);
    }
  };
  const fetchReporting = async (page = currentPage, pageSize = rowsPerPage) => {
    try {
      /*   */
      const response = await GetAllResourcesALL();
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') {
        setRepUsers(parsedRes.data.users);
        //setTotalRecords(parsedRes.pagination.totalRecords);
        /* const calculatedTotalPages = Math.ceil(
          parsedRes.pagination.totalRecords / pageSize,
        ); */
        //console.log('totoal records', parsedRes.pagination.totalRecords);
        //console.log('totoal calculatedTotalPages', calculatedTotalPages);
        /* setTotalPages(calculatedTotalPages); */
        /*  */
        /*  */
      } else {
        console.error(
          'Failed to fetch users:',
          parsedRes.message || 'Unknown error',
        );
        /*   */
      }
      //
    } catch (err) {
      //
      console.error('Error Fetching Users', err);
    }
  };
  const fetchColumnVisibility = async () => {
    try {
      //
      const response = await GetColumnVisibility('Resources');
      //console.log('Get project Response:', response);

      const result = JSON.parse(response);
      if (result.status === 'error') {
        setIsColumnVisibility(false);
      }
      if (result.status === 'success') {
        //setHeaders(result.data);
        console.log('fetched headers are', result.data);
        setIsColumnVisibility(true);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      //Alert.alert('Error', 'Failed to fetch projects');
      //
    }
  };
   const fetchDesignation = async () => {
    try {
      const response = await getDesignation('');
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') {
        setDesignationList(parsedRes.data.designations);
      } else {
        console.error(
          'Failed to fetch users:',
          parsedRes.message || 'Unknown error',
        );
      }
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
  const checkPermission = async () => {
    try {
      const permissionResponse = await FetchPermission(''); // Fetching permission data
      const parsedResponse =
        typeof permissionResponse === 'string'
          ? JSON.parse(permissionResponse)
          : permissionResponse;

      if (
        !parsedResponse ||
        !parsedResponse.data ||
        !parsedResponse.data.user_permissions
      ) {
        throw new Error('Invalid response format');
      }

      const permissionData = parsedResponse.data.user_permissions || [];

      const permissionIds = permissionData.map(
        (perm: {permission_id: number}) => perm.permission_id,
      );

      setPermissionss(permissionIds);
      console.log('Permission for user is', permissionIds);
    } catch (error) {
      console.error('Error retrieving permissions:', error);
    }
  };
const fetchAllRole = async () => {
    try {
      const response = await GetAllRoles('');
      const parsedRes =
        typeof response === 'string' ? JSON.parse(response) : response;
      ////console.log(parsedRes.data.resource_types);
      if (parsedRes.status === 'success') {
        setUserRole(parsedRes.data.roles);
      } else {
        console.error(
          'Failed to fetch user roles:',
          parsedRes.message || 'Unknown error',
        );
      }
    } catch (err) {
      console.error('Error Fetching User Roles:', err);
    }
  };
  const getCustomerId = async () => {
    try {
      const localcustomerID = localStorage.getItem('Customer_ID');
      const decodedCustomerID = decodeBase64(localcustomerID || '');
      //console.log('Your Customer ID is ', decodedCustomerID);
      setCustomerID(decodedCustomerID);
    } catch (err) {
      //console.log('Error fetching the customerID', err);
    }
  };
  const fetchMasterData = async () => {
    try {
      //console.log('Fetching impacted applications...');
      const response = await GetMasterData(); // Replace with your API function
      const result = JSON.parse(response);

      departments?.splice(0, departments.length);
      var dpt = result.data.departments;
      dpt.forEach((element: any) => {
        departments.push({
          label: element.department_name,
          value: element.department_id,
          group: 'Group',
          selected: false,
        });
      });
      setDepartmentsHk(result.data);
      setDepartments(result.data.departments);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      //setLoading(false);
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
      fetchUser(page, rowsPerPage);
    
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    
      fetchUser(1, newRowsPerPage);
    
  };
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
  };
   const handleUserSelection = (mile_id: number) => {
    const isSelected = allSelectedUsersID.includes(mile_id);

    if (isSelected) {
      setAllSelectedUsersID(
        allSelectedUsersID.filter((id) => id !== mile_id)
      );
    } else {
      ////debugger
      setAllSelectedUsersID([...allSelectedUsersID, mile_id]);
    }
    //console.log('Selected User IDs:', allSelectedUsersID);
  };
  const [editResource, setEditResource] = useState<any | null>(null);
  const [isAddUserModalVisible, setisAddUserModalVisible] = useState(false);
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
       checkPermission();
         fetchColumnVisibility();
         fetchDesignation();
         fetchUser();
         fetchReporting();
         fetchAllRole();
         getCustomerId();
         fetchMasterData();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
            {allSelectedUsersID.join(",")}
            <div className="flex flex-wrap items-center gap-3 p-4">
      {/* Add Resource */}
      <button onClick={()=>{setEditResource(null);
            setisAddUserModalVisible(true);}} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
        <Plus_svg height={16} width={16}/>
        Add Resource
      </button>

      {/* Delete */}
      <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
        <DeleteSVG height={16} width={16} />
        Delete
      </button>

      {/* Assign Department */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
        <Briefcase_outline_svg  height={16} width={16} />
        Assign Department
      </button>

      {/* Assign Role */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Assign Role
      </button>

      {/* Confirm as User */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Confirm as User
      </button>

      {/* Remove as User */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Remove as User
      </button>

      {/* Sync AD */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Sync AD
      </button>
    </div>
          <AdvancedDataTableResource
            actions={(item) => (
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        // openDecisionModal(item.project_id);
                        // setSelectedProjectName(item.project_name);
                           setEditResource(item);
            setisAddUserModalVisible(true);
                      }}
                    >
                      <EditSVG height={22} width={22} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Change Project Phase"}</TooltipContent>
                </Tooltip>
              </div>
            )}
            checkEnable={true}
             onCheckChange={function (worker: number): void {
                handleUserSelection(worker);
              }}
           
            data={users}
            columns={headers}
            title="Closed Project"
            exportFileName="closed projects"
            isCreate={false}
            onCreate={() => navigation("/NewIntake")}
            isPagingEnable={true}
            PageNo={currentPage}
            TotalPageCount={totalPages}
            rowsOnPage={rowsPerPage}
            onrowsOnPage={handleRowsPerPageChange}
            onPageChange={function (worker: number): void {
              handlePageChange(worker);
            }}
            MasterDepartments={departments}
            
            data_type={"Project"}
          />
        </div>
     
        <AddResourceModal isOpen={isAddUserModalVisible} 
        onClose={function (): void {
                  //throw new Error("Function not implemented.");
                  setisAddUserModalVisible(false);
              } }  userRole={userRole} reportingManagers={Repusers}
         initialData={editResource ?? undefined}/>
        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={alertMessage}
        />
      </div>
    </div>
  );
};

export default Resources;
