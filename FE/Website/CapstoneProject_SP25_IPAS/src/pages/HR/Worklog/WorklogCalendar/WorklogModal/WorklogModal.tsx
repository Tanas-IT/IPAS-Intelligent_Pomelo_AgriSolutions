import { FormFieldModal, InfoField, ModalForm, TimePickerInfo } from "@/components";
import { worklogFormFields } from "@/constants";
import { AssignEmployee } from "@/pages";
import { GetUser } from "@/payloads";
import { CreateWorklogRequest } from "@/payloads/worklog";
import { cropService, planService, userService } from "@/services";
import { fetchUserInfoByRole, getFarmId, RulesManager } from "@/utils";
import { Flex, Form, Modal, Select } from "antd";
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
  const [cropOptions, setCropOptions] = useState<{ value: string; label: string }[]>([]);
  const [landPlotOptions, setLandPlotOptions] = useState<{ value: string; label: string }[]>([]);
  const [planOptions, setPlanOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const farmId = getFarmId();

  const handleCancel = () => {
    onClose();
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    const date = new Date(values.dateWork);
    const dateWork = new Date(date.getTime() - date.getTimezoneOffset()*60000);
    const startTime = values.time?.[0]?.toDate().toLocaleTimeString();
    const endTime = values.time?.[1]?.toDate().toLocaleTimeString();
    console.log("Form values:", values);
    const payload = {
      workLogName: values.worklogName,
      dateWork: dateWork.toISOString(),
      startTime: startTime,
      endTime: endTime,
      planId: values.planId,
      listEmployee: selectedEmployees.map((employee) => ({
        userId: employee.userId,
        isReporter: employee.userId === selectedReporter,
      })),
    }
    console.log("payloaddđ", payload);
    

    onSave(payload);

    onClose();
    form.resetFields();
  };

  const handleCropChange = () => { };

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
    setEmployee(await fetchUserInfoByRole("User"));
  };

  const fetchPlanOptions = async () => {
    const plans = await planService.getPlansForSelect(Number(getFarmId()));
    console.log("000", plans);
    
    const formattedPlanOptions = plans.data.map((plan) => ({
      value: plan.id,
      label: plan.name,
    }));
    setPlanOptions(formattedPlanOptions);
  };

  const handleReporterChange = (userId: number) => {
    setSelectedReporter(userId);
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
        <FormFieldModal
          label="Plan"
          rules={RulesManager.getPlanNameRules()}
          type="select"
          name={worklogFormFields.planId}
          options={planOptions}
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
          onAssign={() => handleAssignMember()}
          onReporterChange={handleReporterChange}
          selectedReporter={selectedReporter} />

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
        {/* <label className={style.createdBy}> <span>Created by: </span>{authData.fullName}</label> */}
      </Form>
    </ModalForm>
  );
};

export default WorklogModal;
