import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./ProcessDetails.module.scss";
import { Button, Divider, Flex, Form, Input, Tag, Tree, TreeDataNode, TreeProps } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton, EditActions, InfoField, Loading, Section, Tooltip } from "@/components";
import { PATHS } from "@/routes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { processService } from "@/services";
import EditableTreeNode from "./EditableTreeNode";
import ButtonActions from "./ButtonActions";
import { GetProcessDetail, PlanType } from "@/payloads/process";
import AddPlanModal from "../ProcessList/AddPlanModal";
import {
  fetchGrowthStageOptions,
  fetchTypeOptionsByName,
  formatDateAndTime,
  formatDateW,
  generatePlanId,
  getFarmId,
  planTargetOptions2,
  RulesManager,
} from "@/utils";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { useHasChanges, useMasterTypeOptions, usePlanManager } from "@/hooks";
import PlanList from "../ProcessList/PlanList";
import { ListPlan, UpdateProcessRequest } from "@/payloads/process/requests";
import SubProcessModal from "./SubProcessModal";

interface SubProcess {
  subProcessId: number;
  subProcessName: string;
  parentSubProcessId?: number;
  listSubProcessData?: SubProcess[];
  // listPlan?: PlanType[];
  listPlanIsSampleTrue: PlanType[];
}

type OptionType<T = string | number> = {
  value: T;
  label: string;
};

interface CustomTreeDataNode extends TreeDataNode {
  status?: string;
  order?: number;
  listPlan?: PlanType[];
  growthStageId?: number;
  masterTypeId?: number;
}

const mapSubProcessesToTree = (
  subProcesses: SubProcess[],
  parentId?: number,
): CustomTreeDataNode[] => {
  return subProcesses
    .filter((sp) => sp.parentSubProcessId === parentId)
    .map((sp) => ({
      title: sp.subProcessName,
      key: sp.subProcessId.toString(),
      listPlan: sp.listPlanIsSampleTrue || [],
      children: mapSubProcessesToTree(subProcesses, sp.subProcessId),
    }));
};

