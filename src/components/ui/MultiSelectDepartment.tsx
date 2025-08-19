import React, { useEffect, useRef, useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type Department = {
  department_id: number;
  parent_department_id: number | null;
  department_name: string;
  department_color: string;
};

type Props = {
  departments: Department[]; // 👈 Raw department input
  selected: string[]; // Selected department_ids as strings
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  multi?: boolean;
};

type DropdownOption = {
  label: string;
  value: string;
  color: string;
  children?: DropdownOption[];
};

export const MultiSelectDepartment: React.FC<Props> = ({
  departments,
  selected,
  onChange,
  placeholder = "Select Options",
  searchable = true,
  className = "",multi=true
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert flat department list to nested dropdown options
  const transformDepartments = (list: Department[]): DropdownOption[] => {
    const map = new Map<number, DropdownOption>();
    const roots: DropdownOption[] = [];

    list.forEach((dept) => {
      map.set(dept.department_id, {
        label: dept.department_name,
        value: dept.department_id.toString(),
        color: dept.department_color,
        children: [],
      });
    });

    list.forEach((dept) => {
      const option = map.get(dept.department_id)!;
      if (dept.parent_department_id === null) {
        roots.push(option);
      } else {
        const parent = map.get(dept.parent_department_id);
        if (parent) {
          parent.children!.push(option);
        }
      }
    });

    return roots;
  };

  // const options = useMemo(() => {
  //   transformDepartments(departments);
  // }, [departments]);

  const options = useMemo(() => {
    console.log("Departments received:", departments);
    return transformDepartments(departments);
  }, [departments]);
  // const toggleSelect = (value: string) => {
  //   onChange(
  //     selected.includes(value)
  //       ? selected.filter((v) => v !== value)
  //       : [...selected, value]
  //   );
  // };
  const toggleSelect = (value: string) => {
  if (multi) {
    // Multi-select (existing behavior)
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  } else {
    // Single-select
    onChange(selected.includes(value) ? [] : [value]);
    setOpen(false); // 👈 optionally close dropdown after single select
  }
};

  const toggleExpand = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label]
    );
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterOptions = (opts: DropdownOption[]): DropdownOption[] => {
    return opts
      .map((opt) => {
        if (
          opt.label.toLowerCase().includes(search.toLowerCase()) ||
          (opt.children && filterOptions(opt.children).length > 0)
        ) {
          return {
            ...opt,
            children: opt.children ? filterOptions(opt.children) : undefined,
          };
        }
        return null;
      })
      .filter(Boolean) as DropdownOption[];
  };

  const renderOptions = (opts: DropdownOption[], level = 0) => {
    return opts.map((item) => {
      const isGroup = !!item.children?.length;
      const isExpanded = expandedGroups.includes(item.label);

      return (
        <div key={item.value} className={`pl-${level * 4}`}>
          <div className="flex justify-between items-center w-full ">
            <div className="flex items-center space-x-2">
              <input
                //type="checkbox"
                type={multi ? "checkbox" : "radio"}
                checked={selected.includes(item.value)}
                onChange={() => toggleSelect(item.value)}
                
              />
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              {isGroup && (
                <button onClick={() => toggleExpand(item.label)} type="button">
                  {isExpanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
          {isGroup && isExpanded && (
            <div className="ml-5 mt-1">
              {renderOptions(item.children || [], level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredOptions = search ? filterOptions(options) : options;

  return (
    <div className={`relative  text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-gray-300 rounded-md px-4 py-[0.450rem]  bg-white text-sm text-gray-700 flex justify-between items-center "
      >
        {selected?.length > 0
          ? selected?.length + " item selected"
          : placeholder}
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto right-0">
          {searchable && (
            <div className="p-2">
              <input
                type="text"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className="px-2 pb-2 space-y-1">
            {renderOptions(filteredOptions)}
          </div>
        </div>
      )}
    </div>
  );
};
