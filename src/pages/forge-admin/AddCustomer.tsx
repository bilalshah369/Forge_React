import AlertBox from "@/components/ui/AlertBox";
import { GetCustomers } from "@/utils/Customer";
import { AddCustomerUser } from "@/utils/PM";
import React, { useState, useEffect } from "react";

export class Customer {
  customer_id?: number;
  username?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  tech_admin_email?: string;
  company_name?: string;
  contact_email?: string;
  contact_phone?: string;
  password?: string;
  role_id?: number;
}

interface CustomerProps {
  custID: number;
  visible: boolean;
  onClose: (str:string) => void;
}

const AddCustomer: React.FC<CustomerProps> = ({ custID, visible, onClose }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(visible);
  const [customer, setCustomer] = useState<Customer>({});
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});


    const [alertVisible, setAlertVisible] = useState<boolean>(false);
 
  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage('');
  };
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
const FetchCustomer = async (cust_id: number) => {
    try {
      setLoading(true);
      const response = await GetCustomers({
        PageNo: 1,
        PageSize: 10,
        customerID: cust_id,
      });
      //console.log('Raw Response:', response);
      const result = JSON.parse(response);

    const customer = result.data?.customers?.find(
  (c: any) => c.customer_id === cust_id
);

setCustomer(customer);
    } catch (error) {
      console.error('Error fetching priorities:', error);
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
    // Whenever modal is opened or custID changes, fetch or reset customer
    if (visible) {
     setIsModalVisible(true);
      setLoading(true);
      if (custID !== 0) {
        // Edit mode: fetch customer
        (async () => {
          await FetchCustomer(custID);
          handleInputChange('customer_id', custID?.toString());
          handleInputChange('role_id', '3');
          setLoading(false);
        })();
      } else {
        // Add mode: reset customer
        setCustomer(new Customer());
        handleInputChange('role_id', '3');
        setLoading(false);
      }
    } else {
     setIsModalVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custID, visible]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    let errors = { ...validationErrors };

    if (field === "contact_phone") {
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 15);
      setCustomer((prev) => ({ ...prev, [field]: sanitizedValue }));
      if (!sanitizedValue) {
        errors.contact_phone = "Phone number is required";
      } else {
        delete errors.contact_phone;
      }
    } else if (field === "contact_email" || field === "tech_admin_email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setCustomer((prev) => ({ ...prev, [field]: value }));
      if (!emailRegex.test(value)) {
        errors[field] = "Invalid email format";
      } else {
        delete errors[field];
      }
    } else {
      setCustomer((prev) => ({ ...prev, [field]: value }));
      if (!value.trim()) {
        errors[field] = `${field.replace("_", " ")} is required`;
      } else {
        delete errors[field];
      }
    }

    setValidationErrors(errors);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!customer.company_name?.trim()) {
      errors.company_name = "Company Name is required";
    }
    if (!customer.contact_email || !emailRegex.test(customer.contact_email)) {
      errors.contact_email = "Valid Company Email is required";
    }
    if (!customer.contact_phone) {
      errors.contact_phone = "Phone number is required";
    }
    if (!customer.tech_admin_email || !emailRegex.test(customer.tech_admin_email)) {
      errors.tech_admin_email = "Valid Admin Email is required";
    }
    if (!customer.contact_first_name?.trim()) {
      errors.contact_first_name = "First Name is required";
    }
    if (!customer.contact_last_name?.trim()) {
      errors.contact_last_name = "Last Name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async() => {
    if (!validateForm()) return;
    try {
      //////////debugger;
      console.log(customer);
      const response = await AddCustomerUser(customer);
      const result = JSON.parse(response??"");
      showAlert(result.message);
      if (result.status === 'error') {
        showAlert(result.message);
         onClose(result.message);
        return;
      }
      onClose(result.message);
    } catch (error) {
      console.error('Error submitting RAID:', error);
      //alert('Error', 'Failed to submit RAID. Please try again.');
    }
    setAlertMessage("Customer saved successfully!");
    // setTimeout(() => {
    //   setAlertMessage("");
    //   onClose();
    // }, 1500);
  };

  if (!isModalVisible) return null;
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">Customer Registration</h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Company Name *</label>
              <input
                type="text"
                value={customer.company_name || ""}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {validationErrors.company_name && (
                <p className="text-red-500 text-sm">{validationErrors.company_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Company Email *</label>
              <input
                type="email"
                value={customer.contact_email || ""}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {validationErrors.contact_email && (
                <p className="text-red-500 text-sm">{validationErrors.contact_email}</p>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Company Contact Number *</label>
              <input
                type="text"
                value={customer.contact_phone || ""}
                onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {validationErrors.contact_phone && (
                <p className="text-red-500 text-sm">{validationErrors.contact_phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Admin Email *</label>
              <input
                type="email"
                value={customer.tech_admin_email || ""}
                onChange={(e) => handleInputChange("tech_admin_email", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {validationErrors.tech_admin_email && (
                <p className="text-red-500 text-sm">{validationErrors.tech_admin_email}</p>
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Admin First Name *</label>
              <input
                type="text"
                value={customer.contact_first_name || ""}
                onChange={(e) => handleInputChange("contact_first_name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {validationErrors.contact_first_name && (
                <p className="text-red-500 text-sm">{validationErrors.contact_first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Admin Last Name *</label>
              <input
                type="text"
                value={customer.contact_last_name || ""}
                onChange={(e) => handleInputChange("contact_last_name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {validationErrors.contact_last_name && (
                <p className="text-red-500 text-sm">{validationErrors.contact_last_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <div className="mt-4 text-green-600 text-center">{alertMessage}</div>
        )}
      </div>
     
    </div>
  );
};

export default AddCustomer;
