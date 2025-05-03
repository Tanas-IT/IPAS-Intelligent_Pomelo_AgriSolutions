import { Flex, Form, Input, Modal, Switch } from "antd";
import { FormFieldModal, ModalForm } from "@/components";
import { useState } from "react";
import { planTargetOptions2, RulesManager } from "@/utils";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { useMasterTypeOptions } from "@/hooks";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (processName: string, isSample: boolean, masterTypeId: number, planTargetInProcess: number) => void;
}

const AIGenerateModal = ({ isOpen, onClose, onGenerate }: AIGenerateModalProps) => {
  const [form] = Form.useForm();
  const [isSample, setIsSample] = useState<boolean>(false);
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);

  const handleGenerate = async () => {
    const values = await form.validateFields();
    console.log("values", values);
    
    onGenerate(values.processName, isSample, values.masterTypeId, values.planTargetInProcess);
    form.resetFields();
    setIsSample(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsSample(false);
    onClose();
  };

  const handleIsSampleChange = (checked: boolean) => {
    setIsSample(checked);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onSave={handleGenerate}
      onClose={handleCancel}
      title="Generate Process with AI"
      isUpdate={false}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Process Name:"
          name={processFormFields.processName}
          rules={RulesManager.getProcessNameRules()}
          placeholder="Enter process name"
        />
        <Flex gap={26}>
          <FormFieldModal
            label="Process Type"
            name={processFormFields.masterTypeId}
            options={processTypeOptions}
            rules={RulesManager.getProcessTypeRules()}
            type="select" />
        </Flex>
        <Flex gap={20}>
          <FormFieldModal
            label="Select Target"
            name="planTargetInProcess"
            options={planTargetOptions2}
            rules={RulesManager.getPlanTargetRules()}
            disable={false}
            type="select"
            hasFeedback={false}
          />
        </Flex>
        <FormFieldModal
          type="switch"
          label="Define Process Mode:"
          name={processFormFields.isSample}
          onChange={handleIsSampleChange}
          isCheck={isSample}
          direction="row"
          checkedChildren="Guide"
          unCheckedChildren="Plans"
        />
        <span style={{ fontSize: "12px", color: "#888", marginTop: "-20px" }}>
          {isSample
            ? "This process serves as a guide and only contains sub-processes."
            : "This process includes both sub-processes and plan lists."}
        </span>
      </Form>
    </ModalForm>
  );
};

export default AIGenerateModal;