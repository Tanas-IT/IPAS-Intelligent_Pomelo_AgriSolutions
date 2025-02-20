import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./ProcessDetails.module.scss";
import { Button, Divider, Flex, Tag, Tree, TreeDataNode, TreeProps } from "antd";
import { Icons } from "@/assets";
import { CustomButton, Tooltip } from "@/components";
import { PATHS } from "@/routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { processService } from "@/services";
import EditableTreeNode from "./EditableTreeNode";
import ButtonActions from "./ButtonActions";
import { GetProcessDetail } from "@/payloads/process";
import AddPlanModal from "../ProcessList/AddPlanModal";

interface SubProcess {
  subProcessId: number;
  subProcessName: string;
  parentSubProcessId?: number;
  listSubProcessData?: SubProcess[];
}

type OptionType<T = string | number> = {
  value: T;
  label: string
};

type PlanType = {
  planId: number;
  planName: string;
  planDetail: string;
  growthStageId: string;
  masterTypeId: string
};

interface CustomTreeDataNode extends TreeDataNode {
  status?: string;
  order?: number;
  plans?: PlanType[];
}

const mapSubProcessesToTree = (subProcesses: SubProcess[], parentId?: number): CustomTreeDataNode[] => {
  return subProcesses
    .filter(sp => sp.parentSubProcessId === parentId)
    .map(sp => ({
      title: sp.subProcessName,
      key: sp.subProcessId.toString(),
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
  const [growthStageOptions, setGrowthStageOptions] = useState<OptionType<number | string>[]>([]);
  const [processTypeOptions, setProcessTypeOptions] = useState<OptionType<number | string>[]>([]);
  const [newTasks, setNewTasks] = useState<CustomTreeDataNode[]>([]); // để lưu task mới tạo


  useEffect(() => {
    if (!id) {
      console.error("Missing id");
      return;
    }

    const fetchProcessDetails = async () => {
      try {
        const data = await processService.getProcessDetail(id);
        setProcessDetail(data);
        console.log("data", data);

        setTreeData(mapSubProcessesToTree(data.subProcesses));
      } catch (error) {
        console.error("Failed to fetch process details", error);
      }
    };

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

    setTreeData(updateTree(treeData));
  };


  const handleEdit = (key: string) => {
    setEditingKey(key);
    const node = findNodeByKey(treeData, key);

    if (node && typeof node.title === "string") {
      setNewTitle(node.title);

      if (node.status !== "editing") {
        node.status = "editing";
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
      setDeletedNodes(prev => [...prev, { ...deletedNode, status: "deleted" }]);
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
          plans: node.plans ? [...node.plans, newPlan] : [newPlan], // Thêm plan mới vào danh sách
        };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateTreeWithPlan(node.children, subProcessKey, newPlan) }; // Cập nhật cây con
      }
      return node;
    });
  };


  const handleAddPlan = (subProcessKey: number, newPlan: PlanType) => {
    console.log("Adding plan:", newPlan);
    console.log("subProcessKey", subProcessKey);


    const updateTree = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes.map(node => {
        if (Number(node.key) === Number(subProcessKey)) {
          return {
            ...node,
            plans: node.plans ? [...node.plans, newPlan] : [newPlan], // Thêm plan mới
          };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateTree(node.children) }; // Đệ quy cập nhật children
        }
        return node;
      });
    };

    // setTreeData(prevTree => {
    //   const newTree = updateTree([...prevTree]); // Cập nhật cây
    //   console.log("Updated tree:", newTree); // Kiểm tra kết quả
    //   return newTree;
    // });
    setTreeData(prevTree => {
      let updatedTree = [...prevTree];

      // Kiểm tra nếu subProcessKey không có trong treeData
      const foundTask = newTasks.find(task => Number(task.key) === Number(subProcessKey));

      if (foundTask) {
        updatedTree = addTaskToTree(updatedTree, foundTask); // Thêm task mới vào treeData
        setNewTasks(newTasks.filter(task => Number(task.key) !== Number(subProcessKey))); // Xóa khỏi danh sách tạm
      }

      return updateTreeWithPlan(updatedTree, subProcessKey, newPlan);
    });

    // setTimeout(() => setIsAddPlanModalOpen(true), 0);
  };

  console.log(treeData);


  const convertTreeToList = (nodes: CustomTreeDataNode[], parentId: number = 0): any[] => {
    console.log("nodesss", nodes);

    return nodes.flatMap((node, index) => {
      const subProcessId = Number(node.key);
      const subProcess = {
        SubProcessId: subProcessId,
        SubProcessName: node.title || "New Task",
        ParentSubProcessId: parentId,
        IsDefault: true,
        IsActive: true,
        MasterTypeId: 0,
        Status: node.status || "no_change",
        Order: node.order || index + 1,
      };

      return [subProcess, ...convertTreeToList(node.children || [], subProcessId)];
    });
  };


  const handleSaveProcess = () => {
    const payload = {
      processId: id || 0,
      processName: processDetail?.processName || "New Process",
      isActive: processDetail?.isActive ?? true,
      isDefault: processDetail?.isDefault ?? false,
      isDeleted: processDetail?.isDeleted ?? false,
      ListUpdateSubProcess: convertTreeToList(treeData),
      ListDeletedSubProcess: convertDeletedNodesToList(deletedNodes),
    };

    console.log("Saving Payload:", payload);
    // processService.updateProcess(payload);
  }

  const convertDeletedNodesToList = (nodes: CustomTreeDataNode[]): any[] => {
    return nodes.map(node => ({
      SubProcessId: Number(node.key),
      SubProcessName: node.title || "New Task",
      ParentSubProcessId: 0,
      IsDefault: true,
      IsActive: false,
      ProcessStyleId: 0,
      Status: node.status || "deleted",
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

  const handleEditPlan = useCallback((plan: PlanType) => {
    console.log("Chỉnh sửa kế hoạch", plan);
  }, []);

  /**
   * Xóa kế hoạch
   */
  const handleDeletePlan = useCallback((planId: number) => {
    console.log("Xóa kế hoạch với ID:", planId);
  }, []);

  const loopNodes = (nodes: any[]): CustomTreeDataNode[] => {
    return nodes.map((node) => {
      // Nếu có plans, tạo một node chứa danh sách kế hoạch
      const planNodes = node.plans?.length
        ? [{
          title: (
            <div style={{ marginLeft: "20px", padding: "5px", border: "1px solid #ddd", borderRadius: "5px" }}>
              <strong>Plan List:</strong>
              {node.plans.map((plan: PlanType) => (
                <div key={plan.planId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
                  <span>{plan.planName}</span>
                  <div>
                    <Icons.edit color="blue" size={20} onClick={() => handleEditPlan(plan)} />
                    <Icons.delete color="red" size={20} onClick={() => handleDeletePlan(plan.planId)} />
                  </div>
                </div>
              ))}
            </div>
          ),
          key: `${node.key}-plans`, // Key riêng để không trùng lặp
          isLeaf: true, // Đánh dấu là node lá để tránh lỗi tree recursive
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
                onEdit={() => handleEdit(node.key)}
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

    console.log("Updated Tree:", updatedData);

    setTreeData([...updatedData]);
  };

  return (
    <div className={style.container}>
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
        <Tag className={`${style.statusTag} ${style.normal}`}>Pending</Tag>
        <div className={style.addButton}>
          <CustomButton label="Add Sub Process" icon={<Icons.plus />} handleOnClick={() => handleAdd("root")} />
        </div>
      </Flex>
      <label className={style.subTitle}>Code: {processDetail?.processCode}</label>
      <Divider className={style.divider} />
      <Tree
        style={{ fontSize: "18px" }}
        draggable
        blockNode
        onDrop={onDrop}
        treeData={loopNodes(treeData)}
      />
      <div className={style.buttonGroup}>
        <Button>Cancel</Button>
        <CustomButton
          label="Save"
          isCancel={false}
          isModal={true}
          handleOnClick={() => handleSaveProcess()} />
      </div>
      {isAddPlanModalOpen && (
        <AddPlanModal
          isOpen={isAddPlanModalOpen}
          subProcessId={selectedSubProcessId}
          onClose={() => setIsAddPlanModalOpen(false)}
          onSave={(values) => {
            const newPlan = { planId: Date.now(), planName: values.planName, planDetail: values.planDetail, growthStageId: values.growthStageId, masterTypeId: values.masterTypeId };
            handleAddPlan(selectedSubProcessId!, newPlan);
            setIsAddPlanModalOpen(false);
          }}
          growthStageOptions={growthStageOptions}
          processTypeOptions={processTypeOptions}
        />

      )}
      <ToastContainer />
    </div>
  );
}

export default ProcessDetails;



