import { Button, Flex, Form, Space, Table } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { masterTypeFormFields, MESSAGES, SYSTEM_CONFIG_GROUP } from "@/constants";
import { CriteriaMasterRequest, GetCriteriaByMasterType, CriteriaRequest } from "@/payloads";
import { Icons } from "@/assets";
import style from "./Criteria.module.scss";
import { toast } from "react-toastify";
import { useDirtyStore } from "@/stores";
import { CriteriaColModal } from "./CriteriaColModal";
import { useSystemConfigOptions } from "@/hooks";

type CriteriaModelProps = {
  isOpen: boolean;
  onClose: (values: CriteriaMasterRequest, isUpdate: boolean) => void;
  onSave: (values: CriteriaMasterRequest) => void;
  isLoadingAction?: boolean;
  criteriaData?: GetCriteriaByMasterType;
};

const CriteriaModel = ({
  isOpen,
  onClose,
  onSave,
  criteriaData,
  isLoadingAction,
}: CriteriaModelProps) => {
  const [form] = Form.useForm();
  const [checked, setChecked] = useState<boolean>(false);
  const [_, setForceUpdate] = useState(false);
  const isUpdate = criteriaData !== undefined && Object.keys(criteriaData).length > 0;
  const { options: criteriaTargetOptions, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.CRITERIA,
  );

  const { setIsDirty } = useDirtyStore();

  const handleSwitchChange = (newChecked: boolean) => setChecked(newChecked);
  const toggleForm = () => setForceUpdate((prev) => !prev);

  const resetForm = () => {
    form.resetFields();
    setChecked(false);
    setIsDirty(false);
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && criteriaData) {
        form.setFieldsValue({
          ...criteriaData,
          criteriaList: criteriaData.criterias.map((criteria) => ({
            criteriaId: criteria.criteriaId,
            criteriaName: criteria.criteriaName,
            criteriaDescription: criteria.criteriaDescription,
            minValue: criteria.minValue,
            maxValue: criteria.maxValue,
            unit: criteria.unit,
            priority: criteria.priority,
            frequencyDate: criteria.frequencyDate,
          })),
        });
        setChecked(criteriaData.isActive);
        toggleForm();
      }
    }
  }, [isOpen, criteriaData]);

  const addCriteria = () => {
    const currentList = form.getFieldValue("criteriaList") || [];
    const maxPriority =
      currentList.length > 0 ? Math.max(...currentList.map((c: CriteriaRequest) => c.priority)) : 0;

    const newCriteria = {
      criteriaId: Date.now(),
      criteriaName: "",
      criteriaDescription: "",
      priority: maxPriority + 1,
      frequencyDate: "",
    };

    const updatedCriteriaList = [...currentList, newCriteria];

    form.setFieldsValue({ criteriaList: updatedCriteriaList });
    toggleForm();
  };

  const deleteCriteria = (id: number) => {
    const currentList = form.getFieldValue("criteriaList") || [];
    const updatedCriteriaList = currentList.filter(
      (item: CriteriaRequest) => item.criteriaId !== id,
    );

    form.setFieldsValue({ criteriaList: updatedCriteriaList });
    toggleForm();
  };

  const isCriteriaListValid = () => {
    const criteriaList: CriteriaRequest[] = form.getFieldValue("criteriaList") || [];

    if (criteriaList.length === 0) {
      toast.warning(MESSAGES.REQUIRED_VALUE);
      return false;
    }

    const priorities = criteriaList.map((item) => item.priority);
    const uniquePriorities = [...new Set(priorities)];

    if (priorities.length !== uniquePriorities.length) {
      toast.warning(MESSAGES.PRIORITY_UNIQUE);
      return false;
    }

    uniquePriorities.sort((a, b) => a - b);
    const expectedPriorities = Array.from({ length: uniquePriorities.length }, (_, i) => i + 1);

    if (JSON.stringify(uniquePriorities) !== JSON.stringify(expectedPriorities)) {
      toast.warning(MESSAGES.PRIORITY_SEQUENTIAL);
      return false;
    }
    setIsDirty(true);
    return true;
  };

  const isItemChanged = (newItem: CriteriaRequest) => {
    const initialList = criteriaData?.criterias || [];
    const oldItem = initialList.find((item) => item.criteriaId === newItem.criteriaId);
    if (!oldItem) return true; // Nếu không có trong danh sách ban đầu => mới thêm

    return (
      newItem.criteriaName !== oldItem.criteriaName ||
      newItem.criteriaDescription !== oldItem.criteriaDescription ||
      newItem.minValue !== oldItem.minValue ||
      newItem.maxValue !== oldItem.maxValue ||
      newItem.unit !== oldItem.unit ||
      newItem.priority !== oldItem.priority ||
      newItem.frequencyDate !== oldItem.frequencyDate
    );
  };

  const handleInputChange = () => setIsDirty(checkHasChanges());

  const checkHasChanges = () => {
    const currentList: CriteriaRequest[] = form.getFieldValue("criteriaList") || [];
    if (!isUpdate) {
      return currentList.length !== 0; // Nếu đang tạo mới, chỉ cần kiểm tra danh sách có rỗng không
    }

    const initialList = criteriaData?.criterias || [];

    return (
      currentList.length !== initialList.length || // Kiểm tra số lượng
      currentList.some(isItemChanged) || // Kiểm tra nội dung thay đổi
      initialList.some(
        (oldItem) => !currentList.find((item) => item.criteriaId === oldItem.criteriaId),
      ) // Kiểm tra nếu có item trong initialList nhưng không còn trong currentList => đã bị xóa
    );
  };

  useEffect(() => {
    setIsDirty(checkHasChanges());
  }, [form.getFieldValue("criteriaList")]);

  const getFormData = (): CriteriaMasterRequest => {
    const rawCriteriaList: CriteriaRequest[] = form.getFieldValue("criteriaList") || [];

    const processedCriteriaList = rawCriteriaList.map(
      ({ criteriaId, ...rest }: CriteriaRequest) => {
        // Nếu criteriaId là số dương lớn (tự tạo bằng Date.now()), coi như là mới
        const isNew = typeof criteriaId === "number" && criteriaId > 1000000000000;
        return isNew ? rest : { criteriaId, ...rest };
      },
    );

    return {
      masterTypeId: form.getFieldValue(masterTypeFormFields.masterTypeId),
      masterTypeName: form.getFieldValue(masterTypeFormFields.masterTypeName),
      masterTypeDescription: form.getFieldValue(masterTypeFormFields.masterTypeDescription),
      isActive: checked,
      target: form.getFieldValue(masterTypeFormFields.target),
      criterias: processedCriteriaList as CriteriaRequest[],
    };
  };

  const handleOk = async () => {
    await form.validateFields();
    if (!isCriteriaListValid()) return;
    // console.log(getFormData());
    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData(), isUpdate);

  const columns = CriteriaColModal(form, handleInputChange, deleteCriteria);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate ? "Update Criteria" : "Add New Criteria"}
      size="largeXL"
    >
      <Form form={form} layout="vertical">
        <Flex gap={20}>
          <FormFieldModal
            label="Type Name"
            name={masterTypeFormFields.masterTypeName}
            rules={RulesManager.getTypeNameRules()}
            placeholder="Enter the type name"
          />
          <FormFieldModal
            type="select"
            label="Target"
            name={masterTypeFormFields.target}
            rules={RulesManager.getTargetRules()}
            isLoading={loading}
            options={criteriaTargetOptions}
          />
        </Flex>
        <Flex gap={20}>
          <FormFieldModal
            label="Description"
            type="textarea"
            name={masterTypeFormFields.masterTypeDescription}
            rules={RulesManager.getFarmDescriptionRules()}
            placeholder="Enter the description"
          />

          <FormFieldModal
            type="switch"
            label="Status"
            name={masterTypeFormFields.isActive}
            onChange={handleSwitchChange}
            isCheck={checked}
            // direction="row"
          />
        </Flex>
        <Flex vertical gap={10}>
          <h3>Criteria List</h3>
          <div className={style.criteriaTableWrapper}>
            <Table
              className={style.criteriaTable}
              columns={columns}
              // columns={columns}
              dataSource={form.getFieldValue("criteriaList") || []}
              rowKey="criteriaId"
              pagination={false}
            />
          </div>
        </Flex>
        <Space style={{ marginTop: 16 }}>
          <Button type="dashed" onClick={addCriteria} icon={<Icons.plus />}>
            Add Criteria
          </Button>
        </Space>
      </Form>
    </ModalForm>
  );
};

export default CriteriaModel;
