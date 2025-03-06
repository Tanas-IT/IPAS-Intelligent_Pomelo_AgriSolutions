import { FormFieldModal, InfoField, ModalForm, TimePickerInfo } from "@/components";
import { worklogFormFields } from "@/constants";
import { AssignEmployee } from "@/pages";
import { GetUser } from "@/payloads";
import { CreateWorklogRequest } from "@/payloads/worklog";
import { cropService, userService } from "@/services";
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
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const farmId = getFarmId();

  const handleCancel = () => {
    onClose();
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    console.log("Form values:", values);

    onSave(values);

    onClose();
  };

  const handleCropChange = () => { };

  const handleAssignMember = () => setIsModalOpen(true);
  const handleConfirmAssign = () => { };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchCropOptions();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setEmployee(await fetchUserInfoByRole("User"));
  };

  const fetchCropOptions = async () => {
    const crops = await cropService.getCropsOfFarmForSelect(farmId);
    const formattedCropOptions = crops.map((crop) => ({
      value: crop.cropId,
      label: crop.cropName,
    }));
    setCropOptions(formattedCropOptions);
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
        <Flex vertical={false} gap={10}>
          <FormFieldModal
            label="Crop"
            rules={RulesManager.getCropRules()}
            type="select"
            options={cropOptions}
            name={worklogFormFields.worklogName}
          />
          <FormFieldModal
            label="Land Plot"
            rules={RulesManager.getLandPlotRules()}
            type="select"
            options={cropOptions}
            name={worklogFormFields.landPlotId}
          />
        </Flex>
        <Flex vertical={false} gap={10}>
          <FormFieldModal
            label="Type"
            rules={RulesManager.getWorklogTypeRules()}
            type="select"
            options={cropOptions}
            name={worklogFormFields.type}
          />
          <FormFieldModal
            label="Process"
            rules={RulesManager.getProcessRules()}
            type="select"
            options={cropOptions}
            name={worklogFormFields.processId}
          />
        </Flex>
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
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        >
          <Form.Item name={worklogFormFields.responsibleBy}>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select employees"
              value={selectedEmployees}
              onChange={setSelectedEmployees}
            >
              {employee.map((employee) => (
                <Select.Option key={employee.userId} value={employee.userId}>
                  {employee.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Modal>
        {/* <label className={style.createdBy}> <span>Created by: </span>{authData.fullName}</label> */}
      </Form>
    </ModalForm>
  );
};

export default WorklogModal;
