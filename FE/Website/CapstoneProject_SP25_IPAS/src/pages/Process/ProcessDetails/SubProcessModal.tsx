import { FormFieldModal, InfoField, ModalForm } from "@/components";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { useMasterTypeOptions } from "@/hooks";
import { fetchGrowthStageOptions, getFarmId, RulesManager } from "@/utils";
import { Modal, Form, Input, Select, Flex } from "antd";
import { useEffect, useState } from "react";

interface SubProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
}

type OptionType<T = string | number> = {
    value: T;
    label: string
};

const SubProcessModal: React.FC<SubProcessModalProps> = ({ isOpen, onClose, onSave, initialValues }) => {
    const [form] = Form.useForm();
    const farmId = Number(getFarmId());
    const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);
    const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number>[]>([]);
    
    const handleSave = () => {
        form.validateFields().then(values => {
            onSave(values);
            form.resetFields();
            onClose();
        });
    };

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    useEffect(() => {
            const fetchData = async () => {
                setGrowthStageOptions(await fetchGrowthStageOptions(farmId));
            };
            fetchData();
        }, []);

    return (
        <ModalForm
            title={initialValues ? "Edit Sub-Process" : "Add Sub-Process"}
            isOpen={isOpen}
            onSave={handleSave}
            onClose={onClose}
        >
            <Form form={form} layout="vertical">
            <InfoField
                    label="Process Name"
                    name={processFormFields.processName}
                    // name="name"
                    rules={RulesManager.getProcessNameRules()}
                    isEditing
                    placeholder="Enter process name" />
                <Flex gap={26}>
                    <InfoField
                        label="Growth Stage"
                        name={processFormFields.growthStageId}
                        options={growthStageOptions}
                        isEditing
                        rules={RulesManager.getGrowthStageRules()}
                        type="select" />
                    <InfoField
                        label="Process Type"
                        name={processFormFields.masterTypeId}
                        options={processTypeOptions}
                        isEditing
                        rules={RulesManager.getProcessTypeRules()}
                        type="select" />
                </Flex>
                <InfoField
                    label="Status"
                    name={processFormFields.isActive}
                    isEditing
                    type="switch" />
            </Form>
        </ModalForm>
    );
};

export default SubProcessModal;