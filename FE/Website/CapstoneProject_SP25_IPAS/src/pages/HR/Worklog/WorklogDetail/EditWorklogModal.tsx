import { GetUser } from "@/payloads";
import { Modal, Flex, DatePicker, Button, Tag, Image } from "antd";
import EmployeeTable from "./EmployeeTable";
import EditableTimeRangeField from "./EditableTimeField";
import dayjs from "dayjs";
import { Images } from "@/assets";
import { EmployeeWithSkills, GetAttendanceList, GetWorklogDetail, ReplacementEmployee } from "@/payloads/worklog";
import { useEffect, useState } from "react";
import { worklogService } from "@/services";
import { getFarmId } from "@/utils";
import { toast } from "react-toastify";

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
  onSave: (tempReporterId?: number, replacingStates?: { [key: number]: number | null }) => void;
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
  const [employee, setEmployee] = useState<EmployeeWithSkills[]>([]);
  const [tempReporterId, setTempReporterId] = useState<number | undefined>(initialReporterId);
  const [replacingStates, setReplacingStates] = useState<{ [key: number]: number | null }>({});
  const isEditable = worklog?.status === "Not Started" || worklog?.status === "In Progress";
  const isTimeAndDateEditable = worklog?.status === "Not Started";

  const fetchEmployees = async () => {
      try {
        const farmId = getFarmId();
        const response = await worklogService.getEmployeesByWorkSkill(Number(farmId), worklog?.masterTypeId);
        if (response.statusCode === 200) {
          setEmployee(response.data);
        } else {
          toast.warning("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.warning("Error fetching employees");
      }
    };

    const fetchListAttendance = async () => {
      try {
        const result = await worklogService.getEmpListForUpdate(Number(id));
        if (result.statusCode === 200) {
          setList(result.data);
  
          if (initialReporterId) {
            setTempReporterId(initialReporterId);
          } else {
            if (worklog && worklog?.replacementEmployee?.length > 0) {
              const replacementReporter = worklog.replacementEmployee.find((emp) => emp.replaceUserIsRepoter);
              if (replacementReporter) {
                setTempReporterId(replacementReporter.replaceUserId);
                return;
              }
            }
            if (worklog && worklog?.reporter?.length > 0) {
              const reporterEmp = worklog.reporter.find((emp) => emp.isReporter);
              if (reporterEmp) {
                setTempReporterId(reporterEmp.userId);
              } else {
                console.log("[DEBUG] No reporter found in worklog.reporter");
              }
            } else {
              console.log("[DEBUG] No worklog.reporter available");
            }
          }
        } else {
          toast.warning("Failed to fetch attendance list");
        }
      } catch (error) {
        console.error("Error fetching attendance list:", error);
        toast.warning("Error fetching attendance list");
      }
    };

  useEffect(() => {
    if (visible) {
      fetchListAttendance();
      fetchEmployees();
      setReplacingStates({});
    }
  }, [visible, initialReporterId, id, worklog]);

  const handleClose = () => {
    onClose();
    setList(list);
    setTempReporterId(initialReporterId);
    setReplacingStates({});
  };

  const handleUpdateTempReporter = (userId: number) => {
    if (typeof userId === "number") {
      setTempReporterId(userId);
    }
  };

  const handleUpdateReplacingStates = (states: { [key: number]: number | null }) => {
    setReplacingStates(states);
  };

  const handleSave = () => {
    onSave(tempReporterId, replacingStates);
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
      width={1000}
    >
      <EmployeeTable
        employees={list}
        attendanceStatus={attendanceStatus}
        onReplaceEmployee={onReplaceEmployee}
        onUpdateTempReporter={handleUpdateTempReporter}
        onUpdateReplacingStates={handleUpdateReplacingStates}
        isEditable={isEditable}
        initialReporterId={initialReporterId}
        tempReporterId={tempReporterId}
        worklog={worklog}
      />

      <Flex vertical gap={16} style={{ marginTop: 16 }}>
        <label>Working Time:</label>
        <EditableTimeRangeField
          value={selectedTimeRange}
          onChange={onTimeRangeChange}
          disabled={!isTimeAndDateEditable}
        />
        <label>Date:</label>
        <DatePicker
          value={selectedDate ? dayjs(selectedDate) : null}
          onChange={(date) => {
            const selectedDateString = date ? date.format("YYYY-MM-DD") : "";
            onDateChange(selectedDateString);
          }}
          disabled={!isTimeAndDateEditable}
        />
      </Flex>
    </Modal>
  );
};

export default EditWorklogModal;