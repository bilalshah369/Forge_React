import AlertBox from "@/components/ui/AlertBox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import MultiFeatureDropdown from "@/components/ui/MultiFeatureDropdown";
import MultiLevelDropdown from "@/components/ui/MultiLevelDropdown";
import { Department } from "@/components/ui/MultiSelectDepartment";
import { DropdownItem } from "@/components/ui/MultiSelectDropdown";
import RequiredLabel from "@/components/ui/required-label";
import { toast } from "@/hooks/use-toast";
import { GetDepartments } from "@/utils/Departments";
import { GetGoals } from "@/utils/Goals";
import { InsertProgram } from "@/utils/ManageProgram";
import { convertUTCtoLocalDateOnly } from "@/utils/util";
import React, { useState } from "react";
import { DatePicker } from "rsuite";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: () => void;
  editProgram?: any;
}

export const ProgramsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editProgram = null,
}) => {
  const [formData, setFormData] = React.useState({
    program_id: undefined,
    goal_id: undefined,
    program_name: "",
    description: "",
    target_year: "",
    status: true,
    program_owner: "",
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

  const [goals, setGoals] = useState<DropdownItem[]>(null);
  const fetchGoals = async () => {
    try {
      const res = await GetGoals();
      const parsedRes = JSON.parse(res);
      setGoals(
        parsedRes.data.goals.map((goal: any) => ({
          label: goal.goal_name,
          value: goal.goal_id,
        }))
      );
    } catch (error) {
      console.error("Error in fetchGoals:", error);
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

  React.useEffect(() => {
    fetchDepartments();
    fetchGoals();
    if (editProgram) {
      console.log("Editing program:", editProgram);
      setFormData({
        program_id: editProgram.program_id,
        goal_id: editProgram.goal_id,
        program_name: editProgram.program_name,
        description: editProgram.description || "",
        target_year: editProgram.target_year || "",
        status: editProgram.is_active,
        program_owner: editProgram.program_owner || "",
        start_date: editProgram.start_date || "",
        end_date: editProgram.end_date || "",
      });
    } else if (isOpen) {
      // Reset form when opening for add
      setFormData({
        program_id: 0,
        goal_id: 0,
        program_name: "",
        description: "",
        target_year: "",
        status: true,
        program_owner: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [editProgram, isOpen]);

  const handleSubmit = async () => {
    if (
      !formData.program_name ||
      !formData.goal_id ||
      !formData.target_year ||
      !formData.program_owner ||
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
      const res = await InsertProgram(formData);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        onCreate();
        showAlert(
          editProgram
            ? "Program updated successfully"
            : "Program added successfully"
        );
        onClose();
      } else {
        console.error("Error adding/editing program:", parsedRes);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showAlert("Failed to add/edit program");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4 w-full">
          <DialogHeader className="items-center font-semibold text-lg">
            {editProgram ? "Edit Program" : "Add Program"}
          </DialogHeader>
          <div className="p-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-col">
                <RequiredLabel className="text-sm font-semibold">
                  Program Name
                </RequiredLabel>
                <input
                  className="p-2 border border-gray-300 rounded w-full"
                  type="text"
                  name="programName"
                  value={formData.program_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      program_name: e.target.value,
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
                  Program Owner
                </RequiredLabel>
                <MultiLevelDropdown
                  dropdown_id={"programOwner"}
                  placeholder={"Select Program Owner"}
                  dropdown_type={"single"}
                  selected_value={formData.program_owner}
                  onSingleSelect={function (worker: string): void {
                    setFormData((prev) => ({
                      ...prev,
                      program_owner: worker,
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
                  Goal
                </RequiredLabel>
                <MultiFeatureDropdown
                  placeholder="Select Goal"
                  MasterData={goals}
                  selected_value={formData.goal_id}
                  onSingleSelect={function (worker: string) {
                    setFormData((prev) => ({
                      ...prev,
                      goal_id: worker ?? "",
                    }));
                  }}
                  onMultiSelect={() => {}}
                  dropdown_id={"goal"}
                  dropdown_type={"single"}
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
                name="programName"
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
                type="submit"
                className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
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
