import { Button, Divider, Flex, Form, Input, Modal, Select, Switch } from "antd";
import { useState, useEffect } from "react";
import { CustomButton, InfoField } from "@/components";
import style from "./ProcessList.module.scss";
import { useStyle } from "@/hooks";
import { fetchGrowthStageOptions, fetchTypeOptionsByName, RulesManager } from "@/utils";
import { addPlanFormFields, processFormFields } from "@/constants";
import { Icons } from "@/assets";
import AddPlanModal from "./AddPlanModal";

type ProcessModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
};

type OptionType<T = string | number> = { 
    value: T; 
    label: string 
};
type PlanType = { 
    planId: number; 
    planName: string; 
    planDetail: string; 
    growthStageId: string; 
    masterTypeId: string 
};

const ProcessModal = ({ isOpen, onClose, onSave }: ProcessModalProps) => {
    const [form] = Form.useForm();
    const [planForm] = Form.useForm();
    const { styles } = useStyle();
    const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number | string>[]>([]);
    const [processTypeOptions, setProcessTypeOptions] = useState<OptionType<number | string>[]>([]);
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<PlanType | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setGrowthStageOptions(await fetchGrowthStageOptions(true));
            setProcessTypeOptions(await fetchTypeOptionsByName("Process"));
        };
        fetchData();
    }, []);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                console.log("Form Values:", { ...values, plans });
                onSave({ ...values, plans });
                form.resetFields();
                setPlans([]);
            })
            .catch(info => console.log("Validation Failed:", info));
    };

    const handleCancel = () => {
        form.resetFields();
        setPlans([]);
        onClose();
    };

    const handleAddPlan = (values: Omit<PlanType, "planId">) => {
        if (editPlan) {
            setPlans(prev => prev.map(plan => (plan.planId === editPlan.planId ? { ...editPlan, ...values } : plan)));
        } else {
            setPlans([...plans, { ...values, planId: Date.now() }]);
        }
        setEditPlan(null);
        planForm.resetFields();
        setIsPlanModalOpen(false);
    };

    const handleEditPlan = (plan: PlanType) => {
        setEditPlan(plan);
        planForm.setFieldsValue(plan);
        setIsPlanModalOpen(true);
    };

    const handleDeletePlan = (id: number) => {
        setPlans(plans.filter(plan => plan.planId !== id));
    };

    const handleCloseModal = () => {
        setEditPlan(null);
        setIsPlanModalOpen(false);
    }

    const handleOpenModal = () => {
        setEditPlan(null);
        planForm.resetFields();
        setIsPlanModalOpen(true);
    }

    return (
        <Modal open={isOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <h2 className={style.titleModal}>Add New Process</h2>
            <Divider style={{ margin: "10px 0" }} />
            <Form form={form} layout="vertical">
                <InfoField
                    label="Process Name"
                    name={processFormFields.processName}
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
                <Form.Item>
                    <Flex style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
                        <label className={style.title}>Status:</label>
                        <Switch
                            className={styles.customSwitch}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            defaultChecked />
                    </Flex>
                </Form.Item>
                <Divider />
                <h3 className={style.titleAddPlan}>Add Plans</h3>
                {plans.map(plan => (
                    <div key={plan.planId} className={style.planItem}>
                        <span>{plan.planName}</span>
                        <div className={style.planActions}>
                            <Icons.edit color="blue" size={20} onClick={() => handleEditPlan(plan)} />
                            <Icons.delete color="red" size={20} onClick={() => handleDeletePlan(plan.planId)} />
                        </div>
                    </div>
                ))}
                <Button type="dashed" onClick={handleOpenModal}>+ Add Plan</Button>
                <Divider />
                <Flex justify="end">
                    <Button onClick={handleCancel} style={{ marginRight: 10 }}>Cancel</Button>
                    <CustomButton label="Add Process" htmlType="submit" handleOnClick={handleOk} />
                </Flex>
            </Form>
            <AddPlanModal
                isOpen={isPlanModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddPlan}
                editPlan={editPlan}
                growthStageOptions={growthStageOptions}
                processTypeOptions={processTypeOptions}
            />
        </Modal>
    );
};

export default ProcessModal;
