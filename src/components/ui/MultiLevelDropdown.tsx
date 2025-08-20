import React, { useEffect, useRef, useState } from "react";
import {
  Checkbox_svg,
  Checkbox_unchecked_svg,
  Chevron_down_svg,
  Chevron_up_svg,
  Circle_svg,
  Close_svg,
} from "@/assets/Icons";

interface MultiLevelDropdownProps {
  dropdown_id: string;
  placeholder: string;
  dropdown_type: "single" | "multi";
  selected_value: string;
  onSingleSelect: (worker: string) => void;
  onMultiSelect: (worker: string) => void;
  MasterData: Department[];
  dropdown_styles?: string;
  options_styles?: string;
  className?: string;
}

interface Department {
  department_id: number;
  department_name: string;
  parent_department_id: number | null;
  description?: string;
  children?: Department[];
  department_color?: string;
}

const MultiLevelDropdown: React.FC<MultiLevelDropdownProps> = ({
  dropdown_id,
  placeholder,
  MasterData,
  selected_value,
  dropdown_styles = "",
  options_styles = "",
  onMultiSelect,
  dropdown_type,
  onSingleSelect,
  className = "",
}) => {
  const [groupedItems, setGroupedItems] = useState<Department[]>(MasterData);
  const [selectedItem, setSelectedItem] = useState<Department | null>(null);
  const [expandedParents, setExpandedParents] = useState<number[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (value: string) => {
    const allValues = groupedItems.map((item: Department) =>
      item.department_id.toString()
    );

    if (value === "select_all") {
      if (selectedValues.length === allValues.length) {
        setSelectedValues([]); // Unselect all
        onMultiSelect("");
      } else {
        setSelectedValues(allValues); // Select all
        onMultiSelect(allValues.join(","));
      }
    } else {
      if (dropdown_type === "single") {
        setSelectedValues([value]);
        onSingleSelect(value);
        setPopupVisible(false);
      } else {
        setSelectedValues((prev) => {
          const currentValues = prev || []; // Ensure prev is always an array

          // If value exists, remove it; otherwise, add it
          const updatedValues = currentValues.includes(value.toString())
            ? currentValues.filter((v) => v !== value.toString()) // Remove if exists
            : [...currentValues, value.toString()]; // Add if not exists

          onMultiSelect(updatedValues?.join(","));
          return updatedValues; // Update state
        });
      }
    }
  };

  const handleDropdownToggle = () => {
    setPopupVisible(!popupVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setPopupVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setGroupedItems(MasterData);
    setSelectedValues(selected_value ? selected_value?.split(",") : []);
  }, [MasterData, selected_value]);

  const toggleExpand = (departmentId: number) => {
    setExpandedParents((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const buildHierarchy = (
    departments: Department[],
    parentId: number | null = null
  ): Department[] => {
    return departments
      .filter((department) => department.parent_department_id === parentId)
      .map((department) => ({
        ...department,
        children: buildHierarchy(departments, department.department_id),
      }));
  };

  const hierarchicalData = buildHierarchy(groupedItems ?? []);

  const renderItem = (item: Department, level: number = 0): React.ReactNode => {
    const isParent = item.children && item.children.length > 0;
    const isExpanded = expandedParents.includes(item.department_id);

    return (
      <div key={item.department_id}>
        <div
          className={`flex items-center justify-between p-1 hover:bg-gray-50 cursor-pointer`}
          style={{ marginLeft: level * 20 }}
        >
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(item.department_id.toString());
              }}
              className="flex-shrink-0"
            >
              {selectedValues?.includes(item.department_id.toString()) ? (
                <Checkbox_svg height={20} width={20} />
              ) : (
                <Checkbox_unchecked_svg height={20} width={20} />
              )}
            </button>

            <span className="text-black text-sm mr-2">
              {item.department_name}
            </span>

            {item.department_color && (
              <Circle_svg
                height={16}
                width={16}
                fill={item.department_color?.toString().trim() ?? ""}
              />
            )}
          </div>

          {isParent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isParent) {
                  toggleExpand(item.department_id);
                } else {
                  setSelectedItem(item);
                }
              }}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <Chevron_up_svg width={16} height={16} />
              ) : (
                <Chevron_down_svg height={20} width={20} />
              )}
            </button>
          )}
        </div>

        {isParent && isExpanded && (
          <div className="ml-5">
            {item.children?.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredData = searchQuery
    ? groupedItems.filter((item) =>
        item.department_name
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : hierarchicalData;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={`w-full min-w-48 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:border-blue-500 ${dropdown_styles}`}
      >
        <span>
          {dropdown_type === "single"
            ? selectedValues?.length > 0
              ? groupedItems.find(
                  (m) => m.department_id?.toString() === selectedValues[0]
                )?.department_name
              : placeholder
            : selectedValues?.length > 0
            ? `${selectedValues?.length} items selected`
            : placeholder}
        </span>
        <Chevron_down_svg height={18} width={18} />
      </button>

      {/* Dropdown Options */}
      {popupVisible && (
        <div
          className={`absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto ${options_styles}`}
        >
          {/* Header with Select All and Search */}
          <div className="flex items-center space-x-2 p-2 border-b border-gray-200">
            {dropdown_type === "multi" && (
              <button
                type="button"
                onClick={() => toggleSelection("select_all")}
                className="flex-shrink-0"
              >
                {selectedValues.length === groupedItems?.length ? (
                  <Checkbox_svg height={25} width={25} />
                ) : (
                  <Checkbox_unchecked_svg height={25} width={25} />
                )}
              </button>
            )}

            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setGroupedItems(
                    e.target.value.trim() === ""
                      ? MasterData
                      : MasterData.filter((m: Department) =>
                          m.department_name
                            .toString()
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase())
                        )
                  );
                }}
                placeholder="Search"
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />

              {searchQuery?.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setGroupedItems(MasterData);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Close_svg height={18} width={18} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredData.map((item) => renderItem(item, 0))}
          </div>
        </div>
      )}

      {/* Alert Box */}
      {alertVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-800">{alertMessage}</p>
            <button
              type="button"
              onClick={() => setAlertVisible(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLevelDropdown;
