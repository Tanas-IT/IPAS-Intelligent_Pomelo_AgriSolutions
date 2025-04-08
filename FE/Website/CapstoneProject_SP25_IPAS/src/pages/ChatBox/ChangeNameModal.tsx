import { Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { usePlantLotOptions } from "@/hooks";
import { RulesManager } from "@/utils";

type ChangeNameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomName: string) => void;
  isLoadingAction?: boolean;
};

const ChangeNameModal = ({ isOpen, onClose, onSave, isLoadingAction }: ChangeNameModalProps) => {
  const [form] = Form.useForm();

  const resetForm = () => form.resetFields();

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen]);

  const handleOk = async () => {
    const values = await form.validateFields();

    onSave(values.name);
  };

  const handleCancel = () => onClose();

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Rename Chat"}
      saveLabel={"Save Change"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Chat Name"
          name="name"
          rules={RulesManager.getRequiredRules("Chat Name")}
        />
      </Form>
    </ModalForm>
  );
};

export default ChangeNameModal;
