import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, TableApplyCriteria } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, SYSTEM_CONFIG_GROUP, SYSTEM_CONFIG_KEY } from "@/constants";
import { CriteriaApplyRequest } from "@/payloads";
import { criteriaService } from "@/services";
import { useCriteriaManagement } from "@/hooks/useCriteriaManagement";
import { SelectOption } from "@/types";
import { useDirtyStore } from "@/stores";
import { useSystemConfigOptions } from "@/hooks";

type ApplyCriteriaLotModalProps = {
  lotId?: number;
  hasInputQuantity: boolean;
  hasLastQuantity: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (criteria: CriteriaApplyRequest) => void;
  isLoadingAction?: boolean;
};

const ApplyCriteriaLotModal = ({
  lotId,
  hasInputQuantity,
  hasLastQuantity,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: ApplyCriteriaLotModalProps) => {
  const [form] = Form.useForm();
  const {
    dataSource,
    setDataSource,
    handleCriteriaChange,
    handleDelete,
    handlePriorityChange,
    isCriteriaListValid,
  } = useCriteriaManagement();
  const { options: criteriaTargetOptions, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.PLANT_LOT_CRITERIA,
    undefined,
    true,
  );
  const [criteriaOptions, setCriteriaOptions] = useState<SelectOption[]>([]);
  const { setIsDirty } = useDirtyStore();

  const resetForm = () => {
    form.resetFields();
    setDataSource([]);
    setCriteriaOptions([]);
    setIsDirty(false);
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
    }
  }, [isOpen]);

  const handleOk = async () => {
    if (!isCriteriaListValid()) return;
    if (!lotId) return;
    await form.validateFields();
    const requestData: CriteriaApplyRequest = {
      plantLotId: [lotId],
      criteriaData: dataSource.map((item) => ({
        criteriaId: item.criteriaId,
        priority: item.priority,
        frequencyDate: item.frequencyDate,
      })),
    };

    onSave(requestData);
  };

  const handleCriteriaTypeChange = async (value: string) => {
    form.setFieldsValue({ criteriaId: undefined });
    if (!lotId) return;
    var res = await criteriaService.getPlantLotCriteriaTypeSelect(lotId, value);
    if (res.statusCode === 200 && res.data) {
      const formattedOptions = res.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setCriteriaOptions(formattedOptions);
      setIsDirty(true);
    } else {
      setCriteriaOptions([]);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Apply Criteria"}
      saveLabel="Apply"
      size="largeXL"
    >
      <Form form={form} layout="vertical">
        <Flex gap={40}>
          <FormFieldModal
            type="select"
            label="Choose criteria type"
            placeholder="Select criteria type"
            name={"criteriaType"}
            rules={RulesManager.getTypeRules()}
            isLoading={loading}
            options={criteriaTargetOptions}
            // options={Object.values(CRITERIA_TARGETS)
            //   .filter((value) => {
            //     if (hasInputQuantity && value === CRITERIA_TARGETS["Plantlot Condition"])
            //       return false;
            //     if (hasLastQuantity && value === CRITERIA_TARGETS["Plantlot Evaluation"])
            //       return false;
            //     return (
            //       value === CRITERIA_TARGETS["Plantlot Condition"] ||
            //       value === CRITERIA_TARGETS["Plantlot Evaluation"]
            //     );
            //   })
            //   .map((value) => ({ label: value, value }))}
            onChange={handleCriteriaTypeChange}
          />
          <FormFieldModal
            type="select"
            label="Choose criteria"
            placeholder="Select criteria"
            name={"criteriaId"}
            rules={RulesManager.getCriteriaRules()}
            options={criteriaOptions}
            // direction="row"
            onChange={handleCriteriaChange}
          />
        </Flex>
      </Form>
      <Flex vertical gap={10}>
        <label>Criteria List:</label>
        <TableApplyCriteria
          dataSource={dataSource}
          handleDelete={handleDelete}
          handlePriorityChange={handlePriorityChange}
        />
      </Flex>
    </ModalForm>
  );
};

export default ApplyCriteriaLotModal;
