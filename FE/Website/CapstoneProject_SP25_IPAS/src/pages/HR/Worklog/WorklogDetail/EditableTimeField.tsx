import React from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";

interface EditableTimeRangeFieldProps {
  value: [string, string];
  onChange: (newValue: [string, string]) => void;
  placeholder?: [string, string];
  style?: React.CSSProperties;
  disabled?: boolean;
}

const EditableTimeRangeField: React.FC<EditableTimeRangeFieldProps> = ({
  value,
  onChange,
  placeholder = ["Start time", "End time"],
  style = { width: 250 },
  disabled = false,
}) => {
  const [startTime, endTime] = value;
  const start = startTime ? dayjs(startTime, "HH:mm:ss") : null;
  const end = endTime ? dayjs(endTime, "HH:mm:ss") : null;

  const handleTimeRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    if (dates) {
      const [start, end] = dates;
      onChange([
        start ? start.format("HH:mm:ss") : "",
        end ? end.format("HH:mm:ss") : "",
      ]);
    } else {
      onChange(["", ""]);
    }
  };

  return (
    <TimePicker.RangePicker
      value={[start, end]}
      onChange={handleTimeRangeChange}
      format="HH:mm:ss"
      placeholder={placeholder}
      style={style}
      disabled={disabled}
    />
  );
};

export default EditableTimeRangeField;