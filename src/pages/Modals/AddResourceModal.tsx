import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import { AddResource } from "@/utils/Resource";
import { getDesignation, GetUserDept } from "@/utils/Users";
import React, { useEffect, useState } from "react";
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
  onClose: (str:any) => void;
  initialData?: any;
   userRole: UserRole[];
   reportingManagers: User[];
  onSave?: (data: any) => void; // optional callback to lift state
}

const AddResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,userRole,reportingManagers
}) => {
  const [formData, setFormData] = useState({
    resource_id:'',
   first_name: '',
    last_name: '',
    email: '',
    role_id: '',
    reporting_to: '',
    department_id: '',
    average_cost: '',
    is_active: true,
    approval_limit: '',
    external_resource: false,
    designation: '',
  });
const [departments, setDepartments] = useState<any[]>([]);
const [designationList, setDesignationList] = useState<any[]>();
  // Load initialData when modal opens
  useEffect(() => {
    if (initialData) {
      debugger;
      setFormData({
        resource_id:initialData.resource_id || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        role_id: initialData.role_id ?? '',
        reporting_to: initialData.reporting_to ?? '',
        department_id: initialData.department_id ?? '',
        average_cost: initialData.average_cost ?? '',
        approval_limit: initialData.approval_limit || '',
        is_active: initialData.is_active ?? true,
        external_resource: initialData.external_resource ?? false,
        designation: initialData.designation || '',
      });
    } else {
      setFormData({
         resource_id: '',
        first_name: '',
        last_name: '',
        email: '',
        role_id: '',
        reporting_to: '',
        department_id: '',
        average_cost: undefined,
        approval_limit: '',
        is_active: true,
        external_resource: false,
        designation: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
const addUser = async (payload: any) => {
   

    try {
      payload.customer_id = parseInt(localStorage.getItem('Customer_ID'));
      payload.is_super_admin = true;
      payload.resource_type_id = payload.role_id;
      //console.log(payload);
      const response = await AddResource(payload);
      ////////////debugger;
      const parsedResponse = JSON.parse(response);
      if (parsedResponse.status === 'success') {
        /*  setApiMessage(parsedResponse.message); */
        /*  setMessageModalVisible(true); */
        /*  const successMessage = isUpdating
          ? 'Resource updated successfully'
          : 'Resource added successfully'; */
        onClose(parsedResponse.message);

        /* //console.log(successMessage);
        showAlert(successMessage); */
        
      } else {
        onClose(parsedResponse.message);
        /* setMessageModalVisible(true); */
      }
    } catch (err) {
      /*  setApiMessage(err.message);
      setMessageModalVisible(true); */
      /* showAlert(parsedResponse.message); */
      //console.log('Error Fetching Users', err);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debugger;
     
                if (initialData && initialData.resource_id) {
                  formData.resource_id = initialData.resource_id;
                }
                addUser(formData);
    if (onSave) {
      //onSave(formData);
    }
    //onClose();
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
  const fetchDepartments = async () => {
    try {
      const response = await GetUserDept(''); // Assuming this function fetches the department data
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') {
        setDepartments(parsedRes.data.departments);
      } else {
        console.error(
          'Failed to fetch Departments',
          parsedRes.message || 'Unknown error',
        );
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };
 useEffect(() => {
    fetchDesignation();
    fetchDepartments();
  }, []);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-md shadow-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-center mb-4">Add New Resource</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 mt-1"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 mt-1"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email ID</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
              placeholder="Enter email"
            />
          </div>

          {/* Approval Limit */}
          <div>
            <label className="block text-sm font-medium">
              Approval Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="approval_limit"
              value={formData.approval_limit}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 mt-1"
              placeholder="Enter limit"
            />
          </div>

          {/* role_id */}
          <div>
            <label className="block text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </label>
            
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 mt-1"
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
          </div>

          {/* Reporting Manager */}
          <div>
            <label className="block text-sm font-medium">Reporting Manager</label>
            <select
              name="reporting_to"
              value={formData.reporting_to}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            >
              <option value="">Select a Manager</option>
              {(reportingManagers ?? []).map((item) => (
                    <option
                      key={item.user_id}
                      value={item.user_id?.toString()}
                    >
                      {`${item.first_name} ${item.last_name}`}
                    </option>
                  ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium">
              Department 
            </label>
            <MultiSelectDepartment
                                placeholder="Select Function"
                                departments={departments}
                                selected={
                                  formData.department_id?.toString()?.length > 0
                                    ? formData.department_id?.toString()?.split(",")
                                    : []
                                }
                                onChange={async function (
                                  selected: string[]
                                ): Promise<void> {
                                  const worker = selected?.join(",");
                                  setFormData({...formData,department_id:worker})
                                  
        
                                }}
                                multi={false}
                              />
            
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium">Average Cost/hour ($)</label>
            <input
              type="text"
              name="average_cost"
              value={formData.average_cost}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
              placeholder="Cost/hour"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium">Designation</label>
            
            <select
              name="designation"
              value={formData.designation?.toString()}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            >
              <option value="">Select Designation</option>
               {(designationList ?? []).map((item) => (
                    <option
                      //key={item.designation}
                      value={item.designation_id?.toString()}
                    >
                      {`${item.designation_name}`}
                    </option>
                  ))}
            </select>
          </div>

          {/* External Resource */}
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="external_resource"
              checked={formData.external_resource}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">External Resource</label>
          </div>

          {/* Footer */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={()=>{onClose("")}}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
