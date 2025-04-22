import React from "react";
import { Select, Avatar, Flex } from "antd";
import { GetUser } from "@/payloads";
import { Images } from "@/assets";

const { Option } = Select;

interface EmployeeDropdownProps {
  employees: GetUser[];
  selectedEmployee: GetUser | undefined;
  onChange: (userId: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
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
      value={selectedEmployee?.userId}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      optionLabelProp="label"
    >
      {employees.map((employee) => (
        <Option key={employee.userId} value={employee.userId} label={employee.fullName}>
          <Flex align="center" gap={8}>
            <Avatar
              src={employee.avatarURL || Images.avatar}
              size="small"
            />
            <span>{employee.fullName}</span>
          </Flex>
        </Option>
      ))}
    </Select>
  );
};

export default EmployeeDropdown;