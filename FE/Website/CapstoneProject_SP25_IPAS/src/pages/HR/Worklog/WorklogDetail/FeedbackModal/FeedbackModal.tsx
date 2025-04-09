// import { Form } from "antd";
// import { FormFieldModal, InfoField, ModalForm } from "@/components";
// import { feedbackFormFields, worklogFormFields } from "@/constants";
// import { Flex } from "antd";
// import { useEffect, useState } from "react";
// import { getUserId, RulesManager } from "@/utils";
// import { CreateFeedbackRequest, GetFeedback } from "@/payloads";
// import { feedbackService } from "@/services";
// import { toast } from "react-toastify";
// import { TaskFeedback } from "@/payloads/worklog";

// type FeedbackModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (values: { feedback: string; status: string }) => void;
//   worklogId: number;
//   managerId: number;
//   onSuccess: () => void;
//   feedbackData?: TaskFeedback
// };

// const FeedbackModal = ({
//   isOpen,
//   onClose,
//   onSave,
//   worklogId,
//   managerId,
//   onSuccess,
//   feedbackData,
// }: FeedbackModalProps) => {
//   const [form] = Form.useForm();
//   const [status, setStatus] = useState<string>("Done");
//   const [statusOptions, setStatusOptions] = useState<string[]>([]);
//   const isUpdate = feedbackData !== undefined && Object.keys(feedbackData).length > 0;
// console.log("jjj");

//   useEffect(() => {
//     if (isOpen) {
//       if (isUpdate && feedbackData) {
//         form.setFieldsValue({
//           content: feedbackData.content,
//           status: "Redo",
//           reason: feedbackData.reason,
//         });
//       } else {
//         form.resetFields();
//       }
//     }
//   }, [isOpen, feedbackData]);

//   const handleSave = async () => {
//     const values = await form.validateFields();
//     let result;
//     if (isUpdate) {
//       const payloadUpdate: CreateFeedbackRequest = {
//         taskFeedbackId: feedbackData.taskFeedbackId,
//         content: values.content,
//         managerId: Number(getUserId()),
//         worklogId: feedbackData.workLogId,
//         status: values.status,
//         reason: values.reason,
//       };
//       console.log("payloadUpdate", payloadUpdate);
      
//       result = await feedbackService.updateFeedback(payloadUpdate);
//     } else {
//       const payload: CreateFeedbackRequest = {
//         content: values.content,
//         managerId,
//         worklogId,
//         status: values.status,
//         reason: values.reason,
//       };
//       result = await feedbackService.createFeedback(payload);
//     }

//     if (result.statusCode === 200) {
//       toast.success(result.message);
//       form.resetFields();
//       onSuccess();
//     } else {
//       toast.error(result.message);
//     }
//     onClose();
//   };

//   // const statusOptions = [
//   //   { value: "Done", label: "Done" },
//   //   { value: "Redo", label: "Redo" },
//   // ];

//   return (
//     <ModalForm
//       isOpen={isOpen}
//       onClose={onClose}
//       isUpdate={isUpdate}
//       title={isUpdate ? "Update Feedback" : "Add New Feedback"}
//       onSave={handleSave}
//     >
//       <Form form={form} layout="vertical">
//         <Flex vertical gap={10}>
//           <FormFieldModal
//             label="Content"
//             type="textarea"
//             rules={RulesManager.getContentFeedbackRules()}
//             placeholder="Enter the content"
//             name={feedbackFormFields.content}
//           />
//           <FormFieldModal
//             label="Worklog Status"
//             rules={RulesManager.getStatusWorklogFeedbackRules()}
//             name={feedbackFormFields.status}
//             options={statusOptions}
//             type="select"
//             onChange={(value) => setStatus(value)}
//           />
//           {status === "Redo" && (
//             <FormFieldModal
//               label="Reason for Redo"
//               type="textarea"
//               rules={[{ required: true, message: "Please provide a reason" }]}
//               placeholder="Enter the reason"
//               name={feedbackFormFields.reason}
//             />
//           )}
//         </Flex>
//       </Form>
//     </ModalForm>
//   );
// };

