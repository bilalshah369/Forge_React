/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
//import MultiFeatureDropdown from "../../components/MultiFeatureDropdown";
import { AddFieldEdit } from "../../utils/PM";
import { Close_svg, Edit_svg } from "../../assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import { GetChangeRequestPreview } from "../../utils/ApprovedProjects";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { useTheme } from "@/themes/ThemeProvider";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import { DatePicker } from "rsuite";
import { convertUTCtoLocalDateOnly } from "@/utils/util";
interface FieldEditProp {
  label_id: string;
  project_id: number;
  default_text: string;
  is_edit: boolean;
  text_style: any;
  isMultiSelect: boolean;
  //Master Data
  MasterData: any;
  isPicker?: boolean;
  isDate?: boolean;
  idKey?: string;
  labelKey?: string;
}
export default function FieldEdit({
  label_id,
  project_id,
  default_text,
  text_style,
  is_edit,
  isMultiSelect,
  MasterData,
  isPicker,
  idKey,
  labelKey,isDate
}: FieldEditProp) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [label, setLabel] = useState({
    label_id,
    match: false,
    label_name: "",
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const handleIconPress = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const modalWidth = 300;
      const screenWidth = window.innerWidth;
      const leftPosition =
        rect.x + modalWidth > screenWidth
          ? Math.max(rect.x - modalWidth, 0)
          : Math.min(rect.x, screenWidth - modalWidth);

      setPopupPosition({
        top: rect.y + rect.height + window.scrollY,
        left: leftPosition + window.scrollX,
      });
      setPopupVisible(true);
    }
  };

  const getPreviewValue = async () => {
    try {
      //debugger;
      const response = await GetChangeRequestPreview(project_id);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        const match = parsedRes.data.find((item) => item.field_id === label_id);
        if (match) {
          setLabel((prev) => ({
            ...prev,
            match: true,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching preview:", err);
    }
  };

  const handleFieldChange = (newValue) => {
    setLabel((prev) => ({ ...prev, label_name: newValue }));
  };

  const handleSave = async () => {
    const payload = {
      field_id: label_id,
      project_id,
      new_field_value: label.label_name,
      status: 12,
      sent_to: "",
      comment,
    };

    try {
      if (
        label_id === "project_owner_user" ||
        label_id === "business_stakeholder_user"
      ) {
        const newDept = MasterData.find(
          (m) => m.user_id === parseInt(label.label_name ?? "0")
        ).department_id;

        const deptPayload = {
          field_id:
            label_id === "project_owner_user"
              ? "project_owner_dept"
              : "business_stakeholder_dept",
          project_id,
          new_field_value: newDept,
          status: 12,
          sent_to: "",
          comment,
        };
        await AddFieldEdit(deptPayload);
      }

      const response = await AddFieldEdit(payload);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        setAlertMessage("New field value saved successfully!");
        setAlertVisible(true);
        await getPreviewValue();
        setPopupVisible(false);
      } else {
        setAlertMessage(parsedRes.message);
        setAlertVisible(true);
        setPopupVisible(false);
      }
    } catch (err) {
      console.error("Error saving:", err);
    }
  };
const {theme} =useTheme();
  useEffect(() => {
    getPreviewValue();
  }, [label_id]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div
          className={`flex items-center ${
            label.match ? "border-2 border-red-500" : ""
          }`}
        >
          <span className={`${text_style} text-black truncate`}>
            {default_text}
          </span>
          {is_edit && (
            <button
              type="button"
              ref={iconRef}
              onClick={handleIconPress}
              className="ml-2 p-1 hover:bg-gray-200 rounded"
            >
              <Edit_svg className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {popupVisible && (
        <div
          className="absolute bg-white border border-black rounded shadow-lg p-3 z-50"
          style={{
            top: popupPosition.top,
            left: popupPosition.left,
            width: 300,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: "blue" }}>
              {isPicker ? "Select New Value" : "Enter New Value"}
            </span>
            <button type="button" onClick={() => setPopupVisible(false)}>
              <Close_svg className="h-5 w-5" />
            </button>
          </div>

          {isPicker ? (
            // <MultiFeatureDropdown
            //   dropdown_id={"field_edit"}
            //   placeholder={"Select new value"}
            //   dropdown_type={isMultiSelect ? "multi" : "single"}
            //   selected_value={label.label_name?.toString() || ""}
            //   onSingleSelect={(worker) => handleFieldChange(worker)}
            //   onMultiSelect={(worker) => handleFieldChange(worker)}
            //   MasterData={MasterData?.map((item) => ({
            //     value: idKey ? item[idKey] : undefined,
            //     label: labelKey ? item[labelKey] : undefined,
            //   }))}
            // />
            isMultiSelect ? (

              label_id==="impacted_function" ? <MultiSelectDepartment
                      multi={true}
                      searchable={true}
                        placeholder="Select Departments"
                        departments={MasterData}
                        selected={
                          label.label_name?.length > 0
                    ? label.label_name.split(",")
                    : []
                        }
                        onChange={async function (selected: string[]): Promise<void> {
                          const worker = selected?.join(",");
                          handleFieldChange(worker);
                        }}
                      />:
              <MultiSelectDropdown
                items={(MasterData ?? []).map((item) => ({
                  value: idKey ? item[idKey] : undefined,
                  label: labelKey ? item[labelKey] : undefined,
                }))}
                placeholder="Select values"
                selected={
                  label.label_name?.length > 0
                    ? label.label_name.split(",")
                    : []
                }
                onChange={(selected: string[]) => {
                  handleFieldChange(selected.join(",")); // save as comma-separated
                }}
              />
            ) : (
              <select
                className="w-full mt-1 p-2 border rounded mb-2"
                required
                onChange={(e) => handleFieldChange(e.target.value)}
                value={label.label_name?.toString()}
              >
                <option value="">Select new value</option>
                {(MasterData ?? []).map((item) => (
                  <option
                    key={idKey ? item[idKey] : undefined}
                    value={idKey ? item[idKey] : undefined}
                  >
                    {labelKey ? item[labelKey] : undefined}
                  </option>
                ))}
              </select>
            )
          ) : (
            isDate ?<DatePicker
                 
                  oneTap
                  value={
                    label.label_name ? convertUTCtoLocalDateOnly(label.label_name) : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const safeDate = new Date(date);
                      safeDate.setHours(12, 0, 0, 0);
                      const iso = safeDate.toISOString();
                      
                      handleFieldChange(iso);
                    } else {
                      handleFieldChange("");
                    }
                  }}
                  format="MM/dd/yyyy"
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy"
                  editable={false}
                  className="w-full"
                 
                />:
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={label.label_name || ""}
              onChange={(e) => handleFieldChange(e.target.value)}
              placeholder="Enter New Value"
            />
          )}

          <input
            type="text"
            className="w-full p-2 border rounded mb-2 mt-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter comment if any"
          />

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              className=" text-white px-4 py-2 rounded" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <AlertBox
        visible={alertVisible}
        onCloseAlert={() => setAlertVisible(false)}
        message={alertMessage}
      />
    </div>
  );
}
