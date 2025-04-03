import { Modal, Radio, List, Flex, Image, Button } from "antd";
import { GetUser } from "@/payloads";
import { Images } from "@/assets";

interface AttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  employees: GetUser[];
  reporter: GetUser[];
  attendanceStatus: { [key: number]: string | null };
  onAttendanceChange: (userId: number, status: "Received" | "Rejected") => void;
  onSave: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible,
  onClose,
  employees,
  reporter,
  attendanceStatus,
  onAttendanceChange,
  onSave,
}) => {
  console.log("attendanceStatus", attendanceStatus);
  
  const combinedEmployees = [
    ...reporter.map((rep) => ({
      ...rep,
      isReporter: true,
      statusOfUserWorkLog: attendanceStatus[rep.userId] || null,
    })),
    ...employees.map((emp) => ({
      ...emp,
      isReporter: false,
      statusOfUserWorkLog: attendanceStatus[emp.userId] || null,
    })),
  ];
  console.log("999", combinedEmployees);
  
  return (
    <Modal
      title="Take Attendance"
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
    >
      <List
        dataSource={combinedEmployees}
        renderItem={(employee) => (
          <List.Item>
            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
              <Flex align="center" gap={8}>
                <Image
                  src={employee.avatarURL || Images.avatar}
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%" }}
                  crossOrigin="anonymous"
                />
                <span>{employee.fullName}</span>
              </Flex>
              <Radio.Group
                value={attendanceStatus[employee.userId] || undefined} 
                onChange={(e) => onAttendanceChange(employee.userId, e.target.value)}
              >
                <Radio value="Received">Present</Radio>
                <Radio value="Rejected">Absent</Radio>
              </Radio.Group>
            </Flex>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default AttendanceModal;