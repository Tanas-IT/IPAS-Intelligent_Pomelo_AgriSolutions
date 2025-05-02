import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import style from "./ProcessDetails.module.scss";
import { Button, Divider, Flex, Form, Input, Tree, TreeDataNode, TreeProps } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton, InfoField, Loading, Section, Tooltip } from "@/components";
import { PATHS } from "@/routes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditableTreeNode from "./EditableTreeNode";
import ButtonActions from "./ButtonActions";
import AddPlanModal from "../ProcessList/AddPlanModal";
import {
  fetchGrowthStageOptions,
  formatDateW,
  generatePlanId,
  getFarmId,
  planTargetOptions2,
  RulesManager,
} from "@/utils";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { useAIPlanManager, useMasterTypeOptions, usePlanManager } from "@/hooks";
import SubProcessModal from "./SubProcessModal";
import { AICreateProcessRequest, AIGeneratedProcess, AIPlanType, AISubProcess } from "@/payloads/process/requests";
import { processService } from "@/services";
import AddAIPlanModal from "../ProcessList/AddAIPlanModal";
import AIPlanList from "../ProcessList/AIPlanList";
import AILoading from "./AILoading";

interface CustomTreeDataNode extends TreeDataNode {
  status?: string;
  order?: number;
  listPlan?: AIPlanType[];
  growthStageId?: number;
  masterTypeId?: number;
}

const mapSubProcessesToTree = (
    subProcesses: AISubProcess[],
    parentId?: number,
  ): CustomTreeDataNode[] => {
    let planIdCounter = -1;
    return subProcesses
      .filter((sp) => (sp.parentSubProcessId ?? undefined) === parentId)
      .map((sp) => {
        const plansWithIds = sp.listPlan?.map((plan) => ({
          ...plan,
          planId: plan.planId ?? planIdCounter--,
          planStatus: "add",
        })) || [];
        return {
          title: sp.subProcessName,
          key: sp.subProcessId.toString(),
          listPlan: plansWithIds,
          children: mapSubProcessesToTree(subProcesses, sp.subProcessId),
          status: "add",
          order: sp.order,
        };
      });
  };

