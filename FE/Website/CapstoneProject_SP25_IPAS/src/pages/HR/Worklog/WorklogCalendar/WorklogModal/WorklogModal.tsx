import { Icons } from "@/assets";
import { FormFieldModal, ModalForm } from "@/components";
import { MASTER_TYPE, worklogFormFields } from "@/constants";
import { useMasterTypeOptions } from "@/hooks";
import { AssignEmployee } from "@/pages";
import { GetUser } from "@/payloads";
import { CreateWorklogRequest, EmployeeWithSkills } from "@/payloads/worklog";
import { planService, userService, worklogService } from "@/services";
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
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeWithSkills[]>([]);
  const [planOptions, setPlanOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeWithSkills[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [planMasterTypeId, setPlanMasterTypeId] = useState<number | null>(null);
  const farmId = getFarmId();

  const handleCancel = () => {
    onClose();
    form.resetFields();
    setSelectedEmployees([]);
    setSelectedIds([]);
    setSelectedReporter(null);
    setSelectedPlan(null);
    setPlanMasterTypeId(null);
    setEmployee([]);
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
        masterTypeId: values.masterTypeId,
      };

      onSave(payload);

      handleCancel();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleAssignMember = () => {
    if (!selectedPlan) {
      Modal.error({
        title: "No Plan Selected",
        content: "Please select a plan before assigning employees.",
        okText: "Close",
      });
      return;
    }
    setIsModalOpen(true);
  };
  

  const handleConfirmAssign = () => {
    setSelectedEmployees(employee.filter((m) => selectedIds.includes(Number(m.userId))));
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlanOptions();
    }
  }, [isOpen]);

  const fetchPlanOptions = async () => {
    try {
      const plans = await planService.getPlansForSelect(Number(getFarmId()));
      const formattedPlanOptions = plans.data.map((plan) => ({
        value: plan.id,
        label: plan.name,
      }));
      setPlanOptions(formattedPlanOptions);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    }
  };

  const fetchPlanDetail = async (planId: number) => {
    try {
      const planDetail = await planService.getPlanDetail(planId.toString());
      setPlanMasterTypeId(planDetail.masterTypeId);
    } catch (error) {
      console.error(`Failed to fetch plan detail for planId: ${planId}`, error);
    }
  };

  const fetchEmployees = async (masterTypeId: number) => {
    try {
      const response = await worklogService.getEmployeesByWorkSkill(Number(farmId), masterTypeId);
      
      if (response.statusCode === 200) {
        setEmployee(response.data);
        setAllEmployees(response.data);
      } else {
        console.error("Failed to fetch employees:", response.message);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    if (planMasterTypeId !== null) {
      fetchEmployees(planMasterTypeId);
    } else {
      setEmployee([]);
      setSelectedEmployees([]);
      setSelectedIds([]);
    }
  }, [planMasterTypeId]);

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
          type="select"
          name={worklogFormFields.planId}
          rules={RulesManager.getPlanNameRules()}
          options={planOptions}
          onChange={(value) => {
            setSelectedPlan(value);
            setSelectedEmployees([]);
            setSelectedIds([]);
            setSelectedReporter(null);
            if (value) {
              fetchPlanDetail(value);
              form.setFieldsValue({ [worklogFormFields.masterTypeId]: undefined });
            } else {
              setPlanMasterTypeId(null);
            }
          }}
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
            disabled={employee.length === 0}
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
                  {/* Avatar */}
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
      </Form>
    </ModalForm>
  );
};

export default WorklogModal;