// export default FeedbackModal;
import { Form } from "antd";
import { FormFieldModal, ModalForm } from "@/components";
import { feedbackFormFields } from "@/constants";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import { getUserId, RulesManager } from "@/utils";
import { CreateFeedbackRequest } from "@/payloads";
import { feedbackService, worklogService } from "@/services";
import { toast } from "react-toastify";
import { TaskFeedback } from "@/payloads/worklog";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { feedback: string; status: string }) => void;
  worklogId: number;
  managerId: number;
  onSuccess: () => void;
  feedbackData?: TaskFeedback;
};

const FeedbackModal = ({
  isOpen,
  onClose,
  onSave,
  worklogId,
  managerId,
  onSuccess,
  feedbackData,
}: FeedbackModalProps) => {
  const [form] = Form.useForm();
  const [status, setStatus] = useState<string>(""); // Mặc định là "Done"
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]); // Lưu danh sách từ API
  const [loadingStatuses, setLoadingStatuses] = useState<boolean>(false); // Trạng thái loading khi fetch
  const isUpdate = feedbackData !== undefined && Object.keys(feedbackData).length > 0;
console.log("fb", feedbackData);

  // Fetch status options từ API khi modal mở
  useEffect(() => {
    const fetchStatusOptions = async () => {
      if (isOpen && statusOptions.length === 0) { // Chỉ fetch nếu chưa có dữ liệu
        setLoadingStatuses(true);
        try {
          const response = await worklogService.getWorklogStatus();
          if (response.statusCode === 200) {
            const statuses = (response.data as { status: string[] }).status;
            const options = statuses.map(status => ({
              value: status,
              label: status, // Dùng cùng giá trị cho value và label
            }));
            setStatusOptions(options);
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          console.error('Error fetching worklog statuses:', error);
          toast.error('Failed to load status options');
        } finally {
          setLoadingStatuses(false);
        }
      }
    };
    fetchStatusOptions();
  }, [isOpen]);

  // Cập nhật form khi modal mở
  useEffect(() => {
    if (isOpen) {
      if (isUpdate && feedbackData) {
        form.setFieldsValue({
          content: feedbackData.content,
          status: feedbackData.status || "Redo",
          reason: feedbackData.reason,
        });
        setStatus(feedbackData.status || "Redo");
      } else {
        form.resetFields();
        // form.setFieldsValue({ status: "Done" });
        // setStatus("Done");
      }
    }
  }, [isOpen, feedbackData, form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    let result;
    if (isUpdate) {
      const payloadUpdate: CreateFeedbackRequest = {
        taskFeedbackId: feedbackData.taskFeedbackId,
        content: values.content,
        managerId: Number(getUserId()),
        worklogId: feedbackData.workLogId,
        status: values.status,
        reason: values.reason,
      };
      console.log("payloadUpdate", payloadUpdate);
      result = await feedbackService.updateFeedback(payloadUpdate);
    } else {
      const payload: CreateFeedbackRequest = {
        content: values.content,
        managerId,
        worklogId,
        status: values.status,
        reason: values.reason,
      };
      result = await feedbackService.createFeedback(payload);
    }

    if (result.statusCode === 200) {
      toast.success(result.message);
      form.resetFields();
      onSuccess();
    } else {
      toast.error(result.message);
    }
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      isUpdate={isUpdate}
      title={isUpdate ? "Update Feedback" : "Add New Feedback"}
      onSave={handleSave}
    >
      <Form form={form} layout="vertical">
        <Flex vertical gap={10}>
          <FormFieldModal
            label="Content"
            type="textarea"
            rules={RulesManager.getContentFeedbackRules()}
            placeholder="Enter the content"
            name={feedbackFormFields.content}
          />
          <FormFieldModal
            label="Worklog Status"
            rules={RulesManager.getStatusWorklogFeedbackRules()}
            name={feedbackFormFields.status}
            options={statusOptions}
            type="select"
            onChange={(value) => setStatus(value)}
            placeholder={loadingStatuses ? "Loading statuses..." : "Select status"}
          />
          {status === "Redo" && (
            <FormFieldModal
              label="Reason for Redo"
              type="textarea"
              rules={[{ required: true, message: "Please provide a reason" }]}
              placeholder="Enter the reason"
              name={feedbackFormFields.reason}
            />
          )}
          {status === "Failed" && (
            <FormFieldModal
              label="Reason for Failed"
              type="textarea"
              rules={[{ required: true, message: "Please provide a reason" }]}
              placeholder="Enter the reason"
              name={feedbackFormFields.reason}
            />
          )}
        </Flex>
      </Form>
    </ModalForm>
  );
};

export default FeedbackModal;