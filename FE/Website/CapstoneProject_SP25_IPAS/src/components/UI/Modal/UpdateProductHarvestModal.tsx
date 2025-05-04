import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { getUserId, RulesManager } from "@/utils";
import { updateProductHarvestFormFields } from "@/constants";
import { productHarvestHistoryRes, UpdateProductHarvestRequest } from "@/payloads";

type UpdateProductHarvestModalProps = {
  isPlant?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: UpdateProductHarvestRequest) => void;
  isLoadingAction?: boolean;
  productHarvest?: productHarvestHistoryRes;
  quantity?: number;
  productHarvestId?: number;
};

const UpdateProductHarvestModal = ({
  isPlant = false,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
  productHarvest,
  quantity,
  productHarvestId,
}: UpdateProductHarvestModalProps) => {
  const [form] = Form.useForm();
  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (productHarvest) {
        form.setFieldsValue({
          ...productHarvest,
          [updateProductHarvestFormFields.quantity]: productHarvest.quantityNeed,
        });
      } else if (quantity || productHarvestId) {
        form.setFieldsValue({
          [updateProductHarvestFormFields.productHarvestHistoryId]: productHarvestId,
          [updateProductHarvestFormFields.quantity]: quantity,
        });
      }
    }
  }, [isOpen]);

  const getFormData = (): UpdateProductHarvestRequest => {
    const harvestId = form.getFieldValue(updateProductHarvestFormFields.productHarvestHistoryId);
    const quantity = form.getFieldValue(updateProductHarvestFormFields.quantity);
    const userId = Number(getUserId());

    if (isPlant) {
      return {
        productHarvestHistoryId: harvestId,
        quantity,
        userId,
      };
    }

    return {
      productHarvestHistoryId: harvestId,
      unit: form.getFieldValue(updateProductHarvestFormFields.unit),
      sellPrice: form.getFieldValue(updateProductHarvestFormFields.sellPrice),
      costPrice: form.getFieldValue(updateProductHarvestFormFields.costPrice),
      quantity,
      userId,
    };
  };

  const handleOk = async () => {
    await form.validateFields();
    onSave(getFormData());
  };

  const handleCancel = () => onClose();

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Update Product Harvest"}
      saveLabel="Save Changes"
      size="normalXL"
    >
      <Form form={form} layout="vertical">
        {isPlant ? (
          <FormFieldModal
            label="Yield"
            name={updateProductHarvestFormFields.quantity}
            rules={RulesManager.getNumberRulesAllowZero("Yield")}
          />
        ) : (
          <>
            <Flex gap={20}>
              <FormFieldModal
                label="Unit"
                name={updateProductHarvestFormFields.unit}
                rules={RulesManager.getRequiredRules("Unit")}
              />
              <FormFieldModal
                label="Yield Need"
                name={updateProductHarvestFormFields.quantity}
                rules={RulesManager.getNumberRules("Yield")}
              />
            </Flex>
            <Flex gap={20}>
              <FormFieldModal
                label="Cost Price (VND)"
                name={updateProductHarvestFormFields.costPrice}
                // rules={RulesManager.getPriceRules("Cost Price")}
              />
              <FormFieldModal
                label="Revenue Price (VND)"
                name={updateProductHarvestFormFields.sellPrice}
                // rules={RulesManager.getPriceRules("Sell Price")}
              />
            </Flex>
          </>
        )}
      </Form>
    </ModalForm>
  );
};

export default UpdateProductHarvestModal;
