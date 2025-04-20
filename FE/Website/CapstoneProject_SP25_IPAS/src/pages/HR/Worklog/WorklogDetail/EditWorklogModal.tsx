import { GetUser } from "@/payloads";
import { Modal, Flex, DatePicker, Button, Tag, Image } from "antd";
import EmployeeTable from "./EmployeeTable";
import EditableTimeRangeField from "./EditableTimeField";
import dayjs from "dayjs";
import { Images } from "@/assets";
import { GetAttendanceList, GetWorklogDetail, ReplacementEmployee } from "@/payloads/worklog";
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
  onSave: (tempReporterId?: number) => void;
  replacementEmployees: ReplacementEmployee[];
  worklog?: GetWorklogDetail;
  initialReporterId?: number;
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
  replacementEmployees,
  worklog,
  initialReporterId,
}) => {
  const [list, setList] = useState<GetAttendanceList[]>([]);
  const [tempReporterId, setTempReporterId] = useState<number | undefined>(initialReporterId);
  const isEditable = worklog?.status === "Not Started";

  const fetchListAttendance = async () => {
    try {
      const result = await worklogService.getEmpListForUpdate(Number(id));
      if (result.statusCode === 200) {
        setList(result.data);
      }
    } catch (error) {
      console.error("Error fetching attendance list:", error);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchListAttendance();
      setTempReporterId(initialReporterId);
    }
  }, [visible, initialReporterId]);

  const handleClose = () => {
    onClose();
    setList(list);
    setTempReporterId(initialReporterId);
  };

  const handleUpdateTempReporter = (userId: number) => {
    if (typeof userId === "number") {
      setTempReporterId(userId);
    }
  };

  const handleSave = () => {
    onSave(tempReporterId);
  };

  return (
    <Modal
      title="Edit Worklog"
      visible={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} disabled={!isEditable}>
          Save
        </Button>,
      ]}
      width={800}
    >
      <EmployeeTable
        employees={list}
        attendanceStatus={attendanceStatus}
        onReplaceEmployee={onReplaceEmployee}
        onUpdateTempReporter={handleUpdateTempReporter}
        isEditable={isEditable}
        initialReporterId={initialReporterId}
        tempReporterId={tempReporterId}
      />

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        <label>Working Time:</label>
        <EditableTimeRangeField
          value={selectedTimeRange}
          onChange={onTimeRangeChange}
          disabled={!isEditable}
        />
        <label>Date:</label>
        <DatePicker
          value={selectedDate ? dayjs(selectedDate) : null}
          onChange={(date) => {
            const selectedDateString = date ? date.format("YYYY-MM-DD") : "";
            onDateChange(selectedDateString);
          }}
          disabled={!isEditable}
        />
      </Flex>
    </Modal>
  );
};

export default EditWorklogModal;