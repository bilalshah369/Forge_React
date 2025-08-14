/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  FetchallProj,
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
import { GetGoals } from "../goals/Goals";
import { GetProgramsByGoalId } from "../goals/ManageProgram";
import { GetClasssifcation } from "@/utils/Masters";
import {
  GetBudgetDetails,
  GetDependentProjects,
  GetHistory,
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
import {
  convertUTCtoLocalDateOnly,
  formatAmountWithDollarSign,
} from "@/utils/util";
import {
  Delete_svg,
  Download_svg,
  Eye_svg,
  Save_svg,
  Send_approve_svg,
  Send_review_svg,
} from "@/assets/Icons";
import AlertBox from "@/components/ui/AlertBox";
import BudgetCalculationForm from "../budget/BudgetCalculationForm";
import ModalExample from "@/test/ModalExample";
import ROICalculationForm from "../budget/ROICalculationForm";
import { GetUserPermission } from "@/utils/Users";
import { decodeBase64 } from "@/utils/securedata";
import { GetExternalLinks } from "./ProjectProgress";

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
const ProjectView = () => {
  //const navigation = useNavigation();
  // { items, projectId, isEditable }
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [rows, setRows] = useState<any>([]);
  //debugger;
  //const isEditable = searchParams.get("isEditable");
  const [project, setProject] = useState<Project | null>(null);
  const [dependentProjects, setDependentProjects] = useState<any>();
  const [selectedDependentProjects, setSelectedDependentProjects] =
    useState("");
  const [projId, setProjId] = useState<any>("");
  const [permissions, setPermissions] = useState<number[]>([]);
  const [rOIPermission, setROIPermission] = useState<boolean>(false);
  const [budgetPermission, setBudgetPermission] = useState<boolean>(false);
  //-------------------------------------------Rushil's Code and States var new INtake------------------------------
  const [nameTitle, setNameTitle] = useState("");
  const [classification, setClassification] = useState("");
  const [goal, setGoal] = useState("");
  const [program, setProgram] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [businessOwnerDept, setBusinessOwnerDept] = useState<number>("");
  const [projectOwner, setProjectOwner] = useState("");
  const [projectOwnerDept, setProjectOwnerDept] = useState<number>("");
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

  const [businessProblem, setBusinessProblem] = useState("");
  const [scopeDefinition, setScopeDefinition] = useState("");
  const [keyAssumption, setKeyAssumption] = useState("");
  const [benefitsROI, setBenefitsROI] = useState("");

  const [selectedOption, setSelectedOption] = useState("");

  const [approvalPathid, setApprovalPathid] = useState("");

  const [goalSelected, setGoalSelected] = useState("");

  const [roi, setRoi] = useState("");
  const [risk, setRisk] = useState("");

  const [isApprovalPopupVisible, setIsApprovalPopupVisible] = useState(false);
  const [isReviewPopupVisible, setIsReviewPopupVisible] = useState(false);
  const [approvalPathidApp, setApprovalPathidApp] = useState("");
  const [selectedOptionApp, setSelectedOptionApp] = useState("2");
  const [steps, setSteps] = useState([
    { id: 1, forwardTo: "", designation: "", action: "", department_name: "" },
  ]);

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

  const [users, setUsers] = useState([]);
  const [headers, setHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Category",
      key: "category_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Sub-Category",
      key: "sub_category_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "",
      order_no: 0,
    },
    {
      label: "Function",
      key: "department_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Description",
      key: "description",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Quantity",
      key: "qty",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Cost ($)",
      key: "value",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Total ($)",
      key: "total",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "",
      order_no: 0,
    },
  ]);
  const [projectsExternalLinksHeader, setProjectsExternalLinksHeader] =
    useState<Header[]>([
      {
        label: "#",
        key: "sno",
        visible: true,
        type: "",
        column_width: "50",
        url: "",
        order_no: 0,
      },

      {
        label: "Project Id",
        key: "project_id",
        visible: true,
        type: "",
        column_width: "150",
        url: "",
        order_no: 0,
      },

      {
        label: "External Link",
        key: "link_url",
        visible: true,
        type: "link_url",
        column_width: "100",
        url: "",
        order_no: 0,
      },
      {
        label: "Description",
        key: "link_description",
        visible: true,
        type: "",
        column_width: "100",
        url: "",
        order_no: 0,
      },
    ]);
  const [approvalHistoryHeaders, setApprovalHistoryHeaders] = useState<
    Header[]
  >([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Sent By",
      key: "sent_from_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Sent To",
      key: "sent_to_name",
      visible: true,
      type: "",
      column_width: "150",
      url: "",
      order_no: 0,
    },

    {
      label: "Sent On",
      key: "created_at",
      visible: true,
      type: "date",
      column_width: "100",
      url: "",
      order_no: 0,
    },
    {
      label: "Status",
      key: "status_name",
      visible: true,
      type: "",
      column_width: "100",
      url: "",
      order_no: 0,
    },
    {
      label: "Comments",
      key: "comment",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
  ]);
  const [teamHeaders, setTeamHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Name",
      key: "resource_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Role",
      key: "role_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },

    {
      label: "Cost/hr",
      key: "actual_cost",
      visible: true,
      type: "cost",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Total hour(s)",
      key: "working_hours",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Proposed Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Proposed End Date",
      key: "end_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
    },
  ]);
  const [milestoneHeaders, setMilestoneHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Milestone Name",
      key: "milestone_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Priority",
      key: "priority",
      visible: true,
      type: "priority",
      column_width: "150",
      url: "",
      order_no: 0,
    },

    {
      label: "Description",
      key: "description",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Proposed Start Date",
      key: "start_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Proposed End Date",
      key: "end_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
    },
  ]);

  const [raidHeaders, setRaidHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Title",
      key: "title",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Type",
      key: "type",
      visible: true,
      type: "",
      column_width: "150",
      url: "",
      order_no: 0,
    },

    {
      label: "Priority",
      key: "priority_name",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Description",
      key: "description",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Status",
      key: "status",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Due Date",
      key: "due_date",
      visible: true,
      type: "date",
      column_width: "200",
      url: "",
      order_no: 0,
    },
  ]);

  const [customFieldsHeaders, setCustomFieldHeaders] = useState<Header[]>([
    {
      label: "#",
      key: "sno",
      visible: true,
      type: "sno",
      column_width: "50",
      url: "",
      order_no: 0,
    },

    {
      label: "Field Name",
      key: "project_custom_field_id",
      visible: true,
      type: "",
      column_width: "200",
      url: "",
      order_no: 0,
    },
    {
      label: "Value",
      key: "field_value",
      visible: true,
      type: "",
      column_width: "150",
      url: "",
      order_no: 0,
    },
  ]);

  const [approvers, setApprovers] = useState();

  const [formIsEditable, setFormIsEditable] = useState<boolean>(isEditable);
  const [actualBudget, setActualBudget] = useState("");
  const [budgetImpact, setBudgetImpact] = useState("");

  const [loading, setLoading] = useState(true);

  const [budgetData, setBudgetData] = useState<BudgetRow[]>([]);

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

  const [fileName, setFileName] = useState("");
  const [originalFileName, setOriginalFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [isBudgetEditable, setIsBudgetEditable] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyPageNo, setHistoryPageNo] = useState(1); // Current page
  const [historyRows, setHistoryRows] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1); // Total pages

  const [linksData, setLinksData] = useState<any[]>([]);
  const [dataLoading, setdataLoading] = useState<boolean>(true);
  const [linksPageNo, setLinksPageNo] = useState(1); // Current page
  const [linksRows, setLinksRows] = useState(10);
  const [linksTotalPages, setLinksTotalPages] = useState(1); // Total pages
  //const route = useRoutes();
  //const status = route.params?.status ?? null; Bilal
  const [projectROIData, setProjectROIData] = useState<any>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const [milestones, setMilestones] = useState<any[]>([]);
  const [raids, setRaids] = useState([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [project_task, setProject_task] = useState<any>({});
  const { labels } = { labels: {} }; //useLabels();
  const labelClassification = labels["classification_name"] || {
    display: "Classification",
    placeholder: "Enter Classification",
    dropdown: "Select Classification",
  };
  const labelApplication = labels["application_name"] || {
    display: "Application",
    placeholder: "Enter Application",
    dropdown: "Select Application",
  };
  const handleHistoryRowsChange = (rowsPerPage: number) => {
    setHistoryRows(rowsPerPage);
    fetchProjectHistory(parseInt(projectId), historyPageNo, rowsPerPage);
  };

  const handleLinksPageChange = (page: number) => {
    setLinksPageNo(page);
    fetchProjectsLinks(parseInt(projectId), page, linksRows);
  };

  const handleLinksRowsChange = (rowsPerPage: number) => {
    setLinksRows(rowsPerPage);
    fetchProjectsLinks(parseInt(projectId), linksPageNo, rowsPerPage);
  };

  const handleHistoryPageChange = (page: number) => {
    setHistoryPageNo(page);
    fetchProjectHistory(parseInt(projectId), page, historyRows);
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
            navigation("/IntakeList");
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
        showAlert("Please select a user to send for Approval");
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
            navigation("IntakeList");
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
  const fetchProjectHistory = async (
    project_id: number,
    page = historyPageNo,
    pageSize = historyRows
  ) => {
    try {
      const payload = {
        project_id: project_id,
        status_type: "",
        PageNo: page,
        PageSize: pageSize,
      };
      const res = await GetHistory(payload);
      const parsedRes = JSON.parse(res);
      if (parsedRes.status === "success") {
        const data = parsedRes.data;
        setHistoryData(data.project);
        const totalRecords = parsedRes.pagination.totalRecords;
        const totalPages = Math.ceil(totalRecords / pageSize);
        setHistoryTotalPages(totalPages);
      } else {
        console.log("error in project fetch:", parsedRes.message);
      }
    } catch (error) {
      console.error("Error fetching project history:", error);
    }
  };

  const fetchProjectsLinks = async (
    project_id: number,
    page = linksPageNo,
    pageSize = linksRows
  ) => {
    try {
      const response = await GetExternalLinks(project_id, page, pageSize);
      const parsedRes = JSON.parse(response);

      if (parsedRes.status === "success") {
        const data = parsedRes.data;
        setLinksData(data.project_links);
        const totalRecords = parsedRes.pagination.totalRecords;
        const totalPages = Math.ceil(totalRecords / pageSize);
        setLinksTotalPages(totalPages);
      } else {
        console.log("error in project fetch:", parsedRes.message);
      }
    } catch (err) {
      console.log("error in master fetch:", err);
    } finally {
      setdataLoading(false);
    }
  };
  const fetchUserPermission = async () => {
    // Start loading
    try {
      setLoading(true);
      //setPermissions([]);
      const userID = await localStorage.getItem("ID");

      const response = await GetUserPermission(decodeBase64(userID || ""));
      const parsedRes = JSON.parse(response);
      ////debugger;
      if (parsedRes.status === "success") {
        //console.log(`Permissions of ${userID} fetched successfully`, parsedRes);
        if (parsedRes.data.user_permissions.length > 0) {
          setPermissions(
            parsedRes.data.user_permissions.map((p) => p.permission_id)
          );
          for (const item of parsedRes.data.user_permissions) {
            //console.log(item.permission_name);
            if (
              item.permission_name === "View ROI" &&
              item.is_active === true
            ) {
              setROIPermission(true);
              ////console.log(`Found active item: ${item.name}`);
            }
            if (
              item.permission_name === "View Budget" &&
              item.is_active === true
            ) {
              setBudgetPermission(true);
              ////console.log(`Found active item: ${item.name}`);
            }
          }
        }
      } else {
        console.error(
          "Failed to fetch user roles:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
    } finally {
      setLoading(false); // End loading
    }
  };
  const location = useLocation();
  //const status = location.params?.status ?? null;

  const navigation = useNavigate();

  useEffect(() => {
    (async function () {
      fetchUserPermission();

      if (projectId) {
        await FetchallProj(projectId) // Assuming the query param is empty for now
          .then((response) => {
            console.log("project id:" + projectId);
            const parsedResponse = JSON.parse(response);
            const data = parsedResponse.data;
            setProjectROIData(data.project_roi);
            setTeamMembers(data.project_team);
            setMilestones(data.milestones);
            setRaids(data.raid);
            setCustomFields(data.project_custom_fields);
            setProject_task(data.project_task);
            setRows(data.budget_details);
            const matchedProject = data.project[0];
            // const projects = parsedResponse?.data?.projects || [];
            // const matchedProject = projects.find(
            //   (proj) => proj.project_id?.toString() === projectId
            // );
            setProject(matchedProject || null);
            //console.log('matched' + format(parseISO(matchedProject.start_date), 'yyyy-MM-dd'));
            //setInitialValues({
            setNameTitle(matchedProject.project_name || ""); // Default to empty string if missing
            setClassification(matchedProject.classification_name || ""); // Default to empty string if missing
            setGoalSelected(matchedProject.goal_name || "");
            setProgram(matchedProject.program_name || "");
            setBusinessOwner(
              matchedProject.business_stakeholder_user_name || ""
            );
            setBusinessOwnerDept(
              matchedProject.business_stakeholder_dept_name || ""
            );
            setProjectOwner(matchedProject.project_owner_user_name || "");
            setProjectOwnerDept(matchedProject.project_owner_dept_name || "");
            setProjectManager(matchedProject.project_manager_name || "");
            setImpactedFunction(matchedProject.impacted_function_name || "");
            setImpactedApp(matchedProject.application_name || "");
            setPriority(
              matchedProject.priority === 1
                ? "Critical"
                : matchedProject.priority === 2
                ? "High"
                : matchedProject.priority === 3
                ? "Medium"
                : matchedProject.priority === 4
                ? "Low"
                : "--"
            );
            setBudget(
              matchedProject.budget_size === "1"
                ? "High"
                : matchedProject.budget_size === "2"
                ? "Medium"
                : matchedProject.budget_size === "3"
                ? "Low"
                : "--"
            );
            setProjectSize(
              matchedProject.project_size === "1"
                ? "Large"
                : matchedProject.project_size === "2"
                ? "Medium"
                : matchedProject.project_size === "3"
                ? "Small"
                : "--"
            );
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
            setActualBudget(
              formatAmountWithDollarSign(matchedProject.actual_budget) || ""
            );
            setBudgetImpact(matchedProject.budget_impact_name || "");
            setFileName(matchedProject.attachment || "");
            if (
              matchedProject.attachment !== "" &&
              matchedProject.attachment !== null
            ) {
              setUploadSuccess(true);
            }
            setOriginalFileName(matchedProject.roi_orig_file || "");
            setSelectedDependentProjects(
              matchedProject.dependent_project_names
            );

            console.log("Applications to be send are", impactedFunction);
          })
          .catch((error) => {
            console.error("Error fetching project:", error);
          });
        loadBudgetData(projectId);
        fetchProjectHistory(parseInt(projectId));
        // fetchProjectsLinks(parseInt(projectId));
      }
      setLoading(false);
    })();
  }, [location]); // Runs again on location change
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <form>
          <div className="p-6 bg-gray-50 rounded-md shadow-lg">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              {/* Row 1 */}
              <div className="col-span-1">
                <label className="block text-sm font-bold">Project Name</label>
                <p className="mt-1 p-2 ">{nameTitle || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold">
                  Classification
                </label>
                <p className="mt-1 p-2 ">{classification || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">Priority</label>
                <p className="mt-1 p-2 ">{priority || "-"}</p>
              </div>

              {/* Row 2 */}
              <div className="col-span-1">
                <label className="block text-sm font-bold ">Goal</label>
                <p className="mt-1 p-2 ">{goalSelected || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">Program</label>
                <p className="mt-1 p-2 ">{program || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">Project Size</label>
                <p className="mt-1 p-2 ">{projectSize || "-"}</p>
              </div>

              {/* Row 3 */}
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Impacted Function
                </label>
                <p className="mt-1 p-2 ">{impactedFunction || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Impacted Application
                </label>
                <p className="mt-1 p-2 ">{impactedApp || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Dependent Projects
                </label>
                <p className="mt-1 p-2 ">
                  {/* {dependent_project_names || "-"} */}
                </p>
              </div>

              {/* Row 4 */}
              <div className="col-span-1">
                <label className="block text-sm font-bold ">Budget</label>
                <p className="mt-1 p-2 ">{budget || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Estimated Budget ($)
                </label>
                <p className="mt-1 p-2 ">{actualBudget || "-"}</p>
              </div>
            </div>
          </div>

          {permissions.includes(41) && (
            <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
              <h2 className="text-lg font-semibold text-blue-600 mb-4">
                Budget Calculation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
                <div className="col-span-3">
                  <AdvancedDataTable
                    isfilter1={false}
                    data={rows}
                    columns={headers}
                    title="Budget"
                    exportFileName="Budget"
                    isCreate={false}
                    onCreate={() => navigation("/NewIntake")}
                    isPagingEnable={true}
                    data_type={"Budget"}
                    isColumnVisibility={false}
                    isDownloadExcel={false}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Project Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Proposed Start Date
                </label>
                <p className="mt-1 p-2 bg-gray-100">
                  {startDate ? new Date(startDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Proposed End Date
                </label>
                <p className="mt-1 p-2 bg-gray-100">
                  {endDate ? new Date(endDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">Go-live Date</label>
                <p className="mt-1 p-2 bg-gray-100">
                  {goLiveDate ? new Date(goLiveDate).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Stake Holders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Business Owner
                </label>
                <p className="mt-1 p-2 ">{businessOwner || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Bussiness Owner Department
                </label>
                <p className="mt-1 p-2 ">{businessOwnerDept ?? ""}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Project Manager
                </label>
                <p className="mt-1 p-2 ">{projectManager || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Project Owner
                </label>
                <p className="mt-1 p-2 ">{projectOwner || "-"}</p>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-bold ">
                  Project Owner Department
                </label>
                <p className="mt-1 p-2 ">{projectOwnerDept ?? ""}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Return on Investment
            </h2>
            {permissions.includes(40) ? (
              <div>
                {projectROIData.roi_percent &&
                projectROIData.roi_percent !== "0" &&
                projectROIData.roi_percent !== "" ? (
                  <>
                    {/* First row */}
                    <div className="flex gap-4 mb-4">
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">CapEx ($)</span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.total_capex
                            ? formatAmountWithDollarSign(
                                projectROIData.total_capex
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">OpEx ($)</span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.total_opex
                            ? formatAmountWithDollarSign(
                                projectROIData.total_opex
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          Total Investment ($)
                        </span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.total_investment
                            ? formatAmountWithDollarSign(
                                projectROIData.total_investment
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Second row */}
                    <div className="flex gap-4 mb-4">
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          Gross Annual Benefits ($)
                        </span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.annual_benefits
                            ? formatAmountWithDollarSign(
                                projectROIData.annual_benefits
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          Annual Operating Cost ($)
                        </span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.annual_cost
                            ? formatAmountWithDollarSign(
                                projectROIData.annual_cost
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          Net Annual Benefits ($)
                        </span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.net_annual_benefits
                            ? formatAmountWithDollarSign(
                                projectROIData.net_annual_benefits
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Third row */}
                    <div className="flex gap-4">
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">ROI (%)</span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.roi_percent
                            ? `${projectROIData.roi_percent}%`
                            : "0%"}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          Break-even Period (Years)
                        </span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.breakeven_point || ""}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          Payback Period (Years, Months)
                        </span>
                        <span className="mt-1 p-2 border rounded bg-gray-100">
                          {projectROIData.payback_period || ""}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4 bg-white p-4 rounded">
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium">
                        Approx ROI (%)
                      </label>
                      <span className="mt-1 p-2 border rounded bg-gray-100">
                        {rOIPermission
                          ? roi?.toString() ?? ""
                          : "No permission to view"}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1" />
                    <div className="flex flex-col flex-1" />
                  </div>
                )}
              </div>
            ) : (
              <span className="mt-1 p-2 border rounded bg-gray-100">
                No Permission to View
              </span>
            )}
          </div>

          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Project Drivers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded">
              {/* Row 1 */}
              <div>
                <label className="block text-sm font-bold ">
                  Business Problem/Description
                </label>
                <p className="mt-1 p-2 ">{businessProblem || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-bold ">
                  Scope Definition
                </label>
                <p className="mt-1 p-2 ">{scopeDefinition || "-"}</p>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-bold ">
                  Key Assumption
                </label>
                <p className="mt-1 p-2 ">{keyAssumption || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-bold ">Benefits/ROI</label>
                <p className="mt-1 p-2 ">{benefitsROI || "-"}</p>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-bold ">Risk</label>
                <p className="mt-1 p-2 ">{risk || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-bold ">
                  Budget Impact
                </label>
                <p className="mt-1 p-2 ">{budgetImpact || "-"}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
              <div className="col-span-2">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Review/Approval History
                </h2>
                <AdvancedDataTable
                  isfilter1={false}
                  data={historyData}
                  columns={approvalHistoryHeaders}
                  isPagingEnable={true}
                  data_type={"Budget"}
                  isColumnVisibility={false}
                  isDownloadExcel={false}
                  PageNo={historyPageNo}
                  TotalPageCount={historyTotalPages}
                  rowsOnPage={historyRows}
                  onrowsOnPage={handleHistoryRowsChange}
                  onPageChange={function (worker: number): void {
                    handleHistoryPageChange(worker);
                  }}
                />
              </div>
              <div className="col-span-2">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  External Links
                </h2>
                <AdvancedDataTable
                  isfilter1={false}
                  data={linksData}
                  columns={projectsExternalLinksHeader}
                  isPagingEnable={true}
                  data_type={"Budget"}
                  isColumnVisibility={false}
                  isDownloadExcel={false}
                  PageNo={linksPageNo}
                  TotalPageCount={linksTotalPages}
                  rowsOnPage={linksRows}
                  onrowsOnPage={handleLinksRowsChange}
                  onPageChange={function (worker: number): void {
                    handleLinksPageChange(worker);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Team Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-3">
                <AdvancedDataTable
                  isfilter1={false}
                  data={teamMembers}
                  columns={teamHeaders}
                  title="Budget"
                  exportFileName="Budget"
                  isCreate={false}
                  onCreate={() => navigation("/NewIntake")}
                  isPagingEnable={true}
                  data_type={"Budget"}
                  isColumnVisibility={false}
                  isDownloadExcel={false}
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Milestones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-3">
                <AdvancedDataTable
                  isfilter1={false}
                  data={milestones}
                  columns={milestoneHeaders}
                  title="Budget"
                  exportFileName="Budget"
                  isCreate={false}
                  onCreate={() => navigation("/NewIntake")}
                  isPagingEnable={true}
                  data_type={"Budget"}
                  isColumnVisibility={false}
                  isDownloadExcel={false}
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">RAID</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-3">
                <AdvancedDataTable
                  isfilter1={false}
                  data={raids}
                  columns={raidHeaders}
                  title="Budget"
                  exportFileName="Budget"
                  isCreate={false}
                  onCreate={() => navigation("/NewIntake")}
                  isPagingEnable={true}
                  data_type={"Budget"}
                  isColumnVisibility={false}
                  isDownloadExcel={false}
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
              <div className="col-span-2">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Recent Accomplishments
                </h2>
                <p className="mt-1 p-2 ">
                  {project_task.accomplishment || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Upcoming Key Activities
                </h2>
                <p className="mt-1 p-2 ">{project_task.upcoming_task || "-"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-md shadow-md mt-5">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              Custom Fields
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded">
              <div className="col-span-3">
                <AdvancedDataTable
                  isfilter1={false}
                  data={customFields}
                  columns={customFieldsHeaders}
                  title="Budget"
                  exportFileName="Budget"
                  isCreate={false}
                  onCreate={() => navigation("/NewIntake")}
                  isPagingEnable={true}
                  data_type={"Budget"}
                  isColumnVisibility={false}
                  isDownloadExcel={false}
                />
              </div>
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
            projectId={parseInt(projectId)}
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
            <div className="relative w-full max-w-2xl  rounded-xl p-6 shadow-lg">
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Select User for Approval{" "}
                    </label>
                    {/* Replace this with your actual component */}
                    <div className="w-2/3">
                      {/* MultiFeatureDropdown component */}
                      {/* Assume it supports similar props in Web */}

                      <select
                        className="w-full mt-1 p-2 border rounded"
                        required
                        onChange={(e) => setApprovalPathidApp(e.target.value)}
                        value={classification}
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
              <div className="relative w-full max-w-2xl  rounded-xl p-6 shadow-lg">
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
                              //debugger;
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

export default ProjectView;
