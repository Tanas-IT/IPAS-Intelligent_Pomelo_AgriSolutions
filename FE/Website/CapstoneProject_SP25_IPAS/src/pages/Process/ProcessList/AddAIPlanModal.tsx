import { Form, Modal, Flex } from "antd";
import { useEffect } from "react";
import { CustomButton, InfoField } from "@/components";
import { addPlanFormFields, processFormFields } from "@/constants";
import { RulesManager } from "@/utils";
import { AIPlanType } from "@/payloads/process/requests";
import { SelectOption } from "@/types";

type AddAIPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: AIPlanType, subProcessKey: string | null) => void;
  editPlan?: AIPlanType | null;
  subProcessId?: number;
  growthStageOptions: { value: number; label: string }[];
  processTypeOptions: SelectOption[];
};

const AddAIPlanModal = ({
  isOpen,
  onClose,
  onSave,
  editPlan,
  subProcessId,
  growthStageOptions,
  processTypeOptions,
}: AddAIPlanModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editPlan) {
      form.setFieldsValue(editPlan);
    } else {
      form.resetFields();
    }
  }, [editPlan, form]);

  const handleFinish = (values: AIPlanType) => {
    const updatedPlan = editPlan ? { ...editPlan, ...values } : {
      ...values,
      planId: 0,
      planStatus: "add",
      growthStageId: values.growthStageId || 0,
      masterTypeId: values.masterTypeId || 0,
    };
    onSave(updatedPlan, subProcessId ? subProcessId.toString() : null);
    form.resetFields();
    onClose();
  };

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null}>
      <h3>{editPlan ? "Edit Plan" : "Add New Plan"}</h3>
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <InfoField
          label="Name"
          name={addPlanFormFields.planName}
          rules={RulesManager.getPlanNameRules()}
          isEditing={true}
          placeholder="Enter care plan name"
        />
        <InfoField
          label="Detail"
          name={addPlanFormFields.planDetail}
          isEditing={true}
          type="textarea"
          placeholder="Enter care plan details"
        />
        <InfoField
          label="Notes"
          name="planNote"
          isEditing={true}
          type="textarea"
          placeholder="Enter care plan notes"
        />
        <Flex justify="end" gap={15}>
          <CustomButton label="Cancel" isCancel handleOnClick={onClose} />
          <CustomButton label={editPlan ? "Update Plan" : "Add Plan"} htmlType="submit" />
        </Flex>
      </Form>
    </Modal>
  );
};

export default AddAIPlanModal;