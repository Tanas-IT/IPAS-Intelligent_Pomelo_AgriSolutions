import { useEffect, useState } from "react";
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

interface SubProcess {
  subProcessId: number;
  subProcessName: string;
  parentSubProcessId?: number;
  listSubProcessData?: SubProcess[];
}

interface CustomTreeDataNode extends TreeDataNode {
  status?: string;  // Thêm thuộc tính 'status' vào CustomTreeDataNode
  order?: number;
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
  console.log("tree data", treeData);


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
          const newOrder = node.children ? node.children.length + 1 : 1; // Kiểm tra xem có children hay không để xác định order
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
  
      // Cập nhật trạng thái của node khi đang chỉnh sửa
      if (node.status !== "editing") {
        node.status = "editing"; // Đánh dấu là đang chỉnh sửa
        setTreeData([...treeData]); // Cập nhật lại treeData với trạng thái mới
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
  
    // Kiểm tra xem có node nào cần xóa không
    const deletedNode = findNodeByKey(treeData, key);
    if (deletedNode) {
      // Lưu task bị xóa vào deletedNodes
      setDeletedNodes(prev => [...prev, { ...deletedNode, status: "deleted" }]);
    }
  
    // Cập nhật lại dữ liệu cây
    const updatedTreeData = deleteNode(treeData);
  
    // Cập nhật lại thứ tự các node còn lại
    const reorderNodes = (nodes: CustomTreeDataNode[]): CustomTreeDataNode[] => {
      return nodes.map((node, index) => ({
        ...node,
        order: index + 1,  // Cập nhật thứ tự sau khi xóa
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

  const convertTreeToList = (nodes: CustomTreeDataNode[], parentId: number = 0): any[] => {
    return nodes.flatMap((node, index) => {
      const subProcessId = Number(node.key); // Chuyển key thành số
      const subProcess = {
        SubProcessName: node.title || "New Task",
        ParentSubProcessId: parentId, // Gán ID cha
        IsDefault: true, // Giữ mặc định
        IsActive: true,  // Giữ mặc định
        ProcessStyleId: 0, // Nếu có style, cập nhật
        Status: node.status || "no_change", // Trạng thái (thêm, sửa, xóa)
        Order: node.order || index + 1,  // Gửi thứ tự
      };
  
      return [subProcess, ...convertTreeToList(node.children || [], subProcessId)];
    });
  };
  

  const handleSaveProcess = () => {
    const payload = {
      processId: id || 0, // Lấy ID nếu có, nếu không để 0
      processName: processDetail?.processName || "New Process",
      isActive: processDetail?.isActive ?? true,
      isDefault: processDetail?.isDefault ?? false,
      isDeleted: processDetail?.isDeleted ?? false,
      ListUpdateSubProcess: convertTreeToList(treeData),
      ListDeletedSubProcess: convertDeletedNodesToList(deletedNodes), // Thêm task đã xóa
    };
  
    console.log("Saving Payload:", payload);
    // Gọi API gửi payload về backend
    // processService.updateProcess(payload);
  }

  const convertDeletedNodesToList = (nodes: CustomTreeDataNode[]): any[] => {
    return nodes.map(node => ({
      SubProcessName: node.title || "New Task",
      ParentSubProcessId: 0,  // Gán giá trị mặc định hoặc lấy từ dữ liệu gốc
      IsDefault: true,
      IsActive: false, // Thường là false khi đã xóa
      ProcessStyleId: 0,
      Status: node.status || "deleted", // Đảm bảo trạng thái là 'deleted'
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

  const loopNodes = (nodes: any[]): CustomTreeDataNode[] => {

    return nodes.map((node) => ({
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
            />
          )}
        </div>
      ),
      key: node.key,
      children: node.children ? loopNodes(node.children) : undefined,
    }));
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
      {/* <div className={style.contentSectionTitleLeft}>
        <p className={style.title}>Caring Process</p>
        <div className={style.addButton}>
          <CustomButton label="Add Sub Process" icon={<Icons.plus />} handleOnClick={() => handleAdd("root")} />
        </div>
      </div> */}
      <Flex className={style.contentSectionTitleLeft}>
        <p className={style.title}>Caring Process</p>
        <Tooltip title="Hello">
          <Icons.tag className={style.iconTag} />
        </Tooltip>
        <Tag className={`${style.statusTag} ${style.normal}`}>Pending</Tag>
        <div className={style.addButton}>
          <CustomButton label="Add Sub Process" icon={<Icons.plus />} handleOnClick={() => handleAdd("root")} />
        </div>
      </Flex>
      <label className={style.subTitle}>Code: laggg</label>
      <Divider className={style.divider} />
      <Tree
        draggable
        blockNode
        onDrop={onDrop}
        treeData={loopNodes(treeData)}
      />
      <div className={style.buttonGroup}>
        <Button>Cancel</Button>
        {/* <Button className={style.confirmButton}>Save</Button> */}
        <CustomButton label="Save" isCancel={false} isModal={true} handleOnClick={() => handleSaveProcess()} />
      </div>
      <ToastContainer />
    </div>
  );
}

export default ProcessDetails;



