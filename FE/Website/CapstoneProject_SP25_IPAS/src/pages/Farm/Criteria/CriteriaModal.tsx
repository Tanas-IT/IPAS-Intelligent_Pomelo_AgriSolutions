import { Button, Flex, Form, Input, InputNumber, Space, Table } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import {
  CRITERIA_TARGETS,
  MASTER_TYPE,
  masterTypeFormFields,
  MESSAGES,
  WORK_TARGETS,
} from "@/constants";
import {
  GetMasterType,
  CriteriaMasterRequest,
  GetCriteriaByMasterType,
  CriteriaRequest,
} from "@/payloads";
import { Icons } from "@/assets";
import style from "./Criteria.module.scss";
import { toast } from "react-toastify";
import { useDirtyStore } from "@/stores";

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
  const criteriaTargetOptions = Object.keys(CRITERIA_TARGETS).map((key) => ({
    value: CRITERIA_TARGETS[key as keyof typeof CRITERIA_TARGETS],
    label: CRITERIA_TARGETS[key as keyof typeof CRITERIA_TARGETS],
  }));
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
      toast.error(MESSAGES.REQUIRED_VALUE);
      return false;
    }

    const priorities = criteriaList.map((item) => item.priority);
    const uniquePriorities = [...new Set(priorities)];

    if (priorities.length !== uniquePriorities.length) {
      toast.error(MESSAGES.PRIORITY_UNIQUE);
      return false;
    }

    uniquePriorities.sort((a, b) => a - b);
    const expectedPriorities = Array.from({ length: uniquePriorities.length }, (_, i) => i + 1);

    if (JSON.stringify(uniquePriorities) !== JSON.stringify(expectedPriorities)) {
      toast.error(MESSAGES.PRIORITY_SEQUENTIAL);
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
      newItem.priority !== oldItem.priority
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

  const columns = [
    {
      title: "Criteria Name",
      dataIndex: "criteriaName",
      align: "center" as const,
      width: 200,

      render: (_: any, record: CriteriaRequest, index: number) => (
        <Form.Item
          className={style.noMargin}
          name={["criteriaList", index, "criteriaName"]}
          rules={RulesManager.getCriteriaRules()}
          tooltip
        >
          <Input
            placeholder="Enter criteria name"
            value={record.criteriaName}
            onChange={handleInputChange}
          />
        </Form.Item>
      ),
    },
    {
      title: "Description",
      dataIndex: "criteriaDescription",
      align: "center" as const,
      render: (_: any, record: CriteriaRequest, index: number) => (
        <Form.Item name={["criteriaList", index, "criteriaDescription"]} className={style.noMargin}>
          <Input.TextArea
            placeholder="Enter description"
            autoSize={{ minRows: 1, maxRows: 3 }}
            value={record.criteriaDescription}
            onChange={handleInputChange}
          />
        </Form.Item>
      ),
    },
    {
      title: "Min Value",
      dataIndex: "priority",
      align: "center" as const,
      width: 100,
      render: (_: any, record: CriteriaRequest, index: number) => (
        <Form.Item
          className={style.noMargin}
          name={["criteriaList", index, "minValue"]}
          rules={RulesManager.getNumberRules("Min Value")}
        >
          <InputNumber
            min={0.1}
            className={style.inputNumberField}
            value={record.minValue}
            onChange={handleInputChange}
            placeholder="Value..."
          />
        </Form.Item>
      ),
    },
    {
      title: "Max Value",
      dataIndex: "priority",
      align: "center" as const,
      width: 100,
      render: (_: any, record: CriteriaRequest, index: number) => (
        <Form.Item
          className={style.noMargin}
          name={["criteriaList", index, "maxValue"]}
          rules={[
            ...RulesManager.getNumberRules("Max Value"),
            {
              validator: async (_, value) => {
                const minValue = form.getFieldValue(["criteriaList", index, "minValue"]);
                if (
                  value !== undefined &&
                  minValue !== undefined &&
                  Number(value) <= Number(minValue)
                ) {
                  return Promise.reject(new Error("Max Value must be greater than Min Value!"));
                }
                return Promise.resolve();
              },
            },
          ]}
          dependencies={[["criteriaList", index, "minValue"]]}
        >
          <InputNumber
            className={style.inputNumberField}
            value={record.maxValue}
            onChange={handleInputChange}
            placeholder="Value..."
          />
        </Form.Item>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      align: "center" as const,
      width: 140,
      render: (_: any, record: CriteriaRequest, index: number) => (
        <Form.Item
          className={style.noMargin}
          name={["criteriaList", index, "unit"]}
          rules={RulesManager.getUnitRules()}
        >
          <Input placeholder="Enter unit" value={record.unit} onChange={handleInputChange} />
        </Form.Item>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      align: "center" as const,
      width: 70,
      render: (_: any, record: CriteriaRequest, index: number) => (
        <Form.Item
          className={style.noMargin}
          name={["criteriaList", index, "priority"]}
          rules={RulesManager.getPriorityRules()}
        >
          <InputNumber
            className={style.inputNumberField}
            min={1}
            value={record.priority}
            onChange={handleInputChange}
          />
        </Form.Item>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center" as const,
      render: (_: any, record: CriteriaRequest) => (
        <Button danger onClick={() => deleteCriteria(record.criteriaId)} icon={<Icons.delete />} />
      ),
    },
  ];

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
