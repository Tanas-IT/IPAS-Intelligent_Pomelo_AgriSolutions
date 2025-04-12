import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { GROWTH_ACTIONS, growthStageFormFields, SYSTEM_CONFIG_KEY } from "@/constants";
import { GetGrowthStage, GrowthStageRequest } from "@/payloads";
import { useGrowthStageStore } from "@/stores";
import { useSystemConfigOptions } from "@/hooks";

type GrowthStageModalProps = {
  isOpen: boolean;
  onClose: (values: GrowthStageRequest, isUpdate: boolean) => void;
  onSave: (values: GrowthStageRequest) => void;
  isLoadingAction?: boolean;
  growthStageData?: GetGrowthStage;
};

const GrowthStageModal = ({
  isOpen,
  onClose,
  onSave,
  growthStageData,
  isLoadingAction,
}: GrowthStageModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = growthStageData !== undefined && Object.keys(growthStageData).length > 0;
  const { options: actionOptions, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_KEY.GrowthStageAction,
  );
  const maxAgeStart = useGrowthStageStore((state) => state.maxAgeStart);

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && growthStageData) {
        form.setFieldsValue({
          ...growthStageData,
          [growthStageFormFields.activeFunction]: growthStageData.activeFunction
            ? growthStageData.activeFunction.split(",").map((s) => s.trim())
            : [],
        });
      } else {
        form.setFieldsValue({
          [growthStageFormFields.monthAgeStart]: maxAgeStart,
        });
      }
    }
  }, [isOpen, growthStageData]);

  const getFormData = (): GrowthStageRequest => {
    const raw = form.getFieldsValue([
      growthStageFormFields.growthStageId,
      growthStageFormFields.growthStageName,
      growthStageFormFields.description,
      growthStageFormFields.monthAgeStart,
      growthStageFormFields.monthAgeEnd,
      growthStageFormFields.activeFunction,
    ]);

    const value = raw[growthStageFormFields.activeFunction];
    raw[growthStageFormFields.activeFunction] = Array.isArray(value) ? value.join(", ") : value;

    return raw as GrowthStageRequest;
  };

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
      title={isUpdate ? "Update Stage" : "Add New Stage"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Growth Stage Name"
          name={growthStageFormFields.growthStageName}
          rules={RulesManager.getStageNameRules()}
          placeholder="Enter the growth stage name"
        />
        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            label="Month Age Start"
            name={growthStageFormFields.monthAgeStart}
            rules={isUpdate ? RulesManager.getMonthAgeStartRules() : []}
            placeholder="Enter the starting month age"
            readonly={!isUpdate && true}
          />
          <FormFieldModal
            label="Month Age End"
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
          type="select"
          label="Stage Actions"
          name={growthStageFormFields.activeFunction}
          isLoading={loading}
          options={actionOptions}
          multiple
        />
        <FormFieldModal
          label="Description"
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
