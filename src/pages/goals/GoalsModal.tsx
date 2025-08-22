import AlertBox from "@/components/ui/AlertBox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import MultiLevelDropdown from "@/components/ui/MultiLevelDropdown";
import {
  Department,
  MultiSelectDepartment,
} from "@/components/ui/MultiSelectDepartment";
import RequiredLabel from "@/components/ui/required-label";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/themes/ThemeProvider";
import { GetDepartments } from "@/utils/Departments";
import { InsertGoal } from "@/utils/Goals";
import { convertUTCtoLocalDateOnly } from "@/utils/util";
import React, { useEffect } from "react";
import { DatePicker } from "rsuite";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: () => void;
  editGoal?: any;
}

export const GoalsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editGoal = null,
}) => {
  const [formData, setFormData] = React.useState({
    goal_id: undefined,
    goal_name: "",
    description: "",
    target_year: "",
    status: true,
    goal_owner: "",
    stakeholders: "",
    start_date: "",
    end_date: "",
  });

  const [departments, setDepartments] = React.useState<Department[]>([]);
  const fetchDepartments = async () => {
    try {
      const res = await GetDepartments("");
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        setDepartments(parsedRes.data.departments);
      } else {
        console.error("Error fetching departments:", parsedRes);
      }
    } catch (error) {
      console.error("Error in fetchDepartments:", error);
    }
  };

  /* alert box */
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertVisible, setAlertVisible] = React.useState(false);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };
const {theme} =useTheme();
  React.useEffect(() => {
    fetchDepartments();
    if (editGoal) {
      console.log("Editing goal:", editGoal);
      setFormData({
        goal_id: editGoal.goal_id,
        goal_name: editGoal.goal_name,
        description: editGoal.description || "",
        target_year: editGoal.target_year || "",
        status: editGoal.is_active,
        goal_owner: editGoal.goal_owner || "",
        stakeholders: editGoal.stakeholders || "",
        start_date: editGoal.start_date || "",
        end_date: editGoal.end_date || "",
      });
    } else if (isOpen) {
      // Reset form when opening for add
      setFormData({
        goal_id: 0,
        goal_name: "",
        description: "",
        target_year: "",
        status: true,
        goal_owner: "",
        stakeholders: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [editGoal, isOpen]);

  const handleSubmit = async () => {
    if (
      !formData.goal_name ||
      !formData.target_year ||
      !formData.goal_owner ||
      !formData.stakeholders ||
      !formData.start_date ||
      !formData.end_date
    ) {
      toast({
        title: "Error",
        description: "Please fill the required fields",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await InsertGoal(formData);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        onCreate();
        onClose();
        showAlert(
          editGoal ? "Goal updated successfully" : "Goal added successfully"
        );
      } else {
        console.error("Error adding/editing classification:", parsedRes);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showAlert("Failed to add/edit goal");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4 w-full">
          <DialogHeader className="items-center font-semibold text-lg">
            {editGoal ? "Edit Goal" : "Add Goal"}
          </DialogHeader>
          <div className="p-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  Goal Name
                </RequiredLabel>
                <input
                  className="p-2 border border-gray-300 rounded w-full"
                  type="text"
                  name="goalName"
                  value={formData.goal_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goal_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  Target Year
                </RequiredLabel>
                <select
                  className="w-full p-3 border rounded max-h-10 overflow-y-auto"
                  value={formData.target_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_year: e.target.value,
                    })
                  }
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year.toString()} value={year.toString()}>
                        {year.toString()}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  Goal Owner
                </RequiredLabel>
                <MultiLevelDropdown
                  dropdown_id={"goalOwner"}
                  placeholder={"Select Goal Owner"}
                  dropdown_type={"single"}
                  selected_value={formData.goal_owner}
                  onSingleSelect={function (worker: string): void {
                    setFormData((prev) => ({
                      ...prev,
                      goal_owner: worker,
                    }));
                  }}
                  onMultiSelect={function (worker: string): void {
                    throw new Error("Function not implemented.");
                  }}
                  MasterData={departments}
                />
              </div>
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  Impacted Stakeholders
                </RequiredLabel>
                <MultiSelectDepartment
                  placeholder="Select Departments"
                  departments={departments}
                  selected={
                    formData.stakeholders?.length > 0
                      ? formData.stakeholders.split(",")
                      : []
                  }
                  onChange={async function (selected: string[]): Promise<void> {
                    const worker = selected?.join(",");
                    setFormData((prev) => ({
                      ...prev,
                      stakeholders: worker ?? "",
                    }));
                  }}
                />
              </div>
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  Start Date
                </RequiredLabel>
                <DatePicker
                  oneTap
                  value={
                    formData.start_date
                      ? convertUTCtoLocalDateOnly(formData.start_date)
                      : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const safeDate = new Date(date);
                      safeDate.setHours(12, 0, 0, 0);
                      const iso = safeDate.toISOString();
                      setFormData((prev) => ({
                        ...prev,
                        start_date: iso,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        start_date: "",
                      }));
                    }
                  }}
                  format="MM/dd/yyyy"
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy"
                  editable={false}
                  className="border border-gray-300 rounded"
                />
              </div>
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  End Date
                </RequiredLabel>
                <DatePicker
                  oneTap
                  value={
                    formData.end_date
                      ? convertUTCtoLocalDateOnly(formData.end_date)
                      : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const safeDate = new Date(date);
                      safeDate.setHours(12, 0, 0, 0);
                      const iso = safeDate.toISOString();
                      setFormData((prev) => ({
                        ...prev,
                        end_date: iso,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        end_date: "",
                      }));
                    }
                  }}
                  format="MM/dd/yyyy"
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy"
                  editable={false}
                  className="border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex-col mt-4">
              <Label className="text-sm font-semibold">Description</Label>
              <input
                className="p-2 border border-gray-300 rounded w-full"
                type="text"
                name="goalName"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2 flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-2 text-white rounded" style={{backgroundColor:theme.colors.drawerBackgroundColor}}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertBox
        message={alertMessage}
        visible={alertVisible}
        onCloseAlert={closeAlert}
      />
    </>
  );
};
