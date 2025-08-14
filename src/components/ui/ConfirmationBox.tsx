import React from "react";

interface ConfirmationBoxProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  isDeleted?: boolean;
  confirmButtonText: string;
  cancelButtonText: string;
}

const ConfirmationBox: React.FC<ConfirmationBoxProps> = ({
  visible,
  onClose,
  onConfirm,
  message = "Are you sure?",
  isDeleted = true,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <p className="text-center text-lg font-medium mb-6">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black font-semibold rounded hover:bg-gray-400"
          >
            {cancelButtonText}
          </button>

          {isDeleted ? (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
            >
              {confirmButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationBox;
