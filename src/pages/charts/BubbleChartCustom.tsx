/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Circle_svg } from "../../assets/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// export const data = [
//   ['ID', 'Life Expectancy', 'Fertility Rate', 'Region', 'Population'],
//   ['CAN', 80.66, 1.67, 'North America', 33739900],
//   ['DEU', 79.84, 1.36, 'Europe', 81902307],
//   ['DNK', 78.6, 1.84, 'Europe', 5523095],
//   ['EGY', 72.73, 2.78, 'Middle East', 79716203],
//   ['GBR', 80.05, 2, 'Europe', 61801570],
//   ['IRN', 72.49, 1.7, 'Middle East', 73137148],
//   ['IRQ', 68.09, 4.77, 'Middle East', 31090763],
//   ['ISR', 81.55, 2.96, 'Middle East', 7485600],
//   ['RUS', 68.6, 1.54, 'Europe', 141850000],
//   ['USA', 78.09, 2.05, 'North America', 307007000],
// ];

interface ChartProps {
  data: any;
  onClcked: (worker1?: string, worker2?: string) => void;
  height: number;
  width: number;
  startDate?: string;
  endDate?: string;
}
type ProjectData = {
  project_id: number;
  project_name: string;
  raid_count: number;
  start_date: string;
  end_date: string;
};

type PriorityGroup = {
  priority: string | null;
  data: ProjectData[];
};
const priorityMap: Record<string, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};
const priorityMapping: Record<string, number> = {
  Low: 400,
  Medium: 300,
  High: 200,
  Critical: 103,
};
const priorityColorMapping: Record<string, string> = {
  Low: "green",
  Medium: "yellow",
  High: "orange",
  Critical: "red",
};

function generateSortedMonthArray(
  chartData: any,
  startDate?: string,
  endDate?: string
) {
  const monthArray: { v: number; f: string }[] = [];

  let start: Date;
  let end: Date;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    // Fallback to project start dates
    const allDates: Date[] = [];

    chartData?.data?.forEach((priorityItem: any) => {
      priorityItem.data?.forEach((project: any) => {
        if (project.start_date) {
          allDates.push(new Date(project.start_date));
        }
      });
    });
    if (allDates.length === 0) {
      end = new Date();
      end.setDate(1);
      start = new Date(end);
      start.setMonth(end.getMonth() - 3);
      console.log("No data found for generating months.");
      return [];
    } else {
      allDates.sort((a, b) => a.getTime() - b.getTime());
      start = new Date(allDates[0]);
      start.setDate(1);
      end = new Date(start);
      end.setMonth(start.getMonth() + 3);
    }
  }

  // Normalize
  start.setDate(1);
  end.setDate(1);

  let current = new Date(start);
  let index = 0;

  const seen = new Set<string>();

  while (current <= end) {
    const label = current.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });

    if (!seen.has(label)) {
      monthArray.push({
        v: (index + 1) * 100,
        f: label,
      });

      console.log(`Generated Month: ${label}`);
      seen.add(label);
      index++;
    }

    current.setMonth(current.getMonth() + 1);
  }
  ////////debugger;
  return monthArray;
}

