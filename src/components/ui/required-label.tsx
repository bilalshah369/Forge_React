import React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const RequiredLabel: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={"flex items-center"}>
      <Label className={cn(className)}>{children}</Label>
      <span className="text-red-500 ml-1">*</span>
    </div>
  );
};

export default RequiredLabel;
