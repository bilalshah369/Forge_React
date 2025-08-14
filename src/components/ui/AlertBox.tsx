import React, { useEffect } from "react";

interface AlertBoxProps {
  visible: boolean;
  onCloseAlert: () => void;
  message?: string;
  themeColor?: string; // Optional: pass custom button color (e.g., from context)
}

const AlertBox: React.FC<AlertBoxProps> = ({
  visible,
  onCloseAlert,
  message = "",
  themeColor = "#2563eb", // Tailwind's blue-600 as default
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAlert();
    };
    if (visible) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [visible, onCloseAlert]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCloseAlert}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-base font-medium text-gray-800 mb-4">
          {message}
        </p>
        <div className="flex justify-center">
          <button
            onClick={onCloseAlert}
            className="px-4 py-2 rounded text-white font-semibold"
            style={{ backgroundColor: themeColor }}
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;
