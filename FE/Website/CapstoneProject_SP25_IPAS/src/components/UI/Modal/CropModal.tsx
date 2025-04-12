import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { formatDateReq, RulesManager } from "@/utils";
import { cropFormFields, HARVEST_SEASON_OPTIONS, SYSTEM_CONFIG_GROUP } from "@/constants";
import { CropRequest, GetCrop2 } from "@/payloads";
import { useLandPlotOptions, useSystemConfigOptions } from "@/hooks";
import dayjs from "dayjs";

type CropModalProps = {
  isOpen: boolean;
  onClose: (values: CropRequest, isUpdate: boolean) => void;
  onSave: (values: CropRequest) => void;
  isLoadingAction?: boolean;
  cropData?: GetCrop2;
};

const CropModal = ({ isOpen, onClose, onSave, cropData, isLoadingAction }: CropModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = Boolean(cropData);
  const { options: plotOptions } = useLandPlotOptions();
  const { options, loading } = useSystemConfigOptions(SYSTEM_CONFIG_GROUP.HARVEST_SEASON);

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();

    if (isUpdate && cropData) {
      form.setFieldsValue({
        ...cropData,
        [cropFormFields.cropExpectedTime]: cropData.cropExpectedTime
          ? dayjs(cropData.cropExpectedTime)
          : undefined,
        [cropFormFields.cropActualTime]: cropData.cropActualTime
          ? dayjs(cropData.cropActualTime)
          : undefined,
        [cropFormFields.duration]:
          cropData.startDate && cropData.endDate
            ? [dayjs(cropData.startDate), dayjs(cropData.endDate)]
            : undefined,
      });
    }
  }, [isOpen, cropData]);

  const getFormData = (): CropRequest => {
    const { [cropFormFields.duration]: _, ...formData } = form.getFieldsValue(); // Loại bỏ duration
    const duration = form.getFieldValue(cropFormFields.duration);

    return {
      ...formData,
      cropId: form.getFieldValue(cropFormFields.cropId),
      startDate: formatDateReq(duration?.[0]) || undefined,
      endDate: formatDateReq(duration?.[1]) || undefined,
      cropExpectedTime:
        formatDateReq(form.getFieldValue(cropFormFields.cropExpectedTime)) || undefined,
      cropActualTime: formatDateReq(form.getFieldValue(cropFormFields.cropActualTime)) || undefined,
    };
  };

  const validateDateWithinRange = (fieldName: string) => async (_: any, value?: dayjs.Dayjs) => {
    if (!value) return Promise.resolve();

    const [startDate, endDate] = form.getFieldValue(cropFormFields.duration) || [];
    if (
      startDate &&
      endDate &&
      (value.isBefore(startDate, "day") || value.isAfter(endDate, "day"))
    ) {
      return Promise.reject(new Error(`${fieldName} must be within Start & End Date`));
    }

    return Promise.resolve();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => onClose(getFormData(), isUpdate)}
      onSave={async () => {
        await form.validateFields();
        // console.log(getFormData());

        onSave(getFormData());
      }}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate ? "Update Crop" : "Add New Crop"}
      size="large"
    >
      <Form form={form} layout="vertical">
        <Flex gap={20}>
          <FormFieldModal
            label="Crop Name"
            name={cropFormFields.cropName}
            rules={RulesManager.getRequiredRules("Crop Name")}
          />
          <FormFieldModal
            type="select"
            label="Harvest Season"
            name={cropFormFields.harvestSeason}
            rules={RulesManager.getRequiredRules("Harvest Season")}
            isLoading={loading}
            options={options}
          />
        </Flex>
        <Flex gap={20}>
          <FormFieldModal
            type="dateRange"
            label="Crop Duration"
            name={cropFormFields.duration}
            rules={RulesManager.getRequiredRules("Crop Duration")}
          />
          {isUpdate && (
            <FormFieldModal
              label="Market Price (VND/kg)"
              name={cropFormFields.marketPrice}
              placeholder="Enter price (e.g. 100.000)"
              rules={RulesManager.getNumberNotRequiredRules("Market Price")}
            />
          )}
        </Flex>

        <Flex gap={20}>
          <FormFieldModal
            type="date"
            label="Crop Expected Time"
            name={cropFormFields.cropExpectedTime}
            rules={[
              ...RulesManager.getRequiredRules("Expected Time"),
              { validator: validateDateWithinRange("Expected Time") },
            ]}
            dependencies={[cropFormFields.duration]}
          />
          <FormFieldModal
            label="Estimate Yield (kg)"
            name={cropFormFields.estimateYield}
            rules={RulesManager.getNumberRules("Estimate Yield")}
          />
        </Flex>

        {isUpdate && (
          <Flex gap={20}>
            <FormFieldModal
              type="date"
              label="Crop Actual Time"
              name={cropFormFields.cropActualTime}
              rules={[{ validator: validateDateWithinRange("Actual Time") }]}
              dependencies={[cropFormFields.duration]}
            />
            <FormFieldModal
              label="Actual Yield (kg)"
              name={cropFormFields.actualYield}
              rules={RulesManager.getNumberNotRequiredRules("Actual Yield")}
            />
          </Flex>
        )}

        {!isUpdate && (
          <FormFieldModal
            type="select"
            label="Plots"
            name={cropFormFields.landPlotCrops}
            multiple
            options={plotOptions}
            rules={RulesManager.getRequiredRules("Plots")}
          />
        )}

        <FormFieldModal type="textarea" label="Note" name={cropFormFields.notes} />
      </Form>
    </ModalForm>
  );
};

export default CropModal;
