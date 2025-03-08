import { Form } from "antd";
import { FormFieldModal, InfoField, ModalForm } from "@/components";
import { feedbackFormFields, worklogFormFields } from "@/constants";
import { Flex } from "antd";
import { useState } from "react";
import { RulesManager } from "@/utils";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { feedback: string; status: string }) => void;
};

const FeedbackModal = ({ isOpen, onClose, onSave }: FeedbackModalProps) => {
  const [form] = Form.useForm();
  const [status, setStatus] = useState<string>("done");

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    console.log("Feedback Form Values:", values);
    onSave(values);
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
      isUpdate={false}
      title="Feedback Worklog"
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
            name={feedbackFormFields.worklogStatus}
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
