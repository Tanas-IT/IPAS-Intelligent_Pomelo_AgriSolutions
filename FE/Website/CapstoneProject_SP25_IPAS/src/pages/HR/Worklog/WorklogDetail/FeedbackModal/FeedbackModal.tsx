import { Form } from "antd";
import { FormFieldModal, InfoField, ModalForm } from "@/components";
import { feedbackFormFields, worklogFormFields } from "@/constants";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import { RulesManager } from "@/utils";
import { CreateFeedbackRequest, GetFeedback } from "@/payloads";
import { feedbackService } from "@/services";
import { toast } from "react-toastify";
import { TaskFeedback } from "@/payloads/worklog";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { feedback: string; status: string }) => void;
  worklogId: number;
  managerId: number;
  onSuccess: () => void;
  feedbackData?: TaskFeedback
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
  const [status, setStatus] = useState<string>("Done");
  const isUpdate = feedbackData !== undefined && Object.keys(feedbackData).length > 0;

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (isUpdate && feedbackData) {
        form.setFieldsValue({ ...feedbackData });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, feedbackData]);

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload: CreateFeedbackRequest = {
      content: values.content,
      managerId,
      worklogId,
      status: values.status,
      reason: values.reason,
    };

    let result;
    if (isUpdate) {
      // Gọi API update feedback
      result = await feedbackService.updateFeedback(feedbackData.id, payload);
    } else {
      // Gọi API tạo feedback
      result = await feedbackService.createFeedback(payload);
    }

    if (result.statusCode === 200) {
      toast.success(result.message);
      form.resetFields();
      onSuccess(); // Gọi callback để cập nhật UI
    } else {
      toast.error(result.message);
    }
    onClose();
  };

  const statusOptions = [
    { value: "Done", label: "Done" },
    { value: "Redo", label: "Redo" },
  ];

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
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
        </Flex>
      </Form>
    </ModalForm>
  );
};

export default FeedbackModal;
