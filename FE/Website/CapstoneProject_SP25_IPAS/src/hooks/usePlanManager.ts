import { useState } from "react";
import { Form } from "antd";
import { PlanType } from "@/payloads/process";

 const usePlanManager = () => {
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<PlanType | null>(null);
    const [planForm] = Form.useForm();

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
    };

    const handleOpenModal = () => {
        setEditPlan(null);
        planForm.resetFields();
        setIsPlanModalOpen(true);
    };

    return {
        plans,
        planForm,
        isPlanModalOpen,
        editPlan,
        handleAddPlan,
        handleEditPlan,
        handleDeletePlan,
        handleCloseModal,
        handleOpenModal,
        setPlans
    };
};

export default usePlanManager;
