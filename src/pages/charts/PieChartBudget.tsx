/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { Chart } from "react-google-charts";
import { Circle_svg } from "../../assets/Icons";

interface ChartProps {
  data: any;
  onClcked: (worker1?: string, worker2?: string) => void;
  height: number;
  width: number;
}

const transformApiResponse3DChart = (apiResponse: any) => {
  const chartData: (string | number)[][] = [["Departments", "Total Budget"]];
  const statusMap = new Map<string, string>();
  const statusColorList: { name: string; color: string; value: string }[] = [];

  apiResponse?.forEach((status: any) => {
    chartData.push([status.department_name, Number(status.projected_budget)]);
    statusMap.set(status.department_name, status.department_id);
    statusColorList.push({
      name: status.department_name,
      color: status.department_color ?? "#ccc",
      value: status.projected_budget,
    });
  });

  const chartColors = apiResponse?.map(
    (status: any) => status.department_color ?? "#ccc"
  );

  return { chartData, statusMap, chartColors, statusColorList };
};

const PieChartBudget: React.FC<ChartProps> = ({
  onClcked,
  height,
  width,
  data,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(width || 400);
  const [chartHeight, setChartHeight] = useState(height || 300);
  const [chartData, setChartData] = useState<(string | number)[][]>([]);
  const [statusMap, setStatusMap] = useState<Map<string, string>>(new Map());
  const [chartColors, setChartColors] = useState<string[]>([]);
  const [statusColors, setStatusColors] = useState<
    { name: string; color: string; value: string }[]
  >([]);

  useEffect(() => {
    const { chartData, statusMap, chartColors, statusColorList } =
      transformApiResponse3DChart(data);
    setChartData(chartData);
    setStatusMap(statusMap);
    setChartColors(chartColors);
    setStatusColors(statusColorList);
  }, [data]);

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

  const handleChartClick = ({ chartWrapper }: { chartWrapper: any }) => {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    if (selection.length > 0) {
      const selectedItem = selection[0];
      if (selectedItem.row !== null) {
        const departmentName = chartData[selectedItem.row + 1][0] as string;
        const departmentId = statusMap.get(departmentName);
        if (departmentId !== undefined) {
          onClcked(departmentId.toString());
        }
      }
    }
  };

  const chartOptions = {
    //title: "",
    backgroundColor: "transparent",
    chartArea: { width: "90%", height: "90%" },
    pieHole: 0.4,
    is3D: true,
    colors: chartColors,
    legend: "none",
    tooltip: {
      text: "value",
      textStyle: {
        fontSize: 10,
        color: "black",
      },
    },
    pieSliceText: "value",
  };

  return (
    <div
      className="flex w-full h-full max-h-[600px]"
      //style={{ minHeight: height }}
    >
      <div
        ref={chartRef}
        className="flex-1 flex justify-center items-center rounded-xl bg-white"
      >
        <Chart
          chartType="PieChart"
          data={chartData}
          options={chartOptions}
          width={`${chartWidth || 400}px`}
          height={`${chartHeight || 250}px`}
          chartEvents={[
            {
              eventName: "select",
              callback: handleChartClick,
            },
          ]}
        />
      </div>
      <div className="w-[30%] pl-3 overflow-y-auto flex flex-col justify-start max-h-full">
        {statusColors.map((item, index) => (
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

export default PieChartBudget;
