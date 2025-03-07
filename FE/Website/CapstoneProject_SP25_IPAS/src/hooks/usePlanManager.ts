import { useState } from "react";
import { Form, TreeDataNode } from "antd";
import { PlanType } from "@/payloads/process";
import { generatePlanId } from "@/utils";

interface CustomTreeDataNode extends TreeDataNode {
    status?: string;
    order?: number;
    listPlan?: PlanType[];
    growthStageId?: number;
    masterTypeId?: number;
}

const usePlanManager = (nodes: CustomTreeDataNode[], setNodes: (newNodes: CustomTreeDataNode[]) => void) => {
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<PlanType | null>(null);
    const [planForm] = Form.useForm();

    const updatePlanInSubProcess = (nodes: CustomTreeDataNode[], subProcessKey: string, updatedPlan: PlanType): CustomTreeDataNode[] => {
        return nodes.map(node => {
            if (node.key === subProcessKey) {
                return {
                    ...node,
                    listPlan: node.listPlan?.map(plan =>
                        plan.planId === updatedPlan.planId ? updatedPlan : plan
                    ) || [],
                };
            }
            if (node.children && node.children.length > 0) {
                return { ...node, children: updatePlanInSubProcess(node.children, subProcessKey, updatedPlan) };
            }
            return node;
        });
    };

    const findSubProcessKeyByPlanId = (nodes: CustomTreeDataNode[], planId: number): string | null => {
        for (const node of nodes) {
            if (node.listPlan?.some(plan => plan.planId === planId)) {
                return String(node.key);
            }
            if (node.children) {
                const foundKey = findSubProcessKeyByPlanId(node.children, planId);
                if (foundKey) return foundKey;
            }
        }
        return null;
    };

    const handleAddPlan = (values: PlanType, subProcessKey: string | null) => {
        let subProcessKeyToUse = subProcessKey;
        const existingPlanIds = plans.map(plan => plan.planId);

        const newPlanId = generatePlanId(existingPlanIds);

        if (editPlan) {
            subProcessKeyToUse = findSubProcessKeyByPlanId(nodes, editPlan.planId);
        }

        const updatedPlan = editPlan
            ? {
                ...editPlan,
                ...values,
                planStatus: editPlan.planStatus === "add" ? "add" : "update"
            }
            : {
                ...values,
                planId: newPlanId,
                planStatus: "add"
            };

        if (subProcessKeyToUse) {
            setNodes(updatePlanInSubProcess(nodes, subProcessKeyToUse, updatedPlan));
        } else {
            setPlans((prevList) => {
                if (editPlan) {
                    return prevList.map(plan =>
                        plan.planId === editPlan.planId ? updatedPlan : plan
                    );
                } else {
                    const existingPlanIndex = prevList.findIndex(plan => plan.planId === updatedPlan.planId);
                    if (existingPlanIndex !== -1) {
                        const newList = [...prevList];
                        newList[existingPlanIndex] = updatedPlan;
                        return newList;
                    } else {
                        return [...prevList, updatedPlan];
                    }
                }
            });
        }

        setEditPlan(null);
        planForm.resetFields();
        setIsPlanModalOpen(false);
    };
    const handleEditPlan = (plan: PlanType) => {
        console.log(plan);

        setEditPlan(plan);
        planForm.setFieldsValue(plan);
        setIsPlanModalOpen(true);
    };

    const handleDeletePlan = (id: number) => {
        setPlans((prevList) =>
            prevList.filter(plan => !(plan.planId === id && plan.planStatus === "add"))
                .map(plan =>
                    plan.planId === id
                        ? { ...plan, planStatus: "delete" }
                        : plan
                )
        );
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
