/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Interface for Props
interface ChartProps {
  data: any;
  onClcked: (department?: string, resourceType?: string) => void;
}

// Transform API Data for Grouped 3D Chart
const transformResourceDataForGrouped3DChart = (data: any) => {
  const departments = data?.data?.resource_utilization?.departments ?? [];

  const categoriesX: string[] = departments.map(
    (dept: any) => dept?.department_name ?? ""
  );

  const chartData = departments.map((dept: any) => ({
    department: dept?.department_name ?? "",
    department_id: dept?.department_id ?? "",
    Utilized: dept?.utilized_resources ?? 0,
    Allocated: dept?.total_resources ?? 0,
    Effective: dept?.effective_utilization ?? 0,
    color: dept?.department_color ?? "#cccccc",
  }));

  const colors: Record<string, string> = {};
  departments.forEach((dept: any) => {
    colors[dept?.department_name ?? ""] = dept?.department_color ?? "#cccccc";
  });

  return { categoriesX, chartData, colors };
};

const Grouped3DBarChartV4: React.FC<ChartProps> = ({ onClcked, data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chartDataResult = transformResourceDataForGrouped3DChart(data);
    if (!chartDataResult || !chartDataResult.chartData?.length) return;

    am4core.useTheme(am4themes_animated);
    const chart = am4core.create(chartRef.current!, am4charts.XYChart3D);
    chart.logo.disabled = true;

    chart.data = chartDataResult.chartData;

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "department";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.rotation = 0;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.adapter.add(
      "textOutput",
      function (text) {
        if (!text) return "";
        return text.length > 8 ? text.substring(0, 5) + "…" : text;
      }
    );
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = false;

    const series3 = chart.series.push(new am4charts.ColumnSeries3D());
    series3.dataFields.valueY = "Effective";
    series3.dataFields.categoryX = "department";
    series3.name = "Effectively Utilized";
    series3.clustered = false;
    series3.columns.template.tooltipText =
      "Effectively Utilized - {categoryX}: {valueY}";
    series3.columns.template.fill = am4core.color("#368c04");
    series3.columns.template.fillOpacity = 0.9;
    series3.columns.template.adapter.add(
      "disabled",
      function (disabled, target) {
        return target.dataItem && target.dataItem.valueY === 0;
      }
    );
    // After creating series1
    // Utilized (Front)
    let labelBullet3 = series3.bullets.push(new am4charts.LabelBullet());
    labelBullet3.label.text = "{valueY}";
    labelBullet3.label.fill = am4core.color("white");
    labelBullet3.label.fontSize = 12;
    labelBullet3.label.adapter.add("text", function (text, target) {
      return target.dataItem && target.dataItem.valueY > 0
        ? target.dataItem.valueY.toString()
        : "";
    });

    labelBullet3.label.textAlign = "middle";
    labelBullet3.label.dx = 0;
    labelBullet3.label.dy = 20;

    // Add click event to series1 columns
    series3.columns.template.events.on("hit", function (ev) {
      const dataItem = ev.target.dataItem?.dataContext;
      if (dataItem && dataItem.department_id) {
        onClcked(dataItem.department_id.toString(), "Utilized");
      }
    });

    const series1 = chart.series.push(new am4charts.ColumnSeries3D());
    series1.dataFields.valueY = "Utilized";
    series1.dataFields.categoryX = "department";
    series1.name = "Utilized";
    series1.clustered = false;
    series1.columns.template.tooltipText = "Utilized - {categoryX}: {valueY}";
    series1.columns.template.fill = am4core.color("#ffc107");
    series1.columns.template.fillOpacity = 0.9;
    series1.columns.template.adapter.add(
      "disabled",
      function (disabled, target) {
        return target.dataItem && target.dataItem.valueY === 0;
      }
    );
    // After creating series1
    // Utilized (Front)
    let labelBullet1 = series1.bullets.push(new am4charts.LabelBullet());
    labelBullet1.label.text = "{valueY}";
    labelBullet1.label.fill = am4core.color("white");
    labelBullet1.label.fontSize = 12;
    labelBullet1.label.adapter.add("text", function (text, target) {
      return target.dataItem && target.dataItem.valueY > 0
        ? target.dataItem.valueY.toString()
        : "";
    });

    labelBullet1.label.textAlign = "middle";
    labelBullet1.label.dx = 10;
    labelBullet1.label.dy = 0;

    // Add click event to series1 columns
    series1.columns.template.events.on("hit", function (ev) {
      const dataItem = ev.target.dataItem?.dataContext;
      if (dataItem && dataItem.department_id) {
        onClcked(dataItem.department_id.toString(), "Utilized");
      }
    });

    const series2 = chart.series.push(new am4charts.ColumnSeries3D());
    series2.dataFields.valueY = "Allocated";
    series2.dataFields.categoryX = "department";
    series2.name = "Total";
    series2.clustered = false;
    series2.columns.template.tooltipText = "Total - {categoryX}: {valueY}";
    series2.columns.template.fill = am4core.color("#044086");
    series2.columns.template.fillOpacity = 0.9;

    let labelBullet2 = series2.bullets.push(new am4charts.LabelBullet());
    labelBullet2.label.text = "{valueY}";
    labelBullet2.label.fill = am4core.color("black");
    labelBullet2.label.fontSize = 12;
    labelBullet2.label.adapter.add("text", function (text, target) {
      return target.dataItem && target.dataItem.valueY > 0
        ? target.dataItem.valueY.toString()
        : "";
    });

    labelBullet2.label.textAlign = "middle";
    labelBullet2.label.dx = 20;
    labelBullet2.label.dy = -20;

    series2.columns.template.events.on("hit", function (ev) {
      const dataItem = ev.target.dataItem?.dataContext;
      if (dataItem && dataItem.department_id) {
        onClcked(dataItem.department_id.toString(), "Allocated");
      }
    });

    chart.legend = new am4charts.Legend();

    chart.legend.position = "top"; // changed from 'bottom' to 'top'
    chart.legend.contentAlign = "center";
    chart.legend.paddingTop = 20;
    chart.legend.paddingRight = 20;

    chart.legend.itemContainers.template.paddingTop = 5;
    chart.legend.itemContainers.template.paddingBottom = 5;
    chart.legend.itemContainers.template.paddingLeft = 5;
    chart.legend.itemContainers.template.paddingRight = 10;
    chart.legend.itemContainers.template.layout = "horizontal";

    chart.legend.labels.template.truncate = false;
    chart.legend.labels.template.wrap = true;
    chart.legend.labels.template.fontSize = 14;
    chart.legend.labels.template.fontFamily = "Roboto";
    chart.legend.labels.template.paddingLeft = 10;

    return () => {
      chart.dispose();
    };
  }, [data]);

  const [chartWidth, setChartWidth] = useState<number>(400);
  const [chartHeight, setChartHeight] = useState<number>(440);
  // const [departmentColorList, setDepartmentColorList] = useState<
  //   {name: string; color: string}[]
  // >([]);
  useEffect(() => {
    const handleResize = () => {
      ////////debugger;
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth || 400);
        setChartHeight(chartRef.current.offsetHeight || 400);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial calculation
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
      {/* <View>
        <strong style={{padding: 10, color: 'black'}}>
          Resource Utilization
        </strong>{' '}
      </View> */}
      <div
        ref={chartRef}
        style={{ width: "auto", height: chartHeight + "px" }}
      />
    </>
  );
};

export default Grouped3DBarChartV4;
