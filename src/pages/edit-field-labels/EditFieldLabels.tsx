import React, { useState, useEffect } from "react";
import { useLabels } from "./LabelContext";
import { fetchLabelsByCategory } from "../../services/labelService";
import AlertBox from "@/components/ui/AlertBox";

interface ApiLabel {
  id: number;
  label_id: string;
  label_name: string | null;
  label_desc: string | null;
  default_label_name: string | null;
  default_label_desc: string | null;
  is_active: boolean;
  customer_id: number;
  category: string;
}

const EditFieldLabels: React.FC = () => {
  const { updateLabel } = useLabels(); // Only use updateLabel from context
  const [allLabels, setAllLabels] = useState<ApiLabel[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<ApiLabel[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [descValues, setDescValues] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | string>(10);

  // Fetch all labels on mount
  useEffect(() => {
    const fetchAllLabels = async () => {
      setIsLoading(true);
      try {
        const apiLabels = await fetchLabelsByCategory("");
        setAllLabels(apiLabels);
        setFilteredLabels(apiLabels);
        const initialInputs = apiLabels.reduce(
          (acc, label) => ({
            ...acc,
            [label.label_id]: label.label_name || "",
          }),
          {}
        );
        const initialDescs = apiLabels.reduce(
          (acc, label) => ({
            ...acc,
            [label.label_id]: label.label_desc || "",
          }),
          {}
        );
        setInputValues(initialInputs);
        setDescValues(initialDescs);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching all labels:", error);
        showAlert("Failed to fetch labels.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllLabels();
  }, []);

  // Filter labels based on search query
  useEffect(() => {
    const filtered = allLabels.filter(
      (label) =>
        (label.default_label_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (label.label_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        )
    );
    setFilteredLabels(filtered);
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchQuery, allLabels]);

  // Handle input change for custom labels
  const handleInputChange = (labelId: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [labelId]: value,
    }));
  };

  // Handle input change for descriptions
  const handleDescChange = (labelId: string, value: string) => {
    setDescValues((prev) => ({
      ...prev,
      [labelId]: value,
    }));
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    const updates = allLabels
      .filter(
        (label) =>
          inputValues[label.label_id] !== (label.label_name || "") ||
          descValues[label.label_id] !== (label.label_desc || "")
      )
      .map((label) => ({
        labelId: label.label_id,
        label_name: inputValues[label.label_id]?.trim() || "",
        label_desc: descValues[label.label_id]?.trim() || "",
      }));

    if (updates.length === 0) {
      showAlert("No changes to save.");
      return;
    }

    try {
      for (const update of updates) {
        if (!update.label_name) {
          showAlert(`Custom label cannot be empty for ${update.labelId}.`);
          return;
        }
        await updateLabel(update.labelId, {
          label_name: update.label_name,
          label_desc: update.label_desc,
          is_active: true,
        });
      }
      setAllLabels((prev) =>
        prev.map((label) => {
          const update = updates.find((u) => u.labelId === label.label_id);
          return update
            ? {
                ...label,
                label_name: update.label_name,
                label_desc: update.label_desc,
              }
            : label;
        })
      );
      setFilteredLabels((prev) =>
        prev.map((label) => {
          const update = updates.find((u) => u.labelId === label.label_id);
          return update
            ? {
                ...label,
                label_name: update.label_name,
                label_desc: update.label_desc,
              }
            : label;
        })
      );
      showAlert("All labels updated successfully!");
    } catch (error) {
      console.error("Error updating labels:", error);
      showAlert("Failed to update some labels.");
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  // Pagination logic
  const totalPages = Math.ceil(
    filteredLabels.length /
      (rowsPerPage === "All" ? 1000000 : Number(rowsPerPage))
  );
  const paginatedData = filteredLabels.slice(
    (currentPage - 1) * (rowsPerPage === "All" ? 1000000 : Number(rowsPerPage)),
    currentPage * (rowsPerPage === "All" ? 1000000 : Number(rowsPerPage))
  );

  const getPaginationRange = () => {
    const totalNumbers = 5;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    const pages: (number | string)[] = [1];

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onRowsPerPageChange = (value: number | string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-5 flex-1">
      <div className="max-h-full overflow-auto">
        {/* <h1 className="text-2xl font-bold mb-2.5 text-center">Edit Labels</h1> */}
        <div className="flex justify-center mb-4">
          <input
            type="text"
            className="border border-gray-300 p-2 rounded bg-white w-80 text-base mx-auto"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search labels..."
          />
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="w-4/5 mx-auto">
            {/* Table Header */}
            <div className="flex bg-blue-900 border-b border-gray-300 py-2.5">
              <div className="p-1.5 w-[30%] text-left font-bold text-base text-white">
                Default Label
              </div>
              <div className="p-1.5 w-[30%] text-center font-bold text-base text-white">
                Custom Label
              </div>
              <div className="p-1.5 w-[40%] text-center font-bold text-base text-white">
                Description
              </div>
            </div>
            {/* Table Body */}
            {paginatedData.length === 0 ? (
              <p>No labels found.</p>
            ) : (
              paginatedData.map((item, index) => (
                <div
                  key={item.label_id}
                  className="flex border-b border-gray-200 py-2.5 items-center"
                >
                  <div className="p-1.5 w-[30%] text-left">
                    {item.default_label_name || "N/A"}
                  </div>
                  <div className="p-1.5 w-[30%]">
                    <input
                      type="text"
                      className="border border-gray-300 p-2 rounded bg-white w-full"
                      value={inputValues[item.label_id] || ""}
                      onChange={(e) =>
                        handleInputChange(item.label_id, e.target.value)
                      }
                      placeholder="Enter custom label"
                    />
                  </div>
                  <div className="p-1.5 w-[40%]">
                    <input
                      type="text"
                      className="border border-gray-300 p-2 rounded bg-white w-full"
                      value={descValues[item.label_id] || ""}
                      onChange={(e) =>
                        handleDescChange(item.label_id, e.target.value)
                      }
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              ))
            )}
            {/* Update Button */}
            <button
              className="bg-blue-900 py-2.5 w-36 rounded mx-auto block my-2.5 text-white font-bold text-center cursor-pointer hover:bg-blue-800"
              onClick={handleBulkUpdate}
            >
              Update
            </button>
            {/* Pagination */}
            <div className="mt-2.5">
              <div className="flex justify-end">
                <div className="flex items-center">
                  {getPaginationRange().map((page) => {
                    if (page === "...") {
                      return (
                        <span
                          key={page}
                          className="text-sm text-black self-center"
                        >
                          {page}
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`p-2 mx-0.5 rounded text-sm ${
                          currentPage === page
                            ? "bg-blue-900 text-white font-bold"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center mr-5">
                  <span className="text-sm mr-2.5">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) =>
                      onRowsPerPageChange(
                        e.target.value === "All"
                          ? "All"
                          : Number(e.target.value)
                      )
                    }
                    className="w-24 p-1 border border-gray-300 rounded"
                  >
                    {[10, 20, 50, "All"].map((value) => (
                      <option key={value} value={value}>
                        {value.toString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default EditFieldLabels;
