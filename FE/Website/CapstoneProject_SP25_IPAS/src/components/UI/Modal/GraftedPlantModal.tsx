import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { formatDateReq, isEmployee, RulesManager } from "@/utils";
import { GRAFTED_STATUS, graftedPlantFormFields, HEALTH_STATUS } from "@/constants";
import { GetGraftedPlant, GraftedPlantRequest } from "@/payloads";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
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
  const isEmployeeIn = isEmployee();
  const [form] = Form.useForm();
  const { options: plantLotOptions } = usePlantLotOptions(true);

  const isUpdate = graftedPlantData !== undefined && Object.keys(graftedPlantData).length > 0;
  const isUsed = graftedPlantData?.status === GRAFTED_STATUS.USED;

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

  const getFormData = (): GraftedPlantRequest => {
    const plantLotId = form.getFieldValue(graftedPlantFormFields.plantLotId);

    return {
      graftedPlantId: form.getFieldValue(graftedPlantFormFields.graftedPlantId),
      graftedPlantName: form.getFieldValue(graftedPlantFormFields.graftedPlantName),
      separatedDate:
        formatDateReq(form.getFieldValue(graftedPlantFormFields.separatedDate)) || undefined,
      status: form.getFieldValue(graftedPlantFormFields.status),
      graftedDate:
        formatDateReq(form.getFieldValue(graftedPlantFormFields.graftedDate)) || undefined,
      note: form.getFieldValue(graftedPlantFormFields.note),
      ...(plantLotId ? { plantLotId } : {}), // Chỉ thêm nếu có giá trị
    };
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
      title={isUpdate ? "Update Grafted Plant" : "Add New Grafted Plant"}
    >
      <Form form={form} layout="vertical">
        {isEmployeeIn ? (
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
        ) : (
          <>
            {!graftedPlantData?.isDead && !isUsed && (
              <FormFieldModal
                label="Grafted Plant Name"
                name={graftedPlantFormFields.graftedPlantName}
                rules={RulesManager.getRequiredRules("Grafted Plant Name")}
              />
            )}

            {!graftedPlantData?.isDead && !isUsed && (
              <>
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
                      rules={[
                        ...RulesManager.getRequiredRules("Separated Date"),
                        {
                          validator: (_: any, value: Dayjs) => {
                            const graftedDate = form.getFieldValue(
                              graftedPlantFormFields.graftedDate,
                            );

                            if (!graftedDate || !value) {
                              return Promise.resolve();
                            }

                            const graftedDayjs = dayjs(graftedDate);
                            const separatedDayjs = dayjs(value);

                            if (separatedDayjs.isSameOrAfter(graftedDayjs)) {
                              return Promise.resolve();
                            }

                            return Promise.reject(
                              new Error("Separated Date must be after or equal to Grafted Date"),
                            );
                          },
                        },
                      ]}
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
                    {graftedPlantData?.isCompleted && graftedPlantData?.plantLotId && (
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
              </>
            )}
          </>
        )}
      </Form>
    </ModalForm>
  );
};

export default GraftedPlantModal;
