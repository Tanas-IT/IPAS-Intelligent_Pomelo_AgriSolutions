import React, { useEffect } from "react";
import { Table, Button, Form, Input, Select, Flex, Avatar } from "antd";
import style from "./PlanDetailsTable.module.scss";
import { useStyle } from "@/hooks";
import { GetUser } from "@/payloads";
import { getUserInfoById } from "@/utils";
import { DataSourceNode, PlanNode, ProcessNode, SubProcessNode } from "@/payloads";
import { SelectOption } from "@/types";
import { Tooltip } from "@/components";

const { Option } = Select;

interface PlanDetailsTableProps {
    dataSource: DataSourceNode[];
    onDataSourceChange: (dataSource: DataSourceNode[]) => void;
    onSaveEmployees: (employees: any[], planId: number) => void;
    onScheduleClick: (record: PlanNode) => void;
    onTaskAssignmentClick: (record: PlanNode) => void;
    workTypeOptions: SelectOption[];
    form: any;
}

const PlanDetailsTable: React.FC<PlanDetailsTableProps> = ({
    dataSource,
    onDataSourceChange,
    onSaveEmployees,
    onScheduleClick,
    onTaskAssignmentClick,
    workTypeOptions,
    form,
}) => {
    const { styles } = useStyle();
    const [employeeMap, setEmployeeMap] = React.useState<Map<number, GetUser>>(new Map());

    const hasChildren = (node: DataSourceNode): node is ProcessNode | SubProcessNode => {
        return "children" in node;
    };

    const fetchEmployeesInfo = async (userIds: number[]) => {
        const userMap = new Map<number, GetUser>();
        for (const userId of userIds) {
            try {
                const userInfo = await getUserInfoById(userId);
                userMap.set(userId, userInfo);
            } catch (error) {
                console.error(`Failed to fetch user info for userId: ${userId}`, error);
            }
        }
        return userMap;
    };

    useEffect(() => {
        const userIds = dataSource
            .flatMap((item) => {
                if (item.type === "plan") {
                    return item.listEmployee?.map((emp: any) => emp.userId) || [];
                }
                if (hasChildren(item)) {
                    return item.children.flatMap((child: DataSourceNode) =>
                        child.type === "plan" ? child.listEmployee?.map((emp: any) => emp.userId) || [] : []
                    );
                }
                return [];
            })
            .filter((userId, index, self) => self.indexOf(userId) === index);
        fetchEmployeesInfo(userIds).then((userMap) => {
            setEmployeeMap(userMap);
        });
    }, [dataSource]);

    const handleValuesChange = (changedValues: any, allValues: any) => {
        const updateChildren = (items: DataSourceNode[]): DataSourceNode[] => {
            return items.map((item) => {
                if (item.type === "plan") {
                    const planValues = allValues[item.planId];
                    if (planValues) {
                        return {
                            ...item,
                            planName: planValues.planName,
                            planNote: planValues.planNote,
                            planDetail: planValues.planDetail,
                            masterTypeId: planValues.masterTypeId,
                        } as PlanNode;
                    }
                }
                if (item.type === "process" || item.type === "subProcess") {
                    return {
                        ...item,
                        children: updateChildren(item.children as (PlanNode | SubProcessNode)[]),
                    } as ProcessNode | SubProcessNode;
                }
                return item;
            }) as DataSourceNode[];
        };

        const updatedDataSource = updateChildren(dataSource);
        onDataSourceChange(updatedDataSource);
    };

    const renderEmployees = (record: DataSourceNode) => {
        if (record.type !== "plan") return null;

        const { listEmployee = [] } = record;

        if (listEmployee.length === 0) {
            return (
                <Flex align="center" gap={8}>
                    <span className={style.noEmployees}>Not assigned</span>
                    <Button
                        type="text"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTaskAssignmentClick(record);
                        }}
                        className={style.editBtn}
                    >
                        Edit
                    </Button>
                </Flex>
            );
        }

        const MAX_VISIBLE_AVATARS = 3;
        const visibleEmployees = listEmployee.slice(0, MAX_VISIBLE_AVATARS);
        const extraCount = listEmployee.length - MAX_VISIBLE_AVATARS;

        return (
            <Flex align="center" gap={4}>
                {visibleEmployees.map((emp: any) => {
                    const userInfo = employeeMap.get(emp.userId);
                    return (
                        <Tooltip key={emp.userId} title={userInfo?.fullName || `User ${emp.userId}`}>
                            <Avatar src={userInfo?.avatarURL} size="small" crossOrigin="anonymous" />
                        </Tooltip>
                    );
                })}
                {extraCount > 0 && (
                    <Tooltip title={`${extraCount} more employees`}>
                        <Avatar size="small" className={style.extraAvatar}>+{extraCount}</Avatar>
                    </Tooltip>
                )}
                <Button
                    type="text"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onTaskAssignmentClick(record);
                    }}
                    className={style.editBtn}
                >
                    Edit
                </Button>
            </Flex>
        );
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 300,
            render: (text: string, record: DataSourceNode) => {
                if (record.type === "plan") {
                    return <span style={{ paddingLeft: 20 }}>{text}</span>;
                }
                if (record.type === "subProcess") {
                    const order = record.subProcessOrder !== null ? record.subProcessOrder : "N/A";
                    return <span>{`${text} (Sub: ${order})`}</span>;
                }
                return <span>{text}</span>;
            },
        },
        {
            title: "Plan Name",
            dataIndex: "planName",
            key: "planName",
            width: 250,
            render: (text: string, record: DataSourceNode) => {
                if (record.type !== "plan") return null;
                return (
                    <Form.Item name={[record.planId, "planName"]} rules={[{ required: true, message: "Plan name is required" }]}>
                        <Input placeholder="Enter plan name" />
                    </Form.Item>
                );
            },
        },
        {
            title: "Plan Note",
            dataIndex: "planNote",
            key: "planNote",
            width: 250,
            render: (text: string, record: DataSourceNode) => {
                if (record.type !== "plan") return null;
                return (
                    <Form.Item name={[record.planId, "planNote"]}>
                        <Input placeholder="Enter plan note" />
                    </Form.Item>
                );
            },
        },
        {
            title: "Plan Detail",
            dataIndex: "planDetail",
            key: "planDetail",
            width: 250,
            render: (text: string, record: DataSourceNode) => {
                if (record.type !== "plan") return null;
                return (
                    <Form.Item name={[record.planId, "planDetail"]}>
                        <Input placeholder="Enter plan detail" />
                    </Form.Item>
                );
            },
        },
        {
            title: "Type of Work",
            dataIndex: "masterTypeId",
            key: "masterTypeId",
            width: 150,
            render: (text: string, record: DataSourceNode) => {
                if (record.type !== "plan") return null;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Form.Item name={[record.planId, "masterTypeId"]}>
                        <Select placeholder="Select type of work">
                            {workTypeOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    </div>
                );
            },
        },
        {
            title: "Schedule",
            dataIndex: "schedule",
            key: "schedule",
            width: 200,
            render: (text: string, record: DataSourceNode) => {
                if (record.type !== "plan") return null;
                return (
                    <Flex align="center" gap={8}>
                        <span className={record.schedule?.startDate ? style.hasSchedule : style.noSchedule}>
                            {record.schedule?.startDate ? "Configured" : "Not configured"}
                        </span>
                        <Button
                            type="text"
                            size="small"
                            onClick={() => onScheduleClick(record)}
                            className={style.editBtn}
                        >
                            {record.schedule?.startDate ? "Edit" : "Add"}
                        </Button>
                    </Flex>
                );
            },
        },
        {
            title: "Employees",
            dataIndex: "listEmployee",
            key: "listEmployee",
            width: 180,
            render: (text: string, record: DataSourceNode) => renderEmployees(record),
        }
    ];

    return (
        <div>
            <h3 className={style.planTargetTitle}>Plan Detail</h3>
            <Form form={form} component={false} onValuesChange={handleValuesChange}>
                <Table
                    className={`${style.tbl} ${styles.customeTable2}`}
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="key"
                    pagination={false}
                    expandable={{
                        defaultExpandAllRows: false,
                        rowExpandable: (record) => hasChildren(record) && record.children.length > 0,
                    }}
                />
            </Form>
        </div>
    );
};

export default PlanDetailsTable;