import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import warehouseImage from "@/assets/warehouse-inventory.jpg";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password });
    navigate("/AdminDboard");
    //alert("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center gap-8">
        {/* Left side - Warehouse image */}
        <div className="hidden lg:block flex-1 max-w-lg">
          <img
            src={warehouseImage}
            alt="Warehouse inventory management dashboard"
            className="w-full h-auto object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 max-w-md w-full">
          <Card className="bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome Back!
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      // type="email"
                      placeholder="Enter Email Address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-lg px-4 text-base placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />

                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-lg px-4 text-base placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-base transition-colors"
                  >
                    Login
                  </Button>
                </form>

                <div className="flex justify-between items-center text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                  <Link
                    to="/create-account"
                    className="text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create an Account!
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-white/80">
          ©2024 Automation Anywhere, Inc. For more RPA Challenge pages, head to
          the{" "}
          <a
            href="#"
            className="text-white hover:text-white/90 underline transition-colors"
          >
            Automation Anywhere Developer Portal
          </a>
        </p>
      </div> */}
    </div>
  );
};

export default LoginPage;
