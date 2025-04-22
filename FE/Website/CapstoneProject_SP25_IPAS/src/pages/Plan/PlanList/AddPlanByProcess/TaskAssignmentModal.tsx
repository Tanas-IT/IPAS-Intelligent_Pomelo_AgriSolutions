import React, { useEffect, useState } from "react";
import { Modal, Select, Button, Form, Radio, Avatar, Tooltip, Flex } from "antd";

const { Option } = Select;

interface TaskAssignmentModalProps {
    visible: boolean;
    onCancel: () => void;
    onSave: (employees: any[], planId: number, reporterId: number | null) => void;
    employees: any[];
    selectedPlanId: number | null;
    initialValues?: {
        employees: number[];
        reporter: number;
    } | null;
}

const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
    visible,
    onCancel,
    onSave,
    employees,
    selectedPlanId,
    initialValues,
}) => {
    const [form] = Form.useForm();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reporterId, setReporterId] = useState<number | null>(null);
    console.log("ids", selectedIds);
    console.log("initialValues", initialValues);
    
    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                employees: initialValues.employees,
                reporter: initialValues.reporter,
            });
            setSelectedIds(initialValues.employees);
            setReporterId(initialValues.reporter);
        }
    }, [visible, initialValues, form]);

    const handleSave = () => {
        console.log("handle save");
        
        const selectedEmployees = employees
            .filter((emp) => selectedIds.includes(emp.userId))
            .map((emp) => ({
                userId: emp.userId,
                isReporter: emp.userId === reporterId,
            }));

        if (selectedPlanId) {
            console.log("vo day");
            
            onSave(selectedEmployees, selectedPlanId, reporterId);
            console.log("da goi onSave");
        }
        onCancel();
    };

    return (
        <Modal
            title="Assign Employees"
            visible={visible}
            onOk={handleSave}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSave}>
                    Save
                </Button>,
            ]}
        >
            <Form>
                <Form.Item label="Select Employees">
                    <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        placeholder="Select employees"
                        value={selectedIds}
                        onChange={setSelectedIds}
                        optionLabelProp="label"
                    >
                        {employees.map((emp) => (
                            <Option key={emp.userId} value={emp.userId} label={emp.fullName}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <img
                                        src={emp.avatarURL}
                                        alt={emp.fullName}
                                        style={{ width: 24, height: 24, borderRadius: "50%" }}
                                        crossOrigin="anonymous"
                                    />
                                    <span>{emp.fullName}</span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                {selectedIds?.length > 0 && (
                    <Form.Item label="Select Reporter">
                        <Flex vertical gap={10}>
                            {employees
                                .filter((emp) => selectedIds.includes(emp.userId))
                                .map((emp) => (
                                    <Tooltip title={emp.fullName} key={emp.userId}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Avatar src={emp.avatarURL} crossOrigin="anonymous" />
                                            <Radio
                                                checked={reporterId === emp.userId}
                                                onChange={() => setReporterId(emp.userId)}
                                            >
                                                Reporter
                                            </Radio>
                                        </div>
                                    </Tooltip>
                                ))}
                        </Flex>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default TaskAssignmentModal;