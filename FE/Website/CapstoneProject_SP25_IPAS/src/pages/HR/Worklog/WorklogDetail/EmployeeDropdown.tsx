import React from "react";
import { Select, Avatar, Flex } from "antd";
import { GetUser } from "@/payloads"; // Đảm bảo import đúng kiểu dữ liệu
import { Images } from "@/assets"; // Đảm bảo import hình ảnh mặc định

const { Option } = Select;

interface EmployeeDropdownProps {
  employees: GetUser[]; // Danh sách nhân viên
  selectedEmployee: GetUser | undefined; // Nhân viên được chọn hiện tại
  onChange: (userId: number) => void; // Callback khi chọn nhân viên
  placeholder?: string; // Placeholder cho dropdown
  style?: React.CSSProperties; // Custom style cho dropdown
}

const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({
  employees,
  selectedEmployee,
  onChange,
  placeholder = "Select an employee",
  style = { width: 200 },
}) => {
  return (
    <Select
      value={selectedEmployee?.userId} // Giá trị hiện tại của dropdown
      onChange={onChange} // Callback khi chọn nhân viên
      placeholder={placeholder} // Placeholder
      style={style} // Custom style
      optionLabelProp="label" // Hiển thị label thay vì value
    >
      {employees.map((employee) => (
        <Option key={employee.userId} value={employee.userId} label={employee.fullName}>
          <Flex align="center" gap={8}>
            {/* Avatar của nhân viên */}
            <Avatar
              src={employee.avatarURL || Images.avatar} // Sử dụng hình ảnh mặc định nếu không có avatar
              size="small"
            />
            {/* Tên nhân viên */}
            <span>{employee.fullName}</span>
          </Flex>
        </Option>
      ))}
    </Select>
  );
};

export default EmployeeDropdown;