import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { graftedPlantFormFields, HEALTH_STATUS } from "@/constants";
import { GetGraftedPlant, GraftedPlantRequest } from "@/payloads";
import dayjs from "dayjs";

type GraftedPlantModalProps = {
  isOpen: boolean;
  onClose: (values: GraftedPlantRequest, isUpdate: boolean) => void;
  onSave: (values: GraftedPlantRequest) => void;
  isLoadingAction?: boolean;
  graftedPlantData?: GetGraftedPlant;
};

const GraftedPlantModal = ({
  isOpen,
  onClose,
  onSave,
  graftedPlantData,
  isLoadingAction,
}: GraftedPlantModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = graftedPlantData !== undefined && Object.keys(graftedPlantData).length > 0;

  const resetForm = () => form.resetFields();

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    if (isUpdate && graftedPlantData) {
      form.setFieldsValue({
        ...graftedPlantData,
        separatedDate: dayjs(graftedPlantData.separatedDate),
        graftedDate: dayjs(graftedPlantData.graftedDate),
      });
    }
  }, [isOpen, graftedPlantData]);

  const getFormData = (): GraftedPlantRequest => ({
    graftedPlantId: form.getFieldValue(graftedPlantFormFields.graftedPlantId),
    graftedPlantName: form.getFieldValue(graftedPlantFormFields.graftedPlantName),
    separatedDate: form.getFieldValue(graftedPlantFormFields.separatedDate).format("YYYY-MM-DD"),
    status: form.getFieldValue(graftedPlantFormFields.status),
    graftedDate: form.getFieldValue(graftedPlantFormFields.graftedDate).format("YYYY-MM-DD"),
    note: form.getFieldValue(graftedPlantFormFields.note),
    plantLotId: form.getFieldValue(graftedPlantFormFields.plantLotId),
  });

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
      title={isUpdate ? "Update Grafted Plant" : "Add New Grafted Plant"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Grafted Plant Name"
          name={graftedPlantFormFields.graftedPlantName}
          rules={RulesManager.getLotNameRules()}
        />

        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            type="date"
            label="Separated Date"
            name={graftedPlantFormFields.separatedDate}
            rules={RulesManager.getPlantingDateRules()}
          />
          <FormFieldModal
            type="date"
            label="Grafted Date"
            name={graftedPlantFormFields.graftedDate}
            rules={RulesManager.getPlantingDateRules()}
          />
        </Flex>
        {isUpdate && (
          <FormFieldModal
            type="select"
            label="Health Status"
            name={graftedPlantFormFields.status}
            rules={RulesManager.getSelectHealthStatusRules()}
            options={Object.keys(HEALTH_STATUS).map((key) => ({
              value: HEALTH_STATUS[key as keyof typeof HEALTH_STATUS],
              label: HEALTH_STATUS[key as keyof typeof HEALTH_STATUS],
            }))}
          />
        )}

        <FormFieldModal type="textarea" label="Note" name={graftedPlantFormFields.note} />
      </Form>
    </ModalForm>
  );
};

export default GraftedPlantModal;
