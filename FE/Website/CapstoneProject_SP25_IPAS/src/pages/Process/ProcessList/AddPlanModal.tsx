import { Button, Form, Modal, Flex } from "antd";
import { useEffect } from "react";
import { CustomButton, InfoField } from "@/components";
import { addPlanFormFields, processFormFields } from "@/constants";
import { RulesManager } from "@/utils";

type PlanType = { planId: number; planName: string; planDetail: string; growthStageId: number; masterTypeId: number, planNote: string };

type AddPlanModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: Omit<PlanType, "planId">) => void;
    editPlan?: PlanType | null;
    growthStageOptions: { value: number; label: string }[];
    processTypeOptions: { value: string; label: string }[];
    subProcessId?: number;
};

const AddPlanModal = ({ isOpen, onClose, onSave, editPlan, growthStageOptions, processTypeOptions, subProcessId }: AddPlanModalProps) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editPlan) {
            form.setFieldsValue(editPlan);
        } else {
            form.resetFields();
        }
    }, [editPlan, form]);

    const handleFinish = (values: Omit<PlanType, "planId">) => {
        console.log("values", values);
        
        onSave(values);
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
                    name={addPlanFormFields.planNote}
                    isEditing={true}
                    type="textarea"
                    placeholder="Enter care plan notes"
                />
                <InfoField
                    label="Growth Stage"
                    name={processFormFields.growthStageId}
                    options={growthStageOptions}
                    isEditing
                    // rules={RulesManager.getGrowthStageRules()}
                    type="select"
                />
                <InfoField
                    label="Process Type"
                    name={processFormFields.masterTypeId}
                    options={processTypeOptions}
                    isEditing
                    type="select"
                />
                <Flex justify="end">
                    <CustomButton label="Cancel" isCancel handleOnClick={onClose}/>
                    <CustomButton label={editPlan ? "Update Plan" : "Add Plan"}  htmlType="submit"/>
                </Flex>
            </Form>
        </Modal>
    );
};

export default AddPlanModal;
