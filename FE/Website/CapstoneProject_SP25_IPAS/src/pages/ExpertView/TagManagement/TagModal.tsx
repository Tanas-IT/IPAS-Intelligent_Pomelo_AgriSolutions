import { Flex, Form } from "antd";
import { useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { formatDateReq, RulesManager } from "@/utils";
import { USER_ROLE_OPTIONS, userFormFields } from "@/constants";
import { GetTag, TagRequest } from "@/payloads";
import dayjs from "dayjs";

type TagModalProps = {
  isOpen: boolean;
  onClose: (values: TagRequest, isUpdate: boolean) => void;
  onSave: (values: TagRequest) => void;
  isLoadingAction?: boolean;
  tagData?: GetTag;
};

const TagModal = ({ isOpen, onClose, onSave, tagData, isLoadingAction }: TagModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = tagData !== undefined && Object.keys(tagData).length > 0;

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen && tagData) {
      form.setFieldsValue({ ...tagData });
    }
  }, [isOpen, tagData]);

  const getFormData = (): TagRequest => {
    const formData: TagRequest = {
      name: form.getFieldValue("name"),
    };

    if (isUpdate && tagData?.tagId) {
      return {
        ...formData,
        tagId: tagData.tagId,
      };
    }

    return formData;
  };

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
      title={isUpdate ? "Update Tag" : "Add New Tag"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Tag Name"
          name={"name"}
          rules={RulesManager.getRequiredRules("Tag Name")}
        />
      </Form>
    </ModalForm>
  );
};

export default TagModal;
