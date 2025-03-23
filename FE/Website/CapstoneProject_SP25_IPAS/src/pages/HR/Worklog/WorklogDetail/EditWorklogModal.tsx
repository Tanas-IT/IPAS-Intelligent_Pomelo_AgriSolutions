import { GetUser } from "@/payloads";
import { Modal, Flex, DatePicker, Button } from "antd";
import EmployeeTable from "./EmployeeTable";
import EditableTimeRangeField from "./EditableTimeField";
import dayjs from "dayjs";

interface EditWorklogModalProps {
  visible: boolean;
  onClose: () => void;
  employees: GetUser[];
  attendanceStatus: { [key: number]: "Received" | "Rejected" };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
  selectedTimeRange: [string, string];
  onTimeRangeChange: (newValue: [string, string]) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSave: () => void;
}

const EditWorklogModal: React.FC<EditWorklogModalProps> = ({
  visible,
  onClose,
  employees,
  attendanceStatus,
  onReplaceEmployee,
  selectedTimeRange,
  onTimeRangeChange,
  selectedDate,
  onDateChange,
  onSave,
}) => {
    console.log("selectedTimeRange", selectedTimeRange);
    console.log("selectedDate", selectedDate);
    console.log("employees", employees);
    
  return (
    <Modal
      title="Edit Worklog"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={onSave}>
          Save
        </Button>,
      ]}
      width={800}
    >
      <EmployeeTable
        employees={employees}
        attendanceStatus={attendanceStatus}
        onReplaceEmployee={onReplaceEmployee}
      />

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        <label>Working Time:</label>
        <EditableTimeRangeField
          value={selectedTimeRange}
          onChange={onTimeRangeChange}
        />
        <label>Date:</label>
        <DatePicker
          value={selectedDate ? dayjs(selectedDate) : null}
          onChange={(date, dateString) => {
            const selectedDateString = Array.isArray(dateString) ? dateString[0] : dateString;
            onDateChange(selectedDateString);
          }}
        />
      </Flex>
    </Modal>
  );
};

export default EditWorklogModal;