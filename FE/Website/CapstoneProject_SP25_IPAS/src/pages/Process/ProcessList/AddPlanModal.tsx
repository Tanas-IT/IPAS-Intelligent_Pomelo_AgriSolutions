import { Form, Modal, Flex } from "antd";
import { useEffect } from "react";
import { CustomButton, InfoField } from "@/components";
import { addPlanFormFields, processFormFields } from "@/constants";
import { RulesManager } from "@/utils";
import { PlanType } from "@/payloads/process";
import { SelectOption } from "@/types";

type AddPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // onSave: (values: Omit<PlanType, "planId">) => void;
  onSave: (values: PlanType, subProcessKey: string | null) => void;
  editPlan?: PlanType | null;
  growthStageOptions: { value: number; label: string }[];
  processTypeOptions: SelectOption[];
  subProcessId?: number;
};

const AddPlanModal = ({
  isOpen,
  onClose,
  onSave,
  editPlan,
  subProcessId,
}: AddPlanModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editPlan) {
      form.setFieldsValue(editPlan);
    } else {
      form.resetFields();
    }
  }, [editPlan, form]);

  const handleFinish = (values: PlanType) => {
    const updatedPlan = editPlan ? { ...editPlan, ...values } : values;
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

export default AddPlanModal;
