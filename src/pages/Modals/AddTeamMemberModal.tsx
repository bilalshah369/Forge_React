/* eslint-disable @typescript-eslint/no-explicit-any */
import AlertBox from "@/components/ui/AlertBox";
import {
  GetApprovedProjects,
  InsertMember,
  MemberChangeRequest,
} from "@/utils/ApprovedProjects";
import { GetResources } from "@/utils/Resource";
import { GetRoles } from "@/utils/RoleMaster";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DatePicker } from "rsuite";

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onSubmit,
  member,
  changeRequest,
  isEditing,
}) {
  const [form, setForm] = useState({
    member: "",
    role: "",
    costPerHour: "",
    allocation: "",
    startDate: "",
    endDate: "",
    actual_cost: "",
    working_hours: "",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isEditable = searchParams.get("isEditable") === "true";
  const status = parseInt(searchParams.get("status") ?? "");
  const [Membername, setMemberName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [memberId, setMemberId] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [isTeamMemberSubmitModalVisible, setTeamMemberSubmitModalVisible] =
    useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [endDateDisplay, setEndDateDisplay] = useState("");
  const [startDateDisplay, setStartDateDisplay] = useState("");
  const [averageCost, setAverageCost] = useState("0");
  const [workinghr, setWorkingHr] = useState("");
  const [utilization, setUtilization] = useState(0);
  const [approvedProjects, setAprovedProjects] = useState<any[]>([]);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setAlertMessage("");
    onClose();
    //handleClose();
  };
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "13/04/2023",
      role: "05:30 AM",
      startDate: "05:30 AM",
      endDate: "6:30 AM",
      Description: "Client Review Preparation, Wireframe Design",
      isActive: true,
    },
    {
      id: 2,
      name: "13/04/2023",
      role: "05:30 AM",
      startDate: "05:30 AM",
      endDate: "6:30 AM",
      Description: "Client Review Preparation, Wireframe Design",
      isActive: false,
    },
  ]);

  const [isInvalidDateModalVisible, setIsInvalidDateModalVisible] =
    useState(false);
  const [invalidDateDetails, setInvalidDateDetails] = useState({
    selectedDate: "",
    projectStartDate: "",
    projectEndDate: "",
  });

  // Fetch the members when the modal is opened
  const fetchMembers = async () => {
    try {
      const response = await GetResources({});
      //console.log(response);
      ////////debugger;
      const parsedRes = JSON.parse(response);
      if (parsedRes.status === "success") {
        setMembers(parsedRes.data.resources); // Set the fetched members
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
  const FetchProjectDetails = async (projectId: number) => {
    try {
      const response = await GetApprovedProjects({ projectId: projectId }); // Pass projectId here
      //debugger;
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

  const handleMemberChange = (selectedMemberId: string) => {
    //console.log('Selected Member ID:', selectedMemberId);

    const memberIdNumber = Number(selectedMemberId);

    if (!memberIdNumber) {
      //console.log('No member selected');
      return;
    }

    const selectedMember = members.find(
      (member) => member.resource_id === memberIdNumber
    );

    if (selectedMember) {
      setForm({
        ...form,
        member: selectedMember?.resource_id,
        role: selectedMember?.role_id,
        costPerHour: selectedMember?.average_cost,

        actual_cost: selectedMember?.average_cost,
      });
      //console.log('Selected Member:', selectedMember);
      //   setMemberName(`${selectedMember.first_name} ${selectedMember.last_name}`);
      //   setMemberId(selectedMember.resource_id);
      //   setRole(selectedMember.role_id);
      //   setWorkingHr(selectedMember.workinghours);
      //setAverageCost(selectedMember?.average_cost || "");
    }
  };
  const handleAverageCostChange = (text: string) => {
    if (text === "") {
      setAverageCost("0");
    }

    const formattedNumber = text.replace(/[^0-9.]/g, ""); // Allow only numbers and a single '.'

    if ((formattedNumber.match(/\./g) || []).length > 1) {
      return;
    }

    const validNumber = formattedNumber.match(/^\d*\.?\d{0,3}$/);
    if (validNumber) {
      setAverageCost(formattedNumber);
    }
  };

  const handleWorkingHoursChange = (text: string) => {
    const formattedNumber = text.replace(/[^0-9.]/g, "");

    if ((formattedNumber.match(/\./g) || []).length > 1) {
      return;
    }

    const validNumber = formattedNumber.match(/^\d*\.?\d{0,3}$/);
    if (validNumber) {
      setWorkingHr(formattedNumber);
    }
  };

  const handleDateChange = (date: Date) => {
    //debugger;
    const project = approvedProjects[0]; // Assuming a single project
    //debugger;
    if (project && date) {
      // Parse and normalize dates to midnight
      const projectStartDate = new Date(project.start_date);
      const projectEndDate = new Date(project.end_date);

      projectStartDate.setHours(0, 0, 0, 0); // Normalize start date
      projectEndDate.setHours(0, 0, 0, 0); // Normalize end date
      date.setHours(0, 0, 0, 0); // Normalize selected date

      if (date < projectStartDate || date > projectEndDate) {
        setIsInvalidDateModalVisible(true); // Show modal
        setInvalidDateDetails({
          selectedDate: format(date, "MM/dd/yyyy"),
          projectStartDate: format(projectStartDate, "MM/dd/yyyy"),
          projectEndDate: format(projectEndDate, "MM/dd/yyyy"),
        });
        setStartDate("");
        return;
      } else {
        setStartDate(date);
        setForm({ ...form, startDate: date });
      }

      //console.log('Valid date selected:', date);
    }

    // Update the state
  };
  const handleEndDateChange = (date: Date) => {
    //debugger;
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
        setEndDate("");
        return;
      } else {
        ////debugger;
        setEndDate(date); // Format for storage
        setForm({ ...form, endDate: date });
      }

      //console.log('Valid end date selected:', date);
    }
  };
  const handleSubmit = async () => {
    //if (!validateForm()) return;
    if (!form.startDate) return;
    if (!form.endDate) return;
    const isUpdating = member?.project_resources_id ? true : false;
    const payload = {
      project_resources_id: changeRequest
        ? isEditing
          ? member?.project_resources_id
          : Math.random()
        : member?.project_resources_id || 0,
      project_id: projectId,
      resource_id: Number(form.member),
      role_id: Number(form.role),
      actual_cost: Number(form.actual_cost),
      working_hours: Number(form.working_hours),
      start_date: form.startDate?.toLocaleDateString("en-CA"),
      end_date: form.endDate?.toLocaleDateString("en-CA"),
      availability_percentage: form.allocation,
      is_active: true,
    };
    //console.log('Payload:', payload);
    try {
      const response = changeRequest
        ? await MemberChangeRequest(payload)
        : await InsertMember(payload);
      const parsedResponse = JSON.parse(response);
      // Handle the response (assuming it's a JSON object)
      if (parsedResponse && parsedResponse.status === "success") {
        if (changeRequest) {
          showAlert("Change request updated successfully");
        }
        if (isUpdating) {
          showAlert("Team Member Updated Successfully");
        } else {
          showAlert("Team Member Added Successfully");
        }
        await onSubmit();
      } else {
        showAlert("Failed to add member. Please try again.");
      }
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error submitting member:", error);
      //Alert.alert("An error occurred. Please try again.");
      showAlert("Failed to add member. Please try again.");
    }
  };
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (isOpen) {
      debugger;
      setSubmitted(false);
      fetchMembers();
      GetRole();
      FetchProjectDetails(parseInt(projectId));
      if (member) {
        // setMemberName(member.resource_name);
        // setMemberId(member.resource_id);
        // setRole(member.role_id);
        // setAverageCost(member.actual_cost);
        // setWorkingHr(member.working_hours);
        // setStartDate(new Date(member.start_date));
        // setEndDate(new Date(member.end_date));
        // setUtilization(member.availability_percentage);
        setForm({
          member: member?.resource_id,
          role: member?.role_id,
          costPerHour: member?.actual_cost,
          allocation: member?.availability_percentage,
          startDate: new Date(member.start_date),
          endDate: new Date(member.end_date),
          actual_cost: member?.actual_cost,
          working_hours: member.working_hours,
        });
      } else {
        setForm({
          member: "",
          role: "",
          costPerHour: "",
          allocation: "",
          startDate: "",
          endDate: "",
          actual_cost: "",
          working_hours: "",
        });
      }
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-center mb-6">
            Add Team Member
          </h2>

          {/* Form */}
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              handleSubmit();
            }}
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={form.member}
                onChange={(e) => {
                  handleMemberChange(e.target.value);
                  //handleChange("member", e.target.value);
                }}
                required
              >
                <option value="">Select Member</option>
                {(members ?? []).map((item) => (
                  <option
                    key={item.resource_id}
                    value={item.resource_id?.toString()}
                  >
                    {item.first_name?.length + item.last_name?.length > 24
                      ? `${item.first_name} ${item.last_name}`.slice(0, 24) +
                        "..."
                      : `${item.first_name} ${item.last_name}`}
                  </option>
                ))}
              </select>
              {submitted && !form.member && (
                <p className="text-red-500 text-sm mt-1">
                  Member name is required
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {(roles ?? []).map((item) => (
                  <option key={item.role_id} value={item.role_id?.toString()}>
                    {item.role_name?.length > 17
                      ? `${item.role_name.slice(0, 17)}...`
                      : item.role_name}
                  </option>
                ))}
              </select>
              {submitted && !form.role && (
                <p className="text-red-500 text-sm mt-1">Role is required</p>
              )}
            </div>

            {/* Cost/Hour */}
            <div>
              <label className="block text-sm font-medium">Cost/Hour</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded"
                value={form.costPerHour}
                onChange={(e) => handleChange("costPerHour", e.target.value)}
              />
            </div>

            {/* % Allocation */}
            <div>
              <label className="block text-sm font-medium">
                % Allocation (0-100) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full mt-1 p-2 border rounded"
                value={form.allocation}
                onChange={(e) => handleChange("allocation", e.target.value)}
                required
              />
              {submitted && !form.allocation && (
                <p className="text-red-500 text-sm mt-1">
                  Enter a valid percentage
                </p>
              )}
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
                value={form.startDate}
                onChange={(date) => {
                  handleDateChange(date ?? new Date());
                }}
                className="w-full"
                format="MM/dd/yyyy"
                placement="bottomEnd"
                placeholder="mm/dd/yyyy"
                editable={false}
              />
              {submitted && !form.startDate && (
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
                value={form.endDate}
                onChange={(date) => {
                  handleEndDateChange(date ?? new Date());
                }}
                className="w-full"
                format="MM/dd/yyyy"
                placement="bottomEnd"
                placeholder="mm/dd/yyyy"
                editable={false}
              />
              {submitted && !form.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  End date is required
                </p>
              )}
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
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <AlertBox
        visible={alertVisible}
        onCloseAlert={closeAlert}
        message={alertMessage}
      />
    </>
  );
}
