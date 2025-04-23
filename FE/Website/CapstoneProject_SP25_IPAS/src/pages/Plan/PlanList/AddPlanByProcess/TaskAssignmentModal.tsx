import React, { useEffect, useState } from "react";
import { Modal, Select, Button, Form, Radio, Avatar, Tooltip, Flex, Tag } from "antd";
import { EmployeeWithSkills } from "@/payloads/worklog";
import { Icons } from "@/assets";

const { Option } = Select;

interface TaskAssignmentModalProps {
    visible: boolean;
    onCancel: () => void;
    onSave: (employees: any[], planId: number, reporterId: number | null) => void;
    employees: EmployeeWithSkills[];
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
        if (selectedIds.length === 0) {
            Modal.error({
                title: "Invalid Input",
                content: "Please select at least one employee.",
                okText: "Close",
            });
            return;
        }
        if (reporterId === null) {
            Modal.error({
                title: "Invalid Input",
                content: "Please select a reporter.",
                okText: "Close",
            });
            return;
        }

        const selectedEmployees = employees
            .filter((emp) => selectedIds.includes(emp.userId))
            .map((emp) => ({
                userId: emp.userId,
                isReporter: emp.userId === reporterId,
            }));

        if (selectedPlanId) {
            onSave(selectedEmployees, selectedPlanId, reporterId);
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
                <Button
                    key="save"
                    type="primary"
                    disabled={selectedIds.length === 0 || reporterId === null}
                    onClick={handleSave}
                >
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
                </Form.Item>
                {selectedIds?.length > 0 && (
                    <Form.Item label="Select Reporter">
                        <Flex vertical gap={10}>
                            {reporterId === null && (
                                <p style={{ color: "red", marginBottom: 8 }}>
                                    Please select a reporter
                                </p>
                            )}
                            {employees
                                .filter((emp) => selectedIds.includes(emp.userId))
                                .map((emp) => (
                                    <Tooltip title={emp.fullName} key={emp.userId}>
                                        <Flex
                                            align="center"
                                            gap={16}
                                            style={{
                                                padding: 16,
                                                borderRadius: 12,
                                                background: "#fff",
                                                border: "1px solid #f0f0f0",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                ...(reporterId === emp.userId
                                                    ? {
                                                        borderColor: "#1890ff",
                                                        background: "#f0f9ff",
                                                    }
                                                    : {}),
                                            }}
                                            data-selected={reporterId === emp.userId}
                                            onClick={() => setReporterId(emp.userId)}
                                        >
                                            <Avatar
                                                src={emp.avatarURL}
                                                size={48}
                                                style={{
                                                    border: "2px solid #fff",
                                                    boxShadow: "0 0 0 2px #e6f7ff",
                                                    transition: "all 0.3s",
                                                }}
                                                crossOrigin="anonymous"
                                            />

                                            <Flex vertical style={{ flex: 1 }}>
                                                <span
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: 500,
                                                        color: "rgba(0, 0, 0, 0.88)",
                                                    }}
                                                >
                                                    {emp.fullName}
                                                </span>

                                                <Flex
                                                    gap={4}
                                                    wrap="wrap"
                                                    style={{
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    {emp.skillWithScore.map((skill) => (
                                                        <Tag
                                                            key={skill.skillName}
                                                            icon={<Icons.score size={12} />}
                                                            color={skill.score > 7 ? "green" : "blue"}
                                                        >
                                                            {skill.skillName} ({skill.score})
                                                        </Tag>
                                                    ))}
                                                </Flex>
                                            </Flex>

                                            <Radio
                                                checked={reporterId === emp.userId}
                                                onChange={() => setReporterId(emp.userId)}
                                                style={{
                                                    marginLeft: "auto",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Icons.score
                                                    style={{
                                                        fontSize: 16,
                                                        color: reporterId === emp.userId ? "#ffc53d" : "#d9d9d9",
                                                        transition: "all 0.3s",
                                                        marginRight: 3,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: 14,
                                                        color: reporterId === emp.userId ? "#1890ff" : "#8c8c8c",
                                                        fontWeight: reporterId === emp.userId ? 500 : 400,
                                                        transition: "all 0.3s",
                                                    }}
                                                >
                                                    Reporter
                                                </span>
                                            </Radio>
                                        </Flex>
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