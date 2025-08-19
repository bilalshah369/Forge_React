import React, { useEffect, useState } from "react";
import { Edit2, Trash2, PlusCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DeleteDept, GetDept, InsertDept } from "@/utils/Departments";
import { Delete_svg, EditSVG, Plus_svg } from "@/assets/Icons";
import { FetchPermission } from "@/utils/Permission";
import {ChromePicker} from 'react-color'; // Web Color Picker
import AlertBox from "@/components/ui/AlertBox";
interface Department {
  department_id?: number;
  customer_id: number;
  parent_department_id: number;
  department_name: string;
  description: string;
  department_head: number;
  department_level: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  department_color: string;
  department_second_color: string;
  children?: Department[];
}
const initialNewDepartmentState = {
    department_id: null,
    customer_id: 1,
    parent_department_id: null,
    department_name: '',
    description: '',
    department_head: null,
    department_level: 1,
    is_active: true,
    department_color: '',
    department_second_color: '',
     created_at: "",
  updated_at: "",
  created_by: "",
  updated_by: "",
  };

interface HierarchicalTableProps {
  
  onAdd: (parentId: number | null, department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (departmentId: number) => void;
}
interface DataItem {
  department_id?: number;
  customer_id: number;
  parent_department_id: number;
  department_name: string;
  description: string;
  department_head: number;
  department_level: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  department_color: string;
  department_second_color: string;
  children?: DataItem[];
}
const HierarchicalTable: React.FC<HierarchicalTableProps> = ({
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(
    null
  );
    const [parentDepartmentName, setParentDepartmentName] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
  const [message, setMessage] = useState("");
  
  const showAlert = (message: string) => {
    setMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setMessage("");
    //navigation("/PMView");
  };
  const [permissions, setPermissions] = useState<number[]>([]);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
const [data, setData] = useState<DataItem[]>([]);
  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const openAddModal = (parentId: number | null) => {
    debugger;
    setIsEditing(false);
    setCurrentParentId(parentId);
    setCurrentDepartment(initialNewDepartmentState);
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    debugger;
    setIsEditing(true);
    setCurrentDepartment({ ...dept });
    setModalOpen(true);
  };
  const getRandomDarkColor = () => {
    // Generate any color in the full RGB range (0-255)
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `#${((1 << 24) | (r << 16) | (g << 8) | b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  const lightenColor = (color: string, percent: number) => {
    let num = parseInt(color.replace('#', ''), 16);
    let r = (num >> 16) & 255,
      g = (num >> 8) & 255,
      b = num & 255;

    // Increase brightness while staying within valid color bounds (0-255)
    r = Math.min(255, r + Math.round((255 - r) * (percent / 100)));
    g = Math.min(255, g + Math.round((255 - g) * (percent / 100)));
    b = Math.min(255, b + Math.round((255 - b) * (percent / 100)));

    return `#${((1 << 24) | (r << 16) | (g << 8) | b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };
const handleAddDepartment = async () => {
    //console.log('Selected Department Head:', selectedUser);
debugger;
    // Check for empty department name
    if (!currentDepartment.department_name.trim()) {
      
      return;
    }

    // Prepare the department payload
    const departmentToSend = {
      ...currentDepartment,
      department_head:  null, // Allow null if no user is selected
    };

    try {
      const token = localStorage.getItem('Token');
      //console.log('Department to be sent: ', departmentToSend);

      // Make the API request to insert the department
      // const response = await fetch(`${BASE_URL}/master/insert_department`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `${token}`,
      //   },
      //   body: JSON.stringify(departmentToSend),
      // });
      const response = await InsertDept(departmentToSend);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') {
        //  if (response.status ==="success") {
        //Alert.alert('Success', 'New department added successfully');
        setModalOpen(false);

    showAlert(parsedRes.message);
        const randomPrimaryColor = getRandomDarkColor();
        const randomSecondaryColor = lightenColor(randomPrimaryColor, 50);
        // Reset the new department details
        /*  setNewDepartment(initialNewDepartmentState); */
        setCurrentDepartment({
          ...currentDepartment,
          department_color: randomPrimaryColor,
          department_second_color: randomSecondaryColor,
        });

        // Refresh departments and sub-departments
        //fetchSubDepartments(null);
        fetchDepartments();
       
      } else {
       
      }
    } catch (error) {
      console.error('Error adding department:', error);
   
    }
  };

 const handleDelete = async departmentId => {
    try {
      // const token = await AsyncStorage.getItem('Token');
      // const response = await fetch(`${BASE_URL}/master/delete_department`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `${token}`,
      //   },
      //   body: JSON.stringify({department_id: departmentId}),
      // });

      // if (response.ok) {
      const response = await DeleteDept({department_id: departmentId});
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === 'success') {
         showAlert(parsedRes.message);

        fetchDepartments();
       
      } else {
       
      }
    } catch (error) {
     
    }
  };
    const handleAddSubDepartment = (parentId, departmentName) => {
    const randomPrimaryColor = getRandomDarkColor();
    const randomSecondaryColor = lightenColor(randomPrimaryColor, 50);
    setCurrentDepartment({
      ...initialNewDepartmentState,
      parent_department_id: parentId,
      department_head: null,
      department_color: randomPrimaryColor,
      department_second_color: randomSecondaryColor,
    });
    setModalOpen(true);
    setParentDepartmentName(departmentName);
  };
  const handleSave = () => {
    if (!currentDepartment) return;
    if (isEditing) {
      onEdit(currentDepartment);
    } else {
      onAdd(currentParentId, currentDepartment);
    }
    setModalOpen(false);
  };

  const renderRows = (items: Department[], level = 0): React.ReactNode =>
    items.map((item) => {
      const isExpanded = expanded.includes(item.department_id);
      return (
        <React.Fragment key={item.department_id}>
          <tr
            className="hover:bg-gray-50"
            style={{ backgroundColor: item.department_color || "transparent" }}
          >
            <td className="px-4 py-2 text-white flex">
              {item.children?.length ? (
                <button
                type="button"
                  onClick={() => toggleExpand(item.department_id)}
                  className="mr-2"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              ) : (
                <span className="inline-block w-4" />
              )}
              <span style={{ marginLeft: level * 20 }}>
                <div
                  onMouseEnter={(e) =>
                    setTooltip({
                      text: item.department_name,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  className="inline-block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {item.department_name}
                </div>
              </span>
            </td>
            <td className="px-4 py-2">{item.description}</td>
            <td className="px-4 py-2">
              <div className="flex gap-2 ">
                <button onClick={() => {setParentDepartmentName("");openEditModal(item)}} >
                  <EditSVG width={20} height={20}  className="text-white [&_path]:fill-white" />
                </button>
                <button onClick={() => {if (confirm("Are you sure you want to delete?"))handleDelete(item.department_id)}} >
                  <Delete_svg width={20} height={20} className="text-white [&_path]:fill-white" />
                </button>
                <button onClick={() => {
                        handleAddSubDepartment(
                          item.department_id,
                          item.department_name,
                        );}} >
                  <Plus_svg width={20} height={20} className="text-white [&_path]:fill-white" />
                </button>
              </div>
            </td>
          </tr>
          {isExpanded && item.children && renderRows(item.children, level + 1)}
        </React.Fragment>
      );
    });
    const fetchDepartments = async () => {
    try {
      //console.log('API Calling');
      const response = await GetDept('');
      const result = await JSON.parse(response);

      if (!result?.data?.departments) {
        //console.error('No departments found');
        return;
      }

      // const activeDepartments = result.data.departments.filter(
      //   dept => dept.is_active === true,
      // );
      console.log(JSON.stringify(result));
      const activeDepartments = result.data.departments;
      if (activeDepartments.length === 0) {
        console.warn('No active departments available.');
        return;
      }

      const departmentMap = new Map(
        activeDepartments.map(dept => [
          dept.department_id,
          {
            ...dept,
            children: [],
            department_color: dept.department_color || 'lightgray', // Default color
          },
        ]),
      );

      activeDepartments.forEach(dept => {
        if (dept.parent_department_id) {
          const parent = departmentMap.get(dept.parent_department_id);
          if (parent) {
            parent.children.push(departmentMap.get(dept.department_id));
          }
        }
      });

      const rootDepartments = activeDepartments
        .filter(dept => dept.parent_department_id === null)
        .map(dept => departmentMap.get(dept.department_id));
//bilal
    //   const forgeTree = {
    //     department_name: companyName || 'Company',
    //     department_color: 'black', // Default root color
    //     children: rootDepartments.length ? rootDepartments : [],
    //   };

     // console.log('tree structure->:', JSON.stringify(forgeTree, null, 2));

      //setTreeData(forgeTree);
      setData(rootDepartments);
      //setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      //setLoading(false);
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

        setPermissions(permissionIds);
        console.log('Permission for user is', permissionIds);
      } catch (error) {
        console.error('Error retrieving permissions:', error);
      }
    };
const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
        checkPermission();
     fetchDepartments();
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="p-4">
{!permissions ||
        (permissions.includes(46) && (
          <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold"></h2>
  <button
  type="button"
    onClick={() =>{setParentDepartmentName(""); openAddModal(null)}} // pass null since it's a new one
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
  >
    <Plus_svg width={20} height={20} className="text-white [&_path]:fill-white"  />
    Add New Department
  </button>
</div>
        ))}
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Department</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>{renderRows(data)}</tbody>
      </table>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 bg-black text-white text-xs px-2 py-1 rounded"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          {tooltip.text}
        </div>
      )}
<AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={message}
        />
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Department" :  parentDepartmentName===""? "Add Department":"Add Sub-Department"}
            </h2>
          { parentDepartmentName!==""? <h3>Parent Department: {parentDepartmentName}</h3>  :<></>}
            <input
              type="text"
              placeholder="Name"
              value={currentDepartment?.department_name || ""}
              onChange={(e) =>
                setCurrentDepartment((prev) =>
                  prev ? { ...prev, department_name: e.target.value } : null
                )
              }
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <textarea
              placeholder="Description"
              value={currentDepartment?.description || ""}
              onChange={(e) =>
                setCurrentDepartment((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="w-full border rounded px-3 py-2 mb-4"
            />
            {/* <div className="mb-4">
              <label className="block mb-2">Pick a color:</label>
              <input
                type="color"
                value={currentDepartment?.department_color || "#ffffff"}
                onChange={(e) =>
                  setCurrentDepartment((prev) =>
                    prev ? { ...prev, department_color: e.target.value } : null
                  )
                }
                className="w-16 h-10 p-0 border rounded"
              />
            </div> */}
             <div className="flex gap-6">
      {/* Primary Color Picker */}
      <div className="flex flex-col items-center p-4 border rounded-lg shadow bg-white w-1/2">
        <p className="mb-2 font-medium">
          Primary Color:{" "}
          <span className="font-mono">{currentDepartment.department_color}</span>
        </p>
        <ChromePicker
          color={currentDepartment.department_color || "#ffffff"}
          onChangeComplete={(color) =>
            setCurrentDepartment((prev) => ({
              ...prev,
              department_color: color.hex,
            }))
          }
        />
      </div>

      {/* Secondary Color Picker */}
      <div className="flex flex-col items-center p-4 border rounded-lg shadow bg-white w-1/2">
        <p className="mb-2 font-medium">
          Secondary Color:{" "}
          <span className="font-mono">{currentDepartment.department_second_color}</span>
        </p>
        <ChromePicker
          color={currentDepartment.department_second_color || "#ffffff"}
          onChangeComplete={(color) =>
            setCurrentDepartment((prev) => ({
              ...prev,
              department_second_color: color.hex,
            }))
          }
        />
      </div>
    </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {isEditing ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalTable;
