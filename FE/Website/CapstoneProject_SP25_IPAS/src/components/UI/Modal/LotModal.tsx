import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { lotFormFields, MASTER_TYPE, PARTNER } from "@/constants";
import { GetPlantLot2, PlantLotRequest } from "@/payloads";
import { partnerService } from "@/services";
import { SelectOption } from "@/types";
import { useMasterTypeOptions } from "@/hooks";

type LotModalProps = {
  isOpen: boolean;
  onClose: (values: PlantLotRequest, isUpdate: boolean) => void;
  onSave: (values: PlantLotRequest) => void;
  isLoadingAction?: boolean;
  lotData?: GetPlantLot2;
};

const LotModal = ({ isOpen, onClose, onSave, lotData, isLoadingAction }: LotModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = lotData !== undefined && Object.keys(lotData).length > 0;
  const [partnerOptions, setPartnerOptions] = useState<SelectOption[]>([]);
  const { options: cultivarTypeOptions } = useMasterTypeOptions(MASTER_TYPE.CULTIVAR);

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
    if (isOpen && lotData) {
      form.setFieldsValue({ ...lotData });
    }
    form.setFieldsValue({ ...lotData, unit: "Plant" });
  }, [isOpen, lotData]);

  const getFormData = (): PlantLotRequest =>
    Object.fromEntries(
      Object.values(lotFormFields).map((field) => [field, form.getFieldValue(field)]),
    ) as PlantLotRequest;

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
      title={isUpdate ? "Update Lot" : "Add New Lot"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Lot Name"
          name={lotFormFields.plantLotName}
          rules={RulesManager.getLotNameRules()}
        />

        <Flex gap={20}>
          <FormFieldModal
            type="select"
            label="Partner"
            name={lotFormFields.partnerId}
            rules={RulesManager.getPartnerRules()}
            options={partnerOptions}
          />
          <FormFieldModal
            type="select"
            label="Cultivar"
            name={lotFormFields.masterTypeId}
            rules={RulesManager.getCultivarRules()}
            options={cultivarTypeOptions}
          />
        </Flex>

        <Flex gap={20}>
          {!isUpdate && (
            <FormFieldModal
              label="Import Quantity"
              name={lotFormFields.previousQuantity}
              rules={RulesManager.getQuantityRules()}
            />
          )}
          {/* {!isUpdate ? (
            <FormFieldModal
              label="Quantity"
              name={lotFormFields.previousQuantity}
              rules={RulesManager.getQuantityRules()}
            />
          ) : lotData.isPassed ? (
            <FormFieldModal
              label="Qualified Quantity"
              name={lotFormFields.lastQuantity}
              rules={RulesManager.getQuantityRules()}
            />
          ) : null} */}

          <FormFieldModal
            label="Unit"
            name={lotFormFields.unit}
            rules={RulesManager.getUnitRules()}
          />
        </Flex>

        <FormFieldModal type="textarea" label="Note" name={lotFormFields.note} />
      </Form>
    </ModalForm>
  );
};

export default LotModal;
