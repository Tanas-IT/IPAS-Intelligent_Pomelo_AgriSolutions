import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { graftedPlantFormFields, HEALTH_STATUS } from "@/constants";
import { GetGraftedPlant, GraftedPlantRequest } from "@/payloads";
import dayjs from "dayjs";
import { usePlantLotOptions } from "@/hooks";

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
  const { options: plantLotOptions } = usePlantLotOptions(true);

  const isUpdate = graftedPlantData !== undefined && Object.keys(graftedPlantData).length > 0;

  const resetForm = () => form.resetFields();

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    if (isUpdate && graftedPlantData) {
      form.setFieldsValue({
        ...graftedPlantData,
        separatedDate: graftedPlantData.separatedDate
          ? dayjs(graftedPlantData.separatedDate)
          : null,
        graftedDate: graftedPlantData.graftedDate ? dayjs(graftedPlantData.graftedDate) : null,
      });
    }
  }, [isOpen, graftedPlantData]);

  const getFormData = (): GraftedPlantRequest => ({
    graftedPlantId: form.getFieldValue(graftedPlantFormFields.graftedPlantId),
    graftedPlantName: form.getFieldValue(graftedPlantFormFields.graftedPlantName),
    separatedDate: form.getFieldValue(graftedPlantFormFields.separatedDate)
      ? form.getFieldValue(graftedPlantFormFields.separatedDate).format("YYYY-MM-DD")
      : null,
    status: form.getFieldValue(graftedPlantFormFields.status),
    graftedDate: form.getFieldValue(graftedPlantFormFields.graftedDate)
      ? form.getFieldValue(graftedPlantFormFields.graftedDate).format("YYYY-MM-DD")
      : null,
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
          rules={RulesManager.getRequiredRules("Grafted Plant Name")}
        />

        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            type="date"
            label="Grafted Date"
            name={graftedPlantFormFields.graftedDate}
            rules={RulesManager.getRequiredRules("Grafted Date")}
          />
          {graftedPlantData?.isCompleted && (
            <FormFieldModal
              type="date"
              label="Separated Date"
              name={graftedPlantFormFields.separatedDate}
              rules={RulesManager.getRequiredRules("Separated Date")}
            />
          )}
        </Flex>
        {isUpdate && (
          <Flex justify="space-between" gap={20}>
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
            {graftedPlantData?.isCompleted && (
              <FormFieldModal
                type="select"
                label="Destination Lot"
                name={graftedPlantFormFields.plantLotId}
                rules={RulesManager.getRequiredRules("Destination Lot")}
                options={plantLotOptions}
              />
            )}
          </Flex>
        )}

        <FormFieldModal type="textarea" label="Note" name={graftedPlantFormFields.note} />
      </Form>
    </ModalForm>
  );
};

export default GraftedPlantModal;
