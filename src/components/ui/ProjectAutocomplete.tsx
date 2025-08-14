import { Search } from "lucide-react";
import React, { useState } from "react";

type Project = {
  id: string;
  description: string;
};

type Props = {
  projects: Project[];
  onSelect: (project: Project) => void;
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

export default function ProjectAutocomplete({ projects, onSelect }: Props) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = projects.filter((p) =>
    `${p.id} ${p.description}`.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="relative w-96">
      {/* <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)} // avoid dropdown flicker
        onFocus={() => setShowDropdown(true)}
        placeholder="Search project"
        className="w-full border rounded px-3 py-2 focus:outline-none"
      /> */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search Project..."
          className="w-full pl-10 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        />
      </div>

      {showDropdown && input && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded mt-1 w-full shadow max-h-64 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
              onClick={() => {
                onSelect(p);
                setInput(`${p.id}`);
                setShowDropdown(false);
              }}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(`${p.id}`, input),
                }}
              />
              <span className="text-gray-500">
                {" "}
                (
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(p.description, input),
                  }}
                />
                )
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
