/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import React, { useEffect, useRef, useState } from "react";
//const DatePicker = React.lazy(() => import('react-datepicker'));
// import "react-datepicker/dist/react-datepicker.css";
import {
  AddResourceTimesheet,
  GetResourceTimesheet,
} from "../projects/ProjectProgress";
import { DatePicker, DateRangePicker } from "rsuite";
import AdvancedDataTable from "@/components/ui/AdvancedDataTable";
import AlertBox from "@/components/ui/AlertBox";
import { useTheme } from "@/themes/ThemeProvider";

interface TimesheetModalProps {
  visible: boolean;
  onClose: () => void;
  prefilledData: {
    project_id: number;
  };
  onReady: (position: number) => void;
}

export const TimesheetModal: React.FC<TimesheetModalProps> = ({
  visible,
  onClose,
  prefilledData,
  onReady,
}) => {
  //const { theme } = useTheme();
  //const styles = modalStyles(theme);
  const [resourceId, setResourceId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [range, setRange] = useState<any>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rawStartDate, setRawStartDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDateDisplay, setStartDateDisplay] = useState("");
  const [selectedScale, setSelectedScale] = useState("");
  const [startDate, setStartDate] = useState("");
  const now = new Date();

  const customRanges = [
    {
      label: "Today",
      value: () => [startOfDay(now), endOfDay(now)] as [Date, Date],
    },
    {
      label: "Yesterday",
      value: () => {
        const yesterday = subDays(now, 1);
        return [startOfDay(yesterday), endOfDay(yesterday)] as [Date, Date];
      },
    },
    {
      label: "Last 7 Days",
      value: () => {
        const start = subDays(now, 6);
        return [startOfDay(start), endOfDay(now)] as [Date, Date];
      },
    },
    {
      label: "This Week",
      value: () =>
        [
          startOfWeek(now, { weekStartsOn: 1 }),
          endOfWeek(now, { weekStartsOn: 1 }),
        ] as [Date, Date], // Week starts on Monday
    },
    {
      label: "This Month",
      value: () => [startOfMonth(now), endOfMonth(now)] as [Date, Date],
    },
  ];
  const [startDatePicker, setStartDatePicker] = useState("");
  const [endDatePicker, setEndDatePicker] = useState("");
  const [timesheetData, setTimesheetData] = useState([]);
  const [timesheetDataEntries, setTimesheetDataEntries] = useState<any>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<string | null>(null);
  const handleChange = async (value: any, scale: any) => {
    ////////////debugger;
    setRange(value);

    if (value) {
      setStartDatePicker(value[0]?.toLocaleDateString("en-CA"));
      setEndDatePicker(value[1]?.toLocaleDateString("en-CA"));
      ////////////debugger;
      console.log("Selected Range:", value); // Logs selected range
      // Generate the array of dates with default values
      const TimesheetData: {
        project_resources_timesheet_id?: string;
        project_resources_id: string;
        date: string;
        start: string;
        total: string;
        end: string;
        description: string;
      }[] = [];

      let current = new Date(value[0]?.toLocaleDateString("en-CA"));
      while (current <= new Date(value[1]?.toLocaleDateString("en-CA"))) {
        TimesheetData.push({
          date: current.toISOString().split("T")[0], // Format: YYYY-MM-DD
          project_resources_id: resourceId, // Fill from your state or props as needed
          start: "",
          total: "",
          end: "",
          description: "",
        });
        current.setDate(current.getDate() + 1);
      }
      console.log(TimesheetData);
      ////debugger;
      setTimesheetDataEntries(TimesheetData);
    }
  };
  // const handleChange = async (value: any, scale: string) => {
  //   let startDateChanged: Date;
  //   let endDateChanged: Date;

  //   if (value && value[0] && value[1]) {
  //     startDateChanged = new Date(value[0]);
  //     endDateChanged = new Date(value[1]);
  //   } else {
  //     const now = new Date();
  //     switch (scale) {
  //       case 'day':
  //         startDateChanged = new Date(now);
  //         endDateChanged = new Date(now);
  //         break;
  //       case 'week':
  //         startDateChanged = new Date(now);
  //         startDateChanged.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  //         endDateChanged = new Date(startDateChanged);
  //         endDateChanged.setDate(startDateChanged.getDate() + 6); // End of week (Saturday)
  //         break;
  //       case 'month':
  //         startDateChanged = new Date(now.getFullYear(), now.getMonth(), 1); // First day of month
  //         endDateChanged = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
  //         break;
  //       default:
  //         startDateChanged = now;
  //         endDateChanged = now;
  //     }

  //     value = [startDateChanged, endDateChanged];
  //   }

  //   setRange(value);
  //   setStartDatePicker(startDateChanged.toLocaleDateString('en-CA'));
  //   setEndDatePicker(endDateChanged.toLocaleDateString('en-CA'));

  //   console.log('Selected Range:', value);
  //   ////debugger;
  // };
  //const formRef = useRef<div>(null);
  // useEffect(() => {
  //   setTimeout(() => {
  //     formRef.current?.measure((x, y, width, height, pageX, pageY) => {
  //       onReady(pageY + 100); // Adjust the position as needed
  //     });
  //   }, 0);
  // });

  const timeToMinutes = (t: string): number => {
    const [hStr, mStr] = t.split(":");
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    return h * 60 + m;
  };

  const minutesToTime = (totalMins: number): string => {
    const m = totalMins % 60;
    const h = Math.floor(totalMins / 60) % 24;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // -----------------------------------------------------------------------
  // Separate function to calculate the missing time-related field if only two are provided.
  // This function is intended to be called manually (for example, via onBlur).
  // -----------------------------------------------------------------------
  const calculateMissingTime = (
    value: string,
    type: "start" | "end" | "total",
    startTime1: string,
    endTime1: string,
    totalHours1: string,
    index: number
  ): { start?: string; end?: string; total?: string } => {
    ////debugger;
    const st = (type === "start" ? value : startTime1)?.trim();
    const et = (type === "end" ? value : endTime1)?.trim();
    const th = (type === "total" ? value : totalHours1)?.trim();

    const toMins = (x: string) => timeToMinutes(x);
    const toTime = (m: number) => minutesToTime(m);
    setTimesheetDataEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [type]: value };
      return updated;
    });
    // ── All three filled?
    if (st && et && th) {
      if (type === "start" || type === "end") {
        let diff = toMins(et) - toMins(st);
        if (diff < 0) diff += 24 * 60;
        //total
        setTimesheetDataEntries((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ["total"]: (diff / 60).toFixed(2),
          };
          return updated;
        });
        return { total: (diff / 60).toFixed(2) };
      } else {
        const hrs = parseFloat(th) || 0;
        let calc = toMins(st) + hrs * 60;
        calc %= 24 * 60;
        //end time
        setTimesheetDataEntries((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], ["end"]: toTime(calc) };
          return updated;
        });
        return { end: toTime(calc) };
      }
    }

    // ── Exactly two filled?
    const filled = [st, et, th].filter((x) => x !== "").length;
    if (filled !== 2) {
      return {};
    }

    // 1) Start + End → Total
    if (st && et && !th) {
      let diff = toMins(et) - toMins(st);
      if (diff < 0) diff += 24 * 60;
      //total
      setTimesheetDataEntries((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          ["total"]: (diff / 60).toFixed(2),
        };
        return updated;
      });
      return { total: (diff / 60).toFixed(2) };
    }
    // 2) Start + Total → End
    if (st && th && !et) {
      const hrs = parseFloat(th) || 0;
      let calc = toMins(st) + hrs * 60;
      calc %= 24 * 60;
      //end

      setTimesheetDataEntries((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ["end"]: toTime(calc) };
        return updated;
      });
      return { end: toTime(calc) };
    }
    // 3) End + Total → Start
    if (et && th && !st) {
      const hrs = parseFloat(th) || 0;
      let calc = toMins(et) - hrs * 60;
      if (calc < 0) calc += 24 * 60;
      //start
      setTimesheetDataEntries((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ["start"]: toTime(calc) };
        return updated;
      });
      return { start: toTime(calc) };
    }
    // setTimesheetDataEntries(prev => {
    //   const updated = [...prev];
    //   updated[index] = {...updated[index], [type]: value};
    //   return updated;
    // });
    return {};
  };
