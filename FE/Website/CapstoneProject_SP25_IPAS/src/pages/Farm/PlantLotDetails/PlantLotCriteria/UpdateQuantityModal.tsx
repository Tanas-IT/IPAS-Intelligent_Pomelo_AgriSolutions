import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, lotFormFields } from "@/constants";

type UpdateQuantityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quantity: number) => void;
  target?: string;
  isLoadingAction?: boolean;
};

const UpdateQuantityModal = ({
  isOpen,
  onClose,
  onSave,
  target,
  isLoadingAction,
}: UpdateQuantityModalProps) => {
  const [form] = Form.useForm();

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
    }
  }, [isOpen]);

  const handleOk = async () => {
    await form.validateFields();
    const quantity = form.getFieldValue(
      target === CRITERIA_TARGETS["Plantlot Evaluation"] ? "lastQuantity" : "inputQuantity",
    );
    onSave(Number(quantity));
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={`Enter Quantity for Completed ${target}`}
      saveLabel="Save"
    >
      <Form form={form} layout="vertical">
        {target === CRITERIA_TARGETS["Plantlot Evaluation"] ? (
          <FormFieldModal
            label="Qualified Quantity"
            name="lastQuantity"
            rules={RulesManager.getQuantityRules()}
          />
        ) : (
          <FormFieldModal
            label="Checked Quantity"
            name="inputQuantity"
            rules={RulesManager.getQuantityRules()}
          />
        )}
      </Form>
    </ModalForm>
  );
};

export default UpdateQuantityModal;
