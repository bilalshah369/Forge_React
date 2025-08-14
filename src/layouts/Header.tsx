/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-binary-expression */
import { Bell, Key, LogOut, Menu, Settings, User } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Account_cog_svg } from "@/assets/Icons";
import { PostAsync } from "@/services/rest_api_service";
import { decodeBase64, encodeBase64 } from "@/utils/securedata";
import { navigationRef } from "@/utils/navigationService";
import NotificationBar from "@/components/ui/notificationBar";
import { useTitle } from "./PageTitleContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Header() {
  const pageTitle = useTitle();
  //debugger;
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [user_name_user, setUser_name_user] = useState<string>("");
  const [company_name_user, setCompany_name_user] = useState<string>("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const handleProcessLogin = async (email: any) => {
    const uri = `${BASE_URL}/auth/login_oauth`;
    const payload = JSON.stringify({
      email: email,
    });

    try {
      const jsonResult = await PostAsync(uri, payload);

      if (jsonResult.status === "success") {
        const { accessToken, user } = jsonResult.data;
        const {
          userId,
          userrole,
          customer_id,
          company_name,
          firstName,
          lastName,
          source,
        } = user;

        localStorage.setItem(
          "UserEmail",
          encodeBase64(email?.toLowerCase() || "")
        );
        localStorage.setItem("ID", encodeBase64(userId?.toString() || ""));
        localStorage.setItem("Token", "Bearer " + accessToken);
        localStorage.setItem(
          "Customer_ID",
          encodeBase64(customer_id?.toString() || "")
        );
        localStorage.setItem("company_name", company_name?.toString() || "");
        localStorage.setItem("firstName", firstName?.toString() || "");
        localStorage.setItem("lastName", lastName?.toString() || "");
        localStorage.setItem("source", source?.toString() || "");

        localStorage.setItem("UserType", encodeBase64(userrole.toString()));

        const UserType = decodeBase64(localStorage.getItem("UserType") ?? "");

        //console.log('Decoded UserType:', UserType);
        ////////////debugger;
        if (UserType === "3" || userrole === 3) {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          /* navigation.replace('Main'); */
          // localStorage.setItem('isAdmin', 'yes');
          // resetNavigationWIthoutParam('Main');
          //navigate('Main', {screen: 'AdminDboard'});
        } else if (UserType === "1" || userrole === 1) {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          localStorage.setItem("UserState", "CustomerList");
          localStorage.setItem("isAdmin", "yes");
          navigationRef("AdminDboard");
        } else if (UserType === "103" || userrole === 103) {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          //navigate('Main', {screen: 'IntakeList'});
        } else {
          //console.log('Decoded UserType:', UserType);
          //console.log('Navigating to Main screen');
          //navigate('Main', {screen: 'AdminDboard'});
        }
      } else {
        //Alert.alert('Incorrect, User Name/ Password');
      }
    } catch (error) {
      console.error("Error logging in:", error);
      //Alert.alert('An error occurred. Please try again later.');
    }
  };

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem("profileImage");
      const first = localStorage.getItem("firstName");
      const last = localStorage.getItem("lastName");
      const storedCompany = localStorage.getItem("company_name");
      setCompany_name_user(storedCompany ?? "");
      if (storedImage) {
        setUserImage(storedImage); // Ensure image is only updated when needed
      }

      setUser_name_user(`${first ?? ""} ${last ?? ""}`);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <button
        className="lg:hidden flex items-center justify-center  rounded hover:bg-gray-100"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="text-primary font-bold text-xl">FORGE</span>
        </div>
      </div>

      {/* <div className="flex-1 text-center">
        <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
      </div> */}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          {pageTitle.title || "Admin Paneldd"}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {true && (
          <div
            onClick={() => {
              //setTheme("blue");
              handleProcessLogin("forgeadmin@forgeportfolioxpert.com");
            }}
            className="cursor-pointer"
          >
            <Account_cog_svg
              name="account-cog"
              width={20}
              height={20}
              color={"red"}
            />
          </div>
        )}

        <span className="text-md font-medium text-foreground">
          {company_name_user}
        </span>
        <NotificationBar />

        {/* <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-4 bg-popover border border-border shadow-lg"
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Avatar */}
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>

              {/* Greeting */}
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Hello, {user_name_user}
                </p>
              </div>

              {/* Status Dots */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <DropdownMenuSeparator className="my-4" />

            {/* Menu Items */}
            <div className="space-y-1">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span className="text-sm">View/Edit Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <Key className="h-4 w-4" />
                <span className="text-sm">Reset Password</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                onClick={() => {
                  navigate("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
// import { Menu, Bell, User } from "lucide-react";
// import { useSidebar } from "@/components/ui/sidebar";

// export default function Header() {
//   const { toggleSidebar } = useSidebar();

//   return (
//     <header className="w-full h-16 border-b border-border bg-card flex items-center justify-between px-6">
//       <div className="flex items-center gap-4">
//         <button
//           onClick={toggleSidebar}
//           className="lg:hidden p-2 rounded-md hover:bg-muted"
//         >
//           <Menu className="h-5 w-5" />
//         </button>
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
//             <span className="text-primary-foreground font-bold text-sm">F</span>
//           </div>
//           <span className="text-primary font-bold text-xl">FORGE</span>
//         </div>
//       </div>

//       <div className="flex-1 text-center">
//         <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
//       </div>

//       <div className="flex items-center gap-4">
//         <span className="text-sm font-medium text-foreground">Logicsoft</span>
//         <div className="relative">
//           <Bell className="h-5 w-5 text-muted-foreground" />
//           <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
//             1
//           </span>
//         </div>
//         <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
//           <User className="h-4 w-4 text-muted-foreground" />
//         </div>
//       </div>
//     </header>
//   );
// }
