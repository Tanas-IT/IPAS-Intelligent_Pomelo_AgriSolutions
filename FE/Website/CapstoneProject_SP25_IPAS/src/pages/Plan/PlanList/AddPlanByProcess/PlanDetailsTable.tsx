// import React, { useEffect } from "react";
// import { Table, Button, Form, Input, Select, Flex, Avatar } from "antd";
// import style from "./PlanDetailsTable.module.scss";
// import { useStyle } from "@/hooks";
// import { GetUser } from "@/payloads";
// import { getUserInfoById } from "@/utils";
// import { SelectOption } from "@/types";

// const { Option } = Select;

// interface PlanDetailsTableProps {
//     dataSource: any[];
//     onDataSourceChange: (dataSource: any[]) => void;
//     onSaveEmployees: (employees: any[], planId: number) => void;
//     onScheduleClick: (record: any) => void;
//     onTaskAssignmentClick: (record: any) => void;
//     // workTypeOptions: { value: number | string; label: string }[];
//     workTypeOptions: SelectOption[];
// }

// const PlanDetailsTable: React.FC<PlanDetailsTableProps> = ({
//     dataSource,
//     onDataSourceChange,
//     onScheduleClick,
//     onTaskAssignmentClick,
//     workTypeOptions,
//     onSaveEmployees,
// }) => {
//     const { styles } = useStyle();
//     const [form] = Form.useForm();
//     const [employeeMap, setEmployeeMap] = React.useState<Map<number, GetUser>>(new Map());

//     const fetchEmployeesInfo = async (userIds: number[]) => {
//         const userMap = new Map<number, GetUser>();
    
//         for (const userId of userIds) {
//             try {
//                 const userInfo = await getUserInfoById(userId);
//                 userMap.set(userId, userInfo);
//             } catch (error) {
//                 console.error(`Failed to fetch user info for userId: ${userId}`, error);
//             }
//         }
    
//         return userMap;
//     };

//     useEffect(() => {
//         const userIds = dataSource
//             .flatMap((plan) => plan.listEmployee?.map((emp: any) => emp.userId) || [])
//             .filter((userId, index, self) => self.indexOf(userId) === index); // Loại bỏ các userId trùng lặp
    
//         fetchEmployeesInfo(userIds).then((userMap) => {
//             setEmployeeMap(userMap);
//         });
//     }, [dataSource]);

//     const handleValuesChange = (changedValues: any, allValues: any) => {
//         console.log("Changed Values:", changedValues);
//         console.log("All Values in Form:", allValues);

//         const updatedDataSource = dataSource.map((plan) => {
//             const planValues = allValues[plan.planId];
//             if (planValues) {
//                 return {
//                     ...plan,
//                     planName: planValues.planName,
//                     planNote: planValues.planNote,
//                     planDetail: planValues.planDetail,
//                     masterTypeId: planValues.masterTypeId,
//                     listEmployee: plan.listEmployee,
//                     schedule: plan.schedule,
//                 };
//             }
//             return plan;
//         });

//         onDataSourceChange(updatedDataSource);
//     };
//     console.log("data source", dataSource);
    
//     const columns = [
//         {
//             title: "Plan Name",
//             dataIndex: "planName",
//             key: "planName",
//             render: (text: string, record: any) => (
//                 <Form.Item name={[record.planId, "planName"]} rules={[{ required: true }]}>
//                     <Input placeholder="Enter plan name" />
//                 </Form.Item>
//             ),
//         },
//         {
//             title: "Plan Note",
//             dataIndex: "planNote",
//             key: "planNote",
//             render: (text: string, record: any) => (
//                 <Form.Item name={[record.planId, "planNote"]}>
//                     <Input placeholder="Enter plan note" />
//                 </Form.Item>
//             ),
//         },
//         {
//             title: "Plan Detail",
//             dataIndex: "planDetail",
//             key: "planDetail",
//             render: (text: string, record: any) => (
//                 <Form.Item name={[record.planId, "planDetail"]}>
//                     <Input placeholder="Enter plan detail" />
//                 </Form.Item>
//             ),
//         },
//         {
//             title: "Type of Work",
//             dataIndex: "masterTypeId",
//             key: "masterTypeId",
//             render: (text: string, record: any) => (
//                 <Form.Item name={[record.planId, "masterTypeId"]}>
//                     <Select placeholder="Select type of work">
//                         {workTypeOptions.map((option) => (
//                             <Option key={option.value} value={option.value}>
//                                 {option.label}
//                             </Option>
//                         ))}
//                     </Select>
//                 </Form.Item>
//             ),
//         },
//         {
//             title: "Schedule",
//             dataIndex: "schedule",
//             key: "schedule",
//             render: (text: string, record: any) => (
//                 <Flex align="center" gap={8}>
//                     <span>{record.schedule ? "Schedule configured" : "No schedule configured"}</span>
//                     <Button type="link" onClick={() => onScheduleClick(record)}>
//                     {record.schedule ? "Edit" : "Add"}
//                     </Button>
//                 </Flex>
//             ),
//         },
//         {
//             title: "Employees",
//             dataIndex: "listEmployee",
//             key: "listEmployee",
//             render: (text: string, record: any) => {
//                 const { listEmployee } = record;
        
