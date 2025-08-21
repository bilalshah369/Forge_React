/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);

// Define props interface for type safety
interface BurndownChartProps {
  elementId: string;
  burndownData: number[];
  scopeChange?: number[];
  width?: number | string;
  dataBudget?: any;
}

// Sum elements of an array up to the provided index
const sumArrayUpTo = (arrData: number[], index: number): number => {
  let total = 0;
  for (let i = 0; i <= index; i++) {
    if (arrData.length > i) {
      total += arrData[i];
    }
  }
  return total;
};
function formatDateLabel(dateStr: string): string {
  const monthMap = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month] = dateStr.split("-");
  const monthName = monthMap[parseInt(month, 10) - 1];
  return `${monthName}-${year.slice(-2)}`;
}
const transformChartData = (
  apiResponse: any
): {
  DataLabels: any;
  BurnData: any;
  ForcastData: any;
} => {
  //////debugger;
  ////////////////debugger;;
  // const chartData: (string | number)[][] = [['Status', 'Total Projects']];
  // const statusMap = new Map<string, string>(); // Store department_name -> department_id
  // const statusColorList: {name: string; color: string; value: string}[] = [];
  const BurnData: any = [];
  const DataLabels: any = [];
  const ForcastData: any = [];
  //var arrC = ["#044086", "#558CE5", "#ffc107"];
  apiResponse?.forEach((status: any, index: any) => {
    DataLabels.push(formatDateLabel(status.yearmonth));
    BurnData.push(parseInt(status.projected_budget));
    ForcastData.push(parseInt(status.forecasted_budget));
  });

  return { DataLabels, BurnData, ForcastData };
};
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});
const BurndownChart: React.FC<BurndownChartProps> = ({
  elementId,
  burndownData,
  scopeChange = [],
  width = 800,
  dataBudget,
}) => {
  //////debugger;
  const chartRef = useRef(null);
  const { DataLabels, BurnData, ForcastData } = transformChartData(dataBudget);
  ////////debugger;;
  // Calculate chart data using useMemo to optimize performance
  const chartData = useMemo(() => {
    const totalHoursInSprint = BurnData[0] || 0;
    const idealHoursPerDay = totalHoursInSprint / 9;
    let i = 0;

    let blueGradient = "#044086";
    let orangeGradient = "#ffc107";
    const chart = chartRef.current;
    if (chart && chart.ctx) {
      const ctx = chart.ctx;

      blueGradient = ctx.createLinearGradient(0, 0, 0, 300);
      blueGradient.addColorStop(0, "rgba(4, 64, 134, 0.6)");
      blueGradient.addColorStop(1, "rgba(4, 64, 134, 0.05)");

      orangeGradient = ctx.createLinearGradient(0, 0, 0, 300);
      orangeGradient.addColorStop(0, "rgba(255, 193, 7, 0.5)");
      orangeGradient.addColorStop(1, "rgba(255, 193, 7, 0.1)");
    }
    return {
      labels: DataLabels,
      datasets: [
        {
          label: "Projected Budget",
          data: BurnData,
          fill: true,
          borderColor: "#044086",
          backgroundColor: blueGradient,
          tension: 0,
        },
        {
          label: "Forecasted Budget",
          borderColor: "#ffc107",
          backgroundColor: orangeGradient,
          tension: 0,
          //borderDash: [5, 5],
          fill: true,
          data: ForcastData,
        },
      ],
    };
  }, [BurnData, ForcastData]);
  // useEffect(() => {
  //   // const {DataLabels, BurnData, ForcastData} = transformChartData(dataBudget);
  //   ////////debugger;;

  //   return () => {
  //     //chart.dispose();
  //   };
  // }, [dataBudget]);

  // Chart options
  // const chartOptions = useMemo(
  //   () => ({
  //     plugins: {
  //       legend: {
  //         display: true,
  //         position: 'top' as const,
  //         labels: {
  //           boxWidth: 80,
  //           color: 'black', // formerly fontColor
  //           font: {
  //             weight: 'bold', // correct way to set bold text
  //             size: 14,
  //           },
  //         },
  //       },
  //       datalabels: {
  //         color: 'black',
  //         font: {
  //           weight: 'bold',
  //           size: 14, // adjust as needed
  //         },
  //       },
  //     },
  //     scales: {
  //       y: {
  //         ticks: {
  //           beginAtZero: true,
  //           max: Math.round(BurnData[0] * 1.1),
  //           color: 'black',
  //           font: {
  //             weight: 'bold',
  //             size: 12,
  //           },
  //         },
  //       },
  //       x: {
  //         ticks: {
  //           color: 'black',
  //           font: {
  //             weight: 'bold',
  //             size: 12,
  //           },
  //         },
  //       },
  //     },
  //   }),
  //   [BurnData],
  // );
  const chartOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            boxWidth: 80,
            color: "black",
            font: {
              weight: "bold",
              size: 14,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.dataset.label || "";
              const value = context.raw || 0;
              return `${label}: ${formatter.format(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            callback: function (value: number | string) {
              return formatter.format(Number(value));
            },
            color: "black",
            font: {
              weight: "bold",
              size: 12,
            },
          },
        },
        x: {
          ticks: {
            color: "black",
            font: {
              weight: "bold",
              size: 12,
            },
          },
        },
      },
    }),
    [BurnData]
  );

  return (
    <div style={styles.container}>
      <Line
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        id={elementId}
        style={{ fontFamily: "Roboto", fontSize: 14 }}
      />
    </div>
  );
};

const styles = {
  container: {
    padding: 10,
  },
};

export default BurndownChart;
