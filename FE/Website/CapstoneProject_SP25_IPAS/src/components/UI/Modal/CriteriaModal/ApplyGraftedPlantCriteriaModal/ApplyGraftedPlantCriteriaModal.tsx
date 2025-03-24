import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, TableApplyCriteria } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS } from "@/constants";
import { CriteriaApplyRequest } from "@/payloads";
import { criteriaService } from "@/services";
import { useCriteriaManagement } from "@/hooks/useCriteriaManagement";
import { SelectOption } from "@/types";
import { useDirtyStore } from "@/stores";

type ApplyGraftedPlantCriteriaModalProps = {
  graftedPlantIds?: number[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (criteria: CriteriaApplyRequest) => void;
  isLoadingAction?: boolean;
};

const ApplyGraftedPlantCriteriaModal = ({
  graftedPlantIds,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: ApplyGraftedPlantCriteriaModalProps) => {
  const [form] = Form.useForm();
  const {
    dataSource,
    setDataSource,
    handleCriteriaChange,
    handleDelete,
    handlePriorityChange,
    isCriteriaListValid,
  } = useCriteriaManagement();
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

  const handleOk = () => {
    if (!isCriteriaListValid()) return;
    if (!graftedPlantIds) return;
    const requestData: CriteriaApplyRequest = {
      graftedPlantId: graftedPlantIds,
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
    if (!graftedPlantIds) return;
    var res = await criteriaService.getGraftedPlantCriteriaTypeSelect(graftedPlantIds[0], value);
    if (res.statusCode === 200 && res.data) {
      const formattedOptions = res.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setCriteriaOptions(formattedOptions);
      setIsDirty(true);
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
            options={[CRITERIA_TARGETS["Grafted Evaluation"]].map((value) => ({
              label: value,
              value,
            }))}
            onChange={handleCriteriaTypeChange}
          />
          <FormFieldModal
            type="select"
            label="Choose criteria"
            placeholder="Select criteria"
            name={"criteriaId"}
            rules={RulesManager.getCriteriaRules()}
            options={criteriaOptions}
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

export default ApplyGraftedPlantCriteriaModal;
