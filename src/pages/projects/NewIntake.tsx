/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  GetApprovers,
  GetClosedProjects,
  GetClosedProjectsWithFilters,
  GetMasterData,
  GetMasterDataPM,
} from "@/utils/PM";
import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useNavigation,
  useRoutes,
  useSearchParams,
} from "react-router-dom";
import { GetGoals } from "@/utils/Goals";
import { GetProgramsByGoalId } from "@/utils/ManageProgram";
import { GetClasssifcation } from "@/utils/Masters";
import {
  GetBudgetDetails,
  GetDependentProjects,
  GetProjects,
  InsertApproval,
  InsertBudgetDetails,
  InsertDraft,
  InsertReview,
  InsertROIDetails,
} from "@/utils/Intake";
import { fetchImageWithAuth, SubmitDetails } from "@/services/rest_api_service";
import { MultiSelectDepartment } from "@/components/ui/MultiSelectDepartment";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { DatePicker } from "rsuite";
import { convertUTCtoLocalDateOnly } from "@/utils/util";
import {
  Delete_svg,
  Download_svg,
  Eye_svg,
  ReviewSVG,
  Save_svg,
  Send_approve_svg,
  Send_review_svg,
} from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import BudgetCalculationForm from "../budget/BudgetCalculationForm";
import ModalExample from "@/test/ModalExample";
import ROICalculationForm from "../budget/ROICalculationForm";
import { GoalsModal } from "../goals/GoalsModal";
import { ClassificationModal } from "../classifications/AddClassificationModal";
import { ApplicationModal } from "../impacted-apps/ImpactedAppsModal";
import { ProgramsModal } from "../goals/ProgramsModal";
import { useTheme } from "@/themes/ThemeProvider";
import { useLabels } from "../edit-field-labels/LabelContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;
export interface Header {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
}

