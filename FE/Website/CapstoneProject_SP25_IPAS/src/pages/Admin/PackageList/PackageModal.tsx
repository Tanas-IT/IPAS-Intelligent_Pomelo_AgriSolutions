import { FormFieldModal, ModalForm } from "@/components";
import { MESSAGES, packageFormFields } from "@/constants";
import { GetPackage, PackageRequest } from "@/payloads/package";
import { RulesManager } from "@/utils";
import { Button, Flex, Form } from "antd";
import { useEffect, useState } from "react";
import style from "./PackageList.module.scss";
import { useDirtyStore } from "@/stores";
import { Icons } from "@/assets";
import { toast } from "react-toastify";

type PackageModalProps = {
  isOpen: boolean;
  onClose: (values: PackageRequest, isUpdate: boolean) => void;
  onSave: (values: PackageRequest) => void;
  isLoadingAction?: boolean;
  pkgData?: GetPackage;
};

const PackageModal = ({ isOpen, onClose, onSave, isLoadingAction, pkgData }: PackageModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = pkgData !== undefined && Object.keys(pkgData).length > 0;
  const [checked, setChecked] = useState<boolean>(false);
  const handleSwitchChange = (newChecked: boolean) => setChecked(newChecked);
  const { setIsDirty } = useDirtyStore();

  const resetForm = () => {
    form.resetFields();
    setChecked(false);
  };
  useEffect(() => {
    resetForm();
    if (isOpen && pkgData) {
      form.setFieldsValue({ ...pkgData });
      setChecked(pkgData.isActive);
    }
  }, [isOpen, pkgData]);

  const getFormData = (): PackageRequest => {
    const rawDetails = form.getFieldValue("packageDetails") || [];

    const packageDetails = rawDetails.map((detail: any, index: number) => {
      const originalDetail = pkgData?.packageDetails?.[index];
      return {
        ...detail,
        packageDetailId: originalDetail?.packageDetailId ?? 0,
      };
    });
    const baseData = {
      packageName: form.getFieldValue(packageFormFields.packageName),
      packagePrice: Number(form.getFieldValue(packageFormFields.packagePrice)),
      duration: Number(form.getFieldValue(packageFormFields.duration)),
      isActive: checked,
      packageDetails,
    };

    return isUpdate && pkgData ? { ...baseData, packageId: pkgData.packageId } : { ...baseData };
  };

  const handleOk = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    if (!isUpdate) {
      if (!values.packageDetails || values.packageDetails.length === 0) {
        toast.error(MESSAGES.REQUIRE_PACKAGE_DETAIL);
        return;
      }
    }
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
      title={isUpdate ? "Update Package" : "Add New Package"}
      size="largeXL"
    >
      <Form form={form} layout="vertical" className={style.packageForm}>
        <Flex gap={20}>
          <FormFieldModal
            label="Package Name:"
            name={packageFormFields.packageName}
            rules={RulesManager.getPackageNameRules()}
            placeholder="Enter the package name"
          />
          <FormFieldModal
            label="Package Price (VND):"
            name={packageFormFields.packagePrice}
            rules={RulesManager.getPackagePriceRules()}
            placeholder="Enter the package price"
          />
          <FormFieldModal
            label="Duration (Days):"
            name={packageFormFields.duration}
            rules={RulesManager.getDurationRules()}
            placeholder="Enter the duration"
          />
        </Flex>

        <FormFieldModal
          type="switch"
          label="Status"
          name={packageFormFields.isActive}
          onChange={handleSwitchChange}
          isCheck={checked}
          direction="row"
        />

        <fieldset className={`${style.formSection} ${style.larger}`}>
          <legend>Package Details</legend>
          <Form.List name="packageDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }, index) => (
                  <Flex key={key} align="center" gap={40}>
                    <span>{index + 1}.</span>
                    <FormFieldModal
                      label="Feature Name"
                      name={[name, "featureName"]}
                      rules={RulesManager.getFeatureNameRules()}
                    />
                    <FormFieldModal
                      label="Feature Description"
                      name={[name, "featureDescription"]}
                    />

                    <Button
                      onClick={() => {
                        remove(name);
                        if (fields.length - 1 === 0) setIsDirty(false);
                      }}
                      className={style.minus}
                    >
                      -
                    </Button>
                  </Flex>
                ))}
                <Button
                  type="dashed"
                  icon={<Icons.plus />}
                  onClick={() => {
                    add(), setIsDirty(true);
                  }}
                >
                  Add Detail
                </Button>
              </>
            )}
          </Form.List>
        </fieldset>
      </Form>
    </ModalForm>
  );
};

export default PackageModal;
