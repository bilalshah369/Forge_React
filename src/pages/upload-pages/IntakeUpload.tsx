import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import MappingForm from "./MappingForm";
import ReviewStep from "./ReviewStep";
import { IntakeData, MasterData, ReadableField } from "./IntakeData";
import { GetMasterData } from "../../utils/PM";
import { InsertBulkIntake } from "../../utils/Intake";
import AlertBox from "../../components/ui/AlertBox";
import { Download_svg } from "../../assets/Icons";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const IntakeUpload: React.FC = () => {
  const [excelData, setExcelData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [mappedData, setMappedData] = useState<IntakeData[]>([]);
  const [mapping, setMapping] = useState<
    Partial<Record<ReadableField, string>>
  >({});
  const [filteredExcelData, setFilteredExcelData] = useState<string[][]>([]); // New state for filtered data
  const [fileName, setFileName] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [masterData, setMasterData] = useState<MasterData>({
    users: [],
    projectSizes: [],
    priorities: [],
    departments: [],
    goals: [],
    programs: [],
    imapctedApplications: [],
    classifications: [],
    budgetSizes: [],
  });
  const [step, setStep] = useState<number>(1);

  const processFile = (file: File) => {
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      setHeaders(jsonData[0]);
      setExcelData(jsonData.slice(1));
      setFileUploaded(true);
      setStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUploadWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileUploadMobile = async () => {
    alert("Mobile file picking not implemented yet.");
    return null;
  };

  const pickFileMobile = async (): Promise<File | null> => {
    alert("Mobile file picking not implemented yet.");
    return null;
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await GetMasterData();
        const result = JSON.parse(response);
        const {
          users,
          project_size: projectSizes,
          priority: priorities,
          departments,
          goals,
          programs,
          impacted_applications: imapctedApplications,
          classifications,
          budget_size: budgetSizes,
        } = result.data;
        setMasterData({
          users,
          projectSizes,
          priorities,
          departments,
          goals,
          programs,
          imapctedApplications,
          classifications,
          budgetSizes,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert("Failed to fetch master data.");
      }
    };

    fetchMasters();
  }, []);

  const handleMappingComplete = (
    data: IntakeData[],
    newMapping: Partial<Record<ReadableField, string>>,
    filteredExcelData: string[][],
    masterData: MasterData
  ) => {
    setMappedData(data);
    setMapping(newMapping);
    setFilteredExcelData(filteredExcelData);
    setStep(3);
  };

  const handleSubmit = async (mappedData: IntakeData[]) => {
    try {
      const response = await InsertBulkIntake(mappedData);
      const parsedResponse = JSON.parse(response);
      if (parsedResponse.status === "success") {
        showAlert(
          "Data imported successfully. Please find the projects in Intake/Backlog"
        );
        resetState();
      } else {
        showAlert("Error creating intake: " + parsedResponse.message);
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("An error occurred while submitting.");
    }
  };

  const resetState = () => {
    setStep(1);
    setHeaders([]);
    setExcelData([]);
    setMappedData([]);
    setMapping({});
    setFilteredExcelData([]);
    setFileName("");
    setFileUploaded(false);
  };

  const handleCancel = () => {
    resetState();
  };

  const handleBackToMapping = () => {
    setStep(2);
  };

  const handleNextFromUpload = () => {
    if (fileName && excelData.length > 0) {
      setStep(2);
    } else {
      showAlert("Please upload a valid Excel file.");
    }
  };

  const downloadFile = async () => {
    const url = `${BASE_URL}/images/Intake_Upload.xlsx`;
    const fileName = "Intake_Upload.xlsx";

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      showAlert("Failed to download the file.");
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-4">
      <button
        className={`flex-1 py-2 px-3 text-sm font-medium rounded border ${
          step === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => setStep(1)}
        disabled={step === 1}
      >
        1. File Upload
      </button>
      <button
        className={`flex-1 py-2 px-3 text-sm font-medium rounded border mx-1 ${
          step === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => headers.length > 0 && setStep(2)}
        disabled={step === 1 || step === 2}
      >
        2. Field Mapping
      </button>
      <button
        className={`flex-1 py-2 px-3 text-sm font-medium rounded border ${
          step === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => mappedData.length > 0 && setStep(3)}
        disabled={step < 3}
      >
        3. Review & Submit
      </button>
    </div>
  );

  return (
    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
      {renderStepIndicator()}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Upload Excel File
          </h1>
          <p className="text-base text-gray-600 text-center mb-5 px-5">
            Please upload an Excel file (.xlsx or .xls) to begin field mapping.
          </p>
          <div className="relative">
            <button className="bg-blue-600 text-white py-3 px-6 rounded font-bold hover:bg-blue-700 transition-colors">
              Choose File
            </button>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUploadWeb}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <p className="mt-3 text-base text-gray-800">
            {fileName ? `Selected file: ${fileName}` : "No file selected"}
          </p>
          <button
            className="flex items-center gap-2 mt-5 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            onClick={downloadFile}
          >
            <Download_svg height={20} width={20} />
            <span className="text-sm font-medium text-black">
              Download Template
            </span>
          </button>
          {fileName && (
            <div className="flex justify-end mt-4 w-full">
              <button
                className="bg-blue-800 text-white py-3 px-6 rounded font-bold max-w-[100px] hover:bg-blue-900 transition-colors"
                onClick={handleNextFromUpload}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      {step === 2 && (
        <MappingForm
          headers={headers}
          excelData={excelData}
          masterData={masterData}
          initialMapping={mapping}
          onComplete={handleMappingComplete}
          onCancel={handleCancel}
        />
      )}
      {step === 3 && (
        <ReviewStep
          mappedData={mappedData}
          excelData={filteredExcelData}
          headers={headers}
          mapping={mapping}
          masterData={masterData}
          onSubmit={handleSubmit}
          onBack={handleBackToMapping}
        />
      )}
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </div>
  );
};

export default IntakeUpload;