function getMonthYear(date: string | Date | null | undefined): string {
  ////////debugger;
  if (!date) return "Invalid Date";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

type MonthEntry = { v: number; f: string };
function getMonthValueByLabel(
  label: string,
  monthArray: MonthEntry[]
): number | null {
  ////////debugger;
  const monthEntry = monthArray.find((entry) => entry.f === label);

  return monthEntry ? monthEntry.v : null;
}
function getRandomDecimal(n: number): number {
  const min = n - 100;
  const max = n;
  return parseInt((Math.random() * (max - min) + min).toFixed(2));
}
// function getRandomDecimalV(n: number): number {
//   return parseFloat(
//     (Math.random() * (n - 0.01 - (n - 0.99)) + (n - 0.99)).toFixed(2),
//   );
// }
function getRandomDecimalV(n: number): number {
  const min = n;
  const max = n + 100;
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

const transformChartData = (
  apiResponse: { data: PriorityGroup[] },
  worker: any
) => {
  const chartData: any[] = [
    // [
    //   '',
    //   '',
    //   '',
    //   'Category',
    //   'Risk Count',
    //   {type: 'string', role: 'tooltip', p: {html: true}},
    // ],
  ];
  const map: Record<number, ProjectData & { priority: string }> = {};

  let index = 0;
  apiResponse?.data?.forEach((group) => {
    group?.data?.forEach((project) => {
      const severityLevel = priorityMapping[group.priority || "Low"];
      const PriorityColor = priorityColorMapping[group.priority || "Low"];
      const startDateMonthYear = getMonthYear(project.start_date);
      const GenerateV = getMonthValueByLabel(startDateMonthYear, worker);
      if (GenerateV) {
        chartData.push([
          "", // keep label empty
          getRandomDecimal(severityLevel ?? 0),
          getRandomDecimal(GenerateV),
          group.priority || "Low",
          project.raid_count,
          PriorityColor,
          project.project_id,
          project.project_name,
          project.start_date,
        ]);
      }

      map[index] = { ...project, priority: group.priority || "Low" };
      index++;
    });
  });

  return { chartData, map };
};

const BubbleChartCustom: React.FC<ChartProps> = ({
  onClcked,
  height,
  width,
  data,
  startDate,
  endDate,
}) => {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [visibleTooltipId, setVisibleTooltipId] = useState<string | null>(null);
  const apiData = {
    status: "success",
    message: "Fetched chart data successfully.",
    data: [
      {
        priority: "Critical",
        data: [
          {
            project_id: 179,
            project_name: "Redesign of Company Website",
            start_date: "2025-02-01T00:00:00.000Z",
            end_date: "2025-05-31T00:00:00.000Z",
            raid_count: 2,
          },
          {
            project_id: 200,
            project_name: "PPM System Development for MAC",
            start_date: "2025-02-01T00:00:00.000Z",
            end_date: "2025-02-28T00:00:00.000Z",
            raid_count: 10,
          },
          {
            project_id: 232,
            project_name: "Installation and Configuration of CMS",
            start_date: "2025-03-07T00:00:00.000Z",
            end_date: "2025-03-07T00:00:00.000Z",
            raid_count: 1,
          },
          {
            project_id: 244,
            project_name:
              "Error Proofing Initiative for Electronics Manufacturer",
            start_date: "2024-08-01T00:00:00.000Z",
            end_date: "2025-10-30T00:00:00.000Z",
            raid_count: 1,
          },
        ],
      },
      {
        priority: "High",
        data: [
          {
            project_id: 180,
            project_name: "Portfolio Management Tool creation",
            start_date: "2025-01-01T00:00:00.000Z",
            end_date: "2025-04-30T00:00:00.000Z",
            raid_count: 1,
          },
          {
            project_id: 200,
            project_name: "PPM System Development for MAC",
            start_date: "2025-02-01T00:00:00.000Z",
            end_date: "2025-02-28T00:00:00.000Z",
            raid_count: 1,
          },
        ],
      },
      {
        priority: "Medium",
        data: [
          {
            project_id: 189,
            project_name: "Performance Testing of Mobile App",
            start_date: "2025-02-19T00:00:00.000Z",
            end_date: "2025-03-01T00:00:00.000Z",
            raid_count: 3,
          },
        ],
      },
    ],
  };

  const worker = useMemo(
    () => generateSortedMonthArray(data, startDate, endDate),
    [data, startDate, endDate]
  );

  const yAxisValues = [400, 300, 200, 100]; // Values for Y Axis (spaced 50px apart downward)
  const [projectMap, setProjectMap] = useState<
    Record<number, ProjectData & { priority: string }>
  >({});
  const { chartData: formattedData, map: transformedProjectMap } = useMemo(
    () => transformChartData(data, worker),
    [data, worker]
  );
  // //////debugger;
  useEffect(() => {
    setProjectMap(transformedProjectMap);
  }, [transformedProjectMap]);
  /*  const formattedData = transformChartData(data, worker); */
  //setLoading(false);

  return (
    <div style={styles.container}>
      {/* Chart Area */}

      <div style={styles.chartArea}>
        {/* Y Axis */}
        <div style={styles.yAxis} />

        {/* X Axis */}
        <div style={styles.xAxis} />

        {/* Y Axis Labels */}
        {yAxisValues.map((value, index) => (
          <label
            key={index}
            style={{
              position: "absolute", // assuming you're absolutely positioning
              top: index * 100 - 8,
              left: 0,
              fontWeight: "bold",
              //fontSize: "14px",

              width: "100%",
              //borderBottomWidth: 1,
              //borderBottomColor: '#ccc',
              textAlign: "right",
              fontSize: 12,
            }}
          >
            {" "}
          </label>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            position: "absolute",
            bottom: 0,
          }}
        >
          {worker.map((month, index) => (
            <div
              style={{
                width: 100,
                alignItems: "center",
                //marginLeft: 0,

                //left: 0,
              }}
            >
              <label
                key={index}
                style={styles.xLabel} // 40 offset for Y axis + 50px spacing
              >
                {month.f}
              </label>
            </div>
          ))}
        </div>
        {/* Example Data Points */}
        {/* <View style={[styles.dataPoint, {top: 60, left: 90}]} />
        <View style={[styles.dataPoint, {top: 120, left: 140}]} />
        <View style={[styles.dataPoint, {top: 90, left: 240}]} /> */}

        {/* Dynamic Data Points */}
        {formattedData.map((item, idx) => {
          const xValue = item[1]; // X position (0-100 range?)
          const yValue = item[2]; // Y position (0-4 range?)

          const raid_count = item[4];
          const color = item[5];
          //   // Mapping X (0-100) to chart width (after 40px left offset)
          //   const left = 40 + (xValue / 100) * (chartWidth - 40);

          //   // Mapping Y (0-maxYValue) to chart height (inverted because top 0 is top of screen)
          //   const top = ((maxYValue - yValue) / maxYValue) * (chartHeight - 30);
          // //////debugger;
          return (
            <>
              <div
                style={{
                  position: "absolute",
                  top: xValue,
                  left: yValue,
                  cursor: "pointer",
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Important: wrap your SVG with a focusable or pointer-targetable element */}
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        onClcked(
                          item[6]?.toString(),
                          priorityMap[item[3]]?.toString()
                        );
                      }}
                    >
                      <div
                        key={idx}
                        className="rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                          height: raid_count * 5,
                          width: raid_count * 5,
                          cursor: "pointer",
                        }}
                      >
                        <Circle_svg
                          name="circle"
                          height={raid_count * 5}
                          width={raid_count * 5}
                          fill={color}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div
                      style={{
                        ...styles.tooltip,
                        top: xValue,
                        left: yValue + 10,
                      }}
                      //style={[styles.tooltip, { top: xValue, left: yValue + 10 }]}
                    >
                      <div
                        style={{
                          paddingLeft: 10,
                          paddingRight: 10,
                          borderRadius: 0,
                          paddingTop: 5,
                          paddingBottom: 5,
                          //backgroundColor: 'black',
                          //width: 'max-content',
                          //display: 'flex',
                          flexDirection: "column",
                        }}
                      >
                        <div>
                          <b>Priority:</b> {item[3]}
                        </div>
                        <div>
                          <b>RAID Count:</b> {raid_count}
                        </div>
                        <div>
                          <b>Project ID:</b> {"FPX-" + item[6]}
                        </div>
                        <div style={{ flexWrap: "wrap" }}>
                          <b>Project Name:</b> {item[7]}
                        </div>
                        {/* <div>
                      <b>Project Start Date:</b> {format(item[8], 'MM/dd/yyyy')}
                    </div>
                    <div>
                      <b>X:</b> {xValue}
                    </div>
                    <div>
                      <b>Y:</b> {yValue}
                    </div> */}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          );
        })}
        {/* {formattedData.map((item, idx) => {
          const xValue = item[1]; // X position (0-100 range?)
          const yValue = item[2]; // Y position (0-4 range?)

          const raid_count = item[4];
          const color = item[5];
          // ////debugger;
          //   // Mapping X (0-100) to chart width (after 40px left offset)
          //   const left = 40 + (xValue / 100) * (chartWidth - 40);

          //   // Mapping Y (0-maxYValue) to chart height (inverted because top 0 is top of screen)
          //   const top = ((maxYValue - yValue) / maxYValue) * (chartHeight - 30);
          // //////debugger;
          return (
            <>
              {visibleTooltipId === idx + 1 + "tool" && (
                <div
                  style={{
                    ...styles.tooltip,
                    top: xValue,
                    left: yValue + 10,
                  }}
                  //style={[styles.tooltip, { top: xValue, left: yValue + 10 }]}
                >
                  <div
                    style={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: 0,
                      paddingTop: 5,
                      paddingBottom: 5,
                      //backgroundColor: 'black',
                      //width: 'max-content',
                      //display: 'flex',
                      flexDirection: "column",
                    }}
                  >
                    <div>
                      <b>Priority:</b> {item[3]}
                    </div>
                    <div>
                      <b>RAID Count:</b> {raid_count}
                    </div>
                    <div>
                      <b>Project ID:</b> {"FPX-" + item[6]}
                    </div>
                    <div style={{ flexWrap: "wrap" }}>
                      <b>Project Name:</b> {item[7]}
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })} */}

        {/* X Axis Labels */}
      </div>
    </div>
  );
};
const styles = {
  tooltip: {
    //position: 'absolute',
    //top: 10,
    //left: 0,
    elevation: 3,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.35)",
    backgroundColor: "white",
    //zIndex: 9999,
    //alignSelf: 'flex-start', //
    width: 300,
    overflow: "hidden",
  },
  tooltiptext: {
    color: "black",
    fontSize: 14,
    fontFamily: "Roboto",
    flexWrap: "wrap",
  },
  container: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  chartArea: {
    width: "100%", // wide enough to fit 12 months * 50px
    height: 500,
    // borderWidth: 1,
    //borderColor: 'lightgray',
    position: "relative",
    //paddingLeft: 40, // for Y axis labels
    paddingBottom: 30, // for X axis labels
    overflow: "auto",
  },
  yAxis: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 30,
    width: 2,
    backgroundColor: "black",
  },
  xAxis: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    height: 2,
    backgroundColor: "black",
  },
  yLabel: {
    position: "absolute",
    left: 0,
    width: "100%",
    //borderBottomWidth: 1,
    //borderBottomColor: '#ccc',
    textAlign: "right",
    fontSize: 12,
  },
  xLabel: {
    //width: 40,
    fontSize: 14,
    fontWeight: "bold",
    //textAlign: 'center',
  },
  HeadingLabel: {
    //width: 40,
    fontSize: 16,
    fontWeight: "bold",
    //textAlign: 'center',
  },
  dataPoint: {
    position: "absolute",
    //width: 8,
    //height: 8,
    //borderRadius: 4,
    //backgroundColor: 'blue',
  },
};
export default BubbleChartCustom;
