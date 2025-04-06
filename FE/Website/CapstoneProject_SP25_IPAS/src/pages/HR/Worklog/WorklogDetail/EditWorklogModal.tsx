import { GetUser } from "@/payloads";
import { Modal, Flex, DatePicker, Button, Tag, Image } from "antd";
import EmployeeTable from "./EmployeeTable";
import EditableTimeRangeField from "./EditableTimeField";
import dayjs from "dayjs";
import { Images } from "@/assets";
import { GetAttendanceList, ReplacementEmployee } from "@/payloads/worklog";
import { useEffect, useState } from "react";
import { worklogService } from "@/services";

interface EditWorklogModalProps {
  visible: boolean;
  onClose: () => void;
  employees: GetUser[];
  reporter: GetUser[];
  id: number;
  attendanceStatus: { [key: number]: string | null };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
  selectedTimeRange: [string, string];
  onTimeRangeChange: (newValue: [string, string]) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSave: () => void;
  onUpdateReporter: (userId: number, isReporter: boolean) => void;
  replacementEmployees: ReplacementEmployee[]; // Thêm prop này
}

const EditWorklogModal: React.FC<EditWorklogModalProps> = ({
  visible,
  onClose,
  employees,
  reporter,
  id,
  attendanceStatus,
  onReplaceEmployee,
  selectedTimeRange,
  onTimeRangeChange,
  selectedDate,
  onDateChange,
  onSave,
  onUpdateReporter,
  replacementEmployees,
}) => {
  const [list, setList] = useState<GetAttendanceList[]>([]);
  const fetchListAttendance = async () => {
      try {
        const result = await worklogService.getAttendanceList(Number(id));
        if (result.statusCode === 200) {
          setList(result.data);
        }
      } catch (error) {
        console.error("Error fetching attendance list:", error);
      }
    }
  useEffect(() => {
    if (visible) {
      fetchListAttendance();
    }
    }, [visible]);
    const handleClose = () => {
      onClose();
      setList(list);
    };
  return (
    <Modal
      title="Edit Worklog"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
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