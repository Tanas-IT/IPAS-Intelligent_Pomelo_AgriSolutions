import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./ProcessDetails.module.scss";
import { Button, Divider, Flex, Form, Tag, Tree, TreeDataNode, TreeProps } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton, EditActions, InfoField, Section, Tooltip } from "@/components";
import { PATHS } from "@/routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { processService } from "@/services";
import EditableTreeNode from "./EditableTreeNode";
import ButtonActions from "./ButtonActions";
import { GetProcessDetail, PlanType } from "@/payloads/process";
import AddPlanModal from "../ProcessList/AddPlanModal";
import { fetchGrowthStageOptions, fetchTypeOptionsByName, formatDateAndTime, getFarmId, RulesManager } from "@/utils";
import { MASTER_TYPE, processFormFields } from "@/constants";
import { useMasterTypeOptions, usePlanManager } from "@/hooks";
import PlanList from "../ProcessList/PlanList";
import { ListPlan, UpdateProcessRequest } from "@/payloads/process/requests";
import SubProcessModal from "./SubProcessModal";

interface SubProcess {
  subProcessId: number;
  subProcessName: string;
  parentSubProcessId?: number;
  listSubProcessData?: SubProcess[];
  listPlan?: PlanType[];
}

type OptionType<T = string | number> = {
  value: T;
  label: string
};

interface CustomTreeDataNode extends TreeDataNode {
  status?: string;
  order?: number;
  listPlan?: PlanType[];
  growthStageId?: number;
  masterTypeId?: number;
}

const mapSubProcessesToTree = (subProcesses: SubProcess[], parentId?: number): CustomTreeDataNode[] => {
  return subProcesses
    .filter(sp => sp.parentSubProcessId === parentId)
    .map(sp => ({
      title: sp.subProcessName,
      key: sp.subProcessId.toString(),
      listPlan: sp.listPlan || [],
      children: mapSubProcessesToTree(subProcesses, sp.subProcessId),
    }));
};

function ProcessDetails() {
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
  const farmId = Number(getFarmId());
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);
  const {
    plans, planForm, isPlanModalOpen, editPlan,
    handleAddPlan, handleEditPlan, handleDeletePlan,
    handleCloseModal, handleOpenModal, setPlans
  } = usePlanManager(treeData, setTreeData);
  const [isSubProcessModalOpen, setIsSubProcessModalOpen] = useState(false);
