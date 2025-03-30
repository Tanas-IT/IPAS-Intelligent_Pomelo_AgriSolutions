import { Alert, Button, Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, MESSAGES } from "@/constants";
import { useDirtyStore, usePlantLotStore } from "@/stores";
import { toast } from "react-toastify";
import { CreateGraftedPlantsRequest } from "@/payloads";

type CreateGraftedModalProps = {
  plantId: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: CreateGraftedPlantsRequest) => void;
  isLoadingAction?: boolean;
};

const CreateGraftedModal = ({
  plantId,
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: CreateGraftedModalProps) => {
  const [form] = Form.useForm();
  const { setIsDirty } = useDirtyStore();

  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
  }, [isOpen]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const requestData: CreateGraftedPlantsRequest = {
      plantId: plantId,
      totalNumber: Number(values.graftedQuantity),
      graftedDate: values.graftedDate.format("YYYY-MM-DD"),
      note: values.note || "",
    };
    onSave(requestData);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={`Create Grafted Plants`}
      saveLabel="Save"
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => {
          const values = form.getFieldsValue();
          setIsDirty(Object.values(values).some((value) => value !== undefined && value !== ""));
        }}
      >
        <FormFieldModal
          type="date"
          label="Grafted Date"
          name="graftedDate"
          rules={RulesManager.getDateRules()}
        />
        <FormFieldModal
          label="Grafted Quantity"
          name="graftedQuantity"
          rules={RulesManager.getQuantityRules()}
        />
        <FormFieldModal type="textarea" label="Note" name="note" />
      </Form>
    </ModalForm>
  );
};

export default CreateGraftedModal;
