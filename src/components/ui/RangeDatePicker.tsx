import * as React from "react";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
  format,
  subDays,
  subMonths,
  subQuarters,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

// type DateRange = {
//   from?: Date;
//   to?: Date;
// };

type Props = {
  onApply?: (range: DateRange) => void;
};

export const RangeDatePicker: React.FC<Props> = ({ onApply }) => {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const formatted =
    range?.from && range?.to
      ? `${format(range?.from, "MM/dd/yyyy")} - ${format(
          range?.to,
          "MM/dd/yyyy"
        )}`
      : "mm/dd/yyyy - mm/dd/yyyy";

  const applyPreset = (presetRange: DateRange) => {
    setRange(presetRange);
  };

  const handleApply = () => {
    if (onApply && range?.from && range?.to) {
      onApply(range);
    }
  };

  return (
    <div className="w-fit border rounded shadow-md bg-white text-sm">
      <div className="p-3 border-b font-medium">{formatted}</div>

      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        showOutsideDays
        className="p-3"
      />

      <div className="px-3 pb-2 grid grid-cols-3 gap-2 text-blue-600 text-xs">
        <button
          onClick={() => applyPreset({ from: new Date(), to: new Date() })}
        >
          Today
        </button>
        <button
          onClick={() =>
            applyPreset({
              from: subDays(new Date(), 1),
              to: subDays(new Date(), 1),
            })
          }
        >
          Yesterday
        </button>
        <button
          onClick={() =>
            applyPreset({ from: subMonths(new Date(), 1), to: new Date() })
          }
        >
          Last 1 Month
        </button>
        <button
          onClick={() =>
            applyPreset({ from: subQuarters(new Date(), 1), to: new Date() })
          }
        >
          Last Quarter
        </button>
        <button
          onClick={() =>
            applyPreset({ from: startOfMonth(new Date()), to: new Date() })
          }
        >
          This Month
        </button>
        <button
          onClick={() =>
            applyPreset({ from: startOfYear(new Date()), to: new Date() })
          }
        >
          This Year
        </button>
      </div>

      <div className="px-3 pb-3 pt-1 flex justify-end">
        <button
          onClick={handleApply}
          disabled={!range?.from || !range?.to}
          className="px-4 py-1 text-white bg-blue-600 text-sm rounded disabled:opacity-50"
        >
          OK
        </button>
      </div>
    </div>
  );
};
