import { Icons } from "@/assets";
import { FormFieldModal, ModalForm } from "@/components";
import { MASTER_TYPE, worklogFormFields } from "@/constants";
import { useMasterTypeOptions } from "@/hooks";
import { AssignEmployee } from "@/pages";
import { GetUser } from "@/payloads";
import { CreateWorklogRequest } from "@/payloads/worklog";
import { planService, userService } from "@/services";
import { fetchUserInfoByRole, getFarmId, RulesManager } from "@/utils";
import { Button, Flex, Form, Modal, Select } from "antd";
import { useEffect, useState } from "react";

type WorklogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: CreateWorklogRequest) => void;
};

type EmployeeType = { fullName: string; avatarURL: string; userId: number };

const WorklogModal = ({ isOpen, onClose, onSave }: WorklogModalProps) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<GetUser[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<GetUser[]>([]);
  const [planOptions, setPlanOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const farmId = getFarmId();
  const { options: workTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const handleCancel = () => {
    onClose();
    form.resetFields();
    setSelectedEmployees([]);
    setSelectedIds([]);
    setSelectedReporter(null);
    setSelectedPlan(null);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const date = new Date(values.dateWork);
      const dateWork = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const startTime = values.time?.[0]?.toDate().toLocaleTimeString();
      const endTime = values.time?.[1]?.toDate().toLocaleTimeString();

      const payload: CreateWorklogRequest = {
        workLogName: values.worklogName,
        dateWork: dateWork.toISOString(),
        startTime: startTime,
        endTime: endTime,
        planId: values.planId,
        listEmployee: selectedEmployees.map((employee) => ({
          userId: employee.userId,
          isReporter: employee.userId === selectedReporter,
        })),
      };

      console.log("Payload:", payload);
      onSave(payload);

      handleCancel();
    } catch (error) {
      console.error("Validation failed:", error);
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
      fetchPlanOptions();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    const employees = await fetchUserInfoByRole("User");
    setEmployee(employees);
    setAllEmployees(employees);
  };

  const fetchPlanOptions = async () => {
    const plans = await planService.getPlansForSelect(Number(getFarmId()));
    const formattedPlanOptions = plans.data.map((plan) => ({
      value: plan.id,
      label: plan.name,
    }));
    setPlanOptions(formattedPlanOptions);
  };

  const handleReporterChange = (userId: number) => {
    setSelectedReporter(userId);
  };

  const handleClearPlan = () => {
    form.setFieldsValue({ [worklogFormFields.planId]: undefined }); // Xóa giá trị trong Form
    setSelectedPlan(null); // Cập nhật state
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      isUpdate={false}
      title="Add New Worklog"
      onSave={handleAdd}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Task Name"
          rules={RulesManager.getWorklogNameRules()}
          placeholder="Enter the task name"
          name={worklogFormFields.worklogName}
        />

        <Flex vertical gap={4}>
          <FormFieldModal
            label="Plan"
            type="select"
            name={worklogFormFields.planId}
            options={planOptions}
            onChange={(value) => {
              setSelectedPlan(value);
              if (value) {
                form.setFieldsValue({ [worklogFormFields.masterTypeId]: undefined });
              }
            }}
          />
          {selectedPlan && (
            <Flex justify="flex-end">
              <Button
                type="link"
                onClick={handleClearPlan}
                style={{
                  height: "auto",
                  color: "#1890ff",
                  width: "fit-content",
                  marginTop: -10,
                }}
              >
                Clear
              </Button>
            </Flex>

          )}
        </Flex>

        <FormFieldModal
          label="Type of work"
          type="select"
          name={worklogFormFields.masterTypeId}
          options={workTypeOptions}
          disable={!!selectedPlan} // Disable khi có Plan
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

export default WorklogModal;