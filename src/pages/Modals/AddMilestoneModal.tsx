/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

import { DatePicker } from "rsuite";
import { format } from "date-fns";
import {
  GetApprovedProjects,
  GetMilestones,
  GetMilestonesResource,
  GetTeamMembers,
  InsertMilestone,
  InsertMilestoneMember,
  InsertMilestoneMemberMultiple,
  MilestoneChangeRequest,
} from "../../utils/ApprovedProjects";

import { GetRoles } from "../../utils/RoleMaster";
// import "react-datepicker/dist/react-datepicker.css";

import { Checkbox_svg, Checkbox_unchecked_svg } from "../../assets/Icons";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/themes/ThemeProvider";
import { X } from "lucide-react";

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: any;
  milestone: any;
  isEditable: any;
  isProgress: boolean;
  changeRequest: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  startDate: string;
  isActive: boolean;
}

interface MilestoneData {
  name: string;
  shortName: string;
  priority: string;
  description: string;
  proposedStartDate: string;
  proposedEndDate: string;
  revisedEndDate: string;
  projectId: any;
  milestone_id: string;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  visible,
  onClose,
  projectId,
  milestone,
  isEditable,
  isProgress,
  changeRequest,
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isMilestoneSubmitModalVisible, setMilestoneSubmitModalVisible] =
    useState(false);
  const [startDateDisplay, setStartDateDisplay] = useState();
  const [startDate, setStartDate] = useState<any>();
  const [rawStartDate, setRawStartDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [rawEndDate, setRawEndDate] = useState(null);
  const [endDateDisplay, setEndDateDisplay] = useState();
  const [endDate, setEndDate] = useState<any>();
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [milestoneData, setMilestoneData] = useState<MilestoneData | null>({
    name: "",
    shortName: "",
    priority: "",
    description: "",
    proposedStartDate: "",
    proposedEndDate: "",
    revisedEndDate: "",
    projectId: "",
    milestone_id: "",
  });
  // useEffect(() => {
  //   if (!visible) {
  //     resetStates();
  //   }
  // }, [visible]);
  const handleClose = () => {
    resetStates();

    onClose();
  };
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    shortName: "",
    priority: "",
    description: "",
    startDate: "",
    endDate: "",
    revisedDate: "",
  });
  const validateForm = () => {
    const errors: any = {};

    if (!milestoneData?.name) {
      errors.name = "Title is required";
    }

    // if (!milestoneData.shortName || milestoneData.shortName.length > 10)
    //   errors.shortName = 'Short name required (max 10 characters)';

    if (!milestoneData?.priority) errors.priority = "Priority is required";

    // if (!milestoneData.description || milestoneData.description.length < 10)
    //   errors.description = 'Description required (min 10 characters)';
    // if (milestoneData?.description?.length > 50)
    //   errors.description = 'Description should be less than 50 characters';

    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (
      isProgress &&
      revEndDate &&
      new Date(revEndDate) < new Date(startDate)
    ) {
      errors.revisedDate = "Revised end date cannot be before start date";
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate))
      errors.endDate = "End date cannot be before start date";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const resetStates = () => {
    //setIsEditing(false);
    setMilestoneData({
      milestone_id: "",
      projectId: projectId || "",
      name: "",
      shortName: "",
      priority: "",
      description: "",
      proposedStartDate: "",
      proposedEndDate: "",
      revisedEndDate: "",
    });

    setStartDateDisplay("");
    setEndDateDisplay("");
    setRevEndDateDisplay("");
    setStartDate("");
    setEndDate("");
    setRevEndDate("");
    setSelectedMembers([]);
    setActiveMenu(null);
    setMilestoneSubmitModalVisible(false);
  };

  const [isInvalidDateModalVisible, setIsInvalidDateModalVisible] =
    useState(false);
  const [invalidDateDetails, setInvalidDateDetails] = useState({
    selectedDate: "",
    projectStartDate: "",
    projectEndDate: "",
  });

  const handleCheckboxChange = (resourceId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(resourceId)
        ? prevSelected.filter((id) => id !== resourceId)
        : [...prevSelected, resourceId]
    );
  };
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );

  const [milestones, setMilestones] = useState<any[]>([]);
  const [approvedProjects, setAprovedProjects] = useState<any[]>([]);
  const [milestoneRes, setmilestoneRes] = useState<any[]>([]);

  const handleDateChange = (date) => {
    const project = approvedProjects[0]; // Assuming a single project
    if (project && date) {
      // Parse and normalize dates to midnight
      const projectStartDate = new Date(project.start_date);
      const projectEndDate = new Date(project.end_date);

      projectStartDate.setHours(0, 0, 0, 0); // Normalize start date
      projectEndDate.setHours(0, 0, 0, 0); // Normalize end date
      date.setHours(0, 0, 0, 0); // Normalize selected date

      //console.log('Normalized Project Start Date:', projectStartDate);
      //console.log('Normalized Project End Date:', projectEndDate);
      //console.log('Normalized Selected Date:', date);

      // Validation
      if (date < projectStartDate || date > projectEndDate) {
        //console.log(
        // `Invalid date: ${date}. Must be between ${projectStartDate} and ${projectEndDate}.`,
        // );

        setIsInvalidDateModalVisible(true); // Show modal
        setInvalidDateDetails({
          selectedDate: format(date, "MM/dd/yyyy"),
          projectStartDate: format(projectStartDate, "MM/dd/yyyy"),
          projectEndDate: format(projectEndDate, "MM/dd/yyyy"),
        });

        return;
      }

      //console.log('Valid date selected:', date);
    }

    // Update the state
    // setRawStartDate(date);
    // setStartDateDisplay(date); // Format for display
    setStartDate(date); // Format for storage
    // setShowStartDatePicker(false); // Close the picker
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      startDate: date ? "" : "Start date is required",
    }));
  };

  const handleEndDateChange = (date) => {
    const project = approvedProjects[0]; // Assuming a single project
    if (project && date) {
      // Parse and normalize dates to midnight
      const projectStartDate = new Date(project.start_date);
      const projectEndDate = new Date(project.end_date);

      projectStartDate.setHours(0, 0, 0, 0); // Normalize start date
      projectEndDate.setHours(0, 0, 0, 0); // Normalize end date
      date.setHours(0, 0, 0, 0); // Normalize selected date

      //console.log('Normalized Project Start Date:', projectStartDate);
      //console.log('Normalized Project End Date:', projectEndDate);
      //console.log('Normalized Selected End Date:', date);

      // Validation
      if (date < projectStartDate || date > projectEndDate) {
        //console.log(
        //   `Invalid end date: ${date}. Must be between ${projectStartDate} and ${projectEndDate}.`,
        //);

        setIsInvalidDateModalVisible(true); // Show modal
        setInvalidDateDetails({
          selectedDate: format(date, "MM/dd/yyyy"),
          projectStartDate: format(projectStartDate, "MM/dd/yyyy"),
          projectEndDate: format(projectEndDate, "MM/dd/yyyy"),
        });

        return;
      }

      //console.log('Valid end date selected:', date);
    }

    // Update the state
    // setRawEndDate(date);
    // setEndDateDisplay(date); // Format for display
    setEndDate(date); // Format for storage
    // setShowEndDatePicker(false); // Close the picker
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      endDate: date ? "" : "End date is required",
    }));
  };

  const [rawRevEndDate, setRawRevEndDate] = useState(null);
  const [revEndDateDisplay, setRevEndDateDisplay] = useState<any>();
  const [revEndDate, setRevEndDate] = useState("");

  const handleRevEndDateChange = (date) => {
    const project = approvedProjects[0]; // Assuming a single project
    if (project && date) {
      // Parse and normalize dates to midnight
      const projectStartDate = new Date(project.start_date);
      const projectEndDate = new Date(project.end_date);

      projectStartDate.setHours(0, 0, 0, 0); // Normalize start date
      projectEndDate.setHours(0, 0, 0, 0); // Normalize end date
      date.setHours(0, 0, 0, 0); // Normalize selected date

      // Validation
      if (date < projectStartDate || date > projectEndDate) {
        setIsInvalidDateModalVisible(true); // Show modal
        setInvalidDateDetails({
          selectedDate: format(date, "MM/dd/yyyy"),
          projectStartDate: format(projectStartDate, "MM/dd/yyyy"),
          projectEndDate: format(projectEndDate, "MM/dd/yyyy"),
        });

        return;
      }
    }

    // Update the state
    setRawRevEndDate(date);
    setRevEndDateDisplay(format(date, "MM/dd/yyyy")); // Format for display
    setRevEndDate(format(date, "yyyy-MM-dd")); // Format for storage
    setShowRevDatePicker(false); // Close the picker
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      endDate: date ? "" : "End date is required",
    }));
  };

  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const handleInputChange = (field: keyof MilestoneData, value: string) => {
    setMilestoneData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      // Name validation: Required, min 3 characters
      if (field === "name") {
        newErrors.name = value.length === 0 ? "Title is required" : "";
      }

      // Short Name validation: Required, max 10 characters
      // if (field === 'shortName') {
      //   newErrors.shortName =
      //     value.length > 10 ? 'Short name must be max 10 characters' : '';
      // }

      // Priority validation: Required
      if (field === "priority") {
        newErrors.priority = value === "" ? "Priority is required" : "";
      }

      // Description validation: Required, min 10 characters
      // if (field === 'description') {
      //   newErrors.description =
      //     value.length < 0 ? 'Description required (min 10 characters)' : '';
      // }

      return newErrors;
    });
  };

  const handleSubmit = async () => {
    //debugger;
    console.log("🚀 Starting handleSubmit...");

    if (!validateForm()) {
      console.log("❌ Form validation failed. Exiting...");
      return;
    }

    if (isSubmitting) {
      console.log("⏳ Submission is already in progress. Exiting...");
      return;
    }

    setIsSubmitting(true);
    console.log("Final Start Date:", startDate);
    console.log("Final End Date:", endDate);
    console.log("Final Revised End Date:", revEndDate || "Not Provided");

    const isUpdating = isEditable && milestoneData?.milestone_id;

    // If editing a change request, ensure we update the existing change request, not create a new one
    let payload: any = {
      project_id: projectId,
      short_name: milestoneData?.shortName,
      milestone_name: milestoneData?.name,
      priority: milestoneData?.priority,
      description: milestoneData?.description,
      start_date: startDate?.toLocaleDateString("en-CA"),
      end_date: endDate?.toLocaleDateString("en-CA"),
      milestone_id: milestoneData?.milestone_id ?? 0,
    };

    if (revEndDate) {
      payload.revised_end_date = revEndDate?.toLocaleDateString("en-CA");
    }

    if (changeRequest) {
      // If editing an existing change request, pass change_request_id
      if (milestone && milestone.change_request_id) {
        payload.change_request_id = milestone.change_request_id;
      }
      Object.assign(payload, {
        sent_to: "",
        action: "",
        comment: "",
      });
    }

    try {
      const response = changeRequest
        ? await MilestoneChangeRequest(payload)
        : await InsertMilestone(payload);

      const parsedResponse = JSON.parse(response);

      if (parsedResponse?.status === "success") {
        const createdMilestoneId =
          parsedResponse.data?.milestone_id || milestoneData.milestone_id;

        setSuccessMessage(
          changeRequest
            ? "Change request updated successfully!"
            : isUpdating
            ? "Milestone updated successfully!"
            : "Milestone added successfully!"
        );

        //Alert.alert("Success", successMessage);

        setMilestoneData((prev) => ({
          ...prev,
          milestone_id: createdMilestoneId,
        }));

        if (!changeRequest) {
          handleMemberSubmit(createdMilestoneId);
        }

        setMilestoneSubmitModalVisible(true);
      } else {
        //Alert.alert("Failed", "Failed to submit. Please try again.");
        setMilestoneSubmitModalVisible(false);
      }
    } catch (error) {
      console.error("Error submitting:", error);
      //Alert.alert("Error", "An error occurred. Please try again.");
      setMilestoneSubmitModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSubmit = async (milestoneId) => {
    try {
      const milestoneResources = selectedMembers
        ?.map((memberId) => {
          const member = teamMembers.find((m) => m.resource_id === memberId);

          if (!member) {
            console.error(`No member found for resource_id: ${memberId}`);
            return null;
          }

          const today = new Date().toISOString().split("T")[0];

          return {
            milestone_id: milestoneId,
            project_id: projectId,
            resource_id: member.resource_id,
            role_id: member.role_id,
            start_date: member.start_date || today,
            end_date: member.end_date || today,
            availability_percentage: 100,
            actual_cost: 0,
            isExternal: false,
            status: 1,
            is_active: true,
          };
        })
        .filter(Boolean);

      const response = await InsertMilestoneMemberMultiple({
        milestoneResources,
      });
      const parsedResponse = JSON.parse(response);

      if (parsedResponse?.status === "success") {
      } else {
        //throw new Error(parsedResponse?.message || "Failed to add members.");
      }
    } catch (error) {
      console.error("Error associating members:", error);
    }
  };

  const handleCloseSuccessModal = () => {
    setMilestoneSubmitModalVisible(false);
    onClose();
  };

  const handleRemoveMember = (id: number) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    setActiveMenu(null);
  };

  const handleAddMember = (memberData: Omit<TeamMember, "id">) => {
    setTeamMembers((prev) => [...prev, { id: prev.length + 1, ...memberData }]);
  };

  const FetchMilestones = async (projectId) => {
    try {
      const response = await GetMilestones(projectId); // Pass projectId here
      const parsedRes = JSON.parse(response);
      //console.log('Get Projects Response:', response);

      if (parsedRes?.status === "success" && Array.isArray(parsedRes.data)) {
        setMilestones(parsedRes.data); // Update the state with the fetched data
      } else {
        console.error("Invalid or empty data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Fetch data or refresh the screen every time it gains focus
  //     FetchMilestones(projectId);
  //   }, []),
  // );
  const datePickerStartRef = useRef(null);
  const datePickerEndRef = useRef(null);
  const datePickerRevRef = useRef(null);
  const [showRevDatePicker, setShowRevDatePicker] = useState(false);

  const FetchProjectDetails = async (prjId: any) => {
    try {
      const response = await GetApprovedProjects({ projectId: prjId }); // Pass projectId here
      const parsedRes = JSON.parse(response);
      //console.log('Get Projects Response:', response);

      if (
        parsedRes?.status === "success" &&
        Array.isArray(parsedRes.data.projects)
      ) {
        setAprovedProjects(parsedRes.data.projects);
      } else {
        console.error("Invalid or empty data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const validateDates = () => {
    const project = approvedProjects[0];
    if (project) {
      const projectStartDate = new Date(project.start_date);
      const projectEndDate = new Date(project.end_date);

      if (
        new Date(startDate) < projectStartDate ||
        new Date(startDate) > projectEndDate
      ) {
        return false;
      }

      if (
        new Date(endDate) < projectStartDate ||
        new Date(endDate) > projectEndDate
      ) {
        return false;
      }
    }
    return true;
  };

  const handleAddMemberClickonsubmit = () => {
    const milestoneId = milestoneData.milestone_id;

    if (!milestoneId) {
      return;
    }

    setSelectedMilestone(milestoneId);

    //console.log('Selected Milestone ID for Add Member:', milestoneId);

    setAddMemberModalVisible(true);
  };
  const handleAddMemberClick = () => {
    const milestoneId = milestoneData.milestone_id;

    setSelectedMilestone(milestoneId);

    //console.log('Selected Milestone ID for Add Member:', milestoneId);

    setAddMemberModalVisible(true);
  };

  const FetchMilestonesRes = async (milestoneId) => {
    try {
      const response = await GetMilestonesResource(milestoneId);
      const parsedRes = JSON.parse(response);

      //console.log('Get Projects Response:', parsedRes);

      if (parsedRes?.status === "success" && Array.isArray(parsedRes.data)) {
        setmilestoneRes(parsedRes.data); // Update milestone resource state

        // Update selected members based on milestone resources
        const selectedResourceIds = parsedRes.data.map(
          (item) => item.resource_id
        );
        setSelectedMembers(selectedResourceIds); // Preselect members
      } else {
        console.error("Invalid or empty data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTeam = async (projectId) => {
    try {
      const response = await GetTeamMembers(projectId);
      const parsedRes = JSON.parse(response);
      //console.log('Get Projects Response:', response);

      if (parsedRes?.status === "success" && Array.isArray(parsedRes.data)) {
        const activeTeamMembers = parsedRes.data.filter(
          (member) => member.is_active
        );
        setTeamMembers(activeTeamMembers);
      } else {
        console.error("Invalid or empty data");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const GetRole = async () => {
    try {
      const response = await GetRoles("");
      //console.log(response);
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        setRoles(parsedRes.data.roles); // Set the fetched members
      } else {
        console.error(
          "Failed to fetch users:",
          parsedRes.message || "Unknown error"
        );
      }
    } catch (err) {
      //console.log('Error Fetching Users', err);
    }
  };
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.role_id === roleId); // Find role by role_id
    return role ? role.role_name : "Unknown Role"; // Return role_name or fallback
  };
  const handleAlphabetChange = (field, text) => {
    const onlyAlphabets = text.replace(/[^a-zA-Z ]/g, ""); // Allow only letters and spaces
    handleInputChange(field, text);
  };
  // useEffect(() => {
  //   if (milestone && milestone.milestone_id) {
  //     //console.log('Fetching resources for milestone:', milestone.milestone_id);
  //     FetchMilestonesRes(milestone.milestone_id);
  //   }
  // }, [milestone]);
  const [submitted, setSubmitted] = useState(false);
  const {theme} =useTheme();
  useEffect(() => {
    if (visible) {
      FetchMilestones(projectId);
      GetRole();
      fetchTeam(projectId);
      FetchProjectDetails(projectId);
      //////////debugger;
      if (milestone) {
        setMilestoneData({
          milestone_id: milestone.milestone_id,
          projectId: milestone.project_id || "",
          name: milestone.milestone_name,
          shortName: milestone.short_name,
          priority: milestone.priority,
          description: milestone.description || milestone.milestone_description,
          proposedStartDate: milestone.start_date,
          proposedEndDate: milestone.end_date,
          revisedEndDate: milestone.revised_end_date,
        });
        setStartDate(new Date(milestone.start_date));
        setEndDate(new Date(milestone.end_date));
        FetchMilestonesRes(milestone.milestone_id);
      } else {
        //setMilestoneData(null);
        setMilestoneData({
          milestone_id: "",
          projectId: "",
          name: "",
          shortName: "",
          priority: "",
          description: "",
          proposedStartDate: "",
          proposedEndDate: "",
          revisedEndDate: "",
        });
        setStartDate("");
        setEndDate("");
      }
      //setWorkingHr(member.workinghours);
      //console.log('selecteed role', selectedMember.role_id);

      //setRawEndDate(member.end_date);
    }
    //console.log('Selected Role in state:', role);
  }, [visible, projectId, milestone, isEditable]);

  if (!visible) {
    return null;
  }
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-md shadow-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-center mb-6">
            
          </h2>
 <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-center flex-1">
             {isEditable ? "Edit Milestone" : "Add New Milestone"}
          </h2>
          <button
          type="button"
            onClick={() => {
                 onClose();
                }}
            className="top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
          {/* Form */}
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              handleSubmit();

              handleAddMemberClickonsubmit();
            }}
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium">
                Name/Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                value={milestoneData?.name}
                onChange={(e) => handleAlphabetChange("name", e.target.value)}
                required
              />

              {submitted && !milestoneData.name && (
                <p className="text-red-500 text-sm mt-1">Title is required</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium">
                Priority
                <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={milestoneData?.priority}
                onChange={(e) => {
                  // handleChange("role", e.target.value);
                  handleInputChange("priority", e.target.value);
                }}
                required
              >
                <option value="">Select Priority</option>
                {[
                  {
                    label: "High",
                    value: "3",
                  },
                  {
                    label: "Medium",
                    value: "2",
                  },
                  {
                    label: "Low",
                    value: "1",
                  },
                ].map((item) => (
                  <option value={item.value?.toString()}>{item.label}</option>
                ))}
              </select>
              {submitted && !milestoneData.priority && (
                <p className="text-red-500 text-sm mt-1">
                  Priority is required
                </p>
              )}
            </div>

            {/* Cost/Hour */}
            <div className="col-span-2">
              <label className="block text-sm font-medium">Description</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded"
                value={milestoneData?.description}
                onChange={(e) =>
                  handleAlphabetChange("description", e.target.value)
                }
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium">
                Proposed Start Date <span className="text-red-500">*</span>
              </label>
              {/* <input
              type="date"
              className="w-full mt-1 p-2 border rounded"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
            /> */}
              <DatePicker
                oneTap
                appearance="default"
                value={startDate}
                onChange={(date) => {
                  handleDateChange(date); // Handle date change
                }}
                format="MM/dd/yyyy"
                className="w-full"
                placement="bottomEnd"
                placeholder="mm/dd/yyyy"
                editable={false}
              />
              {submitted && !startDate && (
                <p className="text-red-500 text-sm mt-1">
                  Start date is required
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium">
                Proposed End Date <span className="text-red-500">*</span>
              </label>
              {/* <input
              type="date"
              className="w-full mt-1 p-2 border rounded"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              required
            /> */}
              <DatePicker
                oneTap
                appearance="default"
                value={endDate}
                onChange={(date) => {
                  handleEndDateChange(date); // Handle date change
                }}
                format="MM/dd/yyyy"
                className="w-full"
                placement="bottomEnd"
                placeholder="mm/dd/yyyy"
                editable={false}
              />
              {submitted && !endDate && (
                <p className="text-red-500 text-sm mt-1">
                  End date is required
                </p>
              )}
            </div>
            <div className="col-span-2">
              <AdvancedDataTable
                data={teamMembers}
                checkEnable={true}
                onCheckChange={function (worker: number): void {
                  handleCheckboxChange(worker);
                  console.log(selectedMembers);
                }}
                columns={[
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
                    label: "[]",
                    key: "resource_id",
                    visible: true,
                    type: "check",
                    column_width: "50",
                    url: "",
                    order_no: 0,
                  },

                  {
                    label: "Member Name",
                    key: "resource_name",
                    visible: true,
                    type: "",
                    column_width: "200",
                    url: "",
                    order_no: 0,
                  },
                  {
                    label: "Role",
                    key: "role_id",
                    visible: true,
                    type: "",
                    column_width: "200",
                    url: "",
                    order_no: 0,
                  },

                  {
                    label: "Actual Cost/hr",
                    key: "actual_cost",
                    visible: true,
                    type: "cost",
                    column_width: "200",
                    url: "",
                    order_no: 0,
                  },
                ]}
                PageNo={1}
                TotalPageCount={1}
                rowsOnPage={100}
                data_type={"Team Member"}
              />
            </div>
            {/* Actions */}
            <div className="col-span-2 flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2  text-white rounded"  style={{backgroundColor:theme.colors.drawerBackgroundColor}}
                onClick={() => {
                  setSubmitted(true);
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {isInvalidDateModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            {/* <p className="text-lg font-semibold text-red-600 mb-4">Invalid Date Selection</p> */}
            <p className="text-gray-800 mb-2">
              Selected Date:{" "}
              <span className="font-semibold">
                {invalidDateDetails.selectedDate}
              </span>
            </p>
            <p className="text-gray-800 mb-2">
              Project Date:{" "}
              <span className="font-semibold">
                {invalidDateDetails.projectStartDate} to{" "}
                {invalidDateDetails.projectEndDate}
              </span>
            </p>
            <p className="text-gray-800 mb-4">
              Please select a date between this range only
            </p>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => setIsInvalidDateModalVisible(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isMilestoneSubmitModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <p className="text-lg font-medium text-gray-800">
              {successMessage}
            </p>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => {
                resetStates();
                handleClose();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};
