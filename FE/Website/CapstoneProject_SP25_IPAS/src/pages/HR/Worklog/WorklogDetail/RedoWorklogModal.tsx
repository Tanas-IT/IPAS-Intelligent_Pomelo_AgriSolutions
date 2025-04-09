import { Form } from "antd";
import { FormFieldModal, ModalForm } from "@/components";
import { worklogFormFields } from "@/constants";
import { AssignEmployee } from "@/pages";
import { GetUser } from "@/payloads";
import { CreateRedoWorklogRequest } from "@/payloads/worklog";
import { userService, worklogService } from "@/services";
import { fetchUserInfoByRole, getFarmId, getUserId, RulesManager } from "@/utils";
import { Button, Flex, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type RedoWorklogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  failedOrRedoWorkLogId: number; // ID của worklog cần redo
};

type EmployeeType = { fullName: string; avatarURL: string; userId: number };

const RedoWorklogModal = ({ isOpen, onClose, onSuccess, failedOrRedoWorkLogId }: RedoWorklogModalProps) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<GetUser[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<GetUser[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleCancel = () => {
    onClose();
    form.resetFields();
    setSelectedEmployees([]);
    setSelectedIds([]);
    setSelectedReporter(null);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const date = new Date(values.dateWork);
      const dateWork = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const startTime = values.time?.[0]?.toDate().toLocaleTimeString();
      const endTime = values.time?.[1]?.toDate().toLocaleTimeString();

      const payload: CreateRedoWorklogRequest = {
        failedOrRedoWorkLogId: failedOrRedoWorkLogId, // ID của worklog cần redo
        newWorkLogName: values.worklogName,
        newDateWork: dateWork.toISOString(),
        newStartTime: startTime,
        newEndTime: endTime,
        newListEmployee: selectedEmployees.map((employee) => ({
          userId: employee.userId,
          isReporter: employee.userId === selectedReporter,
        })),
        newAssignorId: Number(getUserId()), // Người tạo redo worklog (giả sử là người dùng hiện tại)
      };

      console.log("Payload:", payload);

      // Gọi API để tạo redo worklog
      const result = await worklogService.addRedoWorklog(payload);

      if (result.statusCode === 200) {
        toast.success("Redo worklog created successfully");
        onSuccess();
        handleCancel();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Failed to create redo worklog");
    }
  };

  const handleAssignMember = () => setIsModalOpen(true);

  const handleConfirmAssign = () => {
    setSelectedEmployees(employee.filter((m) => selectedIds.includes(Number(m.userId))));
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    const employees = await fetchUserInfoByRole("User");
    setEmployee(employees);
    setAllEmployees(employees);
  };

  const handleReporterChange = (userId: number) => {
    setSelectedReporter(userId);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      isUpdate={false}
      title="Create Redo Worklog"
      onSave={handleAdd}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Task Name"
          rules={RulesManager.getWorklogNameRules()}
          placeholder="Enter the new task name"
          name={worklogFormFields.worklogName}
        />

        <FormFieldModal
          label="Date"
          rules={RulesManager.getTimeRules()}
          type="date"
          name={worklogFormFields.dateWork}
        />

        <FormFieldModal
          label="Time"
          rules={RulesManager.getTimeRules()}
          type="time"
          name={worklogFormFields.time}
        />

        <AssignEmployee
          members={selectedEmployees}
          onAssign={handleAssignMember}
          onReporterChange={handleReporterChange}
          selectedReporter={selectedReporter}
        />

        <Modal
          title="Assign Members"
          open={isModalOpen}
          onOk={handleConfirmAssign}
          onCancel={() => setIsModalOpen(false)}
        >
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select employees"
            value={selectedIds}
            onChange={setSelectedIds}
            optionLabelProp="label"
          >
            {employee.map((emp) => (
              <Select.Option key={emp.userId} value={emp.userId} label={emp.fullName}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={emp.avatarURL}
                    alt={emp.fullName}
                    style={{ width: 24, height: 24, borderRadius: "50%" }}
                    crossOrigin="anonymous"
                  />
                  <span>{emp.fullName}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </Form>
    </ModalForm>
  );
};

export default RedoWorklogModal;