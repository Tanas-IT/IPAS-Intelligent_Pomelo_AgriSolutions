import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { configFormFields, criteriaGroupsHasReference } from "@/constants";
import { GetSystemConfig, SystemConfigRequest } from "@/payloads";
import style from "./SysConfigurationModal.module.scss";
import { SelectOption } from "@/types";
import { systemConfigService } from "@/services";

type SysConfigurationModalProps = {
  isOpen: boolean;
  onClose: (values: SystemConfigRequest, isUpdate: boolean) => void;
  onSave: (values: SystemConfigRequest) => void;
  isLoadingAction?: boolean;
  configData?: GetSystemConfig;
  groupOptions: SelectOption[];
  groupCurrent: string;
};

const SysConfigurationModal = ({
  isOpen,
  onClose,
  onSave,
  configData,
  isLoadingAction,
  groupOptions,
  groupCurrent,
}: SysConfigurationModalProps) => {
  const [form] = Form.useForm();
  const [checked, setChecked] = useState<boolean>(false);
  const isUpdate = configData !== undefined && Object.keys(configData).length > 0;
  const handleSwitchChange = (newChecked: boolean) => setChecked(newChecked);
  const shouldShowPlantLocation = criteriaGroupsHasReference.includes(groupCurrent);
  const [loading, setLoading] = useState(false);
  const [keyOptions, setKeyOptions] = useState<SelectOption[]>([]);

  const handleGroupChange = async (group: string) => {
    form.setFieldsValue({
      ["groupSelect"]: group,
    });

    setLoading(true);
    try {
      const res = await systemConfigService.getSystemConfigSelect(group);

      if (res.statusCode === 200) {
        if (res.data) setKeyOptions(res.data.map((item) => ({ value: item.id, label: item.code })));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setChecked(false);
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      if (isUpdate && configData) {
        form.setFieldsValue({ ...configData });
        setChecked(configData.isActive);
      } else {
        form.setFieldsValue({ [configFormFields.configGroup]: groupCurrent });
      }
    }
  }, [isOpen, configData]);

  const getFormData = (): SystemConfigRequest => {
    const commonFields = {
      configValue: form.getFieldValue(configFormFields.configValue),
      description: form.getFieldValue(configFormFields.description),
    };

    if (isUpdate) {
      return {
        configId: form.getFieldValue(configFormFields.configId),
        isActive: checked,
        ...commonFields,
      };
    }

    return {
      configGroup: form.getFieldValue(configFormFields.configGroup),
      configKey: form.getFieldValue(configFormFields.configKey),
      referenceKeyId: form.getFieldValue(configFormFields.referenceKeyId),
      ...commonFields,
    };
  };

  const handleOk = async () => {
    await form.validateFields();
    // console.log(getFormData());
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
      title={isUpdate ? "Update Configuration" : "Add New Configuration"}
      size="large"
    >
      <Form form={form} layout="vertical">
        <Flex gap={20}>
          {!isUpdate && (
            <FormFieldModal
              label={"Configuration Group"}
              name={configFormFields.configGroup}
              readonly
            />
          )}
          {!shouldShowPlantLocation && (
            <FormFieldModal
              label={"Configuration Key"}
              name={configFormFields.configKey}
              readonly={isUpdate ? true : false}
              placeholder={"Enter the Configuration Key"}
              rules={RulesManager.getRequiredRules("Configuration Key")}
            />
          )}
        </Flex>
        {!shouldShowPlantLocation && (
          <FormFieldModal
            label={"Configuration Value"}
            name={configFormFields.configValue}
            placeholder={"Enter the Configuration Value"}
            rules={RulesManager.getRequiredRules("Configuration Value")}
          />
        )}
        {shouldShowPlantLocation ||
          (!isUpdate && (
            <fieldset className={style.plantLocationContainer}>
              <legend>Configuration Reference</legend>
              <Flex justify="space-between" vertical>
                <Flex gap={20}>
                  <FormFieldModal
                    type="select"
                    label="Group"
                    name={"groupSelect"}
                    options={groupOptions}
                    onChange={handleGroupChange}
                    rules={RulesManager.getRequiredRules("Group")}
                  />
                  <FormFieldModal
                    type="select"
                    label="Key"
                    name={configFormFields.referenceKeyId}
                    options={keyOptions}
                    isLoading={loading}
                    rules={RulesManager.getRequiredRules("Key")}
                  />
                </Flex>
              </Flex>
            </fieldset>
          ))}
        <FormFieldModal
          label="Description"
          type="textarea"
          name={configFormFields.description}
          placeholder="Enter the description"
        />
        {isUpdate && (
          <FormFieldModal
            type="switch"
            label="Status"
            name={configFormFields.isActive}
            onChange={handleSwitchChange}
            isCheck={checked}
            direction="row"
          />
        )}
      </Form>
    </ModalForm>
  );
};

export default SysConfigurationModal;
