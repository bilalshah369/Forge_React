/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { Chart } from "react-google-charts";
import { Circle_svg } from "../../assets/Icons";

interface ChartProps {
  data: any;
  onClcked: (worker1?: string, worker2?: string) => void;
  height?: number;
  width?: number;
}

const transformApiResponse3DChart = (apiResponse: any) => {
  const chartData: (string | number)[][] = [["Department", "Total Projects"]];
  const departmentMap = new Map<string, number>();
  const departmentColorList: { name: string; color: string }[] = [];

  apiResponse?.forEach((department: any) => {
    chartData.push([
      department.department_name,
      Number(department.total_projects),
    ]);
    departmentMap.set(department.department_name, department.department_id);
    departmentColorList.push({
      name: department.department_name,
      color: department.department_color ?? "#ccc",
    });
  });

  const chartColors = apiResponse?.map(
    (department) => department.department_color ?? "#ccc"
  );

  return { chartData, departmentMap, chartColors, departmentColorList };
};

const ThreeDPieChart: React.FC<ChartProps> = ({
  onClcked,
  height = 250,
  width = 400,
  data,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(width || 400);
  const [chartHeight, setChartHeight] = useState<number>(height || 250);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth || width);
        setChartHeight(chartRef.current.offsetHeight || height);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  const { chartData, departmentMap, chartColors, departmentColorList } =
    transformApiResponse3DChart(data);
  const chartOptions = {
    backgroundColor: "transparent",
    chartArea: { width: "90%", height: "90%" },
    pieHole: 0.4,
    is3D: true,
    legend: "none",
    colors: chartColors,
    tooltip: {
      text: "value",
      textStyle: { fontSize: 10, color: "black" },
    },
    pieSliceText: "value",
  };
  // const chartOptions = {
  //   //title: "",
  //   backgroundColor: "transparent",
  //   chartArea: { width: "90%", height: "90%" },
  //   pieHole: 0.4,
  //   is3D: true,
  //   colors: chartColors,
  //   pieStartAngle: 0,
  //   sliceVisibilityThreshold: 0,
  //   legend: "none",
  //   tooltip: {
  //     text: "value",
  //     textStyle: { fontSize: 10, color: "black" },
  //   },
  //   pieSliceText: "value",
  // };

  const handleChartClick = ({ chartWrapper }: { chartWrapper: any }) => {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();

    if (selection.length > 0) {
      const selectedItem = selection[0];
      if (selectedItem.row !== null) {
        const departmentName = chartData[selectedItem.row + 1][0] as string;
        const departmentId = departmentMap.get(departmentName);
        if (departmentId !== undefined) {
          onClcked(departmentId.toString());
        }
      }
    }
  };

  return (
    <div className="flex w-full h-full max-h-[600px]">
      <div
        ref={chartRef}
        className="flex-1 flex justify-center items-center rounded-xl bg-white"
        style={{ height: chartHeight }}
      >
        <Chart
          chartType="PieChart"
          data={chartData}
          options={chartOptions}
          width={`${chartWidth || 400}px`}
          height={`${chartHeight || 250}px`}
          chartEvents={[{ eventName: "select", callback: handleChartClick }]}
        />
      </div>

      <div className="w-[30%] pl-3 overflow-y-auto flex flex-col justify-start max-h-full">
        {departmentColorList.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <div className="mr-2">
              <Circle_svg
                height={20}
                width={20}
                fill={item.color?.toString().trim() ?? "#ccc"}
              />
            </div>
            <span className="text-sm text-black truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreeDPieChart;
