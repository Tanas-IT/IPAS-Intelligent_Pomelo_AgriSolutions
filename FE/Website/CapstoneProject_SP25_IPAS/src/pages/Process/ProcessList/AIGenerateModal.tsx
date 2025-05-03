import { Form, Input, Modal, Switch } from "antd";
import { FormFieldModal, ModalForm } from "@/components";
import { useState } from "react";
import { RulesManager } from "@/utils";
import { processFormFields } from "@/constants";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (processName: string, isSample: boolean) => void;
}

const AIGenerateModal = ({ isOpen, onClose, onGenerate }: AIGenerateModalProps) => {
  const [form] = Form.useForm();
  const [isSample, setIsSample] = useState<boolean>(false);

  const handleGenerate = async () => {
      const values = await form.validateFields();
      onGenerate(values.processName, isSample);
      form.resetFields();
      setIsSample(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsSample(false);
    onClose();
  };

  const handleIsSampleChange = (checked: boolean) => {
    setIsSample(checked);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onSave={handleGenerate}
      onClose={handleCancel}
      title="Generate Process with AI"
      isUpdate={false}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Process Name:"
          name={processFormFields.processName}
          rules={RulesManager.getProcessNameRules()}
          placeholder="Enter process name"
        />
        <FormFieldModal
          type="switch"
          label="Define Process Mode:"
          name={processFormFields.isSample}
          onChange={handleIsSampleChange}
          isCheck={isSample}
          direction="row"
          checkedChildren="Guide"
          unCheckedChildren="Plans"
        />
        <span style={{ fontSize: "12px", color: "#888", marginTop: "-20px" }}>
          {isSample
            ? "This process serves as a guide and only contains sub-processes."
            : "This process includes both sub-processes and plan lists."}
        </span>
      </Form>
    </ModalForm>
  );
};

export default AIGenerateModal;