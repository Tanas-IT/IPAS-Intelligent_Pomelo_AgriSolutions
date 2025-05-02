import { useState } from "react";
import { Form, TreeDataNode } from "antd";
import { generateAIPlanId, generatePlanId } from "@/utils";
import { AIPlanType } from "@/payloads/process/requests";

interface CustomTreeDataNode extends TreeDataNode {
    status?: string;
    order?: number;
    listPlan?: AIPlanType[];
    growthStageId?: number;
    masterTypeId?: number;
}

export const findAISubProcessKeyByPlanId = (nodes: CustomTreeDataNode[], planId: number): string | null => {
    for (const node of nodes) {
        if (node.listPlan?.some(plan => plan.planId === planId)) {
            return String(node.key);
        }
        if (node.children) {
            const foundKey = findAISubProcessKeyByPlanId(node.children, planId);
            if (foundKey) return foundKey;
        }
    }
    return null;
};

const useAIPlanManager = (nodes?: CustomTreeDataNode[], setNodes?: (newNodes: CustomTreeDataNode[]) => void) => {
    const [plans, setPlans] = useState<AIPlanType[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<AIPlanType | null>(null);
    const [planForm] = Form.useForm();

    const updatePlanInSubProcess = (nodes: CustomTreeDataNode[], subProcessKey: string, updatedPlan: AIPlanType): CustomTreeDataNode[] => {
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

    const handleAddPlan = (values: AIPlanType, subProcessKey: string | null) => {
        let subProcessKeyToUse = subProcessKey;
        const existingPlanIds = plans
            .map(plan => plan.planId)
            .filter((id): id is number => id !== undefined); // Lọc bỏ undefined

        const newPlanId = generateAIPlanId(existingPlanIds);

        if (editPlan && nodes && editPlan.planId !== undefined) {
            subProcessKeyToUse = findAISubProcessKeyByPlanId(nodes, editPlan.planId);
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

        if (subProcessKeyToUse && nodes && setNodes) {
            setNodes(updatePlanInSubProcess(nodes, subProcessKeyToUse, updatedPlan));
        } else {
            setPlans((prevList) => {
                if (editPlan && editPlan.planId !== undefined) {
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

    const handleEditPlan = (plan: AIPlanType) => {
        setEditPlan(plan);
        planForm.setFieldsValue(plan);
        setIsPlanModalOpen(true);
    };

    const handleDeletePlan = (planId: number) => {
        console.log("Deleting plan with ID:", planId);
        if (planId === undefined || isNaN(planId)) {
          console.error("Invalid planId, cannot delete plan");
          return;
        }
        setPlans((prevPlans) =>
          prevPlans
            .map((plan) =>
              plan.planId === planId ? { ...plan, planStatus: "delete" } : plan,
            )
            .filter((plan) => plan.planStatus !== "delete"),
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

export default useAIPlanManager;