import React from "react";

/**
 * SVGProgressBar
 *
 * Props:
 * - percent: number (0-100)
 * - width: number (default: 300)
 * - height: number (default: 20)
 * - bgColor: string (default: '#eee')
 * - fillColor: string (default: '#2196f3')
 * - borderRadius: number (default: 4)
 */
const SVGProgressBar = ({
  percent = 0,
  width = 190,
  height = 15,
  bgColor = "#eee",
  fillColor = "#2196f3",
  borderRadius = 10,
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const progressWidth = (clampedPercent / 100) * width;
  //////////////debugger;
  return (
    <svg width={width} height={height}>
      {/* Background */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={bgColor}
        rx={borderRadius}
        ry={borderRadius}
      />
      {/* Progress */}
      <rect
        x="0"
        y="0"
        width={progressWidth}
        height={height}
        fill={fillColor}
        rx={borderRadius}
        ry={borderRadius}
      />
    </svg>
  );
};

export default SVGProgressBar;
