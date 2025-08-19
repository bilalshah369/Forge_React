import AlertBox from "@/components/ui/AlertBox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RequiredLabel from "@/components/ui/required-label";
import { toast } from "@/hooks/use-toast";
import { AddAndEditDesignation } from "@/utils/Designation";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  editDesignation?: any;
}

export const DesignationModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editDesignation = null,
}) => {
  const [formData, setFormData] = React.useState({
    designation_id: -1,
    designation_name: "",
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
    if (editDesignation) {
      setFormData({
        designation_id: editDesignation.designation_id,
        designation_name: editDesignation.designation_name,
        is_active: editDesignation.is_active,
      });
    } else if (isOpen) {
      // Reset form when opening for add
      setFormData({
        designation_id: 0,
        designation_name: "",
        is_active: true,
      });
    }
  }, [editDesignation, isOpen]);

  const handleSubmit = async () => {
    if (!formData.designation_name) {
      toast({
        title: "Error",
        description: "Designation name is required",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await AddAndEditDesignation(formData);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        onCreate();
        showAlert(
          editDesignation
            ? "Designation updated successfully"
            : "Designation added successfully"
        );
        onClose();
      } else {
        console.error("Error adding/editing classification:", parsedRes);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showAlert("Failed to add/edit designation");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4 w-full">
          <DialogHeader className="items-center font-semibold text-lg">
            {editDesignation ? "Edit Designation" : "Add Designation"}
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="p-4 w-full"
          >
            <div className="flex-row w-full">
              <RequiredLabel className="text-sm">
                Designation Name
              </RequiredLabel>
              <input
                className="p-2 border border-gray-300 rounded w-full"
                type="text"
                name="designationName"
                value={formData.designation_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    designation_name: e.target.value,
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