function ProcessDetails() {
  let tempIdCounter = -1;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [treeData, setTreeData] = useState<CustomTreeDataNode[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [processDetail, setProcessDetail] = useState<GetProcessDetail>();
  const [deletedNodes, setDeletedNodes] = useState<CustomTreeDataNode[]>([]);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [selectedSubProcessId, setSelectedSubProcessId] = useState<number>();
  const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number>[]>([]);
  const [newTasks, setNewTasks] = useState<CustomTreeDataNode[]>([]); // lưu task mới tạo
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processName, setProcessName] = useState(processDetail?.processName || "");
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
  } = usePlanManager(treeData, setTreeData);
  const [isSubProcessModalOpen, setIsSubProcessModalOpen] = useState(false);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<CustomTreeDataNode | null>(null);
  const [originalData, setOriginalData] = useState({
    treeData: [] as CustomTreeDataNode[],
    plans: [] as PlanType[],
  });

  if (!id) {
    console.error("Missing id");
    return;
  }

  const fetchProcessDetails = async () => {
    try {
      setIsLoading(true);
      const data = await processService.getProcessDetail(id);
      setProcessDetail(data);
      form.setFieldsValue({
        ...data,
        masterTypeId: data.processMasterTypeModel ? data.processMasterTypeModel.masterTypeId : "",
        growthStageId: data.processGrowthStageModel
          ? data.processGrowthStageModel.growthStageId
          : "",
        planTarget: data.planTargetInProcess,
        isActive: data.isActive,
      });
      if (data.subProcesses && Array.isArray(data.subProcesses)) {
        setTreeData(mapSubProcessesToTree(data.subProcesses));
      } else {
        setTreeData([]);
      }

      if (data.listPlanIsSampleTrue && Array.isArray(data.listPlanIsSampleTrue)) {
        setPlans(data.listPlanIsSampleTrue);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error("Failed to fetch process details", error);
      toast.warning("Failed to fetch process details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setGrowthStageOptions(await fetchGrowthStageOptions(farmId));
      // setProcessTypeOptions(await fetchTypeOptionsByName("Process"));
    };
    fetchData();

    fetchProcessDetails();
  }, [id]);

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
    const newKey = `${parentKey}-${Date.now()}`;
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

  const handleCancel = () => { };

  const handleCancelClick = () => {
    setPlans([...originalData.plans]);
    setTreeData([...originalData.treeData]);
    setIsEditing(false);
  };
  const handleSaveNode = () => { };

  const handleClickAddPlan = (subProcessKey: number) => {
    setSelectedSubProcessId(subProcessKey);
    setIsAddPlanModalOpen(true);
  };

  const updateTreeWithPlan = (
    nodes: CustomTreeDataNode[],
    subProcessKey: number,
    newPlan: PlanType,
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

  const handleAddPlanInSub = (subProcessKey: number, newPlan: PlanType) => {
    const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes.map((node) => {
        if (node.key === subProcessKey) {
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

    setTreeData((prevTree) => {
      let updatedTree = [...prevTree];
      const taskIndex = newTasks.findIndex((task) => Number(task.key) === Number(subProcessKey));
      if (taskIndex !== -1) {
        const updatedTasks = [...newTasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          listPlan: [...(updatedTasks[taskIndex].listPlan || []), newPlan],
        };
        setNewTasks(updatedTasks);
      } else {
        updatedTree = updateTree(updatedTree);
      }

      return updatedTree;
    });
  };

  const convertTreeToList = (
    nodes: CustomTreeDataNode[],
    parentId: number | null = null,
  ): any[] => {
    console.log("nodes", nodes);

    return nodes.flatMap((node, index) => {
      const subProcessId = isNaN(Number(node.key)) ? tempIdCounter-- : Number(node.key);
      const isNewSubProcess = node.status === "add";
      const status = isNewSubProcess
        ? "add"
        : node.listPlan?.some((plan) => ["add", "update", "delete"].includes(plan.planStatus))
          ? "update"
          : node.status || "no_change";

      const hasChangedPlan = node.listPlan?.some((plan) =>
        ["add", "update", "delete"].includes(plan.planStatus),
      );
      console.log("hasUpdatedPlan", hasChangedPlan);

      const subProcess = {
        SubProcessId: subProcessId,
        SubProcessName: node.title || "New Task",
        ParentSubProcessId: parentId,
        IsDefault: true,
        IsActive: true,
        MasterTypeId: Number(node.masterTypeId) || null,
        GrowthStageId: node.growthStageId || null,
        // Status: hasChangedPlan ? "update" : node.status || "no_change",
        Status: status,
        Order: node.order || index + 1,
        ListPlan:
          node.listPlan?.map((plan) => ({
            PlanId: plan.planId || 0,
            PlanName: plan.planName || "New Plan",
            PlanDetail: plan.planDetail || "",
            PlanNote: plan.planNote || "",
            GrowthStageId: plan.growthStageId || null,
            MasterTypeId: Number(plan.masterTypeId) || null,
            PlanStatus: plan.planStatus || "no_change",
          })) || null,
      };

      return [subProcess, ...convertTreeToList(node.children || [], subProcessId)];
    });
  };

  const handleSaveProcess = async () => {
    console.log("Plans before mapping:", plans);

    const ListPlan: ListPlan[] = plans.map((plan) => ({
      PlanId: plan.planId || 0,
      PlanName: plan.planName,
      PlanDetail: plan.planDetail,
      PlanNote: plan.planNote,
      GrowthStageId: plan.growthStageId,
      MasterTypeId: Number(plan.masterTypeId),
      PlanStatus: plan.planStatus || "no_change",
    }));

    let ListUpdateSubProcess = [
      ...convertTreeToList(treeData),
      ...convertDeletedNodesToList(deletedNodes),
    ]
      .filter((sub) => sub.Status !== "no_change") // Loại bỏ các node không có thay đổi
      .filter((sub) => !(sub.Status === "delete" && !sub.SubProcessId));

    const payload: UpdateProcessRequest = {
      ProcessId: Number(id) || 0,
      ProcessName: processName || processDetail?.processName,
      IsActive: form.getFieldValue(processFormFields.isActive),
      IsDefault: processDetail?.isDefault ?? false,
      IsDeleted: processDetail?.isDeleted ?? false,
      MasterTypeId: form.getFieldValue(processFormFields.masterTypeId),
      GrowthStageID: form.getFieldValue(processFormFields.growthStageId),
      ListUpdateSubProcess: ListUpdateSubProcess,
      ListPlan: ListPlan,
    };

    console.log("Saving Payload without stringify:", payload);

    try {
      const res = await processService.updateFProcess(payload);
      if (res.statusCode === 200) {
        toast.success(res.message);
        setIsEditing(false);
        await fetchProcessDetails();
      } else {
        toast.warning(res.message);
      }
      console.log("res update", res);
    } catch (error) {
      console.error("Error saving process:", error);
      toast.warning("Failed to save process.");
    }
  };
  const convertDeletedNodesToList = (nodes: CustomTreeDataNode[]): any[] => {
    return nodes.map((node) => ({
      SubProcessId: Number(node.key),
      SubProcessName: node.title || "New Task",
      ParentSubProcessId: 0,
      IsDefault: false,
      IsActive: false,
      MasterTypeId: 0,
      Status: "delete",
      Order: node.order || 0,
      ListPlan: [],
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
    updatedPlan: PlanType,
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

  const handleEditPlanInSub = useCallback((subProcessKey: string, plan: PlanType) => {
    setTreeData((prevTree) => updatePlanInSubProcess(prevTree, subProcessKey, plan));
  }, []);

  const handleDeletePlann = useCallback((planId: number, subProcessKey: string) => {
    setTreeData((prevTree) => {
      return prevTree.map((node) => {
        if (node.key === subProcessKey) {
          return {
            ...node,
            status: "update", // Cập nhật node cha
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
    console.log("editingNode", editingNode);
    console.log("values in handleUpdateSubProcess", values);

    const node = findNodeByKey(updatedData, String(editingNode!.key));
    if (node) {
      node.title = values.processName;
      node.growthStageId = values.growthStageId;
      node.masterTypeId = Number(values.masterTypeId);
      console.log("node when update sub", node);

      if (node.status !== "add") {
        node.status = "update";
      } else {
        console.log("ảo z");
      }
    }
    setTreeData(updatedData);
    setEditingNode(null);
  };

  const loopNodes = (nodes: any[]): CustomTreeDataNode[] => {
    return nodes
      .filter((node) => node.status !== "delete")
      .map((node) => {
        console.log("sắp xong r", node);

        const filteredPlans = node.listPlan?.filter(
          (plan: PlanType) => plan.planStatus !== "delete",
        );

        const planNodes = filteredPlans?.length
          ? [
            {
              title: (
                <div className={style.planList}>
                  <strong className={style.planListTitle}>Plan List:</strong>
                  {filteredPlans.map((plan: PlanType) => (
                    <div key={plan.planId} className={style.planItem}>
                      <span className={style.planName}>{plan.planName}</span>
                      {isEditing && (
                        <Flex gap={10}>
                          <Icons.edit color="blue" size={18} onClick={() => handleEditPlan(plan)} />
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
                  onCancel={handleCancel}
                  onEdit={() => handleEditSubProcess(node)}
                  onDelete={() => handleDelete(node.key)}
                  onAdd={() => handleAdd(node.key)}
                  onAddPlan={
                    !processDetail?.isSample ? () => handleClickAddPlan(node.key) : undefined
                  }
                />
              )}
            </div>
          ),
          key: node.key,
          children: [
            ...(node.children ? loopNodes(node.children) : []), // Đệ quy để xử lý children
            ...planNodes, // Thêm các node plan
          ],
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

    // xoa node cu
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      // tha vao 1 node khac
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj!);
      });
    } else {
      // tha cung cap
      loop(data, dropKey, (item, index, arr) => {
        arr.splice(index + (info.dropPosition > 0 ? 1 : 0), 0, dragObj!);
      });
    }

    const reorderNodes = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes.map((node, index) => ({
        ...node,
        order: index + 1, // Cập nhật thứ tự
        children: node.children ? reorderNodes(node.children) : undefined,
      }));
    };

    const updatedData = reorderNodes(data);

    setTreeData([...updatedData]);
  };

  const [form] = Form.useForm();

  const handleSaveSubProcess = (values: any) => {
    const newKey = `${selectedNodeKey}-${Date.now()}`;
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

  const handleEditClick = () => {
    setIsEditing(true);
    setOriginalData({
      treeData: [...treeData],
      plans: [...plans],
    });
  };
  // console.log("tree data", treeData);
  console.log("tplansssss", plans);
  if (isLoading)
    return (
      <Flex justify="center" align="center" style={{ width: "100%" }}>
        <Loading />
      </Flex>
    );

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
          {isEditing ? (
            <Input
              defaultValue={processDetail?.processName}
              name={processFormFields.processName}
              className={style.editInput}
              onChange={(e) => setProcessName(e.target.value)}
            />
          ) : (
            <p className={style.title}>{processDetail?.processName}</p>
          )}
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>

          {isEditing ? (
            <></>
          ) : (
            <div className={style.addButton}>
              <Tooltip title="Edit">
                <Icons.edit size={20} onClick={handleEditClick} />
              </Tooltip>
            </div>
          )}
        </Flex>
        <label className={style.subTitle}>Code: {processDetail?.processCode}</label>
        <div className={style.status}>
          <InfoField
            label=""
            name={processFormFields.isActive}
            isEditing={isEditing}
            type="switch"
            value={processDetail?.isActive}
          />
        </div>
        <Divider className={style.divider} />
        <Flex vertical className={style.infoProcess}>
          <Flex className={style.plotItemDetails}>
            <Flex className={style.plotItemDetail}>
              <Icons.calendar />
              <label>Create Date:</label>
            </Flex>
            {formatDateW(processDetail?.createDate ?? "2")}
          </Flex>
          <Flex gap={20} className={style.infoDetail}>
            <InfoField
              label="Process Type"
              name={processFormFields.masterTypeId}
              rules={RulesManager.getProcessTypeRules()}
              isEditing={isEditing}
              options={processTypeOptions}
              type="select"
            />
            <InfoField
              label="Plan Target"
              name={processFormFields.planTarget}
              rules={RulesManager.getPlanTargetRules()}
              isEditing={isEditing}
              options={planTargetOptions2}
              type="select"
            />
          </Flex>
        </Flex>
        <Divider className={style.divider} />
        {!processDetail?.isSample && (
          <Section
            title="Plan List"
            subtitle="All plans of this process is displayed here."
            actionButton={
              isEditing ? (
                <CustomButton
                  label="Add Plan"
                  icon={<Icons.plus />}
                  handleOnClick={handleOpenModal}
                />
              ) : null
            }
          >
            {plans.length ? (
              <PlanList
                plans={plans}
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
          subtitle="All sub-processes of this process is displayed here."
          actionButton={
            isEditing ? (
              <CustomButton
                label="Add Sub Process"
                icon={<Icons.plus />}
                handleOnClick={() => handleAdd("root")}
              />
            ) : null
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
              disabled={!isEditing}
            />
          )}
        </Section>
        {isEditing ? (
          <div className={style.buttonGroup}>
            <CustomButton label="Cancel" isCancel handleOnClick={handleCancelClick} />
            <CustomButton
              label="Save"
              isCancel={false}
              isModal={true}
              handleOnClick={() => handleSaveProcess()}
            />
          </div>
        ) : (
          <></>
        )}
        <AddPlanModal
          isOpen={isPlanModalOpen}
          onClose={handleCloseModal}
          onSave={handleAddPlan}
          editPlan={editPlan}
          growthStageOptions={growthStageOptions}
          processTypeOptions={processTypeOptions}
        />
        {isAddPlanModalOpen && (
          <AddPlanModal
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

export default ProcessDetails;
