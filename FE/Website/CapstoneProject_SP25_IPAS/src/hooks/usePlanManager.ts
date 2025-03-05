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

    // const updatePlanInSubProcess = (nodes: CustomTreeDataNode[], subProcessKey: string, updatedPlan: PlanType): CustomTreeDataNode[] => {
    //     return nodes.map(node => {
    //         if (node.key === subProcessKey) {
    //             return {
    //                 ...node,
    //                 listPlan: node.listPlan?.map(plan =>
    //                     plan.planId === updatedPlan.planId ? updatedPlan : plan
    //                 ) || [],
    //             };
    //         }
    //         if (node.children && node.children.length > 0) {
    //             return { ...node, children: updatePlanInSubProcess(node.children, subProcessKey, updatedPlan) };
    //         }
    //         return node;
    //     });
    // };

    const updatePlanInSubProcess = (
        nodes: CustomTreeDataNode[],
        subProcessKey: string,
        updatedPlan: PlanType
      ): CustomTreeDataNode[] => {
        console.log("gọi update");
        return nodes.map((node) => {
          if (node.key === subProcessKey) {
            return {
              ...node,
              listPlan: node.listPlan?.map((plan) =>
                plan.planId === updatedPlan.planId ? { ...plan, planStatus: "delete" } : plan
              ),
              status: "update", // Đánh dấu sub-process là "update"
            };
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updatePlanInSubProcess(node.children, subProcessKey, updatedPlan),
            };
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


    // const handleAddPlan = (values: PlanType, subProcessKey: string | null) => {
    //     console.log("gọi add");
        

    //     let subProcessKeyToUse = subProcessKey;

    //     if (editPlan) {
    //         subProcessKeyToUse = findSubProcessKeyByPlanId(nodes, editPlan.planId);
    //     }

    //     const updatedPlan = editPlan
    //         ? {
    //             ...editPlan,
    //             ...values,
    //             planStatus: editPlan.planStatus === "add" ? "add" : "update"
    //         }
    //         : {
    //             ...values,
    //             planId: generatePlanId(),
    //             planStatus: "add"
    //         };

    //     if (subProcessKeyToUse !== null && subProcessKeyToUse !== undefined && subProcessKeyToUse !== "") {
    //         setNodes(updatePlanInSubProcess(nodes, subProcessKeyToUse, updatedPlan));
    //     } else {
    //         setPlans(prevList => [...prevList, updatedPlan]);
    //     }


    //     setEditPlan(null);
    //     planForm.resetFields();
    //     setIsPlanModalOpen(false);
    // };

    // const handleEditPlan = (plan: PlanType) => {
    //     console.log(plan);

    //     setEditPlan(plan);
    //     planForm.setFieldsValue(plan);
    //     setIsPlanModalOpen(true);
    // };

    const handleAddPlan = (values: PlanType, subProcessKey: string | null) => {
        console.log("Gọi add plan");
      
        const newPlan = {
          ...values,
          planId: generatePlanId(), // Tạo ID mới cho plan
          planStatus: "add", // Đánh dấu plan là mới thêm
        };
      
        if (subProcessKey) {
          // Thêm plan vào sub-process
          const updatedNodes = nodes.map((node) => {
            if (node.key === subProcessKey) {
              return {
                ...node,
                listPlan: [...(node.listPlan || []), newPlan], // Thêm plan mới vào listPlan
                status: "update", // Đánh dấu sub-process là "update"
              };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updatePlanInSubProcess(node.children, subProcessKey, newPlan),
              };
            }
            return node;
          });
      
          setNodes(updatedNodes); // Cập nhật treeData
        } else {
          // Thêm plan vào process tổng
          setPlans((prevList) => [...prevList, newPlan]);
        }
      
        planForm.resetFields(); // Reset form
        setIsPlanModalOpen(false); // Đóng modal
      };
      
      const handleEditPlan = (values: PlanType, subProcessKey: string | null) => {
        console.log("Gọi edit plan");
      
        if (!editPlan) return; // Nếu không có plan đang chỉnh sửa, thoát hàm
      
        const updatedPlan = {
          ...editPlan,
          ...values,
          planStatus: editPlan.planStatus === "add" ? "add" : "update", // Giữ nguyên trạng thái nếu là plan mới, ngược lại đánh dấu là "update"
        };
      
        if (subProcessKey) {
          // Cập nhật plan trong sub-process
          const updatedNodes = nodes.map((node) => {
            if (node.key === subProcessKey) {
              return {
                ...node,
                listPlan: node.listPlan?.map((plan) =>
                  plan.planId === updatedPlan.planId ? updatedPlan : plan
                ),
                status: "update", // Đánh dấu sub-process là "update"
              };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updatePlanInSubProcess(node.children, subProcessKey, updatedPlan),
              };
            }
            return node;
          });
      
          setNodes(updatedNodes); // Cập nhật treeData
        } else {
          // Cập nhật plan trong process tổng
          setPlans((prevList) =>
            prevList.map((plan) => (plan.planId === updatedPlan.planId ? updatedPlan : plan))
          );
        }
      
        setEditPlan(null); // Reset plan đang chỉnh sửa
        planForm.resetFields(); // Reset form
        setIsPlanModalOpen(false); // Đóng modal
      };

    // const handleDeletePlan = (id: number) => {
    //     setPlans(plans.filter(plan => plan.planId !== id));
    // };

    const handleEditPlanClick = (plan: PlanType) => {
        console.log("Chỉnh sửa plan:", plan);
      
        setEditPlan(plan); // Set plan đang chỉnh sửa
        planForm.setFieldsValue(plan); // Điền giá trị vào form
        setIsPlanModalOpen(true); // Mở modal
      };

    const handleDeletePlan = (id: number) => {
        // Tìm sub-process chứa plan cần xóa
        const subProcessKey = findSubProcessKeyByPlanId(nodes, id);

        if (subProcessKey) {
            // Cập nhật treeData: xóa plan và đánh dấu sub-process là "update"
            const updatedNodes = nodes.map((node) => {
                if (node.key === subProcessKey) {
                    return {
                        ...node,
                        listPlan: node.listPlan?.map((plan) =>
                            plan.planId === id ? { ...plan, planStatus: "delete" } : plan
                        ),
                        status: "update", // Đánh dấu sub-process là "update"
                    };
                }
                if (node.children && node.children.length > 0) {
                    return {
                        ...node,
                        children: updatePlanInSubProcess(node.children, subProcessKey, {
                            planId: id,
                            planStatus: "delete",
                            planDetail: "",
                            planName: "",
                            planNote: "",
                            growthStageId: 0,
                            masterTypeId: 0,
                        }),
                    };
                }
                return node;
            });

            setNodes(updatedNodes); // Cập nhật treeData
        }
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
        setPlans,
        handleEditPlanClick
    };
};

export default usePlanManager;
