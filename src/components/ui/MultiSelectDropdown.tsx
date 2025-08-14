import { useEffect, useRef, useState } from "react";

export interface DropdownItem {
  label: string;
  value: string;
  color?: string;
}

interface MultiSelectDropdownProps {
  items: DropdownItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  showColorIndicator?: boolean;
}

export default function MultiSelectDropdown({
  items,
  selected,
  onChange,
  placeholder = "Select...",
  showColorIndicator = true,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const filtered = items?.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Display selected labels or placeholder text
  // const selectedLabels = items
  //   .filter((item) => selected.includes(item.value?.toString()))
  //   .map((item) => item.label)
  //   .join(", ");

  return (
    <div className="relative  text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-gray-300 rounded-md px-4 py-[0.450rem]  bg-white text-sm text-gray-700 flex justify-between items-center"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.length > 0
          ? selected?.length + " item selected"
          : placeholder}
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="origin-top-right absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-72 overflow-y-auto z-50">
          <div className="p-2">
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              aria-label="Search items"
            />
          </div>
          <ul
            className="max-h-60 overflow-y-auto px-2 py-1 space-y-1"
            role="listbox"
          >
            {filtered.length === 0 && (
              <li className="text-gray-500 text-sm px-2 py-1">
                No results found
              </li>
            )}
            {filtered.map((item) => (
              <li
                key={item.value}
                className="flex items-center justify-between space-x-2 cursor-pointer"
                onClick={() => toggleValue(item.value?.toString())}
                role="option"
                aria-selected={selected.includes(item.value?.toString())}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.value?.toString())}
                    onChange={() => {
                      ////debugger;
                      toggleValue(item.value?.toString());
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600"
                    onClick={(e) => e.stopPropagation()} // prevent double toggle on li click
                  />
                  <label className="text-sm text-gray-700 cursor-pointer">
                    {item.label}
                  </label>
                </div>
                {showColorIndicator && item.color && (
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-label={`Color indicator for ${item.label}`}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
