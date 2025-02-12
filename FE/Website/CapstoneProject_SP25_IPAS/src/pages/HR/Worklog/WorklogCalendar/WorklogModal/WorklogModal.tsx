import { FormFieldModal, ModalForm, SelectInfo, TimePickerInfo } from "@/components";
import { worklogFormFields } from "@/constants";
import { AssignEmployee } from "@/pages";
import { GetUser } from "@/payloads";
import { CreateWorklogRequest } from "@/payloads/worklog";
import { userService } from "@/services";
import { RulesManager } from "@/utils";
import { Flex, Form, Modal, Select } from "antd";
import { useEffect, useState } from "react";

type WorklogModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: CreateWorklogRequest) => void;
};

const WorklogModal = ({ isOpen, onClose, onSave }: WorklogModalProps) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allEmployees, setAllEmployees] = useState<GetUser[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<GetUser[]>([]);
    const cropOptions = [
        { value: "Crop 1", label: "Certificate" },
        { value: "License", label: "License" },

    ];

    const handleCancel = () => {
        onClose();
    }

    const handleAdd = async () => {
        const values = await form.validateFields();
        console.log("Form values:", values);

        onSave(values);

        onClose();
    }

    const handleCropChange = () => {

    }

    const handleAssignMember = () => setIsModalOpen(true);
    const handleConfirmAssign = () => {
    };

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const employees = await userService.getUsersByRole("Employee");
            console.log('ggggggggg',employees);
            
            setAllEmployees(employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };
    return (
        <ModalForm
            isOpen={isOpen}
            onClose={handleCancel}
            isEdit={false}
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
                    <SelectInfo
                        label="Crop"
                        rules={RulesManager.getCropRules()}
                        name={worklogFormFields.cropId}
                        options={cropOptions}
                        isEditing={true}
                    />
                    <SelectInfo
                        label="Land Plot"
                        rules={RulesManager.getLandPlotRules()}
                        name={worklogFormFields.landPlotId}
                        options={cropOptions}
                        isEditing={true}
                    />
                </Flex>
                <Flex vertical={false} gap={10}>
                    <SelectInfo
                        label="Type"
                        rules={RulesManager.getWorklogTypeRules()}
                        name={worklogFormFields.type}
                        options={cropOptions}
                        isEditing={true}
                    />
                    <SelectInfo
                        label="Process"
                        rules={RulesManager.getProcessRules()}
                        name={worklogFormFields.processId}
                        options={cropOptions}
                        isEditing={true}
                    />
                </Flex>
                <TimePickerInfo
                    label="Time"
                    name={worklogFormFields.time}
                    rules={RulesManager.getTimeRules()}
                />
                <AssignEmployee members={selectedEmployees} onAssign={handleAssignMember} />

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
                        {allEmployees.map((employee) => (
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
}

export default WorklogModal;