const {theme} =useTheme();
  useEffect(() => {
    if (visible && prefilledData.project_id) {
      //////debugger;
      fetchTimesheet(prefilledData.project_id);
      const today = new Date();
      setTimesheetDataEntries([
        {
          date: today.toISOString().split("T")[0], // Format: YYYY-MM-DD
          project_resources_id: resourceId,
          start: "",
          total: "",
          end: "",
          description: "",
        },
      ]);
    }
  }, [visible, prefilledData]);
  const handleSubmit = async () => {
    try {
      console.log(timesheetDataEntries);
      ////debugger;
      timesheetDataEntries.map(async (obj: any, index) => {
        const data: {
          project_id: number;
          project_resources_timesheet_id?: string;
          start_time: string;
          end_time: string;
          total_hours: string;
          description: string;
          date: string;
        } = {
          project_id: prefilledData.project_id,

          start_time: obj.start,
          end_time: obj.end,
          total_hours: obj.total,
          description: obj.description,
          date: obj.date,
        };
        if (obj.project_resources_timesheet_id) {
          data.project_resources_timesheet_id =
            obj.project_resources_timesheet_id;
        }
        await AddResourceTimesheet(data);

        // if (editId) {
        //   data.project_resources_timesheet_id = editId;
        //   await AddResourceTimesheet(data);
        // } else {
        //   await AddResourceTimesheet(data);
        // }
      });
      await fetchTimesheet(prefilledData.project_id);
      // Resetting the form fields
      setShowSuccessModal(true);
      showAlert("Timesheet saved successfully");

      // if (editId) {
      //   data.project_resources_timesheet_id = editId;
      //   await AddResourceTimesheet(data);
      // } else {
      //   await AddResourceTimesheet(data);
      // }

      // // Refresh timesheet data before resetting the form
      // await fetchTimesheet(prefilledData.project_id);
      // // Resetting the form fields
      // setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTimesheet = async (projectId: any) => {
    try {
      const response = await GetResourceTimesheet(projectId);
      const parsedRes = JSON.parse(response);

      if (
        parsedRes?.status === "success" &&
        parsedRes.data?.resource &&
        Array.isArray(parsedRes.data?.timesheets)
      ) {
        const resource = parsedRes.data.resource;
        setResourceId(resource.project_resources_id?.toString() ?? "");
        setName(resource.resource_name);
        setRole(resource.role_name);
        setTimesheetData(parsedRes.data.timesheets);
      } else {
        console.error("Invalid or empty data");
      }
    } catch (error) {
      console.error("Error fetching timesheet:", error);
    }
  };

  const datePickerStartRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        datePickerStartRef.current &&
        !datePickerStartRef.current.contains(event.target)
      ) {
        setShowStartDatePicker(false);
      }
    }

    // if (Platform.OS === "web") {
    //   document.addEventListener("mousedown", handleClickOutside);
    // }

    // return () => {
    //   if (Platform.OS === "web") {
    //     document.removeEventListener("mousedown", handleClickOutside);
    //   }
    // };
  }, []);
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setStartTime("");
    setEndTime("");
    setTotalHours("");
    setDescription("");
    setStartDate("");
    setStartDateDisplay("");
    setRawStartDate(null); // Clear timesheet data
  };
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  const handleDateChange = (date: any) => {
    //debugger;
    setRawStartDate(date);
    setStartDateDisplay(format(date, "MM-dd-yyyy"));
    setStartDate(format(date, "yyyy-MM-dd"));
    setShowStartDatePicker(false);
  };

  const handleEdit = async (item: any) => {
    setEditId(item.project_resources_timesheet_id);
    setStartTime(item.start_time);
    setEndTime(item.end_time);
    setTotalHours(item.total_hours);
    setDescription(item.description);
    setName(item.name);
    setRole(item.role);

    const TimesheetData: {
      project_resources_timesheet_id?: string;
      project_resources_id: string;
      date: string;
      start: string;
      total: string;
      end: string;
      description: string;
    }[] = [];

    let current = new Date(item.date);
    while (current <= new Date(item.date)) {
      TimesheetData.push({
        project_resources_timesheet_id: item.project_resources_timesheet_id,
        date: current.toISOString().split("T")[0], // Format: YYYY-MM-DD
        project_resources_id: resourceId, // Fill from your state or props as needed
        start: item.start_time,
        total: item.total_hours,
        end: item.end_time,
        description: item.description,
      });
      current.setDate(current.getDate() + 1);
    }
    console.log(TimesheetData);
    ////debugger;
    setTimesheetDataEntries(TimesheetData);

    if (item.date) {
      const formattedDate = format(new Date(item.date), "yyyy-MM-dd");
      const displayDate = format(new Date(item.date), "MM-dd-yyyy");

      setStartDate(formattedDate);
      setStartDateDisplay(displayDate);
      setRawStartDate(new Date(item.date));
    }
    await fetchTimesheet(item.project_resources_id);
  };
  const [alertVisible, setAlertVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showAlert = (message: string) => {
    setMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    setMessage("");
    //navigation("/PMView");
  };
  const handleAddButton = () => {
    // reset any “edit” state
    setEditId(null);
    setStartTime("");
    setEndTime("");
    setTotalHours("");
    setDescription("");

    let nextDate: Date;
    if (timesheetData?.length > 0) {
      // find the maximum date in the table (regardless of sort order)
      const maxTime = Math.max(
        ...timesheetData.map((item) => new Date(item.date).getTime())
      );
      const lastDate = new Date(maxTime);
      nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 1);
    } else {
      // no records → use today
      nextDate = new Date();
    }

    // commit to state (you already had these three)
    setRawStartDate(nextDate);
    setStartDate(format(nextDate, "yyyy-MM-dd"));
    setStartDateDisplay(format(nextDate, "MM-dd-yyyy"));
  };
  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // gives 'YYYY-MM-DD'
  };
  return (
    <>
      {visible && (
        <>
          <div className="bg-gray-50 p-6 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Timesheet Entry</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Name</label>
                <input
                  readOnly
                  value={name}
                  type="text"
                  required
                  className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                  placeholder="Enter Name"
                />
              </div>
              <div className="flex flex-col" id="timesheetModal">
                <label className="text-sm font-medium mb-1">Role</label>
                <input
                  readOnly
                  value={role}
                  type="text"
                  className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                  placeholder="Enter Role"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Date Range</label>
                <DateRangePicker
                  //placeholder="Select date range"
                  ranges={customRanges}
                  value={range ?? Date.now()}
                  cleanable={true}
                  // ranges={customRanges}
                  format="MM/dd/yyyy"
                  onChange={handleChange}
                  // style={
                  //   {
                  //     color: "black",
                  //     "--rs-picker-placeholder-color": "black",
                  //   } as React.CSSProperties
                  // }
                  placement="bottomEnd"
                  placeholder="mm/dd/yyyy - mm/dd/yyyy"
                  editable={false}

                  // shouldDisableDate={combine(allowedMaxDays(7), beforeToday())}
                />
              </div>

              {/* Row 2 */}

              {timesheetDataEntries.map((object: any, index: any) => (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Date</label>
                    {/* <input
                      type="date"
                      value={formatDateForInput(object.date)}
                      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                      onChange={handleDateChange}
                    /> */}
                    <DatePicker
                      disabled
                      oneTap
                      cleanable={false}
                      value={new Date(object.date)}
                      onChange={(date) => {
                        handleDateChange(date);
                        setShowStartDatePicker(false);
                      }}
                      format="MM/dd/yyyy"
                      // style={
                      //   {
                      //     color: "black",
                      //     "--rs-picker-placeholder-color": "black",
                      //   } as React.CSSProperties
                      // }
                      placement="bottomEnd"
                      placeholder="mm/dd/yyyy"
                      editable={false}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">
                      Start Time
                    </label>

                    <input
                      type="time" // HTML <input type="time"> works in 24h
                      value={object.start}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setStartTime(newStart);
                        setLastEdited("start");
                        const res = calculateMissingTime(
                          newStart,
                          "start",
                          newStart,
                          object.end,
                          object.total,
                          index
                        );
                        if (res.total) setTotalHours(res.total);
                        if (res.end) setEndTime(res.end);
                      }}
                      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">
                      Total Time (in Hours)
                    </label>
                    <input
                      type="number"
                      required
                      value={object.total}
                      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                      placeholder="Enter Hours"
                      onChange={(e) => {
                        const newTotal = e.target.value;
                        const res = calculateMissingTime(
                          newTotal,
                          "total",
                          object.start,
                          object.end,
                          newTotal,
                          index
                        );
                        // Optionally set state here: setTotalHours(newTotal);
                      }}
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">End Time</label>
                    {/* <input type="time" /> */}
                    <input
                      type="time"
                      value={object.end}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        setEndTime(newEnd);
                        setLastEdited("end");
                        const res = calculateMissingTime(
                          newEnd,
                          "end",
                          object.start,
                          newEnd,
                          object.total,
                          index
                        );
                        if (res.total) setTotalHours(res.total);
                        if (res.start) setStartTime(res.start);
                      }}
                      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-medium mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={object.description}
                      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
                      placeholder="Enter Description"
                      onChange={(e) => {
                        // const newTotal = e.target.value;
                        const newDescription = e.target.value;
                        setTimesheetDataEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = {
                            ...updated[index],
                            description: newDescription,
                          };
                          return updated;
                        });
                      }}
                    />
                  </div>
                </>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="px-5 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                onClick={() => {
                  handleCancel();
                }}
              >
                Close
              </button>
              <button
                className="px-5 py-2  text-white rounded-md " style={{backgroundColor:theme.colors.drawerBackgroundColor}}
                onClick={() => {
                  handleSubmit();
                }}
              >
                Save
              </button>
            </div>
          </div>
          <div className="min-w-[1000px]">
            <AdvancedDataTable
              isfilter1={false}
              data={timesheetData}
              columns={[
                {
                  label: "#",
                  key: "sno",
                  visible: true,
                  type: "sno",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
                {
                  label: "Date",
                  key: "date",
                  visible: true,
                  type: "date",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
                {
                  label: "Start Time",
                  key: "start_time",
                  visible: true,
                  type: "",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
                {
                  label: "End Time",
                  key: "end_time",
                  visible: true,
                  type: "",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
                {
                  label: "Total Time(in hrs)",
                  key: "total_hours",
                  visible: true,
                  type: "",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
                {
                  label: "Description",
                  key: "description",
                  visible: true,
                  type: "",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
                {
                  label: "Action",
                  key: "action",
                  visible: true,
                  type: "action",
                  column_width: "50",
                  url: "timesheet",
                  order_no: 1,
                },
              ]}
              title="Timesheet"
              exportFileName="timesheet"
              isCreate={false}
              //onCreate={() => navigation("/NewIntake")}
              isPagingEnable={true}
              data_type={"Project"}
            />
          </div>
          <AlertBox
            visible={alertVisible}
            onCloseAlert={closeAlert}
            message={message}
          />
        </>
      )}

      {/* <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalText}>
              Timesheet saved successfully
            </Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.submitText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </>
  );
};
