import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { LOT_STATUS, lotFormFields, MASTER_TYPE, PARTNER } from "@/constants";
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
  const [isFromGrafted, setIsFromGrafted] = useState<boolean>(false);

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

  const resetForm = () => {
    form.resetFields();
    setIsFromGrafted(false);
  };

  useEffect(() => {
    resetForm();
    if (isOpen && lotData) {
      form.setFieldsValue({ ...lotData });
    }
    form.setFieldsValue({
      ...lotData,
      [lotFormFields.unit]: "Plant",
      [lotFormFields.isFromGrafted]: false,
    });
  }, [isOpen, lotData]);

  const getFormData = (): PlantLotRequest =>
    Object.fromEntries(
      Object.values(lotFormFields).map((field) => [field, form.getFieldValue(field)]),
    ) as PlantLotRequest;

  const handleOk = async () => {
    await form.validateFields();
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

        {!isUpdate && (
          <FormFieldModal
            type="radio"
            label="Lot Type"
            name={lotFormFields.isFromGrafted}
            radioLabels={{ yes: "Grafted Lot", no: "Imported Lot" }}
            direction="row"
            onChange={(value) => {
              setIsFromGrafted(value);
            }}
          />
        )}

        <Flex gap={20}>
          {!isFromGrafted && (
            <FormFieldModal
              type="select"
              label="Partner"
              name={lotFormFields.partnerId}
              rules={RulesManager.getPartnerRules()}
              options={partnerOptions}
            />
          )}
          {lotData?.status !== LOT_STATUS.USED && (
            <FormFieldModal
              type="select"
              label="Cultivar"
              name={lotFormFields.masterTypeId}
              rules={RulesManager.getCultivarRules()}
              options={cultivarTypeOptions}
            />
          )}
        </Flex>

        <Flex gap={20}>
          {!isUpdate && !isFromGrafted && (
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

          <FormFieldModal label="Unit" name={lotFormFields.unit} />
        </Flex>

        <FormFieldModal type="textarea" label="Note" name={lotFormFields.note} />
      </Form>
    </ModalForm>
  );
};

export default LotModal;
