import AlertBox from "@/components/ui/AlertBox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RequiredLabel from "@/components/ui/required-label";
import { toast } from "@/hooks/use-toast";
import { AddAndEditClassification } from "@/utils/Masters";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  editClassification?: any;
}

export const ClassificationModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  editClassification = null,
}) => {
  const [formData, setFormData] = React.useState({
    classification_id: -1,
    classification_name: "",
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
    if (editClassification) {
      setFormData({
        classification_id: editClassification.classification_id,
        classification_name: editClassification.classification_name,
        is_active: editClassification.is_active,
      });
    } else if (isOpen) {
      // Reset form when opening for add
      setFormData({
        classification_id: 0,
        classification_name: "",
        is_active: true,
      });
    }
  }, [editClassification, isOpen]);

  const handleSubmit = async () => {
    if (!formData.classification_name) {
      toast({
        title: "Error",
        description: "Classification name is required",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await AddAndEditClassification(formData);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        onCreate();
        onClose();
        showAlert(
          editClassification
            ? "Classification updated successfully"
            : "Classification added successfully"
        );
      } else {
        console.error("Error adding/editing classification:", parsedRes);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showAlert("Failed to add/edit classification");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-4 w-full">
          <DialogHeader className="items-center font-semibold text-lg">
            {editClassification ? "Edit Classification" : "Add Classification"}
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
                Classification Name
              </RequiredLabel>
              <input
                className="border border-gray-300 rounded p-2 w-full"
                type="text"
                name="classificationName"
                value={formData.classification_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classification_name: e.target.value,
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

      {/* alert box */}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </>
  );
};
