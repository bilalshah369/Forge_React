import React, { useEffect, useState } from "react";
import { Chevron_down_svg, Chevron_right_svg } from "../../assets/Icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import AlertBox from "@/components/ui/AlertBox";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface DataItem {
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  children?: DataItem[];
}

const BudgetCategory = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [parentCategoryName, setParentCategoryName] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [newCategoryDetails, setNewCategoryDetails] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<{
    category_id: number;
    parent_category_id?: number | null;
  }>({ category_id: 0, parent_category_id: null });
  const initialNewCategory = {
    category_id: null,
    category_name: "",
    parent_category_id: null,
    is_active: true,
  };
  const [category, setCategory] = useState(initialNewCategory);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  const fetchCategorySubcategory = async () => {
    console.log("Fetching categories and subcategories...");
    try {
      setLoading(true);
      const token = await localStorage.getItem("Token");
      const response = await fetch(
        `${BASE_URL}/utils/get_budget_category_subcategory`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch categories");
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log("Fetched Data:", result);

      const allCategories = result.data.category;
      if (allCategories.length === 0) {
        console.warn("No categories available.");
        return;
      }

      // Separate root categories and subcategories
      const rootCategories = allCategories.filter(
        (cat: DataItem) => cat.parent_category_id === null
      );
      const subCategories = allCategories.filter(
        (cat: DataItem) => cat.parent_category_id !== null
      );

      // Create a Map for easy lookup
      const categoryMap = new Map<number, DataItem>(
        rootCategories.map((cat: DataItem) => [
          cat.category_id,
          { ...cat, children: [] },
        ])
      );

      // Attach subcategories to their respective parent categories
      subCategories.forEach((subCat: DataItem) => {
        const parent = categoryMap.get(subCat.parent_category_id!);
        if (parent) {
          parent.children!.push(subCat);
        }
      });

      const finalCategoryTree = Array.from(categoryMap.values());

      console.log(
        "Final Mapped Categories:",
        JSON.stringify(finalCategoryTree, null, 2)
      );

      // Update state
      setData(finalCategoryTree);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // await fetchCategory();
      await fetchCategorySubcategory();
      // await fetchUsers();
    };
    initializeData();
  }, []);

  const toggleExpand = (id: number) => {
    //alert(id);
    console.log("hi" + id);
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const closeAddModal = () => {
    setIsModalVisible(false);
    setParentCategoryName("");
    setCategory(initialNewCategory);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setParentCategoryName("");
  };

  const handleEdit = (category: DataItem) => {
    setIsEditModalVisible(true);
    setNewCategoryDetails({ ...category });
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(`${BASE_URL}/utils/delete_budget_category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ category_id: categoryId }),
      });
      if (response.ok) {
        showAlert("Category deleted successfully");
        fetchCategorySubcategory();
      } else {
        showAlert("Error in deleting category");
      }
    } catch (error) {
      showAlert("Error in deleting category");
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${BASE_URL}/utils/delete_budget_subcategory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ sub_category_id: subCategoryId }),
        }
      );
      if (response.ok) {
        showAlert("Subcategory deleted successfully");
        fetchCategorySubcategory();
      } else {
        showAlert("Error in deleting Subcategory");
      }
    } catch (error) {
      showAlert("Error in deleting Subcategory");
    }
  };

  const handleUpdateCategory = async () => {
    if (!newCategoryDetails.category_name.trim()) {
      showAlert("Category name can never be empty");
      return;
    }
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(`${BASE_URL}/utils/update_budget_category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(newCategoryDetails),
      });
      if (response.ok) {
        showAlert("Category updated successfully");
        fetchCategorySubcategory();
        setCategory(initialNewCategory);
        setIsEditModalVisible(false);
      } else {
        showAlert("Failed to add category");
      }
    } catch (error) {
      showAlert("Failed to add category");
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!newCategoryDetails.category_name.trim()) {
      showAlert("Subcategory name can never be empty");
      return;
    }
    try {
      const token = localStorage.getItem("Token");
      const updatedCategoryDetails = {
        sub_category_id: newCategoryDetails.category_id,
        sub_category_name: newCategoryDetails.category_name,
      };
      const response = await fetch(
        `${BASE_URL}/utils/update_budget_subcategory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(updatedCategoryDetails),
        }
      );
      if (response.ok) {
        showAlert("Subcategory updated successfully");
        fetchCategorySubcategory();
        setCategory(initialNewCategory);
        setIsEditModalVisible(false);
      } else {
        showAlert("Failed to update subcategory name");
      }
    } catch (error) {
      showAlert("Failed to update subcategory name");
    }
  };

  const handleAddSubCategory = (parentId: number, categoryName: string) => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      parent_category_id: parentId,
    }));
    setParentCategoryName(categoryName);
    setIsModalVisible(true);
  };

  const handleAddCategory = async () => {
    if (!category.category_name.trim()) {
      showAlert("Category name can never be empty");
      return;
    }
    const categoryToAdd = {
      ...category,
      category_name: category.category_name,
    };
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(`${BASE_URL}/utils/add_budget_category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(categoryToAdd),
      });
      if (response.ok) {
        showAlert("Category added successfully");
        fetchCategorySubcategory();
        setCategory(initialNewCategory);
        setIsModalVisible(false);
      } else {
        showAlert("Failed to add category");
      }
    } catch (error) {
      showAlert("Failed to add category");
    }
  };

  const handleAddSubcategory = async () => {
    if (!category.category_name.trim()) {
      showAlert("Subcategory name can never be empty");
      return;
    }
    const subcategoryToAdd = {
      sub_category_name: category.category_name,
      category_id: category.parent_category_id,
      is_active: true,
    };
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(`${BASE_URL}/utils/add_budget_subcategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(subcategoryToAdd),
      });
      if (response.ok) {
        showAlert("Subcategory added successfully");
        fetchCategorySubcategory();
        setCategory(initialNewCategory);
        setIsModalVisible(false);
      } else {
        showAlert("Failed to add Subcategory name");
      }
    } catch (error) {
      showAlert("Failed to add Subcategory name");
    }
  };

  const renderRows = (items: DataItem[], level = 0) => {
    return items.map((item) => (
      <React.Fragment key={item.category_id}>
        <tr className={level === 0 ? "" : "bg-gray-50"}>
          <td
            className={`py-2 px-4 text-left align-top ${
              level > 0 ? "pl-16" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {item.children && (
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={() => toggleExpand(item.category_id)}
                >
                  {expandedRows[item.category_id] ? (
                    <Chevron_down_svg height={15} width={15} fill="black" />
                  ) : (
                    <Chevron_right_svg height={15} width={15} />
                  )}
                </button>
              )}
              <span
                title={item.category_name}
                className="truncate max-w-xs text-black"
              >
                {item.category_name}
              </span>
            </div>
          </td>
          <td className="py-2 px-4">
            <div className="flex flex-row gap-2">
              <button
                type="button"
                className="hover:bg-gray-200 p-1 rounded"
                onClick={() => {
                  setSelectedItem(item);
                  handleEdit(item);
                }}
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="hover:bg-gray-200 p-1 rounded"
                onClick={() => {
                  setSelectedItem(item);
                  if (item.parent_category_id === null) {
                    // Category deletion
                    const confirmed = confirm(
                      "The category you are deleting may have sub-categories associated with it.\nDo you still want to proceed with this action?"
                    );
                    if (confirmed) {
                      handleDeleteCategory(item.category_id);
                    }
                  } else {
                    // Subcategory deletion
                    const confirmed = confirm(
                      "Are you sure you want to delete this sub-category?"
                    );
                    if (confirmed) {
                      handleDeleteSubCategory(item.category_id);
                    }
                  }
                }}
                title="Delete"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
              {item.parent_category_id === null && (
                <button
                  type="button"
                  className="hover:bg-gray-200 p-1 rounded"
                  onClick={() =>
                    handleAddSubCategory(item.category_id, item.category_name)
                  }
                  title="Add Subcategory"
                >
                  <Plus width={20} height={20} />
                </button>
              )}
            </div>
          </td>
        </tr>
        {expandedRows[item.category_id] &&
          item.children &&
          renderRows(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-blue-800 rounded hover:bg-blue-100"
          onClick={() => {
            setCategory((prev) => ({
              ...prev,
              category_name: "",
              parent_category_id: null,
            }));
            setIsModalVisible(true);
          }}
        >
          <Plus className="w-5 h-5 fill-[#044086]" />
          Add Category
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-[#044086]">
              <tr>
                <th className="py-2 px-4 text-white font-bold text-left w-1/2">
                  Name
                </th>
                <th className="py-2 px-4 text-white font-bold text-left w-1/2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>{renderRows(data)}</tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      <Dialog open={isModalVisible} onOpenChange={closeAddModal}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold mb-2">Add New Category</h2>
          </DialogHeader>
          {parentCategoryName && (
            <DialogDescription>
              <span className="mb-2 text-gray-700">
                Parent Category: {parentCategoryName}
              </span>
            </DialogDescription>
          )}
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            placeholder="Name"
            value={category.category_name}
            onChange={(e) =>
              setCategory((prev) => ({
                ...prev,
                category_name: e.target.value,
              }))
            }
          />
          <div className="flex justify-center gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={closeAddModal}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-600"
              onClick={() => {
                if (category.parent_category_id) {
                  handleAddSubcategory();
                } else {
                  handleAddCategory();
                }
              }}
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Category Modal */}
      <Dialog open={isEditModalVisible} onOpenChange={closeEditModal}>
        <DialogContent className="p-4">
          <DialogHeader className="text-lg font-bold mb-2">
            Edit Category
          </DialogHeader>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            placeholder="Name"
            value={newCategoryDetails.category_name || ""}
            onChange={(e) =>
              setNewCategoryDetails((prev: any) => ({
                ...prev,
                category_name: e.target.value,
              }))
            }
          />
          <div className="flex justify-center gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={closeEditModal}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-600"
              onClick={() => {
                if (selectedItem.parent_category_id !== null) {
                  handleUpdateSubCategory();
                } else {
                  handleUpdateCategory();
                }
              }}
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default BudgetCategory;
