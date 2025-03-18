import { Button, Col, Divider, Flex, Form, Input, Modal, Row, Select, Switch } from "antd";
import { useState, useEffect } from "react";
import { CustomButton, FormFieldModal, InfoField, ModalForm } from "@/components";
import style from "./ProcessList.module.scss";
import { fetchGrowthStageOptions, fetchTypeOptionsByName, getFarmId, planTargetOptions, planTargetOptions2, RulesManager } from "@/utils";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { Icons } from "@/assets";
import AddPlanModal from "./AddPlanModal";
import { planService, processService } from "@/services";
import { ProcessRequest } from "@/payloads/process/requests";
import { toast } from "react-toastify";
import { useMasterTypeOptions, usePlanManager } from "@/hooks";
import PlanList from "./PlanList";
import { SelectOption } from "@/types";
import useGraftedPlantOptions from "@/hooks/useGraftedPlantOptions";
import usePlantLotOptions from "@/hooks/usePlantLotOptions";

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
    const [form] = Form.useForm();
    // const [planForm] = Form.useForm();
    const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number>[]>([]);
    const [isLockedGrowthStage, setIsLockedGrowthStage] = useState<boolean>(false);
    const [isTargetDisabled, setIsTargetDisabled] = useState<boolean>(true);
    const farmId = Number(getFarmId());
    const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);
    const { options: graftedPlantsOptions } = useGraftedPlantOptions(farmId);
    const { options: plantLotOptions } = usePlantLotOptions();
    const {
        plans, planForm, isPlanModalOpen, editPlan,
        handleAddPlan, handleEditPlan, handleDeletePlan,
        handleCloseModal, handleOpenModal, setPlans
    } = usePlanManager();
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isSample, setIsSample] = useState<boolean>(false);
    const [targetType, setTargetType] = useState<string>();

    const handlePlanTargetChange = async (target: string) => {
        setTargetType(target);
        form.setFieldsValue({
            planTargetModel: [],
        });

        if (target === "graftedPlant") {
            setIsLockedGrowthStage(false);
            setIsTargetDisabled(true);
        } else if (target === "plantLot") {
            setIsTargetDisabled(true);
            // form.setFieldValue("processId", undefined);
            // setIsLockedGrowthStage(false);
        } else {
            // setIsLockedGrowthStage(false);
            setIsTargetDisabled(false);
        }
    };



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
                ListPlan: formattedPlans,
                IsSample: values.isSample,
                PlanTargetInProcess: values.planTarget
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

    const handleIsActiveChange = (newChecked: boolean) => {
        setIsActive(newChecked);
    };

    const handleIsSampleChange = (newChecked: boolean) => {
        setIsSample(newChecked);
    };


    return (
        <ModalForm isOpen={isOpen} onSave={handleOk} onClose={handleCancel} title="Add New Process" isUpdate={false}>
            {/* <h2 className={style.titleModal}>Add New Process</h2> */}
            {/* <Divider style={{ margin: "10px 0" }} /> */}
            <Form form={planForm} layout="vertical">
                <FormFieldModal
                    label="Process Name:"
                    name={processFormFields.processName}
                    rules={RulesManager.getProcessNameRules()}
                    placeholder="Enter process name"
                />
                <Flex gap={26}>
                    <FormFieldModal
                        label="Process Type"
                        name={processFormFields.masterTypeId}
                        options={processTypeOptions}
                        rules={RulesManager.getProcessTypeRules()}
                        type="select" />
                </Flex>
                <Flex gap={20}>
                    <FormFieldModal
                        label="Select Plan Target"
                        name={processFormFields.planTarget}
                        options={planTargetOptions2}
                        rules={RulesManager.getPlanTargetRules()}
                        disable={false}
                        type="select"
                        hasFeedback={false}
                        onChange={(value) => handlePlanTargetChange(value)}
                    />
                </Flex>
                <Flex vertical>
                    <FormFieldModal
                        type="switch"
                        label="Define Process Mode:"
                        name={processFormFields.isSample}
                        onChange={handleIsSampleChange}
                        isCheck={isSample}
                        direction="row"
                        checkedChildren="Guide"
                        unCheckedChildren="Plans"
                    />
                    <span style={{ fontSize: "12px", color: "#888", marginTop: "-20px" }}>
                        {isSample
                            ? "This process serves as a guide and only contains sub-processes."
                            : "This process includes both sub-processes and plan lists."}
                    </span>
                </Flex>
                <div style={{ marginTop: "20px" }}>
                    <FormFieldModal
                        type="switch"
                        label="Status:"
                        name={processFormFields.isActive}
                        onChange={handleIsActiveChange}
                        isCheck={isActive}
                        direction="row"
                    />
                </div>
            </Form>
        </ModalForm>
    );
};

export default ProcessModal;