function AIProcessDetails() {
  let tempIdCounter = -1;
  const navigate = useNavigate();
  const { state } = useLocation();
  const { processName, isSample } = state || {};
  const [treeData, setTreeData] = useState<CustomTreeDataNode[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [aiProcess, setAIProcess] = useState<AIGeneratedProcess | null>(null);
  const [deletedNodes, setDeletedNodes] = useState<CustomTreeDataNode[]>([]);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [selectedSubProcessId, setSelectedSubProcessId] = useState<number>();
  const [growthStageOptions, setGrowthStageOptions] = useState<any[]>([]);
  const [newTasks, setNewTasks] = useState<CustomTreeDataNode[]>([]);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentProcessName, setCurrentProcessName] = useState(processName || "");
  const farmId = Number(getFarmId());
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);

  const {
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
  } = useAIPlanManager(treeData, setTreeData);
  const [isSubProcessModalOpen, setIsSubProcessModalOpen] = useState(false);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<CustomTreeDataNode | null>(null);

  const fetchAIProcess = async () => {
    if (!processName || isSample === undefined) {
      toast.error("Missing process name or mode");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await processService.getAIRecommendedProcess(processName, isSample);
      console.log("AI process response:", response);
      
      const data = response.data;
      setAIProcess(data.processGenerate);
      form.setFieldsValue({
        processName: data.processGenerate.processName,
        masterTypeId: data.processGenerate.masterTypeId,
        planTarget: data.processGenerate.planTargetInProcess,
        isActive: data.processGenerate.isActive,
      });
      setTreeData(mapSubProcessesToTree(data.processGenerate.listSubProcess));
      let planIdCounter = -1;
      setPlans(
        data.processGenerate.listPlan?.map((plan) => ({
          ...plan,
          planId: plan.planId ?? planIdCounter--,
          planStatus: "add",
        })) || [],
      );
    } catch (error) {
      console.error("Failed to fetch AI process:", error);
      toast.error("Failed to fetch AI-generated process.");
    } finally {
      setIsLoading(false);
    }
  };
  console.log("Tree data:", treeData);
  
  useEffect(() => {
    const fetchData = async () => {
      setGrowthStageOptions(await fetchGrowthStageOptions(farmId));
    };
    fetchData();
    fetchAIProcess();
  }, []);

  const generateUniqueSubProcessId = (existingIds: number[]): number => {
    let newId = Math.min(...existingIds, -1) - 1;
    while (existingIds.includes(newId)) {
      newId--;
    }
    return newId;
  };

  const addTaskToTree = (
    nodes: CustomTreeDataNode[],
    newTask: CustomTreeDataNode,
    parentKey?: number,
  ): CustomTreeDataNode[] => {
    return nodes.map((node) => {
      if (parentKey && Number(node.key) === Number(parentKey)) {
        return {
          ...node,
          children: node.children ? [...node.children, newTask] : [newTask],
        };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: addTaskToTree(node.children, newTask, parentKey) };
      }
      return node;
    });
  };

  const handleAdd = (parentKey: string) => {
    const existingIds = treeData
      .flatMap((node) => [
        Number(node.key),
        ...(node.children?.map((child) => Number(child.key)) || []),
      ])
      .filter((id) => !isNaN(id));
    const newId = generateUniqueSubProcessId(existingIds);
    const newKey = newId.toString();
    const newNode: CustomTreeDataNode = {
      title: "New Task",
      key: newKey,
      children: [],
      status: "add",
    };
    setTreeData((prevTree) => {
      if (parentKey === "root") {
        return [...prevTree, newNode];
      } else {
        const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
          return nodes.map((node) => {
            if (node.key === parentKey) {
              const newOrder = node.children ? node.children.length + 1 : 1;
              return {
                ...node,
                children: [...(node.children || []), { ...newNode, order: newOrder }],
              };
            }
            if (node.children) {
              return { ...node, children: updateTree(node.children) };
            }
            return node;
          });
        };
        return updateTree(prevTree);
      }
    });
  };

  const handleSave = () => {
    if (editingKey !== null) {
      const updatedData = [...treeData];
      const node = findNodeByKey(updatedData, editingKey);
      if (node) {
        node.title = newTitle;
      }
      setTreeData(updatedData);
      setEditingKey(null);
      setNewTitle("");
    }
  };

  const handleDelete = (key: string) => {
    const deleteNode = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes
        .filter((node) => node.key !== key)
        .map((node) => ({
          ...node,
          children: node.children ? deleteNode(node.children) : undefined,
        }));
    };

    const deletedNode = findNodeByKey(treeData, key);
    if (deletedNode) {
      setDeletedNodes((prev) => [...prev, { ...deletedNode, status: "delete" }]);
    }

    const updatedTreeData = deleteNode(treeData);
    const reorderNodes = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes.map((node, index) => ({
        ...node,
        order: index + 1,
        children: node.children ? reorderNodes(node.children) : undefined,
      }));
    };
    const reorderedTreeData = reorderNodes(updatedTreeData);
    setTreeData(reorderedTreeData);
  };

  const handleCancel = () => {
    navigate(PATHS.PROCESS.PROCESS_LIST);
  };

  const handleSaveNode = () => {};

  const handleClickAddPlan = (subProcessKey: number) => {
    setSelectedSubProcessId(subProcessKey);
    setIsAddPlanModalOpen(true);
  };

  const updateTreeWithPlan = (
    nodes: CustomTreeDataNode[],
    subProcessKey: number,
    newPlan: AIPlanType,
  ): CustomTreeDataNode[] => {
    return nodes.map((node) => {
      if (Number(node.key) === Number(subProcessKey)) {
        return {
          ...node,
          listPlan: node.listPlan ? [...node.listPlan, newPlan] : [newPlan],
        };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateTreeWithPlan(node.children, subProcessKey, newPlan) };
      }
      return node;
    });
  };

  const handleAddPlanInSub = (subProcessKey: number, newPlan: AIPlanType) => {
    console.log("Adding plan to sub-process:", subProcessKey, newPlan);
    console.log("Tree data before update:", treeData);

    setTreeData((prevTree) => {
      let updatedTree = [...prevTree];
      let targetSubProcessKey = subProcessKey;

      // If subProcessKey is invalid, create a new sub-process
      if (isNaN(subProcessKey) || !prevTree.some((node) => Number(node.key) === subProcessKey)) {
        const existingIds = prevTree
          .flatMap((node) => [
            Number(node.key),
            ...(node.children?.map((child) => Number(child.key)) || []),
          ])
          .filter((id) => !isNaN(id));
        const newId = generateUniqueSubProcessId(existingIds);
        targetSubProcessKey = newId;
        const newSubProcess: CustomTreeDataNode = {
          title: "New Sub Process",
          key: newId.toString(),
          children: [],
          listPlan: [newPlan],
          status: "add",
          order: prevTree.length + 1,
        };
        updatedTree = [...prevTree, newSubProcess];
      } else {
        // Update existing sub-process with new plan
        const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
          return nodes.map((node) => {
            if (Number(node.key) === targetSubProcessKey) {
              return {
                ...node,
                listPlan: node.listPlan ? [...node.listPlan, newPlan] : [newPlan],
              };
            }
            if (node.children && node.children.length > 0) {
              return { ...node, children: updateTree(node.children) };
            }
            return node;
          });
        };
        updatedTree = updateTree(updatedTree);
      }

      console.log("Tree data after update:", updatedTree);
      return updatedTree;
    });
    setIsAddPlanModalOpen(false);
  };

  const convertTreeToList = (
    nodes: CustomTreeDataNode[],
    parentId: number | null = null,
  ): any[] => {
    const existingIds = nodes
      .flatMap((node) => [
        Number(node.key),
        ...(node.children?.map((child) => Number(child.key)) || []),
      ])
      .filter((id) => !isNaN(id));
    let tempIdCounter = Math.min(...existingIds, -1) - 1;

    return nodes.flatMap((node, index) => {
      const subProcessId = isNaN(Number(node.key)) ? tempIdCounter-- : Number(node.key);
      const isNewSubProcess = node.status === "add";
      const status = isNewSubProcess
        ? "add"
        : node.listPlan?.some((plan) => ["add", "update", "delete"].includes(plan.planStatus))
        ? "update"
        : node.status || "no_change";

      const subProcess = {
        subProcessId: subProcessId,
        subProcessName: node.title || "New Task",
        parentSubProcessId: parentId,
        isActive: true,
        order: node.order || index + 1,
        listPlan:
          node.listPlan?.map((plan) => ({
            planId: plan.planId,
            planName: plan.planName || "New Plan",
            planDetail: plan.planDetail || "",
            planNote: plan.planNote || "",
            planStatus: plan.planStatus || "add",
          })) || [],
      };

      return [subProcess, ...convertTreeToList(node.children || [], subProcessId)];
    });
  };

  const handleSaveProcess = async () => {
    const ListPlan = plans.map((plan) => ({
      planId: plan.planId,
      planName: plan.planName,
      planDetail: plan.planDetail,
      planNote: plan.planNote,
      planStatus: plan.planStatus || "add",
    }));

    const payload: AICreateProcessRequest = {
      farmId: farmId,
      processName: currentProcessName || aiProcess?.processName,
      isActive: form.getFieldValue(processFormFields.isActive),
      isSample: aiProcess?.isSample ?? isSample,
      masterTypeId: form.getFieldValue(processFormFields.masterTypeId),
      planTargetInProcess: form.getFieldValue(processFormFields.planTarget),
      listSubProcess: [
        ...convertTreeToList(treeData),
        ...convertDeletedNodesToList(deletedNodes),
      ].filter((sub) => sub.status !== "no_change"),
      listPlan: ListPlan,
    };
    console.log("Payload for saving process:", payload);
    

    try {
      const res = await processService.createProcessWithSub(payload);
      if (res.statusCode === 200) {
        toast.success(res.message);
        navigate(PATHS.PROCESS.PROCESS_LIST);
      } else {
        toast.warning(res.message);
      }
    } catch (error) {
      console.error("Error saving AI process:", error);
      toast.warning("Failed to save AI process.");
    }
  };

  const convertDeletedNodesToList = (nodes: CustomTreeDataNode[]): any[] => {
    return nodes.map((node) => ({
      subProcessId: Number(node.key),
      subProcessName: node.title || "New Task",
      parentSubProcessId: 0,
      isActive: false,
      order: node.order || 0,
      listPlan: [],
      status: "delete",
    }));
  };

  const findNodeByKey = (nodes: CustomTreeDataNode[], key: string): CustomTreeDataNode | null => {
    for (let node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const foundNode = findNodeByKey(node.children, key);
        if (foundNode) return foundNode;
      }
    }
    return null;
  };

  const updatePlanInSubProcess = (
    nodes: CustomTreeDataNode[],
    subProcessKey: string,
    updatedPlan: AIPlanType,
  ): CustomTreeDataNode[] => {
    return nodes.map((node) => {
      if (node.key === subProcessKey) {
        return {
          ...node,
          listPlan: node.listPlan?.map((plan) =>
            plan.planId === updatedPlan.planId ? updatedPlan : plan,
          ),
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

  const handleEditPlanInSub = useCallback((subProcessKey: string, plan: AIPlanType) => {
    setTreeData((prevTree) => updatePlanInSubProcess(prevTree, subProcessKey, plan));
  }, []);

  const handleDeletePlann = useCallback((planId: number, subProcessKey: string) => {
    console.log("Deleting plan:", planId, "from subProcessKey:", subProcessKey);
    if (planId === undefined || isNaN(planId)) {
      console.error("Invalid planId, cannot delete plan");
      return;
    }
    setTreeData((prevTree) => {
      const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
        return nodes.map((node) => {
          if (node.key === subProcessKey) {
            const updatedPlans = node.listPlan
              ? node.listPlan
                  .map((plan) =>
                    plan.planId === planId ? { ...plan, planStatus: "delete" } : plan,
                  )
                  .filter((plan) => plan.planStatus !== "delete")
              : [];
            return {
              ...node,
              status: node.status === "add" ? "add" : "update",
              listPlan: updatedPlans,
            };
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateTree(node.children),
            };
          }
          return node;
        });
      };
      const updatedTree = updateTree(prevTree);
      console.log("Tree data after delete:", updatedTree);
      return updatedTree;
    });
  }, []);

  const handleDeletePlanInChildren = (
    nodes: CustomTreeDataNode[],
    planId: number,
    subProcessKey: string,
  ): CustomTreeDataNode[] => {
    return nodes.map((node) => {
      if (node.key === subProcessKey) {
        return {
          ...node,
          status: "update",
          listPlan: node.listPlan?.map((plan) =>
            plan.planId === planId ? { ...plan, planStatus: "delete" } : plan,
          ),
        };
      }
      if (node.children) {
        return {
          ...node,
          children: handleDeletePlanInChildren(node.children, planId, subProcessKey),
        };
      }
      return node;
    });
  };

  const handleEditSubProcess = (node: CustomTreeDataNode) => {
    setEditingNode(node);
    setIsSubProcessModalOpen(true);
  };

  const handleUpdateSubProcess = (values: any) => {
    const updatedData = [...treeData];
    const node = findNodeByKey(updatedData, String(editingNode!.key));
    if (node) {
      node.title = values.processName;
      node.growthStageId = values.growthStageId;
      node.masterTypeId = Number(values.masterTypeId);
      if (node.status !== "add") {
        node.status = "update";
      }
    }
    setTreeData(updatedData);
    setEditingNode(null);
  };

  const loopNodes = (nodes: any[]): CustomTreeDataNode[] => {
    return nodes
      .filter((node) => node.status !== "delete")
      .map((node) => {
        const filteredPlans = node.listPlan?.filter(
          (plan: AIPlanType) => plan.planStatus !== "delete",
        );

        const planNodes = filteredPlans?.length
          ? [
              {
                title: (
                  <div className={style.planList}>
                    <strong className={style.planListTitle}>Plan List:</strong>
                    {filteredPlans.map((plan: AIPlanType) => (
                      <div key={plan.planId} className={style.planItem}>
                        <span className={style.planName}>{plan.planName}</span>
                        {isEditing && (
                          <Flex gap={10}>
                            <Icons.edit
                              color="blue"
                              size={18}
                              onClick={() => handleEditPlan(plan)}
                            />
                            <Icons.delete
                              color="red"
                              size={18}
                              onClick={() => handleDeletePlann(plan.planId, node.key.toString())}
                            />
                          </Flex>
                        )}
                      </div>
                    ))}
                  </div>
                ),
                key: `${node.key}-plans`,
                isLeaf: true,
              },
            ]
          : [];

        return {
          ...node,
          title: (
            <div
              onMouseEnter={() => setHoveredKey(node.key.toString())}
              onMouseLeave={() => setHoveredKey(null)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <EditableTreeNode
                isEditing={editingKey === node.key}
                title={editingKey === node.key ? newTitle : node.title}
                onChange={(e) => setNewTitle(e)}
                onBlur={handleSave}
              />
              {isEditing && hoveredKey === node.key && (
                <ButtonActions
                  editingKey={editingKey}
                  nodeKey={node.key}
                  onSave={handleSaveNode}
                  onCancel={() => {}}
                  onEdit={() => handleEditSubProcess(node)}
                  onDelete={() => handleDelete(node.key)}
                  onAdd={() => handleAdd(node.key)}
                  onAddPlan={
                    !aiProcess?.isSample ? () => handleClickAddPlan(Number(node.key)) : undefined
                  }
                />
              )}
            </div>
          ),
          key: node.key,
          children: [...(node.children ? loopNodes(node.children) : []), ...planNodes],
        };
      });
  };

  const onDrop: TreeProps["onDrop"] = (info) => {
    const dropKey = info.node.key.toString();
    const dragKey = info.dragNode.key.toString();
    const dropToGap = info.dropToGap;
    const data = [...treeData];

    let dragObj: CustomTreeDataNode | undefined;

    const loop = (
      nodes: CustomTreeDataNode[],
      key: string,
      callback: (node: CustomTreeDataNode, index: number, arr: CustomTreeDataNode[]) => void,
    ) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key === key) {
          return callback(nodes[i], i, nodes);
        }
        if (nodes[i].children) {
          loop(nodes[i].children!, key, callback);
        }
      }
    };

    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj!);
      });
    } else {
      loop(data, dropKey, (item, index, arr) => {
        arr.splice(index + (info.dropPosition > 0 ? 1 : 0), 0, dragObj!);
      });
    }

    const reorderNodes = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes.map((node, index) => ({
        ...node,
        order: index + 1,
        children: node.children ? reorderNodes(node.children) : undefined,
      }));
    };

    const updatedData = reorderNodes(data);
    setTreeData([...updatedData]);
  };

  const [form] = Form.useForm();

  const handleSaveSubProcess = (values: any) => {
    const existingIds = treeData
      .flatMap((node) => [
        Number(node.key),
        ...(node.children?.map((child) => Number(child.key)) || []),
      ])
      .filter((id) => !isNaN(id));
    const newId = generateUniqueSubProcessId(existingIds);
    const newKey = newId.toString();
    const newNode: CustomTreeDataNode = {
      title: values.processName,
      key: newKey,
      children: [],
      status: "add",
      growthStageId: values.growthStageId,
      masterTypeId: values.masterTypeId,
    };

    setTreeData((prevTree) => {
      if (selectedNodeKey === "root") {
        return [...prevTree, newNode];
      } else {
        const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
          return nodes.map((node) => {
            if (node.key === selectedNodeKey) {
              const newOrder = node.children ? node.children.length + 1 : 1;
              return {
                ...node,
                children: [...(node.children || []), { ...newNode, order: newOrder }],
              };
            }
            if (node.children) {
              return { ...node, children: updateTree(node.children) };
            }
            return node;
          });
        };
        return updateTree(prevTree);
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        backgroundColor: 'rgba(216, 240, 231, 0.5)',
        borderRadius: '12px',
        margin: '16px 0'
      }}>
        <AILoading/>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <Form form={form}>
        <div className={style.extraContent}>
          <Tooltip title="Back to List">
            <Icons.back
              className={style.backIcon}
              onClick={() => navigate(PATHS.PROCESS.PROCESS_LIST)}
            />
          </Tooltip>
        </div>
        <Divider className={style.divider} />
        <Flex className={style.contentSectionTitleLeft}>
          <Input
            value={currentProcessName}
            name={processFormFields.processName}
            className={style.editInput}
            onChange={(e) => setCurrentProcessName(e.target.value)}
          />
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
        </Flex>
        <label className={style.subTitle}>Code: AI-Generated</label>
        <div className={style.status}>
          <InfoField
            label=""
            name={processFormFields.isActive}
            isEditing={true}
            type="switch"
            value={aiProcess?.isActive}
          />
        </div>
        <Divider className={style.divider} />
        <Flex vertical className={style.infoProcess}>
          <Flex className={style.plotItemDetails}>
            <Flex className={style.plotItemDetail}>
              <Icons.calendar />
              <label>Create Date:</label>
            </Flex>
            {formatDateW(new Date().toISOString())}
          </Flex>
          <Flex gap={20} className={style.infoDetail}>
            <InfoField
              label="Process Type"
              name={processFormFields.masterTypeId}
              rules={RulesManager.getProcessTypeRules()}
              isEditing={true}
              options={processTypeOptions}
              type="select"
            />
            <InfoField
              label="Plan Target"
              name={processFormFields.planTarget}
              rules={RulesManager.getPlanTargetRules()}
              isEditing={true}
              options={planTargetOptions2}
              type="select"
            />
          </Flex>
        </Flex>
        <Divider className={style.divider} />
        {!aiProcess?.isSample && (
          <Section
            title="Plan List"
            subtitle="All plans of this process are displayed here."
            actionButton={
              <CustomButton
                label="Add Plan"
                icon={<Icons.plus />}
                handleOnClick={handleOpenModal}
              />
            }
          >
            {plans.length ? (
              <AIPlanList
                plans={plans}
                subProcessKey="root"
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
                isEditing={isEditing}
              />
            ) : (
              <div className={style.noDataContainer}>
                <img src={Images.empty} alt="No Data" className={style.noDataImage} />
                <p className={style.noDataText}>No plans available!.</p>
              </div>
            )}
          </Section>
        )}
        <Divider className={style.divider} />
        <Section
          title="Sub Process"
          subtitle="All sub-processes of this process are displayed here."
          actionButton={
            <CustomButton
              label="Add Sub Process"
              icon={<Icons.plus />}
              handleOnClick={() => handleAdd("root")}
            />
          }
        >
          {treeData.length === 0 ? (
            <div className={style.noDataContainer}>
              <img src={Images.empty} alt="No Data" className={style.noDataImage} />
              <p className={style.noDataText}>No sub-processes available!.</p>
            </div>
          ) : (
            <Tree
              style={{ fontSize: "18px" }}
              draggable
              blockNode
              onDrop={onDrop}
              treeData={loopNodes(treeData)}
              disabled={false}
            />
          )}
        </Section>
        <div className={style.buttonGroup}>
          <CustomButton label="Cancel" isCancel handleOnClick={handleCancel} />
          <CustomButton
            label="Save"
            isCancel={false}
            isModal={true}
            handleOnClick={() => handleSaveProcess()}
          />
        </div>
        <AddPlanModal
          isOpen={isPlanModalOpen}
          onClose={handleCloseModal}
          onSave={handleAddPlan}
          editPlan={editPlan}
          growthStageOptions={growthStageOptions}
          processTypeOptions={processTypeOptions}
        />
        {isAddPlanModalOpen && (
          <AddAIPlanModal
            isOpen={isAddPlanModalOpen}
            subProcessId={selectedSubProcessId}
            onClose={() => setIsAddPlanModalOpen(false)}
            onSave={(values) => {
              const newPlan = {
                planId: generatePlanId(),
                planName: values.planName,
                planDetail: values.planDetail,
                growthStageId: values.growthStageId,
                masterTypeId: values.masterTypeId,
                planNote: values.planNote,
                planStatus: "add",
              };
              handleAddPlanInSub(selectedSubProcessId!, newPlan);
              setIsAddPlanModalOpen(false);
            }}
            growthStageOptions={growthStageOptions}
          processTypeOptions={processTypeOptions}
          />
        )}
        <SubProcessModal
          isOpen={isSubProcessModalOpen}
          onClose={() => setIsSubProcessModalOpen(false)}
          onSave={editingNode ? handleUpdateSubProcess : handleSaveSubProcess}
          initialValues={
            editingNode
              ? {
                  processName: editingNode.title,
                  growthStageId: editingNode.growthStageId,
                  masterTypeId: editingNode.masterTypeId,
                }
              : undefined
          }
        />
        <ToastContainer />
      </Form>
    </div>
  );
}

export default AIProcessDetails;