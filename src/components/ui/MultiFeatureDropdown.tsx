/* eslint-disable radix */
import React, { useEffect, useRef, useState } from "react";
import {
  Checkbox_svg,
  Checkbox_unchecked_svg,
  Chevron_down_svg,
  Circle_svg,
  Close_svg,
} from "../../assets/Icons";

//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MultiFeatureDropdownProp {
  dropdown_id: string;
  placeholder: string;
  dropdown_type: string;
  selected_value: string;
  onSingleSelect: (worker: string) => void;
  onMultiSelect: (worker: string) => void;
  MasterData: any;
  dropdown_styles?: string;
  options_styles?: string;
  className?: string;
}
export class Label {
  public label_id?: string;
  public label_name?: string;
  public label_desc?: string;
}

interface DropdownItem {
  label: string;
  value: string;
  group: string;
}

const MultiFeatureDropdown: React.FC<MultiFeatureDropdownProp> = ({
  dropdown_id,
  dropdown_type,
  placeholder,
  MasterData,
  selected_value,
  onSingleSelect,
  onMultiSelect,
  dropdown_styles = "",
  options_styles = "",
  className = "",
}) => {
  const [groupedItems, setGroupedItems] = useState<DropdownItem[]>(MasterData);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [label, setLabel] = useState<Label>(new Label());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownToggle = () => {
    setPopupVisible(!popupVisible);
  };
  const toggleSelection = (value: string) => {
    const allValues = groupedItems.map((item: any) => item.value.toString());
    if (value === "select_all") {
      if (selectedValues.length === allValues.length) {
        setSelectedValues([]); // Unselect all
        onMultiSelect("");
      } else {
        setSelectedValues(allValues); // Select all
        onMultiSelect(allValues.join(","));
      }
    } else {
      setSelectedValues((prev) => {
        const currentValues = prev || []; // Ensure prev is always an array

        // If value exists, remove it; otherwise, add it
        const updatedValues = currentValues.includes(value.toString())
          ? currentValues.filter((v) => v !== value.toString()) // Remove if exists
          : [...currentValues, value.toString()]; // Add if not exists
        onMultiSelect(updatedValues.join(","));
        return updatedValues; // Update state
      });
    }
  };

  // Function to group items
  const groupByCategory = () => {
    const grouped: { [key: string]: any[] } = {};
    groupedItems?.forEach((item) => {
      if (!grouped[item.group]) {
        grouped[item.group] = [];
      }
      grouped[item.group].push(item);
    });
    return Object.entries(grouped);
  };

  useEffect(() => {
    if (dropdown_type === "single") {
      setSelectedValue(selected_value?.toString());
    } else {
      setSelectedValues(selected_value ? selected_value?.split(",") : []);
    }

    setLabel((prev) => ({
      ...prev,
      label_name: "",
    }));

    setLoading(false);
  }, [dropdown_id, selected_value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setPopupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={`w-full min-w-48 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:border-blue-500 ${dropdown_styles}`}
      >
        <span className="flex-1 text-left truncate">
          {dropdown_type === "single"
            ? selectedValue
              ? MasterData?.find(
                  (m: DropdownItem) => m.value?.toString() === selectedValue
                )?.label?.substring(0, 50) ?? placeholder
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
          {dropdown_type === "single" && (
            <>
              {/* Search bar for single dropdown */}
              <div className="flex items-center space-x-2 p-2 border-b border-gray-200">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      const text = e.target.value;
                      setSearchQuery(text);
                      setGroupedItems(
                        text.trim() === ""
                          ? MasterData
                          : MasterData.filter((m: any) =>
                              m.label
                                .toString()
                                .toLowerCase()
                                .includes(text.toLowerCase())
                            )
                      );
                    }}
                    placeholder="Search"
                  />
                  {searchQuery?.length > 0 && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        setSearchQuery("");
                        setGroupedItems(MasterData);
                      }}
                    >
                      <Close_svg name="close" height={18} width={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-1 p-2">
                  {groupByCategory().map(([groupName, items]) => (
                    <div key={groupName}>
                      {items.map((item: any) => (
                        <div key={item.value} className="bg-white">
                          <button
                            type="button"
                            className={`w-full p-2 text-left flex items-center justify-between hover:bg-gray-100 rounded ${
                              selectedValue === item.value
                                ? "bg-blue-600 text-white font-bold"
                                : "text-gray-800"
                            }`}
                            onClick={() => {
                              setSelectedValue(item.value);
                              onSingleSelect(item.value);
                              setPopupVisible(false);
                            }}
                          >
                            <span className="truncate">
                              {item.label?.substring(0, 50)}
                            </span>
                            {item.color && (
                              <Circle_svg
                                name="circle"
                                height={20}
                                width={20}
                                fill={item.color?.toString().trim() ?? ""}
                              />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {dropdown_type === "multi" && (
            <>
              {/* Header with Select All and Search */}
              <div className="flex items-center space-x-2 p-2 border-b border-gray-200">
                <button
                  type="button"
                  className="flex-shrink-0"
                  onClick={() => {
                    toggleSelection("select_all");
                  }}
                >
                  {selectedValues.length === groupedItems?.length ? (
                    <Checkbox_svg height={25} width={25} />
                  ) : (
                    <Checkbox_unchecked_svg height={25} width={25} />
                  )}
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      const text = e.target.value;
                      setSearchQuery(text);
                      setGroupedItems(
                        text.trim() === ""
                          ? MasterData
                          : MasterData.filter((m: any) =>
                              m.label
                                .toString()
                                .toLowerCase()
                                .includes(text.toLowerCase())
                            )
                      );
                    }}
                    placeholder="Search"
                  />
                  {searchQuery?.length > 0 && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        setSearchQuery("");
                        setGroupedItems(MasterData);
                      }}
                    >
                      <Close_svg name="close" height={18} width={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-1 p-2">
                  {groupByCategory().map(([groupName, items]) => (
                    <div key={groupName}>
                      {items.map((item: any) => (
                        <div key={item.value} className="bg-white">
                          <button
                            type="button"
                            className="w-full p-2 flex items-center space-x-3 hover:bg-gray-100 rounded"
                            onClick={() => {
                              toggleSelection(item.value);
                            }}
                          >
                            <div>
                              {selectedValues?.includes(
                                item.value.toString()
                              ) ? (
                                <Checkbox_svg height={25} width={25} />
                              ) : (
                                <Checkbox_unchecked_svg
                                  height={25}
                                  width={25}
                                />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-black">
                                {item?.label?.length > 35
                                  ? item?.label?.substring(0, 50) + "..."
                                  : item?.label}
                              </span>
                            </div>
                            <div>
                              {item.color && (
                                <Circle_svg
                                  name="circle"
                                  height={20}
                                  width={20}
                                  fill={item.color?.toString().trim() ?? ""}
                                />
                              )}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiFeatureDropdown;
