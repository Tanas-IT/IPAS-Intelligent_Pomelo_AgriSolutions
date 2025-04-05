import { GetUser } from "@/payloads";
import { Modal, Flex, DatePicker, Button, Tag, Image } from "antd";
import EmployeeTable from "./EmployeeTable";
import EditableTimeRangeField from "./EditableTimeField";
import dayjs from "dayjs";
import { Images } from "@/assets";
import { GetAttendanceList, ReplacementEmployee } from "@/payloads/worklog";

interface EditWorklogModalProps {
  visible: boolean;
  onClose: () => void;
  employees: GetUser[];
  reporter: GetUser[];
  attendanceStatus: { [key: number]: string | null };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
  selectedTimeRange: [string, string];
  onTimeRangeChange: (newValue: [string, string]) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSave: () => void;
  onUpdateReporter: (userId: number, isReporter: boolean) => void;
  replacementEmployees: ReplacementEmployee[]; // Thêm prop này
  list: GetAttendanceList[];
}

const EditWorklogModal: React.FC<EditWorklogModalProps> = ({
  visible,
  onClose,
  employees,
  reporter,
  attendanceStatus,
  onReplaceEmployee,
  selectedTimeRange,
  onTimeRangeChange,
  selectedDate,
  onDateChange,
  onSave,
  onUpdateReporter,
  replacementEmployees,
  list
}) => {

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
        employees={list}
        // reporter={reporter}
        attendanceStatus={attendanceStatus}
        onReplaceEmployee={onReplaceEmployee}
        onUpdateReporter={onUpdateReporter}
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
            const selectedDateString = Array.isArray(dateString)
              ? dateString[0]
              : dateString;
            onDateChange(selectedDateString);
          }}
        />
      </Flex>
    </Modal>
  );
};

export default EditWorklogModal;