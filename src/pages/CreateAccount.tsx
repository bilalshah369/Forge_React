/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import warehouseImage from "@/assets/warehouse-inventory.jpg";
import ForgeLogoVertical from "@/assets/img/ForgeLogoVertical.png";
import { AddCustomerUser } from "@/utils/PM";
import { PostAsync } from "@/services/rest_api_service";
import AlertBox from "@/components/ui/AlertBox";
const BASE_URL = import.meta.env.VITE_BASE_URL;
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
  is_approved?: boolean;
}

interface CustomerProps {
  onClose?: () => void;
}
const CreateAccount = () => {
  // const [customer, setCustomer] = useState<Customer>(new Customer());
  // // const [formData, setFormData] = useState({
  // //   firstName: "",
  // //   lastName: "",
  // //   email: "",
  // //   password: "",
  // //   confirmPassword: "",
  // // });

  // interface CustomerProps {
  //   onClose?: () => void;
  // }

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Creating account with:", formData);
  // };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [customer, setCustomer] = useState<Customer>(new Customer());
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [otpAlertVisible, setOtpAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
    //isRegistered && onClose && onClose();
  };
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const showOTPAlert = (message: string) => {
    setAlertMessage(message);
    setOtpAlertVisible(true);
  };

  const closeOTPAlert = () => {
    setOtpAlertVisible(false);
    setAlertMessage("");
    verifyEmail && setIsOtpSent(false);
  };

  const handleInputChange = (field: keyof Customer, value: string | number) => {
    let errors = { ...validationErrors };

    if (field === "contact_phone") {
      // Allow only numbers and limit to 15 digits
      const sanitizedValue = String(value).replace(/\D/g, "").slice(0, 15);
      setCustomer((prev) => ({ ...prev, [field]: sanitizedValue }));
    } else if (field === "tech_admin_email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      setCustomer((prev) => ({ ...prev, [field]: value.toString() }));

      if (typeof value === "string" && !emailRegex.test(value)) {
        errors[field] = "Invalid email format";
      } else {
        delete errors[field];
      }
    } else {
      setCustomer((prev) => ({ ...prev, [field]: value }));

      if (typeof value === "string" && value.trim() === "") {
        errors[field] = `${field.replace("_", " ")} is required`;
      } else {
        delete errors[field];
      }
    }

    setValidationErrors({ ...errors });
  };

  const generateOtp = async (email: string) => {
    const uri = `${BASE_URL}/auth/otp_generate`;
    const payload = JSON.stringify({
      email: email,
      verify_email: true,
    });

    try {
      const jsonResult = await PostAsync(uri, payload);
      console.log("Send OTP Response:", JSON.stringify(jsonResult, null, 2));
      if (jsonResult.status === "success") {
        setIsOtpSent(true);
      } else {
        showAlert(jsonResult.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showAlert("An error occurred while sending OTP.");
    }
  };

  const verifyEmailOtp = async (otp: string) => {
    const uri = `${BASE_URL}/auth/verify_email_otp`;
    const payload = JSON.stringify({
      email: customer.tech_admin_email,
      otp: otp,
    });

    try {
      const jsonResult = await PostAsync(uri, payload);
      console.log("Verify OTP Response:", JSON.stringify(jsonResult, null, 2));
      if (jsonResult.status === "success") {
        setEmailOtp("");
        setVerifyEmail(true);
        showOTPAlert("OTP verified successfully.");
      } else {
        setEmailOtp("");
        showOTPAlert(jsonResult.message || "Failed to verify OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showOTPAlert("An error occurred while verifying OTP.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating account with:", customer);
    if (!validateForm()) {
      return;
    }

    if (!verifyEmail) {
      showAlert("Please verify your email first.");
      return;
    }

    try {
      customer.is_approved = false;
      const response = await AddCustomerUser(customer);
      const result = JSON.parse(response);
      if (result.status === "success") {
        showAlert(
          "Customer registered successfully. Please wait for approval."
        );
        setIsRegistered(true);
      } else {
        showAlert(result.message);
      }
    } catch (error) {
      console.error("Error submitting RAID:", error);
    }
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!customer?.company_name?.trim()) {
      errors.company_name = "Company name is required";
    }
    if (
      !customer?.tech_admin_email ||
      !emailRegex.test(customer.tech_admin_email)
    ) {
      errors.tech_admin_email = "Valid admin Email is required";
    }
    if (!customer?.contact_first_name?.trim()) {
      errors.contact_first_name = "First Name is required";
    }
    if (!customer?.contact_last_name?.trim()) {
      errors.contact_last_name = "Last Name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const isFocused = useIsFocused();

  // useEffect(() => {
  //   if (isFocused) {
  //     (async function () {
  //       setCustomerId(0);
  //       setCustomer(new Customer());
  //       handleInputChange("role_id", 3);
  //       setLoading(false);
  //     })();
  //     return () => {};
  //   }
  // }, [isFocused]);
  const location = useLocation();

  useEffect(() => {
    // Run your logic when the route/path changes
    (async function () {
      setCustomerId(0);
      setCustomer(new Customer());
      handleInputChange("role_id", 3);
      setLoading(false);
    })();

    return () => {
      // Cleanup (optional)
    };
  }, [location.pathname]); // Dependency on route path

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <img
            src={warehouseImage}
            alt="Warehouse automation"
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          />
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <img
                src={ForgeLogoVertical}
                alt="Forge Logo"
                className="h-24 mx-auto mb-6 object-contain"
              />

              <CardDescription className="text-gray-600">
                <h2 className="text-2xl font-semibold text-center mb-4 text-blue-800">
                  Portfolio Xpert Login
                </h2>
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Name
                    </label>
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      required
                      value={customer.company_name}
                      // onChange={handleInputChange}
                      onChange={(value) =>
                        handleInputChange("company_name", value.target.value)
                      }
                      className="w-full"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact_email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Email
                    </label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      required
                      value={customer.contact_email}
                      onChange={(value) =>
                        handleInputChange("contact_email", value.target.value)
                      }
                      className="w-full"
                      placeholder="Company Email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact_phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Contact Number
                  </label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="mobile"
                    required
                    value={customer.contact_phone}
                    onChange={(value) =>
                      handleInputChange("contact_phone", value.target.value)
                    }
                    className="w-full"
                    placeholder="Contact Number"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="tech_admin_email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Admin Email
                    </label>
                    <a
                      href="#"
                      onClick={() => {
                        generateOtp(customer.tech_admin_email ?? "");
                      }}
                      className="px-3 py-2 text-xs font-medium text-blue-800  rounded-lg hover:text-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                    >
                      <svg
                        className="w-3 h-3 text-white me-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 16"
                      >
                        <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                        <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                      </svg>
                      Verify Email
                    </a>
                  </div>

                  <Input
                    id="tech_admin_email"
                    name="tech_admin_email"
                    type="email"
                    required
                    value={customer.tech_admin_email}
                    onChange={(value) =>
                      handleInputChange("tech_admin_email", value.target.value)
                    }
                    className="w-full"
                    placeholder="Admin Email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact_first_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Admin First Name
                    </label>
                    <Input
                      id="contact_first_name"
                      name="contact_first_name"
                      type="text"
                      required
                      value={customer.contact_first_name}
                      // onChange={handleInputChange}
                      onChange={(value) =>
                        handleInputChange(
                          "contact_first_name",
                          value.target.value
                        )
                      }
                      className="w-full"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact_email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Admin Last Name
                    </label>
                    <Input
                      id="contact_last_name"
                      name="contact_last_name"
                      type="text"
                      required
                      value={customer.contact_last_name}
                      onChange={(value) =>
                        handleInputChange(
                          "contact_last_name",
                          value.target.value
                        )
                      }
                      className="w-full"
                      placeholder="Admin Last Name"
                    />
                  </div>
                </div>

                {/* <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="••••••••"
                  />
                </div> */}

                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* <footer className="mt-8 text-center text-sm text-gray-500">
            <p>
              © 2024 Automation Platform. All rights reserved.{" "}
              <a
                href="https://developer.automationanywhere.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Developer Portal
              </a>
            </p>
          </footer> */}
        </div>
      </div>
      <AlertBox
        visible={alertVisible}
        message={alertMessage}
        onCloseAlert={closeAlert}
      />
      {isOtpSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-center mb-4">
              Verify your email
            </h2>
            <input
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              className="w-28 mx-auto mb-5 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              disabled={!emailOtp}
              onClick={async () => await verifyEmailOtp(emailOtp)}
              className={`w-full h-10 rounded-full text-white text-center transition ${
                emailOtp
                  ? "bg-blue-800 hover:bg-blue-900"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Verify
            </button>

            {/* Optional AlertBox */}
            {otpAlertVisible && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
                <span className="block sm:inline">{alertMessage}</span>
                <button
                  onClick={closeOTPAlert}
                  className="absolute top-1 right-2 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccount;
