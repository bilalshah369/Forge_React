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
  const chartData: (string | number)[][] = [["Status", "Total Projects"]];
  const statusMap = new Map<string, string>();
  const statusColorList: { name: string; color: string; value: string }[] = [];

  const arrC = ["#044086", "#558CE5", "#ffc107"];

  apiResponse?.forEach((status: any, index: number) => {
    chartData.push([status.budget_impact_name, Number(status.project_count)]);
    statusMap.set(status.budget_impact_name, status.budget_impact);
    statusColorList.push({
      name: status.budget_impact_name,
      color: arrC[index] ?? "#ccc",
      value: status.project_count,
    });
  });

  const chartColors = apiResponse?.map((_, index: number) => arrC[index]);

  return { chartData, statusMap, chartColors, statusColorList };
};

const DoughPieChart: React.FC<ChartProps> = ({
  onClcked,
  height = 300,
  width = 400,
  data,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(width);
  const [chartHeight, setChartHeight] = useState<number>(height);
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

  const chartOptions = {
    backgroundColor: "transparent",
    chartArea: { width: "90%", height: "90%" },
    pieHole: 0.4,
    is3D: false,
    colors: chartColors,
    pieStartAngle: 0,
    sliceVisibilityThreshold: 0,
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

  const handleChartClick = ({ chartWrapper }: { chartWrapper: any }) => {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    if (selection.length > 0) {
      const selectedItem = selection[0];
      if (selectedItem.row !== null) {
        const statusName = chartData[selectedItem.row + 1][0] as string;
        const statusId = statusMap.get(statusName);
        if (statusId !== undefined) {
          onClcked(statusId.toString());
        }
      }
    }
  };

  return (
    <div className="flex w-full h-full max-h-[600px]">
      <div
        ref={chartRef}
        className="flex-1 flex justify-center items-center rounded-xl bg-white"
      >
        {chartData.length > 1 && (
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
        )}
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
            <span className="text-sm text-black truncate">
              {item.name?.substring(0, 8)}...: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughPieChart;
