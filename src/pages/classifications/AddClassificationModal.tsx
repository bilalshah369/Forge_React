import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RequiredLabel from "@/components/ui/required-label";
import {
  AddAndEditClassification,
  deleteClassification,
} from "@/utils/Masters";
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
        classification_id: -1,
        classification_name: "",
        is_active: true,
      });
    }
  }, [editClassification, isOpen]);

  const handleSubmit = async () => {
    try {
      const res = await AddAndEditClassification(formData);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        onCreate();
        onClose();
      } else {
        console.error("Error adding/editing classification:", parsedRes);
      }
    } catch (error) {}
  };

  return (
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
            <RequiredLabel>Classification Name</RequiredLabel>
            <Input
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
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
  );
};
