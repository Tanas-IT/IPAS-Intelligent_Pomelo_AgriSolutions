import { Flex, Form, InputNumber, Table } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, TableApplyCriteria } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, lotFormFields, MESSAGES } from "@/constants";
import { CriteriaApplyRequests, GetCriteria, GetMasterTypeSelected } from "@/payloads";
import { criteriaService, masterTypeService } from "@/services";
import { useCriteriaOptions } from "@/hooks";
import style from "./PlantLot.module.scss";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import { useCriteriaManagement } from "@/hooks/useCriteriaManagement";
import { SelectOption } from "@/types";
import { useDirtyStore } from "@/stores";

type ApplyCriteriaModalProps = {
  lotId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (criteria: CriteriaApplyRequests) => void;
  isLoadingAction?: boolean;
};

const ApplyCriteriaModal = ({
  lotId,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: ApplyCriteriaModalProps) => {
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

  //   const isUpdate = lotData !== undefined && Object.keys(lotData).length > 0;

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
    if (!lotId) return;
    const requestData: CriteriaApplyRequests = {
      plantLotId: [lotId],
      criteriaData: dataSource.map((item) => ({
        criteriaId: item.criteriaId,
        priority: item.priority,
      })),
    };

    onSave(requestData);
  };

  const handleCriteriaTypeChange = async (value: string) => {
    form.setFieldsValue({ criteriaId: undefined });
    var res = await masterTypeService.getCriteriaTypeSelect(value);
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
            options={Object.values(CRITERIA_TARGETS)
              .filter(
                (value) =>
                  value === CRITERIA_TARGETS["Plantlot Condition"] ||
                  value === CRITERIA_TARGETS["Plantlot Evaluation"],
              )
              .map((value) => ({ label: value, value }))}
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
        <label className={style.formTitle}>Criteria List:</label>
        <TableApplyCriteria
          dataSource={dataSource}
          handleDelete={handleDelete}
          handlePriorityChange={handlePriorityChange}
        />
      </Flex>
    </ModalForm>
  );
};

export default ApplyCriteriaModal;
