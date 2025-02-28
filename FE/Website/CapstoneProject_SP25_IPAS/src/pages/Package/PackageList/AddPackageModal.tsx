import { FormFieldModal, ModalForm } from "@/components";
import { packageFormFields } from "@/constants";
import { PackageRequest } from "@/payloads/package/requests/PackageRequest";
import { RulesManager } from "@/utils";
import { Form } from "antd";

type PackageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: PackageRequest) => void;
    data?: PackageRequest;
};

const AddPackageModal = ({ isOpen, onClose, onSave, data }: PackageModalProps) => {
    const [form] = Form.useForm();
    const handleCancel = () => {
        form.resetFields();
        onClose();
      };

      const handleOk = async () => {
          await form.validateFields();
          const data: PackageRequest = {
            packageName: form.getFieldValue(packageFormFields.packageName),
            packagePrice: form.getFieldValue(packageFormFields.packagePrice),
            duration: form.getFieldValue(packageFormFields.duration),
            isActive: form.getFieldValue(packageFormFields.isActive),
            
          };
          onSave(data);
        };
    return (
        <ModalForm
            isOpen={isOpen}
            onClose={handleCancel}
            onSave={handleOk}
            isUpdate={false}
            title="Add New Package"
        >
            <Form>
                <FormFieldModal
                    label="Package Name:"
                    name={packageFormFields.packageName}
                    rules={RulesManager.getPackageNameRules()}
                    placeholder="Enter the package name"
                />
                <FormFieldModal
                    label="Package Price:"
                    name={packageFormFields.packagePrice}
                    rules={RulesManager.getPackagePriceRules()}
                    placeholder="Enter the package price"
                />
                <FormFieldModal
                    label="Duration:"
                    name={packageFormFields.duration}
                    rules={RulesManager.getDurationRules()}
                    placeholder="Enter the duration"
                />
            </Form>
        </ModalForm>
    )
}

export default AddPackageModal;