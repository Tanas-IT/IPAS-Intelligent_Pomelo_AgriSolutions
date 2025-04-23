import { Alert, Form } from "antd";
import { FormFieldModal, ModalForm } from "@/components";
import { worklogFormFields } from "@/constants";
import { AssignEmployee } from "@/pages";
import { worklogService } from "@/services";
import { getFarmId, getUserId, RulesManager } from "@/utils";
import { Button, Flex, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CreateRedoWorklogRequest, EmployeeWithSkills } from "@/payloads/worklog";
import { Icons } from "@/assets";

type RedoWorklogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  failedOrRedoWorkLogId: number;
};

const RedoWorklogModal = ({ isOpen, onClose, onSuccess, failedOrRedoWorkLogId }: RedoWorklogModalProps) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<EmployeeWithSkills[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeWithSkills[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeWithSkills[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hasDependency, setHasDependency] = useState<boolean>(false);

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

      if (selectedEmployees.length === 0) {
        toast.error("Please assign at least one employee.");
        return;
      }

      if (!selectedReporter) {
        toast.error("Please select a reporter.");
        return;
      }

      const date = new Date(values.dateWork);
      const dateWork = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const startTime = values.time?.[0]?.toDate().toLocaleTimeString();
      const endTime = values.time?.[1]?.toDate().toLocaleTimeString();

      const payload: CreateRedoWorklogRequest = {
        failedOrRedoWorkLogId: failedOrRedoWorkLogId,
        newWorkLogName: values.worklogName,
        newDateWork: dateWork.toISOString(),
        newStartTime: startTime,
        newEndTime: endTime,
        newListEmployee: selectedEmployees.map((employee) => ({
          userId: employee.userId,
          isReporter: employee.userId === selectedReporter,
        })),
        newAssignorId: Number(getUserId()),
      };

      console.log("Payload:", payload);

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

  const fetchDependencies = async () => {
    const response = await worklogService.getDependencyWorklog(failedOrRedoWorkLogId);
    if (response.statusCode === 200 && response.data) {
      setHasDependency(true);
    } else {
      setHasDependency(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchDependencies();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const farmId = getFarmId();
      const response = await worklogService.getEmployeesByWorkSkill(Number(farmId));
      if (response.statusCode === 200) {
        setEmployee(response.data);
        setAllEmployees(response.data);
      } else {
        toast.error("Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Error fetching employees");
    }
  };

  const handleReporterChange = (userId: number) => {
    setSelectedReporter(userId);
  };

  const formatSkills = (skills: { skillName: string; score: number }[]) => {
    return skills.length > 0
      ? skills.map(skill => `${skill.skillName} (${skill.score})`).join(", ")
      : "None";
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
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    position: "relative",
                    width: 32,
                    height: 32,
                    flexShrink: 0
                  }}>
                    <img
                      src={emp.avatarURL}
                      alt={emp.fullName}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #e6f7ff"
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div style={{
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      fontWeight: 500,
                      color: "rgba(0, 0, 0, 0.88)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {emp.fullName}
                    </div>

                    <div style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 4,
                      flexWrap: "wrap"
                    }}>
                      {emp.skillWithScore.slice(0, 3).map(skill => (
                        <div key={skill.skillName} style={{
                          display: "flex",
                          alignItems: "center",
                          background: skill.score >= 7 ? "#f6ffed" : "#fafafa",
                          border: `1px solid ${skill.score >= 7 ? "#b7eb8f" : "#d9d9d9"}`,
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontSize: 12,
                          lineHeight: 1
                        }}>
                          <Icons.grade
                            width={12}
                            height={12}
                            style={{
                              marginRight: 4,
                              color: "yellow"
                            }}
                          />
                          <span style={{
                            color: "rgba(0, 0, 0, 0.65)"
                          }}>
                            {skill.skillName} <strong>{skill.score}</strong>
                          </span>
                        </div>
                      ))}
                      {emp.skillWithScore.length > 3 && (
                        <div style={{
                          background: "#f0f0f0",
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontSize: 12
                        }}>
                          +{emp.skillWithScore.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Modal>
        {hasDependency && (
          <Alert
            message="Warning"
            description="This worklog has dependencies. Redoing it may affect related tasks."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </Form>
    </ModalForm>
  );
};

export default RedoWorklogModal;