const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
const [editingNode, setEditingNode] = useState<CustomTreeDataNode | null>(null);


  useEffect(() => {
    if (!id) {
      console.error("Missing id");
      return;
    }

    const fetchProcessDetails = async () => {
      try {
        const data = await processService.getProcessDetail(id);
        console.log(data);

        setProcessDetail(data);

        form.setFieldsValue({
          ...data,
          masterTypeId: String(data.processMasterTypeModel.masterTypeId),
          growthStageId: data.processGrowthStageModel.growthStageId
        });

        setTreeData(mapSubProcessesToTree(data.subProcesses));
        if (data.listPlan) {
          setPlans(data.listPlan);
        }
      } catch (error) {
        console.error("Failed to fetch process details", error);
      }
    };
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
    parentKey?: number
  ): CustomTreeDataNode[] => {
    return nodes.map(node => {
      // Nếu có parentKey, thêm task mới vào `children` của node có key tương ứng
      if (parentKey && Number(node.key) === Number(parentKey)) {
        return {
          ...node,
          children: node.children ? [...node.children, newTask] : [newTask]
        };
      }

      // Nếu node có children, tiếp tục tìm kiếm để thêm task vào đúng vị trí
      if (node.children && node.children.length > 0) {
        return { ...node, children: addTaskToTree(node.children, newTask, parentKey) };
      }

      return node;
    });
  };


  const handleAddTask = (newTask: CustomTreeDataNode, parentKey?: number) => {
    setNewTasks(prev => [...prev, newTask]); // Lưu task mới vào danh sách tạm

    setTreeData(prevTree => {
      return addTaskToTree(prevTree, newTask, parentKey);
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
    setTreeData(prevTree => {
      if (parentKey === "root") {
        return [...prevTree, newNode];
      } else {
        const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
          return nodes.map(node => {
            if (node.key === parentKey) {
              const newOrder = node.children ? node.children.length + 1 : 1;
              return {
                ...node,
                children: [...(node.children || []), { ...newNode, order: newOrder }]
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


  const handleEdit = (key: string) => {
    setEditingKey(key);
    const node = findNodeByKey(treeData, key);

    if (node && typeof node.title === "string") {
      setNewTitle(node.title);

      if (node.status !== "update") {
        node.status = "update";
        setTreeData([...treeData]);
      }
    }
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
      return nodes.filter(node => node.key !== key).map(node => ({
        ...node,
        children: node.children ? deleteNode(node.children) : undefined,
      }));
    };

    const deletedNode = findNodeByKey(treeData, key);
    if (deletedNode) {
      setDeletedNodes(prev => [...prev, { ...deletedNode, status: "delete" }]);
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

  }

  const handleSaveNode = () => {

  }

  const handleClickAddPlan = (subProcessKey: number) => {
    setSelectedSubProcessId(subProcessKey);
    setIsAddPlanModalOpen(true);
  };

  const updateTreeWithPlan = (
    nodes: CustomTreeDataNode[],
    subProcessKey: number,
    newPlan: PlanType
  ): CustomTreeDataNode[] => {
    return nodes.map(node => {
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
      return nodes.map(node => {
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

    setTreeData(prevTree => {
      let updatedTree = [...prevTree];

      // Kiểm tra nếu task chưa có trong treeData
      const taskIndex = newTasks.findIndex(task => Number(task.key) === Number(subProcessKey));

      if (taskIndex !== -1) {
        // Nếu task mới có trong newTasks, thêm plan vào đó
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

  let tempIdCounter = -1;

  const convertTreeToList = (nodes: CustomTreeDataNode[], parentId: number | null = null): any[] => {
    return nodes.flatMap((node, index) => {
      const subProcessId = isNaN(Number(node.key)) ? tempIdCounter-- : Number(node.key);

      const subProcess = {
        SubProcessId: subProcessId,
        SubProcessName: node.title || "New Task",
        ParentSubProcessId: parentId,
        IsDefault: true,
        IsActive: true,
        MasterTypeId: Number(node.masterTypeId),
        GrowthStageId: node.growthStageId,
        Status: node.status || "no_change",
        Order: node.order || index + 1,
        ListPlan: node.listPlan?.map((plan) => ({
          PlanId: plan.planId || 0,
          PlanName: plan.planName || "New Plan",
          PlanDetail: plan.planDetail || "",
          PlanNote: plan.planNote || "",
          GrowthStageId: plan.growthStageId || 0,
          MasterTypeId: Number(plan.masterTypeId) || 0,
        })) || null,
      };

      return [subProcess, ...convertTreeToList(node.children || [], subProcessId)];
    });
  };

  const handleSaveProcess = async () => {
    const ListPlan: ListPlan[] = plans.map(plan => ({
      PlanId: plan.planId || 0,
      PlanName: plan.planName,
      PlanDetail: plan.planDetail,
      PlanNote: plan.planNote,
      GrowthStageId: plan.growthStageId,
      MasterTypeId: Number(plan.masterTypeId)
    }));
    const payload: UpdateProcessRequest = {
      ProcessId: Number(id) || 0,
      ProcessName: processDetail?.processName || "New Process",
      IsActive: processDetail?.isActive ?? true,
      IsDefault: processDetail?.isDefault ?? false,
      IsDeleted: processDetail?.isDeleted ?? false,
      MasterTypeId: form.getFieldValue(processFormFields.masterTypeId),
      GrowthStageID: form.getFieldValue(processFormFields.growthStageId),
      ListUpdateSubProcess: [
        ...convertTreeToList(treeData),
        ...convertDeletedNodesToList(deletedNodes),
      ],
      ListPlan: ListPlan
    };

    // console.log("Saving Payload:", JSON.stringify(payload, null, 2));
    console.log("Saving Payload without stringyfy:", payload);
    const res = await processService.updateFProcess(payload);
    console.log("res update", res);

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

  const updatePlanInSubProcess = (nodes: CustomTreeDataNode[], subProcessKey: string, updatedPlan: PlanType): CustomTreeDataNode[] => {
    return nodes.map(node => {
      if (node.key === subProcessKey) {
        return {
          ...node,
          listPlan: node.listPlan?.map(plan => plan.planId === updatedPlan.planId ? updatedPlan : plan),
        };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updatePlanInSubProcess(node.children, subProcessKey, updatedPlan) };
      }
      return node;
    });
  };

  const handleEditPlanInSub = useCallback((subProcessKey: string, plan: PlanType) => {
    setTreeData(prevTree => updatePlanInSubProcess(prevTree, subProcessKey, plan));
  }, []);

  const handleDeletePlanInSub = useCallback((planId: number) => {
    console.log("delete ID:", planId);
  }, []);

  const handleEditSubProcess = (node: CustomTreeDataNode) => {
    setEditingNode(node);
    setIsSubProcessModalOpen(true);
  };
  
  const handleUpdateSubProcess = (values: any) => {
    const updatedData = [...treeData];
    console.log("editingNode", editingNode);
    
    const node = findNodeByKey(updatedData, String(editingNode!.key));
    if (node) {
      node.title = values.processName;
      node.growthStageId = values.growthStageId;
      node.masterTypeId = values.masterTypeId;
    }
    setTreeData(updatedData);
    setEditingNode(null);
  };

  const loopNodes = (nodes: any[]): CustomTreeDataNode[] => {
    return nodes.map((node) => {
      // có plans, tạo một node chứa plan list
      const planNodes = node.listPlan?.length
        ? [{
          title: (
            <div className={style.planList} >
              <strong className={style.planListTitle}>Plan List:</strong>
              {node.listPlan.map((plan: PlanType) => (
                <div key={plan.planId} className={style.planItem}>
                  <span className={style.planName}>{plan.planName}</span>
                  <Flex gap={10}>
                    <Icons.edit color="blue" size={18} onClick={() => handleEditPlan(plan)} />
                    <Icons.delete color="red" size={18} onClick={() => handleDeletePlanInSub(plan.planId)} />
                  </Flex>
                </div>
              ))}
            </div>
          ),
          key: `${node.key}-plans`,
          isLeaf: true,
        }]
        : [];

      return {
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

            {hoveredKey === node.key && (
              <ButtonActions
                editingKey={editingKey}
                nodeKey={node.key}
                onSave={handleSaveNode}
                onCancel={handleCancel}
                // onEdit={() => handleEdit(node.key)}
                onEdit={() => handleEditSubProcess(node)}
                onDelete={() => handleDelete(node.key)}
                onAdd={() => handleAdd(node.key)}
                onAddPlan={() => handleClickAddPlan(node.key)}
              />
            )}
          </div>
        ),
        key: node.key,
        children: [...(node.children ? loopNodes(node.children) : []), ...planNodes], // Kết hợp cả sub-process và plan list
      };
    });
  };


  const onDrop: TreeProps["onDrop"] = (info) => {
    const dropKey = info.node.key.toString();
    const dragKey = info.dragNode.key.toString();
    const dropToGap = info.dropToGap;
    const data = [...treeData];

    let dragObj: CustomTreeDataNode | undefined;

    const loop = (nodes: CustomTreeDataNode[], key: string, callback: (node: CustomTreeDataNode, index: number, arr: CustomTreeDataNode[]) => void) => {
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
        order: index + 1,  // Cập nhật thứ tự
        children: node.children ? reorderNodes(node.children) : undefined,
      }));
    };

    const updatedData = reorderNodes(data);

    setTreeData([...updatedData]);
  };

  const [form] = Form.useForm();

  const handleAddSubProcess = (parentKey: string) => {
    setSelectedNodeKey(parentKey);
    setIsSubProcessModalOpen(true);
  };
  
  const handleSaveSubProcess = (values: any) => {
    const newKey = `${selectedNodeKey}-${Date.now()}`;
    const newNode: CustomTreeDataNode = {
      title: values.processName,
      key: newKey,
      children: [],
      status: "add",
      growthStageId: values.growthStageId,
      masterTypeId: values.masterTypeId,
      // Thêm các field khác từ values vào đây
    };
  
    setTreeData(prevTree => {
      if (selectedNodeKey === "root") {
        return [...prevTree, newNode];
      } else {
        const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
          return nodes.map(node => {
            if (node.key === selectedNodeKey) {
              const newOrder = node.children ? node.children.length + 1 : 1;
              return {
                ...node,
                children: [...(node.children || []), { ...newNode, order: newOrder }]
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

  return (
    <div className={style.container}>
      <Form form={form}>
        <div className={style.extraContent}>
          <Tooltip title="Back to List">
            <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.PROCESS.PROCESS_LIST)} />
          </Tooltip>
        </div>
        <Divider className={style.divider} />
        <Flex className={style.contentSectionTitleLeft}>
          <p className={style.title}>{processDetail?.processName}</p>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>

          {isEditing ? (
            <>
            </>

          ) : (
            <div className={style.addButton}>
              <Tooltip title="Edit">
                <Icons.edit size={20} onClick={() => setIsEditing(true)} />
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
            {processDetail?.createDate}
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
              label="Growth Stage"
              name={processFormFields.growthStageId}
              rules={RulesManager.getGrowthStageRules()}
              isEditing={isEditing}
              options={growthStageOptions}
              type="select"
            />
          </Flex>
        </Flex>
        <Divider className={style.divider} />
        <Section
          title="Plan List"
          subtitle="All plans of this process is displayed here."
          actionButton={isEditing ? <CustomButton label="Add Plan" icon={<Icons.plus />} handleOnClick={handleOpenModal} /> : null}
        >
          {plans.length ? (
            <PlanList
              plans={plans}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
              isEditing={isEditing} />
          ) : (
            <div className={style.noDataContainer}>
              <img src={Images.empty} alt="No Data" className={style.noDataImage} />
              <p className={style.noDataText}>No plans available!.</p>
            </div>
          )}

        </Section>
        <Divider className={style.divider} />
        <Section
          title="Sub Process"
          subtitle="All sub-processes of this process is displayed here."
          actionButton={isEditing ? <CustomButton label="Add Sub Process" icon={<Icons.plus />} handleOnClick={() => handleAdd("root")} /> : null}
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
            // disabled
            />
          )}

        </Section>
        {isEditing ? (
          <div className={style.buttonGroup}>
            <CustomButton
              label="Cancel"
              isCancel
              handleOnClick={() => setIsEditing(false)} />
            <CustomButton
              label="Save"
              isCancel={false}
              isModal={true}
              handleOnClick={() => handleSaveProcess()} />
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
              const newPlan = { planId: Date.now(), planName: values.planName, planDetail: values.planDetail, growthStageId: values.growthStageId, masterTypeId: values.masterTypeId, planNote: values.planNote };
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
          initialValues={editingNode ? { processName: editingNode.title, growthStageId: editingNode.growthStageId, masterTypeId: editingNode.masterTypeId } : undefined}
        />
        <ToastContainer />
      </Form>
    </div>
  );
}

export default ProcessDetails;



