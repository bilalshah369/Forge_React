/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";

export const ExportExcel = (data: any[], filename = "TimesheetData.xlsx") => {
  ////debugger;
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Generate Excel file as a binary string
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Create Blob for download
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "TimesheetData.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  console.log("Excel file downloaded");
  console.log("from function", Data);
};


