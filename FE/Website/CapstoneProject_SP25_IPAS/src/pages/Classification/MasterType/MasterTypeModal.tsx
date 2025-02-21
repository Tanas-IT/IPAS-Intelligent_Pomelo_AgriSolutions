import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { MASTER_TYPE, masterTypeFormFields } from "@/constants";
import { GetMasterType, MasterTypeRequest } from "@/payloads";

type MasterTypeModelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: MasterTypeRequest) => void;
  masterTypeData?: GetMasterType;
};

const MasterTypeModel = ({ isOpen, onClose, onSave, masterTypeData }: MasterTypeModelProps) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>("");
  const [checked, setChecked] = useState<boolean>(false);
  const isEdit = masterTypeData !== undefined && Object.keys(masterTypeData).length > 0;
  const typeOptions = Object.keys(MASTER_TYPE).map((key) => ({
    value: MASTER_TYPE[key as keyof typeof MASTER_TYPE],
    label: MASTER_TYPE[key as keyof typeof MASTER_TYPE],
  }));

  const handleSwitchChange = (newChecked: boolean) => {
    setChecked(newChecked);
  };

  const resetForm = () => {
    form.resetFields();
    setChecked(false);
    setSelectedType("");
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isEdit && masterTypeData) {
        form.setFieldsValue({
          masterTypeId: masterTypeData.masterTypeId,
          masterTypeName: masterTypeData.masterTypeName,
          masterTypeDescription: masterTypeData.masterTypeDescription,
          backgroundColor: masterTypeData.backgroundColor,
          textColor: masterTypeData.textColor,
          characteristic: masterTypeData.characteristic,
          typeName: masterTypeData.typeName,
        });
        setChecked(masterTypeData.isActive);
        setSelectedType(masterTypeData.typeName);
      }
    }
  }, [isOpen, masterTypeData]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handleOk = async () => {
    await form.validateFields();

    const masterTypeData: MasterTypeRequest = {
      masterTypeId: form.getFieldValue(masterTypeFormFields.masterTypeId),
      masterTypeName: form.getFieldValue(masterTypeFormFields.masterTypeName),
      masterTypeDescription: form.getFieldValue(masterTypeFormFields.masterTypeDescription),
      typeName: form.getFieldValue(masterTypeFormFields.typeName),
      isActive: checked,
      ...(form.getFieldValue(masterTypeFormFields.backgroundColor) && {
        backgroundColor:
          typeof form.getFieldValue(masterTypeFormFields.backgroundColor).toHexString === "function"
            ? form.getFieldValue(masterTypeFormFields.backgroundColor).toHexString()
            : form.getFieldValue(masterTypeFormFields.backgroundColor), // Nếu không có toHexString() thì giữ nguyên giá trị
      }),
      ...(form.getFieldValue(masterTypeFormFields.textColor) && {
        textColor:
          typeof form.getFieldValue(masterTypeFormFields.textColor).toHexString === "function"
            ? form.getFieldValue(masterTypeFormFields.textColor).toHexString()
            : form.getFieldValue(masterTypeFormFields.textColor),
      }),
      ...(form.getFieldValue(masterTypeFormFields.characteristic)?.trim() && {
        characteristic: form.getFieldValue(masterTypeFormFields.characteristic).trim(),
      }),
    };
    onSave(masterTypeData);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isEdit={isEdit}
      title={isEdit ? "Update Type" : "Add New Type"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Type Name:"
          name={masterTypeFormFields.masterTypeName}
          rules={RulesManager.getTypeNameRules()}
          placeholder="Enter the type name"
        />
        <FormFieldModal
          label="Description:"
          type="textarea"
          name={masterTypeFormFields.masterTypeDescription}
          rules={RulesManager.getFarmDescriptionRules()}
          placeholder="Enter the description"
        />

        <FormFieldModal
          type="select"
          label="Type:"
          name={masterTypeFormFields.typeName}
          rules={RulesManager.getTypeRules()}
          options={typeOptions}
          onChange={handleTypeChange}
        />

        {selectedType === MASTER_TYPE.WORK && (
          <>
            <Flex justify="space-between" gap={40}>
              <FormFieldModal
                type="colorPicker"
                label="Background Color:"
                name={masterTypeFormFields.backgroundColor}
                placeholder="Enter background color"
                direction="row"
              />
              <FormFieldModal
                type="colorPicker"
                label="Text Color:"
                name={masterTypeFormFields.textColor}
                placeholder="Enter text color"
                direction="row"
              />
            </Flex>
          </>
        )}

        {selectedType === MASTER_TYPE.CULTIVAR && (
          <>
            <FormFieldModal
              type="textarea"
              label="Characteristic:"
              name={masterTypeFormFields.characteristic}
              rules={RulesManager.getCharacteristicRules()}
              placeholder="Enter characteristic"
            />
          </>
        )}

        <FormFieldModal
          type="switch"
          label="Status:"
          name={masterTypeFormFields.isActive}
          onChange={handleSwitchChange}
          isCheck={checked}
          direction="row"
        />
      </Form>
    </ModalForm>
  );
};

export default MasterTypeModel;
