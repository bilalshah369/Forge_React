import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { StatusMultiSelect } from "./StatusMultiSelect";
import { navigationRef } from "@/utils/navigationService";
import { useTheme } from "@/themes/ThemeProvider";

type Tab = {
  label: string;
  to: string;
  active?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  onClick?: (worker: string) => void;
};

export default function CustomTabs({ tabs, onClick }: TabsProps) {
  const navigation = useNavigate();
  const {theme} =useTheme();
  return (
    <div className="border-b">
      <div className="flex space-x-8 px-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.to}
            //to={undefined}
            onClick={() => {
              //////debugger;
              localStorage.setItem("UserState",'AdminDboard');
              if (onClick) {
                onClick(tab.to);
              } else {
                navigation(tab.to);
              }
            }}
            //end
            // className={({ isActive }) =>
            //   `py-2 border-b-2 transition-colors duration-300 ${
            //     isActive
            //       ? "border-blue-800 text-black font-semibold"
            //       : "border-transparent text-gray-500 hover:text-black"
            //   }`
            // }
            className={`py-2 border-b-2 transition-colors duration-300 ${
              tab.active
                ? "border-blue-800 text-black font-semibold"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            style={{ borderColor:  tab.active ?theme.colors.drawerBackgroundColor:'transparent' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
