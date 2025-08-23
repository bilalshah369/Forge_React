import React, { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface Props {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

const ColumnsDropdown: React.FC<Props> = ({ columns, setColumns }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleColumn = (key: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center border rounded-md px-3 py-1.5 text-sm hover:bg-gray-100"
      >
        <Settings className="w-4 h-4 mr-2" />
        Columns Visibility
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg border p-2 z-50">
          <button
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() =>
              setColumns(prev => prev.map(col => ({ ...col, visible: true })))
            }
          >
            Select All
          </button>
          <button
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() =>
              setColumns(prev => prev.map(col => ({ ...col, visible: false })))
            }
          >
            Clear All
          </button>
          <hr className="my-2" />

          {/* Checkbox List */}
          <div className="max-h-48 overflow-y-auto">
            {columns.map(column => (
              <label
                key={column.key}
                className="flex items-center space-x-2 px-2 py-1 text-sm hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => handleToggleColumn(column.key)}
                  className="rounded border-gray-300"
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnsDropdown;
