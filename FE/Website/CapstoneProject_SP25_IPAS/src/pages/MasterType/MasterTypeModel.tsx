import { Flex, Form, Image, Upload, UploadFile, UploadProps } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, SectionWrapper } from "@/components";
import { getBase64, RulesManager } from "@/utils";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import {
  farmDocumentFormFields,
  MASTER_TYPE,
  masterTypeDetailFormFields,
  masterTypeFormFields,
  MESSAGES,
} from "@/constants";
import {
  GetMasterType,
  MasterTypeDetail,
  MasterTypeDetailRequest,
  MasterTypeRequest,
} from "@/payloads";
import { useStyle } from "@/hooks";
import { camelCase } from "change-case";

type MasterTypeModelProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: MasterTypeRequest) => void;
  masterTypeData?: GetMasterType;
};

const MasterTypeModel = ({ isOpen, onClose, onSave, masterTypeData }: MasterTypeModelProps) => {
  const { styles } = useStyle();
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>("");
  const isEdit = masterTypeData !== undefined && Object.keys(masterTypeData).length > 0;
  const typeOptions = Object.keys(MASTER_TYPE).map((key) => ({
    value: MASTER_TYPE[key as keyof typeof MASTER_TYPE],
    label: MASTER_TYPE[key as keyof typeof MASTER_TYPE],
  }));

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      if (isEdit && masterTypeData) {
        const hasDetails = masterTypeData.masterTypeDetailModels?.length > 0;
        const detailValues: Record<string, string> = {};
        const typeFieldMapping: Record<string, string[]> = {
          [MASTER_TYPE.WORK]: ["backgroundColor", "textColor", "volumeRequired"],
          [MASTER_TYPE.CULTIVAR]: ["characteristic"],
        };
        if (hasDetails) {
          masterTypeData.masterTypeDetailModels.forEach((detail) => {
            const camelKey = camelCase(detail.masterTypeDetailName); // Chuyển đổi thành camelCase
            if (typeFieldMapping[masterTypeData.typeName]?.includes(camelKey)) {
              detailValues[camelKey] = detail.value;
            }
          });
        }

        form.setFieldsValue({
          masterTypeId: masterTypeData.masterTypeId,
          masterTypeName: masterTypeData.masterTypeName,
          masterTypeDescription: masterTypeData.masterTypeDescription,
          typeName: masterTypeData.typeName,
          isActive: masterTypeData.isActive,
          ...detailValues,
        });
        setSelectedType(masterTypeData.typeName);
      }
    }
  }, [isOpen, masterTypeData]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handleOk = async () => {
    await form.validateFields();
    const masterTypeDetailModels: MasterTypeDetailRequest[] = Object.entries(
      masterTypeDetailFormFields,
    )
      .map(([key, fieldName]) => {
        let value = form.getFieldValue(fieldName);

        if (!value || (typeof value === "string" && value.trim() === "")) return null;

        if (
          (fieldName === masterTypeDetailFormFields.backgroundColor ||
            fieldName === masterTypeDetailFormFields.textColor) &&
          typeof value === "object" &&
          typeof value.toHexString === "function"
        ) {
          value = value.toHexString();
        } else {
          value = value.toString().trim();
        }

        return { masterTypeDetailName: key, value };
      })
      .filter((item): item is MasterTypeDetailRequest => item !== null); // Lọc bỏ phần tử null và ép kiểu

    const masterTypeData: MasterTypeRequest = {
      masterTypeId: form.getFieldValue(masterTypeFormFields.masterTypeId),
      masterTypeName: form.getFieldValue(masterTypeFormFields.masterTypeName),
      masterTypeDescription: form.getFieldValue(masterTypeFormFields.masterTypeDescription),
      typeName: form.getFieldValue(masterTypeFormFields.typeName),
      isActive: form.getFieldValue(masterTypeFormFields.isActive),
      masterTypeDetailModels,
    };
    console.log(masterTypeData);

    // onSave(masterTypeData);
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType("");
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
            <Flex gap={40}>
              <FormFieldModal
                type="colorPicker"
                label="Background Color:"
                name={masterTypeDetailFormFields.backgroundColor}
                placeholder="Enter background color"
                direction="row"
              />
              <FormFieldModal
                type="colorPicker"
                label="Text Color:"
                name={masterTypeDetailFormFields.textColor}
                placeholder="Enter text color"
                direction="row"
              />
            </Flex>

            <FormFieldModal
              type="textarea"
              label="Volume Required:"
              name={masterTypeDetailFormFields.volumeRequired}
              placeholder="Enter volume required"
            />
          </>
        )}

        {selectedType === MASTER_TYPE.CULTIVAR && (
          <>
            <FormFieldModal
              type="textarea"
              label="Characteristic:"
              name={masterTypeDetailFormFields.characteristic}
              rules={RulesManager.getCharacteristicRules()}
              placeholder="Enter characteristic"
            />
          </>
        )}

        <FormFieldModal
          type="switch"
          label="Status:"
          name={masterTypeFormFields.isActive}
          isActive={form.getFieldValue(masterTypeFormFields.isActive)}
          direction="row"
        />
      </Form>
    </ModalForm>
  );
};

export default MasterTypeModel;
