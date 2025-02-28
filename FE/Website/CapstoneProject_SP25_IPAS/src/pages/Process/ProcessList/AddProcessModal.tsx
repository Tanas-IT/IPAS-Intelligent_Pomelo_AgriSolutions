import { Button, Divider, Flex, Form, Input, Modal, Select, Switch } from "antd";
import { useState, useEffect } from "react";
import { CustomButton, InfoField } from "@/components";
import style from "./ProcessList.module.scss";
import { fetchGrowthStageOptions, fetchTypeOptionsByName, getFarmId, RulesManager } from "@/utils";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { Icons } from "@/assets";
import AddPlanModal from "./AddPlanModal";
import { processService } from "@/services";
import { ProcessRequest } from "@/payloads/process/requests";
import { toast } from "react-toastify";
import { useMasterTypeOptions, usePlanManager } from "@/hooks";
import PlanList from "./PlanList";

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
    masterTypeId: number;
    planStatus: string;
};

const ProcessModal = ({ isOpen, onClose, onSave }: ProcessModalProps) => {
    // const [form] = Form.useForm();
    // const [planForm] = Form.useForm();
    const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number>[]>([]);
    const farmId = Number(getFarmId());
    const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);
    const { 
        plans, planForm, isPlanModalOpen, editPlan, 
        handleAddPlan, handleEditPlan, handleDeletePlan, 
        handleCloseModal, handleOpenModal, setPlans 
    } = usePlanManager();
    

    useEffect(() => {
        const fetchData = async () => {
            setGrowthStageOptions(await fetchGrowthStageOptions(farmId));
        };
        fetchData();
    }, []);

    const handleOk = async () => {
        try {
            const values = await planForm.validateFields();

            const formattedPlans = plans.map((plan: PlanType) => ({
                PlanName: plan.planName,
                PlanDetail: plan.planDetail,
                PlanNote: plan.planNote,
                GrowthStageId: plan.growthStageId,
                MasterTypeId: plan.masterTypeId,
                PlanStatus: plan.planStatus
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
        planForm.resetFields();
        setPlans([]);
        onClose();
    };

    return (
        <Modal open={isOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <h2 className={style.titleModal}>Add New Process</h2>
            <Divider style={{ margin: "10px 0" }} />
            <Form form={planForm} layout="vertical">
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
                {/* <h3 className={style.titleAddPlan}>Add Plans</h3>
                <PlanList
                    plans={plans}
                    onEdit={handleEditPlan}
                    onDelete={handleDeletePlan}
                    isEditing={true} />
                <Button type="dashed" onClick={handleOpenModal}>+ Add Plan</Button> */}
                <Divider />
                <Flex justify="end">
                    <Button onClick={handleCancel} style={{ marginRight: 10 }}>Cancel</Button>
                    <CustomButton label="Add Process" htmlType="submit" handleOnClick={handleOk} />
                </Flex>
            </Form>
            {/* <AddPlanModal
                isOpen={isPlanModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddPlan}
                editPlan={editPlan}
                growthStageOptions={growthStageOptions}
                processTypeOptions={processTypeOptions}
            /> */}
        </Modal>
    );
};

export default ProcessModal;
