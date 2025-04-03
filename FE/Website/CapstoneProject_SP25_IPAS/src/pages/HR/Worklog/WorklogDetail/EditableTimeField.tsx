import React from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";

interface EditableTimeRangeFieldProps {
  value: [string, string]; // Giá trị thời gian bắt đầu và kết thúc (định dạng "HH:mm")
  onChange: (newValue: [string, string]) => void; // Callback khi giá trị thay đổi
  placeholder?: [string, string]; // Placeholder cho TimePicker (start, end)
  style?: React.CSSProperties; // Custom style cho TimePicker
}

const EditableTimeRangeField: React.FC<EditableTimeRangeFieldProps> = ({
  value,
  onChange,
  placeholder = ["Start time", "End time"],
  style = { width: 250 },
}) => {
  // Chuyển đổi giá trị từ string sang dayjs object để sử dụng trong TimePicker
  const [startTime, endTime] = value;
  const start = startTime ? dayjs(startTime, "HH:mm:ss") : null;
  const end = endTime ? dayjs(endTime, "HH:mm:ss") : null;

  // Xử lý khi người dùng thay đổi thời gian
  const handleTimeRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, // dates sẽ là một mảng hoặc null
    dateStrings: [string, string] // dateStrings là mảng các chuỗi thời gian
  ) => {
    if (dates) {
      const [start, end] = dates;
      onChange([
        start ? start.format("HH:mm:ss") : "", // Chỉ lấy giờ và phút
        end ? end.format("HH:mm:ss") : "",
      ]);
    } else {
      // Trường hợp nếu người dùng xóa lựa chọn thời gian
      onChange(["", ""]);
    }
  };

  return (
    <TimePicker.RangePicker
      value={[start, end]} // Giá trị hiện tại (start và end)
      onChange={handleTimeRangeChange} // Callback khi thay đổi
      format="HH:mm:ss" // Định dạng hiển thị
      placeholder={placeholder} // Placeholder
      style={style} // Custom style
    />
  );
};

export default EditableTimeRangeField;