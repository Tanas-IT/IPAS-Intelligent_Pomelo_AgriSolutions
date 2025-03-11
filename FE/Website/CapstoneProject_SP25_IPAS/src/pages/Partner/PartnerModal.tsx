import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { PARTNER, partnerFormFields } from "@/constants";
import { GetPartner, PartnerRequest } from "@/payloads";

type PartnerModalProps = {
  isOpen: boolean;
  onClose: (values: PartnerRequest, isUpdate: boolean) => void;
  onSave: (values: PartnerRequest) => void;
  isLoadingAction?: boolean;
  partnerData?: GetPartner;
};

const PartnerModal = ({
  isOpen,
  onClose,
  onSave,
  partnerData,
  isLoadingAction,
}: PartnerModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = partnerData !== undefined && Object.keys(partnerData).length > 0;
  const PARTNER_OPTIONS = [
    { label: PARTNER.PROVIDER, value: PARTNER.PROVIDER },
    { label: PARTNER.CUSTOMER, value: PARTNER.CUSTOMER },
  ];
  const resetForm = () => form.resetFields();

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && partnerData) {
        form.setFieldsValue({
          ...partnerData,
        });
      }
    }
  }, [isOpen, partnerData]);

  const getFormData = (): PartnerRequest => ({
    partnerId: form.getFieldValue(partnerFormFields.partnerId),
    partnerCode: form.getFieldValue(partnerFormFields.partnerCode),
    partnerName: form.getFieldValue(partnerFormFields.partnerName),
    description: form.getFieldValue(partnerFormFields.description),
    major: form.getFieldValue(partnerFormFields.major),
    phoneNumber: form.getFieldValue(partnerFormFields.phoneNumber),
  });

  const handleOk = async () => {
    await form.validateFields();
    console.log(getFormData());

    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData(), isUpdate);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate ? "Update Partner" : "Add New Partner"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Partner Name"
          name={partnerFormFields.partnerName}
          rules={RulesManager.getStageNameRules()}
          placeholder="Enter the partner name"
        />
        <Flex justify="space-between" gap={20}>
          <FormFieldModal
            label="Phone Number"
            name={partnerFormFields.phoneNumber}
            rules={RulesManager.getPhoneNumberRules()}
          />
          <FormFieldModal
            type="select"
            label="Role"
            name={partnerFormFields.major}
            options={PARTNER_OPTIONS}
            rules={RulesManager.getSelectRoleRules()}
          />
        </Flex>

        <FormFieldModal
          label="Description"
          type="textarea"
          name={partnerFormFields.description}
          placeholder="Enter the description"
        />
      </Form>
    </ModalForm>
  );
};

export default PartnerModal;
