import AlertBox from "@/components/ui/AlertBox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RequiredLabel from "@/components/ui/required-label";
import { toast } from "@/hooks/use-toast";
import { AddAndEditRole } from "@/utils/RoleMaster";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  editRole?: any;
}

export const RoleModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editRole = null,
}) => {
  const [formData, setFormData] = React.useState({
    role_id: -1,
    role_name: "",
    is_active: true,
  });

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
    if (editRole) {
      setFormData({
        role_id: editRole.role_id,
        role_name: editRole.role_name,
        is_active: editRole.is_active,
      });
    } else if (isOpen) {
      // Reset form when opening for add
      setFormData({
        role_id: 0,
        role_name: "",
        is_active: true,
      });
    }
  }, [editRole, isOpen]);

  const handleSubmit = async () => {
    if (!formData.role_name) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await AddAndEditRole(formData);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        onCreate();
        showAlert(
          editRole ? "Role updated successfully" : "Role added successfully"
        );
        onClose();
      } else {
        console.error("Error adding/editing classification:", parsedRes);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showAlert("Failed to add/edit role");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4 w-full">
          <DialogHeader className="items-center font-semibold text-lg">
            {editRole ? "Edit Role" : "Add Role"}
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="p-4 w-full"
          >
            <div className="flex-row w-full">
              <RequiredLabel className="text-sm">Role Name</RequiredLabel>
              <input
                className="p-2 border border-gray-300 rounded w-full"
                type="text"
                name="roleName"
                value={formData.role_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role_name: e.target.value,
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
                onClick={() => {
                  onCreate();
                }}
              >
                Submit
              </button>
            </div>
          </form>
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
