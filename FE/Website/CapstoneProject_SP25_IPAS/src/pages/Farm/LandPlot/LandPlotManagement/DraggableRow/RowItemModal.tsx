import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { rowFormFields } from "@/constants";
import { rowStateType } from "@/types";

type RowItemModalProps = {
  isOpen: boolean;
  onClose: (values: rowStateType, isUpdate: boolean) => void;
  onSave: (values: rowStateType) => void;
  rowData?: rowStateType;
};

const RowItemModal = ({ isOpen, onClose, onSave, rowData }: RowItemModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = rowData !== undefined && Object.keys(rowData).length > 0;

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && rowData) {
        form.setFieldsValue({
          id: rowData.id,
          index: rowData.index,
          [rowFormFields.length]: rowData.length,
          [rowFormFields.width]: rowData.width,
          [rowFormFields.plantsPerRow]: rowData.plantsPerRow,
          [rowFormFields.plantSpacing]: rowData.plantSpacing,
        });
      }
    }
  }, [isOpen, rowData]);

  const getFormData = (): rowStateType => ({
    id: form.getFieldValue(rowFormFields.id),
    index: form.getFieldValue(rowFormFields.index),
    length: form.getFieldValue(rowFormFields.length),
    width: form.getFieldValue(rowFormFields.width),
    plantsPerRow: form.getFieldValue(rowFormFields.plantsPerRow),
    plantSpacing: form.getFieldValue(rowFormFields.plantSpacing),
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
      title={isUpdate ? "Update Row" : "Add New Row"}
    >
      <Form form={form} layout="vertical">
        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            label="Length (px)"
            name={rowFormFields.length}
            rules={RulesManager.getRowLengthRules()}
          />
          <FormFieldModal
            label="Width (px)"
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
            label="Spacing Between Plants (px)"
            name={rowFormFields.plantSpacing}
            rules={RulesManager.getPlantSpacingRules()}
          />
        </Flex>
      </Form>
    </ModalForm>
  );
};

export default RowItemModal;