interface BudgetRow {
  budget_detail_id: number;
  project_id: number;
  category_id: number;
  sub_category_id: number;
  category_name: string;
  sub_category_name: string;
  qty: number;
  value: number;
  unit: number;
  total: number;
  department_id: number;
  department_name: string;
  description: string;
}
// Define the ProjectROI Interface
interface ProjectROI {
  project_roi_id?: number;
  project_id: number;
  total_capex: number;
  total_opex: number;
  total_investment: number;
  annual_benefits: number;
  annual_cost: number;
  net_annual_benefits: number;
  roi_percent: number;
  payback_period: string;
  breakeven_point: number;
  comment?: string;
  customer_id: number;
}
interface Project {
  nameTitle: string;
  classification: string;
  goalSelected: string;
  program: string;
  businessOwner: string;
  businessOwnerDept: string;
  projectOwner: string;
  projectOwnerDept: string;
  projectManager: string;
  impactedFunction: string;
  impactedApp: string;
  priority: string;
  budget: string;
  projectSize: string;
  startDate: string;
  endDate: string;
  goLiveDate: string;
  roi: string;
  businessProblem: string;
  scopeDefinition: string;
  keyAssumption: string;
  benefitsROI: string;
  risk: string;
  budgetImpact: string;
  actualBudget: string;
  dependentProjects: string;
}
const NewIntake = () => {
  //const navigation = useNavigation();
  // { items, projectId, isEditable }
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  //const isEditable = searchParams.get("isEditable");
  const [project, setProject] = useState<Project | null>(null);
  const [dependentProjects, setDependentProjects] = useState<any>();
  const [selectedDependentProjects, setSelectedDependentProjects] =
    useState("");
  const [projId, setProjId] = useState<any>("");
  //-------------------------------------------Rushil's Code and States var new INtake------------------------------
  const [nameTitle, setNameTitle] = useState("");
  const [classification, setClassification] = useState("");
  const [goal, setGoal] = useState("");
  const [program, setProgram] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [businessOwnerDept, setBusinessOwnerDept] = useState<number>();
  const [projectOwner, setProjectOwner] = useState("");
  const [projectOwnerDept, setProjectOwnerDept] = useState<number>();
  const [projectManager, setProjectManager] = useState("");
  const [impactedFunction, setImpactedFunction] = useState("");
  const [impactedApp, setImpactedApp] = useState("");
  const [priority, setPriority] = useState("");
  const [budget, setBudget] = useState("");
  const [projectSize, setProjectSize] = useState("");
  /*  const [startDate, setStartDate] = useState(''); */

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  /* const [endDate, setEndDate] = useState(''); */
  const [goLiveDate, setGoLiveDate] = useState<string>("");
  const [addOtherUser, setAddOtherUser] = useState(false);
  const [businessProblem, setBusinessProblem] = useState("");
  const [scopeDefinition, setScopeDefinition] = useState("");
  const [keyAssumption, setKeyAssumption] = useState("");
  const [benefitsROI, setBenefitsROI] = useState("");
  const [projectDrivers, setProjectDrivers] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [approvalPath, setApprovalPath] = useState("");
  const [approvalPathid, setApprovalPathid] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalSelected, setGoalSelected] = useState("");
  const [programData, setProgramData] = useState<any>();
  const [businessData, setBusinessData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [projectMgr, setprojectMgr] = useState([]);
  const [roi, setRoi] = useState("");
  const [risk, setRisk] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showNewApprovalForm, setShowNewApprovalForm] = useState(false);
  const [isapprovalSubmitOpen, setIsapprovalSubmitopen] = useState(false);
  const [designation, setDesignation] = useState("");
  const [isApprovalButtonVisible, setIsApprovalButtonVisible] = useState(false);
  const [action, setAction] = useState("");
  const [isApprovalPopupVisible, setIsApprovalPopupVisible] = useState(false);
  const [isReviewPopupVisible, setIsReviewPopupVisible] = useState(false);
  const [approvalPathidApp, setApprovalPathidApp] = useState("");
  const [selectedOptionApp, setSelectedOptionApp] = useState("2");
  const [steps, setSteps] = useState([
    { id: 1, forwardTo: "", designation: "", action: "", department_name: "" },
  ]);
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submitType = formData.get("submitType");
    console.log("fngk");
  };
  const mapUserIdToDeptName = (id: number) => {
    //console.log(id);
    const ChosenUser = users.find((item) => item.user_id === id);
    //console.log(ChosenUser);
    return ChosenUser ? ChosenUser.department_name : " ";
  };
  const [classifications, setClassifications] = useState();
  const addStep = () => {
    ////////
    if (steps.length > 4) {
      showAlert("You can not add more than five users");
    } else {
      setSteps([
        ...steps,
        {
          id: steps.length + 1,
          forwardTo: "",
          designation: "",
          action: "",
          department_name: "",
        },
      ]);
    }
  };
  const [sequence, setSequence] = useState([]);
  const [users, setUsers] = useState([]);
  const [BudgetImpactedList, setBudgetImpactedList] = useState<any>([]);
  const [approvers, setApprovers] = useState();
  const [departments, setDepartments] = useState([]);
  const [formIsEditable, setFormIsEditable] = useState<boolean>(isEditable);
  const [actualBudget, setActualBudget] = useState("");
  const [budgetImpact, setBudgetImpact] = useState("");
  const [applications, setApplications] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [startDateDisplay, setStartDateDisplay] = useState("");
  const [pmousers, setPMOUsers] = useState([]);
  const [mode, setMode] = useState<"draft" | "review" | "approve">("draft");
  const [budgetData, setBudgetData] = useState<BudgetRow[]>([]);
  const [modalText, setModalText] = useState("Send for Review"); // Default modal text
  const [isSubmitPopupVisible, setIsSubmitPopupVisible] = useState(false);
  const [SubmitpopupMessage, setSubmitPopupMessage] = useState("");
  const [BudgetmodalVisible, setBudgetModalVisible] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [roiModalVisible, setRoiModalVisible] = useState(false);
  const [roiData, setROIData] = useState<ProjectROI>({
    project_roi_id: 0,
    project_id: 0,
    total_capex: 0,
    total_opex: 0,
    total_investment: 0,
    annual_benefits: 0,
    annual_cost: 0,
    net_annual_benefits: 0,
    roi_percent: 0,
    payback_period: "",
    breakeven_point: 0,
    comment: "",
    customer_id: 0,
  });
  const [multiSelectDropdownVisible, setMultiSelectDropdownVisible] =
    useState(false);
  const [comment, setComment] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState(""); // Holds the selected image data

  const [fileName, setFileName] = useState("");
  const [originalFileName, setOriginalFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [navigateTo, setNavigateTo] = useState<any>("");
  const [priorityData, setPriorityData] = useState();
  const [budgetSizeData, setBudgetSizeData] = useState();
  const [projectSizeData, setProjectSizeData] = useState();

  const [isCreatingSequence, setIsCreatingSequence] = useState(false);

  const [classificationModal, setClassificationVisible] = useState(false);
  const [goalsModal, setGoalsVisible] = useState(false);
  const [programsModal, setProgramsVisible] = useState(false);
  const [appsModal, setAppsVisible] = useState(false);
  const [isBudgetEditable, setIsBudgetEditable] = useState(true);
  const fileInputRef = useRef(null);
  const nestedDropdownRef = useRef();
  //const route = useRoutes();
  //const status = route.params?.status ?? null; Bilal

  const { labels } = useLabels();
  const labelClassification = labels["classification_name"] || {
    display: "Classification",
    placeholder: "Enter Classification",
    dropdown: "Select Classification",
  };
  const labelImpFunc = labels["impacted_function"] || {
    display: "Impacted Function",
    placeholder: "Enter Impacted Function",
    dropdown: "Select Impacted Function",
  };
  const labelBusOwner = labels["business_stakeholder_user_name"] || {
    display: "Business Owner",
    placeholder: "Enter Business Owner",
    dropdown: "Select Business Owner",
  };
  const labelBusOwnerDept = labels["business_stakeholder_dept_name"] || {
    display: "Business Owner Department",
    placeholder: "Enter Business Owner Department",
    dropdown: "Select Business Owner Department",
  };
  const labelProjOwner = labels["project_owner"] || {
    display: "Project Owner",
    placeholder: "Enter Project Owner",
    dropdown: "Select Project Owner",
  };
  const labelProjOwnerDept = labels["project_owner_dept"] || {
    display: "Project Owner Department",
    placeholder: "Enter Project Owner Department",
    dropdown: "Select Project Owner Department",
  };
  const labelPropStart = labels["proposed_start_date"] || {
    display: "Proposed Start Date",
    placeholder: "Enter Proposed Start Date",
    dropdown: "Select Proposed Start Date",
  };
  const labelPropEnd = labels["proposed_end_date"] || {
    display: "Proposed End Date",
    placeholder: "Enter Proposed End Date",
    dropdown: "Select Proposed End Date",
  };
  const labelGoLiveDate = labels["golive_date"] || {
    display: "Go-Live Date",
    placeholder: "Enter Go-Live Date",
    dropdown: "Select Go-Live Date",
  };
  const labelBusinessProb = labels["business_problem"] || {
    display: "Business Description",
    placeholder: "Enter Business Description",
    dropdown: "Select Business Description",
  };
  const labelScopeDef = labels["scope_definition"] || {
    display: "Scope Definition",
    placeholder: "Enter Scope Definition",
    dropdown: "Select Scope Definition",
  };
  const labelKeyAssumption = labels["key_assumption"] || {
    display: "Key Assumptions",
    placeholder: "Enter Key Assumptions",
    dropdown: "Select Key Assumptions",
  };
  const labelBenefits = labels["benefits_roi"] || {
    display: "Benefits/ROI",
    placeholder: "Enter Benefits/ROI",
    dropdown: "Select Benefits/ROI",
  };
  const labelRisk = labels["risk"] || {
    display: "Risk",
    placeholder: "Enter Risk",
    dropdown: "Select Risk",
  };
  const labelBudgetImpact = labels["budget_impact"] || {
    display: "Budget Impact",
    placeholder: "Enter Budget Impact",
    dropdown: "Select Budget Impact",
  };

  // #region Load Master
  const fetchGoals = async () => {
    try {
      setGoals([]);
      const response = await GetGoals(undefined, undefined, "", true, "", "");
      const result = JSON.parse(response);
      if (result?.data?.goals && Array.isArray(result.data.goals)) {
        setGoals(result.data.goals);
        //await AsyncStorage.setItem('UserState', 'ProductDetailedView');
      } else {
        console.error("Invalid goals data");
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      //setGoals([]);
    }
  };
  const fetchPrograms = async (goalId?: string) => {
    try {
      setProgramData(undefined);
      console.log("goalId" + goalId);
      const response = await GetProgramsByGoalId(goalId ?? "", "true");
      const result = JSON.parse(response);
      if (
        result?.status === "success" &&
        Array.isArray(result?.data?.programs)
      ) {
        setProgramData(result.data.programs);
        console.log("Fetched Programs:", result.data.programs);
      } else {
        setProgramData([]);
        console.error("Invalid programs data");
      }
    } catch (error) {
      console.error("Error fetching Programs:", error);
      //setGoals([]);
    }
  };
  const fetchClassification = async () => {
    try {
      setClassifications(undefined);
      const response = await GetClasssifcation("true");
      const result = JSON.parse(response);

      ////////
      if (
        result?.data?.classifications &&
        Array.isArray(result.data.classifications)
      ) {
        setClassifications(result.data.classifications);
      } else {
        //console.error('Invalid Classification data');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //setGoals([]);
    }
  };
  const fetchMasters = async () => {
    try {
      const response = await GetMasterData();
      const result = JSON.parse(response);
      if (result.data.classifications) {
        setClassifications(result.data.classifications);
      }
      if (result.data.priority) {
        setPriorityData(result.data.priority);
      }
      if (result.data.budget_size) {
        setBudgetSizeData(result.data.budget_size);
      }
      if (result.data.project_size) {
        setProjectSizeData(result.data.project_size);
      }
      if (result.data.goals) {
        setGoals(result.data.goals);
      }
      if (result.data.programs) {
        setProgramData(result.data.programs);
      }
      if (result.data.budget_impact) {
        setBudgetImpactedList(result.data.budget_impact);
      }
      // if (result.data.impacted_applications)
      // {
      //     setBudgetSizeData(result.data.impacted_applications);
      // }
      ////////
      if (result.data.departments) {
        setDepartments(result.data.departments);
      }

      if (result.data.users) {
        setUsers(result.data.users);
      }
      if (result.data.impacted_applications) {
        const mappedApps = result.data.impacted_applications.map(
          (element: any) => ({
            label: element.application_name,
            value: element.application_id?.toString(),
            group: "Group",
          })
        );
        setApplications(mappedApps);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //setGoals([]);
    }
  };

  const fetchDependentProjects = async () => {
    try {
      ////debugger;
      const response = await GetDependentProjects();
      const result = JSON.parse(response);

      if (result?.data?.projects && Array.isArray(result.data.projects)) {
        const formattedProjects = result.data.projects.map((element: any) => ({
          label: element.project_name,
          value: element.project_id.toString(), // Ensure it's string for match
          group: "Group",
          selected: false,
        }));

        console.log("✅ Formatted MasterData:", formattedProjects);
        setDependentProjects(formattedProjects);
      } else {
        console.error("Invalid projects data:", result);
      }
    } catch (error) {
      console.error("Error fetching dependent projects:", error);
    }
  };

  //Validations
  const [submitted, setSubmitted] = useState(false);
  const isInvalid = submitted && !startDate;

  //#endregion
  const handleReview = async () => {
    var isError = false;
    const values = {
      projectId: projectId,
      nameTitle: nameTitle,
      department_id: null,
      classification: classification,
      goalSelected: Number(goalSelected),
      program: Number(program),
      businessOwner: Number(businessOwner) || 0,
      businessOwnerDept: mapUserIdToDeptId(parseInt(businessOwner)) || 0, // automatically bind the deptid if user id has a dept defined already
      projectOwner: Number(projectOwner),
      projectOwnerDept: mapUserIdToDeptId(parseInt(projectOwner)) || 0,
      projectManager: Number(projectManager),
      // impacted_stakeholder_dept: ,
      impactedFunction: impactedFunction,
      impactedApp: impactedApp,
      priority: Number(priority),
      budget: budget,
      projectSize: projectSize,
      startDate: startDate,
      endDate: endDate,
      goLiveDate: goLiveDate,
      roi: roi,
      businessProblem: businessProblem,
      scopeDefinition: scopeDefinition,
      keyAssumption: keyAssumption,
      benefitsROI: benefitsROI,
      risk: risk,
      budgetImpact: budgetImpact,
      actualBudget: actualBudget,
      fileName: fileName,
      originalFileName: originalFileName,
      dependentProjects: selectedDependentProjects,
    };
    for (let step of steps) {
      if (step.forwardTo === "") {
        showAlert("Please select user to send for review");
        isError = true;
      }
    }
    if (!isError) {
      try {
        let currentProjectId = await handleSaveAsDraft(values);
        console.log("handle review" + values);
        if (currentProjectId) {
          const payload = {
            project_id: Number(currentProjectId),
            approval_type: Number(selectedOption || "2"),
            type: "review",
            sent_to: Number(approvalPathid), // Assuming this is a single user ID for initial approval path
            approval_sequence_details: steps.map((step, index) => ({
              sequence_no: index + 1, // Sequence number (1-based index)
              user_id: Number(step.forwardTo), // User ID from the step
            })),
          };

          console.log("Generated Payload:", payload);

          const response = await InsertReview(payload);
          const result = JSON.parse(response);

          if (result.status === "success") {
            // setSubmitPopupMessage('Your review has been submitted successfully!');

            setIsReviewPopupVisible(false);
            // setIsDraftSaved(true);
            // setTimeout(() => {
            //   setIsDraftSaved(false);
            // }, 2000);
            //resetForm();
            showAlert("Intake sent for review successfullly");
            setTimeout(() => navigation("/IntakeList"), 1000);
          } else {
            showAlert(result.message);
          }
        } else {
          //showAlert('Failed to submit. Please try again.');
        }
      } catch (error) {
        //showAlert('Failed to submit. Please try again.');
      }
    }
  };

  const handleApproval = async () => {
    //////////
    const values = {
      projectId: projectId,
      nameTitle: nameTitle,
      department_id: null,
      classification: classification,
      goalSelected: Number(goalSelected),
      program: Number(program),
      businessOwner: Number(businessOwner) || 0,
      businessOwnerDept: mapUserIdToDeptId(parseInt(businessOwner)) || 0, // automatically bind the deptid if user id has a dept defined already
      projectOwner: Number(projectOwner),
      projectOwnerDept: mapUserIdToDeptId(parseInt(projectOwner)) || 0,
      projectManager: Number(projectManager),
      // impacted_stakeholder_dept: ,
      impactedFunction: impactedFunction,
      impactedApp: impactedApp,
      priority: Number(priority),
      budget: budget,
      projectSize: projectSize,
      startDate: startDate,
      endDate: endDate,
      goLiveDate: goLiveDate,
      roi: roi,
      businessProblem: businessProblem,
      scopeDefinition: scopeDefinition,
      keyAssumption: keyAssumption,
      benefitsROI: benefitsROI,
      risk: risk,
      budgetImpact: budgetImpact,
      actualBudget: actualBudget,
      fileName: fileName,
      originalFileName: originalFileName,
      dependentProjects: selectedDependentProjects,
    };
    try {
      if (selectedOptionApp === "2" && approvalPathidApp === "") {
        alert("Please select a user to send for Approval");
      } else {
        let currentProjectId = await handleSaveAsDraft(values);
        //console.log('currentProjectId ' + currentProjectId)
        if (currentProjectId) {
          const payload = {
            //aprvl_seq_id: Number(approvalPathidApp),
            project_id: Number(currentProjectId),
            sent_to: Number(approvalPathidApp),
            type: "approval",
            approval_type: Number(selectedOptionApp),
            comment: comment,
          };
          console.log("handleSaveAsDraft:" + payload);
          const response = await InsertApproval(payload);
          const result = JSON.parse(response);

          if (result.status === "success") {
            //Alert.alert("Submission successful!");
            // setIsPopupVisible(false);
            setIsApprovalPopupVisible(false);
            // setIsDraftSaved(true);
            // setTimeout(() => {
            //   setIsDraftSaved(false);
            // }, 2000);
            //resetForm();
            if (selectedOptionApp === "2" || selectedOptionApp === "") {
              showAlert("Intake sent for approval successfully");
            } else {
              showAlert("Intake approved successfully");
            }
            setTimeout(() => navigation("/IntakeList"), 1000);
          } else {
            // Alert.alert("Failed to submit. Please try again.");
          }
        } else {
          //Alert.alert("Unable to retrieve project ID. Submission aborted.");
        }
      }
    } catch (error) {
      console.error("Error submitting:", error);
      //Alert.alert("An error occurred while submitting. Please try again.");
    }
  };

  const handleDraft = async (values: any) => {
    try {
      let currentProjectId = await handleSaveAsDraft(values);
      //////debugger;
      //console.log('currentProjectId ' + currentProjectId)
      //resetForm();
      if (currentProjectId) {
        //Alert.alert("Submission successful!");
        showAlert("Draft saved successfully");
        setTimeout(() => navigation("/IntakeList"), 1000);
      } else {
        //Alert.alert("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      //Alert.alert("An error occurred while submitting. Please try again.");
    }
  };

  const mapUserIdToDeptId = (id: number) => {
    console.log(id);
    const ChosenUser = users.find((item) => item.user_id === id);
    console.log(ChosenUser);
    return ChosenUser ? ChosenUser.department_id : 0;
  };

  const loadBudgetData = async (project_id) => {
    try {
      const resp = await GetBudgetDetails(project_id);

      const result = JSON.parse(resp);
      if (result?.data?.budget && Array.isArray(result.data.budget)) {
        setIsBudgetEditable(false);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };
  console.log("this is form Editable", formIsEditable);

  const removeStep = (id) => {
    if (steps.length > 1) {
      const newSteps = steps
        .filter((step) => step.id !== id)
        .map((step, index) => ({
          ...step,
          id: index + 1,
        }));
      setSteps(newSteps);
    }
  };

  const handleBusinessOwnerDept = (deptID: number) => {
    setBusinessOwnerDept(deptID);
    console.log(`Selected Stakeholder: ${deptID}`);
    console.log(`Updated Business Owner Department: ${deptID}`);
  };

  const handleProjectOwnerDept = (deptID: number) => {
    setProjectOwnerDept(deptID);
    console.log(`Selected Stakeholder: ${deptID}`);
    console.log(`Updated Project Owner Department: ${deptID}`);
  };
  const handleSaveAsDraft = async (values: any) => {
    console.log("Project-Id" + projectId);
    console.log("handleSubmit");
    console.log(values);
    try {
      const programDataToSubmit = {
        project_id: projectId,
        project_name: values.nameTitle,
        department_id: null,
        classification: values.classification,
        goal_id: Number(values.goalSelected),
        program_id: Number(values.program),
        business_stakeholder_user: Number(values.businessOwner) || 0,
        business_stakeholder_dept:
          mapUserIdToDeptId(parseInt(values.businessOwner)) || 0, // automatically bind the deptid if user id has a dept defined already
        project_owner_user: Number(values.projectOwner),
        project_owner_dept:
          mapUserIdToDeptId(parseInt(values.projectOwner)) || 0,
        project_manager_id: Number(values.projectManager),
        // impacted_stakeholder_dept: ,
        impacted_function: values.impactedFunction,
        impacted_applications: values.impactedApp,
        priority: Number(values.priority),
        budget_size: values.budget,
        project_size: values.projectSize,
        start_date: values.startDate,
        end_date: values.endDate,
        golive_date: values.goLiveDate,
        roi: values.roi,
        business_desc: values.businessProblem,
        scope_definition: values.scopeDefinition,
        key_assumption: values.keyAssumption,
        benefit_roi: values.benefitsROI,
        risk: values.risk,
        budget_impact: values.budgetImpact,
        actual_budget: values.actualBudget,
        attachment: fileName,
        roi_orig_file: originalFileName,
        dependent_projects: values.dependentProjects,
      };

      // Log the object for debugging
      console.log(programDataToSubmit);

      const response = await InsertDraft(programDataToSubmit);
      const parsedResponse = JSON.parse(response);

      if (parsedResponse.status === "success") {
        const ProjectId = parsedResponse.data.project_id;
        console.log("Project ID:", ProjectId);
        setProjId(ProjectId);
        // setNameTitle('');
        // setClassification('');
        // setGoalSelected('');
        // setProgram('');
        // setBusinessOwner('');
        // setBusinessOwnerDept(0);
        // setProjectOwner('');
        // setProjectOwnerDept(0);
        // setProjectManager('');
        // setImpactedFunction('');
        // setImpactedApp('');
        // setPriority('');
        // setBudget('');
        // setProjectSize('');
        // setStartDate('');
        // setEndDate('');
        // setGoLiveDate('');
        // setRoi('');
        // setBusinessProblem('');
        // setScopeDefinition('');
        // setKeyAssumption('');
        // setBenefitsROI('');
        // setRisk('');

        if (
          ProjectId !== null &&
          ProjectId !== undefined &&
          budgetData.length > 0
        ) {
          await insertBudgetDetails(ProjectId);
        }
        if (
          ProjectId !== null &&
          ProjectId !== undefined &&
          Object.keys(roiData).length > 0
        ) {
          insertROIDetails(ProjectId);
        }

        //navigate('IntakeList', { });
        return ProjectId;
      } else {
        // Alert.alert('Failed to save draft. Please try again.');
        showAlert(parsedResponse.message);
      }
    } catch (error) {
      //   if (error instanceof Yup.ValidationError) {
      //     // Alert.alert(
      //     //   "Validation Error",
      //     //   error.errors.join("\n") // Display all validation errors
      //     // );
      //   } else {
      //     console.error("Error saving draft:", error);
      //     // Alert.alert("An error occurred. Please try again.");
      //   }
    }
  };
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
  };

  // Handlers to change modal text and show the popup
  const handleApprovalClick = (validateForm: any, isValid: boolean) => {
    console.log("clicked appr" + isValid);
    setMode("approve");
    setTimeout(() => {
      validateForm().then((errors: any) => {
        if (Object.keys(errors).length === 0) {
          setModalText("Send for Approval");
          setIsApprovalPopupVisible(true);
        } else {
          console.log("Form has errors", errors);
        }
      });
    }, 1000);
  };
  const handleReviewClick = async (validateForm: any, isValid: boolean) => {
    console.log("mode:" + mode);
    setMode("review");
    setSteps([
      {
        id: 1,
        forwardTo: "",
        designation: "",
        action: "",
        department_name: "",
      },
    ]);
    setTimeout(() => {
      console.log("mode:" + mode);
      validateForm().then((errors: any) => {
        if (Object.keys(errors).length === 0) {
          //if (isValid) {
          //setModalText('Send for Review');
          setShowNewApprovalForm(true);
          setIsPopupVisible(true); // Open modal only if form is valid
          let pmo_users = [];
          // if(pmousers.length === 0 && steps.length === 0){
          //  // setSteps({id: 1, forwardTo: '', designation: '', action: '', department_name: ''});
          // }
          // if (pmousers.length > 0 && steps[0].forwardTo === '') {
          //   for (let i = 0; i < pmousers.length; i++) {
          //     pmo_users.push({
          //       id: i + 1,
          //       forwardTo: pmousers[i].user_id,
          //       designation: '',
          //       action: '',
          //       department_name: pmousers[i].department_name,
          //     });
          //   }
          //   setSteps(pmo_users);
          // }
        } else {
          console.log("Form has errors", errors);
        }
      });
    }, 1000);
  };

  const insertBudgetDetails = async (projectID: number) => {
    const updatedRows = budgetData.map((row) => {
      return { ...row, project_id: projectID }; // Add or update the project_id
    });
    const response = await InsertBudgetDetails(updatedRows);
    const parsedResponse = JSON.parse(response);
    console.log(parsedResponse);
    // if (parsedResponse.status === "success") {
    // }
  };
  const insertROIDetails = async (projectID: number) => {
    const updatedRows = { ...roiData, project_id: projectID };
    const response = await InsertROIDetails(updatedRows);
    const parsedResponse = JSON.parse(response);
    console.log(parsedResponse);
    // if (parsedResponse.status === "success") {
    // }
  };
  function base64ToBlob(base64: string): Blob {
    // Check if the base64 string includes a Data URI prefix
    const hasDataUriPrefix = base64.startsWith("data:");
    let byteString, mimeString;

    if (hasDataUriPrefix) {
      const splitDataURI = base64.split(",");
      byteString =
        splitDataURI[0].indexOf("base64") >= 0
          ? atob(splitDataURI[1])
          : decodeURI(splitDataURI[1]);
      mimeString = splitDataURI[0].split(":")[1].split(";")[0];
    } else {
      // Fallback for missing prefix
      byteString = atob(base64);
      mimeString = "image/jpeg"; // Default MIME type (adjust as needed)
    }

    // Create a Uint8Array from the byte string
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  const handleFileSelect = (event: any) => {
    //
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setOriginalFileName(file.name);
      handleFileUpload(file);
    } else {
      alert("No file selected");
    }
  };

  const handleFileUpload = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const url = `${BASE_URL}/common/upload_excel`;
      var response = await SubmitDetails(url, formData);
      // setImage(jsonResult.data.file_name);

      if (response.status === "success") {
        setFileUrl(response.data.filePath); // Assuming the API returns the uploaded file URL
        setUploadSuccess(true);
        setFileName(response.data.file_name);
        //alert('File uploaded successfully!');
      } else {
        //alert('Upload failed');
        if (response.message.includes("Unsupported file type")) {
          showAlert(
            "Upload unsuccessful due to an invalid file format. Please download the template, update it, and then upload the revised file."
          );
          setFileName("");
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear file input
          }
        } else {
          showAlert(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the file");
    }
  };

  const handleViewFile = async () => {
    if (fileName) {
      const fileDownloadUrl = await fetchImageWithAuth(
        `${BASE_URL}/common/get_excel/${fileName}`
      );
      // You can open the file in a new tab or a new window
      const link = document.createElement("a");
      link.href = fileDownloadUrl;
      link.download = originalFileName; // Use the file name returned from the API
      document.body.appendChild(link); // Append the link to the body
      link.click(); // Simulate a click to trigger the download
      document.body.removeChild(link); // Clean up after the download
    } else {
      alert("Failed to fetch the file");
    }
  };

  const downloadFile = async () => {
    const url = `${BASE_URL}/images/ROI_Template.xlsx`; // Replace with your API URL
    const fileName = "ROI_Template.xlsx"; // Replace with the desired file name

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleConfirmNavigation = () => {
    setConfirmDialogVisible(false);
    navigation(navigateTo);
    //navigation.dispatch(navigateTo);
    //resetNavigation(navigateTo);
  };

  const handleCancelNavigation = () => {
    setConfirmDialogVisible(false);
  };
  const fetchApprovers = async (prj_id: string) => {
    try {
      const response = await GetApprovers(prj_id);
      const result = JSON.parse(response);

      ////
      if (result.data.users) {
        setApprovers(result.data.users);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //setGoals([]);
    }
  };
  const location = useLocation();
  //const status = location.params?.status ?? null;

  const navigation = useNavigate();
  const datePickerRefStartDate = useRef(null);
  const datePickerRefEndDate = useRef(null);
  const datePickerRefGoLiveDate = useRef(null);
  const impactedFunctionRef = useRef(null);
  const impactedAppRef = useRef(null);
  const { theme } = useTheme();
  useEffect(() => {
    (async function () {
      if (typeof isEditable === "boolean") {
        // Set formIsEditable based on the passed prop on mount
        setFormIsEditable(isEditable);
      } else {
        // Default to false if the prop is not provided
        setFormIsEditable(false);
      }
      /////////////////////////////
      //masters
      //fetchSequence();

      //fetchPMOUsers();
      //
      fetchMasters();
      fetchApprovers(projectId?.toString());
      fetchDependentProjects();

      if (projectId) {
        await GetProjects({ ProjectId: projectId }) // Assuming the query param is empty for now
          .then((response) => {
            console.log("project id:" + projectId);
            const parsedResponse = JSON.parse(response);
            const projects = parsedResponse?.data?.projects || [];
            const matchedProject = projects.find(
              (proj) => proj.project_id?.toString() === projectId
            );
            setProject(matchedProject || null);
            //console.log('matched' + format(parseISO(matchedProject.start_date), 'yyyy-MM-dd'));
            //setInitialValues({
            setNameTitle(matchedProject.project_name || ""); // Default to empty string if missing
            setClassification(matchedProject.classification || ""); // Default to empty string if missing
            setGoalSelected(matchedProject.goal_id || "");
            setProgram(matchedProject.program_id || "");
            setBusinessOwner(matchedProject.business_stakeholder_user || "");
            setBusinessOwnerDept(
              matchedProject.business_stakeholder_dept || ""
            );
            setProjectOwner(matchedProject.project_owner_user || "");
            setProjectOwnerDept(matchedProject.project_owner_dept || "");
            setProjectManager(matchedProject.project_manager_id || "");
            setImpactedFunction(matchedProject.impacted_function || "");
            setImpactedApp(matchedProject.impacted_applications || "");
            setPriority(matchedProject.priority || "");
            setBudget(matchedProject.budget_size || "");
            setProjectSize(matchedProject.project_size || "");
            setStartDate(matchedProject.start_date || "");
            setEndDate(matchedProject.end_date || "");
            setGoLiveDate(matchedProject.golive_date || "");
            ////////
            setRoi(matchedProject.roi || "");
            setBusinessProblem(matchedProject.business_desc || "");
            setScopeDefinition(matchedProject.scope_definition || "");
            setKeyAssumption(matchedProject.key_assumption || "");
            setBenefitsROI(matchedProject.benefit_roi || "");
            setRisk(matchedProject.risk || "");
            setActualBudget(matchedProject.actual_budget || "");
            setBudgetImpact(matchedProject.budget_impact || "");
            setFileName(matchedProject.attachment || "");
            if (
              matchedProject.attachment !== "" &&
              matchedProject.attachment !== null
            ) {
              setUploadSuccess(true);
            }
            setOriginalFileName(matchedProject.roi_orig_file || "");
            setSelectedDependentProjects(matchedProject.dependent_projects);

            console.log("Applications to be send are", impactedFunction);
          })
          .catch((error) => {
            console.error("Error fetching project:", error);
          });
        loadBudgetData(projectId);
      }
      setLoading(false);
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        {/* <div className="min-w-[1000px]">
          <AdvancedDataTable
            isfilter1={true}
            data={projects}
            columns={headers}
            title="Closed Project"
            exportFileName="closed projects"
            isCreate={false}
            onCreate={() => navigation("/NewIntake")}
            isPagingEnable={true}
            PageNo={currentPage}
            TotalPageCount={totalPages}
            rowsOnPage={rowsPerPage}
            onrowsOnPage={handleRowsPerPageChange}
            onPageChange={function (worker: number): void {
              handlePageChange(worker);
            }}
            MasterDepartments={departments}
            MasterStatus={statuses}
            selectedDepartment={selectedDepartment}
            status={selectedStatus}
            isDepartmentFilter={true}
            onDepartmentFilterAction={async function (
              worker: string
            ): Promise<void> {
              setdataLoading(true);
              setSearchQuery("");
              setSelectedDepartment(worker ?? "");

              await fetchProjectsWithFilters({
                project_owner_dept: worker,
                status: selectedStatus,
                PageNo: 1,
                PageSize: rowsPerPage,
              });
              setdataLoading(false);
            }}
            isStatusFilter={true}
            onStatusFilterAction={async function (
              worker: string
            ): Promise<void> {
              setdataLoading(true);
              setSearchQuery("");
              setSelectedStatus(worker ?? "");
              await fetchProjectsWithFilters({
                project_owner_dept: selectedDepartment,
                status: worker,
                PageNo: 1,
                PageSize: rowsPerPage,
              });
              setdataLoading(false);
            }}
            isSearch={true}
            searchText={searchQuery}
            onSearch={async function (
              worker1: string,
              worker2: string
            ): Promise<void> {
              setSearchQuery(worker2);
              fetchProjectsWithFilters({
                page: 1,
                pageSize: rowsPerPage,
                project_id: worker1,
              });
            }}
            query={"all"}
            onClearFilter={async () => {
              setdataLoading(true);
              setSelectedDepartment("");
              setSelectedStatus("");
              setSearchQuery("");
              setCurrentPage(1);
              await fetchProjectsWithFilters({
                project_owner_dept: "",
                status: "",
                PageNo: 1,
                PageSize: rowsPerPage,
              });
              setdataLoading(false);
            }}
            data_type={"Project"}
          />
        </div> */}
        {/* onSubmit={handleSubmit} noValidate */}
        <form
          id="intake-main-form"
          //method="POST"
          //noValidate
          onSubmit={(e) => {
            e.preventDefault(); // if handling in React
            setSubmitted(true);
            if (!impactedFunction) {
              impactedFunctionRef.current?.scrollIntoView();
              return;
            }
            if (!impactedApp) {
              impactedAppRef.current?.scrollIntoView();
              return;
            }

            if (!startDate) {
              datePickerRefStartDate.current?.scrollIntoView();
              return;
            }
            if (!endDate) {
              datePickerRefEndDate.current?.scrollIntoView();
              return;
            }
            if (!goLiveDate) {
              datePickerRefGoLiveDate.current?.scrollIntoView();
              return;
            }
            if (new Date(endDate) < new Date(startDate)) {
              //datePickerRefEndDate.current?.scrollIntoView();
              datePickerRefEndDate.current.current?.scrollIntoView();

              return;
            }
            if (new Date(goLiveDate) > new Date(endDate)) {
              //datePickerRefGoLiveDate.current?.scrollIntoView();
              datePickerRefGoLiveDate.current?.scrollIntoView();

              return;
            }
            const values = {
              projectId: projectId,
              nameTitle: nameTitle,
              department_id: null,
              classification: classification,
              goalSelected: Number(goalSelected),
              program: Number(program),
              businessOwner: Number(businessOwner) || 0,
              businessOwnerDept:
                mapUserIdToDeptId(parseInt(businessOwner)) || 0, // automatically bind the deptid if user id has a dept defined already
              projectOwner: Number(projectOwner),
              projectOwnerDept: mapUserIdToDeptId(parseInt(projectOwner)) || 0,
              projectManager: Number(projectManager),
              // impacted_stakeholder_dept: ,
              impactedFunction: impactedFunction,
              impactedApp: impactedApp,
              priority: Number(priority),
              budget: budget,
              projectSize: projectSize,
              startDate: startDate,
              endDate: endDate,
              goLiveDate: goLiveDate,
              roi: roi,
              businessProblem: businessProblem,
              scopeDefinition: scopeDefinition,
              keyAssumption: keyAssumption,
              benefitsROI: benefitsROI,
              risk: risk,
              budgetImpact: budgetImpact,
              actualBudget: actualBudget,
              fileName: fileName,
              originalFileName: originalFileName,
              dependentProjects: selectedDependentProjects,
            };
            //////debugger;
            if (mode === "draft") {
              handleDraft(values);
              //showAlert('Intake draft saved successfully');
              // setIsDraftSaved(true);
              // setTimeout(() => {
              //   setIsDraftSaved(false);
              // }, 2000);
              //navigate('IntakeList', {});
            } else if (mode === "review") {
              //handleReview(values);
              setIsReviewPopupVisible(true);
            } else if (mode === "approve") {
              //handleApproval(values);
              setIsApprovalPopupVisible(true);
            }
            console.log("Submit Type:", mode); // "draft"
          }}
        >
          <div className="p-6 bg-gray-50 rounded-md shadow-md">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={nameTitle}
                  type="text"
                  placeholder="Enter Name/Title"
                  className="w-full mt-1 p-2 border rounded"
                  //           className="w-full p-2 border rounded placeholder-gray-400
                  //    invalid:border-red-500 focus:invalid:border-red-500
                  //    focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setNameTitle(newTotal);
                  }}
                />
                {submitted && !nameTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    Name/Title is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelClassification.display}{" "}
                  <span className="text-red-500">*</span>{" "}
                  <span
                    onClick={() => setClassificationVisible(true)}
                    className="text-blue-600 cursor-pointer ml-1"
                  >
                    + Add
                  </span>
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  onChange={(e) => setClassification(e.target.value)}
                  value={classification}
                >
                  <option value="">{labelClassification.dropdown}</option>
                  {(classifications ?? []).map((item) => (
                    <option
                      key={item.classification_id}
                      value={item.classification_id?.toString()}
                    >
                      {item.classification_name}
                    </option>
                  ))}
                </select>
                {submitted && !classification && (
                  <p className="text-red-500 text-sm mt-1">
                    {labelClassification.display} is required
                  </p>
                )}
                <ClassificationModal
                  isOpen={classificationModal}
                  onClose={() => setClassificationVisible(false)}
                  onCreate={fetchMasters}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Priority <span className="text-red-500">*</span>{" "}
                </label>

                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">Select Priority</option>
                  {(priorityData ?? []).map((item) => (
                    <option key={item.id} value={item.id?.toString()}>
                      {item.value}
                    </option>
                  ))}
                </select>
                {submitted && !priority && (
                  <p className="text-red-500 text-sm mt-1">
                    Priority is required
                  </p>
                )}
              </div>

              {/* Row 2 */}
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Goal{" "}
                  <span
                    onClick={() => setGoalsVisible(true)}
                    className="text-blue-600 cursor-pointer ml-1"
                  >
                    + Add
                  </span>
                </label>

                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={goalSelected}
                  onChange={(e) => {
                    setGoalSelected(e.target.value);
                    fetchPrograms(e.target.value);
                  }}
                >
                  <option value="">Select Goal</option>
                  {(goals ?? []).map((item) => (
                    <option key={item.goal_id} value={item.goal_id?.toString()}>
                      {item.goal_name}
                    </option>
                  ))}
                </select>
                <GoalsModal
                  isOpen={goalsModal}
                  onClose={() => setGoalsVisible(false)}
                  onCreate={fetchGoals}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Program
                  <span
                    onClick={() => setProgramsVisible(true)}
                    className="text-blue-600 cursor-pointer ml-1"
                  >
                    {" "}
                    + Add
                  </span>
                </label>

                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={program}
                  onChange={(e) => {
                    setProgram(e.target.value);
                  }}
                >
                  <option value="">Select Program</option>
                  {(programData ?? []).map((item) => (
                    <option
                      key={item.program_id}
                      value={item.program_id?.toString()}
                    >
                      {item.program_name}
                    </option>
                  ))}
                </select>
                <ProgramsModal
                  isOpen={programsModal}
                  onClose={() => setProgramsVisible(false)}
                  onCreate={fetchPrograms}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Project Size <span className="text-red-500">*</span>
                </label>

                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={projectSize}
                  onChange={(e) => {
                    setProjectSize(e.target.value);
                  }}
                >
                  <option value="">Select Size</option>
                  {(projectSizeData ?? []).map((item) => (
                    <option key={item.id} value={item.id?.toString()}>
                      {item.value}
                    </option>
                  ))}
                </select>
                {submitted && !projectSize && (
                  <p className="text-red-500 text-sm mt-1">
                    Project Size is required
                  </p>
                )}
              </div>

              {/* Row 3 */}
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelImpFunc.display} <span className="text-red-500">*</span>
                </label>
                {/* <select className="w-full mt-1 p-2 border rounded">
                  <option>Select Departments</option>
                </select> */}

                <MultiSelectDepartment
                  placeholder={labelImpFunc.placeholder}
                  departments={departments}
                  selected={
                    impactedFunction?.length > 0
                      ? impactedFunction?.split(",")
                      : []
                  }
                  onChange={async function (selected: string[]): Promise<void> {
                    const worker = selected?.join(",");
                    setImpactedFunction(worker ?? "");
                    //onDepartmentFilterAction(worker);
                  }}
                />
                {submitted && !impactedFunction && (
                  <p
                    className="text-red-500 text-sm mt-1"
                    ref={impactedFunctionRef}
                  >
                    {labelImpFunc.display} is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Impacted Application
                  <span className="text-red-500">*</span>{" "}
                  <span
                    onClick={() => setAppsVisible(true)}
                    className="text-blue-600 cursor-pointer ml-1"
                  >
                    + Add
                  </span>
                </label>
                {applications && (
                  <MultiSelectDropdown
                    items={applications}
                    placeholder="Select Applications"
                    selected={
                      impactedApp?.length > 0 ? impactedApp?.split(",") : []
                    }
                    onChange={async function (
                      selected: string[]
                    ): Promise<void> {
                      //
                      const worker: any = selected?.join(",");
                      setImpactedApp(worker);
                      //onStatusFilterAction(worker);
                    }}
                  />
                )}
                {submitted && !impactedApp && (
                  <p className="text-red-500 text-sm mt-1" ref={impactedAppRef}>
                    Impacted Application is required
                  </p>
                )}
                <ApplicationModal
                  isOpen={appsModal}
                  onClose={() => setAppsVisible(false)}
                  onCreate={fetchMasters}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Dependent Projects
                </label>

                <MultiSelectDropdown
                  items={dependentProjects}
                  placeholder="Select Projects"
                  selected={
                    selectedDependentProjects?.length > 0
                      ? selectedDependentProjects?.split(",")
                      : []
                  }
                  onChange={async function (selected: string[]): Promise<void> {
                    //
                    const worker: any = selected?.join(",");
                    setSelectedDependentProjects(worker);
                    //onStatusFilterAction(worker);
                  }}
                />
              </div>

              {/* Row 4 */}
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Budget <span className="text-red-500">*</span>
                </label>

                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value);
                  }}
                >
                  <option value="">Select Budget</option>
                  {(budgetSizeData ?? []).map((item) => (
                    <option key={item.id} value={item.id?.toString()}>
                      {item.value}
                    </option>
                  ))}
                </select>
                {submitted && !budget && (
                  <p className="text-red-500 text-sm mt-1">
                    Budget is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Estimated Budget ($) <span className="text-red-500">*</span>{" "}
                  <a href="#" onClick={() => setBudgetModalVisible(true)}>
                    <span className="text-blue-600 cursor-pointer ml-1">
                      Budget Calculation
                    </span>
                  </a>
                </label>
                {BudgetmodalVisible && (
                  <BudgetCalculationForm
                    projectId={projectId}
                    projectName={nameTitle}
                    isPopup={true}
                    //onClose={() => setBudgetModalVisible(false)}
                    onClose={(
                      total: number,
                      updateBudget: BudgetRow[],
                      actionType: string,
                      overwriteEstimate: boolean
                    ) => {
                      if (actionType === "submit") {
                        if (overwriteEstimate) {
                          setActualBudget(total?.toString());
                        }
                        setBudgetData(updateBudget);
                      }
                      setBudgetModalVisible(false);
                    }}
                    budgetEstimate={Number(actualBudget)}
                  />
                )}
                <input
                  value={actualBudget}
                  required
                  type="text"
                  placeholder="Estimated Budget"
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setActualBudget(newTotal);
                  }}
                />
                {submitted && !actualBudget && (
                  <p className="text-red-500 text-sm mt-1">
                    Estimated Budget is required
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Project Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelPropStart.display}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {/* <input
                  value={startDate}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setStartDate(newTotal);
                  }}
                /> */}
                <DatePicker
                  //   renderValue={(value, formatStr) => {
                  //     // Hook into the actual input field
                  //     useEffect(() => {
                  //       const input = document.querySelector(
                  //         'input[placeholder="mm/dd/yyyy"]'
                  //       ) as HTMLInputElement | null;
                  //       if (input) {
                  //         datePickerRefStartDate.current = input;
                  //       }
                  //     }, []);
                  //     return formatStr;
                  //   }}

                  //ref={datePickerRefStartDate}
                  oneTap
                  value={
                    startDate ? convertUTCtoLocalDateOnly(startDate) : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const safeDate = new Date(date);
                      safeDate.setHours(12, 0, 0, 0);
                      const iso = safeDate.toISOString();
                      setStartDate(iso);
                    } else {
                      setStartDate("");
                    }
                  }}
                  format="MM/dd/yyyy"
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy"
                  editable={false}
                  //className="w-full"
                  className={`w-full border rounded ${
                    submitted && !startDate
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {submitted && !startDate && (
                  <p
                    className="text-red-500 text-sm mt-1"
                    ref={datePickerRefStartDate}
                  >
                    Start date is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelPropEnd.display} <span className="text-red-500">*</span>
                </label>
                {/* <input
                  value={endDate}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setEndDate(newTotal);
                  }}
                /> */}
                <DatePicker
                  //ref={datePickerRefEndDate}
                  oneTap
                  //portalId="root-portal"
                  value={endDate ? convertUTCtoLocalDateOnly(endDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const safeDate = new Date(date);
                      safeDate.setHours(12, 0, 0, 0); // avoids UTC shift issues
                      const iso = safeDate.toISOString(); // "2025-04-08T12:00:00.000Z"
                      setEndDate(iso); // store full ISO string
                    } else {
                      setEndDate("");
                    }
                  }}
                  format="MM/dd/yyyy"
                  //   style={
                  //     {
                  //       color: "black",
                  //       "--rs-picker-placeholder-color": "black",
                  //     } as React.CSSProperties
                  //   }
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy"
                  editable={false}
                  className={`w-full border rounded ${
                    submitted && !endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {submitted && !endDate && (
                  <p
                    className="text-red-500 text-sm mt-1"
                    ref={datePickerRefEndDate}
                  >
                    End date is required
                  </p>
                )}
                {submitted && new Date(endDate) < new Date(startDate) && (
                  <p
                    className="text-red-500 text-sm mt-1"
                    ref={datePickerRefEndDate}
                  >
                    End date must be after start date
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelGoLiveDate.display}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {/* <input
                  value={goLiveDate}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setGoLiveDate(newTotal);
                  }}
                /> */}
                <DatePicker
                  //ref={datePickerRefGoLiveDate}
                  oneTap
                  //portalId="root-portal"
                  value={
                    goLiveDate ? convertUTCtoLocalDateOnly(goLiveDate) : null
                  }
                  onChange={(date) => {
                    if (date) {
                      const safeDate = new Date(date);
                      safeDate.setHours(12, 0, 0, 0); // avoids UTC shift issues
                      const iso = safeDate.toISOString(); // "2025-04-08T12:00:00.000Z"
                      setGoLiveDate(iso); // store full ISO string
                    } else {
                      setGoLiveDate("");
                    }
                  }}
                  format="MM/dd/yyyy"
                  //   style={
                  //     {
                  //       color: "black",
                  //       "--rs-picker-placeholder-color": "black",
                  //     } as React.CSSProperties
                  //   }
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy"
                  editable={false}
                  className={`w-full border rounded ${
                    submitted && !goLiveDate
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {submitted && !goLiveDate && (
                  <p
                    className="text-red-500 text-sm mt-1"
                    ref={datePickerRefGoLiveDate}
                  >
                    {labelGoLiveDate.display} is required
                  </p>
                )}
                {submitted && new Date(goLiveDate) > new Date(endDate) && (
                  <p
                    className="text-red-500 text-sm mt-1"
                    ref={datePickerRefGoLiveDate}
                  >
                    {labelGoLiveDate.display} must be before end date
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Stake Holders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelBusOwner.display}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={businessOwner}
                  onChange={(e) => {
                    setBusinessOwner(e.target.value);
                    setBusinessOwnerDept(
                      mapUserIdToDeptName(parseInt(e.target.value))
                    );
                    //fetchPrograms(e.target.value);
                  }}
                  a
                >
                  <option value="">{labelBusOwner.dropdown}</option>
                  {(users ?? []).map((item) => (
                    <option key={item.user_id} value={item.user_id?.toString()}>
                      {item.first_name + " " + item.last_name}
                    </option>
                  ))}
                </select>
                {submitted && !businessOwner && (
                  <p className="text-red-500 text-sm mt-1">
                    {labelBusOwner.display} is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelBusOwnerDept.display}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={mapUserIdToDeptName(parseInt(businessOwner)) ?? ""}
                  type="text"
                  readOnly
                  placeholder={`Please select ${labelBusOwner.display}`}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Project Manager
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={projectManager}
                  onChange={(e) => {
                    setProjectManager(e.target.value);
                    // setBusinessOwnerDept(
                    //   mapUserIdToDeptName(parseInt(e.target.value))
                    // );
                    //fetchPrograms(e.target.value);
                  }}
                >
                  <option value="">Select Project Manager</option>
                  {(users ?? []).map((item) => (
                    <option key={item.user_id} value={item.user_id?.toString()}>
                      {item.first_name + " " + item.last_name}
                    </option>
                  ))}
                </select>
                {submitted && !projectManager && (
                  <p className="text-red-500 text-sm mt-1">
                    Project Manager is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelProjOwner.display}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={projectOwner}
                  onChange={(e) => {
                    setProjectOwner(e.target.value);
                    setProjectOwnerDept(
                      mapUserIdToDeptName(parseInt(e.target.value))
                    );
                    //fetchPrograms(e.target.value);
                  }}
                >
                  <option value="">{labelProjOwner.dropdown}</option>
                  {(users ?? []).map((item) => (
                    <option key={item.user_id} value={item.user_id?.toString()}>
                      {item.first_name + " " + item.last_name}
                    </option>
                  ))}
                </select>
                {submitted && !projectOwner && (
                  <p className="text-red-500 text-sm mt-1">
                    {labelProjOwner.display} is required
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  {labelProjOwnerDept.display}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={mapUserIdToDeptName(parseInt(projectOwner)) ?? ""}
                  type="text"
                  readOnly
                  placeholder="Please Select Business Owner"
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Return on Investment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium">
                  Approx ROI (%) <span className="text-red-500">*</span>{" "}
                  <a href="#" onClick={() => setRoiModalVisible(true)}>
                    <span className="text-blue-600 cursor-pointer ml-1">
                      ROI Calculation
                    </span>
                  </a>
                </label>

                <input
                  value={roi}
                  required
                  type="text"
                  placeholder="Enter ROI"
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setRoi(newTotal);
                  }}
                />
                {submitted && !roi && (
                  <p className="text-red-500 text-sm mt-1">ROI is required</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium">
                  Custom Template
                </label>
                <div className="flex gap-4 mt-2">
                  {/* Upload Button */}
                  {!uploadSuccess && (
                    <label className="inline-flex items-center gap-2 px-4 py-2  text-black text-sm font-medium rounded cursor-pointer  transition">
                      Upload
                      <input
                        type="file"
                        //className="hidden"
                        onChange={(e) => {
                          //
                          handleFileSelect(e);
                        }}
                        accept=".xlsx, .xls"
                        //onChange={handleFileSelect}
                      />
                    </label>
                  )}
                  {uploadSuccess && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          handleViewFile();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                      >
                        <Eye_svg className="h-5 w-5" />
                        View File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadSuccess(false);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                      >
                        <Delete_svg className="h-5 w-5" />
                        Delete File
                      </button>
                    </>
                  )}

                  {/* Download Button */}
                  <button
                    type="button"
                    className=" inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition"
                    onClick={() => downloadFile()}
                  >
                    <Download_svg height={20} width={20} fill="white" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Project Drivers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {labelBusinessProb.display}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={businessProblem}
                  rows={3}
                  placeholder={"Enter " + labelBusinessProb.display}
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setBusinessProblem(newTotal);
                  }}
                />
                {submitted && !businessProblem && (
                  <p className="text-red-500 text-sm mt-1">
                    {labelBusinessProb.display} is required
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {labelScopeDef.display}
                </label>
                <textarea
                  value={scopeDefinition}
                  rows={3}
                  placeholder={"Enter " + labelScopeDef.display}
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setScopeDefinition(newTotal);
                  }}
                />
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {labelKeyAssumption.display}
                </label>
                <textarea
                  value={keyAssumption}
                  rows={3}
                  placeholder={"Enter " + labelKeyAssumption.display}
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setKeyAssumption(newTotal);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {labelBenefits.display}
                </label>
                <textarea
                  value={benefitsROI}
                  rows={3}
                  placeholder={"Enter " + labelBenefits.display}
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setBenefitsROI(newTotal);
                  }}
                />
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {labelRisk.display}
                </label>
                <textarea
                  value={risk}
                  rows={3}
                  placeholder={"Enter " + labelRisk.display}
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    // const newTotal = e.target.value;
                    const newTotal = e.target.value;
                    setRisk(newTotal);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {labelBudgetImpact.display}{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  className="w-full mt-1 p-2 border rounded"
                  required
                  value={budgetImpact}
                  onChange={(e) => {
                    setBudgetImpact(e.target.value);
                  }}
                >
                  <option value="">{labelBudgetImpact.dropdown}</option>
                  {(BudgetImpactedList ?? []).map((item) => (
                    <option key={item.id} value={item.id?.toString()}>
                      {item.value}
                    </option>
                  ))}
                </select>
                {submitted && !budgetImpact && (
                  <p className="text-red-500 text-sm mt-1">
                    {`${labelBudgetImpact.display}`} is required
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-start mt-6">
            {/* Left Button */}
            <div>
              {(status === 2 ||
                status === 10 ||
                isEditable ||
                isNaN(status)) && (
                <button
                  type="submit"
                  form="intake-main-form"
                  className="flex items-center gap-2 border border-blue-800 text-blue-800 px-4 py-2 rounded transition"
                  onClick={() => setMode("draft")}
                >
                  <Save_svg className="h-5 w-5" />
                  Save as Draft
                </button>
              )}
            </div>

            {/* Right Stack of Buttons */}
            <div className="flex  items-start gap-2">
              {(status === 2 || status === 10 || isNaN(status)) && (
                <button
                  type="submit"
                  form="intake-main-form"
                  className="flex items-center gap-2  text-white px-4 py-2 rounded transition"
                  style={{
                    backgroundColor: theme.colors.drawerBackgroundColor,
                  }}
                  onClick={() => {
                    setMode("review");
                    //setIsReviewPopupVisible(true);
                  }}
                >
                  <ReviewSVG
                    fill="white"
                    className="h-5 w-5 [&_path]:fill-white"
                  />
                  Send for Review
                </button>
              )}
              {(status === 2 ||
                status === 10 ||
                status === 4 ||
                isNaN(status)) && (
                <button
                  type="submit"
                  form="intake-main-form"
                  className="flex items-center gap-2 border text-white px-4 py-2 rounded  transition"
                  style={{
                    backgroundColor: theme.colors.drawerBackgroundColor,
                  }}
                  onClick={() => {
                    setMode("approve");
                    //setIsApprovalPopupVisible(true);
                  }}
                >
                  <Send_approve_svg className="h-5 w-5 [&_path]:fill-white" />
                  Send for Approval
                </button>
              )}
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1"></div>
            </div>
          </div>
        </form>
        {roiModalVisible && (
          <ROICalculationForm
            isPopup={true}
            projectId={projectId}
            projectName={nameTitle}
            isVisible={roiModalVisible}
            data={roiData}
            onClose={(roiValues: any, actiontype: string) => {
              //closeModalROI(roiData);
              //console.log('raoivalues:' + roiValues.total_capex)

              setRoiModalVisible(false);
              if (actiontype === "submit") {
                setROIData(roiValues);
                setRoi(roiValues.roi_percent);
                //handleSaveDraft(values);
              }
            }}
          />
        )}

        <AlertBox
          visible={alertVisible}
          onCloseAlert={closeAlert}
          message={alertMessage}
        />

        {isApprovalPopupVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="relative w-full max-w-2xl bg-white rounded-xl p-6 shadow-lg">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsApprovalPopupVisible(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Heading */}
              <h2 className="text-xl font-semibold text-center mb-4">
                Send for Approval
              </h2>

              {/* Radio Buttons */}
              <div className="flex justify-center gap-6 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="1"
                    checked={selectedOptionApp === "1"}
                    onChange={(e) => setSelectedOptionApp(e.target.value)}
                    className="accent-blue-700"
                  />
                  <span>In person meeting</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="2"
                    checked={selectedOptionApp === "2"}
                    onChange={(e) => setSelectedOptionApp(e.target.value)}
                    className="accent-blue-700"
                  />
                  <span>Send for Approval</span>
                </label>
              </div>

              {/* Form Section */}
              <div className="max-h-60 overflow-y-auto space-y-4">
                {selectedOptionApp === "2" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select User for Approval{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {/* Replace this with your actual component */}
                    <div className="w-2/3">
                      {/* MultiFeatureDropdown component */}
                      {/* Assume it supports similar props in Web */}

                      <select
                        className="w-full mt-1 p-2 border rounded"
                        required
                        onChange={(e) => setApprovalPathidApp(e.target.value)}
                        value={approvalPathidApp}
                      >
                        <option value="">Select User</option>
                        {(approvers ?? []).map((item) => (
                          <option
                            key={item.user_id}
                            value={item.user_id?.toString()}
                          >
                            {item.first_name + " " + item.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => {
                    setIsApprovalPopupVisible(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleApproval}
                >
                  {selectedOptionApp === "1" ? "Approve" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isReviewPopupVisible && (
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative w-full max-w-2xl bg-white rounded-xl p-6 shadow-lg">
                {/* Table Header */}
                <div className="flex bg-gray-800 text-white p-2 font-bold">
                  <div className="w-8 text-left">#</div>
                  <div className="flex-[2] text-left">Forward to</div>
                  <div className="flex-[2] text-left ml-2">Department</div>
                  <div className="w-12">&nbsp;</div>
                </div>

                {/* Table Rows */}
                {steps.map((step, index) => (
                  <div key={step.id} className="flex p-2 border-b items-center">
                    <div className="w-8">{step.id}</div>
                    <div className="flex-[2]">
                      {users && (
                        <select
                          className="w-full mt-1 p-2 border rounded"
                          required
                          onChange={(e) => {
                            const userExists = steps.find(
                              (item) => item.forwardTo === e.target.value
                            );
                            if (userExists === undefined) {
                              const selectedUser = users.find(
                                (user) =>
                                  user.user_id === Number(e.target.value)
                              );
                              const newSteps = [...steps];
                              ////debugger;
                              newSteps[index].forwardTo = e.target.value;
                              newSteps[index].department_name =
                                selectedUser?.department_name ||
                                "No Department";
                              setSteps(newSteps);
                            } else {
                              showAlert(
                                "This user is already added. Please select a different user."
                              );
                            }
                          }}
                          value={step.forwardTo}
                        >
                          <option value="">Select User</option>
                          {(users ?? []).map((item) => (
                            <option
                              key={item.user_id}
                              value={item.user_id?.toString()}
                            >
                              {item.first_name + " " + item.last_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex-[2] ml-2">
                      {step.department_name || "No Department"}
                    </div>
                    <div className="w-12">
                      {steps.length > 1 && (
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeStep(step.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add User Button */}
                <div className="flex justify-start p-2">
                  <button
                    className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200"
                    onClick={addStep}
                  >
                    <span className="mr-1">➕</span>
                    Add User
                  </button>
                </div>
                {/* Action Buttons */}
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => {
                      setIsReviewPopupVisible(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleReview}
                  >
                    {selectedOptionApp === "1" ? "Approve" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewIntake;
