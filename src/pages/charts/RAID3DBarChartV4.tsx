/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
interface ChartProps {
  data: any;
  onClcked: (department?: string, resourceType?: string) => void;
}
// Apply the animated theme
am4core.useTheme(am4themes_animated);

const RAID3DBarChartV4: React.FC<ChartProps> = ({ onClcked, data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = am4core.create(chartRef.current!, am4charts.XYChart3D);
    ////debugger;
    chart.logo.disabled = true;
    const priorityCounts: any[] = data.map((item) => ({
      priority: item.priority,
      count: item.total_raid_count,
    }));
    // Add data
    chart.data = priorityCounts;

    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "priority";
    categoryAxis.renderer.labels.template.rotation = 0;
    categoryAxis.renderer.labels.template.hideOversized = false;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    // categoryAxis.tooltip.label.rotation = 270;
    // categoryAxis.tooltip.label.horizontalCenter = 'right';
    // categoryAxis.tooltip.label.verticalCenter = 'middle';
    const colors = data.map((item) => am4core.color(item.color));
    chart.colors.list = colors;
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Projects";
    valueAxis.title.fontWeight = "bold";

    // Create series
    const series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "count";
    series.dataFields.categoryX = "priority";
    series.name = "count";
    series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = 0.8;

    series.columns.template.events.on("hit", function (ev) {
      ////debugger;
      const data: any = ev.target.dataItem.dataContext;
      console.log("Column clicked:", data);
      onClcked(data.priority, "");
    });

    const columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.stroke = am4core.color("#FFFFFF");

    columnTemplate.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    columnTemplate.adapter.add("stroke", (stroke, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;

    // Cleanup chart
    return () => {
      chart.dispose();
    };
  }, [data]);
  const [chartWidth, setChartWidth] = useState<number>(400);
  const [chartHeight, setChartHeight] = useState<number>(250);
  // const [departmentColorList, setDepartmentColorList] = useState<
  //   {name: string; color: string}[]
  // >([]);
  useEffect(() => {
    const handleResize = () => {
      //////debugger;
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth || 400);
        setChartHeight(chartRef.current.offsetHeight || 300);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial calculation
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div
      id="chartdiv"
      ref={chartRef}
      style={{ width: "auto", height: chartHeight + "px" }}
    />
  );
};

export default RAID3DBarChartV4;
