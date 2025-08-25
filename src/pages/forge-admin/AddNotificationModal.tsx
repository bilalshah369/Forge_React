import { AddNotification } from "@/utils/Notification";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface AddNotificationModalProps {
  visible: boolean;
  onClose: (str:string) => void;
  onSave: (notification: NotificationData, mode: "add" | "edit") => void;
  mode?: "add" | "edit";
  notificationToEdit?: NotificationData;
}

interface NotificationData {
  notification_id: string;
  notification_type: string;
  notification_title: string;
  notification_desc: string;
  recipients: string;
  module?: string;
  notification_action?: string;
  start_date?: string;
  end_date?: string;
  url: string;
}

const AddNotificationModal: React.FC<AddNotificationModalProps> = ({
  visible,
  onClose,
  onSave,
  mode = "add",
  notificationToEdit,
}) => {
  const [formData, setFormData] = useState<NotificationData>({
    notification_id: "",
    notification_type: "",
    notification_title: "",
    notification_desc: "",
    recipients: "",
    module: "",
    notification_action: "",
    start_date: "",
    end_date: "",
    url: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (notificationToEdit) {
      debugger;
      setFormData(notificationToEdit);
    }
    else
    {
      setFormData({
    notification_id: "",
    notification_type: "",
    notification_title: "",
    notification_desc: "",
    recipients: "",
    module: "",
    notification_action: "",
    start_date: "",
    end_date: "",
    url: "",
  });
    }
    // else
    // {
    //   debugger;
    //   setFormData(formData);
    // }
  }, [visible,notificationToEdit]);

  const isBroadcast = ["subscription", "offers", "general"].includes(
    formData.notification_type
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors: Record<string, string> = {};

    if (!formData.notification_type)
      newErrors.notification_type = "Notification type is required";

    if (!formData.notification_title)
      newErrors.notification_title = "Notification title is required";

    if (!formData.notification_desc)
      newErrors.notification_desc = "Description is required";

    if (isBroadcast && !formData.recipients)
      newErrors.recipients = "Recipients are required";

    if (isBroadcast && !formData.start_date)
      newErrors.start_date = "Start date is required";

    if (isBroadcast && !formData.end_date)
      newErrors.end_date = "End date is required";

    if (!formData.url) newErrors.url = "Notification link is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSave = async (
    values: NotificationData,
    
  ) => {
    debugger;
    setSubmitting(true);
    try {
      //   await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API
      //   onSave(values, mode); // Pass mode to differentiate add vs edit
      //   onClose();
      const response = await AddNotification(values);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === 'success') {
        //console.log('AD Added succesfully');
        //setResultDialog(true);
        //showAlert('Details updated successfully');
        onClose(parsedRes.message);
      }
    } catch (error) {
      console.error(
        `Failed to ${mode === 'add' ? 'save' : 'update'} notification:`,
        error,
      );
      alert(`Error ${mode === 'add' ? 'saving' : 'updating'} notification`);
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmit = async () => {
    if (!validate()) return;
  handleSave(formData);
    //setSubmitting(true);
    // try {
    //   onSave(formData, mode);
    //   onClose("");
    // } catch (err) {
    //   console.error(err);
    //   alert("Failed to save notification");
    // } finally {
    //   setSubmitting(false);
    // }
  };

  if (!visible) return null;

  return (
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-md shadow-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-center flex-1">
            {mode === "add" ? "Add Notification" : "Edit Notification"}
          </h2>
          <button
            onClick={()=>{onClose("")}}
            className="top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        

        {/* Notification Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-red-500">*</span> Notification Type
          </label>
          <select
            name="notification_type"
            value={formData.notification_type}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select Type</option>
            <option value="subscription">Subscription Related</option>
            <option value="offers">Offers</option>
            <option value="project">Project Workflow</option>
            {/* <option value="general">General</option> */}
          </select>
          {errors.notification_type && (
            <p className="text-red-500 text-sm">{errors.notification_type}</p>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-red-500">*</span> Notification Title
          </label>
          <input
            type="text"
            name="notification_title"
            value={formData.notification_title}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Enter notification title"
          />
          {errors.notification_title && (
            <p className="text-red-500 text-sm">{errors.notification_title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-red-500">*</span> Description
          </label>
          <textarea
            name="notification_desc"
            value={formData.notification_desc}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Enter description"
          />
          {errors.notification_desc && (
            <p className="text-red-500 text-sm">{errors.notification_desc}</p>
          )}
        </div>

        {/* Recipients */}
        {isBroadcast && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-500">*</span> Recipients
            </label>
            <select
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Recipient Type</option>
              <option value="admin">Only Admins</option>
              <option value="all">All Users</option>
            </select>
            {errors.recipients && (
              <p className="text-red-500 text-sm">{errors.recipients}</p>
            )}
          </div>
        )}

        {/* Start Date */}
        {isBroadcast && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-500">*</span> Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm">{errors.start_date}</p>
            )}
          </div>
        )}

        {/* End Date */}
        {isBroadcast && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              <span className="text-red-500">*</span> End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm">{errors.end_date}</p>
            )}
          </div>
        )}

        {/* URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            <span className="text-red-500">*</span> Notification Link
          </label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Enter link"
          />
          {errors.url && (
            <p className="text-red-500 text-sm">{errors.url}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
             onClick={()=>{onClose("")}}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : mode === "add" ? "Save" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotificationModal;
