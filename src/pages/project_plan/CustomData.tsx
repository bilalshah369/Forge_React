/* eslint-disable prefer-const */
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
import { DeleteSVG, EditSVG, ProjectPhaseSVG } from "@/assets/Icons";
import { FetchPermission } from "@/utils/Permission";
import { GetRoles } from "@/utils/RoleMaster";
import { GetResources } from "@/utils/Resource";
import {
  DeleteCustomField,
  DeleteMember,
  GetCustomData,
  GetCustomFields,
  InsertCustomField,
} from "@/utils/ApprovedProjects";
import AddTeamMemberModal from "../Modals/AddTeamMemberModal";
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}
interface CustomProps {
  projectId: number;
  editFieldEnable: boolean;
}
interface FieldValues {
  fieldName: string;
  dataType: string;
  text: string;
}
const CustomData = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Field Name",
      key: "project_custom_field_id",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Value",
      key: "field_value",
      visible: true,
      type: "textinput",
      column_width: "200",
      url: "",
      order_no: 0,
    },

    {
      label: "Action",
      key: "action",
      visible: true,
      type: "actions",
      column_width: "100",
      url: "",
      order_no: 0,
    },
  ]);
  const [isCustomDataModalVisible, setIsCustomDataModalVisible] =
    useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dropdownData, setDropdownData] = useState<string[]>([]);
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [newDropdownItem, setNewDropdownItem] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  const [fieldValues, setFieldValues] = useState<FieldValues>({
    fieldName: "",
    dataType: "",
    text: "",
  });
  const [errors, setErrors] = useState<{
    fieldName?: string;
    dataType?: string;
    text?: string;
  }>({});

  const validateFields = () => {
    let validationErrors: {
      fieldName?: string;
      dataType?: string;
      text?: string;
    } = {};

    if (!fieldValues.fieldName.trim()) {
      validationErrors.fieldName = "Field name is required";
    }

    if (!fieldValues.dataType) {
      validationErrors.dataType = "Please select a Data Type";
    }

    if (fieldValues.dataType === "1" && !fieldValues.text.trim()) {
      validationErrors.text = "Details field is required";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleFieldNameChange = (text: string) => {
    setFieldValues((prev) => ({ ...prev, fieldName: text }));
    if (text.trim()) {
      setErrors((prev) => ({ ...prev, fieldName: undefined }));
    }
  };

  const handleDataTypeChange = (value: string) => {
    setFieldValues((prev) => ({ ...prev, dataType: value }));
    setShowAdditionalInput(value === "1");

    if (value) {
      setErrors((prev) => ({ ...prev, dataType: undefined }));
    }
  };

  const handleDetailsChange = (text: string) => {
    setFieldValues((prev) => ({ ...prev, text }));
    if (text.trim()) {
      setErrors((prev) => ({ ...prev, text: undefined }));
    }
  };

  /* const handleFieldNameChange = value => {
    setFieldValues({...fieldValues, fieldName: value});
  };

  const handleDataTypeChange = value => {
    setFieldValues({...fieldValues, dataType: value});
  };
 */
  const addDropdownItem = () => {
    if (newDropdownItem) {
      setDropdownData([...dropdownData, newDropdownItem]);
      setNewDropdownItem("");
    }
  };

  const removeDropdownItem = (index: number) => {
    const newData = dropdownData.filter((_, i) => i !== index);
    setDropdownData(newData);
  };

  const handleSubmit = async () => {
    const payload = {
      /*  project_vs_custom_field_id: 0, */
      project_id: Number(projectId),
      project_custom_field_id: fieldValues.fieldName,
      field_value: showAdditionalInput ? fieldValues.text : "",
      field_type: fieldValues.dataType,

      //availability_percentage: 0,
      /* actual_cost: 0,  
          isExternal: true,  
          status: 0,  */
    };

    //console.log('Payload:', payload);

    try {
      // Await the result from InsertMember
      const response = await InsertCustomField(payload);
      const parsedResponse = JSON.parse(response);
      // Handle the response (assuming it's a JSON object)
      if (parsedResponse && parsedResponse.status === "success") {
        FetchCustom(projectId);
        setFieldValues({
          fieldName: "",
          dataType: "",
          text: "",
        });
        setIsCustomDataModalVisible(false);
        /*  onClose(); */
      }
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error submitting CustomField:", error);

      // Close the modal on error
    }
  };

  const FetchCustom = async (projectId) => {
    try {
      const response = await GetCustomFields(projectId); // Pass projectId here
      const parsedRes = JSON.parse(response);
      //console.log('Get Projects Response:', response);

      if (parsedRes?.status === "success" && Array.isArray(parsedRes.data)) {
        // Filter only fields where is_active is true
        const activeFields = parsedRes.data.filter((field) => field.is_active);
        setCustomFields(activeFields);
      } else {
        console.error("Invalid or empty data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const handleInputChange = (fieldId, text) => {
    setCustomFields((prevFields) =>
      prevFields.map((field) =>
        field.project_vs_custom_field_id === fieldId
          ? { ...field, field_value: text, isEditing: true }
          : field
      )
    );
  };
  const confirmDelete = () => {
    if (selectedID) {
      handleDelete(selectedID?.toString());
      setDeleteModalVisible(false);
    }
  };
  const showDeleteModal = (customFieldId) => {
    if (!customFieldId) {
      console.error("Invalid CustomField ID");
      return;
    }
    setSelectedID(customFieldId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async (customFieldId) => {
    if (!customFieldId) {
      console.error("Invalid Milestone ID");
      return;
    }

    try {
      const payload = {
        project_vs_custom_field_id: customFieldId,
      };

      //console.log('Deleting Milestone with Payload:', payload);

      const res = await DeleteCustomField(payload);
      //console.log('Delete API Response:', res);
      const parsedRes = JSON.parse(res);

      if (parsedRes.status === "success") {
        FetchCustom(projectId);
      } else {
        throw new Error(parsedRes.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      /* setActiveMenu(null); */
    }
  };

  const handleSave = async (fieldId) => {
    const field = customFields.find(
      (f) => f.project_vs_custom_field_id === fieldId
    );
    if (!field) return;

    const payload = {
      project_id: Number(projectId),
      project_vs_custom_field_id: field.project_vs_custom_field_id,
      field_value: field.field_value,
      project_custom_field_id: field.project_custom_field_id,
      field_type: field.field_type,
    };

    try {
      const response = await InsertCustomField(payload); // Call your API for updating
      const parsedResponse = JSON.parse(response);
      if (parsedResponse.status === "success") {
        setCustomFields((prevFields) =>
          prevFields.map((f) =>
            f.project_vs_custom_field_id === fieldId
              ? { ...f, isEditing: false }
              : f
          )
        );

        FetchCustom(projectId);
      } else {
        throw new Error(parsedResponse.message || "Failed to update field");
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };
  const handleFocus = (fieldId) => {
    setCustomFields((prevFields) =>
      prevFields.map((field) =>
        field.project_vs_custom_field_id === fieldId
          ? { ...field, isEditing: true }
          : field
      )
    );
  };

  const close = () => {
    setModalVisible(false);
    setFieldValues({
      fieldName: "",
      dataType: "",
      text: "",
    });
  };
  const location = useLocation();
  const navigation = useNavigate();
  useEffect(() => {
    (async function () {
      FetchCustom(projectId);
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[1000px]">
          <AdvancedDataTable
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            actions={(item) => (
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        console.log("View", item);
                        if (
                          confirm(
                            "Are you sure you want to delete this Custom data field ?"
                          )
                        )
                          handleDelete(
                            parseInt(item.project_resources_id ?? "", 10)
                          );
                      }}
                    >
                      <DeleteSVG height={22} width={22} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{"Delete"}</TooltipContent>
                </Tooltip>
              </div>
            )}
            data={customFields}
            columns={headers}
            PageNo={1}
            TotalPageCount={1}
            rowsOnPage={100}
            data_type={"Field"}
            isCreate={true}
            onCreate={() => {
              //setSelectedMember(null);
              setIsCustomDataModalVisible(true);
            }}
          />
          {isCustomDataModalVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-6">
                {/* Title */}
                <h2 className="text-lg font-semibold text-center mb-6">
                  Add Custom Field
                </h2>

                {/* Form */}
                <form
                  className="grid grid-cols-2 gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                    if (validateFields()) {
                      handleSubmit();
                    }
                    // else if (editFieldEnable) {
                    //   setModalVisible(false);
                    // }
                  }}
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium">
                      Name of Field <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={fieldValues.fieldName}
                      required
                      type="text"
                      placeholder=" Field name"
                      className="w-full mt-1 p-2 border rounded"
                      onChange={(e) => {
                        // const newTotal = e.target.value;
                        const newTotal = e.target.value;
                        handleFieldNameChange(newTotal);
                      }}
                    />
                    {submitted && !fieldValues.fieldName && (
                      <p className="text-red-500 text-sm mt-1">
                        Field name is required
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Data Type<span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full mt-1 p-2 border rounded"
                      required
                      value={fieldValues.dataType}
                      onChange={(e) => {
                        handleDataTypeChange(e.target.value);
                      }}
                    >
                      <option value="">Select Budget</option>
                      {[{ value: "Text Input", id: "1" }].map((item) => (
                        <option key={item.id} value={item.id?.toString()}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                    {submitted && !fieldValues.dataType && (
                      <p className="text-red-500 text-sm mt-1">
                        Data Type is required
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">
                      Details <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={fieldValues.text}
                      required
                      type="text"
                      placeholder="Enter additional information"
                      className="w-full mt-1 p-2 border rounded"
                      onChange={(e) => {
                        // const newTotal = e.target.value;
                        const newTotal = e.target.value;
                        setFieldValues({ ...fieldValues, text: newTotal });
                      }}
                    />
                    {submitted && !fieldValues.text && (
                      <p className="text-red-500 text-sm mt-1">
                        Details field is required
                      </p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="col-span-2 flex justify-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDataModalVisible(false);
                      }}
                      className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        setSubmitted(true);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* <AddTeamMemberModal
            isOpen={isCustomDataModalVisible}
            onClose={() => setIsCustomDataModalVisible(false)}
            onSubmit={() => {
              fetchTeam(parseInt(projectId));
            }}
            member={selectedMember}
            changeRequest={false}
            isEditing={true}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default CustomData;
