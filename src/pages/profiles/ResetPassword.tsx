import React, { useState } from "react";
import { insertResetPassword } from "../../utils/password";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // State for shake animation
  const [passwordValidationFailed, setPasswordValidationFailed] =
    useState(false);

  const validatePassword = () => {
    return (
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    );
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      setPasswordValidationFailed(true);
      // Reset animation state after a delay
      setTimeout(() => setPasswordValidationFailed(false), 600);
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalTitle("Error");
      setModalMessage("New password and confirm password do not match.");
      setModalVisible(true);
      return;
    }

    const payload = {
      old_password: oldPassword,
      new_password: newPassword,
    };

    try {
      const response = await insertResetPassword(payload);
      const parsedResponse = JSON.parse(response);

      if (parsedResponse.status === "success") {
        setModalTitle("Success");
        setModalMessage("Your password has been reset successfully.");
      } else if (parsedResponse.status === "error") {
        setModalTitle("Error");
        setModalMessage(parsedResponse.message || "Something went wrong.");
      }

      setModalVisible(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      setModalTitle("Error");
      setModalMessage(
        "An error occurred while resetting your password. Please try again."
      );
      setModalVisible(true);
    }
  };

  const getConditionClass = (condition: boolean) => {
    return condition ? "text-green-600 font-bold" : "text-red-600 font-bold";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6">
        <h2 className="text-xl font-bold mb-3 text-gray-800 text-center">
          Reset your password
        </h2>
        <p className="text-sm text-gray-600 mb-5">
          Enter a new password to reset the password on your account. We'll ask
          for this password whenever you log in.
        </p>

        {/* Old Password Input */}
        <label className="block text-sm font-semibold text-blue-900 mb-1">
          <span className="text-red-500">* </span>
          Old Password
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter old password"
          className="w-full border-0 border-b-2 border-blue-900 rounded-t bg-white text-black p-3 text-base outline-none focus:border-blue-700 mb-4"
        />

        {/* New Password Input */}
        <label className="block text-sm font-semibold text-blue-900 mb-1">
          <span className="text-red-500">* </span>
          New Password
        </label>
        <div
          className={`${
            passwordValidationFailed ? "animate-pulse" : ""
          } transition-all duration-150`}
        >
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordValidationFailed(false);
            }}
            placeholder="Enter new password"
            className={`w-full border-0 border-b-2 ${
              passwordValidationFailed ? "border-red-500" : "border-blue-900"
            } rounded-t bg-white text-black p-3 text-base outline-none focus:border-blue-700 mb-4`}
          />
        </div>

        {/* Password Requirements */}
        <div className="mb-5">
          <div className="text-xs mb-1">
            <span className={getConditionClass(newPassword.length >= 8)}>
              {newPassword.length >= 8 ? "✓" : "✗"}
            </span>{" "}
            Must be at least 8 characters long
          </div>
          <div className="text-xs mb-1">
            <span
              className={getConditionClass(
                /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
              )}
            >
              {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                ? "✓"
                : "✗"}
            </span>{" "}
            Must contain an uppercase and a lowercase letter (A, z)
          </div>
          <div className="text-xs mb-1">
            <span className={getConditionClass(/\d/.test(newPassword))}>
              {/\d/.test(newPassword) ? "✓" : "✗"}
            </span>{" "}
            Must contain a number
          </div>
          <div className="text-xs mb-1">
            <span
              className={getConditionClass(
                /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
              )}
            >
              {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "✓" : "✗"}
            </span>{" "}
            Must contain a special character (!, %, @, #, etc.)
          </div>
        </div>

        {/* Confirm Password Input */}
        <label className="block text-sm font-semibold text-blue-900 mb-1">
          <span className="text-red-500">* </span>
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full border-0 border-b-2 border-blue-900 rounded-t bg-white text-black p-3 text-base outline-none focus:border-blue-700 mb-4"
        />

        {/* Submit Button */}
        <button
          onClick={handleResetPassword}
          className="w-full bg-blue-900 text-white py-3 px-4 rounded mt-4 text-base hover:bg-blue-800 transition-colors duration-200"
        >
          Reset password
        </button>
      </div>

      {/* Modal for Success/Error Messages */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-full max-w-sm bg-white rounded-lg p-5 text-center shadow-lg">
            {modalTitle && (
              <h3 className="text-lg font-bold mb-3 text-gray-800">
                {modalTitle}
              </h3>
            )}
            <p className="text-base text-black mb-5">{modalMessage}</p>
            <button
              onClick={() => setModalVisible(false)}
              className="bg-blue-900 text-white py-2 px-5 rounded text-base hover:bg-blue-800 transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
