import { Button, Flex, Form, Modal } from "antd";
import { useEffect } from "react";
import { CustomButton, FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { rowFormFields } from "@/constants";
import { landRowSimulate } from "@/payloads";
import { useVirtualPlotConfigStore } from "@/stores";
import style from "./DraggableRow.module.scss";

type RowItemModalProps = {
  isOpen: boolean;
  onClose: (values: landRowSimulate, isUpdate: boolean) => void;
  onSave: (values: landRowSimulate) => void;
  onDelete?: (landRowId: number, indexUsed: number) => void;
  rowData?: landRowSimulate;
};

const RowItemModal = ({ isOpen, onClose, onSave, onDelete, rowData }: RowItemModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = rowData !== undefined && Object.keys(rowData).length > 0;
  const { metricUnit } = useVirtualPlotConfigStore();

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && rowData) {
        form.setFieldsValue({
          [rowFormFields.id]: rowData.landRowId,
          [rowFormFields.index]: rowData.rowIndex,
          [rowFormFields.length]: rowData.length,
          [rowFormFields.width]: rowData.width,
          [rowFormFields.plantsPerRow]: rowData.treeAmount,
          [rowFormFields.plantSpacing]: rowData.distance,
        });
      }
    }
  }, [isOpen, rowData]);

  const getFormData = (): landRowSimulate => ({
    landRowId: form.getFieldValue(rowFormFields.id),
    landRowCode: "",
    rowIndex: form.getFieldValue(rowFormFields.index),
    length: form.getFieldValue(rowFormFields.length),
    width: form.getFieldValue(rowFormFields.width),
    treeAmount: form.getFieldValue(rowFormFields.plantsPerRow),
    distance: form.getFieldValue(rowFormFields.plantSpacing),
    indexUsed: rowData?.indexUsed,
    plants: [],
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
      title={isUpdate ? `Update Row #${rowData?.rowIndex}` : "Add New Row"}
      onDelete={
        isUpdate && rowData
          ? () => {
              Modal.confirm({
                title: "Are you sure?",
                content: `Row #${rowData?.rowIndex} will be  deleted. Are you sure?`,
                okText: "Delete",
                okButtonProps: {
                  danger: true,
                },
                cancelButtonProps: {
                  className: style.cancelBtn,
                },
                onOk: () => {
                  onDelete?.(rowData.landRowId ?? 0, rowData.indexUsed ?? 0);
                },
              });
            }
          : undefined
      }
    >
      <Form form={form} layout="vertical">
        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            label={`Length (${metricUnit})`}
            name={rowFormFields.length}
            rules={RulesManager.getRowLengthRules()}
          />
          <FormFieldModal
            label={`Width (${metricUnit})`}
            name={rowFormFields.width}
            rules={RulesManager.getRowWidthRules()}
          />
        </Flex>
        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            label="Plants per Row"
            name={rowFormFields.plantsPerRow}
            rules={RulesManager.getPlantsPerRowRules()}
          />
          <FormFieldModal
            label={`Spacing Between Plants (${metricUnit})`}
            name={rowFormFields.plantSpacing}
            rules={RulesManager.getPlantSpacingRules()}
          />
        </Flex>
      </Form>
    </ModalForm>
  );
};

export default RowItemModal;
