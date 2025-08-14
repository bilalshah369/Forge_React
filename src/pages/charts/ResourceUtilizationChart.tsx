import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define the shape of the data item
interface DataItem {
  yearmonth: string;
  "0-25%": string;
  "26-50%": string;
  "51-75%": string;
  "76-99%": string;
  "100%": string;
}

// Define props interface
interface ResourceUtilizationChartProps {
  startDate?: string | null;
  endDate?: string | null;
  data?: DataItem[];
}

const ResourceUtilizationChart: React.FC<ResourceUtilizationChartProps> = ({
  data = [],
}) => {
  // Use provided data directly
  const filteredData: DataItem[] = data;

  // Prepare chart labels
  const labels: string[] = filteredData.map((item) => {
    const [year, month] = item.yearmonth.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString(
      "default",
      {
        month: "short",
        year: "numeric",
      }
    );
  });

  // Define categories and colors
  const categories: string[] = ["0-25%", "26-50%", "51-75%", "76-99%", "100%"];
  const colors: string[] = [
    "rgba(255, 99, 132, 0.5)", // 0-25%
    "rgba(54, 162, 235, 0.5)", // 26-50%
    "rgba(255, 206, 86, 0.5)", // 51-75%
    "rgba(75, 192, 192, 0.5)", // 76-99%
    "rgba(153, 102, 255, 0.5)", // 100%
  ];

  // Prepare chart datasets
  const datasets = categories.map((category, index) => ({
    label: category,
    data: filteredData.map((item) => Number(item[category]) || 0), // Fallback to 0 if NaN
    fill: true,
    backgroundColor: colors[index],
    borderColor: colors[index].replace("0.5", "1"),
    tension: 0.4,
  }));

  // Calculate y-axis ticks based on max stacked value
  const allValues: number[] = filteredData.map((item) =>
    categories.reduce((sum, cat) => sum + Number(item[cat] || 0), 0)
  );
  const maxValue = Math.max(...allValues, 0);
  const stepSize = maxValue <= 20 ? 5 : Math.ceil(maxValue / 4 / 10) * 10;
  const yMax =
    maxValue > 0 ? Math.ceil(maxValue / stepSize) * stepSize + stepSize : 20;

  // Define chart data
  const chartData: ChartData<"line"> = {
    labels,
    datasets,
  };

  // Calculate dynamic chart height
  const chartContainerHeight = Math.max(300, yMax * 10);

  // Define chart options
  const options: ChartOptions<"line"> = {
    plugins: {
      title: {
        display: true,
        // text: 'Resource Utilization Over Time',
      },
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index", // Show tooltip for all datasets at the same x-value
        intersect: false, // Show tooltip even if not directly over a point
        position: "nearest",
        padding: 10,
      },
    },
    layout: {
      padding: {
        top: 0, // Add space for tooltips
        bottom: 0,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
        ticks: {
          autoSkip: false, // Ensure all labels are shown
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Resource Count",
        },
        min: 0,
        max: yMax,
        ticks: {
          stepSize,
        },
      },
    },
    maintainAspectRatio: false, // Allow chart to fill container height
  };

  return (
    <div className="bg-white w-full h-full overflow-x-auto">
      {/* <h2 className="text-2xl font-bold text-center mb-4">Resource Utilization Chart</h2> */}
      <div
        className="min-h-[440px]"
        style={{ width: `${Math.max(800, labels.length * 60)}px` }}
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ResourceUtilizationChart;
