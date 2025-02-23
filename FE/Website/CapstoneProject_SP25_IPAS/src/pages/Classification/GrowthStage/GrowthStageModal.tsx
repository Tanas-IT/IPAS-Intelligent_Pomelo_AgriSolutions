import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { growthStageFormFields } from "@/constants";
import { GetGrowthStage, GrowthStageRequest } from "@/payloads";

type GrowthStageModalProps = {
  isOpen: boolean;
  onClose: (values: GrowthStageRequest, isUpdate: boolean) => void;
  onSave: (values: GrowthStageRequest) => void;
  growthStageData?: GetGrowthStage;
};

const GrowthStageModal = ({ isOpen, onClose, onSave, growthStageData }: GrowthStageModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = growthStageData !== undefined && Object.keys(growthStageData).length > 0;

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && growthStageData) {
        form.setFieldsValue({
          growthStageId: growthStageData.growthStageId,
          growthStageName: growthStageData.growthStageName,
          description: growthStageData.description,
          createDate: growthStageData.createDate,
          monthAgeStart: growthStageData.monthAgeStart,
          monthAgeEnd: growthStageData.monthAgeEnd,
        });
      }
    }
  }, [isOpen, growthStageData]);

  const getFormData = (): GrowthStageRequest => ({
    growthStageId: form.getFieldValue(growthStageFormFields.growthStageId),
    growthStageName: form.getFieldValue(growthStageFormFields.growthStageName),
    description: form.getFieldValue(growthStageFormFields.description),
    monthAgeStart: form.getFieldValue(growthStageFormFields.monthAgeStart),
    monthAgeEnd: form.getFieldValue(growthStageFormFields.monthAgeEnd),
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
      title={isUpdate ? "Update Stage" : "Add New Stage"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Growth Stage Name:"
          name={growthStageFormFields.growthStageName}
          rules={RulesManager.getStageNameRules()}
          placeholder="Enter the growth stage name"
        />
        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            label="Month Age Start:"
            name={growthStageFormFields.monthAgeStart}
            rules={RulesManager.getMonthAgeStartRules()}
            placeholder="Enter the starting month age"
          />
          <FormFieldModal
            label="Month Age End:"
            name={growthStageFormFields.monthAgeEnd}
            dependencies={[growthStageFormFields.monthAgeStart]}
            rules={[
              ...RulesManager.getMonthAgeEndRules(),
              {
                validator: async (_: any, value: number | string) => {
                  if (value === undefined || value === null || value === "") {
                    return Promise.resolve();
                  }
                  const startValue = form.getFieldValue(growthStageFormFields.monthAgeStart);
                  if (
                    value !== undefined &&
                    startValue !== undefined &&
                    Number(value) <= Number(startValue)
                  ) {
                    throw new Error("Ending month age must be greater than starting month age");
                  }
                },
              },
            ]}
            placeholder="Enter the ending month age"
          />
        </Flex>
        <FormFieldModal
          label="Description:"
          type="textarea"
          name={growthStageFormFields.description}
          rules={RulesManager.getFarmDescriptionRules()}
          placeholder="Enter the description"
        />
      </Form>
    </ModalForm>
  );
};

export default GrowthStageModal;
