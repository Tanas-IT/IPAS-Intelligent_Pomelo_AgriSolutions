import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, lotFormFields, MASTER_TYPE, PARTNER, WORK_TARGETS } from "@/constants";
import { GetPlantLot2, PlantLotRequest } from "@/payloads";
import { partnerService } from "@/services";
import { SelectOption } from "@/types";

type LotModelProps = {
  isOpen: boolean;
  onClose: (values: PlantLotRequest, isUpdate: boolean) => void;
  onSave: (values: PlantLotRequest) => void;
  isLoadingAction?: boolean;
  lotData?: GetPlantLot2;
};

const LotModel = ({ isOpen, onClose, onSave, lotData, isLoadingAction }: LotModelProps) => {
  const [form] = Form.useForm();
  const isUpdate = lotData !== undefined && Object.keys(lotData).length > 0;
  const [partnerOptions, setPartnerOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      const res = await partnerService.getSelectPartner(PARTNER.PROVIDER);
      if (res.statusCode === 200) {
        setPartnerOptions(
          res.data.map((partner) => ({
            label: partner.name,
            value: partner.id,
          })),
        );
      }
    };

    fetchPartners();
  }, []);

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && lotData) {
        form.setFieldsValue({ ...lotData });
      }
    }
  }, [isOpen, lotData]);

  const getFormData = (): PlantLotRequest => ({
    plantLotId: form.getFieldValue(lotFormFields.plantLotId),
    plantLotName: form.getFieldValue(lotFormFields.plantLotName),
    partnerId: form.getFieldValue(lotFormFields.partnerId),
    previousQuantity: form.getFieldValue(lotFormFields.previousQuantity),
    unit: form.getFieldValue(lotFormFields.unit),
    note: form.getFieldValue(lotFormFields.note),
  });

  const handleOk = async () => {
    await form.validateFields();
    // console.log(getFormData());
    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData(), isUpdate);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate ? "Update Type" : "Add New Type"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Lot Name"
          name={lotFormFields.plantLotName}
          rules={RulesManager.getLotNameRules()}
        />

        <FormFieldModal
          type="select"
          label="Partner"
          name={lotFormFields.partnerId}
          rules={RulesManager.getPartnerRules()}
          options={partnerOptions}
        />

        <Flex gap={20}>
          <FormFieldModal
            label="Quantity"
            name={lotFormFields.previousQuantity}
            rules={RulesManager.getQuantityRules()}
          />
          <FormFieldModal
            label="Unit"
            name={lotFormFields.unit}
            rules={RulesManager.getUnitRules()}
          />
        </Flex>

        <FormFieldModal
          type="textarea"
          label="Note"
          name={lotFormFields.note}
          placeholder="Enter note"
        />
      </Form>
    </ModalForm>
  );
};

export default LotModel;
