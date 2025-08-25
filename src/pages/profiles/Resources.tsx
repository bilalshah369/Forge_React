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
import { ConfirmMultipleUsers, DeleteMultipleUsers, GetAllResourcesALL, GetResources, updateMultipleUsersDepartment, updateMultipleUsersRole } from "@/utils/Resource";
import { DeleteUser, GetAllRoles, getDesignation } from "@/utils/Users";
import { FetchPermission } from "@/utils/Permission";
import { decodeBase64 } from "@/utils/securedata";
import AdvancedDataTableResource from "@/components/ui/AdvancedDataTableResource";
import AddResourceModal from "../Modals/AddResourceModal";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import AdComponent from "../masters/AdComponent";
import { useTheme } from "@/themes/ThemeProvider";
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
export const Spinner: React.FC = () => (
  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);
const Resources = () => {
    const [isColumnVisibility, setIsColumnVisibility] = useState<boolean>(true);
     const [isAssignDeptModal, setIsAssignDeptModal] = useState<boolean>(false);
      const [isAssignRoleModal, setIsAssignRoleModal] = useState<boolean>(false);
         const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
            const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false);
            const [isConfirmRemoveModal, setIsConfirmRemoveModal] = useState<boolean>(false);
              const [isADModalVisible, setIsADModalVisible] = useState(false);
     const [selectedDeptID, setSelectedDeptID] = useState<string>('');
     const [selectedRoleID, setSelectedRoleID] = useState<string>('');
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
      visible: true,
      type: 'department',
      column_width: '150',
      url: 'Resources',
      order_no: 6,
    },
    {
      label: 'Designation',
      key: 'designation_name',
      visible: true,
      type: 'department',
      column_width: '150',
      url: 'Resources',
      order_no: 7,
    },
    {
      label: 'Reporting Manager',
      key: 'manager_name',
      visible: true,
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
      visible: true,
      type: 'cost',
      column_width: '200',
      url: 'Resources',
      order_no: 10,
    },
    {
      label: 'Is a user',
      key: 'is_user',
      visible: true,
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
      //////debugger
      setAllSelectedUsersID([...allSelectedUsersID, mile_id]);
    }
    //console.log('Selected User IDs:', allSelectedUsersID);
  };
  const [editResource, setEditResource] = useState<any | null>(null);
  const [isAddUserModalVisible, setisAddUserModalVisible] = useState(false);
    const handleDeleteMultipleUsers = async (ids:any) => {
    const usersToDelete = users.filter(user =>
      ids.includes(user.resource_id),
    );
    const hasAdmin = usersToDelete.some(user => user.role_id === 3);
    if (hasAdmin) {
      showAlert('Admin user account cannot be deleted');

      return;
    }

    const payload = {
      user_ids: ids,
    };
    //console.log('Multiple User Department Payload', payload);
    try {
      const response = await DeleteMultipleUsers(payload);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') {
        //console.log('All the users you slected are now succesfully deleted');
        //set
        //setisMultipleDeleteModalVisible(false);
        const message = parsedRes.message;
        showAlert(message);
        fetchUser();
        setIsDeleteModal(false);
      } else {
        console.error('Failed to delete user:', parsedRes.message);
        const message = parsedRes.message;
        showAlert(message);
        setIsDeleteModal(false);
      }
    } catch (err: any) {
      //console.log('There is something wrong', err);
      const message = err.message;
      setIsDeleteModal(false);
      showAlert(message);
    }
  };
  const handleUpdateMultipleUsersDepartment = async () => {
    const payload = {
      department_id: selectedDeptID,
      user_ids: allSelectedUsersID,
    };
    //debugger;
    //console.log('Multiple User Department Payload', payload);
    try {
      const response = await updateMultipleUsersDepartment(payload);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') {
        //console.log(
        //   'All the users you selected are now assigned the selected Department',
        //);
        //set
        setIsAssignDeptModal(false);
        const message = parsedRes.message;
        showAlert(message);
        //setAllSelectedUsersID([]);
        fetchUser();
      } else {
        console.error(
          'Failed to assign this Department to user:',
          parsedRes.message,
        ); // Handle failure
         setIsAssignDeptModal(false);
        const message = parsedRes.message;
        showAlert(message);
      }
    } catch (err: any) {
      //console.log('There is something wrong', err);
      const message = err.message;
       setIsAssignDeptModal(false);
      showAlert(message);
    }
  };
  const handleUpdateMultipleUsersRole = async () => {
    const payload = {
      role_id: selectedRoleID,
      user_ids: allSelectedUsersID,
    };
    //console.log('Multiple User Role Assigning Payload', payload);
    try {
      const response = await updateMultipleUsersRole(payload);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') {
        //console.log(
        //  'All the users you selected are now assigned the selected Role',
        // );
        setIsAssignRoleModal(false);
        const message = parsedRes.message;
        showAlert(message);
        fetchUser();
      } else {
        console.error('Failed to assign this role to user:', parsedRes.message); // Handle failure
        const message = parsedRes.message;
             setIsAssignRoleModal(false);
        showAlert(message);
      }
    } catch (err: any) {
      //console.log('There is something wrong', err);
      const message = err.message;
           setIsAssignRoleModal(false);
      showAlert(message);
    }
  };
  const handleConfirmMultipleUsers = async () => {
    for (let index = 0; index < allSelectedUsersID.length; index++) {
      const element = allSelectedUsersID[index];
      const payload = {
        resource_id: element,
      };
      //console.log('Multiple User Department Payload', payload);
      try {
        const response = await ConfirmMultipleUsers(payload); // API call to delete user
        const parsedRes = JSON.parse(response);
        if (parsedRes.status === 'success') {
          //console.log(
          //  'All the users you slected are now succesfully confirmed',
          // );
          //set
          //setisMultipleConfirmModalVisible(false); // Close the modal after successful deletion
          const message = parsedRes.message;
          showAlert(message);
          await fetchReporting();
          await fetchUser();
          setIsConfirmModal(false);
        } else {
          fetchUser();
          //setisMultipleConfirmModalVisible(false);
          const message = parsedRes.message;
           setIsConfirmModal(false);
          showAlert(message);
          
          console.error('Failed to confirm user:', parsedRes.message); // Handle failure
        }
      } catch (err: any) {
        //console.log('There is something wrong', err);
        setIsConfirmModal(false);
        showAlert(err.message);
        //setMessageModalVisible(true);
      }
    }
  };
  const handleNotConfirmMultipleUsers = async () => {
    for (let index = 0; index < allSelectedUsersID.length; index++) {
      const element = allSelectedUsersID[index];
      const userIdF = users.filter(m => m.resource_id === element)[0]?.user_id;
      const payload = {
        user_ids: [userIdF],
      };
      //console.log('Multiple User Department Payload', payload);
      try {
        const response = await DeleteUser(payload); // API call to delete user
        const parsedRes = JSON.parse(response);
        if (parsedRes.status === 'success') {
          //console.log(
          //  'All the users you slected are now succesfully confirmed',
          // );
          //set
          setIsConfirmRemoveModal(false); // Close the modal after successful deletion
          const message = parsedRes.message;
          showAlert(message);
          fetchUser();
         setIsConfirmRemoveModal(false);
        } else {
          fetchUser();
          setIsConfirmRemoveModal(false);
          const message = parsedRes.message;
          showAlert(message);
          console.error('Failed to confirm user:', parsedRes.message); // Handle failure
        }
      } catch (err: any) {
        //console.log('There is something wrong', err);
        //setApiMessage(err.message);
        //setMessageModalVisible(true);
         setIsConfirmRemoveModal(false); 
      }
    }
  };
  const location = useLocation();
  const navigation = useNavigate();
  const {theme} =useTheme();
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
            {/* {allSelectedUsersID.join(",")} */}
            <div className="flex flex-wrap items-center gap-3 p-4">
      {/* Add Resource */}
      <button onClick={()=>{setEditResource(null);
            setisAddUserModalVisible(true);}} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
        <Plus_svg height={16} width={16}/>
        Add Resource
      </button>

      {/* Delete */}
      <button
      
      
      onClick={()=>{if (allSelectedUsersID.length === 0) {
              showAlert(
                'Please select at least one resource to delete.',
              );
              setAllSelectedUsersID([]);
              return;
            } 
            setIsDeleteModal(true);}} className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
        <DeleteSVG height={16} width={16} />
        Delete
      </button>

      {/* Assign Department */}
      <button
      onClick={()=>{
        if (allSelectedUsersID.length === 0) {
              showAlert(
                'Please select at least one user to assign a department.',
              );
              setAllSelectedUsersID([]);
              return;
            } 
            setIsAssignDeptModal(true);
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
        <Briefcase_outline_svg  height={16} width={16} />
        Assign Department
      </button>

      {/* Assign Role */}
      <button
      onClick={()=>{
        if (allSelectedUsersID.length === 0) {
              showAlert(
                'Please select at least one user to assign a role.',
              );
              setAllSelectedUsersID([]);
              return;
            } 
            setIsAssignRoleModal(true);
      }}
      
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Assign Role
      </button>

      {/* Confirm as User */}
      <button 
     onClick={()=>{if (allSelectedUsersID.length === 0) {
              showAlert(
                'Please select at least one resource to confirm as user.',
              );
              setAllSelectedUsersID([]);
              return;
            } 
            setIsConfirmModal(true);}}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Confirm as User
      </button>

      {/* Remove as User */}
      <button
      onClick={()=>{if (allSelectedUsersID.length === 0) {
              showAlert(
                'Please select at least one resource to remove as user.',
              );
              setAllSelectedUsersID([]);
              return;
            } 
            setIsConfirmRemoveModal(true);}}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-blue-700 hover:bg-gray-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
         <Briefcase_outline_svg  height={16} width={16} />
        Remove as User
      </button>

      {/* Sync AD */}
      <button
      onClick={()=>{
            setIsADModalVisible(true);}}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm shadow-lg shadow-gray-500/40 hover:-translate-y-1 hover:shadow-2xl">
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
                       // handleDelete(parseInt(item.resource_id ?? '', 10));
                        //handleUserSelection(item.resource_id);
                        setIsDeleteModal(true);
                      }}
                    >
                      <DeleteSVG height={22} width={22} className="[&_path]:fill-white"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Delete"}</TooltipContent>
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
            isColumnVisibility={false}
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
        onClose={function (str:any): void {
                  //throw new Error("Function not implemented.");
                  
                  {str!==""?showAlert(str):""};
                  fetchUser();
                  setisAddUserModalVisible(false);
              } }  userRole={userRole} reportingManagers={Repusers}
         initialData={editResource ?? undefined}/>



         {isAssignDeptModal && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-blue-900 text-center mb-4">
          Are you sure you want to assign a department to {allSelectedUsersID.length} users?
        </h2>

        <MultiSelectDepartment
                                        placeholder="Select Function"
                                        departments={departments}
                                        selected={
                                          selectedDeptID?.toString()?.length > 0
                                            ? selectedDeptID?.toString()?.split(",")
                                            : []
                                        }
                                        onChange={async function (
                                          selected: string[]
                                        ): Promise<void> {
                                          const worker = selected?.join(",");
                                          setSelectedDeptID(worker);
                                          
                
                                        }}
                                        multi={false}
                                      />

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={()=>{setIsAssignDeptModal(false);fetchUser();}}
            className="px-5 py-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
          disabled={allSelectedUsersID.length>0}
            onClick={()=>{handleUpdateMultipleUsersDepartment()}}
            className="px-5 py-2  text-white font-semibold rounded " style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          >
            Submit
          </button>
        </div>
      </div>
    </div>}


    {isAssignRoleModal && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-blue-900 text-center mb-4">
          Are you sure you want to assign a role to {allSelectedUsersID.length} users?
        </h2>

        <select
                        className="w-full mt-1 p-2 border rounded"
                        required
                        onChange={(e) =>  setSelectedRoleID(e.target.value)}
                        value={selectedRoleID}
                      >
                        <option value="">Select Role</option>
                        {(userRole ?? []).map((item) => (
                          <option
                            key={item.role_id}
                            value={item.role_id?.toString()}
                          >
                            {item.role_name}
                          </option>
                        ))}
                      </select>

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={()=>{setIsAssignRoleModal(false);fetchUser();}}
            className="px-5 py-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
          disabled={selectedRoleID===""}
            onClick={()=>{handleUpdateMultipleUsersRole()}}
            className="px-5 py-2 text-white font-semibold rounded" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          >
            Submit
          </button>
        </div>
      </div>
    </div>}

    {isDeleteModal && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-blue-900 text-center mb-4">
          Are you sure you want to delete {allSelectedUsersID.length} users?
        </h2>

        

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={()=>{setIsDeleteModal(false);}}
            className="px-5 py-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
          
         // disabled={selectedRoleID===""}
            onClick={()=>{handleDeleteMultipleUsers(allSelectedUsersID)}}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-500"
          >
            Delete Users
          </button>
        </div>
      </div>
    </div>}

    {isConfirmModal && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-blue-900 text-center mb-4">
          Are you sure you want to confirm {allSelectedUsersID.length} resource as user?
        </h2>

        

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={()=>{setIsConfirmModal(false);}}
            className="px-5 py-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
          
          //disabled={selectedRoleID===""}
            onClick={()=>{handleConfirmMultipleUsers()}}
            className="px-5 py-2 text-white font-semibold rounded " style={{backgroundColor:theme.colors.drawerBackgroundColor}}
          >
            Confirm as Users
          </button>
        </div>
      </div>
    </div>}
    {isConfirmRemoveModal && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-blue-900 text-center mb-4">
          Are you sure you want to remove {allSelectedUsersID.length} resource as user?
        </h2>

        

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={()=>{setIsConfirmRemoveModal(false);}}
            className="px-5 py-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
          
          //disabled={selectedRoleID===""}
            onClick={()=>{handleNotConfirmMultipleUsers()}}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-500"
          >
            Remove as Users
          </button>
        </div>
      </div>
    </div>}
    {isADModalVisible && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-md shadow-lg max-h-[90vh] w-3/4 overflow-y-auto p-6">
       
<AdComponent closeModal={function (): void {
              setIsADModalVisible(false);
            } } fetchUser={function (): void {
              fetchUser();
            } } />
        

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={()=>{setIsADModalVisible(false);}}
            className="px-5 py-2 bg-gray-200 text-black font-semibold rounded hover:bg-gray-300"
          >
            close
          </button>
          {/* <button
          
          //disabled={selectedRoleID===""}
            onClick={()=>{handleConfirmMultipleUsers()}}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-500"
          >
            Confirm as Users
          </button> */}
        </div>
      </div>
    </div>}
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