//                 return (
//                     <Flex align="center" gap={8}>
//                         {listEmployee && listEmployee.length > 0 ? (
//                             <Flex align="center" gap={8}>
//                                 {listEmployee.map((emp: any) => {
//                                     const userInfo = employeeMap.get(emp.userId);
//                                     return (
//                                         <Flex align="center" gap={4} key={emp.userId}>
//                                             <Avatar src={userInfo?.avatarURL} size="small" crossOrigin="anonymous"/>
//                                             <span>{userInfo?.fullName || `User ${emp.userId}`}</span>
//                                         </Flex>
//                                     );
//                                 })}
//                             </Flex>
//                         ) : (
//                             <span>No employees assigned</span>
//                         )}
//                         <Button type="link" onClick={() => onTaskAssignmentClick(record)}>
//                             Edit
//                         </Button>
//                     </Flex>
//                 );
//             },
//         }
//     ];

//     React.useEffect(() => {
//         if (dataSource && dataSource.length > 0) {
//             const initialValues = dataSource.reduce((acc, record) => {
//                 acc[record.planId] = {
//                     planName: record.planName,
//                     planNote: record.planNote,
//                     planDetail: record.planDetail,
//                     masterTypeId: record.masterTypeId,
//                     listEmployee: record.listEmployee,
//                     schedule: record.schedule,
//                 };
//                 return acc;
//             }, {});
//             console.log("Initial Form Values:", initialValues);
//             form.setFieldsValue(initialValues);
//         }
//     }, [dataSource, form]);

//     return (
//         <div>
//             <h3 className={style.planTargetTitle}>Plan Detail</h3>
//             <Form form={form} component={false} onValuesChange={handleValuesChange}>
//                 <Table
//                     className={`${style.tbl} ${styles.customeTable2}`}
//                     columns={columns}
//                     dataSource={dataSource}
//                     rowKey="planId"
//                     pagination={false}
//                 />
//             </Form>
//         </div>
//     );
// };

// export default PlanDetailsTable;
import React, { useEffect } from "react";
import { Table, Button, Form, Input, Select, Flex, Avatar } from "antd";
import style from "./PlanDetailsTable.module.scss";
import { useStyle } from "@/hooks";
import { GetUser } from "@/payloads";
import { getUserInfoById } from "@/utils";
import { DataSourceNode, PlanNode, ProcessNode, SubProcessNode } from "@/payloads";
import { SelectOption } from "@/types";

const { Option } = Select;

interface PlanDetailsTableProps {
  dataSource: DataSourceNode[];
  onDataSourceChange: (dataSource: DataSourceNode[]) => void;
  onSaveEmployees: (employees: any[], planId: number) => void;
  onScheduleClick: (record: PlanNode) => void;
  onTaskAssignmentClick: (record: PlanNode) => void;
  workTypeOptions: SelectOption[];
  form: any; // FormInstance từ Ant Design
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
    console.log("Changed Values:", changedValues);
    console.log("All Values in Form:", allValues);

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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: DataSourceNode) => {
        if (record.type === "plan") {
          return <span style={{ paddingLeft: 20 }}>{text}</span>;
        }
        return (
          <span>
            {text}
            {"subProcessOrder" in record && record.subProcessOrder ? ` (Order: ${record.subProcessOrder})` : ""}
          </span>
        );
      },
    },
    {
      title: "Plan Name",
      dataIndex: "planName",
      key: "planName",
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
      render: (text: string, record: DataSourceNode) => {
        if (record.type !== "plan") return null;
        return (
          <Form.Item name={[record.planId, "masterTypeId"]}>
            <Select placeholder="Select type of work">
              {workTypeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      key: "schedule",
      render: (text: string, record: DataSourceNode) => {
        if (record.type !== "plan") return null;
        return (
          <Flex align="center" gap={8}>
            <span>{record.schedule?.startDate ? "Schedule configured" : "No schedule configured"}</span>
            <Button type="link" onClick={() => onScheduleClick(record)}>
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
      render: (text: string, record: DataSourceNode) => {
        if (record.type !== "plan") return null;
        const { listEmployee } = record;
        return (
          <Flex align="center" gap={8}>
            {listEmployee && listEmployee.length > 0 ? (
              <Flex align="center" gap={8}>
                {listEmployee.map((emp: any) => {
                  const userInfo = employeeMap.get(emp.userId);
                  return (
                    <Flex align="center" gap={4} key={emp.userId}>
                      <Avatar src={userInfo?.avatarURL} size="small" crossOrigin="anonymous" />
                      <span>{userInfo?.fullName || `User ${emp.userId}`}</span>
                    </Flex>
                  );
                })}
              </Flex>
            ) : (
              <span>No employees assigned</span>
            )}
            <Button type="link" onClick={() => onTaskAssignmentClick(record)}>
              Edit
            </Button>
          </Flex>
        );
      },
    },
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