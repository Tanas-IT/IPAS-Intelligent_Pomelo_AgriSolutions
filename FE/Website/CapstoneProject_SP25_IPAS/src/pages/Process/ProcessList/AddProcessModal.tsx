import { Button, Divider, Flex, Form, Input, Modal, Select, Switch } from "antd";
import { useState, useEffect } from "react";
import { CustomButton, InfoField } from "@/components";
import style from "./ProcessList.module.scss";
import { fetchGrowthStageOptions, fetchTypeOptionsByName, getFarmId, RulesManager } from "@/utils";
import { processFormFields } from "@/constants";
import { Icons } from "@/assets";
import AddPlanModal from "./AddPlanModal";
import { processService } from "@/services";
import { ProcessRequest } from "@/payloads/process/requests";
import { toast } from "react-toastify";

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
    planNote: string
    growthStageId: number;
    masterTypeId: number
};

const ProcessModal = ({ isOpen, onClose, onSave }: ProcessModalProps) => {
    const [form] = Form.useForm();
    const [planForm] = Form.useForm();
    const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number>[]>([]);
    const [processTypeOptions, setProcessTypeOptions] = useState<OptionType<number>[]>([]);
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<PlanType | null>(null);
    const farmId = Number(getFarmId());

    useEffect(() => {
        const fetchData = async () => {
            setGrowthStageOptions(await fetchGrowthStageOptions(farmId));
            setProcessTypeOptions(await fetchTypeOptionsByName("Process"));
        };
        fetchData();
    }, []);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            const formattedPlans = plans.map(({ planName, planDetail, planNote, growthStageId, masterTypeId }) => ({
                PlanName: planName,
                PlanDetail: planDetail,
                PlanNote: planNote,
                GrowthStageId: growthStageId,
                MasterTypeId: masterTypeId
            }));
    
            const payload: ProcessRequest = {
                FarmId: farmId,
                ProcessName: values.processName,
                MasterTypeId: values.masterTypeId,
                GrowthStageId: values.growthStageId,
                IsActive: values.isActive,
                ListPlan: formattedPlans
            };
    
            onSave(payload);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong!");
            console.error("Error creating process:", error);
        }
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
                <InfoField
                    label="Status"
                    name={processFormFields.isActive}
                    isEditing
                    type="switch" />
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
