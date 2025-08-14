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

const transformApiResponse3DChart = (
  apiResponse: any
): {
  chartData: (string | number)[][];
  statusMap: Map<string, string>;
  chartColors: string[];
  statusColorList: { name: string; color: string }[];
} => {
  const chartData: (string | number)[][] = [["Status", "Total Projects"]];
  const statusMap = new Map<string, string>();
  const statusColorList: { name: string; color: string }[] = [];

  apiResponse?.forEach((status: any) => {
    chartData.push([status.label, Number(status.value)]);
    statusMap.set(status.label, status.mapped_status);
    statusColorList.push({
      name: status.label,
      color: status.border_color?.trim() || "#ccc",
    });
  });

  const chartColors = apiResponse?.map(
    (status: any) => status.border_color?.trim() || "#ccc"
  );

  return { chartData, statusMap, chartColors, statusColorList };
};

const DoughuntPieChart: React.FC<ChartProps> = ({
  onClcked,
  height,
  width,
  data,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(width || 400);
  const [chartHeight, setChartHeight] = useState<number>(height || 250);

  const [chartData, setChartData] = useState<(string | number)[][]>([]);
  const [statusMap, setStatusMap] = useState<Map<string, string>>(new Map());
  const [chartColors, setChartColors] = useState<string[]>([]);
  const [statusColorList, setStatusColorList] = useState<
    { name: string; color: string }[]
  >([]);

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

  useEffect(() => {
    const { chartData, statusMap, chartColors, statusColorList } =
      transformApiResponse3DChart(data);
    setChartData(chartData);
    setStatusMap(statusMap);
    setChartColors(chartColors);
    setStatusColorList(statusColorList);
  }, [data]);

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

  const handleChartClick = ({ chartWrapper }: { chartWrapper: any }) => {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    if (selection.length > 0 && selection[0].row !== null) {
      const statusName = chartData[selection[0].row + 1][0] as string;
      const statusId = statusMap.get(statusName);
      if (statusId !== undefined) {
        onClcked(statusId?.toString());
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
          chartEvents={[
            {
              eventName: "select",
              callback: handleChartClick,
            },
          ]}
        />
      </div>
      <div
        className="w-[30%] pl-3 overflow-y-auto flex flex-col justify-start max-h-full"
        //style={{ height: chartHeight }}
      >
        {statusColorList.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <Circle_svg
              className="mr-2"
              width={20}
              height={20}
              fill={item.color}
            />
            <span className="text-sm text-black">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughuntPieChart;
