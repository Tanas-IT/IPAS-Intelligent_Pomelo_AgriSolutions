import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { graftedPlantFormFields, HEALTH_STATUS } from "@/constants";
import { GetGraftedPlant, GraftedPlantRequest } from "@/payloads";
import dayjs from "dayjs";
import { usePlantLotOptions } from "@/hooks";

type CuttingGraftedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lotId: number) => void;
  isLoadingAction?: boolean;
};

const CuttingGraftedModal = ({
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
      saveLabel="Cut & Move"
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          type="select"
          label="Destination Lot"
          options={plantLotOptions}
          rules={RulesManager.getRequiredRules("Destination Lot")}
          name="lot"
        />
      </Form>
    </ModalForm>
  );
};

export default CuttingGraftedModal;
