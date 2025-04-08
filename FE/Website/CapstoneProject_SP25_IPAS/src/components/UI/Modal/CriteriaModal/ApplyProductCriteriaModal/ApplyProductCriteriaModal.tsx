import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, TableApplyCriteria } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS } from "@/constants";
import { CriteriaApplyRequest } from "@/payloads";
import { criteriaService, masterTypeService } from "@/services";
import { useCriteriaManagement } from "@/hooks/useCriteriaManagement";
import { SelectOption } from "@/types";
import { useDirtyStore } from "@/stores";

type ApplyProductCriteriaModalProps = {
  productId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, criteriaSetId: number) => void;
  isLoadingAction?: boolean;
};

const ApplyProductCriteriaModal = ({
  productId,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: ApplyProductCriteriaModalProps) => {
  const [form] = Form.useForm();
  const { dataSource, setDataSource, handleCriteriaChange, handleDelete, handlePriorityChange } =
    useCriteriaManagement();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [criteriaOptions, setCriteriaOptions] = useState<SelectOption[]>([]);
  const [criteriaSelected, setCriteriaSelected] = useState<number>();
  const { setIsDirty } = useDirtyStore();

  const fetchProductCriteria = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const res = await criteriaService.getProductCriteriaTypeSelect(Number(productId));
      if (res.statusCode === 200) {
        const formattedOptions = res.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));
        setCriteriaOptions(formattedOptions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCriteria();
  }, [productId]);

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
    if (!productId || !criteriaSelected) return;
    onSave(productId, criteriaSelected);
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
            label="Choose criteria"
            placeholder="Select criteria"
            name={"criteriaId"}
            rules={RulesManager.getCriteriaRules()}
            options={criteriaOptions}
            isLoading={isLoading}
            onChange={(value) => {
              handleCriteriaChange(value);
              setCriteriaSelected(value);
              setIsDirty(true);
            }}
          />
        </Flex>
      </Form>
      <Flex vertical gap={10}>
        <label>Criteria List:</label>
        <TableApplyCriteria
          isValueCheck={false}
          dataSource={dataSource}
          handleDelete={handleDelete}
          handlePriorityChange={handlePriorityChange}
        />
      </Flex>
    </ModalForm>
  );
};

export default ApplyProductCriteriaModal;
