import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { GetDept } from "./Tree";

const TreeChartWeb = ({ shouldFetch, setShouldFetch }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [treeData, setTreeData] = useState(null);
  const [companyName, setCompanyName] = useState("");

  const getCustName = async () => {
    try {
      const res = localStorage.getItem("company_name");
      setCompanyName(res || "Company");
    } catch (err) {
      console.error("Problem finding customer name:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await GetDept("");
      const result = await JSON.parse(response);

      if (!result?.data?.departments) return;

      const activeDepartments = result.data.departments.filter(
        (dept) => dept.is_active === true
      );

      const departmentMap = new Map(
        activeDepartments.map((dept) => [
          dept.department_id,
          {
            ...dept,
            children: [],
            department_color: dept.department_color || "lightgray",
          },
        ])
      );

      activeDepartments.forEach((dept) => {
        if (dept.parent_department_id) {
          const parent = departmentMap.get(dept.parent_department_id);
          if (parent) {
            parent.children.push(departmentMap.get(dept.department_id));
          }
        }
      });

      const rootDepartments = activeDepartments
        .filter((dept) => dept.parent_department_id === null)
        .map((dept) => departmentMap.get(dept.department_id));

      const forgeTree = {
        department_name: companyName || "Company",
        department_color: "black",
        children: rootDepartments.length ? rootDepartments : [],
      };

      setTreeData(forgeTree);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    getCustName();
  }, []);

  useEffect(() => {
    if (companyName) fetchDepartments();
  }, [companyName]);

  useEffect(() => {
    if (shouldFetch) {
      fetchDepartments();
      setShouldFetch(false);
    }
  }, [shouldFetch]);

  useEffect(() => {
    if (treeData) {
      drawTree();
    }
  }, [treeData]);

  const toggleNode = (node) => {
    node.collapsed = !node.collapsed;
    if (node.collapsed) {
      node._children = node.children;
      node.children = null;
    } else {
      node.children = node._children;
      node._children = null;
    }
    drawTree();
  };

  const getFontColor = (bgColor) => {
    if (!bgColor) return "#000";
    if (bgColor.toLowerCase() === "lightgray") return "#000";

    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000" : "#fff";
  };

  const drawTree = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = svgRef.current.getBoundingClientRect();
    const margin = { top: 200, left: width / 3 };

    const root = d3.hierarchy(treeData, (d) => d.children || []);

    const nodeSpacingX = Math.max(180, width / (root.height + 2));
    const nodeSpacingY = 100;

    const treeLayout = d3.tree().nodeSize([nodeSpacingY, nodeSpacingX]);
    treeLayout(root);

    const zoomGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    zoomGroup
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr(
        "d",
        d3.linkHorizontal().x((d) => d.y).y((d) => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);

    const nodes = zoomGroup
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node cursor-pointer")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => toggleNode(d.data));

    const boxWidth = 140;
    const boxHeight = 50;

    nodes
      .append("rect")
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("x", -boxWidth / 2)
      .attr("y", -boxHeight / 2)
      .attr("rx", 8)
      .attr("fill", (d) => d.data.department_color || "lightblue")
      .attr("stroke", "#333");

    nodes
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", (d) => getFontColor(d.data.department_color))
      .style("font-weight", "600")
      .text((d) =>
        d.data.collapsed
          ? `[+] ${d.data.department_name}`
          : `[-] ${d.data.department_name}`
      );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gray-50 flex items-center justify-center overflow-auto"
    >
      <svg ref={svgRef} className="w-full h-full rounded-xl shadow-md bg-white" />
    </div>
  );
};

export default TreeChartWeb;
