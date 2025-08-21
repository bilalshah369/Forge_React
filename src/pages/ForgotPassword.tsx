import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import warehouseImage from "@/assets/warehouse-inventory.jpg";
import ForgeLogoVertical from "@/assets/img/ForgeLogoVertical.png";
import { forgotPassword } from "@/utils/password";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const [forgotScreenEmail, setForgotScreenEmail] = useState<string>("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
  };
  const [errorMessage, setErrorMessage] = useState("");
  const handleResetPassword = async (e: React.FormEvent) => {
    try {
      ////debugger;
      const response = await forgotPassword({ email: email });

      const parsedResponse = JSON.parse(response);
      setErrorMessage(
        parsedResponse.status === "success"
          ? parsedResponse.message
          : parsedResponse.message || "Something went wrong."
      );
    } catch (error) {
      ////debugger;
      console.error("Error resetting password:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };
  if (isSubmitted) {
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
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-gray-600">
                  We've sent password reset instructions to your email
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    If an account with email <strong>{email}</strong> exists,
                    you will receive password reset instructions shortly.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or try
                    again.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Try Different Email
                  </Button>
                </div>

                <div className="pt-4">
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
              <CardTitle className="text-2xl font-bold text-gray-900">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email to receive password reset instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="Enter your email address"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Reset Instructions
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
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
    </div>
  );
};

export default ForgotPassword;
