import { Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { usePlantLotOptions } from "@/hooks";
import { RulesManager } from "@/utils";

type CuttingGraftedModalProps = {
  isMove?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lotId: number) => void;
  isLoadingAction?: boolean;
};

const CuttingGraftedModal = ({
  isMove = false,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: CuttingGraftedModalProps) => {
  const [form] = Form.useForm();
  const { options: plantLotOptions } = usePlantLotOptions(true);

  const resetForm = () => form.resetFields();

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen]);

  const handleOk = async () => {
    const values = await form.validateFields();

    onSave(values.lot);
  };

  const handleCancel = () => onClose();

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Select Lot for Grafted Plant"}
      saveLabel={isMove ? "Move" : "Complete"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          type="select"
          label="Destination Lot"
          options={plantLotOptions}
          rules={isMove ? RulesManager.getRequiredRules("Destination Lot") : []}
          name="lot"
          description={
            !isMove
              ? "Select a destination lot to cut and move the grafted plant. Moving a new lot is not required."
              : undefined
          }
        />
      </Form>
    </ModalForm>
  );
};

export default CuttingGraftedModal;
