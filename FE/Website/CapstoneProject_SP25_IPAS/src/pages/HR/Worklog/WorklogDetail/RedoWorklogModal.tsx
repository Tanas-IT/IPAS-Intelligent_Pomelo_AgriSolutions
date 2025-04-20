// import { Alert, Form } from "antd";
// import { FormFieldModal, ModalForm } from "@/components";
// import { worklogFormFields } from "@/constants";
// import { AssignEmployee } from "@/pages";
// import { GetUser } from "@/payloads";
// import { CreateRedoWorklogRequest } from "@/payloads/worklog";
// import { userService, worklogService } from "@/services";
// import { fetchUserInfoByRole, getFarmId, getUserId, RulesManager } from "@/utils";
// import { Button, Flex, Modal, Select } from "antd";
// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";

// type RedoWorklogModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   failedOrRedoWorkLogId: number;
// };

// type EmployeeType = { fullName: string; avatarURL: string; userId: number };

// const RedoWorklogModal = ({ isOpen, onClose, onSuccess, failedOrRedoWorkLogId }: RedoWorklogModalProps) => {
//   const [form] = Form.useForm();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [allEmployees, setAllEmployees] = useState<GetUser[]>([]);
//   const [selectedEmployees, setSelectedEmployees] = useState<GetUser[]>([]);
//   const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
//   const [employee, setEmployee] = useState<EmployeeType[]>([]);
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);
//   const [hasDependency, setHasDependency] = useState<boolean>(false);

//   const handleCancel = () => {
//     onClose();
//     form.resetFields();
//     setSelectedEmployees([]);
//     setSelectedIds([]);
//     setSelectedReporter(null);
//   };

//   const handleAdd = async () => {
//     try {
//       const values = await form.validateFields();
  
//       if (selectedEmployees.length === 0) {
//         toast.error("Please assign at least one employee.");
//         return;
//       }
  
//       if (!selectedReporter) {
//         toast.error("Please select a reporter.");
//         return;
//       }
  
//       const date = new Date(values.dateWork);
//       const dateWork = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
//       const startTime = values.time?.[0]?.toDate().toLocaleTimeString();
//       const endTime = values.time?.[1]?.toDate().toLocaleTimeString();
  
//       const payload: CreateRedoWorklogRequest = {
//         failedOrRedoWorkLogId: failedOrRedoWorkLogId,
//         newWorkLogName: values.worklogName,
//         newDateWork: dateWork.toISOString(),
//         newStartTime: startTime,
//         newEndTime: endTime,
//         newListEmployee: selectedEmployees.map((employee) => ({
//           userId: employee.userId,
//           isReporter: employee.userId === selectedReporter,
//         })),
//         newAssignorId: Number(getUserId()),
//       };
  
//       console.log("Payload:", payload);
  
//       const result = await worklogService.addRedoWorklog(payload);
  
//       if (result.statusCode === 200) {
//         toast.success("Redo worklog created successfully");
//         onSuccess();
//         handleCancel();
//       } else {
//         toast.error(result.message);
//       }
//     } catch (error) {
//       console.error("Validation failed:", error);
//       toast.error("Failed to create redo worklog");
//     }
//   };
  

//   const handleAssignMember = () => setIsModalOpen(true);

//   const handleConfirmAssign = () => {
//     setSelectedEmployees(employee.filter((m) => selectedIds.includes(Number(m.userId))));
//     setIsModalOpen(false);
//   };

//   const fetchDependencies = async () => {
//           const response = await worklogService.getDependencyWorklog(failedOrRedoWorkLogId);
//           if(response.statusCode === 200 && response.data) {
//             setHasDependency(true);
//           } else {
//             setHasDependency(false);
//           }
//       };

//   useEffect(() => {
//     if (isOpen) {
//       fetchEmployees();
//       fetchDependencies();
//     }
//   }, [isOpen]);

//   const fetchEmployees = async () => {
//     const employees = await fetchUserInfoByRole("User");
//     setEmployee(employees);
//     setAllEmployees(employees);
//   };

//   const handleReporterChange = (userId: number) => {
//     setSelectedReporter(userId);
//   };

//   return (
//     <ModalForm
//       isOpen={isOpen}
//       onClose={handleCancel}
//       isUpdate={false}
//       title="Create Redo Worklog"
//       onSave={handleAdd}
//     >
//       <Form form={form} layout="vertical">
//         <FormFieldModal
//           label="Task Name"
//           rules={RulesManager.getWorklogNameRules()}
//           placeholder="Enter the new task name"
//           name={worklogFormFields.worklogName}
//         />

//         <FormFieldModal
//           label="Date"
//           rules={RulesManager.getTimeRules()}
//           type="date"
//           name={worklogFormFields.dateWork}
//         />

//         <FormFieldModal
//           label="Time"
//           rules={RulesManager.getTimeRules()}
//           type="time"
//           name={worklogFormFields.time}
//         />

//         <AssignEmployee
//           members={selectedEmployees}
//           onAssign={handleAssignMember}
//           onReporterChange={handleReporterChange}
//           selectedReporter={selectedReporter}
//         />

//         <Modal
//           title="Assign Members"
//           open={isModalOpen}
//           onOk={handleConfirmAssign}
//           onCancel={() => setIsModalOpen(false)}
//         >
//           <Select
//             mode="multiple"
//             style={{ width: "100%" }}
//             placeholder="Select employees"
//             value={selectedIds}
//             onChange={setSelectedIds}
//             optionLabelProp="label"
//           >
//             {employee.map((emp) => (
//               <Select.Option key={emp.userId} value={emp.userId} label={emp.fullName}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                   <img
//                     src={emp.avatarURL}
//                     alt={emp.fullName}
//                     style={{ width: 24, height: 24, borderRadius: "50%" }}
//                     crossOrigin="anonymous"
//                   />
//                   <span>{emp.fullName}</span>
//                 </div>
//               </Select.Option>
//             ))}
//           </Select>
//         </Modal>
//         {hasDependency && (
//           <Alert
//             message="Warning"
//             description="This worklog has dependencies. Redoing it may affect related tasks."
//             type="warning"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//       </Form>
//     </ModalForm>
//   );
// };

// export default RedoWorklogModal;
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
      const farmId = getFarmId(); // Assuming getFarmId returns number
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={emp.avatarURL}
                    alt={emp.fullName}
                    style={{ width: 24, height: 24, borderRadius: "50%" }}
                    crossOrigin="anonymous"
                  />
                  <span>
                    {emp.fullName} - Skills: {emp.workSkillName.join(", ") || "None"} - Score: {emp.scoreOfSkill}
                  </span>
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